import { Database } from "@/supabase/types"

export type Message = Database['public']['Tables']['messages']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type MessageChunk = Database['public']['Tables']['message_chunks']['Row']

