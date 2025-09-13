import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Hotspot ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    
    const { data: hotspot, error } = await supabase
      .from('hotspots')
      .select(`
        *,
        hotspot_providers(
          *,
          provider:providers(id, company_name, slug)
        ),
        hotspot_features(*),
        hotspot_demographics(*),
        hotspot_cost_estimates(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Hotspot not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' }}
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({ hotspot }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error fetching hotspot:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Hotspot ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const body = await request.json();

    // Get current hotspot for comparison
    const { data: currentHotspot } = await supabase
      .from('hotspots')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentHotspot) {
      return new Response(
        JSON.stringify({ error: 'Hotspot not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Handle slug regeneration if name changed
    let slug = currentHotspot.slug;
    if (body.name && body.name !== currentHotspot.name) {
      slug = body.name
        .toLowerCase()
        .replace(/[áàäâã]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöôõ]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Ensure slug is unique (excluding current record)
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const { data: existing } = await supabase
          .from('hotspots')
          .select('id')
          .eq('slug', finalSlug)
          .neq('id', id)
          .single();
        
        if (!existing) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      slug = finalSlug;
    }

    // Convert numeric fields
    const numericFields = ['latitude', 'longitude', 'altitude_m', 'distance_santiago_km',
                          'population', 'terrain_cost_min', 'terrain_cost_max', 'construction_cost_m2_avg'];
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = parseFloat(body[field]) || null;
      }
    });

    // Prepare update data
    const updateData = {
      ...body,
      slug,
      updated_at: new Date().toISOString()
    };

    const { data: updatedHotspot, error } = await supabase
      .from('hotspots')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating hotspot:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update hotspot' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action with changes
    const changes: Record<string, any> = {};
    if (currentHotspot) {
      Object.keys(body).forEach(key => {
        const currentValue = (currentHotspot as any)[key];
        const newValue = (body as any)[key];
        if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
          changes[key] = {
            old: currentValue,
            new: newValue
          };
        }
      });
    }

    if (Object.keys(changes).length > 0 && auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'update',
        target_type: 'hotspot',
        target_id: id,
        changes
      });
    }

    return new Response(
      JSON.stringify({ hotspot: updatedHotspot }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error updating hotspot:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Hotspot ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Get hotspot data before deletion for logging
    const { data: hotspot } = await supabase
      .from('hotspots')
      .select('name, slug, city, region')
      .eq('id', id)
      .single();

    if (!hotspot) {
      return new Response(
        JSON.stringify({ error: 'Hotspot not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { error } = await supabase
      .from('hotspots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting hotspot:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to delete hotspot' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'delete',
        target_type: 'hotspot',
        target_id: id,
        changes: { deleted: hotspot }
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Hotspot deleted successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error deleting hotspot:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};