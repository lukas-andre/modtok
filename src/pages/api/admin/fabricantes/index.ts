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

    // Filters - specific for fabricantes
    const status = searchParams.get('status') as 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected' | null;
    const tier = searchParams.get('tier') as 'premium' | 'destacado' | 'standard' | null;
    const region = searchParams.get('region');
    const search = searchParams.get('search');

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';

    // Build query for fabricantes table
    let query = supabase
      .from('fabricantes')
      .select(`
        *,
        provider:providers(id, company_name, tier, slug, status, logo_url),
        approved_by_profile:profiles!fabricantes_approved_by_fkey(full_name),
        created_by_profile:profiles!fabricantes_created_by_fkey(full_name)
      `, { count: 'exact' });

    // Apply filters
    if (status && ['draft', 'pending_review', 'active', 'inactive', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    if (tier && ['premium', 'destacado', 'standard'].includes(tier)) {
      query = query.eq('tier', tier);
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
      'featured_order',
      'years_experience'
    ];
    
    if (validSortFields.includes(sortBy)) {
      if (sortBy === 'featured_order') {
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

    const { data: fabricantes, error, count } = await query;

    if (error) {
      console.error('Error fetching fabricantes:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch fabricantes' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        fabricantes,
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
    console.error('Error in fabricantes list:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const body = await request.json();
    
    // Generate slug from service name
    const slug = body.name
      .toLowerCase()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure slug is unique
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('fabricantes')
        .select('id')
        .eq('slug', finalSlug)
        .single();
      
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Convert numeric fields
    const numericFields = ['price_range_min', 'price_range_max', 'price_per_m2_min', 'price_per_m2_max', 'years_experience', 'internal_rating'];
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = parseFloat(body[field]) || null;
      }
    });

    // Prepare fabricante data
    const fabricanteData = {
      ...body,
      slug: finalSlug,
      created_by: auth?.user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: fabricante, error } = await supabase
      .from('fabricantes')
      .insert(fabricanteData)
      .select()
      .single();

    if (error) {
      console.error('Error creating fabricante:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create fabricante' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // No need to add category - provider already has fabricantes category

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'create',
          target_type: 'fabricante',
          target_id: fabricante.id,
          changes: { created: fabricanteData }
        });
    }

    return new Response(
      JSON.stringify({ fabricante }),
      { status: 201, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error creating fabricante:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// PUT - Bulk operations for fabricantes
export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const formData = await request.json();
    const { action, fabricante_ids, data } = formData;

    if (!action || !fabricante_ids || !Array.isArray(fabricante_ids)) {
      return new Response(
        JSON.stringify({ error: 'Action and fabricante IDs are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const results = [];

    for (const fabricanteId of fabricante_ids) {
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

          default:
            throw new Error('Invalid action');
        }

        // First verify the provider has the fabricantes category
        const { data: categoryCheck } = await supabase
          .from('provider_categories')
          .select('provider_id')
          .eq('provider_id', fabricanteId)
          .eq('category_type', 'fabricantes')
          .single();

        if (!categoryCheck) {
          results.push({
            id: fabricanteId,
            success: false,
            error: 'Provider is not a fabricante'
          });
          continue;
        }

        const { data: updatedFabricante, error } = await supabase
          .from('providers')
          .update(updateData)
          .eq('id', fabricanteId)
          .select('id, company_name, status, tier')
          .single();

        if (error) {
          results.push({ 
            id: fabricanteId, 
            success: false, 
            error: error.message 
          });
        } else {
          results.push({ 
            id: fabricanteId, 
            success: true, 
            fabricante: updatedFabricante 
          });

          // Log admin action
          if (auth?.user?.id) {
            await supabase
              .from('admin_actions')
              .insert({
                admin_id: auth.user.id,
                action_type: action,
                target_type: 'fabricante',
                target_id: fabricanteId,
                changes: { action, data: updateData }
              });
          }
        }

      } catch (error: any) {
        results.push({ 
          id: fabricanteId, 
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
        message: `${successCount} fabricantes updated successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
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

// DELETE - Bulk delete fabricantes
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { fabricante_ids } = await request.json();

    if (!fabricante_ids || !Array.isArray(fabricante_ids)) {
      return new Response(
        JSON.stringify({ error: 'Fabricante IDs are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // First verify all providers are fabricantes
    const { data: categoryChecks } = await supabase
      .from('provider_categories')
      .select('provider_id')
      .in('provider_id', fabricante_ids)
      .eq('category_type', 'fabricantes');

    const validFabricanteIds = categoryChecks?.map(c => c.provider_id) || [];

    if (validFabricanteIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid fabricantes found to delete' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { error } = await supabase
      .from('providers')
      .delete()
      .in('id', validFabricanteIds);

    if (error) {
      console.error('Error deleting fabricantes:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to delete fabricantes' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin actions
    if (auth?.user?.id) {
      for (const fabricanteId of fabricante_ids) {
        await supabase
          .from('admin_actions')
          .insert({
            admin_id: auth.user.id,
            action_type: 'delete',
            target_type: 'fabricante',
            target_id: fabricanteId,
            changes: { deleted: true }
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${fabricante_ids.length} fabricantes deleted successfully` 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error deleting fabricantes:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};