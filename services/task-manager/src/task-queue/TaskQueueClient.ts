import { Queue, Job } from "bullmq";
import { Inject } from "@brainstack/inject";
import { LoggerService } from "../../../logger/logger.service";
import { RedisConnexion } from "../config/RedisConnexion";
import { BaseTask } from "../types";


/**
 * TaskQueueClient - Focused solely on enqueueing tasks
 * Provides a lightweight, focused interface for creating tasks
 */

export class TaskQueueClient {
  private queues: Map<string, Queue>;

  /**
   * Create a new TaskQueueClient instance
   * @param connection Redis connection options
   */
  constructor(@Inject private connection: RedisConnexion, @Inject private logger: LoggerService) {
    this.queues = new Map();
  }

  /**
   * Get or create a queue connection
   * @param queueName Name of the queue
   * @returns Queue instance
   */
  private getOrCreateQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, { connection: this.connection });
      this.queues.set(queueName, queue);
    }
    return this.queues.get(queueName)!;
  }

  /**
   * Enqueue a task to a specific queue
   * @param queueName Queue to enqueue task to
   * @param task Task to enqueue
   * @returns Job representing the enqueued task
   */
  async enqueueTask(queueName: string, task: BaseTask): Promise<Job> {
    const queue = this.getOrCreateQueue(queueName);


    this.logger.verbose(`Enqueueing task in queue ${queueName}:`, task);
    return queue.add(task.action, task, task.jobOptions);
  }

  /**
   * Close all queue connections
   */
  async close(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.queues.clear();
    this.logger.info('All queue connections closed');
  }
}
