import { getInstance } from "@brainstack/inject";
import { LogLevel } from "@brainstack/log";
import { AiService } from "../../../ai/ai.service";
import { LoggerService } from "../../../logger/logger.service";
import { BaseTask } from "../types";

// Define specific task interfaces for better type safety
interface MessageTaskData {
    message: string;
  }
  
  export interface MessageTask extends BaseTask {
    type: 'message';
    action: 'send' | 'email';
    data: MessageTaskData;
  }
  
  export abstract class BaseMessageProcessor {
    constructor(
      protected aiService: AiService = getInstance(AiService),
      protected logger: LoggerService = getInstance(LoggerService)
    ) {
      this.logger.seLogLevel(LogLevel.VERBOSE);
    }
  
    protected async generateText(message: string) {
      try {
        this.logger.info(`Generating text for message: ${message}`);
        return await this.aiService.generateText(message);
      } catch (error) {
        this.logger.error('Error generating text', error);
        throw error;
      }
    }
  }
  
