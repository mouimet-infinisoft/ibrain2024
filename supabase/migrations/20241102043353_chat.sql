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
