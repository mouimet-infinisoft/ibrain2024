import { Task } from './types';

export const processMessage = async (task: Task) => {
  if (task.action !== "SEND_MESSAGE") return;

  console.log("Sending message:", task.payload);
  return new Promise<typeof task>((resolve) => setTimeout(()=>{resolve(task)}, 1000));
};
