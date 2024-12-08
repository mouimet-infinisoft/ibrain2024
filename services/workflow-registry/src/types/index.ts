
// export interface WorkflowDefinition {
//     id: string;
//     name: string;
//     description: string;
//     intentSignature: {
//         primaryDomains: string[];
//         secondaryContexts: string[];
//         complexityLevel: number;
//         requiredCapabilities: string[];
//     };
//     triggerKeywords: string[];
//     semanticVector?: number[];
// }


import {  FlowJob } from "bullmq";

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
    flow: FlowJob;
    start:  (context: any) => Promise<string> 
}
