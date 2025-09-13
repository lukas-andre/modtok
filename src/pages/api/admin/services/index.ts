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
  const category_id = url.searchParams.get('category_id');
  const service_type = url.searchParams.get('service_type');
  const status = url.searchParams.get('status') as 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected' | null;
  const tier = url.searchParams.get('tier') as 'premium' | 'destacado' | 'standard' | null;
  const is_available = url.searchParams.get('is_available');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:providers(id, company_name, slug),
        category:categories(id, name, slug)
      `, { count: 'exact' });

    // Apply filters
    if (provider_id) query = query.eq('provider_id', provider_id);
    if (category_id) query = query.eq('category_id', category_id);
    if (service_type) query = query.eq('service_type', service_type);
    if (status) query = query.eq('status', status);
    if (tier) query = query.eq('tier', tier);
    if (is_available !== null) query = query.eq('is_available', is_available === 'true');
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,service_type.ilike.%${search}%,description.ilike.%${search}%`);
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
    console.error('Error fetching services:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch services' }), {
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
    if (!body.name || !body.provider_id || !body.service_type) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: name, provider_id, and service_type are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[áàäâã]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöôõ]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Check if slug exists and make it unique
      const { data: existing } = await supabase
        .from('services')
        .select('slug')
        .eq('slug', body.slug)
        .single();
      
      if (existing) {
        body.slug = `${body.slug}-${Date.now()}`;
      }
    }

    // Convert numeric fields
    const numericFields = ['price_from', 'price_to', 'max_bookings', 'current_bookings'];
    
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = parseFloat(body[field]) || null;
      }
    });

    // Convert array fields from string if needed
    const arrayFields = ['coverage_areas', 'gallery_images', 'keywords'];
    
    arrayFields.forEach(field => {
      if (typeof body[field] === 'string') {
        body[field] = body[field].split(',').map(s => s.trim()).filter(Boolean);
      }
    });

    const { data, error } = await supabase
      .from('services')
      .insert([body])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'create',
        target_type: 'service',
        target_id: data.id,
        changes: { created: body }
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create service' 
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
      .from('services')
      .update(updates)
      .in('id', ids)
      .select();

    if (error) {
      throw error;
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'bulk_update',
        target_type: 'service',
        changes: { ids, updates }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      updated: data.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating services:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to update services' 
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
      .from('services')
      .delete()
      .in('id', ids);

    if (error) {
      throw error;
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'bulk_delete',
        target_type: 'service',
        changes: { ids }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      deleted: ids.length 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error deleting services:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to delete services' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};