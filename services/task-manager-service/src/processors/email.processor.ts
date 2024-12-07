
import { Processor } from "../processor-loader/ProcessorLoader";
import dotenv from "dotenv";
import { BaseMessageProcessor, MessageTask } from "./BaseMessageProcessor";

dotenv.config();

@Processor('message', 'email')
export class EmailProcessor extends BaseMessageProcessor {
  async process(task: MessageTask) {
    try {
      this.logger.info(`Processing email task: `, task);

      const generatedText = await this.generateText(task.data.message);

      this.logger.info(`Generated email text: ${generatedText}`);

      return { 
        result: generatedText,
        // Add email-specific processing if needed
        emailMetadata: {
          // Example additional metadata
          generatedAt: new Date()
        }
      };
    } catch (error) {
      this.logger.error('Error in message email processor', error);
      throw error;
    }
  }
}