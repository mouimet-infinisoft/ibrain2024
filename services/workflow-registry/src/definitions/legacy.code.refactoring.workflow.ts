import {WorkflowRegistryService} from "..";

export const legacyCodeRefactoringWorkflow  = 
    // Legacy Code Refactoring Workflow
    WorkflowRegistryService.createWorkflow({
        name: "Legacy Code Refactoring Workflow",
        description: "Comprehensive strategy for modernizing and improving existing codebase",
        intentSignature: {
            primaryDomains: [
                "software_engineering",
                "code_quality",
                "modernization",
            ],
            secondaryContexts: [
                "legacy_system",
                "technical_debt",
                "architecture_improvement",
            ],
            requiredCapabilities: [
                "code_analysis",
                "architectural_assessment",
                "incremental_refactoring",
                "dependency_management",
                "regression_testing",
                "performance_optimization",
            ],
            complexityLevel: 4,
        },
        triggerKeywords: [
            "refactor",
            "legacy",
            "modernize",
            "technical debt",
            "improve",
            "restructure",
            "clean code",
            "architecture",
            "upgrade",
        ],
        flow: {
            name:"Legacy Code Refactoring Workflow",
            queueName:"workflows"
        }
    })