import { Queue } from "bullmq";
import { Task } from "../types";

export const enqueueTaskFactory =
  (queue: Queue) => async (task: Task): Promise<void> => {
    await queue.add(task.id, task, {jobId:task.id});
  };
