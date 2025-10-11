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

    // Get providers that have this category
    const { data: providers, error } = await supabase
      .from('providers')
      .select(`
        id,
        company_name,
        slug,
        email,
        phone,
        status,
        tier,
        provider_categories!inner(category_type, is_primary)
      `)
      .eq('provider_categories.category_type', category as 'fabrica' | 'casas' | 'habilitacion_servicios')
      .eq('status', 'active')
      .order('company_name');

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
      tier: p.tier,
      categories: p.provider_categories?.map((pc: any) => pc.category_type) || []
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
        tier: 'standard',
        categories: []
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
