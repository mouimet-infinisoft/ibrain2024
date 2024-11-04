import { register, collectDefaultMetrics, Counter } from 'prom-client';
import { asyncQueueWorker, taskQueueWorker, asyncQueue, taskQueue } from '../queue/taskQueue';
import logger from './logger';

collectDefaultMetrics({register});

const completedJobs = new Counter({
  name: 'completed_jobs_total',
  help: 'Total number of completed jobs',
  labelNames: ['queue']
});

const failedJobs = new Counter({
  name: 'failed_jobs_total',
  help: 'Total number of failed jobs',
  labelNames: ['queue']
});

register.registerMetric(completedJobs);
register.registerMetric(failedJobs);

[asyncQueueWorker, taskQueueWorker].forEach(queue => {
  queue.on('completed', (job) => {
    logger.info(`Completed job ${job?.id} ${job?.name} on queue ${queue.name}`)
    completedJobs.labels({queue: queue.name }).inc();
  });

  queue.on('failed', (job) => {
    logger.error(`Failed job ${job?.id} ${job?.name} on queue ${queue.name}`)
    failedJobs.labels({queue: queue.name }).inc();
  });
});

export const metrics = () => register.metrics();
