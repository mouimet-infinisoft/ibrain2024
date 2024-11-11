"use server";
import ollama from "ollama";
import { Job } from "bullmq";

async function streamLLMResponseToTask(job: Job) {
  try {
    const response = await ollama.chat({
      model: "qwen2.5-coder:7b",
      messages: [{ role: "user", content: job.data.payload.message }],
      stream: true,
    });

    let accumulatedContent = "";

    for await (const part of response) {
      accumulatedContent += part.message.content;
      job.data.payload.message = accumulatedContent;
      await job.updateProgress(job.data);
    }

    return accumulatedContent;
  } catch (error) {
    console.error("Error streaming LLM response:", error);
    throw error;
  }
}
