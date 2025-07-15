import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  initialize: async () => {
    try {
      set({ loading: true });

      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ user: session?.user ?? null });

      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        set({ user: session?.user ?? null });
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
