import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import logger from "../monitoring/logger";

const connection = {
  host: process.env.REDIS_HOST || '192.168.10.2',
  port: Number(process.env.REDIS_PORT) || 6379,
};

const redisClient = new IORedis(connection);

redisClient.on('error', (error) => {
  console.error('Redis Client Error:', error);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

// Create the task queue
export const taskQueue = new Queue('task-queue', { connection });

// Create the async queue
export const asyncQueue = new Queue('async-queue', { connection });

// Function to update task status in Supabase
// const updateTaskStatus = async (taskId: string, status: string, errorMessage?: string) => {
//   const supabase = await createClient();

//   const updateData: any = { status };
//   if (errorMessage) updateData.error = errorMessage;

//   await supabase
//     .from("tasks")
//     .update(updateData)
//     .eq("id", taskId);
// };

// Create workers for the queues
export const taskQueueWorker = new Worker(
  'task-queue',
  async (job) => {
    const taskId = job.id;

    // Validate job ID
    if (!taskId) {
      const errorMessage = "Invalid task: Missing job ID";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      // Update task status to "processing" in Supabase

      // Process the job
      switch (job.data.type) {
        case "sendMessage":
          // Implement message sending logic
          logger.info(`Processing sendMessage task for task ID: ${taskId}`);
          break;

        case "processVoice":
          // Implement voice processing logic
          logger.info(`Processing processVoice task for task ID: ${taskId}`);
          break;

        default:
          throw new Error(`Unknown task type: ${job.data.type}`);
      }

      // Update task status to "completed" in Supabase
      logger.info(`Task completed: ${taskId}`);
    } catch (error: any) {
      logger.error(`Task failed: ${taskId}`, { error });
      throw error;
    }
  },
  { connection }
);

export const asyncQueueWorker = new Worker(
  'async-queue',
  async (job) => {
    const taskId = job.id;

    // Validate job ID
    if (!taskId) {
      const errorMessage = "Invalid async task: Missing job ID";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {


      // Process the job (for example, handling asynchronous tasks)
      logger.info(`Processing async task for task ID: ${taskId}`);
      // Insert async task processing logic here...

      // Update task status to "completed" in Supabase
      logger.info(`Async task completed: ${taskId}`);
    } catch (error: any) {
      logger.error(`Async task failed: ${taskId}`, { error });
      throw error;
    }
  },
  { connection }
);

