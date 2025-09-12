import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Create a browser-only Supabase client
// This is for use in client-side React components
export function createBrowserSupabaseClient() {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}