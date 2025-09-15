import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const supabase = createSupabaseClient({ request } as any);

  try {
    // Get sub-categories for services (habilitacion_servicios)
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'habilitacion_servicios')
      .not('parent_id', 'is', null)
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};