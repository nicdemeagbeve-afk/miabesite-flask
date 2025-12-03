"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabaseAuthClient } from '@/lib/supabase/auth-helpers';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  age: number | null;
  country: string | null;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  userId: string | null;
  instanceId: string | null;
  profile: UserProfile | null; // Added full profile object
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null); // State for full profile
  const [loading, setLoading] = useState(true);

  const fetchUserAndInstance = useCallback(async () => {
    setLoading(true);
    const { data: { user: fetchedUser } } = await supabaseAuthClient.auth.getUser();
    setUser(fetchedUser);
    setUserId(fetchedUser?.id || null);

    if (fetchedUser) {
      setInstanceId(fetchedUser.id);

      // Fetch user profile from profiles table
      const { data: profileData, error: profileError } = await supabaseAuthClient
        .from('profiles')
        .select('id, first_name, last_name, phone_number, age, country, role')
        .eq('id', fetchedUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for new users
        console.error('Error fetching user profile:', profileError); // Log the full error object
        setProfile(null);
      } else {
        setProfile({
          id: fetchedUser.id,
          first_name: profileData?.first_name || null,
          last_name: profileData?.last_name || null,
          phone_number: profileData?.phone_number || null,
          age: profileData?.age || null,
          country: profileData?.country || null,
          role: profileData?.role || 'user', // Default to 'user' if no role found
        });
      }
    } else {
      setInstanceId(null);
      setProfile(null);
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
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userId, instanceId, profile, loading, signOut }}>
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