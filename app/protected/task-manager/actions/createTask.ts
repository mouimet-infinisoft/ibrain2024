"use server"
import { createClient } from '@/utils/supabase/server';
import { TaskData, TaskStatus } from '../types';
import logger from '@/lib/monitoring/logger';
import { taskQueue } from '@/lib/queue/taskQueue';

export const createTask = async (taskData: Omit<TaskData, 'userId'>) => {
  const supabase = await createClient();

  try {
    // Get the currently authenticated user's ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Failed to retrieve authenticated user information');
    }

    const userId = user.id;

    // Add task to BullMQ queue with the Supabase task ID
    const job = await taskQueue.add(taskData.type, { ...taskData, userId });
    logger.info(`Task added to BullMQ queue with ID: ${job.id}`);
    const status = await job.getState() as TaskStatus;

    // Insert task record in Supabase with status "pending"
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        type: job.data.type,
        payload: job.data.payload,
        user_id: userId,
        status
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to insert task in Supabase: ${error.message}`);
    }

    const taskId = data.id;
    logger.info(`Task created in Supabase with ID: ${taskId}`);



    return { taskId, status: 'Task created and queued successfully' };
  } catch (error: any) {
    logger.error(`Failed to create task: ${error.message}`);
    throw error;
  }
};
