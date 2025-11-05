import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

/**
 * GET /api/admin/providers/:id/landing
 *
 * Obtiene la configuración de landing page de un fabricante
 */
export const GET: APIRoute = async ({ params, request, cookies }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Provider ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar autenticación y permisos de admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener información del provider y su landing
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, company_name, slug, is_manufacturer')
      .eq('id', id)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!provider.is_manufacturer) {
      return new Response(
        JSON.stringify({ error: 'Provider is not a manufacturer' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener landing page config (puede no existir)
    const { data: landing } = await supabase
      .from('provider_landings')
      .select('*')
      .eq('provider_id', id)
      .single();

    return new Response(
      JSON.stringify({
        provider: {
          id: provider.id,
          company_name: provider.company_name,
          slug: provider.slug,
          tier: landing?.tier || 'standard'
        },
        landing: landing || {
          enabled: false,
          slug: provider.slug,
          template: 'manufacturer',
          editorial_status: 'draft',
          meta_title: null,
          meta_description: null,
          og_image_url: null,
          sections: {}
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error fetching landing config:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * PUT /api/admin/providers/:id/landing
 *
 * Actualiza o crea la configuración de landing page de un fabricante
 */
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Provider ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar autenticación y permisos de admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que el usuario es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse body
    const body = await request.json();
    const {
      enabled,
      slug,
      template,
      editorial_status,
      meta_title,
      meta_description,
      og_image_url,
      sections
    } = body;

    // Validar campos requeridos
    if (typeof enabled !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'enabled is required and must be boolean' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!slug || typeof slug !== 'string') {
      return new Response(
        JSON.stringify({ error: 'slug is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar editorial_status
    const validStatuses = ['draft', 'review', 'published'];
    if (editorial_status && !validStatuses.includes(editorial_status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid editorial_status. Must be: draft, review, or published' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar que el provider existe y es manufacturer
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, is_manufacturer')
      .eq('id', id)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!provider.is_manufacturer) {
      return new Response(
        JSON.stringify({ error: 'Provider is not a manufacturer' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Upsert landing config
    const landingData: any = {
      provider_id: id,
      enabled,
      slug,
      template: template || 'manufacturer',
      editorial_status: editorial_status || 'draft',
      meta_title,
      meta_description,
      og_image_url,
      sections: sections || {},
      updated_by: session.user.id
    };

    // Si está pasando a published, agregar published_at
    if (editorial_status === 'published' && enabled) {
      landingData.published_at = new Date().toISOString();
    }

    const { data: landing, error: upsertError } = await supabase
      .from('provider_landings')
      .upsert(landingData, { onConflict: 'provider_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting landing:', upsertError);
      return new Response(
        JSON.stringify({ error: upsertError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Log admin action
    try {
      await supabase.from('admin_actions').insert({
        admin_id: session.user.id,
        action_type: 'update_landing',
        target_type: 'provider',
        target_id: id,
        changes: {
          enabled,
          editorial_status,
          slug
        }
      });
    } catch (logError) {
      console.error('Failed to log admin action:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        landing
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error updating landing config:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
