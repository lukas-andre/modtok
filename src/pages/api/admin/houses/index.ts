import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Get query parameters for filtering
  const url = new URL(request.url);
  const provider_id = url.searchParams.get('provider_id');
  const status = url.searchParams.get('status') as 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected' | null;
  const tier = url.searchParams.get('tier') as 'premium' | 'destacado' | 'standard' | null;
  const topology_id = url.searchParams.get('topology_id');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('houses')
      .select(`
        *,
        provider:providers(id, company_name, slug)
      `, { count: 'exact' });

    // Apply filters
    if (provider_id) query = query.eq('provider_id', provider_id);
    if (status) query = query.eq('status', status);
    if (tier) query = query.eq('tier', tier);
    if (topology_id) query = query.eq('topology_id', topology_id);
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching houses:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch houses' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.provider_id) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: name and provider_id are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate base slug from name if not provided
    let baseSlug = body.slug || body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure slug is unique by appending number if needed
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const { data: existing, error: slugCheckError } = await supabase
        .from('houses')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (slugCheckError) {
        throw new Error(`Error checking slug uniqueness: ${slugCheckError.message}`);
      }

      if (!existing) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    body.slug = slug;

    // Convert numeric fields
    const numericFields = ['bedrooms', 'bathrooms', 'area_m2', 'area_built_m2', 'floors',
                          'price', 'price_opportunity', 'price_per_m2', 'stock_quantity',
                          'delivery_time_days', 'assembly_time_days', 'warranty_years'];
    
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = parseFloat(body[field]) || null;
      }
    });

    // Convert array fields from string if needed
    const arrayFields = ['gallery_images', 'floor_plans', 'videos', 'keywords'];
    
    arrayFields.forEach(field => {
      if (typeof body[field] === 'string') {
        body[field] = body[field].split(',').map(s => s.trim()).filter(Boolean);
      }
    });

    const { data, error } = await supabase
      .from('houses')
      .insert([body])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'create',
      target_type: 'house',
      target_id: data.id,
      changes: { created: body }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'House created successfully',
      house: data
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating house:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create house' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Bulk operations
export const PUT: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { ids, updates } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request: ids array is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('houses')
      .update(updates)
      .in('id', ids)
      .select();

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'bulk_update',
      target_type: 'house',
      changes: { ids, updates }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      updated: data.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating houses:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to update houses' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Bulk delete
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request: ids array is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabase
      .from('houses')
      .delete()
      .in('id', ids);

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action_type: 'bulk_delete',
      target_type: 'house',
      changes: { ids }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      deleted: ids.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error deleting houses:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to delete houses' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};