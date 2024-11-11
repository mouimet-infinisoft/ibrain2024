import { SupabaseClient } from "@supabase/supabase-js";
import type { Task } from "./types";

export const updateTaskState =
  (supabase: SupabaseClient) =>
  async (taskId: string, updates: Partial<Task>):Promise<Task> => {
    try {
      console.log("ID = :", taskId);
      const { data, error } = await supabase
        .from("tasks")
        .update({id: taskId, ...updates})
        .eq("id", taskId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log("Task updated successfully:", data);
      return data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
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
