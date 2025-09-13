import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, requireAdmin } from '@/lib/auth';

export const GET: APIRoute = async ({ request, cookies, params }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const auth = await getAdminAuth({ request, cookies });
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Contact setting ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: contact, error } = await supabase
      .from('contact_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: 'Contact setting not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ contact }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching contact setting:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const auth = await getAdminAuth({ request, cookies });
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Contact setting ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();

    const { data: contact, error } = await supabase
      .from('contact_settings')
      .update({
        setting_type: body.setting_type,
        title: body.title,
        value: body.value,
        extra_data: body.extra_data || {},
        is_active: body.is_active !== undefined ? body.is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update contact setting' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'update',
        target_type: 'contact_settings',
        target_id: id,
        changes: {
          setting_type: body.setting_type,
          title: body.title
        }
      });
    }

    return new Response(JSON.stringify({
      contact,
      message: 'Contact setting updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating contact setting:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const auth = await getAdminAuth({ request, cookies });
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Contact setting ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get contact info before deleting
    const { data: contact } = await supabase
      .from('contact_settings')
      .select('setting_type, title')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('contact_settings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete contact setting' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'delete',
        target_type: 'contact_settings',
        target_id: id,
        changes: {
          setting_type: contact?.setting_type,
          title: contact?.title
        }
      });
    }

    return new Response(JSON.stringify({
      message: 'Contact setting deleted successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting contact setting:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};