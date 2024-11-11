"use server";
import { createTaskFactory } from "./factories/taskFactory";
import { enqueueTask } from "./queue";

// Define the specific payload structure for SEND_MESSAGE action
type SendMessagePayload = {
    message: string;
    conversationId: string;
};

async function createStateTaskSendMessageAI(
    conversationId: string,
    message: string,
) {
    // Create payload based on conversationId and message
    const payload: SendMessagePayload = { conversationId, message };

    // Call the generic createTaskFactory with the specific action and payload
    return await createTaskFactory(
        "SEND_MESSAGE",
        payload,
        "REALTIME",
        "waiting",
    );
}

export async function createTaskSendMessageAI(
    conversationId: string,
    message: string,
) {
    const stateTask = await createStateTaskSendMessageAI(
        conversationId,
        message,
    );
    enqueueTask(stateTask as any);
}
