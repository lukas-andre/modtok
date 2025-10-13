import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, requireAdmin } from '@/lib/auth';

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies } as any);
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { type, id } = params;

    if (!type || !id) {
      return new Response(JSON.stringify({ error: 'Type and ID are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate type
    if (!['provider', 'house', 'service_product'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseClient({ request, cookies } as any);
    const body = await request.json();

    // Build update object (only editorial flags)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.has_quality_images !== undefined) {
      updateData.has_quality_images = body.has_quality_images;
    }
    if (body.has_complete_info !== undefined) {
      updateData.has_complete_info = body.has_complete_info;
    }
    if (body.editor_approved_for_premium !== undefined) {
      updateData.editor_approved_for_premium = body.editor_approved_for_premium;
    }

    // Determine table name
    let tableName = '';
    let entityType = '';
    if (type === 'provider') {
      tableName = 'providers';
      entityType = 'provider';
    } else if (type === 'house') {
      tableName = 'houses';
      entityType = 'house';
    } else if (type === 'service_product') {
      tableName = 'service_products';
      entityType = 'service_product';
    }

    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating editorial flags:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (user.id) {
      const flagsUpdated = Object.keys(updateData).filter(k => k !== 'updated_at').join(', ');
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'update',
        entity_type: entityType,
        entity_id: id,
        description: `Updated editorial flags: ${flagsUpdated}`
      });
    }

    return new Response(JSON.stringify({ item: data, message: 'Editorial flags updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/editorial/[type]/[id]:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
