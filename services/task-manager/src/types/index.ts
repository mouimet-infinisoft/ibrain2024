
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


export interface QueueConfig {
  name: string;
  concurrency?: number;
  defaultRetryAttempts?: number;
}

