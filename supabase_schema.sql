-- Table des conversations
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- L'ID de l'utilisateur de votre SaaS (ex: "user_123")
    instance_id TEXT NOT NULL, -- L'ID de l'instance Evolution API
    contact_name TEXT NOT NULL,
    contact_number TEXT NOT NULL, -- Numéro de téléphone du contact
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
    status TEXT DEFAULT 'En cours', -- 'En cours', 'Clôturé', 'Non-répondu'
    unread_messages INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances de recherche par user_id et instance_id
CREATE INDEX idx_conversations_user_id ON public.conversations (user_id);
CREATE INDEX idx_conversations_instance_id ON public.conversations (instance_id);
CREATE INDEX idx_conversations_contact_number ON public.conversations (contact_number);


-- Table des messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'client' ou 'ai'
    text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    evolution_message_id TEXT UNIQUE, -- ID du message de l'API Evolution pour éviter les doublons
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour améliorer les performances de recherche par conversation_id
CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX idx_messages_evolution_message_id ON public.messages (evolution_message_id);

-- RLS (Row Level Security) pour les tables (à adapter selon votre logique d'authentification)
-- Pour l'instant, nous allons les désactiver pour faciliter le développement,
-- mais il est CRUCIAL de les activer et de les configurer correctement en production.

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Exemple de politique RLS (à adapter)
-- CREATE POLICY "Users can view their own conversations." ON public.conversations
--   FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert their own conversations." ON public.conversations
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update their own conversations." ON public.conversations
--   FOR UPDATE USING (auth.uid() = user_id);

-- CREATE POLICY "Users can view messages in their conversations." ON public.messages
--   FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND auth.uid() = user_id));
-- CREATE POLICY "Users can insert messages in their conversations." ON public.messages
--   FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND auth.uid() = user_id));