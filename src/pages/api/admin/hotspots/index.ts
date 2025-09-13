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
    const status = searchParams.get('status');
    const region = searchParams.get('region');
    const search = searchParams.get('search');

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';

    // Build query
    let query = supabase
      .from('hotspots')
      .select(`
        *,
        hotspot_providers!left(count),
        hotspot_features!left(count)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (region) {
      query = query.eq('region', region);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'name', 'city', 'region', 'population'];
    if (validSortFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: hotspots, error, count } = await query;

    if (error) {
      console.error('Error fetching hotspots:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch hotspots' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        hotspots,
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
    console.error('Error in hotspots list:', error);
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
    if (!body.name || !body.region || !body.city || !body.latitude || !body.longitude) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, region, city, latitude, longitude' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Generate slug from name if not provided
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
    }

    // Ensure slug is unique
    let finalSlug = body.slug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('hotspots')
        .select('id')
        .eq('slug', finalSlug)
        .single();
      
      if (!existing) break;
      finalSlug = `${body.slug}-${counter}`;
      counter++;
    }

    // Convert numeric fields
    const numericFields = ['latitude', 'longitude', 'altitude_m', 'distance_santiago_km', 
                          'population', 'terrain_cost_min', 'terrain_cost_max', 'construction_cost_m2_avg'];
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = parseFloat(body[field]) || null;
      }
    });

    // Prepare hotspot data
    const hotspotData = {
      ...body,
      slug: finalSlug,
      created_by: auth.user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: hotspot, error } = await supabase
      .from('hotspots')
      .insert(hotspotData)
      .select()
      .single();

    if (error) {
      console.error('Error creating hotspot:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create hotspot' }),
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
          target_type: 'hotspot',
          target_id: hotspot.id,
          changes: { created: hotspotData }
        });
    }

    return new Response(
      JSON.stringify({ hotspot }),
      { status: 201, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error creating hotspot:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};