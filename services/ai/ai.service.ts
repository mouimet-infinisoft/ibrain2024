import { Inject, Service } from "@brainstack/inject";
import { google } from "@ai-sdk/google";
import { togetherai } from "@ai-sdk/togetherai";
import {
  cosineSimilarity,
  embed,
  embedMany,
  experimental_customProvider as customProvider,
  generateText,
  Provider,
  TextPart,
  CoreMessage,
} from "ai";
import {
  experimental_createProviderRegistry as createProviderRegistry,
  generateObject,
} from "ai";

@Service
export class AiService {
  private aiProviderRegistry?: Provider;

  constructor() {
    this.initializeAIProviders();
  }

  private async initializeAIProviders() {
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
  }

  public async generateText(
    prompt: string,
    model: string = "genAI:gemini-1.5",
  ) {
    if (this.aiProviderRegistry === undefined) {
      throw new Error("AI providers have not been initialized.");
    }
    const languageModel = this.aiProviderRegistry.languageModel(model);
    const result = await generateText({
      model: languageModel,
      prompt,
    });

    return (result.response.messages[0].content[0] as TextPart).text;
  }

  // public async generateObject(
  //   prompt: string,
  //   schema: any,
  //   model: string = "genAI:gemini-1.5",
  // ) {
  //   if (this.aiProviderRegistry === undefined) {
  //     throw new Error("AI providers have not been initialized.");
  //   }
  //   const languageModel = this.aiProviderRegistry.languageModel(model);
  //   const result = await generateObject({
  //     model: languageModel,
  //     prompt,
  //     schema,
  //     m
  //   });
  //   return result.object;
  // }

  public async generateObject(
    promptOrMessages: string | CoreMessage[],
    schema: any,
    maxTokens: number=8000,
    model: string = "genAI:gemini-1.5",

  ): Promise<any> { // Add return type for clarity
  
    if (this.aiProviderRegistry === undefined) {
      throw new Error("AI providers have not been initialized.");
    }
  
    const languageModel = this.aiProviderRegistry.languageModel(model);
  
    let processedInput;  // To hold the data after processing
  
    if (typeof promptOrMessages === "string") {
      // Handle string prompt
      processedInput = { prompt: promptOrMessages }; // Create object with 'prompt' key
    } else if (Array.isArray(promptOrMessages) && promptOrMessages.every(msg => typeof msg === 'object' && msg !== null )) { // Typeguard to check for array of objects
  
      // Check if promptOrMessages is an array of CoreMessage-like objects (basic check)
      if (!promptOrMessages.every(msg => msg.hasOwnProperty('role') && msg.hasOwnProperty('content'))) {
        throw new Error("Invalid messages array. Each message must have 'role' and 'content' properties.");
      }
  
      // Handle array of messages
      processedInput = { messages: promptOrMessages }; // Create object with 'messages' key
    } else {
      throw new Error("Invalid input. Provide either a string prompt or an array of CoreMessage objects.");
    }
  
    const result = await generateObject({ // Assuming external generateObject function
      model: languageModel,
      ...processedInput, // Spread the processed input (either prompt or messages)
      schema,
      maxTokens
    });
  
    return result.object;
  }

  public async createEmbedding(
    text: string,
    model: string = "genAI:google-embedding",
  ) {
    const embeddingModel = this.aiProviderRegistry?.textEmbeddingModel(model);
    if (!embeddingModel) {
      throw new Error("Embedding model not found.");
    }
    const result = await embed({ model: embeddingModel, value: text });
    return result.embedding;
  }

  public async createEmbeddings(
    texts: string[],
    model: string = "genAI:google-embedding",
  ): Promise<number[][]> {
    const embeddingModel = this.aiProviderRegistry?.textEmbeddingModel(model);
    if (!embeddingModel) {
      throw new Error("Embedding model not found.");
    }
    const result = await embedMany({ model: embeddingModel, values: texts });
    return result.embeddings;
  }

  public calculateCosineSimilarity(
    embedding1: number[],
    embedding2: number[],
  ): number {
    return cosineSimilarity(embedding1, embedding2);
  }
}
