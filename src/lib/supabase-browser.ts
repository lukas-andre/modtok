import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

// Create a browser-only Supabase client
// This is for use in client-side React components
export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}