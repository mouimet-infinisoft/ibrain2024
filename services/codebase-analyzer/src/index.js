"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodebaseAnalyzer = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const logger = console;
class CodebaseAnalyzer {
    constructor(projectRoot) {
        this.ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build'];
        this.projectRoot = projectRoot;
    }
    analyze() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.info('Starting codebase analysis...');
                const rootNode = yield this.scanDirectory(this.projectRoot);
                const result = {
                    structure: this.buildProjectStructure(rootNode),
                    dependencies: this.analyzeDependencies(rootNode),
                    patterns: this.detectPatterns(rootNode),
                    metrics: this.calculateMetrics(rootNode)
                };
                logger.info('Analysis complete');
                return result;
            }
            catch (error) {
                logger.error('Analysis failed:', error);
                throw error;
            }
        });
    }
    scanDirectory(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const entries = yield (0, promises_1.readdir)(dirPath, { withFileTypes: true });
            const children = [];
            for (const entry of entries) {
                const fullPath = (0, path_1.join)(dirPath, entry.name);
                if (this.ignoreDirs.includes(entry.name))
                    continue;
                if (entry.isDirectory()) {
                    children.push(yield this.scanDirectory(fullPath));
                }
                else if (this.isRelevantFile(entry.name)) {
                    children.push(yield this.analyzeFile(fullPath));
                }
            }
            return {
                path: dirPath,
                type: 'directory',
                children
            };
        });
    }
    analyzeFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield (0, promises_1.readFile)(filePath, 'utf-8');
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
        });
    }
    isRelevantFile(fileName) {
        const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx'];
        return relevantExtensions.includes((0, path_1.extname)(fileName));
    }
    isTaskRelated(content) {
        return content.includes('TaskManager') ||
            content.includes('useTask') ||
            content.includes('task-');
    }
    hasTests(filePath) {
        return filePath.includes('.test.') || filePath.includes('.spec.');
    }
    calculateComplexity(content) {
        // Basic complexity calculation
        const conditions = (content.match(/if|else|switch|case|while|for|catch/g) || []).length;
        const functions = (content.match(/function|=>/g) || []).length;
        return conditions + functions;
    }
    buildProjectStructure(rootNode) {
        // Implementation specific to your project structure
        return {
            features: {},
            services: [],
            libs: []
        };
    }
    analyzeDependencies(rootNode) {
        const dependencies = new Map();
        // Implement dependency analysis
        return dependencies;
    }
    detectPatterns(rootNode) {
        return [];
    }
    calculateMetrics(rootNode) {
        return {
            totalFiles: 0,
            testCoverage: 0,
            complexityScore: 0
        };
    }
}
exports.CodebaseAnalyzer = CodebaseAnalyzer;
