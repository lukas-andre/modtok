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
      .from('providers')
      .select(`
        *,
        profile:profiles(id, full_name, email, avatar_url),
        approved_by_profile:profiles!providers_approved_by_fkey(full_name),
        created_by_profile:profiles!providers_created_by_fkey(full_name)
      `)
      .eq('id', id)
      .eq('category_type', 'fabricantes')
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
      .from('providers')
      .select('*')
      .eq('id', id)
      .eq('category_type', 'fabricantes')
      .single();

    if (!currentFabricante) {
      return new Response(
        JSON.stringify({ error: 'Fabricante not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Handle slug regeneration if company_name changed
    let slug = currentFabricante.slug;
    if (body.company_name && body.company_name !== currentFabricante.company_name) {
      slug = body.company_name
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
          .from('providers')
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
    const numericFields = ['price_range_min', 'price_range_max', 'price_per_m2_min', 'price_per_m2_max', 'years_experience', 'internal_rating'];
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = parseFloat(body[field]) || null;
      }
    });

    // Prepare update data
    const updateData = {
      ...body,
      slug,
      category_type: 'fabricantes', // Ensure category_type remains fabricantes
      updated_at: new Date().toISOString()
    };

    const { data: updatedFabricante, error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', id)
      .eq('category_type', 'fabricantes')
      .select(`
        *,
        profile:profiles(id, full_name, email, avatar_url),
        approved_by_profile:profiles!providers_approved_by_fkey(full_name),
        created_by_profile:profiles!providers_created_by_fkey(full_name)
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
      .from('providers')
      .select('company_name, slug')
      .eq('id', id)
      .eq('category_type', 'fabricantes')
      .single();

    if (!fabricante) {
      return new Response(
        JSON.stringify({ error: 'Fabricante not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', id)
      .eq('category_type', 'fabricantes');

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