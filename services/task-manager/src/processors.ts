import { Task } from './types';
import ollama from "ollama";

// export const processMessage = async (task: Task) => {
//   if (task.action !== "SEND_MESSAGE") return;

//   console.log("Sending message:", task.payload);
//   return new Promise<typeof task>((resolve) => setTimeout(()=>{resolve(task)}, 1000));
// };


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