import { createClient } from "@/utils/supabase/server";
import { Conversation, Message, MessageChunk } from "./types";

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

export async function getConversations() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .order("last_message_at", { ascending: false });

  return data as Conversation[];
}
