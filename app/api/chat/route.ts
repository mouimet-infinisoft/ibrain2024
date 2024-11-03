import { insertAssistantMessage } from "@/app/protected/chat/actions/chat-actions";
import { NextRequest } from "next/server";
import ollama from "ollama";

export async function POST(request: NextRequest) {
  const { message, conversationId } = await request.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let isControllerClosed = false;

      // Listen to client disconnect (abort) event from request.signal
      request.signal.addEventListener("abort", () => {
        isControllerClosed = true;
        controller.close();
        ollama.abort();
      });

      try {
        const response = await ollama.chat({
          model: "qwen2.5-coder:7b",
          messages: [{ role: "user", content: message }],
          stream: true,
        });

        let accumulatedContent = "";

        for await (const part of response) {
          if (isControllerClosed) break;

          accumulatedContent += part.message.content;
          if (!isControllerClosed) {
            controller.enqueue(encoder.encode(
              JSON.stringify({
                content: part.message.content,
                done: false,
              }) + "\n",
            ));
          }
        }

        await insertAssistantMessage(conversationId, accumulatedContent);

        if (!isControllerClosed) {
          controller.enqueue(encoder.encode(
            JSON.stringify({
              content: "",
              done: true,
            }) + "\n",
          ));
          controller.close();
        }
      } catch (error) {
        if (!isControllerClosed) {
          console.error("Error streaming LLM response:", error);
          controller.error(error);
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
