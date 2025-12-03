-- Create a table for public profiles (optional, but good practice)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using (true);

create policy "Users can insert their own profile."
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update
  using (auth.uid() = id);

-- Create the conversations table
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  instance_id text not null, -- Evolution API instance ID
  contact_name text,
  contact_number text not null,
  last_activity timestamp with time zone default now(),
  status text default 'En cours', -- 'En cours', 'Clôturé', 'Non-répondu'
  unread_messages integer default 0,
  created_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS) for conversations
alter table conversations enable row level security;

create policy "Users can view their own conversations."
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own conversations."
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations."
  on conversations for update
  using (auth.uid() = user_id);

-- Create the messages table
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations on delete cascade not null,
  sender text not null, -- 'client' or 'ai'
  text text not null,
  timestamp timestamp with time zone default now(),
  evolution_message_id text unique, -- Unique ID from Evolution API for incoming messages
  created_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS) for messages
alter table messages enable row level security;

create policy "Users can view messages in their conversations."
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages into their conversations."
  on messages for insert
  with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Create the ai_prompts table
create table ai_prompts (
  instance_id text primary key, -- Evolution API instance ID, also used as user_id for simplicity
  user_id uuid references auth.users on delete cascade not null,
  main_prompt text,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS) for ai_prompts
alter table ai_prompts enable row level security;

create policy "Users can view their own AI prompts."
  on ai_prompts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own AI prompts."
  on ai_prompts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own AI prompts."
  on ai_prompts for update
  using (auth.uid() = user_id);