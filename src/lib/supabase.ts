import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = ((import.meta as any)?.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' ? process.env.SUPABASE_URL : '') || 'https://dyiswykbsoxrldwvjqdh.supabase.co';
export const SUPABASE_ANON_KEY = ((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : '') || 'sb_publishable_FRBNfPvMYqXFKjSAng7O5Q_Q1obrzY-';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
};

export const supabase = getSupabase();
