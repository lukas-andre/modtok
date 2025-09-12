import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, createAdminUser } from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check if user is super admin
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Super admin access required.' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const formData = await request.json();
    const { email, full_name, role, temp_password } = formData;

    // Validation
    if (!email || !full_name || !role || !temp_password) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!['admin', 'super_admin'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (temp_password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create service role client for admin operations
    const supabaseAdmin = createSupabaseClient({ request, cookies });
    
    // Create the admin user
    const result = await createAdminUser(supabaseAdmin, {
      email,
      full_name,
      temp_password,
      role
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user created successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          full_name: result.profile.full_name,
          role: result.profile.role
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create admin user' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};