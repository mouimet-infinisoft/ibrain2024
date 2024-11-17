import { Worker } from "bullmq";
import { Task } from '../types';
import { processMessage } from "../processors/messageProcessor";
import { processBackgroundTask } from "../processors/backgroundProcessor";
import logger from "../monitoring/logger";
import { connection } from "../connection";

export const workerFactory = (
  queueName: string,
) => {
  const worker = new Worker(queueName, async (job) => {
    const task = job.data as Task;
    logger.verbose(
      `Worker ${queueName} processing job:`,
      job.asJSON,
      `job.data: `,
      job.data,
      "Task = ",
      task,
    );

    await job.log(`Worker ${queueName} processing job`);

    switch (task.type) {
      case "REALTIME":
        logger.verbose(`Processing realtime task ${task.action}`);
        const result = await processMessage(task);
        job.returnvalue = result.result;
        return result.result;
      case "BACKGROUND":
        logger.verbose(`Processing background task ${task.action}`);
        const bgResult = await processBackgroundTask(task);
        job.returnvalue = bgResult.result;
        return bgResult.result;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }}
    , { connection, concurrency: 3 });

  return worker;
};
