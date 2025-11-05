import type { APIRoute } from 'astro';
import { createServerClient } from '@supabase/ssr';
import type { Database, ProfileInsert } from "@/lib/database.helpers";
import { getSupabaseEnv } from '@/lib/env';

export const POST: APIRoute = async ({ request, cookies }) => {
  const { access_token, refresh_token } = await request.json();

  if (!access_token || !refresh_token) {
    return new Response(JSON.stringify({ error: 'Missing tokens' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, options as any);
          });
        },
      },
    }
  );

  // Set the session with the provided tokens
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error || !data.session) {
    return new Response(JSON.stringify({ error: 'Failed to set session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get the user to create/update the profile
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If no profile exists, create one
    if (!existingProfile) {
      const profileData: ProfileInsert = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || null,
        role: user.user_metadata?.role || 'user',
        status: 'active',
        email_verified: user.email_confirmed_at ? true : false,
        phone_verified: false,
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};