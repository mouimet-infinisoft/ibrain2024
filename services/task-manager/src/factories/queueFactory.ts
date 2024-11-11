import { Queue } from "bullmq";
import type { Task } from "./taskFactory";

export const enqueueTaskFactory =
  (queue: Queue) => async (task: Task): Promise<void> => {
    await queue.add(task.id, task, {});
  };
