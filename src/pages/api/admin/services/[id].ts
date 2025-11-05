import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const { id } = params;
  const supabase = createSupabaseClient({ request, cookies });
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: 'Service ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Fetch service
    const { data: service, error } = await supabase
      .from('service_products')
      .select(`
        *,
        provider:providers(id, company_name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    if (!service) {
      return new Response(JSON.stringify({ error: 'Service not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch coverage_deltas from separate table
    const { data: deltas } = await supabase
      .from('service_product_coverage_deltas')
      .select('region_code, op')
      .eq('service_product_id', id);

    // Enrich with effective_tier
    const { data: visibilityData } = await supabase
      .from('catalog_visibility_effective')
      .select('effective_tier')
      .eq('entity_type', 'service_product')
      .eq('entity_id', id)
      .single();

    return new Response(JSON.stringify({
      ...service,
      coverage_deltas: deltas || [],
      effective_tier: visibilityData?.effective_tier || service.tier
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch service' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const { id } = params;
  const supabase = createSupabaseClient({ request, cookies });
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: 'Service ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();

    // Extract coverage_deltas before updating (it's not a column, it's a separate table)
    const { coverage_deltas, ...serviceData } = body;

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

    // Update service
    const { data: service, error } = await supabase
      .from('service_products')
      .update(serviceData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update coverage_deltas in separate table if provided
    if (coverage_deltas !== undefined) {
      // Delete existing deltas
      await supabase
        .from('service_product_coverage_deltas')
        .delete()
        .eq('service_product_id', id);

      // Insert new deltas
      if (Array.isArray(coverage_deltas) && coverage_deltas.length > 0) {
        const deltas = coverage_deltas.map(delta => ({
          service_product_id: id,
          region_code: delta.region_code,
          op: delta.op // 'include' or 'exclude'
        }));

        const { error: deltasError } = await supabase
          .from('service_product_coverage_deltas')
          .insert(deltas);

        if (deltasError) {
          console.error('Error updating coverage deltas:', deltasError);
          // Continue anyway - service was updated successfully
        }
      }
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'update',
        target_type: 'service',
        target_id: id,
        changes: { updated: serviceData }
      });
    }

    return new Response(JSON.stringify(service), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to update service' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const { id } = params;
  const supabase = createSupabaseClient({ request, cookies });
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: 'Service ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Delete coverage_deltas first (if any)
    await supabase
      .from('service_product_coverage_deltas')
      .delete()
      .eq('service_product_id', id);

    // Delete service
    const { error } = await supabase
      .from('service_products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'delete',
        target_type: 'service',
        target_id: id,
        changes: { deleted: true }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to delete service' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
