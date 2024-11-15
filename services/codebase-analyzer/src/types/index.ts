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
