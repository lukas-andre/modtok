import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.json();
  const { email, password } = formData;

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: 'Email and password are required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const supabase = createSupabaseClient({ request, cookies });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (data.session) {
    // The session is automatically handled by the Supabase SSR client
    return new Response(
      JSON.stringify({ success: true, redirect: '/dashboard' }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Login failed' }),
    { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};