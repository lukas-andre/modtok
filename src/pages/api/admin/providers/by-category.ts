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
    const category = searchParams.get('category');
    const includeAll = searchParams.get('include_all') === 'true';

    if (!category) {
      return new Response(
        JSON.stringify({ error: 'Category parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate category
    const validCategories = ['casas', 'fabrica', 'habilitacion_servicios'];
    if (!validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: 'Invalid category type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Filter providers by their role flags
    let query = supabase
      .from('providers')
      .select(`
        id,
        company_name,
        slug,
        email,
        phone,
        status,
        is_manufacturer,
        is_service_provider
      `)
      .eq('status', 'active')
      .order('company_name');

    // Apply category filter based on role
    if (category === 'fabrica') {
      query = query.eq('is_manufacturer', true);
    } else if (category === 'habilitacion_servicios') {
      query = query.eq('is_service_provider', true);
    } else if (category === 'casas') {
      // For 'casas', get manufacturers (they sell houses)
      query = query.eq('is_manufacturer', true);
    }

    const { data: providers, error } = await query;

    if (error) {
      console.error('Error fetching providers by category:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch providers' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Format response
    const formattedProviders = providers.map(p => ({
      id: p.id,
      company_name: p.company_name,
      slug: p.slug,
      email: p.email,
      phone: p.phone,
      status: p.status,
      is_manufacturer: p.is_manufacturer,
      is_service_provider: p.is_service_provider
    }));

    // Add "Select a provider" option if requested
    if (includeAll) {
      formattedProviders.unshift({
        id: '',
        company_name: '-- Seleccione un proveedor --',
        slug: '',
        email: '',
        phone: '',
        status: 'active',
        is_manufacturer: false,
        is_service_provider: false
      });
    }

    return new Response(
      JSON.stringify({ providers: formattedProviders }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error in providers by category:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};
