import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get query parameters for filtering
  const url = new URL(request.url);
  const role = url.searchParams.get('role') as 'super_admin' | 'admin' | 'provider' | 'user' | null;
  const status = url.searchParams.get('status') as 'active' | 'inactive' | 'suspended' | 'pending_verification' | null;
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (role) query = query.eq('role', role);
    if (status) query = query.eq('status', status);

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });

  // Check authentication and admin permission
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get current user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Only super admins can create users' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email || !body.full_name || !body.password) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: email, full_name, and password are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate password confirmation
    if (body.password !== body.password_confirm) {
      return new Response(JSON.stringify({
        errors: { password_confirm: 'Las contraseñas no coinciden' }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate password length
    if (body.password.length < 8) {
      return new Response(JSON.stringify({
        errors: { password: 'La contraseña debe tener al menos 8 caracteres' }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create auth user using admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: body.email_verified || false,
      user_metadata: {
        full_name: body.full_name,
        role: body.role || 'user'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new Response(JSON.stringify({
        error: authError.message || 'Failed to create user account'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare profile data
    const profileData = {
      id: authUser.user.id,
      email: body.email,
      full_name: body.full_name,
      phone: body.phone || null,
      rut: body.rut || null,
      company_name: body.company_name || null,
      website: body.website || null,
      bio: body.bio || null,
      avatar_url: body.avatar_url || null,
      role: body.role || 'user',
      status: body.status || 'active',
      email_verified: body.email_verified || false,
      phone_verified: body.phone_verified || false
    };

    // Insert into profiles table
    const { data: profileResult, error: profileError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw profileError;
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'create',
        target_type: 'user',
        target_id: authUser.user.id,
        changes: { created: profileData }
      });
    }

    return new Response(JSON.stringify(profileResult), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to create user'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Bulk operations
export const PUT: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check admin permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Only super admins can update users' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { ids, updates } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({
        error: 'Invalid request: ids array is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .in('id', ids)
      .select();

    if (error) {
      throw error;
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'bulk_update',
        target_type: 'user',
        changes: { ids, updates }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      updated: data.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating users:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to update users'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Bulk delete
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check admin permission
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Only super admins can delete users' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({
        error: 'Invalid request: ids array is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Don't allow deleting yourself
    if (ids.includes(user.id)) {
      return new Response(JSON.stringify({
        error: 'Cannot delete your own account'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete auth users first (admin API)
    for (const id of ids) {
      await supabase.auth.admin.deleteUser(id);
    }

    // Then delete profiles
    const { error } = await supabase
      .from('profiles')
      .delete()
      .in('id', ids);

    if (error) {
      throw error;
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'bulk_delete',
        target_type: 'user',
        changes: { ids }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      deleted: ids.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error deleting users:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to delete users'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
