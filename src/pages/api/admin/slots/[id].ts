import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, requireAdmin } from '@/lib/auth';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies } as any);
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Slot ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseClient({ request, cookies } as any);

    const { data: slot, error } = await supabase
      .from('homepage_slots')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !slot) {
      return new Response(JSON.stringify({ error: 'Slot not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load associated content
    let content = null;

    if (slot.content_type && slot.content_id) {
      if (slot.content_type === 'provider') {
        const { data } = await supabase
          .from('providers')
          .select('id, name, main_image_url, slug')
          .eq('id', slot.content_id)
          .single();
        content = data;
      } else if (slot.content_type === 'house') {
        const { data } = await supabase
          .from('houses')
          .select('id, name, main_image_url, slug')
          .eq('id', slot.content_id)
          .single();
        content = data;
      } else if (slot.content_type === 'service_product') {
        const { data } = await supabase
          .from('service_products')
          .select('id, name, main_image_url, slug')
          .eq('id', slot.content_id)
          .single();
        content = data;
      }
    }

    return new Response(JSON.stringify({
      slot: { ...slot, content }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/slots/[id]:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

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

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Slot ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseClient({ request, cookies } as any);
    const body = await request.json();

    // Validate slot_type if provided
    if (body.slot_type && !['premium', 'destacado', 'standard'].includes(body.slot_type)) {
      return new Response(JSON.stringify({ error: 'Invalid slot_type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate content_type if provided
    if (body.content_type && !['provider', 'house', 'service_product'].includes(body.content_type)) {
      return new Response(JSON.stringify({ error: 'Invalid content_type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate date range if both dates provided
    if (body.start_date && body.end_date && new Date(body.end_date) < new Date(body.start_date)) {
      return new Response(JSON.stringify({ error: 'End date must be after start date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.slot_position !== undefined) updateData.slot_position = body.slot_position;
    if (body.slot_type !== undefined) updateData.slot_type = body.slot_type;
    if (body.content_type !== undefined) updateData.content_type = body.content_type || null;
    if (body.content_id !== undefined) updateData.content_id = body.content_id || null;
    if (body.monthly_price !== undefined) updateData.monthly_price = body.monthly_price || null;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.rotation_order !== undefined) updateData.rotation_order = body.rotation_order;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data: slot, error } = await supabase
      .from('homepage_slots')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating slot:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!slot) {
      return new Response(JSON.stringify({ error: 'Slot not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (user.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'update',
        entity_type: 'homepage_slot',
        entity_id: slot.id,
        description: `Updated ${slot.slot_type} slot`
      });
    }

    return new Response(JSON.stringify({ slot, message: 'Slot updated successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/slots/[id]:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies } as any);
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Slot ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseClient({ request, cookies } as any);

    // Get slot info before deletion for logging
    const { data: slotInfo } = await supabase
      .from('homepage_slots')
      .select('slot_type, slot_position')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('homepage_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting slot:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (user.id && slotInfo) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'delete',
        entity_type: 'homepage_slot',
        entity_id: id,
        description: `Deleted ${slotInfo.slot_type} slot at position ${slotInfo.slot_position}`
      });
    }

    return new Response(JSON.stringify({ message: 'Slot deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/slots/[id]:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
