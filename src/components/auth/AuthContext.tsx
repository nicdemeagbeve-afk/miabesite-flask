"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabaseAuthClient } from '@/lib/supabase/auth-helpers';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  userId: string | null;
  instanceId: string | null; // The Evolution API instance ID associated with the user
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
      // In a real app, you'd fetch the user's Evolution API instance ID from your database
      // For now, we'll use the Supabase user ID as the instance ID for simplicity,
      // assuming a 1:1 mapping for this demo.
      // You might have a 'profiles' table or 'instances' table linked to user_id.
      setInstanceId(fetchedUser.id); // Using Supabase user ID as instance ID
    } else {
      setInstanceId(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUserAndInstance();

    const { data: authListener } = supabaseAuthClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          fetchUserAndInstance();
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
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