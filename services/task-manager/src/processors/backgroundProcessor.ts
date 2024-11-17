import { GenerateCodePayload, ResearchPayload, Task } from "../types";
import ollama from "ollama";
import logger from "../monitoring/logger";
import WebSocket from 'ws';

export const processBackgroundTask = async (task: Task): Promise<Task> => {
  const ws = new WebSocket("ws://localhost:7777");

  try {
    await new Promise((resolve) => ws.on('open', resolve));

    switch (task.action) {
      case "GENERATE_CODE":
        return await processCodeGeneration(task, ws);
      case "RESEARCH":
        return await processResearch(task, ws);
      default:
        throw new Error(`Unknown background task action: ${task.action}`);
    }
  } finally {
    ws.close();
  }
};

async function processCodeGeneration(task: Task, ws: WebSocket): Promise<Task> {
  const response = await ollama.chat({
    model: "qwen2.5-coder:7b",
    messages: [{
      role: "system",
      content: "Generate code only, no explanations"
    }, {
      role: "user",
      content: (task.payload as GenerateCodePayload).prompt
    }],
  });

  ws.send(JSON.stringify({
    action: "background_update",
    payload: response.message.content,
    status: "complete",
    isComplete: true,
    taskType: "BACKGROUND",
    backgroundType: "code"
  }));

  return {
    ...task,
    status: "completed",
    result: response.message.content
  };
}

async function processResearch(task: Task, ws: WebSocket): Promise<Task> {
  const response = await ollama.chat({
    model: "qwen2.5-coder:7b",
    messages: [{
      role: "system",
      content: "Perform research and analysis"
    }, {
      role: "user",
      content: (task.payload as ResearchPayload).query
    }],
  });

  ws.send(JSON.stringify({
    action: "background_update",
    payload: response.message.content,
    status: "complete",
    isComplete: true,
    taskType: "BACKGROUND",
    backgroundType: "research"
  }));

  return {
    ...task,
    status: "completed",
    result: response.message.content
  };
}
