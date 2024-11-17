"use server";
import { createClient } from "@supabase/supabase-js";
import { createTaskFactory } from "./factories/taskFactory";
import { enqueueTask } from "./queue";
import { revalidatePath } from "next/cache";

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
    const newTask = await createTaskFactory(
        "SEND_MESSAGE",
        payload,
        "REALTIME",
        "waiting",
    );

    if (!newTask) {
        throw new Error("Failed to create task");
    }

    return newTask;
}

export async function createTaskSendMessageAI(
    conversationId: string,
    message: string,
) {
    const supabase = createClient(
        "http://127.0.0.1:54321",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
    );

    await supabase.from("messages").insert({
        conversation_id: conversationId,
        content: message,
        role: "user",
    });
    revalidatePath("/protected/chat/[conversationId]", "page");
    
    const stateTask = await createStateTaskSendMessageAI(
        conversationId,
        message,
    );
    enqueueTask(stateTask as any);
}
