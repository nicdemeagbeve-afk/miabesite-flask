"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabaseAuthClient } from '@/lib/supabase/auth-helpers';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  userId: string | null;
  instanceId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAndInstance = useCallback(async () => {
    setLoading(true);
    const { data: { user: fetchedUser } } = await supabaseAuthClient.auth.getUser();
    setUser(fetchedUser);
    setUserId(fetchedUser?.id || null);

    if (fetchedUser) {
      setInstanceId(fetchedUser.id);
    } else {
      setInstanceId(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUserAndInstance();

    const { data: authListener } = supabaseAuthClient.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          fetchUserAndInstance();
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchUserAndInstance]);

  const signOut = async () => {
    const { error } = await supabaseAuthClient.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion.");
      console.error("Error signing out:", error);
    } else {
      toast.success("Déconnexion réussie.");
      setUser(null);
      setUserId(null);
      setInstanceId(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userId, instanceId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}