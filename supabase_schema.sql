-- Activer l'extension uuid-ossp pour la génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs (pour lier aux instances et abonnements)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour mettre à jour le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la table users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table des proxies (pour gérer les adresses IP des instances)
CREATE TABLE public.proxies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  protocol TEXT NOT NULL, -- ex: 'http', 'https', 'socks5'
  username TEXT,
  password TEXT,
  status TEXT DEFAULT 'active' NOT NULL, -- ex: 'active', 'banned', 'inactive'
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour la table proxies
CREATE TRIGGER update_proxies_updated_at
BEFORE UPDATE ON public.proxies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table des instances (chaque instance WhatsApp d'un utilisateur)
CREATE TABLE public.instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  instance_name TEXT UNIQUE NOT NULL, -- L'ID unique de l'instance dans l'API Evolution (ex: user_123)
  token TEXT NOT NULL, -- Token API pour l'instance
  webhook_url TEXT,
  connection_state TEXT DEFAULT 'disconnected' NOT NULL, -- 'open', 'connecting', 'disconnected'
  last_connection_time TIMESTAMP WITH TIME ZONE,
  proxy_id UUID REFERENCES public.proxies(id) ON DELETE SET NULL, -- Proxy associé à cette instance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour la table instances
CREATE TRIGGER update_instances_updated_at
BEFORE UPDATE ON public.instances
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table des abonnements (pour les plans des utilisateurs)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan_name TEXT NOT NULL, -- ex: 'Basic', 'Standard', 'Premium'
  status TEXT DEFAULT 'active' NOT NULL, -- ex: 'active', 'inactive', 'cancelled'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour la table subscriptions
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Table de l'historique des chats (pour stocker les messages)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id UUID REFERENCES public.instances(id) ON DELETE CASCADE NOT NULL,
  contact_number TEXT NOT NULL, -- Numéro WhatsApp du contact
  sender TEXT NOT NULL, -- 'client' ou 'ai'
  message_text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration de la sécurité (Row Level Security - RLS)
-- Activez RLS pour les tables où les utilisateurs ne doivent voir que leurs propres données.
-- Exemple pour la table 'instances' :

ALTER TABLE public.instances ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'insérer leurs propres instances
CREATE POLICY "Users can insert their own instances." ON public.instances
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de voir leurs propres instances
CREATE POLICY "Users can view their own instances." ON public.instances
FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres instances
CREATE POLICY "Users can update their own instances." ON public.instances
FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres instances
CREATE POLICY "Users can delete their own instances." ON public.instances
FOR DELETE USING (auth.uid() = user_id);

-- RLS pour la table 'chat_messages' (les utilisateurs ne voient que les messages de leurs instances)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat messages." ON public.chat_messages
FOR SELECT USING (EXISTS (SELECT 1 FROM public.instances WHERE id = instance_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert chat messages for their instances." ON public.chat_messages
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.instances WHERE id = instance_id AND user_id = auth.uid()));

-- RLS pour la table 'subscriptions' (les utilisateurs ne voient que leur propre abonnement)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription." ON public.subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription." ON public.subscriptions
FOR UPDATE USING (auth.uid() = user_id);

-- RLS pour la table 'users' (les utilisateurs peuvent voir leur propre profil)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own user profile." ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own user profile." ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Pour les administrateurs, vous devrez créer des politiques RLS spécifiques
-- ou utiliser un rôle d'administrateur qui contourne RLS (via `security invoker` ou `security definer` sur des fonctions).
-- Pour l'instant, les tables `users` et `proxies` n'ont pas de RLS restrictif pour les opérations admin.
-- Si vous avez un rôle admin dans Supabase, vous pouvez ajouter des politiques comme :
-- CREATE POLICY "Admins can view all proxies" ON public.proxies FOR SELECT TO admin_role USING (TRUE);