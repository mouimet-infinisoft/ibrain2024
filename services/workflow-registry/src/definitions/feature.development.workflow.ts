import {WorkflowRegistryService} from "..";

export const featureDevelopmentWorkflow =    // Feature Development Workflow
    WorkflowRegistryService.createWorkflow({
        name: "Feature Development and Integration Workflow",
        description: "End-to-end process for designing, implementing, and integrating new software features",
        intentSignature: {
            primaryDomains: [
                "product_development",
                "software_engineering",
                "innovation",
            ],
            secondaryContexts: [
                "feature_design",
                "user_experience",
                "system_enhancement",
            ],
            requiredCapabilities: [
                "requirements_gathering",
                "user_story_mapping",
                "architectural_design",
                "implementation_planning",
                "prototype_development",
                "integration_testing",
                "user_feedback_incorporation",
            ],
            complexityLevel: 4,
        },
        triggerKeywords: [
            "new feature",
            "develop",
            "implement",
            "enhance",
            "add functionality",
            "innovation",
            "product improvement",
            "user story",
            "requirements",
        ],
        flow: {
            name: "Feature Development and Integration Workflow",
            queueName: "workflows",
            data:{type:'dddd', action:"dddd"},
            children: [
                {
                    name: "dddd",
                    queueName: "dddd",
                    opts:{
                        
                    }
                }
            ]
        },
    })

