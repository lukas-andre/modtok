import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.json();
  const { email, password, fullName, phone, role } = formData;

  if (!email || !password || !fullName) {
    return new Response(
      JSON.stringify({ error: 'Email, password, and full name are required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const supabase = createSupabaseClient({ request, cookies });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      data: {
        full_name: fullName,
        phone: phone || null,
        role: role || 'user',
      },
    },
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (data.user) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        requiresEmailVerification: !data.session,
        email: email 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return new Response(
    JSON.stringify({ error: 'Registration failed' }),
    { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};