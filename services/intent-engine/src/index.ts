import { getInstance, Service } from "@brainstack/inject";
import { IntentMatchingEngine } from "./engine/intent.matching.engine";
import { WorkflowRegistryService } from "../../workflow-registry/src";
import { LoggerService } from "../../logger/logger.service";
import { AiService } from "../../ai/ai.service";

@Service
export class IntentMatchingService {
    private intentEngine: IntentMatchingEngine;

    constructor(
        private aiService: AiService=getInstance(AiService),
        private loggerService: LoggerService=getInstance(LoggerService),
        private workflowRegistryService: WorkflowRegistryService=getInstance(WorkflowRegistryService),
    ) {
        this.intentEngine = new IntentMatchingEngine(
            this.aiService,
            this.loggerService,
            this.workflowRegistryService,
        );
    }

    async findMostAppropriateWorkflow(
        userInput: string,
        context: Record<string, any> = {},
    ) {
        return this.intentEngine.findMostAppropriateWorkflow(userInput, context);
    }
}
