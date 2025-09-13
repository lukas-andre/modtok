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
        JSON.stringify({ error: 'Decoration ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    
    const { data: decoration, error } = await supabase
      .from('services')
      .select(`
        *,
        provider:providers(id, company_name, slug, tier),
        category:categories(id, name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching decoration:', error);
      return new Response(
        JSON.stringify({ error: 'Decoration not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ decoration }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error fetching decoration:', error);
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
        JSON.stringify({ error: 'Decoration ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const body = await request.json();

    // Get current service for comparison
    const { data: currentDecoration } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentDecoration) {
      return new Response(
        JSON.stringify({ error: 'Decoration not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Handle slug regeneration if name changed
    let slug = currentDecoration.slug;
    if (body.name && body.name !== currentDecoration.name) {
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
          .from('services')
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
    const numericFields = ['price_from', 'price_to', 'delivery_time_days'];
    numericFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        body[field] = parseFloat(body[field]) || null;
      }
    });

    // Convert array fields
    const arrayFields = ['gallery_images', 'keywords', 'coverage_areas'];
    arrayFields.forEach(field => {
      if (body[field] && typeof body[field] === 'string') {
        try {
          body[field] = JSON.parse(body[field]);
        } catch {
          body[field] = body[field].split(',').map((item: string) => item.trim());
        }
      }
    });

    // No stock fields for services table

    // Prepare update data
    const updateData = {
      ...body,
      slug,
      updated_at: new Date().toISOString()
    };

    const { data: updatedDecoration, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        provider:providers(id, company_name, slug, tier),
        category:categories(id, name, slug)
      `)
      .single();

    if (error) {
      console.error('Error updating decoration:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update decoration' }),
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
          target_type: 'service',
          target_id: id,
          changes: { 
            before: currentDecoration, 
            after: updateData 
          }
        });
    }

    return new Response(
      JSON.stringify({ decoration: updatedDecoration }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error updating decoration:', error);
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
        JSON.stringify({ error: 'Decoration ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Get service data before deletion for logging
    const { data: decoration } = await supabase
      .from('services')
      .select('name, slug, service_type')
      .eq('id', id)
      .single();

    if (!decoration) {
      return new Response(
        JSON.stringify({ error: 'Decoration not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting decoration:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to delete decoration' }),
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
          target_type: 'service',
          target_id: id,
          changes: { deleted: decoration }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Decoration deleted successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error deleting decoration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};