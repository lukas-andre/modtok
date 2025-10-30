import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

/**
 * GET /api/manufacturers
 *
 * Endpoint público para listar fabricantes con filtros avanzados.
 * Consulta la vista manufacturer_facets_effective que combina:
 * - Capabilities verificadas (desde houses)
 * - Capabilities declaradas (desde manufacturer_profiles)
 *
 * Query params soportados:
 * - regions: string[] (ej: "RM,V,VIII")
 * - servicios: string[] (dise_pers,instalacion,financiamiento)
 * - especialidad: string[] (modulares_sip,tiny_houses)
 * - llave_en_mano: boolean
 * - publica_precios: boolean
 * - price_m2_min: number
 * - price_m2_max: number
 * - verifiedOnly: boolean (solo fabricantes con casas publicadas)
 * - page: number (default: 1)
 * - limit: number (default: 30, max: 100)
 * - sort: "premium_first" | "house_count" | "price_m2_min" | "name"
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const searchParams = new URL(request.url).searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 100);
    const offset = (page - 1) * limit;

    // Filtros
    const regionsParam = searchParams.get('regions');
    const serviciosParam = searchParams.get('servicios');
    const especialidadParam = searchParams.get('especialidad');
    const llaveEnMano = searchParams.get('llave_en_mano');
    const publicaPrecios = searchParams.get('publica_precios');
    const priceM2Min = searchParams.get('price_m2_min');
    const priceM2Max = searchParams.get('price_m2_max');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const sort = searchParams.get('sort') || 'name';

    // Parsear arrays de filtros
    const regions = regionsParam ? regionsParam.split(',').map(r => r.trim()) : null;
    const servicios = serviciosParam ? serviciosParam.split(',').map(s => s.trim()) : null;
    const especialidad = especialidadParam ? especialidadParam.split(',').map(e => e.trim()) : null;

    // Build query desde la vista manufacturer_facets_effective
    let query = supabase
      .from('manufacturer_facets_effective')
      .select('*', { count: 'exact' });

    // Filtro: verifiedOnly (solo fabricantes con casas)
    if (verifiedOnly) {
      query = query.eq('has_verified', true);
    }

    // Filtro: regions (al menos una región en common)
    if (regions && regions.length > 0) {
      // Usar overlaps para arrays
      query = query.overlaps('regions', regions);
    }

    // Filtros de servicios disponibles
    if (servicios && servicios.length > 0) {
      servicios.forEach(servicio => {
        const validServicios = [
          'dise_std', 'dise_pers', 'insta_premontada', 'contr_terreno',
          'instalacion', 'kit_autocons', 'ases_tecnica', 'ases_legal',
          'logist_transporte', 'financiamiento'
        ];
        if (validServicios.includes(servicio)) {
          query = query.eq(servicio, true);
        }
      });
    }

    // Filtros de especialidad
    if (especialidad && especialidad.length > 0) {
      especialidad.forEach(esp => {
        const validEspecialidades = [
          'tiny_houses', 'modulares_sip', 'modulares_container',
          'modulares_hormigon', 'modulares_madera', 'prefabricada_tradicional',
          'oficinas_modulares'
        ];
        if (validEspecialidades.includes(esp)) {
          query = query.eq(esp, true);
        }
      });
    }

    // Filtros generales
    if (llaveEnMano === 'true') {
      query = query.eq('llave_en_mano', true);
    }

    if (publicaPrecios === 'true') {
      query = query.eq('publica_precios', true);
    }

    // Filtros de precio por m²
    if (priceM2Min) {
      query = query.gte('price_m2_min', parseFloat(priceM2Min));
    }

    if (priceM2Max) {
      query = query.lte('price_m2_max', parseFloat(priceM2Max));
    }

    // Sorting
    switch (sort) {
      case 'premium_first':
        query = query.order('house_premium_count', { ascending: false, nullsFirst: false })
                    .order('house_count', { ascending: false })
                    .order('company_name', { ascending: true });
        break;

      case 'house_count':
        query = query.order('house_count', { ascending: false, nullsFirst: false })
                    .order('company_name', { ascending: true });
        break;

      case 'price_m2_min':
        query = query.order('price_m2_min', { ascending: true, nullsFirst: false })
                    .order('company_name', { ascending: true });
        break;

      case 'name':
      default:
        query = query.order('company_name', { ascending: true });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: manufacturers, error, count } = await query;

    if (error) {
      console.error('Error fetching manufacturers:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch manufacturers' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Calcular pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    // Log analytics event (opcional)
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'api_call',
        event_category: 'manufacturers',
        event_action: 'filter',
        event_label: searchParams.toString(),
        target_type: 'endpoint',
        page_url: '/api/manufacturers'
      });
    } catch (analyticsError) {
      // No fallar si el log falla
      console.error('Analytics log error:', analyticsError);
    }

    return new Response(
      JSON.stringify({
        manufacturers: manufacturers || [],
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasMore,
          hasPrev: page > 1
        },
        filters: {
          regions,
          servicios,
          especialidad,
          llave_en_mano: llaveEnMano === 'true',
          publica_precios: publicaPrecios === 'true',
          price_m2_min: priceM2Min ? parseFloat(priceM2Min) : null,
          price_m2_max: priceM2Max ? parseFloat(priceM2Max) : null,
          verifiedOnly
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache 5 minutos
        }
      }
    );

  } catch (error: any) {
    console.error('Error in manufacturers endpoint:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};
