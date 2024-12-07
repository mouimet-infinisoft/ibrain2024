// Shared base interfaces
export interface BaseTask {
  type: string;
  action: string;
  priority?: 'low' | 'medium' | 'high';
  retryAttempts?: number;
  [key: string]: any;
}

export type TaskProcessor<T extends BaseTask = BaseTask> = (task: T) => Promise<{ result: any }>;

export interface QueueConfig {
  name: string;
  concurrency?: number;
  defaultRetryAttempts?: number;
}

