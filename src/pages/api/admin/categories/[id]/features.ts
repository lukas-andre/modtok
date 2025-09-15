import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ params, request }) => {
  const categoryId = params.id;
  const supabase = createSupabaseClient({ request } as any);

  try {
    // Get features for the specific category
    const { data: features, error } = await supabase
      .from('service_features')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(features || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching category features:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch features' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};