import { Queue } from 'bullmq';
import { enqueueTaskFactory } from './factories/queueFactory';
import { connection } from './connection';

export const queue = new Queue("tasks", { connection });
export const enqueueTask = enqueueTaskFactory(queue)