export type TaskStatus = "waiting" | "active" | "completed" | "failed";
export type TaskType = "REALTIME" | "BACKGROUND";

export type TaskAction = 
  | "SEND_MESSAGE"
  | "ANALYZE_MESSAGE"
  | "GENERATE_CODE"
  | "RESEARCH";

type Json = Record<string, unknown> | Json[] | string | number | boolean | null;

type BaseTask = {
  id: string;
  job_id: string;
  status: TaskStatus;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  result: Json | null;
  error: string | null;
  parentTaskId?: string;
};

export type SendMessagePayload = {
  message: string;
  conversationId: string;
  sender?: string;
};

export type AnalyzePayload = {
  message: string;
  conversationId: string;
};

export type GenerateCodePayload = {
  prompt: string;
  conversationId: string;
  language?: string;
};

export type ResearchPayload = {
  query: string;
  conversationId: string;
};

type TaskPayload = 
  | SendMessagePayload 
  | AnalyzePayload 
  | GenerateCodePayload 
  | ResearchPayload;

export type TaskActionPayload<T extends TaskAction, P extends Json> = BaseTask & {
  action: T;
  payload: P;
};

export type Task = TaskActionPayload<TaskAction, TaskPayload> & {
  type: TaskType;
};

export interface StreamMessage {
  action: "talk" | "background_update";
  payload: string;
  status?: "streaming" | "complete";
  isStreaming?: boolean;
  isComplete?: boolean;
  chunk?: string;
  taskType?: TaskType;
  backgroundType?: "code" | "research";
}
