#!/bin/bash

# Exit on any error
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting chat feature scaffolding...${NC}"

# Base directory - adjust this if needed
BASE_DIR="./app/protected/chat"

# Create directory structure
echo -e "${GREEN}Creating directory structure...${NC}"
mkdir -p "$BASE_DIR"/{[conversationId],components/{chat,ui},actions,lib}

# Create necessary files with their content

# Types file
cat > "$BASE_DIR/lib/types.ts" << 'EOL'
export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: string
  conversationId: string
}

export interface Conversation {
  id: string
  userId: string
  createdAt: string
  lastMessageAt: string
}

export interface MessageChunk {
  id: string
  content: string
  role: 'assistant'
  conversationId: string
  createdAt: string
}
EOL

# Database utilities
cat > "$BASE_DIR/lib/db.ts" << 'EOL'
import { createServerClient } from '@/lib/supabase/server';
import { Message, Conversation, MessageChunk } from './types';

export async function getMessages(conversationId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at');
  
  return data as Message[];
}

export async function getConversations() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false });
  
  return data as Conversation[];
}

export async function getMessageStream(conversationId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('message_chunks')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at');
  
  return data as MessageChunk[];
}
EOL

# AI integration
cat > "$BASE_DIR/lib/ai.ts" << 'EOL'
export async function* streamAIResponse(message: string) {
  // Replace with your actual AI model integration
  const chunks = message.split(' ').map(word => word + ' ');
  for (const chunk of chunks) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate streaming
    yield chunk;
  }
}
EOL

# Server Actions
cat > "$BASE_DIR/actions/chat-actions.ts" << 'EOL'
'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { streamAIResponse } from '../lib/ai';

export async function sendMessage(formData: FormData) {
  const message = formData.get('message');
  const conversationId = formData.get('conversationId');
  
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message');
  }
  
  const supabase = createServerClient();
  
  // Store user message
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    content: message,
    role: 'user'
  });
  
  // Stream and store AI response
  const stream = await streamAIResponse(message);
  for await (const chunk of stream) {
    await supabase.from('message_chunks').insert({
      conversation_id: conversationId,
      content: chunk,
      role: 'assistant'
    });
  }
  
  revalidatePath(`/protected/chat/${conversationId}`);
}

export async function createConversation() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('conversations')
    .insert({})
    .select()
    .single();
    
  revalidatePath('/protected/chat');
  return data;
}
EOL

# Chat Components
cat > "$BASE_DIR/components/chat/chat-input.tsx" << 'EOL'
'use client';

import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';

export function ChatInput({ 
  conversationId 
}: { 
  conversationId: string 
}) {
  const { pending } = useFormStatus();

  return (
    <form 
      action={async (formData) => {
        formData.append('conversationId', conversationId);
        await sendMessage(formData);
      }}
      className="flex items-center gap-2 p-4 border-t"
    >
      <Input
        name="message"
        placeholder="Type a message..."
        disabled={pending}
        className="flex-1"
      />
      <Button type="submit" disabled={pending}>
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}
EOL

cat > "$BASE_DIR/components/chat/chat-stream.tsx" << 'EOL'
import { getMessageStream } from '../../lib/db';

export async function ChatStream({
  conversationId
}: {
  conversationId: string
}) {
  const stream = await getMessageStream(conversationId);
  
  return (
    <div className="space-y-2">
      {stream.map(chunk => (
        <div
          key={chunk.id}
          className="p-2 rounded bg-muted text-sm"
        >
          {chunk.content}
        </div>
      ))}
    </div>
  );
}
EOL

cat > "$BASE_DIR/components/chat/message-list.tsx" << 'EOL'
import { Message } from '../../lib/types';
import { MessageItem } from './message-item';

export function MessageList({
  messages
}: {
  messages: Message[]
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
EOL

cat > "$BASE_DIR/components/chat/message-item.tsx" << 'EOL'
import { Message } from '../../lib/types';
import { cn } from '@/lib/utils';

export function MessageItem({
  message
}: {
  message: Message
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg max-w-[80%]",
        message.role === "user" 
          ? "bg-primary text-primary-foreground ml-auto" 
          : "bg-muted"
      )}
    >
      {message.content}
    </div>
  );
}
EOL

# UI Components
cat > "$BASE_DIR/components/ui/empty-state.tsx" << 'EOL'
import { MessageSquare } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-2">
      <MessageSquare className="h-12 w-12 text-muted-foreground" />
      <h3 className="font-semibold text-lg">No messages yet</h3>
      <p className="text-sm text-muted-foreground">
        Send a message to start the conversation
      </p>
    </div>
  );
}
EOL

