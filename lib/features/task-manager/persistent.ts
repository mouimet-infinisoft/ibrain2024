import { QueueEvents, Worker } from "bullmq";
import { createNewTask, updateTaskState } from "./storage";
import { connection } from "./connection";

import logger from "@/lib/monitoring/logger";
import { createClient } from "@supabase/supabase-js";

export const setupPersistentTask = async (queueName: string) => {
  const supabase = createClient('http://127.0.0.1:54321','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');
  const updateState = updateTaskState(supabase);
  const queueEvents = new QueueEvents(queueName, { connection });

  queueEvents.on("completed", async (args, returnValue) => {
    try {
      // const {id} = JSON.parse(returnValue)
      // @ts-ignore
      logger.verbose(`queueEvents event on completed with args: `, args, `id: `, returnValue);

      const result = await updateState(returnValue, {
        status: "completed",
        updated_at: new Date().toISOString(),
      });
      logger.verbose(`updateState successful! Result: `, result);
    } catch (e) {
      logger.error(`Failed to updateState with folowing error:: `, e);
    }
  });

  // queueEvents.on("failed", async ({ jobId }) => {
  //   logger.verbose(`queueEvents event on failed with jobId: `, jobId);
  //   const result = await updateState(jobId, {
  //     status: "failed",
  //     updated_at: new Date().toISOString(),
  //   });
  //   logger.verbose(`updateState successful! Result: `, result);
  // });

  // queueEvents.on("active", async ({ jobId }) => {
  //   logger.verbose(`queueEvents event on active with jobId: `, jobId);
  //   const result = await updateState(jobId, {
  //     status: "active",
  //     updated_at: new Date().toISOString(),
  //   });
  //   logger.verbose(`updateState successful! Result: `, result);
  // });

  // queueEvents.on("waiting", async ({ jobId }) => {
  //   logger.verbose(`queueEvents event on waiting with jobId: `, jobId);
  //   const result = await updateState(jobId, {
  //     status: "waiting",
  //     updated_at: new Date().toISOString(),
  //   });
  //   logger.verbose(`updateState successful! Result: `, result);
  // });
};
