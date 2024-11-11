import { SupabaseClient } from "@supabase/supabase-js";
import type { Task } from "@/app/protected/task-manager/types";

export const updateTaskState =
  (supabase: SupabaseClient) =>
  async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      console.log("ID = :", taskId);
      const { data, error } = await supabase
        .from("tasks")
        .update({id: taskId, status:'completed'})
        .eq("id", taskId);

      if (error) {
        throw error;
      }

      console.log("Task updated successfully:", data);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

export const createNewTask = (supabase: SupabaseClient) =>
async (
  task: Omit<Task, "id">,
): Promise<void> => {
  await supabase
    .from("tasks")
    .insert([task]);
};
