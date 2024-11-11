import type { Task } from "@/app/protected/task-manager/types";
import ollama from "ollama";

class WebSocketConnection {
  private static instance: WebSocketConnection;
  private ws: WebSocket | null = null;
  private messageCallbacks: Map<string, (response: any) => void> = new Map();

  private constructor() {
    this.connect();
  }

  static getInstance(): WebSocketConnection {
    if (!WebSocketConnection.instance) {
      WebSocketConnection.instance = new WebSocketConnection();
    }
    return WebSocketConnection.instance;
  }

  private connect() {
    this.ws = new WebSocket('ws://localhost:7777');

    this.ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    this.ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.action === 'talk') {
          // Find and execute the callback for this message
          const callback = this.messageCallbacks.get(response.id);
          if (callback) {
            callback(response);
            this.messageCallbacks.delete(response.id);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed. Reconnecting...');
      setTimeout(() => this.connect(), 1000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const messageId = Date.now().toString();
      this.messageCallbacks.set(messageId, resolve);

      const messageWithId = {
        ...message,
        id: messageId
      };

      this.ws.send(JSON.stringify(messageWithId));

      // Timeout to clean up callback if no response is received
      setTimeout(() => {
        if (this.messageCallbacks.has(messageId)) {
          this.messageCallbacks.delete(messageId);
          reject(new Error('Message timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }
}

export const processMessage = async (task: Task): Promise<Task> => new Promise((res,rej)=>{
  if (task.action !== "SEND_MESSAGE") return task;

  console.log("Sending message:", task.payload);

  try {
    const ws = new WebSocket('ws://localhost:7777');

    ws.onopen = async () => {
      console.log('Connected to WebSocket server');

      const response = await ollama.chat({
        model: "qwen2.5-coder:7b",
                //@ts-ignore
        messages: [{ role: "user", content: task.payload.message }],
        stream: true,
      });
  
      let accumulatedContent = "";
  
      for await (const part of response) {
        accumulatedContent += part.message.content;
        ws.send(JSON.stringify({
          action: 'talk',
          //@ts-ignore
          payload: accumulatedContent
        }));
      }
      res({
        ...task,
        result: accumulatedContent,
        status: 'completed'
      });

    };

    // Update task with response

  } catch (error) {
    console.error('Error processing message:', error);
    rej({
      ...task,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});