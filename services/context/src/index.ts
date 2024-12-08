import { Inject, Service } from "@brainstack/inject";
import { SupabaseService } from "../../db/src/db";
import { LoggerService } from "../../logger/logger.service";

@Service
export class ContextService {
    constructor(
        private logger: LoggerService,
        private dbService: SupabaseService<"conversation_contexts">,
    ) {
    }

    async storeInputContext(data: {
        input: string;
        workflow?: any;
        originalContext?: Record<string, any>;
    }): Promise<string> {
        try {
            this.logger.verbose("Storing input context", data);
            const contextRecord = await this.dbService.insert({
                input: data.input,
                workflow_id: data.workflow?.id,
                context: JSON.stringify(data?.originalContext || {}),
                type: "input",
                created_at: new Date().toISOString(),
            });

            return contextRecord?.id || "";
        } catch (error) {
            this.logger.error("Failed to store input context", error);
            throw error;
        }
    }

    async storeResponseContext(data: {
        response: string;
        contextId: string;
        context?: Record<string, any>;
    }) {
        try {
            await this.dbService.update(
                {
                    response: data.response,
                    type: "response",
                    context: JSON.stringify(data.context || {}),
                },
                data.contextId,
            );
        } catch (error) {
            this.logger.error("Failed to store response context", error);
            throw error;
        }
    }

    async retrieveContext(contextId?: string) {
        if (!contextId) return null;

        try {
            const contextData = await this.dbService.findById(contextId);

            // Parse context if it's a JSON string
            if (
                contextData.context && typeof contextData.context === "string"
            ) {
                contextData.context = JSON.parse(contextData.context);
            }

            return contextData;
        } catch (error) {
            this.logger.error("Failed to retrieve context", error);
            return null;
        }
    }

    async getConversationHistory(options?: {
        limit?: number;
        offset?: number;
    }) {
        try {
            const query = this.dbService.find();
            // Implement pagination if needed
            return query;
        } catch (error) {
            this.logger.error("Failed to retrieve conversation history", error);
            return [];
        }
    }
}
