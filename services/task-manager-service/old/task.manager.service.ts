import { Queue, Worker, Job } from 'bullmq';
import { Redis, RedisOptions } from 'ioredis';
import { Logger } from 'winston'; // Assuming a standard logging library

// Replace with your actual logger import or create a mock logger
const createLogger = (): Logger => {
  return {
    verbose: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info
  } as Logger;
};

const logger = createLogger();

// Base task interface
export interface BaseTask {
  type: string;
  action: string;
  priority?: 'low' | 'medium' | 'high';
  retryAttempts?: number;
  [key: string]: any;
}

// Task processor type
export type TaskProcessor<T extends BaseTask = BaseTask> = (task: T) => Promise<{ result: any }>;

// Queue configuration interface
export interface QueueConfig {
  name: string;
  concurrency?: number;
  defaultRetryAttempts?: number;
}

class MultiQueueTaskManager {
  private queues: Map<string, Queue>;
  private workers: Map<string, Worker>;
  private processors: Map<string, Map<string, TaskProcessor>>;
  private connection: RedisOptions;

  /**
   * Create a new MultiQueueTaskManager instance
   * @param connection Redis connection options
   */
  constructor(connection: RedisOptions) {
    this.connection = connection;
    this.queues = new Map();
    this.workers = new Map();
    this.processors = new Map();
  }

  /**
   * Create and register a new queue
   * @param config Queue configuration
   * @returns This instance for chaining
   */
  createQueue(config: QueueConfig): this {
    const { 
      name, 
      concurrency = 3, 
      defaultRetryAttempts = 3 
    } = config;

    // Prevent duplicate queue creation
    if (this.queues.has(name)) {
      throw new Error(`Queue ${name} already exists`);
    }

    // Create queue and processor map
    const queue = new Queue(name, { 
      connection: this.connection,
      defaultJobOptions: {
        attempts: defaultRetryAttempts,
        backoff: {
          type: 'exponential',
          delay: 1000 // Initial backoff delay of 1 second
        }
      }
    });
    
    // Store queue
    this.queues.set(name, queue);
    this.processors.set(name, new Map());

    return this;
  }

  /**
   * Register a processor for a specific queue and action
   * @param queueName Queue to register processor for
   * @param action Specific action to process
   * @param processor Processor function
   * @returns This instance for chaining
   */
  registerProcessor<T extends BaseTask>(
    queueName: string, 
    action: string, 
    processor: TaskProcessor<T>
  ): this {
    const queueProcessors = this.processors.get(queueName);
    
    if (!queueProcessors) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    queueProcessors.set(action, processor as TaskProcessor);
    return this;
  }

  /**
   * Start worker for a specific queue
   * @param queueName Name of the queue to start worker for
   * @param customConcurrency Optional custom concurrency
   */
  startWorker(queueName: string, customConcurrency?: number): void {
    const queue = this.queues.get(queueName);
    const queueProcessors = this.processors.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    // Prevent duplicate worker creation
    if (this.workers.has(queueName)) {
      logger.warn(`Worker for queue ${queueName} already running`);
      return;
    }

    const worker = new Worker(queueName, async (job) => {
      const task = job.data as BaseTask;
      
      logger.verbose(
        `Processing job in queue ${queueName}:`,
        JSON.stringify(task)
      );

      await job.log(`Processing job: ${task.action}`);

      // Find and execute the appropriate processor
      const processor = queueProcessors?.get(task.action);
      
      if (!processor) {
        throw new Error(`No processor found for action: ${task.action} in queue: ${queueName}`);
      }

      try {
        const result = await processor(task);
        job.returnvalue = result.result;
        return result.result;
      } catch (error) {
        logger.error(`Error processing task ${task.action} in queue ${queueName}:`, error);
        throw error;
      }
    }, { 
      connection: this.connection, 
      concurrency: customConcurrency ?? 3 
    });

    // Add error handling
    worker.on('error', (error) => {
      logger.error(`Worker for queue ${queueName} encountered an error:`, error);
    });

    // Store the worker
    this.workers.set(queueName, worker);

    logger.info(`Worker started for queue: ${queueName}`);
  }

  /**
   * Enqueue a task to a specific queue
   * @param queueName Queue to enqueue task to
   * @param task Task to enqueue
   * @returns Job representing the enqueued task
   */
  async enqueueTask(queueName: string, task: BaseTask): Promise<Job> {
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    // Set job options based on task priority
    const jobOptions = task.priority 
      ? { 
          priority: task.priority === 'high' ? 1 : 
                    task.priority === 'medium' ? 5 : 10 
        } 
      : {};

    logger.verbose(`Enqueuing task in queue ${queueName}:`, task);
    return queue.add(task.action, task, jobOptions);
  }

  /**
   * Stop worker for a specific queue
   * @param queueName Queue to stop worker for
   */
  async stopWorker(queueName: string): Promise<void> {
    const worker = this.workers.get(queueName);

    if (!worker) {
      logger.warn(`No worker running for queue: ${queueName}`);
      return;
    }

    await worker.close();
    this.workers.delete(queueName);
    logger.info(`Worker stopped for queue: ${queueName}`);
  }

  /**
   * Get a specific queue
   * @param queueName Name of the queue
   * @returns Queue instance
   */
  getQueue(queueName: string): Queue {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }
    return queue;
  }

  /**
   * Close all queues and workers
   */
  async close(): Promise<void> {
    // Stop all workers
    for (const queueName of this.workers.keys()) {
      await this.stopWorker(queueName);
    }

    // Close all queues
    for (const queue of this.queues.values()) {
      await queue.close();
    }

    logger.info('All queues and workers closed');
  }
}

export default MultiQueueTaskManager;