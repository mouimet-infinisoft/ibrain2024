import { getInstance } from "@brainstack/inject";
import { LogLevel } from "@brainstack/log";
import { AiService } from "../../../ai/ai.service";
import { LoggerService } from "../../../logger/logger.service";
import { BaseTask } from "../types";
import { TaskQueueClient } from "../task-queue/TaskQueueClient";
import { ContextService } from "../../../context/src";
import { SupabaseService } from "../../../db/src/db";

// Define specific task interfaces for better type safety
interface MessageTaskData {
  message: string;
}

export interface MessageTask extends BaseTask {
  type: "message";
  action: "send" | "email";
  data: MessageTaskData;
}

export interface MessageInputTask extends BaseTask {
  type: 'communication';
  action: 'process-input' | 'generate-response' | 'store-context';
  data: {
    message: string;
    context?: Record<string, any>;
    conversationId?: string;
  };
}

export abstract class BaseMessageProcessor {
  constructor(
    protected aiService: AiService = getInstance(AiService),
    protected logger: LoggerService = getInstance(LoggerService),
    protected taskQueueClient: TaskQueueClient = getInstance(TaskQueueClient),
    protected contextService: ContextService = new ContextService(getInstance(LoggerService), new SupabaseService('conversation_contexts')),
  ) {
    this.logger.seLogLevel(LogLevel.VERBOSE);
  }

  protected async generateText(message: string) {
    try {
      this.logger.info(`Generating text for message: ${message}`);
      return await this.aiService.generateText(message);
    } catch (error) {
      this.logger.error("Error generating text", error);
      throw error;
    }
  }
}
