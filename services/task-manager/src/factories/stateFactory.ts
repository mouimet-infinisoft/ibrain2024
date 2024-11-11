import { SupabaseClient } from '@supabase/supabase-js';
import { Task } from '../types';

export const updateTaskStateFactory = (supabase: SupabaseClient) =>
  async (taskId: string, updates: Partial<Task>): Promise<void> => {
    await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);
  };
