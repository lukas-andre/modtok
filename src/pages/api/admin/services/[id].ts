import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const serviceId = params.id;

  // Validate required parameter
  if (!serviceId) {
    return new Response(JSON.stringify({ error: 'Service ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Fetch service with provider info
    const { data, error } = await supabase
      .from('service_products')
      .select(`
        *,
        provider:providers(id, company_name, slug)
      `)
      .eq('id', serviceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'Service not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }

    // Fetch coverage deltas
    const { data: coverageDeltas } = await supabase
      .from('service_product_coverage_deltas')
      .select('region_code, op')
      .eq('service_product_id', serviceId);

    // Fetch effective tier from catalog_visibility_effective view
    const { data: visibilityData } = await supabase
      .from('catalog_visibility_effective')
      .select('effective_tier')
      .eq('entity_type', 'service_product')
      .eq('entity_id', serviceId)
      .single();

    // Fetch effective coverage regions
    const { data: effectiveRegions } = await supabase
      .from('service_product_effective_regions')
      .select('region_code')
      .eq('service_product_id', serviceId);

    const serviceWithEnrichedData = {
      ...data,
      coverage_deltas: coverageDeltas || [],
      effective_coverage: (effectiveRegions || []).map((r: any) => r.region_code),
      effective_tier: visibilityData?.effective_tier || data.tier
    };

    return new Response(JSON.stringify(serviceWithEnrichedData), {
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
  const supabase = createSupabaseClient({ request, cookies });
  const serviceId = params.id;

  // Validate required parameter
  if (!serviceId) {
    return new Response(JSON.stringify({ error: 'Service ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

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

    // Get current service data for comparison
    const { data: currentData } = await supabase
      .from('service_products')
      .select('*')
      .eq('id', serviceId)
      .single();

    // Extract coverage-related fields
    const { coverage_mode, coverage_deltas, ...serviceUpdates } = body;

    // Convert numeric fields
    const numericFields = ['price_from', 'price_to', 'max_bookings', 'current_bookings'];

    numericFields.forEach(field => {
      if (serviceUpdates[field] !== undefined && serviceUpdates[field] !== '') {
        serviceUpdates[field] = parseFloat(serviceUpdates[field]) || null;
      }
    });

    // Convert array fields from string if needed
    const arrayFields = ['gallery_images', 'keywords', 'videos'];

    arrayFields.forEach(field => {
      if (typeof serviceUpdates[field] === 'string') {
        serviceUpdates[field] = serviceUpdates[field].split(',').map(s => s.trim()).filter(Boolean);
      }
    });

    // Add coverage_mode if provided
    if (coverage_mode !== undefined) {
      serviceUpdates.coverage_mode = coverage_mode;
    }

    // Update the service
    const { data, error } = await supabase
      .from('service_products')
      .update(serviceUpdates)
      .eq('id', serviceId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Handle coverage_deltas if provided
    if (coverage_deltas !== undefined && Array.isArray(coverage_deltas)) {
      // Delete all existing deltas first
      await supabase
        .from('service_product_coverage_deltas')
        .delete()
        .eq('service_product_id', serviceId);

      // Insert new deltas
      if (coverage_deltas.length > 0) {
        const deltaInserts = coverage_deltas.map((delta: any) => ({
          service_product_id: serviceId,
          region_code: delta.region_code,
          op: delta.op
        }));

        const { error: deltaError } = await supabase
          .from('service_product_coverage_deltas')
          .insert(deltaInserts);

        if (deltaError) {
          console.error('Error updating coverage deltas:', deltaError);
          // Don't fail the whole update, just log
        }
      }
    }

    // Log admin action with changes
    const changes: Record<string, any> = {};
    if (currentData) {
      Object.keys(serviceUpdates).forEach(key => {
        const currentValue = (currentData as any)[key];
        const newValue = (serviceUpdates as any)[key];
        if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
          changes[key] = {
            old: currentValue,
            new: newValue
          };
        }
      });

      if (coverage_deltas !== undefined) {
        changes.coverage_deltas = { new: coverage_deltas };
      }
    }

    if (Object.keys(changes).length > 0 && user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'update',
        target_type: 'service',
        target_id: serviceId,
        changes
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Service updated successfully',
      service: data
    }), {
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
  const supabase = createSupabaseClient({ request, cookies });
  const serviceId = params.id;

  // Validate required parameter
  if (!serviceId) {
    return new Response(JSON.stringify({ error: 'Service ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get service data before deletion for logging
    const { data: serviceData } = await supabase
      .from('service_products')
      .select('*')
      .eq('id', serviceId)
      .single();

    const { error } = await supabase
      .from('service_products')
      .delete()
      .eq('id', serviceId);

    if (error) {
      throw error;
    }

    // Coverage deltas will be deleted automatically via CASCADE

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'delete',
        target_type: 'service',
        target_id: serviceId,
        changes: { deleted: serviceData }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Service deleted successfully'
    }), {
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
