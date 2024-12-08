import {WorkflowRegistryService} from "..";


export const technicalSupportWorkflow =

    // Technical Support Workflow
    WorkflowRegistryService.createWorkflow({
        name: "Technical Support Workflow",
        description: "Troubleshooting and technical problem resolution",
        intentSignature: {
            primaryDomains: ["support", "troubleshooting"],
            secondaryContexts: ["technical", "it"],
            requiredCapabilities: ["diagnostic", "solution_finding"],
            complexityLevel: 4,
        },
        triggerKeywords: [
            "help",
            "problem",
            "issue",
            "error",
            "fix",
            "troubleshoot",
        ],
        flow: {
            name:"Technical Support Workflow",
            queueName:"workflows"
        }
        
    });
