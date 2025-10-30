import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';
import { z } from 'zod';

// Zod schema para validación de manufacturer profile
const ManufacturerProfileSchema = z.object({
  // Servicios disponibles (#1-10)
  dise_std: z.boolean().optional(),
  dise_pers: z.boolean().optional(),
  insta_premontada: z.boolean().optional(),
  contr_terreno: z.boolean().optional(),
  instalacion: z.boolean().optional(),
  kit_autocons: z.boolean().optional(),
  ases_tecnica: z.boolean().optional(),
  ases_legal: z.boolean().optional(),
  logist_transporte: z.boolean().optional(),
  financiamiento: z.boolean().optional(),

  // Especialidad (#11-17)
  tiny_houses: z.boolean().optional(),
  modulares_sip: z.boolean().optional(),
  modulares_container: z.boolean().optional(),
  modulares_hormigon: z.boolean().optional(),
  modulares_madera: z.boolean().optional(),
  prefabricada_tradicional: z.boolean().optional(),
  oficinas_modulares: z.boolean().optional(),

  // Generales filtrables (#28-31)
  llave_en_mano: z.boolean().optional(),
  publica_precios: z.boolean().optional(),
  precio_ref_min_m2: z.number().positive().optional().nullable(),
  precio_ref_max_m2: z.number().positive().optional().nullable(),

  // Meta
  experiencia_years: z.number().int().min(0).optional().nullable(),
  verified_by_admin: z.boolean().optional()
});

type ManufacturerProfileInput = z.infer<typeof ManufacturerProfileSchema>;

// GET - Obtener perfil de fabricante
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
        JSON.stringify({ error: 'Provider ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Verificar que el provider existe y es fabricante
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, company_name, is_manufacturer')
      .eq('id', id)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    if (!provider.is_manufacturer) {
      return new Response(
        JSON.stringify({
          error: 'Provider is not a manufacturer',
          message: 'Only providers with is_manufacturer=true can have a manufacturer profile'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Obtener perfil de fabricante
    const { data: profile, error } = await supabase
      .from('manufacturer_profiles')
      .select('*')
      .eq('provider_id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching manufacturer profile:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch manufacturer profile' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Si no existe perfil, retornar 404
    if (!profile) {
      return new Response(
        JSON.stringify({
          error: 'Manufacturer profile not found',
          message: 'This manufacturer has not declared a profile yet'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ profile }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error in GET manufacturer-profile:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// PUT - Crear/actualizar perfil de fabricante (upsert)
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
        JSON.stringify({ error: 'Provider ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Verificar que el provider existe y es fabricante
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, company_name, is_manufacturer')
      .eq('id', id)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    if (!provider.is_manufacturer) {
      return new Response(
        JSON.stringify({
          error: 'Provider is not a manufacturer',
          message: 'Set is_manufacturer=true first before creating a manufacturer profile'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Parsear y validar body
    const body = await request.json();
    const validationResult = ManufacturerProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Validation failed',
          details: validationResult.error.flatten()
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const profileData: ManufacturerProfileInput = validationResult.data;

    // Obtener perfil existente para log de cambios
    const { data: existingProfile } = await supabase
      .from('manufacturer_profiles')
      .select('*')
      .eq('provider_id', id)
      .single();

    // Preparar datos para upsert
    const upsertData = {
      provider_id: id,
      ...profileData,
      declared_by: existingProfile ? existingProfile.declared_by : (auth?.user?.id || null),
      declared_at: existingProfile ? existingProfile.declared_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Upsert (INSERT o UPDATE)
    const { data: profile, error } = await supabase
      .from('manufacturer_profiles')
      .upsert(upsertData, {
        onConflict: 'provider_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting manufacturer profile:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save manufacturer profile: ' + error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: existingProfile ? 'update' : 'create',
          target_type: 'manufacturer_profile',
          target_id: id,
          changes: {
            before: existingProfile || null,
            after: profile
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: existingProfile ? 'Manufacturer profile updated' : 'Manufacturer profile created',
        profile
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error in PUT manufacturer-profile:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};
