import { SendMessagePayload, Task } from "../types";
import { analyzeMessage } from "../services/messageAnalyzer";
import { createTaskFactory } from "../factories/taskFactory";
import { enqueueTask } from "../queue";
import ollama from "ollama";
import WebSocket from 'ws';

export const processMessage = async (task: Task): Promise<Task> => {
  if (task.action !== "SEND_MESSAGE") return task;

  const ws = new WebSocket("ws://localhost:7777");

  try {
    await new Promise((resolve) => ws.on('open', resolve));

    if ((task.payload as SendMessagePayload).sender === "system") {
      return await processSystemMessage(task, ws);
    }

    ws.send(JSON.stringify({
      action: "talk",
      payload: "",
      status: "complete",
      isStreaming: true,
      isComplete: false,
      chunk: "",
    }));

    // First analyze the message
    const analysis = await analyzeMessage((task.payload as SendMessagePayload).message);

    // Prepare system prompt based on analysis
    let systemPrompt = "You are iBrain One, an AI helpful assistant. ";

    if (analysis.requiresCode) {
      systemPrompt += "User asked for code in his message. You respond that you are working on it and it's coming soon. Your response should be short and concise to inform the user that you are working on it. It is strictly forbiden for you to return code directly. Dont tell that to user keep it for yourself.";
    }

    if (analysis.requiresResearch) {
      systemPrompt += "I've initiated a background research task to find detailed information. I'll explain what I'm researching but won't provide the research results here. ";
    }

    // Start background tasks asynchronously if needed
    if (analysis.requiresCode || analysis.requiresResearch) {
      createBackgroundTasks(analysis, task).catch(error =>
        console.error("Error creating background tasks:", error)
      );
    }

    // Stream main response
    const messages = [{
      role: "system",
      content: systemPrompt
    }, {
      role: "user",
      content: (task.payload as SendMessagePayload).message
    }];

    const response = await ollama.chat({
      model: "qwen2.5-coder:7b",
      messages,
      stream: true,
    });

    let accumulatedContent = "";
    for await (const part of response) {
      accumulatedContent += part.message.content;
      ws.send(JSON.stringify({
        action: "talk",
        payload: accumulatedContent,
        status: "streaming",
        isStreaming: true,
        isComplete: false,
        chunk: part.message.content,
      }));
    }

    ws.send(JSON.stringify({
      action: "talk",
      payload: accumulatedContent,
      status: "complete",
      isStreaming: false,
      isComplete: true,
    }));

    return {
      ...task,
      result: accumulatedContent,
      status: "completed",
    };

  } catch (error) {
    console.error("Error processing message:", error);
    return {
      ...task,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  } finally {
    ws.close();
  }
};

async function createBackgroundTasks(analysis: any, task: Task) {
  // Don't await the promises, let them run in parallel
  if (analysis.requiresCode) {
    createTaskFactory(
      "GENERATE_CODE",
      {
        prompt: (task.payload as SendMessagePayload).message,
        conversationId: task.payload.conversationId
      },
      "BACKGROUND",
      "waiting"
    )
      .then(codeTask => {
        if (codeTask) return enqueueTask(codeTask);
      })
      .catch(error => console.error("Error creating code task:", error));
  }

  if (analysis.requiresResearch) {
    createTaskFactory(
      "RESEARCH",
      {
        query: (task.payload as SendMessagePayload).message,
        conversationId: task.payload.conversationId
      },
      "BACKGROUND",
      "waiting"
    )
      .then(researchTask => {
        if (researchTask) return enqueueTask(researchTask);
      })
      .catch(error => console.error("Error creating research task:", error));
  }
}

async function processSystemMessage(task: Task, ws: WebSocket): Promise<Task> {
  const messages = [{
    role: "system",
    content: `You are iBrain One, an AI helpful assistant. ${(task.payload as SendMessagePayload).message}`
  }];

  const response = await ollama.chat({
    model: "qwen2.5-coder:7b",
    messages,
    stream: true,
  });

  let accumulatedContent = "";
  for await (const part of response) {
    accumulatedContent += part.message.content;
    ws.send(JSON.stringify({
      action: "talk",
      payload: accumulatedContent,
      status: "streaming",
      isStreaming: true,
      isComplete: false,
      chunk: part.message.content,
    }));
  }

  ws.send(JSON.stringify({
    action: "talk",
    payload: accumulatedContent,
    status: "complete",
    isStreaming: false,
    isComplete: true,
  }));

  return {
    ...task,
    result: accumulatedContent,
    status: "completed",
  };
}