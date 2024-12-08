
export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    intentSignature: {
        primaryDomains: string[];
        secondaryContexts: string[];
        complexityLevel: number;
        requiredCapabilities: string[];
    };
    triggerKeywords: string[];
    semanticVector?: number[];
}
