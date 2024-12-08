import { IProcessor, Processor } from "../processor-loader/ProcessorLoader";
import { TaskFactory } from "../tasks/TaskFactory";
import { BaseMessageProcessor, MessageInputTask } from "./BaseMessageProcessor";
import { ContextService } from "../../../context/src";
import { IntentMatchingService } from "../../../intent-engine/src";
import { workflowDefinitions } from "../../../workflow-registry/src/definitions";
import { getInstance } from "@brainstack/inject";
import { LoggerService } from "../../../logger/logger.service";
import { SupabaseService } from "../../../db/src/db";

@Processor("message", "process-input")
export class MessageInputProcessor extends BaseMessageProcessor
    implements IProcessor {
    constructor(
        private intentMatchingService: IntentMatchingService = getInstance(
            IntentMatchingService,
        ),
    ) {
        super();
    }

    async process(task: MessageInputTask) {
        await this.intentMatchingService.registerWorkflows(workflowDefinitions);
        // 1. Normalize input
        const normalizedInput = this.normalizeInput(task.data.message);

        // 2. Match intent and determine workflow
        const matchedWorkflow = await this.intentMatchingService
            .findMostAppropriateWorkflow(
                normalizedInput,
                task.data.context,
            );

        // 3. Store conversation context
        const contextId = await this.contextService.storeInputContext({
            input: normalizedInput,
            workflow: matchedWorkflow,
            originalContext: task.data.context,
        });

        // 4. Prepare response generation task
        const responseTask = TaskFactory.create<MessageInputTask>(
            "communication",
            "generate-response",
            {
                message: normalizedInput,
                context: {
                    ...task.data.context,
                    workflowId: matchedWorkflow?.id,
                    contextId,
                },
            },
        );

        const job = await this.taskQueueClient.enqueueTask(
            "message",
            responseTask,
        );
        return job;
    }

    private normalizeInput(input: string): string {
        return input.trim().toLowerCase();
    }
}
