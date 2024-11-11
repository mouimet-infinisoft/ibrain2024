import { collectDefaultMetrics, Counter, register } from "prom-client";
import logger from "./monitoring/logger";
import { worker } from "./worker";

collectDefaultMetrics({ register });

const completedJobs = new Counter({
  name: "completed_jobs_total",
  help: "Total number of completed jobs",
  labelNames: ["queue"],
});

const failedJobs = new Counter({
  name: "failed_jobs_total",
  help: "Total number of failed jobs",
  labelNames: ["queue"],
});

register.registerMetric(completedJobs);
register.registerMetric(failedJobs);

worker.on("completed", (job, result) => {
  logger.info(
    `Completed job ${job?.id} ${job?.name} on queue ${worker.name} with result ${result}`,
  );
  completedJobs.labels({ queue: job?.queueName }).inc();
});

worker.on("failed", (job) => {
  logger.error(`Failed job ${job?.id} ${job?.name} on queue ${worker.name}`);
  failedJobs.labels({ queue: job?.queueName }).inc();
});

export const metrics = () => register.metrics();
