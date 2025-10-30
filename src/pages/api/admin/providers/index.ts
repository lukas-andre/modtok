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
    const is_manufacturer = searchParams.get('is_manufacturer');
    const is_service_provider = searchParams.get('is_service_provider');
    const hq_region_code = searchParams.get('hq_region_code');
    const search = searchParams.get('search');

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';

    // Build query - Provider minimalista model
    let query = supabase
      .from('providers')
      .select(`
        id,
        company_name,
        slug,
        email,
        phone,
        whatsapp,
        website,
        description,
        address,
        city,
        hq_region_code,
        is_manufacturer,
        is_service_provider,
        status,
        approved_by,
        approved_at,
        rejection_reason,
        admin_notes,
        created_at,
        updated_at,
        profile:profiles!providers_profile_id_fkey(id, full_name, email, avatar_url),
        approved_by_profile:profiles!providers_approved_by_fkey(full_name)
      `, { count: 'exact' });

    // Apply filters
    if (status && ['draft', 'pending_review', 'active', 'inactive', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    if (is_manufacturer === 'true') {
      query = query.eq('is_manufacturer', true);
    } else if (is_manufacturer === 'false') {
      query = query.eq('is_manufacturer', false);
    }

    if (is_service_provider === 'true') {
      query = query.eq('is_service_provider', true);
    } else if (is_service_provider === 'false') {
      query = query.eq('is_service_provider', false);
    }

    if (hq_region_code) {
      query = query.eq('hq_region_code', hq_region_code);
    }

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,email.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting - Provider minimalista fields only
    const validSortFields = [
      'created_at',
      'updated_at',
      'company_name',
      'status'
    ];

    if (validSortFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
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

          default:
            throw new Error('Invalid action');
        }

        const { data: updatedProvider, error } = await supabase
          .from('providers')
          .update(updateData)
          .eq('id', providerId)
          .select('id, company_name, status')
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
