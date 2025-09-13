import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies, params }) => {
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
    
    // Get original fabricante
    const { data: originalFabricante, error: fetchError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .eq('category_type', 'fabricantes')
      .single();

    if (fetchError || !originalFabricante) {
      return new Response(
        JSON.stringify({ error: 'Fabricante not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Create duplicate data
    const { 
      id: _id, 
      created_at, 
      updated_at, 
      slug: originalSlug,
      company_name,
      ...fabricanteData 
    } = originalFabricante;

    // Generate new slug for duplicate
    const baseSlug = company_name
      .toLowerCase()
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let duplicateSlug = `${baseSlug}-copia`;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('providers')
        .select('id')
        .eq('slug', duplicateSlug)
        .single();
      
      if (!existing) break;
      duplicateSlug = `${baseSlug}-copia-${counter}`;
      counter++;
    }

    const duplicateData = {
      ...fabricanteData,
      company_name: `${company_name} - Copia`,
      slug: duplicateSlug,
      status: 'draft' as const, // Set as draft by default
      created_by: auth?.user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Reset some fields
      approved_by: null,
      approved_at: null,
      views_count: 0,
      clicks_count: 0,
      inquiries_count: 0,
      featured_until: null,
      premium_until: null,
      featured_order: null
    };

    const { data: duplicateFabricante, error } = await supabase
      .from('providers')
      .insert(duplicateData)
      .select(`
        *,
        profile:profiles(id, full_name, email, avatar_url),
        approved_by_profile:profiles!providers_approved_by_fkey(full_name),
        created_by_profile:profiles!providers_created_by_fkey(full_name)
      `)
      .single();

    if (error) {
      console.error('Error duplicating fabricante:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to duplicate fabricante' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'duplicate',
          target_type: 'fabricante',
          target_id: duplicateFabricante.id,
          changes: { 
            duplicated_from: id, 
            original_name: originalFabricante.company_name 
          }
        });
    }

    return new Response(
      JSON.stringify({ fabricante: duplicateFabricante }),
      { status: 201, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error duplicating fabricante:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};