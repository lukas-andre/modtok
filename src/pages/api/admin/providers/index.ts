import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const searchParams = new URL(request.url).searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status') as 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected' | null;
    const tier = searchParams.get('tier') as 'premium' | 'destacado' | 'standard' | null;
    const category_type = searchParams.get('category_type') as 'casas' | 'fabricantes' | 'habilitacion_servicios' | 'decoracion' | null;
    const region = searchParams.get('region');
    const search = searchParams.get('search');

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';

    // Build query
    let query = supabase
      .from('providers')
      .select(`
        *,
        profile:profiles(id, full_name, email, avatar_url),
        approved_by_profile:profiles!providers_approved_by_fkey(full_name),
        created_by_profile:profiles!providers_created_by_fkey(full_name)
      `, { count: 'exact' });

    // Apply filters
    if (status && ['draft', 'pending_review', 'active', 'inactive', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    if (tier && ['premium', 'destacado', 'standard'].includes(tier)) {
      query = query.eq('tier', tier);
    }

    if (category_type && ['casas', 'fabricantes', 'habilitacion_servicios', 'decoracion'].includes(category_type)) {
      query = query.eq('category_type', category_type);
    }

    if (region) {
      query = query.eq('region', region);
    }

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,email.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = [
      'created_at', 
      'updated_at', 
      'company_name', 
      'tier', 
      'status', 
      'views_count', 
      'inquiries_count',
      'internal_rating',
      'featured_order'
    ];
    
    if (validSortFields.includes(sortBy)) {
      if (sortBy === 'featured_order') {
        // Handle featured order with nulls last
        query = query.order('featured_order', { 
          ascending: sortOrder === 'asc', 
          nullsFirst: false 
        });
      } else {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: providers, error, count } = await query;

    if (error) {
      console.error('Error fetching providers:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch providers' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        providers,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasMore,
          hasPrev: page > 1
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error in providers list:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// POST - Bulk operations (approve, reject, change tier, etc.)
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const formData = await request.json();
    const { action, provider_ids, data } = formData;

    if (!action || !provider_ids || !Array.isArray(provider_ids)) {
      return new Response(
        JSON.stringify({ error: 'Action and provider IDs are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const results = [];

    for (const providerId of provider_ids) {
      try {
        let updateData: any = { updated_at: new Date().toISOString() };

        switch (action) {
          case 'approve':
            updateData = {
              ...updateData,
              status: 'active' as const,
              approved_by: auth?.user?.id || null,
              approved_at: new Date().toISOString()
            };
            break;

          case 'reject':
            updateData = {
              ...updateData,
              status: 'rejected' as const,
              rejection_reason: data?.rejection_reason || 'Rejected by admin',
              approved_by: null,
              approved_at: null
            };
            break;

          case 'change_tier':
            if (!data?.tier || !['premium', 'destacado', 'standard'].includes(data.tier)) {
              throw new Error('Invalid tier');
            }
            updateData = {
              ...updateData,
              tier: data.tier as 'premium' | 'destacado' | 'standard',
              ...(data.tier === 'premium' && data.premium_until && {
                premium_until: new Date(data.premium_until).toISOString()
              }),
              ...(data.tier === 'destacado' && data.featured_until && {
                featured_until: new Date(data.featured_until).toISOString(),
                featured_order: data.featured_order ? parseInt(data.featured_order) : null
              })
            };
            break;

          case 'set_featured':
            updateData = {
              ...updateData,
              featured_until: data?.featured_until ? new Date(data.featured_until).toISOString() : null,
              featured_order: data?.featured_order ? parseInt(data.featured_order) : null
            };
            break;

          case 'set_rating':
            if (!data?.internal_rating || data.internal_rating < 1 || data.internal_rating > 5) {
              throw new Error('Invalid rating (must be 1-5)');
            }
            updateData = {
              ...updateData,
              internal_rating: parseInt(data.internal_rating)
            };
            break;

          default:
            throw new Error('Invalid action');
        }

        const { data: updatedProvider, error } = await supabase
          .from('providers')
          .update(updateData)
          .eq('id', providerId)
          .select('id, company_name, status, tier')
          .single();

        if (error) {
          results.push({ 
            id: providerId, 
            success: false, 
            error: error.message 
          });
        } else {
          results.push({ 
            id: providerId, 
            success: true, 
            provider: updatedProvider 
          });

          // Log admin action
          if (auth?.user?.id) {
            await supabase
              .from('admin_actions')
              .insert({
                admin_id: auth.user.id,
                action_type: action,
                target_type: 'provider',
                target_id: providerId,
                changes: { action, data: updateData }
              });
          }
        }

      } catch (error: any) {
        results.push({ 
          id: providerId, 
          success: false, 
          error: error.message 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: errorCount === 0,
        message: `${successCount} providers updated successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};