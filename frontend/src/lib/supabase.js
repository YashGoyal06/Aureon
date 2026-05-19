// frontend/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const missingSupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: new Error('Supabase environment variables are missing.') }),
    getUser: async () => ({ data: { user: null }, error: new Error('Supabase environment variables are missing.') }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase environment variables are missing.') }),
    signInWithOAuth: async () => ({ data: null, error: new Error('Supabase environment variables are missing.') }),
    signUp: async () => ({ data: null, error: new Error('Supabase environment variables are missing.') }),
    signOut: async () => ({ error: null }),
  },
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : missingSupabaseClient;
