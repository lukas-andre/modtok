import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

/**
 * GET /api/visibility/effective
 * Wrapper for catalog_visibility_effective view
 * Returns effective tier (editorial + active slots) for entities
 *
 * Query params:
 * - type: 'provider' | 'house' | 'service_product' (required)
 * - ids: comma-separated UUIDs (optional, returns all if not specified)
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const url = new URL(request.url);

    const entityType = url.searchParams.get('type') as 'provider' | 'house' | 'service_product' | null;
    const idsParam = url.searchParams.get('ids');

    if (!entityType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['provider', 'house', 'service_product'].includes(entityType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be: provider, house, or service_product' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build query
    let query = supabase
      .from('catalog_visibility_effective')
      .select('*')
      .eq('entity_type', entityType);

    // Filter by IDs if provided
    if (idsParam) {
      const ids = idsParam.split(',').map(id => id.trim());
      query = query.in('entity_id', ids);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching effective visibility:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Transform to more convenient format
    const visibility = (data || []).reduce((acc: any, item: any) => {
      acc[item.entity_id] = item.effective_tier;
      return acc;
    }, {});

    return new Response(
      JSON.stringify({
        type: entityType,
        visibility,
        count: data?.length || 0
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in GET /api/visibility/effective:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
