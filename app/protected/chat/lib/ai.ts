"use server";
import ollama from "ollama";
import { insertAssistantMessage } from "../actions/chat-actions";

async function streamLLMResponse(message: string, conversationId: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await ollama.chat({
          model: "qwen2.5-coder:7b",
          messages: [{ role: "user", content: message }],
          stream: true,
        });

        let accumulatedContent = "";
        
        for await (const part of response) {
          accumulatedContent += part.message.content;
          controller.enqueue(encoder.encode(JSON.stringify({ 
            content: part.message.content,
            done: false 
          }) + '\n'));
        }

        await insertAssistantMessage(conversationId, accumulatedContent);
        
        controller.enqueue(encoder.encode(JSON.stringify({ 
          content: '', 
          done: true 
        }) + '\n'));
        controller.close();
      } catch (error) {
        console.error("Error streaming LLM response:", error);
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}