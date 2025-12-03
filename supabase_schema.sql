-- Table: profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  role text default 'user' not null, -- New role column
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- This trigger automatically creates a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Table: conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  instance_id text not null,
  contact_name text,
  contact_number text not null,
  last_activity timestamp with time zone default now(),
  status text default 'En cours' not null,
  unread_messages integer default 0 not null,
  created_at timestamp with time zone default now()
);

alter table conversations enable row level security;

create policy "Users can view their own conversations."
  on conversations for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own conversations."
  on conversations for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own conversations."
  on conversations for update
  using ( auth.uid() = user_id );

create unique index on conversations (instance_id, contact_number);

-- Table: messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations on delete cascade not null,
  sender text not null, -- 'client' or 'ai'
  text text not null,
  timestamp timestamp with time zone default now(),
  evolution_message_id text -- Unique ID from Evolution API
);

alter table messages enable row level security;

create policy "Users can view messages in their conversations."
  on messages for select
  using (
    (select user_id from conversations where id = conversation_id) = auth.uid()
  );

create policy "Users can insert messages in their conversations."
  on messages for insert
  with check (
    (select user_id from conversations where id = conversation_id) = auth.uid()
  );

-- Table: ai_prompts
create table ai_prompts (
  instance_id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  main_prompt text,
  updated_at timestamp with time zone default now()
);

alter table ai_prompts enable row level security;

create policy "Users can view their own AI prompts."
  on ai_prompts for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own AI prompts."
  on ai_prompts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own AI prompts."
  on ai_prompts for update
  using ( auth.uid() = user_id );