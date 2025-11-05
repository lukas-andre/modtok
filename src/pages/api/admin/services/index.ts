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
  const status = url.searchParams.get('status') as 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected' | null;
  const tier = url.searchParams.get('tier') as 'premium' | 'destacado' | 'standard' | null;
  const is_available = url.searchParams.get('is_available');
  const search = url.searchParams.get('search');
  const region = url.searchParams.get('region'); // NEW: filter by effective coverage region
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    // Filter by region using service_product_effective_regions view
    let serviceIdsInRegion: string[] | null = null;
    if (region) {
      const { data: regionServices } = await supabase
        .from('service_product_effective_regions')
        .select('service_product_id')
        .eq('region_code', region);

      serviceIdsInRegion = (regionServices || []).map((r: any) => r.service_product_id);

      // If no services match region, return empty result early
      if (serviceIdsInRegion.length === 0) {
        return new Response(JSON.stringify({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    let query = supabase
      .from('service_products')
      .select(`
        *,
        provider:providers(id, company_name, slug)
      `, { count: 'exact' });

    // Apply filters
    if (provider_id) query = query.eq('provider_id', provider_id);
    if (category_id) query = query.eq('category_id', category_id);
    if (status) query = query.eq('status', status);
    if (tier) query = query.eq('tier', tier);
    if (is_available !== null) query = query.eq('is_available', is_available === 'true');
    if (serviceIdsInRegion !== null) query = query.in('id', serviceIdsInRegion);

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Enrich each service with effective_tier from catalog_visibility_effective
    const servicesWithEffectiveTier = await Promise.all(
      (data || []).map(async (service: any) => {
        const { data: visibilityData } = await supabase
          .from('catalog_visibility_effective')
          .select('effective_tier')
          .eq('entity_type', 'service_product')
          .eq('entity_id', service.id)
          .single();

        return {
          ...service,
          effective_tier: visibilityData?.effective_tier || service.tier
        };
      })
    );

    return new Response(JSON.stringify({
      data: servicesWithEffectiveTier,
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
    if (!body.name || !body.provider_id) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: name and provider_id are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract coverage_deltas before inserting (it's not a column, it's a separate table)
    const { coverage_deltas, ...serviceData } = body;

    // Generate base slug from name if not provided
    let baseSlug = serviceData.slug || serviceData.name
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
        .from('service_products')
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

    serviceData.slug = slug;

    // Convert numeric fields
    const numericFields = ['price_from', 'price_to', 'max_bookings', 'current_bookings'];

    numericFields.forEach(field => {
      if (serviceData[field] !== undefined && serviceData[field] !== '') {
        serviceData[field] = parseFloat(serviceData[field]) || null;
      }
    });

    // Convert array fields from string if needed
    const arrayFields = ['gallery_images', 'keywords'];

    arrayFields.forEach(field => {
      if (typeof serviceData[field] === 'string') {
        serviceData[field] = serviceData[field].split(',').map(s => s.trim()).filter(Boolean);
      }
    });

    // Insert service
    const { data, error } = await supabase
      .from('service_products')
      .insert([serviceData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Insert coverage_deltas in separate table (if provided)
    if (coverage_deltas && Array.isArray(coverage_deltas) && coverage_deltas.length > 0) {
      const deltas = coverage_deltas.map(delta => ({
        service_product_id: data.id,
        region_code: delta.region_code,
        op: delta.op // 'include' or 'exclude'
      }));

      const { error: deltasError } = await supabase
        .from('service_product_coverage_deltas')
        .insert(deltas);

      if (deltasError) {
        console.error('Error inserting coverage deltas:', deltasError);
        // Continue anyway - service was created successfully
      }
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'create',
        target_type: 'service',
        target_id: data.id,
        changes: { created: serviceData }
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
      .from('service_products')
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
      .from('service_products')
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