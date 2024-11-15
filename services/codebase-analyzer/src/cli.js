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
exports.analyzeCommand = void 0;
const commander_1 = require("commander");
const index_1 = require("./index");
const logger = console;
exports.analyzeCommand = new commander_1.Command('analyze')
    .description('Analyze the codebase structure and dependencies')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const analyzer = new index_1.CodebaseAnalyzer(process.cwd() + '/src');
        const result = yield analyzer.analyze();
        logger.info('Analysis Results:', {
            totalFiles: result.metrics.totalFiles,
            patterns: result.patterns.length,
            features: Object.keys(result.structure.features).length
        });
        // Save results to file
        const fs = require('fs');
        fs.writeFileSync('codebase-analysis.json', JSON.stringify(result, null, 2));
        logger.info('Full analysis saved to codebase-analysis.json');
    }
    catch (error) {
        logger.error('Analysis failed:', error);
        process.exit(1);
    }
}));
