import { QueueEvents, Worker } from "bullmq";
import { createNewTask, updateTaskState } from "./storage";
import { connection } from "./connection";
import { worker } from "./worker";

import logger from "./monitoring/logger";
import { createClient } from "@supabase/supabase-js";
import { createTaskFactory } from "./factories/taskFactory";
import { enqueueTask } from "./queue";

export const setupPersistentTask = async (queueName: string) => {
  const supabase = createClient(
    "http://127.0.0.1:54321",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
  );
  worker()

  const updateState = updateTaskState(supabase);
  const queueEvents = new QueueEvents(queueName, { connection });

  queueEvents.on("completed", async (args, returnValue) => {
    console.log(
      `queueEvents event on completed with args: `,
      args,
      `id: `,
      returnValue,
    );
    // @ts-ignore
    try {
      const updatedTask = await updateState(args.jobId, {
        status: "completed",
        result: args.returnvalue,
        updated_at: new Date().toISOString(),
      });

      if (updatedTask?.type === 'BACKGROUND' && updatedTask?.action === 'GENERATE_CODE') {
        // Send notification message
        // Create a REALTIME task for notification
        const notificationTask = await createTaskFactory(
          "SEND_MESSAGE",
          {
            message: "Tell the user that the code generation background task is complete.",
            conversationId: updatedTask.payload.conversationId,
            sender: "system"
          },
          "REALTIME",
          "waiting"
        );

        if (notificationTask) {
          await enqueueTask(notificationTask);
        }


        // Send code separately with special format for UI
        const ws = new WebSocket("ws://localhost:7777");

        ws.onopen = () => {
          ws.send(JSON.stringify({
            action: "background_update",
            payload: updatedTask.result,
            status: "complete",
            isComplete: true,
            taskType: "BACKGROUND",
            backgroundType: "code",
            metadata: {
              language: "typescript", // You might want to detect this from the code
              title: "Generated Code",
              timestamp: new Date().toISOString()
            }
          }));

          ws.close();
        }

      } else if (updatedTask?.payload?.conversationId) {
        // Handle other types of tasks as before
        await supabase.from("messages").insert({
          conversation_id: updatedTask.payload.conversationId,
          role: "assistant",
          content: args.returnvalue,
        });
      }

      logger.info(`Task completed successfully:`, updatedTask);
    } catch (e) {
      logger.error(`Failed to handle task completion:`, e);
    }
  });

  queueEvents.on("failed", async ({ jobId }) => {
    logger.verbose(`queueEvents event on failed with jobId: `, jobId);
    const result = await updateState(jobId, {
      status: "failed",
      updated_at: new Date().toISOString(),
    });
    logger.verbose(`updateState successful! Result: `, result);
  });

  queueEvents.on("active", async ({ jobId }) => {
    logger.verbose(`queueEvents event on active with jobId: `, jobId);
    const result = await updateState(jobId, {
      status: "active",
      updated_at: new Date().toISOString(),
    });
    logger.verbose(`updateState successful! Result: `, result);
  });

  queueEvents.on("waiting", async ({ jobId }, id) => {
    console.log(
      `queueEvents event on waiting with jobId: `,
      jobId,
      `id = `,
      id,
    );
    const result = await updateState(jobId, {
      status: "waiting",
      updated_at: new Date().toISOString(),
    });
    logger.verbose(`updateState successful! Result: `, result);
  });


};
