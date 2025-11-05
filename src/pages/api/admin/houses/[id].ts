import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const houseId = params.id;

  // Validate required parameter
  if (!houseId) {
    return new Response(JSON.stringify({ error: 'House ID is required' }), {
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
    const { data, error } = await supabase
      .from('houses')
      .select(`
        *,
        provider:providers(id, company_name, slug)
      `)
      .eq('id', houseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: 'House not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }

    // Get effective tier from catalog_visibility_effective view
    const { data: visibilityData } = await supabase
      .from('catalog_visibility_effective')
      .select('effective_tier')
      .eq('entity_type', 'house')
      .eq('entity_id', houseId)
      .single();

    const houseWithEffectiveTier = {
      ...data,
      effective_tier: visibilityData?.effective_tier || data.tier
    };

    return new Response(JSON.stringify(houseWithEffectiveTier), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error fetching house:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch house' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const houseId = params.id;

  // Validate required parameter
  if (!houseId) {
    return new Response(JSON.stringify({ error: 'House ID is required' }), {
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
    
    // Get current house data for comparison
    const { data: currentData } = await supabase
      .from('houses')
      .select('*')
      .eq('id', houseId)
      .single();

    // Convert numeric fields
    const numericFields = ['bedrooms', 'bathrooms', 'area_m2', 'area_built_m2', 'floors', 
                          'price', 'price_opportunity', 'price_per_m2',
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

    // Update the house
    const { data, error } = await supabase
      .from('houses')
      .update(body)
      .eq('id', houseId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log admin action with changes
    const changes: Record<string, any> = {};
    if (currentData) {
      Object.keys(body).forEach(key => {
        const currentValue = (currentData as any)[key];
        const newValue = (body as any)[key];
        if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
          changes[key] = {
            old: currentValue,
            new: newValue
          };
        }
      });
    }

    if (Object.keys(changes).length > 0 && user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'update',
        target_type: 'house',
        target_id: houseId,
        changes
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'House updated successfully',
      house: data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error updating house:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to update house' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const houseId = params.id;

  // Validate required parameter
  if (!houseId) {
    return new Response(JSON.stringify({ error: 'House ID is required' }), {
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
    // Get house data before deletion for logging
    const { data: houseData } = await supabase
      .from('houses')
      .select('*')
      .eq('id', houseId)
      .single();

    const { error } = await supabase
      .from('houses')
      .delete()
      .eq('id', houseId);

    if (error) {
      throw error;
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'delete',
        target_type: 'house',
        target_id: houseId,
        changes: { deleted: houseData }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'House deleted successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error deleting house:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to delete house' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};