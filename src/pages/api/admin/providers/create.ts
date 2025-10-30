import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';
import type { ProviderInsert } from '@/lib/database.types';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check if user is admin
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const formData = await request.json();
    const {
      // Basic info
      company_name,
      email,
      phone,
      description,
      description_long,

      // Contact & location
      whatsapp,
      website,
      address,
      city,
      region,

      // SERVICES (NEW MODEL - Múltiples Servicios)
      is_manufacturer,
      is_service_provider,

      // Coverage regions (Schema v3)
      coverage_regions, // NEW Schema v3: array of region codes

      // Features (JSONB)
      features,

      // Tier and status
      tier = 'standard' as const,
      status = 'pending_review' as const,

      // Premium/featured settings
      featured_until,
      premium_until,
      featured_order,
      internal_rating,

      // EDITORIAL FLAGS (NEW)
      has_quality_images,
      has_complete_info,
      editor_approved_for_premium,
      has_landing_page,
      landing_slug,

      // SEO
      meta_title,
      meta_description,
      keywords,

      // Admin fields
      admin_notes
    } = formData;

    // Validation
    if (!company_name || !email || !phone) {
      return new Response(
        JSON.stringify({ error: 'Company name, email, and phone are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // NEW VALIDATION: At least one service must be selected
    if (!is_manufacturer && !is_service_provider) {
      return new Response(
        JSON.stringify({ error: 'Provider must offer at least one service (Manufacturer or H&S)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!['premium', 'destacado', 'standard'].includes(tier)) {
      return new Response(
        JSON.stringify({ error: 'Invalid tier' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Generate slug from company name
    const baseSlug = company_name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists and append number if needed
    let slug = baseSlug;
    let counter = 1;
    let slugExists = true;

    while (slugExists) {
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existingProvider) {
        slugExists = false;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Determine primary_category for backward compatibility
    // If is_manufacturer, use 'fabrica', else use 'habilitacion_servicios'
    const primary_category = is_manufacturer ? 'fabrica' : 'habilitacion_servicios';

    // Prepare provider data
    const providerData: ProviderInsert = {
      company_name,
      slug,
      email,
      phone,

      // NEW FIELDS: Multiple services support
      is_manufacturer: Boolean(is_manufacturer),
      is_service_provider: Boolean(is_service_provider),

      // Keep primary_category for backward compatibility
      primary_category: primary_category as 'fabrica' | 'habilitacion_servicios' | 'casas',

      description,
      description_long,
      whatsapp,
      website,
      address,
      city,
      region,

      // Features stored as JSONB
      features: features || {},

      tier: tier as 'premium' | 'destacado' | 'standard',
      status: status as 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected',
      featured_until: featured_until ? new Date(featured_until).toISOString() : null,
      premium_until: premium_until ? new Date(premium_until).toISOString() : null,
      featured_order: featured_order ? parseInt(featured_order) : null,
      internal_rating: internal_rating ? parseInt(internal_rating) : null,

      // Editorial flags
      has_quality_images: Boolean(has_quality_images),
      has_complete_info: Boolean(has_complete_info),
      editor_approved_for_premium: Boolean(editor_approved_for_premium),
      has_landing_page: Boolean(has_landing_page),
      landing_slug: landing_slug || null,

      // SEO
      meta_title,
      meta_description,
      keywords: keywords || [],
      admin_notes
    };

    // Set approval if status is active
    if (status === 'active') {
      providerData.approved_by = auth?.user?.id || null;
      providerData.approved_at = new Date().toISOString();
    }

    // Insert provider
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .insert(providerData)
      .select()
      .single();

    if (providerError) {
      console.error('Error creating provider:', providerError);
      return new Response(
        JSON.stringify({ error: 'Failed to create provider: ' + providerError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Insert coverage regions if provided (NEW Schema v3)
    if (coverage_regions && Array.isArray(coverage_regions) && coverage_regions.length > 0) {
      const regionInserts = coverage_regions.map((region_code: string) => ({
        provider_id: provider.id,
        region_code: region_code
      }));

      const { error: regionError } = await supabase
        .from('provider_coverage_regions')
        .insert(regionInserts);

      if (regionError) {
        console.error('Error creating provider coverage regions:', regionError);
        // Note: We don't fail the entire request if coverage regions fail
        // The provider was already created successfully
      }
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'create',
          target_type: 'provider',
          target_id: provider.id,
          changes: {
            created: {
              ...providerData,
              is_manufacturer,
              is_service_provider,
              has_quality_images,
              has_complete_info,
              editor_approved_for_premium,
              has_landing_page
            }
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Provider created successfully',
        provider: {
          id: provider.id,
          company_name: provider.company_name,
          slug: provider.slug,
          email: provider.email,
          tier: provider.tier,
          status: provider.status,
          is_manufacturer: provider.is_manufacturer,
          is_service_provider: provider.is_service_provider
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error creating provider:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create provider' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
