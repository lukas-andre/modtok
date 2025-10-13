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
    const type = url.searchParams.get('type') as 'provider' | 'house' | 'service_product' | 'all' | null;
    const status = url.searchParams.get('status') as 'pending' | 'approved' | 'needs_review' | 'all' | null;
    const tier = url.searchParams.get('tier');

    const items: any[] = [];

    // Fetch providers
    if (!type || type === 'all' || type === 'provider') {
      let query = supabase
        .from('providers')
        .select('id, name, tier, main_image_url, has_quality_images, has_complete_info, editor_approved_for_premium, status, created_at')
        .order('created_at', { ascending: false });

      if (tier && tier !== 'all') {
        query = query.eq('tier', tier);
      }

      // Apply status filter
      if (status === 'pending') {
        query = query.or('has_quality_images.is.false,has_complete_info.is.false,editor_approved_for_premium.is.false');
      } else if (status === 'approved') {
        query = query.eq('editor_approved_for_premium', true);
      } else if (status === 'needs_review') {
        query = query
          .eq('has_quality_images', true)
          .eq('has_complete_info', true)
          .eq('editor_approved_for_premium', false);
      }

      const { data } = await query;
      if (data) {
        items.push(...data.map(item => ({ ...item, type: 'provider' })));
      }
    }

    // Fetch houses
    if (!type || type === 'all' || type === 'house') {
      let query = supabase
        .from('houses')
        .select('id, name, tier, main_image_url, has_quality_images, has_complete_info, editor_approved_for_premium, status, created_at')
        .order('created_at', { ascending: false });

      if (tier && tier !== 'all') {
        query = query.eq('tier', tier);
      }

      if (status === 'pending') {
        query = query.or('has_quality_images.is.false,has_complete_info.is.false,editor_approved_for_premium.is.false');
      } else if (status === 'approved') {
        query = query.eq('editor_approved_for_premium', true);
      } else if (status === 'needs_review') {
        query = query
          .eq('has_quality_images', true)
          .eq('has_complete_info', true)
          .eq('editor_approved_for_premium', false);
      }

      const { data } = await query;
      if (data) {
        items.push(...data.map(item => ({ ...item, type: 'house' })));
      }
    }

    // Fetch service_products
    if (!type || type === 'all' || type === 'service_product') {
      let query = supabase
        .from('service_products')
        .select('id, name, tier, main_image_url, has_quality_images, has_complete_info, editor_approved_for_premium, status, created_at')
        .order('created_at', { ascending: false });

      if (tier && tier !== 'all') {
        query = query.eq('tier', tier);
      }

      if (status === 'pending') {
        query = query.or('has_quality_images.is.false,has_complete_info.is.false,editor_approved_for_premium.is.false');
      } else if (status === 'approved') {
        query = query.eq('editor_approved_for_premium', true);
      } else if (status === 'needs_review') {
        query = query
          .eq('has_quality_images', true)
          .eq('has_complete_info', true)
          .eq('editor_approved_for_premium', false);
      }

      const { data } = await query;
      if (data) {
        items.push(...data.map(item => ({ ...item, type: 'service_product' })));
      }
    }

    // Sort all items by created_at descending
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/editorial/pending:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
