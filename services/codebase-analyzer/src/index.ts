import { readdir, readFile } from 'fs/promises';
import { join, extname, relative } from 'path';
import { CodebaseNode, AnalyzerResult, ProjectStructure } from './types';
import * as parser from '@typescript-eslint/parser';
import { AST_NODE_TYPES } from '@typescript-eslint/types';

const logger = console;

export class CodebaseAnalyzer {
  private projectRoot: string;
  private ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build'];
  private totalFiles = 0;
  private filesWithTests = 0;
  private totalComplexity = 0;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async analyze(): Promise<AnalyzerResult> {
    try {
      logger.info('Starting codebase analysis...');
      const rootNode = await this.scanDirectory(this.projectRoot);
      
      const result: AnalyzerResult = {
        structure: this.buildProjectStructure(rootNode),
        dependencies: this.analyzeDependencies(rootNode),
        patterns: this.detectPatterns(rootNode),
        metrics: this.calculateMetrics(rootNode)
      };

      logger.info('Analysis complete');
      return result;
    } catch (error) {
      logger.error('Analysis failed:', error);
      throw error;
    }
  }

  private async scanDirectory(dirPath: string): Promise<CodebaseNode> {
    try {
      logger.debug('Scanning directory:', dirPath);
      const entries = await readdir(dirPath, { withFileTypes: true });
      const children: CodebaseNode[] = [];
      const relativePath = relative(this.projectRoot, dirPath);
  
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        if (this.ignoreDirs.includes(entry.name)) {
          logger.debug('Skipping ignored directory:', entry.name);
          continue;
        }
  
        if (entry.isDirectory()) {
          const dirNode = await this.scanDirectory(fullPath);
          children.push(dirNode);
        } else if (this.isRelevantFile(entry.name)) {
          logger.debug('Processing file:', entry.name);
          this.totalFiles++;
          children.push(await this.analyzeFile(fullPath, relative(this.projectRoot, fullPath)));
        }
      }
  
      return {
        path: relativePath || '.',
        type: 'directory',
        children
      };
    } catch (error) {
      logger.error(`Error scanning directory ${dirPath}:`, error);
      throw error;
    }
  }
  private async analyzeFile(filePath: string, relativePath: string): Promise<CodebaseNode> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const hasTests = this.hasTests(filePath);
      if (hasTests) this.filesWithTests++;
  
      const complexity = this.calculateComplexity(content);
      this.totalComplexity += complexity;
  
      let imports: string[] = [];
      let exports: string[] = [];
  
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        imports = this.extractImports(content);
        exports = this.extractExports(content);
      }
  
      return {
        path: relativePath,
        type: 'file',
        content,
        imports,
        exports,
        metadata: {
          taskRelated: this.isTaskRelated(content),
          hasTests,
          complexity
        }
      };
    } catch (error) {
      logger.error(`Error analyzing file ${filePath}:`, error);
      return {
        path: relativePath,
        type: 'file',
        content: '',
        imports: [],
        exports: [],
        metadata: {
          taskRelated: false,
          hasTests: false,
          complexity: 0
        }
      };
    }
  }
  private extractImports(content: string): string[] {
    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        ecmaVersion: 2020,
        ecmaFeatures: { jsx: true }
      });
  
      const imports: string[] = [];
      this.traverseAst(ast, (node: any) => {
        if (node.type === 'ImportDeclaration') {
          imports.push(node.source.value);
        }
      });
  
      return imports;
    } catch (error) {
      logger.warn('Failed to parse imports:', error);
      return [];
    }
  }

  private extractExports(content: string): string[] {
    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      });

      const exports: string[] = [];
      this.traverseAst(ast, (node: any) => {
        if (node.type === AST_NODE_TYPES.ExportNamedDeclaration ||
          node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
          if (node.declaration && node.declaration.id) {
            exports.push(node.declaration.id.name);
          }
        }
      });

      return exports;
    } catch (error) {
      logger.warn('Failed to parse exports:', error);
      return [];
    }
  }

  private traverseAst(node: any, visitor: (node: any) => void) {
    visitor(node);
    for (const key in node) {
      const child = node[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          child.forEach(item => {
            if (item && typeof item === 'object') {
              this.traverseAst(item, visitor);
            }
          });
        } else {
          this.traverseAst(child, visitor);
        }
      }
    }
  }

  private isRelevantFile(fileName: string): boolean {
    const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    return relevantExtensions.includes(extname(fileName));
  }

  private isTaskRelated(content: string): boolean {
    const taskPatterns = [
      'TaskManager',
      'useTask',
      'task-',
      'createTask',
      'processTask',
      'TaskQueue',
      'TaskWorker'
    ];
    return taskPatterns.some(pattern => content.includes(pattern));
  }

  private hasTests(filePath: string): boolean {
    return filePath.includes('.test.') ||
      filePath.includes('.spec.') ||
      filePath.includes('__tests__');
  }

  private calculateComplexity(content: string): number {
    const patterns = {
      conditions: /if|else|switch|case|while|for|catch/g,
      functions: /function|=>/g,
      complexity: /\|\||&&|\?|:/g,
      classes: /class\s+\w+/g,
      depth: /{\s*$/gm
    };

    const matches = Object.entries(patterns).reduce((acc, [key, pattern]) => {
      acc[key] = (content.match(pattern) || []).length;
      return acc;
    }, {} as Record<string, number>);

    return matches.conditions +
      matches.functions +
      matches.complexity * 0.5 +
      matches.classes * 2 +
      matches.depth * 0.1;
  }

  private buildProjectStructure(rootNode: CodebaseNode): ProjectStructure {
    const structure: ProjectStructure = {
      features: {},
      services: [],
      libs: []
    };

    const processNode = (node: CodebaseNode, currentPath: string[] = []) => {
      if (node.type === 'directory') {
        const dirName = node.path.split('/').pop() || '';

        if (dirName === 'features') {
          node.children?.forEach(child => {
            if (child.type === 'directory') {
              structure.features[child.path] = {
                components: [],
                hooks: [],
                utils: [],
                types: []
              };
            }
          });
        } else if (dirName === 'services') {
          structure.services = node.children?.map(child => child.path) || [];
        } else if (dirName === 'lib') {
          structure.libs = node.children?.map(child => child.path) || [];
        }

        node.children?.forEach(child => processNode(child, [...currentPath, dirName]));
      } else if (node.type === 'file') {
        const featureMatch = node.path.match(/features\/([^/]+)/);
        if (featureMatch) {
          const feature = featureMatch[1];
          if (structure.features[feature]) {
            if (node.path.includes('/components/')) {
              structure.features[feature].components.push(node.path);
            } else if (node.path.includes('/hooks/')) {
              structure.features[feature].hooks.push(node.path);
            } else if (node.path.includes('/utils/')) {
              structure.features[feature].utils.push(node.path);
            } else if (node.path.includes('/types/')) {
              structure.features[feature].types.push(node.path);
            }
          }
        }
      }
    };

    processNode(rootNode);
    return structure;
  }

  private analyzeDependencies(rootNode: CodebaseNode): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();

    const processNode = (node: CodebaseNode) => {
      if (node.type === 'file' && node.imports) {
        dependencies.set(node.path, node.imports);
      }
      node.children?.forEach(processNode);
    };

    processNode(rootNode);
    return dependencies;
  }

  private detectPatterns(rootNode: CodebaseNode): { type: string; locations: string[]; }[] {
    const patterns = [
      { type: 'Singleton', regex: /export\s+const\s+\w+\s*=\s*\(\s*\)\s*=>\s*{\s*static\s+instance/g },
      { type: 'Factory', regex: /create\w+Factory/g },
      { type: 'Repository', regex: /Repository$/g },
      { type: 'Service', regex: /Service$/g },
      { type: 'Hook', regex: /^use[A-Z]/g },
      { type: 'Context', regex: /Context$/g },
      { type: 'HOC', regex: /with[A-Z]/g },
      { type: 'Controller', regex: /Controller$/g },
      { type: 'Store', regex: /(Store|Reducer|Slice)$/g }
    ];

    const results: { type: string; locations: string[]; }[] = patterns.map(pattern => ({
      type: pattern.type,
      locations: []
    }));

    const processNode = (node: CodebaseNode) => {
      if (node.type === 'file' && node.content) {
        patterns.forEach((pattern, index) => {
          if (pattern.regex.test(node.content!)) {
            results[index].locations.push(node.path);
          }
        });
      }
      node.children?.forEach(processNode);
    };

    processNode(rootNode);
    return results.filter(result => result.locations.length > 0);
  }

  private calculateMetrics(rootNode: CodebaseNode) {
    return {
      totalFiles: this.totalFiles,
      testCoverage: this.filesWithTests / this.totalFiles * 100,
      complexityScore: this.totalComplexity / this.totalFiles
    };
  }
}
