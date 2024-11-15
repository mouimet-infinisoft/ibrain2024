#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Adding Codebase Analyzer to existing project...${NC}"

# Add dependencies to existing package.json
npm install --save @babel/parser @typescript-eslint/parser @typescript-eslint/types @typescript-eslint/visitor-keys d3 graphlib
npm install --save-dev @types/d3 @types/graphlib

# Create analyzer directory structure in lib
mkdir -p lib/features/codebase-analyzer/{types,utils}

# Create types
cat > lib/features/codebase-analyzer/types/index.ts << 'EOL'
import { Json } from '@/types';

export interface CodebaseNode {
  path: string;
  type: 'file' | 'directory';
  content?: string;
  imports?: string[];
  exports?: string[];
  children?: CodebaseNode[];
  metadata?: {
    taskRelated?: boolean;
    hasTests?: boolean;
    complexity?: number;
  };
}

export interface ProjectStructure {
  features: {
    [key: string]: {
      components: string[];
      hooks: string[];
      utils: string[];
      types: string[];
    };
  };
  services: string[];
  libs: string[];
}

export interface AnalyzerResult {
  structure: ProjectStructure;
  dependencies: Map<string, string[]>;
  patterns: {
    type: string;
    locations: string[];
  }[];
  metrics: {
    totalFiles: number;
    testCoverage: number;
    complexityScore: number;
  };
}
EOL

# Create main analyzer
cat > lib/features/codebase-analyzer/index.ts << 'EOL'
import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { CodebaseNode, AnalyzerResult } from './types';
import { logger } from '@/utils/logger';

export class CodebaseAnalyzer {
  private projectRoot: string;
  private ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build'];

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
    const entries = await readdir(dirPath, { withFileTypes: true });
    const children: CodebaseNode[] = [];

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (this.ignoreDirs.includes(entry.name)) continue;

      if (entry.isDirectory()) {
        children.push(await this.scanDirectory(fullPath));
      } else if (this.isRelevantFile(entry.name)) {
        children.push(await this.analyzeFile(fullPath));
      }
    }

    return {
      path: dirPath,
      type: 'directory',
      children
    };
  }

  private async analyzeFile(filePath: string): Promise<CodebaseNode> {
    const content = await readFile(filePath, 'utf-8');
    return {
      path: filePath,
      type: 'file',
      content,
      metadata: {
        taskRelated: this.isTaskRelated(content),
        hasTests: this.hasTests(filePath),
        complexity: this.calculateComplexity(content)
      }
    };
  }

  private isRelevantFile(fileName: string): boolean {
    const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    return relevantExtensions.includes(extname(fileName));
  }

  private isTaskRelated(content: string): boolean {
    return content.includes('TaskManager') || 
           content.includes('useTask') || 
           content.includes('task-');
  }

  private hasTests(filePath: string): boolean {
    return filePath.includes('.test.') || filePath.includes('.spec.');
  }

  private calculateComplexity(content: string): number {
    // Basic complexity calculation
    const conditions = (content.match(/if|else|switch|case|while|for|catch/g) || []).length;
    const functions = (content.match(/function|=>/g) || []).length;
    return conditions + functions;
  }

  private buildProjectStructure(rootNode: CodebaseNode): ProjectStructure {
    // Implementation specific to your project structure
    return {
      features: {},
      services: [],
      libs: []
    };
  }

  private analyzeDependencies(rootNode: CodebaseNode): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();
    // Implement dependency analysis
    return dependencies;
  }

  private detectPatterns(rootNode: CodebaseNode): { type: string; locations: string[]; }[] {
    return [];
  }

  private calculateMetrics(rootNode: CodebaseNode) {
    return {
      totalFiles: 0,
      testCoverage: 0,
      complexityScore: 0
    };
  }
}
EOL

# Create CLI command
cat > lib/features/codebase-analyzer/cli.ts << 'EOL'
import { Command } from 'commander';
import { CodebaseAnalyzer } from './index';
import { logger } from '@/utils/logger';

export const analyzeCommand = new Command('analyze')
  .description('Analyze the codebase structure and dependencies')
  .action(async () => {
    try {
      const analyzer = new CodebaseAnalyzer(process.cwd());
      const result = await analyzer.analyze();
      
      logger.info('Analysis Results:', {
        totalFiles: result.metrics.totalFiles,
        patterns: result.patterns.length,
        features: Object.keys(result.structure.features).length
      });
      
      // Save results to file
      const fs = require('fs');
      fs.writeFileSync(
        'codebase-analysis.json', 
        JSON.stringify(result, null, 2)
      );
      
      logger.info('Full analysis saved to codebase-analysis.json');
    } catch (error) {
      logger.error('Analysis failed:', error);
      process.exit(1);
    }
  });
EOL

# Add to existing CLI if present
echo "
// Add to your existing CLI configuration
import { analyzeCommand } from '@/features/codebase-analyzer/cli';
program.addCommand(analyzeCommand);" >> lib/cli/index.ts

# Create README section
cat > docs/codebase-analyzer.md << 'EOL'
# Codebase Analyzer

A tool for analyzing and understanding the project structure, dependencies, and patterns.

## Usage
```bash
npm run cli analyze
```

## Features

- Project structure analysis
- Dependency mapping
- Pattern detection
- Task-related code identification
- Complexity metrics

## Output

The analyzer generates a `codebase-analysis.json` file containing:
- Project structure overview
- Dependency graph
- Detected patterns
- Code metrics

## Integration with Task Manager

The analyzer identifies task-related code and can help understand the relationships between different parts of the task management system.
EOL

echo -e "${GREEN}Codebase Analyzer scaffolding complete!${NC}"
echo -e "Run ${BLUE}npm run cli analyze${NC} to analyze your codebase"
