import { Command } from 'commander';
import { CodebaseAnalyzer } from './index';
import { join, resolve } from 'path';
import { existsSync } from 'fs';

const logger = console;

export const analyzeCommand = new Command('analyze')
  .description('Analyze the codebase structure and dependencies')
  .option('-p, --path <path>', 'Path to analyze', '/home/nitr0gen/ibrain2024/ibrain2024/services/task-manager/src')
  .action(async (options) => {
    try {
      const targetPath = resolve(options.path);
      
      if (!existsSync(targetPath)) {
        logger.error('Path does not exist:', targetPath);
        process.exit(1);
      }
      
      logger.info('Analyzing path:', targetPath);
      const analyzer = new CodebaseAnalyzer(targetPath);
      const result = await analyzer.analyze();
      
      logger.info('Analysis Results:', {
        totalFiles: result.metrics.totalFiles,
        patterns: result.patterns.length,
        features: Object.keys(result.structure.features).length,
        testCoverage: `${result.metrics.testCoverage.toFixed(2)}%`,
        complexityScore: result.metrics.complexityScore.toFixed(2)
      });
      
      const outputFile = join(process.cwd(), 'codebase-analysis.json');
      require('fs').writeFileSync(
        outputFile,
        JSON.stringify(result, null, 2)
      );
      
      logger.info('Full analysis saved to:', outputFile);
    } catch (error) {
      logger.error('Analysis failed:', error);
      process.exit(1);
    }
  });

if (require.main === module) {
  analyzeCommand.parse(process.argv);
}