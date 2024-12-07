"use server"

import { TaskQueueClient } from "../utils/task.server";

// Create Redis connection
const redisConfig = {
  host: "192.168.10.2",
  port: 6379,
};

export const sendMsg = async (message:string) => {
  // Client-side (just enqueueing)
  const client = new TaskQueueClient(redisConfig);
//   await client.enqueueTask("emails", {
//     type: "email",
//     action: "send",
//     data: { to: "user@example.com", message },
//   });
  await client.enqueueTask("message", {
    type: "message",
    action: "send",
    data: { message },
  });
};