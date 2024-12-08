import { WorkflowOrchestrator } from ".";
import { IntentMatchingEngine } from "../../intent-engine/src/engine/intent.matching.engine";
import { AiService } from "../../ai/ai.service";
import { LoggerService } from "../../logger/logger.service";
import { workflowDefinitions } from "../../intent-engine/src/examples/workflows.definitions";
import { getInstance } from "@brainstack/inject";
import dotenv from "dotenv";

dotenv.config();


// Enhanced Workflow Step Definition
interface WorkflowStep {
    id: string;
    type:
        | "preparation"
        | "assessment"
        | "planning"
        | "execution"
        | "validation"
        | "completion";
    description: string;
    handler: (context: any) => Promise<{
        success: boolean;
        output?: any;
        nextStep?: number;
        suggestedResponse?: string;
    }>;
}

// Extended Workflow Definition
interface EnhancedWorkflowDefinition {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    triggerKeywords: string[];
    intentSignature: {
        primaryDomains: string[];
        secondaryContexts: string[];
        complexityLevel: number;
        requiredCapabilities: string[];
    };
}

// Project Management Workflow with Detailed Steps
function createProjectManagementWorkflow(): EnhancedWorkflowDefinition {
    return {
        ...workflowDefinitions.find((w) => w.id === "project_management")!,
        triggerKeywords: [
            "project management",
            "project planning",
            "project timeline",
            "resource allocation",
            "project initiation",
        ],
        steps: [
            {
                id: "initial_project_assessment",
                type: "assessment",
                description:
                    "Conduct initial project scope and requirements gathering",
                handler: async (context) => {
                    // Simulate project assessment logic
                    const projectContext = context.userInput || {};

                    // Use AI to help assess project details
                    const assessmentCompletion = await getInstance(AiService)
                        .generateObject(
                            [
                                {
                                    role: "system",
                                    content:
                                        "Perform a comprehensive project assessment based on user input.",
                                },
                                {
                                    role: "user",
                                    content: JSON.stringify(projectContext),
                                },
                            ],
                            {
                                type: "object",
                                properties: {
                                    projectScope: { type: "string" },
                                    estimatedComplexity: { type: "number" },
                                    keyObjectives: {
                                        type: "array",
                                        items: { type: "string" },
                                    },
                                },
                            },
                        );

                    return {
                        success: true,
                        output: assessmentCompletion,
                        suggestedResponse:
                            "I've conducted an initial assessment of your project. Would you like to discuss the key objectives and scope in more detail?",
                        nextStep: 1,
                    };
                },
            },
            {
                id: "project_planning",
                type: "planning",
                description: "Develop comprehensive project plan and timeline",
                handler: async (context) => {
                    // Generate project milestones and timeline
                    const projectMilestones = [
                        {
                            name: "Project Kickoff",
                            estimatedDate: new Date(
                                Date.now() + 7 * 24 * 60 * 60 * 1000,
                            ),
                        },
                        {
                            name: "Requirements Finalization",
                            estimatedDate: new Date(
                                Date.now() + 14 * 24 * 60 * 60 * 1000,
                            ),
                        },
                        {
                            name: "Design Phase",
                            estimatedDate: new Date(
                                Date.now() + 30 * 24 * 60 * 60 * 1000,
                            ),
                        },
                        {
                            name: "Implementation",
                            estimatedDate: new Date(
                                Date.now() + 90 * 24 * 60 * 60 * 1000,
                            ),
                        },
                        {
                            name: "Testing",
                            estimatedDate: new Date(
                                Date.now() + 120 * 24 * 60 * 60 * 1000,
                            ),
                        },
                        {
                            name: "Deployment",
                            estimatedDate: new Date(
                                Date.now() + 150 * 24 * 60 * 60 * 1000,
                            ),
                        },
                    ];

                    return {
                        success: true,
                        output: { milestones: projectMilestones },
                        suggestedResponse:
                            "I've created a preliminary project timeline with key milestones. Would you like to review and refine these milestones?",
                        nextStep: 2,
                    };
                },
            },
            {
                id: "resource_allocation",
                type: "preparation",
                description: "Identify and allocate necessary resources",
                handler: async (context) => {
                    // Simulate resource allocation logic
                    const resourceAllocation = {
                        teamMembers: [
                            { role: "Project Manager", allocated: true },
                            { role: "Lead Developer", allocated: false },
                            { role: "UX Designer", allocated: false },
                        ],
                        technologies: [
                            {
                                name: "Project Management Tool",
                                selected: false,
                            },
                            { name: "Version Control System", selected: false },
                        ],
                    };

                    return {
                        success: true,
                        output: resourceAllocation,
                        suggestedResponse:
                            "I've started identifying potential resources for the project. We'll need to confirm team member assignments and select appropriate technologies.",
                        nextStep: 3,
                    };
                },
            },
            {
                id: "project_initiation",
                type: "execution",
                description: "Finalize project initiation and kick-off",
                handler: async (context) => {
                    return {
                        success: true,
                        suggestedResponse:
                            "Project initialization is complete. We're ready to move forward with the next phases of implementation.",
                        nextStep: 4,
                    };
                },
            },
            {
                id: "project_completion",
                type: "completion",
                description: "Final project review and closure",
                handler: async (context) => {
                    return {
                        success: true,
                        suggestedResponse:
                            "Congratulations! The project workflow has been successfully completed.",
                        nextStep: -1, // Indicates workflow completion
                    };
                },
            },
        ],
    };
}

// Demonstrate Workflow Orchestration
async function demonstrateWorkflowOrchestration() {
    // Initialize services
    const logger = getInstance(LoggerService);
    const aiService = getInstance(AiService);
    const intentMatchingEngine = new IntentMatchingEngine(aiService, logger);
    const workflowOrchestrator = new WorkflowOrchestrator(intentMatchingEngine);

    // Register workflows
    const projectManagementWorkflow = createProjectManagementWorkflow();
    await intentMatchingEngine.registerWorkflow(projectManagementWorkflow);

    // Event listeners for workflow lifecycle
    workflowOrchestrator.onWorkflowEvent("workflowInitialized", (workflow) => {
        const w = workflow.workflowDefinition as unknown as EnhancedWorkflowDefinition

        console.log(`Workflow ${workflow.workflowDefinition.name} initialized`);
        w.steps.forEach(async (step, index) => {
            console.log(`Step ${index + 1}: ${step.description}`);
            await step.handler(workflow.context)
        });
    });

    workflowOrchestrator.onWorkflowEvent("workflowCompleted", (workflow) => {
        console.log(
            `Workflow ${workflow.workflowDefinition.name} completed successfully`,
        );
    });

    // Test conversation scenarios
    const conversationScenarios = [
        "I need to start a new software development project",
        "Can you help me create a project timeline?",
        "I want to plan out the milestones for our next quarter",
        "Help me allocate resources for a complex project",
    ];

    for (const scenario of conversationScenarios) {
        console.log(`\n--- Processing Scenario: "${scenario}" ---`);
        const response = await workflowOrchestrator.processMessage(
            "user123",
            scenario,
        );
        console.log("Orchestrator Response:", response);
    }
}

// Run the demonstration
demonstrateWorkflowOrchestration().catch(console.error);

export default demonstrateWorkflowOrchestration;
