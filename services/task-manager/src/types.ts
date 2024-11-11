import { Database } from "../../../supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskType = Database["public"]["Enums"]["task_type"]