import { getInstance, Inject, Service } from "@brainstack/inject";
import { google } from "@ai-sdk/google";
import { togetherai } from "@ai-sdk/togetherai";
import { LoggerService } from "../logger/logger.service";
import {
  CoreMessage,
  cosineSimilarity,
  embed,
  embedMany,
  experimental_customProvider as customProvider,
  generateText,
  Provider,
  TextPart,
} from "ai";
import {
  experimental_createProviderRegistry as createProviderRegistry,
  generateObject,
} from "ai";

@Service
export class AiService {
  private aiProviderRegistry?: Provider;

  constructor(private logger: LoggerService = getInstance(LoggerService)) {
    this.initializeAIProviders();
  }

  private async initializeAIProviders() {
    this.logger.verbose('Initializing AI Providers...');
    const genAI = customProvider({
      languageModels: {
        "gemini-1.5": google("models/gemini-1.5-pro", {
          structuredOutputs: true,
        }),
        together: togetherai("meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"),
      },
      textEmbeddingModels: {
        "google-embedding": google.textEmbeddingModel("text-embedding-004"),
      },
      fallbackProvider: google,
    });

    this.aiProviderRegistry = createProviderRegistry({ genAI });
    this.logger.verbose('AI Providers initialized successfully');
  }

  public async generateText(
    prompt: string,
    model: string = "genAI:gemini-1.5",
  ) {
    this.logger.verbose(`Generating text with model: ${model}`);
    this.logger.verbose(`Prompt: ${prompt}`);

    if (this.aiProviderRegistry === undefined) {
      this.logger.verbose('AI providers not initialized, throwing error');
      throw new Error("AI providers have not been initialized.");
    }

    const languageModel = this.aiProviderRegistry.languageModel(model);
    const result = await generateText({
      model: languageModel,
      prompt,
    });

    const generatedText = (result.response.messages[0].content[0] as TextPart).text;
    this.logger.verbose(`Text generation completed. Length: ${generatedText.length} characters`);

    return generatedText;
  }

  public async generateObject(
    promptOrMessages: string | CoreMessage[],
    schema: any,
    maxTokens: number = 8000,
    model: string = "genAI:gemini-1.5",
  ): Promise<any> {
    this.logger.verbose(`Generating object with model: ${model}`);
    this.logger.verbose(`Max Tokens: ${maxTokens}`);

    if (this.aiProviderRegistry === undefined) {
      this.logger.verbose('AI providers not initialized, throwing error');
      throw new Error("AI providers have not been initialized.");
    }

    const languageModel = this.aiProviderRegistry.languageModel(model);

    let processedInput;

    if (typeof promptOrMessages === "string") {
      this.logger.verbose('Processing string prompt');
      processedInput = { prompt: promptOrMessages };
    } else if (
      Array.isArray(promptOrMessages) &&
      promptOrMessages.every((msg) => typeof msg === "object" && msg !== null)
    ) {
      this.logger.verbose(`Processing messages array with ${promptOrMessages.length} messages`);
      if (
        !promptOrMessages.every((msg) =>
          msg.hasOwnProperty("role") && msg.hasOwnProperty("content")
        )
      ) {
        this.logger.verbose('Invalid messages array detected');
        throw new Error(
          "Invalid messages array. Each message must have 'role' and 'content' properties.",
        );
      }

      processedInput = { messages: promptOrMessages };
    } else {
      this.logger.verbose('Invalid input type detected');
      throw new Error(
        "Invalid input. Provide either a string prompt or an array of CoreMessage objects.",
      );
    }

    const result = await generateObject({
      model: languageModel,
      ...processedInput,
      schema,
      maxTokens,
    });

    this.logger.verbose('Object generation completed successfully');
    return result.object;
  }

  public async createEmbedding(
    text: string,
    model: string = "genAI:google-embedding",
  ) {
    this.logger.verbose(`Creating embedding with model: ${model}`);
    this.logger.verbose(`Text to embed: ${text.substring(0, 50)}...`);

    const embeddingModel = this.aiProviderRegistry?.textEmbeddingModel(model);
    if (!embeddingModel) {
      this.logger.verbose('Embedding model not found');
      throw new Error("Embedding model not found.");
    }
    const result = await embed({ model: embeddingModel, value: text });

    this.logger.verbose(`Embedding created. Dimension: ${result.embedding.length}`);
    return result.embedding;
  }

  public async createEmbeddings(
    texts: string[],
    model: string = "genAI:google-embedding",
  ): Promise<number[][]> {
    this.logger.verbose(`Creating embeddings with model: ${model}`);
    this.logger.verbose(`Number of texts to embed: ${texts.length}`);

    const embeddingModel = this.aiProviderRegistry?.textEmbeddingModel(model);
    if (!embeddingModel) {
      this.logger.verbose('Embedding model not found');
      throw new Error("Embedding model not found.");
    }
    const result = await embedMany({ model: embeddingModel, values: texts });

    this.logger.verbose(`Embeddings created. Total embeddings: ${result.embeddings.length}`);
    this.logger.verbose(`Embedding dimension: ${result.embeddings[0]?.length || 0}`);
    return result.embeddings;
  }
}