import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from './database.types';

export function createSupabaseClient(
  cookies: AstroCookies,
  context: 'server' | 'client' = 'server'
) {
  return createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function getUser(cookies: AstroCookies) {
  const supabase = createSupabaseClient(cookies);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }
  
  return user;
}

export async function getSession(cookies: AstroCookies) {
  const supabase = createSupabaseClient(cookies);
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }
  
  return session;
}