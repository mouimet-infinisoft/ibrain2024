import { getInstance, Inject, Service } from "@brainstack/inject";
import { AiService } from "../../ai/ai.service";
import { LoggerService } from "../../logger/logger.service";
import { ContextService } from "./../../context/src";
import dotenv from "dotenv";
import { SupabaseService } from "../../db/src/db";

dotenv.config();

@Service
export class ResponseGenerationService {
  constructor(
    private aiService: AiService=getInstance(AiService),
    private logger: LoggerService=getInstance(LoggerService),
    private contextService: ContextService = new ContextService(getInstance(LoggerService), new SupabaseService('conversation_contexts')),
  ) {}

  /**
   * Generate a contextually aware response
   * @param options Input parameters for response generation
   * @returns Generated response string
   */
  async generateResponse(options: {
    input: string;
    context?: any;
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    try {
      // 1. Retrieve recent conversation context
      const recentContext = options.context
        ? await this.retrieveRelevantContext(options.context)
        : null;

      // 2. Prepare prompt with context
      const enhancedPrompt = this.prepareEnhancedPrompt({
        input: options.input,
        context: recentContext,
      });

      // 3. Generate response using AI service
      const response = await this.aiService.generateText(
        enhancedPrompt,
      );

      // 4. Log generation details
      this.logger.info("Response generated", {
        inputLength: options.input.length,
        responseLength: response.length,
      });

      return response;
    } catch (error) {
      // Enhanced error handling
      this.logger.error("Failed to generate response", error);

      // Fallback response
      return this.generateFallbackResponse(options.input);
    }
  }

  /**
   * Prepare an enhanced prompt by incorporating context
   */
  private prepareEnhancedPrompt(options: {
    input: string;
    context?: any;
  }): string {
    // Combine input with contextual information
    const contextualPrompt = options.context
      ? `
Context:
- Previous interactions: ${JSON.stringify(options.context)}

User Input: ${options.input}

Please generate a response that is:
1. Directly relevant to the user's input
2. Coherent with the previous context
3. Helpful and engaging
4. Does not contain markdown or formatting syntax
`
      : options.input;

    return contextualPrompt;
  }

  /**
   * Retrieve relevant context for response generation
   */
  private async retrieveRelevantContext(context: any) {
    // If a specific context ID is provided, retrieve it
    if (context?.contextId) {
      return this.contextService.retrieveContext(context.contextId);
    }

    // Alternatively, fetch recent conversation history
    const recentHistory = await this.contextService.getConversationHistory({
      limit: 3, // Last 3 conversation entries
    });

    return recentHistory;
  }

  /**
   * Generate a fallback response when generation fails
   */
  private generateFallbackResponse(input: string): string {
    const fallbackResponses = [
      "I apologize, but I'm having trouble understanding that completely. Could you rephrase?",
      "That's an interesting point. Could you tell me more?",
      "I'm processing your request. Could you provide a bit more context?",
      "I want to help, but I'm not quite sure how to respond to that.",
    ];

    // Select a random fallback response
    const fallbackResponse = fallbackResponses[
      Math.floor(Math.random() * fallbackResponses.length)
    ];

    this.logger.warn(`Fallback response generated for input: ${input}`);

    return fallbackResponse;
  }

  /**
   * Advanced method for generating multiple response options
   * Useful for more complex conversational scenarios
   */
  async generateMultipleResponses(options: {
    input: string;
    context?: any;
    numResponses?: number;
  }): Promise<string[]> {
    const numResponses = options.numResponses || 3;

    try {
      const responses = await Promise.all(
        Array(numResponses).fill(null).map(() =>
          this.generateResponse({
            input: options.input,
            context: options.context,
            temperature: 0.7 + (Math.random() * 0.3), // Slight variation in temperature
          })
        ),
      );

      return responses;
    } catch (error) {
      this.logger.error("Failed to generate multiple responses", error);
      return [this.generateFallbackResponse(options.input)];
    }
  }
}
