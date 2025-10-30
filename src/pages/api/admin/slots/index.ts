import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, requireAdmin } from '@/lib/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies } as any);
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseClient({ request, cookies } as any);
    const url = new URL(request.url);

    // Filters
    const slotType = url.searchParams.get('slot_type') as 'premium' | 'destacado' | 'standard' | null;
    const isActive = url.searchParams.get('is_active');
    const contentType = url.searchParams.get('content_type') as 'provider' | 'house' | 'service_product' | null;

    let query = supabase
      .from('slot_orders')
      .select('*')
      .order('slot_type', { ascending: true })
      .order('rotation_order', { ascending: true });

    if (slotType) {
      query = query.eq('slot_type', slotType);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data: slots, error } = await query;

    if (error) {
      console.error('Error fetching slots:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load content for each slot
    const slotsWithContent = await Promise.all(
      (slots || []).map(async (slot) => {
        if (!slot.content_type || !slot.content_id) {
          return slot;
        }

        let content = null;

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

        return {
          ...slot,
          content
        };
      })
    );

    return new Response(JSON.stringify({ slots: slotsWithContent }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/slots:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies } as any);
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseClient({ request, cookies } as any);
    const body = await request.json();

    // Validate required fields
    if (!body.slot_type || !body.start_date || !body.end_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate slot_type
    if (!['premium', 'destacado', 'standard'].includes(body.slot_type)) {
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

    // Validate date range
    if (new Date(body.end_date) < new Date(body.start_date)) {
      return new Response(JSON.stringify({ error: 'End date must be after start date' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: slot, error } = await supabase
      .from('slot_orders')
      .insert({
        slot_type: body.slot_type,
        content_type: body.content_type || null,
        content_id: body.content_id || null,
        monthly_price: body.monthly_price || null,
        start_date: body.start_date,
        end_date: body.end_date,
        rotation_order: body.rotation_order || 0,
        is_active: body.is_active !== false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating slot:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (user.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'create',
        entity_type: 'slot_order',
        entity_id: slot.id,
        description: `Created ${body.slot_type} slot order`
      });
    }

    return new Response(JSON.stringify({ slot, message: 'Slot created successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/admin/slots:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
