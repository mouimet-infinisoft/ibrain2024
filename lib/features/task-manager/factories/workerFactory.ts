import { Worker } from "bullmq";
import { Task } from "@/app/protected/task-manager/types";
import { processMessage } from "../processors";
import { connection } from "../connection";
import logger from "@/lib/monitoring/logger";

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

    switch (task.action) {
      case "SEND_MESSAGE":
        logger.verbose(`Before Procesing Action ${task.action}`);
        const d = await processMessage(task);
        await job.log(`\n\nAfter Procesing Action. Rsult: ${JSON.stringify(d)}\n\n`);
        job.returnvalue = d.result
        logger.verbose(`\n\nd.result = `, d.result, `\n\n`);
        return d.result
        break;
    }
  }, { connection });

  return worker;
};
