import { getInstance } from "@brainstack/inject";
import { TaskQueueClient } from "../src/task-queue/TaskQueueClient";
import { TaskFactory } from "../src/tasks/TaskFactory";

const run = async () => {
  const client = getInstance(TaskQueueClient);
  // Using TaskFactory for type-safe task creation
  const messageTask = TaskFactory.create("message", "send", {
    message: "testing hey ho",
  });

  const emailTask = TaskFactory.create("message", "email", {
    message: "EMAIL",
  });

  // Enqueue tasks
  await client.enqueueTask("message", messageTask);
  await client.enqueueTask("message", emailTask);
};

run().catch(console.error);
