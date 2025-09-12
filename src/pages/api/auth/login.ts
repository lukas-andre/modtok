import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
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
    // Get user profile to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    // Determine redirect URL based on role and query params
    const isAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin';
    const redirectParam = url.searchParams.get('redirect');
    const isAdminRequest = url.searchParams.get('admin') === 'true';
    
    let redirectUrl = '/dashboard';
    
    if (isAdminRole && (isAdminRequest || redirectParam?.startsWith('/admin'))) {
      redirectUrl = redirectParam || '/admin';
    } else if (redirectParam && !redirectParam.startsWith('/admin')) {
      redirectUrl = redirectParam;
    }

    return new Response(
      JSON.stringify({ success: true, redirect: redirectUrl }),
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