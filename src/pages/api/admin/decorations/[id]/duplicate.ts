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
        JSON.stringify({ error: 'Decoration ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    
    // Get original service
    const { data: originalDecoration, error: fetchError } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !originalDecoration) {
      return new Response(
        JSON.stringify({ error: 'Decoration not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Create duplicate data
    const { 
      id: _id, 
      created_at, 
      updated_at, 
      slug: originalSlug,
      name,
      ...decorationData 
    } = originalDecoration;

    // Generate new slug for duplicate
    const baseSlug = name
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
        .from('services')
        .select('id')
        .eq('slug', duplicateSlug)
        .single();
      
      if (!existing) break;
      duplicateSlug = `${baseSlug}-copia-${counter}`;
      counter++;
    }

    // No SKU field for services table

    const duplicateData = {
      ...decorationData,
      name: `${name} - Copia`,
      slug: duplicateSlug,
      status: 'draft' as const, // Set as draft by default
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: duplicateDecoration, error } = await supabase
      .from('services')
      .insert(duplicateData)
      .select(`
        *,
        provider:providers(id, company_name, slug, tier),
        category:categories(id, name, slug)
      `)
      .single();

    if (error) {
      console.error('Error duplicating decoration:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to duplicate decoration' }),
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
          target_type: 'service',
          target_id: duplicateDecoration.id,
          changes: { 
            duplicated_from: id, 
            original_name: originalDecoration.name 
          }
        });
    }

    return new Response(
      JSON.stringify({ decoration: duplicateDecoration }),
      { status: 201, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error duplicating decoration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};