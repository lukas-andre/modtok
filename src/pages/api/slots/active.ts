import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

/**
 * GET /api/slots/active
 * Returns active slots for homepage display with rotation support
 *
 * Query params:
 * - slot_type: 'premium' | 'destacado' (optional, returns both if not specified)
 * - activeOn: YYYY-MM-DD date (optional, defaults to today)
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const url = new URL(request.url);

    const slotType = url.searchParams.get('slot_type') as 'premium' | 'destacado' | null;
    const activeOnParam = url.searchParams.get('activeOn');
    const activeOn = activeOnParam ? new Date(activeOnParam).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Build query for active slot orders
    let query = supabase
      .from('slot_orders')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', activeOn)
      .gte('end_date', activeOn)
      .order('rotation_order', { ascending: true });

    if (slotType) {
      query = query.eq('slot_type', slotType);
    }

    const { data: slotOrders, error } = await query;

    if (error) {
      console.error('Error fetching active slots:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Group slots by type and load content
    const slotsByType: Record<string, any[]> = {};

    for (const slotOrder of slotOrders || []) {
      if (!slotsByType[slotOrder.slot_type]) {
        slotsByType[slotOrder.slot_type] = [];
      }

      // Load content based on content_type
      let content = null;
      if (slotOrder.content_type && slotOrder.content_id) {
        const tableName = slotOrder.content_type === 'provider' ? 'providers'
          : slotOrder.content_type === 'house' ? 'houses'
          : 'service_products';

        const { data } = await supabase
          .from(tableName)
          .select('id, name, slug, main_image_url, description, tier, status')
          .eq('id', slotOrder.content_id)
          .single();

        content = data;
      }

      slotsByType[slotOrder.slot_type].push({
        ...slotOrder,
        content
      });
    }

    // Get slot_positions config to know how many to show
    const { data: slotPositions } = await supabase
      .from('slot_positions')
      .select('*');

    const positionsConfig = (slotPositions || []).reduce((acc: any, pos: any) => {
      acc[pos.slot_type] = pos.visible_count;
      return acc;
    }, {});

    // For each slot type, return only the visible_count slots
    // In a real implementation, this would rotate based on time or other criteria
    // For now, we just return the first N slots based on rotation_order
    const visibleSlots: Record<string, any[]> = {};

    for (const [slotType, orders] of Object.entries(slotsByType)) {
      const visibleCount = positionsConfig[slotType] || orders.length;
      visibleSlots[slotType] = orders.slice(0, visibleCount);
    }

    return new Response(
      JSON.stringify({
        slots: visibleSlots,
        config: positionsConfig,
        activeOn
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in GET /api/slots/active:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