cat > "$BASE_DIR/components/ui/loading-skeleton.tsx" << 'EOL'
import { Skeleton } from '@/components/ui/skeleton';

export function MessageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton 
          key={i}
          className="h-14 w-[80%]"
          style={{
            marginLeft: i % 2 === 0 ? 'auto' : '0'
          }}
        />
      ))}
    </div>
  );
}
EOL

# Pages
cat > "$BASE_DIR/page.tsx" << 'EOL'
import { Suspense } from 'react';
import { getConversations } from './lib/db';
import { Button } from '@/components/ui/button';
import { createConversation } from './actions/chat-actions';
import { MessageSquarePlus } from 'lucide-react';

export default async function ChatHomePage() {
  const conversations = await getConversations();

  return (
    <div className="container max-w-4xl py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Conversations</h1>
        <form action={createConversation}>
          <Button>
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </form>
      </div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <div className="space-y-2">
          {conversations.map(conversation => (
            <Button
              key={conversation.id}
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <a href={`/protected/chat/${conversation.id}`}>
                Chat {new Date(conversation.createdAt).toLocaleDateString()}
              </a>
            </Button>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
EOL

cat > "$BASE_DIR/[conversationId]/page.tsx" << 'EOL'
import { Suspense } from 'react';
import { getMessages } from '../lib/db';
import { MessageList } from '../components/chat/message-list';
import { ChatStream } from '../components/chat/chat-stream';
import { ChatInput } from '../components/chat/chat-input';
import { EmptyState } from '../components/ui/empty-state';
import { MessageSkeleton } from '../components/ui/loading-skeleton';

export default async function ChatPage({
  params: { conversationId }
}: {
  params: { conversationId: string }
}) {
  const messages = await getMessages(conversationId);
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <MessageList messages={messages} />
            <Suspense fallback={<MessageSkeleton />}>
              <ChatStream conversationId={conversationId} />
            </Suspense>
          </>
        )}
      </div>
      <ChatInput conversationId={conversationId} />
    </div>
  );
}
EOL

cat > "$BASE_DIR/[conversationId]/loading.tsx" << 'EOL'
import { MessageSkeleton } from '../components/ui/loading-skeleton';

export default function Loading() {
  return <MessageSkeleton />;
}
EOL

cat > "$BASE_DIR/[conversationId]/error.tsx" << 'EOL'
'use client';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message}
      </AlertDescription>
    </Alert>
  );
}
EOL

# Create SQL file for database setup
cat > "$BASE_DIR/schema.sql" << 'EOL'
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Conversations table
create table conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations on delete cascade not null,
  content text not null,
  role text not null check (role in ('user', 'assistant')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Message chunks for streaming
create table message_chunks (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations on delete cascade not null,
  content text not null,
  role text not null check (role in ('assistant')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table conversations enable row level security;
alter table messages enable row level security;
alter table message_chunks enable row level security;

-- RLS Policies
create policy "Users can view own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can view messages in own conversations"
  on messages for select
  using (
    exists (
      select 1
      from conversations
      where id = messages.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own conversations"
  on messages for insert
  with check (
    exists (
      select 1
      from conversations
      where id = conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Users can view message chunks in own conversations"
  on message_chunks for select
  using (
    exists (
      select 1
      from conversations
      where id = message_chunks.conversation_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert message chunks in own conversations"
  on message_chunks for insert
  with check (
    exists (
      select 1
      from conversations
      where id = conversation_id
      and user_id = auth.uid()
    )
  );
EOL

echo -e "${GREEN}Chat feature scaffolding complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run the schema.sql file in your Supabase project"
echo "2. Make sure @/components/ui components are installed from shadcn/ui"
echo "3. Update the AI integration in lib/ai.ts with your actual AI model"
echo "4. Test the feature by creating a new conversation"