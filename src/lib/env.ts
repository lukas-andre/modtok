/**
 * Utility to get environment variables that works both at build time and runtime
 * For server-side: checks process.env first (Railway runtime), then import.meta.env (local dev)
 * For client-side: uses import.meta.env (these are replaced at build time)
 */

export function getEnvVariable(key: string): string | undefined {
  // Server-side: Check runtime env first, then build-time env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || (import.meta.env as any)[key];
  }
  // Client-side: Only build-time env is available
  return (import.meta.env as any)[key];
}

export function getSupabaseEnv() {
  const supabaseUrl = getEnvVariable('PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getEnvVariable('PUBLIC_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return {
    supabaseUrl,
    supabaseAnonKey
  };
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return getEnvVariable('SUPABASE_SERVICE_ROLE_KEY');
}