import { getInstance } from "@brainstack/inject";
import { ContextService } from "../../../context/src";
import { ResponseGenerationService } from "../../../response-generation/src";
import { Processor, IProcessor } from "../processor-loader/ProcessorLoader";
import { BaseMessageProcessor, MessageInputTask } from "./BaseMessageProcessor";
import { SocketClient } from "../../../socket/src/socket.client";
import dotenv from "dotenv";
import { timeThursday } from "d3";

dotenv.config();


@Processor("message", "generate-response")
export class MessageResponseProcessor extends BaseMessageProcessor
    implements IProcessor {
    constructor(
        private responseGenerationService: ResponseGenerationService = getInstance(ResponseGenerationService),
        private socketClient: SocketClient = getInstance(SocketClient)
    ) {
        super();
    }

    async process(task: MessageInputTask) {
        // 1. Retrieve context
        const context = await this.contextService.retrieveContext(
            task.data.context?.contextId
        );

        // 2. Generate AI response
        const generatedResponse = await this.responseGenerationService
            .generateResponse({
                input: task.data.message,
                context: context,
            });

        // 3. Store response context
        await this.contextService.storeResponseContext({
            response: generatedResponse,
            contextId: task.data.context?.contextId,
        });

        await this.socketClient.sendCommand("talk", generatedResponse)

        // 4. Return response for further processing or direct communication
        return {result: generatedResponse};
    }
}
