import { WorkflowRegistryService } from "..";

export const projectManagementWorkflow = WorkflowRegistryService.createWorkflow(
    {
        name: "Project Management Workflow",
        description: "Comprehensive project planning and tracking",
        intentSignature: {
            primaryDomains: ["Project Management"],
            secondaryContexts: ["project", "planning", "software", "business"],
            requiredCapabilities: [
                "Scheduling",
                "Task Management",
                "timeline_planning",
                "milestone_tracking",
            ],
            complexityLevel: 3,
        },
        triggerKeywords: [
            "project",
            "timeline",
            "milestone",
            "plan",
            "schedule",
            "roadmap",
        ],
        flow: {
            name: "Project Management Workflow",
            queueName: "project-management-workflow",
            data: { type: "initiate", action: "start" },
            children: [
                // Step 1: Gather Project Information
                {
                    name: "gather-project-info",
                    queueName: "project-management-workflow",
                    data: {
                        type: "gather-info",
                        action: "get-project-name",
                        questions: [
                            "What is the name of your project?",
                            "What is the project's description?",
                        ],
                    },
                    children: [
                        // Step 2: Define Project Scope
                        {
                            name: "define-project-scope",
                            queueName: "project-management-workflow",
                            data: {
                                type: "define-scope",
                                action: "get-project-objectives",
                                questions: [
                                    "What are the project's objectives?",
                                    "What are the key deliverables?",
                                ],
                            },
                            children: [
                                // Step 3: Identify Stakeholders
                                {
                                    name: "identify-stakeholders",
                                    queueName: "project-management-workflow",
                                    data: {
                                        type: "identify-stakeholders",
                                        action: "get-stakeholder-list",
                                        questions: [
                                            "Who are the project stakeholders?",
                                            "What are their roles and responsibilities?",
                                        ],
                                    },
                                    children: [
                                        // Step 4: Create Project Schedule
                                        {
                                            name: "create-project-schedule",
                                            queueName: "project-management-workflow",
                                            data: {
                                                type: "create-schedule",
                                                action: "get-project-timeline",
                                                questions: [
                                                    "What is the project's start date?",
                                                    "What is the project's end date?",
                                                ],
                                            },
                                            children: [
                                                // Step 5: Assign Tasks and Resources
                                                {
                                                    name: "assign-tasks-and-resources",
                                                    queueName: "project-management-workflow",
                                                    data: {
                                                        type: "assign-tasks",
                                                        action: "get-task-list",
                                                        questions: [
                                                            "What tasks need to be completed?",
                                                            "What resources are required for each task?",
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    },
);
