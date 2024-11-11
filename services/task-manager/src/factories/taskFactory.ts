import { TaskStatus, TaskType } from "../types";
import logger from "../monitoring/logger";

import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

type Json = Record<string, unknown> | Json[] | string | number | boolean | null;

const supabase = createClient('http://127.0.0.1:54321','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');

type BaseTask = {
  id: string;
  job_id: string;
  status: TaskStatus;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  result: Json | null;
  error: string | null;
};

type SendMessagePayload = {
  message: string;
  conversationId: string;
};

export type Task = TaskActionPayload<"SEND_MESSAGE", SendMessagePayload> & {
  type: "REALTIME";
};

type TaskActionPayload<T extends string, P extends Json> = BaseTask & {
  action: T;
  payload: P;
};

export async function createTaskFactory<T extends string, P extends Json>(
  action: T,
  payload: P,
  type: TaskType,
  status: TaskStatus = "waiting",
  error: string | null = null,
  result: Json | null = null,
): Promise<(TaskActionPayload<T, P> & { type: TaskType }) | null> {
  const now = new Date().toISOString();

  // Fetch user ID from Supabase authentication
  // const { data: { user }, error: userError } = await supabase.auth.getUser();
  // if (userError || !user) {
  //   logger.error("Failed to retrieve user ID:", userError?.message || "No user logged in");
  //   return null;
  // }

  // Create new task object
  const newTask: TaskActionPayload<T, P> & { type: TaskType } = {
    id: uuidv4(),
    job_id: uuidv4(),
    action,
    payload,
    status,
    type,
    created_at: now,
    updated_at: now,
    // user_id: user.id,
    user_id: "f7bebd3a-bafb-40fd-b60f-0ab18cac4dea",
    result,
    error,
  };

  // Insert into Supabase, casting newTask to the correct type
  const { error: supabaseError } = await supabase
    .from("tasks")
    .insert(newTask as any); // Casting here to bypass TS errors

  if (supabaseError) {
    logger.error(`Failed to insert task into Supabase:, ${JSON.stringify(supabaseError)}`);
    return null;
  }

  logger.info(`Task successfully inserted into Supabase: ${JSON.stringify(newTask)}`);
  return newTask;
}