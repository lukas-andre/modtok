import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';
import type { ProviderInsert } from "@/lib/database.helpers";

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

      // Contact & location
      whatsapp,
      website,
      address,
      city,
      hq_region_code,

      // SERVICES (NEW MODEL - Múltiples Servicios)
      is_manufacturer,
      is_service_provider,

      // Coverage regions (NEW: array of region codes for service providers)
      coverage_regions,

      // Status
      status = 'draft' as const,

      // Admin fields
      admin_notes
    } = formData;

    // Validation
    if (!company_name || !email) {
      return new Response(
        JSON.stringify({ error: 'Company name and email are required' }),
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

    // Validate HQ region if provided
    if (!hq_region_code) {
      return new Response(
        JSON.stringify({ error: 'HQ region is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate coverage regions for service providers
    if (is_service_provider && (!coverage_regions || coverage_regions.length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Service providers must have at least one coverage region' }),
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

    // Ensure slug is unique by appending number if needed
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const { data: existingProvider, error: slugCheckError } = await supabase
        .from('providers')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (slugCheckError) {
        throw new Error(`Error checking slug uniqueness: ${slugCheckError.message}`);
      }

      if (!existingProvider) {
        isUnique = true;
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Prepare provider data (Provider Minimalista: identity only)
    const providerData: ProviderInsert = {
      company_name,
      slug,
      email,
      phone: phone || null,
      whatsapp: whatsapp || null,
      website: website || null,
      address: address || null,
      city: city || null,
      hq_region_code,

      // Service roles
      is_manufacturer: Boolean(is_manufacturer),
      is_service_provider: Boolean(is_service_provider),

      description: description || null,
      status: status as 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected',
      admin_notes: admin_notes || null
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
            created: providerData,
            coverage_regions: coverage_regions || []
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
          status: provider.status,
          is_manufacturer: provider.is_manufacturer,
          is_service_provider: provider.is_service_provider,
          hq_region_code: provider.hq_region_code
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
