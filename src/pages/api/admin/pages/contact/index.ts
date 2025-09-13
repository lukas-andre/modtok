import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, requireAdmin } from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
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

    const body = await request.json();

    // Get the highest display_order
    const { data: lastItem } = await supabase
      .from('contact_settings')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newDisplayOrder = (lastItem?.display_order || 0) + 1;

    const { data: contact, error } = await supabase
      .from('contact_settings')
      .insert({
        setting_type: body.setting_type,
        title: body.title,
        value: body.value,
        extra_data: body.extra_data || {},
        is_active: body.is_active !== undefined ? body.is_active : true,
        display_order: newDisplayOrder
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create contact setting' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'create',
        target_type: 'contact_settings',
        target_id: contact.id,
        changes: {
          setting_type: body.setting_type,
          title: body.title
        }
      });
    }

    return new Response(JSON.stringify({
      contact,
      message: 'Contact setting created successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating contact setting:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};