import { Task } from "./types";
import ollama from "ollama";

interface StreamMessage {
  action: string;
  payload: string;
  status?: "streaming" | "complete";
  isStreaming?: boolean;
  isComplete?: boolean;
  chunk?: string;
}

export const processMessage = async (task: Task): Promise<Task> =>
  new Promise((resolve, reject) => {
    if (task.action !== "SEND_MESSAGE") return task;

    console.log("Sending message:", task.payload);

    try {
      const ws = new WebSocket("ws://localhost:7777");

      ws.onopen = async () => {
        console.log("Connected to WebSocket server");

        // Send initial message to trigger loading animation
        ws.send(JSON.stringify({
          action: "talk",
          payload: "",
          isStreaming: true,
          isComplete: false,
        }));

        // Wait a short moment for animation to start
        await new Promise((resolve) => setTimeout(resolve, 100));

        const response = await ollama.chat({
          // model: "qwen2.5-coder:7b",
          model: "qwen2.5:32b-instruct-q2_K",
          messages: [{
            role: "user",
            //@ts-ignore
            content: task.payload.message,
          }],
          stream: true,
        });

        let accumulatedContent = "";

        for await (const part of response) {
          accumulatedContent += part.message.content;

          // Send streaming message
          const streamMessage: StreamMessage = {
            action: "talk",
            payload: accumulatedContent,
            status: "streaming",
            isStreaming: true,
            isComplete: false,
            chunk: part.message.content,
          };

          ws.send(JSON.stringify(streamMessage));
        }

        // Send completion message
        const completionMessage: StreamMessage = {
          action: "talk",
          payload: accumulatedContent,
          status: "complete",
          isStreaming: false,
          isComplete: true,
        };

        ws.send(JSON.stringify(completionMessage));

        resolve({
          ...task,
          result: accumulatedContent,
          status: "completed",
        });
      };
    } catch (error) {
      console.error("Error processing message:", error);
      reject({
        ...task,
        status: "failed",
        error: error instanceof Error
          ? error.message
          : "Unknown error occurred",
      });
    }
  });
