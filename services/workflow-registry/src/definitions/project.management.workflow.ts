import {WorkflowRegistryService} from "..";


export const projectManagementWorkflow = WorkflowRegistryService.createWorkflow(
    {
        id: "project_management",
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
    },
);
