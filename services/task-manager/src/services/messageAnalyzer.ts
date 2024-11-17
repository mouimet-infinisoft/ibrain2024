import ollama from "ollama";
import logger from "../monitoring/logger";

export interface AnalysisResult {
  requiresCode: boolean;
  requiresResearch: boolean;
  immediateResponse: boolean;
}

export async function analyzeMessage(message: string): Promise<AnalysisResult> {
  try {
    const response = await ollama.chat({
      model: "qwen2.5-coder:7b",
      messages: [{
        role: "system",
        content: "You are a message analyzer. Analyze if the message requires code generation or research. Respond with a simple JSON object with boolean properties 'requiresCode' and 'requiresResearch'. No markdown formatting."
      }, {
        role: "user",
        content: message
      }],
    });

    // Clean the response content of any markdown formatting
    const cleanContent = response.message.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const analysis = JSON.parse(cleanContent);
      return {
        requiresCode: analysis.requiresCode || false,
        requiresResearch: analysis.requiresResearch || false,
        immediateResponse: true
      };
    } catch (parseError) {
      logger.error('Error parsing LLM response:', parseError);
      // Fallback analysis based on keywords
      return {
        requiresCode: message.toLowerCase().includes('code') || 
                     message.toLowerCase().includes('function') ||
                     message.toLowerCase().includes('implementation'),
        requiresResearch: message.toLowerCase().includes('research') ||
                         message.toLowerCase().includes('find') ||
                         message.toLowerCase().includes('analyze'),
        immediateResponse: true
      };
    }
  } catch (error) {
    logger.error('Error analyzing message:', error);
    return {
      requiresCode: false,
      requiresResearch: false,
      immediateResponse: true
    };
  }
}