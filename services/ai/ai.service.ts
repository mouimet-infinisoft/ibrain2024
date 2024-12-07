import { Inject, Service } from "@brainstack/inject";
import { google } from "@ai-sdk/google";
import { togetherai } from "@ai-sdk/togetherai";
import {
  experimental_customProvider as customProvider,
  Provider,
  generateText,
  TextPart,
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
      fallbackProvider: google,
    });

    this.aiProviderRegistry = createProviderRegistry({ genAI });
  }

  public async generateText(
    prompt: string,
    model: string = "genAI:gemini-1.5"
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

  public async generateObject(
    prompt: string,
    schema: any,
    model: string = "genAI:gemini-1.5"
  ) {
    if (this.aiProviderRegistry === undefined) {
      throw new Error("AI providers have not been initialized.");
    }
    const languageModel = this.aiProviderRegistry.languageModel(model);
    const result = await generateObject({
      model: languageModel,
      prompt,
      schema,
    });
    return result.object;
  }
}
