import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';

export const GET: APIRoute = async ({ request, cookies, params }) => {
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
        JSON.stringify({ error: 'Fabricante ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    
    const { data: fabricante, error } = await supabase
      .from('fabricantes')
      .select(`
        *,
        provider:providers(id, company_name, tier, slug, status, logo_url),
        approved_by_profile:profiles!fabricantes_approved_by_fkey(full_name),
        created_by_profile:profiles!fabricantes_created_by_fkey(full_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching fabricante:', error);
      return new Response(
        JSON.stringify({ error: 'Fabricante not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ fabricante }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error fetching fabricante:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

export const PUT: APIRoute = async ({ request, cookies, params }) => {
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
        JSON.stringify({ error: 'Fabricante ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const body = await request.json();

    // Get current fabricante for comparison
    const { data: currentFabricante } = await supabase
      .from('fabricantes')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentFabricante) {
      return new Response(
        JSON.stringify({ error: 'Fabricante not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Handle slug regeneration if name changed
    let slug = currentFabricante.slug;
    if (body.name && body.name !== currentFabricante.name) {
      slug = body.name
        .toLowerCase()
        .replace(/[áàäâã]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöôõ]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Ensure slug is unique (excluding current record)
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const { data: existing } = await supabase
          .from('fabricantes')
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
    const numericFields = ['price_range_min', 'price_range_max', 'price_per_unit', 'lead_time_days', 'warranty_years', 'internal_rating'];
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

    const { data: updatedFabricante, error } = await supabase
      .from('fabricantes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        provider:providers(id, company_name, tier, slug, status, logo_url),
        approved_by_profile:profiles!fabricantes_approved_by_fkey(full_name),
        created_by_profile:profiles!fabricantes_created_by_fkey(full_name)
      `)
      .single();

    if (error) {
      console.error('Error updating fabricante:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update fabricante' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'update',
          target_type: 'fabricante',
          target_id: id,
          changes: { 
            before: currentFabricante, 
            after: updateData 
          }
        });
    }

    return new Response(
      JSON.stringify({ fabricante: updatedFabricante }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error updating fabricante:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
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
        JSON.stringify({ error: 'Fabricante ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Get fabricante data before deletion for logging
    const { data: fabricante } = await supabase
      .from('fabricantes')
      .select('name, slug')
      .eq('id', id)
      .single();

    if (!fabricante) {
      return new Response(
        JSON.stringify({ error: 'Fabricante not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { error } = await supabase
      .from('fabricantes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting fabricante:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to delete fabricante' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'delete',
          target_type: 'fabricante',
          target_id: id,
          changes: { deleted: fabricante }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Fabricante deleted successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error deleting fabricante:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};