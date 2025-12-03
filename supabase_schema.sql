-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_ai_prompts_updated_at ON public.ai_prompts;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own AI prompts." ON public.ai_prompts;
DROP POLICY IF EXISTS "Users can update their own AI prompts." ON public.ai_prompts;
DROP POLICY IF EXISTS "Users can insert their own AI prompts." ON public.ai_prompts;

DROP POLICY IF EXISTS "Users can view their own conversations." ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations." ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations." ON public.conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations." ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages into their conversations." ON public.messages;

-- Drop tables if they exist (order matters due to foreign keys)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.ai_prompts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create the profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NULL,
  last_name text NULL,
  phone_number text NULL,
  age integer NULL,
  country text NULL,
  role text NULL DEFAULT 'user'::text, -- 'user' or 'admin'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS) for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read their own profile
CREATE POLICY "Users can view their own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy to allow authenticated users to insert their own profile (during signup)
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create the ai_prompts table
CREATE TABLE public.ai_prompts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  instance_id text NOT NULL UNIQUE, -- Corresponds to userId
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  main_prompt text NULL,
  ignore_group_messages boolean NULL DEFAULT false,
  always_online boolean NULL DEFAULT false,
  reject_calls boolean NULL DEFAULT false,
  reject_call_message text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_prompts_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS) for the ai_prompts table
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read their own AI prompts
CREATE POLICY "Users can view their own AI prompts." ON public.ai_prompts
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow authenticated users to update their own AI prompts
CREATE POLICY "Users can update their own AI prompts." ON public.ai_prompts
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow authenticated users to insert their own AI prompts
CREATE POLICY "Users can insert their own AI prompts." ON public.ai_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create the conversations table
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id text NOT NULL, -- Corresponds to Evolution API instanceId
  contact_name text NULL,
  contact_number text NOT NULL,
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  status text NULL DEFAULT 'En cours'::text, -- 'En cours', 'Clôturé', 'Non-répondu'
  unread_messages integer NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT unique_instance_contact UNIQUE (instance_id, contact_number)
);

-- Enable Row Level Security (RLS) for the conversations table
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read their own conversations
CREATE POLICY "Users can view their own conversations." ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow authenticated users to update their own conversations
CREATE POLICY "Users can update their own conversations." ON public.conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow authenticated users to insert their own conversations
CREATE POLICY "Users can insert their own conversations." ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create the messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender text NOT NULL, -- 'client' or 'ai'
  text text NOT NULL,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  evolution_message_id text NULL UNIQUE, -- Unique ID from Evolution API for external messages
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS) for the messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read messages in their conversations
CREATE POLICY "Users can view messages in their conversations." ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
  );

-- Policy to allow authenticated users to insert messages into their conversations
CREATE POLICY "Users can insert messages into their conversations." ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
  );

-- Set up trigger for updated_at column on profiles, ai_prompts, conversations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_prompts_updated_at
BEFORE UPDATE ON public.ai_prompts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();