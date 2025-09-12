import { createSupabaseClient, getSession } from './supabase';
import type { Profile, UserRole } from './types';
import type { AstroCookies } from 'astro';

export interface AdminAuthResult {
  isAuthenticated: boolean;
  user: Profile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Get authenticated user with role information for admin areas
 */
export async function getAdminAuth(Astro: {
  request: Request;
  cookies: AstroCookies;
}): Promise<AdminAuthResult> {
  const supabase = createSupabaseClient(Astro);
  const session = await getSession(Astro);
  
  if (!session?.user) {
    return {
      isAuthenticated: false,
      user: null,
      isAdmin: false,
      isSuperAdmin: false
    };
  }

  // Get user profile with role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    return {
      isAuthenticated: true,
      user: null,
      isAdmin: false,
      isSuperAdmin: false
    };
  }

  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin';
  const isSuperAdmin = profile.role === 'super_admin';

  return {
    isAuthenticated: true,
    user: profile,
    isAdmin,
    isSuperAdmin
  };
}

/**
 * Redirect to login if not authenticated admin
 */
export function requireAdmin(auth: AdminAuthResult): Profile | never {
  if (!auth.isAuthenticated || !auth.isAdmin || !auth.user) {
    throw new Response('Unauthorized', { 
      status: 302, 
      headers: { Location: '/auth/login?redirect=/admin' } 
    });
  }
  return auth.user;
}

/**
 * Redirect to login if not authenticated super admin
 */
export function requireSuperAdmin(auth: AdminAuthResult): Profile | never {
  if (!auth.isAuthenticated || !auth.isSuperAdmin || !auth.user) {
    throw new Response('Unauthorized', { 
      status: 302, 
      headers: { Location: '/auth/login?redirect=/admin/super' } 
    });
  }
  return auth.user;
}

/**
 * Create a new admin user (only super_admin can do this)
 */
export async function createAdminUser(
  supabase: any,
  adminData: {
    email: string;
    full_name: string;
    temp_password: string;
    role: 'admin' | 'super_admin';
  }
) {
  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: adminData.email,
    password: adminData.temp_password,
    email_confirm: true,
  });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  // Update the profile with admin role and info
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: adminData.full_name,
      role: adminData.role,
      email_verified: true
    })
    .eq('id', authUser.user.id)
    .select()
    .single();

  if (profileError) {
    // Try to clean up the auth user if profile creation failed
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  return { user: authUser.user, profile };
}