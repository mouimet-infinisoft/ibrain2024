import { getInstance } from "@brainstack/inject";
import { IntentMatchingEngine } from "../engine/intent.matching.engine";
import { workflowDefinitions } from "../../../workflow-registry/src/definitions";
import { WorkflowRegistryService } from "../../../workflow-registry/src";
import { LoggerService } from "../../../logger/logger.service";
import { AiService } from "../../../ai/ai.service";
import { IntentMatchingService } from "..";

// Demonstration

async function demonstrateIntentMatching() {
    const workflowService = getInstance(WorkflowRegistryService);

    // Register workflows
    const d = await Promise.all(
        workflowDefinitions.map((workflow) =>
            workflowService.registerWorkflow(workflow)
        ),
    );

    const intentEngine = new IntentMatchingService(
        getInstance(AiService),
        getInstance(LoggerService),
        workflowService,
    );

    // Test different user inputs
    const testInputs = [
        "How are you today?",
        "Mu name is martin nice to meet you.",
        "I need to create a project timeline",
        "Can you help me with a technical issue?",
        "I want to plan my software development roadmap",
        "My computer keeps crashing, can you help?", // Technical Support
        "I need help troubleshooting my network connection.", // Technical Support
        "We need to refactor our legacy system.", // Legacy Code Refactoring
        "How can we modernize our old codebase?", // Legacy Code Refactoring
        // "Our technical debt is becoming a problem.  We need to address it.", // Legacy Code Refactoring
        // "Let's develop a new feature for user authentication.", // Feature Development
        // "I want to implement a new user interface.", // Feature Development
        // "We need to gather requirements for the next product increment.", // Feature Development
        // "I have a project I need to plan", // Project Management
        // "Let's schedule the milestones for the alpha release.", // Project Management
        // "Can you help me build a roadmap for the next quarter?", // Project Management
        // "This old code is a mess! We need to improve it.", // Legacy Code Refactoring - More informal
        // "The architecture of this application needs an overhaul.", // Legacy Code Refactoring
        // "We need to upgrade our dependencies.", // Legacy Code Refactoring
        // "How do we improve the performance of our system?", // Legacy Code Refactoring
        // "We need to add a shopping cart to our website.", // Feature Development - More specific example
        // "The user experience could be enhanced with better navigation.", // Feature Development
        // "I need help with the requirements gathering process." // Feature Development
    ];

    for (const input of testInputs) {
        const matchedWorkflow = await intentEngine.findMostAppropriateWorkflow(
            input,
            {},
        );

        console.log(`Input: "${input}"`);
        console.log(
            "Matched Workflow:",
            matchedWorkflow?.name || "No matching workflow",
        );
        console.log("---");
    }
}
demonstrateIntentMatching().catch(console.error);
