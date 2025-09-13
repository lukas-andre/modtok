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
    const providerId = searchParams.get('provider_id');
    const categoryId = searchParams.get('category_id');
    const productType = searchParams.get('product_type');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';

    // Build query
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:providers(id, company_name, slug, tier),
        category:categories(id, name, slug)
      `, { count: 'exact' });

    // Apply filters
    if (status && ['draft', 'pending_review', 'active', 'inactive', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    if (tier && ['premium', 'destacado', 'standard'].includes(tier)) {
      query = query.eq('tier', tier);
    }

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (productType) {
      query = query.eq('product_type', productType);
    }

    if (brand) {
      query = query.ilike('brand', `%${brand}%`);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,service_type.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = [
      'created_at', 
      'updated_at', 
      'name', 
      'price_from',
      'tier', 
      'status'
    ];
    
    if (validSortFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: services, error, count } = await query;

    if (error) {
      console.error('Error fetching decorations:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch decorations' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        decorations: services,
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
    console.error('Error in decorations list:', error);
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
    
    // Validate required fields
    if (!body.name || !body.provider_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, provider_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Generate slug from name
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
        .from('services')
        .select('id')
        .eq('slug', finalSlug)
        .single();
      
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Convert numeric fields
    const numericFields = ['price_from', 'price_to', 'delivery_time_days'];
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = parseFloat(body[field]) || null;
      }
    });

    // Convert array fields
    const arrayFields = ['gallery_images', 'keywords', 'coverage_areas'];
    arrayFields.forEach(field => {
      if (body[field] && typeof body[field] === 'string') {
        try {
          body[field] = JSON.parse(body[field]);
        } catch {
          body[field] = body[field].split(',').map((item: string) => item.trim());
        }
      }
    });

    // Prepare decoration data
    const decorationData = {
      ...body,
      slug: finalSlug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: decoration, error } = await supabase
      .from('services')
      .insert(decorationData)
      .select(`
        *,
        provider:providers(id, company_name, slug, tier),
        category:categories(id, name, slug)
      `)
      .single();

    if (error) {
      console.error('Error creating decoration:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create decoration' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'create',
          target_type: 'decoration',
          target_id: decoration.id,
          changes: { created: decorationData }
        });
    }

    return new Response(
      JSON.stringify({ decoration }),
      { status: 201, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error creating decoration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// PUT - Bulk operations for decorations
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
    const { action, decoration_ids, data } = formData;

    if (!action || !decoration_ids || !Array.isArray(decoration_ids)) {
      return new Response(
        JSON.stringify({ error: 'Action and decoration IDs are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const results = [];

    for (const decorationId of decoration_ids) {
      try {
        let updateData: any = { updated_at: new Date().toISOString() };

        switch (action) {
          case 'change_status':
            if (!data?.status || !['draft', 'pending_review', 'active', 'inactive', 'rejected'].includes(data.status)) {
              throw new Error('Invalid status');
            }
            updateData.status = data.status;
            break;

          case 'change_tier':
            if (!data?.tier || !['premium', 'destacado', 'standard'].includes(data.tier)) {
              throw new Error('Invalid tier');
            }
            updateData.tier = data.tier;
            break;

          case 'update_price':
            if (data?.price_from !== undefined) {
              updateData.price_from = parseFloat(data.price_from) || null;
            }
            if (data?.price_to !== undefined) {
              updateData.price_to = parseFloat(data.price_to) || null;
            }
            break;

          default:
            throw new Error('Invalid action');
        }

        const { data: updatedDecoration, error } = await supabase
          .from('services')
          .update(updateData)
          .eq('id', decorationId)
          .select('id, name, status, tier')
          .single();

        if (error) {
          results.push({ 
            id: decorationId, 
            success: false, 
            error: error.message 
          });
        } else {
          results.push({ 
            id: decorationId, 
            success: true, 
            decoration: updatedDecoration 
          });

          // Log admin action
          if (auth?.user?.id) {
            await supabase
              .from('admin_actions')
              .insert({
                admin_id: auth.user.id,
                action_type: action,
                target_type: 'decoration',
                target_id: decorationId,
                changes: { action, data: updateData }
              });
          }
        }

      } catch (error: any) {
        results.push({ 
          id: decorationId, 
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
        message: `${successCount} decorations updated successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
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

// DELETE - Bulk delete decorations
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { decoration_ids } = await request.json();

    if (!decoration_ids || !Array.isArray(decoration_ids)) {
      return new Response(
        JSON.stringify({ error: 'Decoration IDs are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    
    const { error } = await supabase
      .from('services')
      .delete()
      .in('id', decoration_ids);

    if (error) {
      console.error('Error deleting decorations:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to delete decorations' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin actions
    if (auth?.user?.id) {
      for (const decorationId of decoration_ids) {
        await supabase
          .from('admin_actions')
          .insert({
            admin_id: auth.user.id,
            action_type: 'delete',
            target_type: 'decoration',
            target_id: decorationId,
            changes: { deleted: true }
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${decoration_ids.length} decorations deleted successfully` 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error deleting decorations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};