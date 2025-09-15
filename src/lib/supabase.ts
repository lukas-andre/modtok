import { createServerClient, parseCookieHeader, type CookieOptions } from '@supabase/ssr';
import type { Database } from './database.types';
import type { AstroCookies } from 'astro';

export function createSupabaseClient(Astro: {
  request: Request;
  cookies: AstroCookies;
}) {
  // Try runtime env first (for production), then build-time env (for development)
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          const parsed = parseCookieHeader(Astro.request.headers.get('Cookie') ?? '');
          // Filter out cookies with undefined values and ensure all have string values
          return parsed
            .filter(cookie => cookie.value !== undefined)
            .map(cookie => ({
              name: cookie.name,
              value: cookie.value as string
            }));
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            Astro.cookies.set(name, value, options as any);
          });
        },
      },
    }
  );
}

export async function getUser(Astro: {
  request: Request;
  cookies: AstroCookies;
}) {
  const supabase = createSupabaseClient(Astro);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function getSession(Astro: {
  request: Request;
  cookies: AstroCookies;
}) {
  const supabase = createSupabaseClient(Astro);
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }
  
  return session;
}

// Export the Database type for use in other files
export type { Database };