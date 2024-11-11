"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Conversation, Message } from "../lib/types";

export async function sendMessage(conversationId: string, formData: FormData) {
  const message = formData.get("message");

  if (!message || typeof message !== "string" || !conversationId) {
    throw new Error("Invalid message or conversation ID");
  }

  const supabase = await createClient();

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    content: message,
    role: "user",
  });

  revalidatePath(`/${conversationId}`);
}

export async function insertAssistantMessage(conversationId: string, content: string) {
  const supabase = await createClient();

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    content: content,
    role: "assistant",
  });

  revalidatePath(`/${conversationId}`);
}

export async function createConversation() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in");
  }

  const { data, error: insertError } = await supabase
    .from("conversations")
    .insert({ user_id: user.id })
    .select()
    .single();

  if (insertError) {
    throw new Error("Failed to create conversation: " + insertError.message);
  }

  revalidatePath("/protected/chat");
  return data;
}

export async function getConversations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false });

  return data as Conversation[];
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  console.log(`DATA GET_MESSAGES `, data);

  return data as Message[];
}

