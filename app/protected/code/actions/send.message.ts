"use server";

import { getInstance } from "@brainstack/inject";
import { TaskQueueClient } from "../../../../services/task-manager/src/task-queue/TaskQueueClient";
import { TaskFactory } from "../../../../services/task-manager/src/tasks/TaskFactory";
import { MessageInputTask } from "../../../../services/task-manager/src/processors/message/BaseMessageProcessor";

export const sendMsg = async (message: string) => {
  const client = getInstance(TaskQueueClient);
  // Using TaskFactory for type-safe task creation
  const messageInputTask = TaskFactory.create<MessageInputTask>("communication", "process-input", {
    message,
  });
  // const messageTask = TaskFactory.create("message", "send", {
  //   message,
  // });

  // const emailTask = TaskFactory.create("message", "email", {
  //   message,
  // });

  // Enqueue tasks
  await client.enqueueTask("message", messageInputTask);
  // await client.enqueueTask("message", messageTask);
  // await client.enqueueTask("message", emailTask);
};
