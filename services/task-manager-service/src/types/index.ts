// Shared base interfaces
// export interface BaseTask {
//   type: string;
//   action: string;
//   priority?: 'low' | 'medium' | 'high';
//   retryAttempts?: number;
//   [key: string]: any;
// }

import { Job, JobsOptions } from "bullmq";

export interface BaseTask {
  type: string;
  action: string;
  // Allow flexible data structure
  data: Record<string, any>;
  jobOptions?: JobsOptions
}

// Processor type that aligns with BullMQ
export type TaskProcessor<T extends BaseTask = BaseTask> = 
  (job: T) => Promise<any>;

// export type TaskProcessor<T extends BaseTask = BaseTask> = (task: T) => Promise<{ result: any }>;

export interface QueueConfig {
  name: string;
  concurrency?: number;
  defaultRetryAttempts?: number;
}

