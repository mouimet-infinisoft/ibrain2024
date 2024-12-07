import { getInstance } from "@brainstack/inject";
import { TaskQueueClient } from "../src/TaskQueueClient"

const run = async () => {
  const client = getInstance(TaskQueueClient)
  await client.enqueueTask("message", {
    type: "message",
    action: "send",
    data: { message:"testing hey ho" },
  });
};

run().catch(console.error);
