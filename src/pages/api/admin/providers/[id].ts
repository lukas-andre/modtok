import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';
import type { ProviderUpdate } from '@/lib/database.types';

// GET - Fetch single provider
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

    console.log('API: Attempting to fetch provider with ID:', id);

    // Fetch provider with coverage regions - Provider minimalista model
    const { data: provider, error } = await supabase
      .from('providers')
      .select(`
        id,
        company_name,
        slug,
        email,
        phone,
        whatsapp,
        website,
        description,
        address,
        city,
        hq_region_code,
        is_manufacturer,
        is_service_provider,
        status,
        profile_id,
        approved_by,
        approved_at,
        rejection_reason,
        admin_notes,
        created_at,
        updated_at,
        coverage_regions:provider_coverage_regions(
          region_code,
          region:regions_lkp(code, name)
        )
      `)
      .eq('id', id)
      .single();

    console.log('API: Provider fetch result:', { provider, error });

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ provider }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// PUT - Update provider
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

    const formData = await request.json();
    const supabase = createSupabaseClient({ request, cookies });

    // Get current provider data for change tracking - Provider minimalista model
    const { data: currentProvider, error: fetchError } = await supabase
      .from('providers')
      .select(`
        id,
        company_name,
        slug,
        email,
        phone,
        whatsapp,
        website,
        description,
        address,
        city,
        hq_region_code,
        is_manufacturer,
        is_service_provider,
        status,
        profile_id,
        approved_by,
        approved_at,
        rejection_reason,
        admin_notes,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Process form data - Provider minimalista model
    const {
      // Identity fields
      company_name,
      email,
      phone,
      whatsapp,
      website,
      description,

      // HQ Location
      address,
      city,
      hq_region_code,

      // Capabilities
      is_manufacturer,
      is_service_provider,

      // Coverage
      coverage_regions, // Array of region codes

      // Moderation
      status,
      admin_notes,
      rejection_reason
    } = formData;

    // Generate new slug if company name changed
    let slug = currentProvider.slug;
    if (company_name && company_name !== currentProvider.company_name) {
      slug = company_name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if new slug already exists
      const { data: existingProvider } = await supabase
        .from('providers')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (existingProvider) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Validation: At least one service must be selected
    const finalIsManufacturer = is_manufacturer !== undefined ? is_manufacturer : currentProvider.is_manufacturer;
    const finalIsServiceProvider = is_service_provider !== undefined ? is_service_provider : currentProvider.is_service_provider;

    if (!finalIsManufacturer && !finalIsServiceProvider) {
      return new Response(
        JSON.stringify({ error: 'Provider must offer at least one service (Manufacturer or H&S)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Prepare update data - Provider minimalista
    const updateData: ProviderUpdate = {
      // Identity
      ...(company_name !== undefined && { company_name }),
      ...(slug !== currentProvider.slug && { slug }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(website !== undefined && { website }),
      ...(description !== undefined && { description }),

      // HQ Location
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(hq_region_code !== undefined && { hq_region_code }),

      // Capabilities
      ...(is_manufacturer !== undefined && { is_manufacturer: Boolean(is_manufacturer) }),
      ...(is_service_provider !== undefined && { is_service_provider: Boolean(is_service_provider) }),

      // Moderation
      ...(status !== undefined && { status }),
      ...(admin_notes !== undefined && { admin_notes }),
      ...(rejection_reason !== undefined && { rejection_reason }),

      updated_at: new Date().toISOString()
    };

    // Handle approval status changes
    if (status === 'active' && currentProvider.status !== 'active') {
      updateData.approved_by = auth?.user?.id || null;
      updateData.approved_at = new Date().toISOString();
    } else if (status !== 'active' && currentProvider.status === 'active') {
      updateData.approved_by = null;
      updateData.approved_at = null;
    }

    // Update provider
    const { data: updatedProvider, error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to update provider: ' + error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Update coverage regions if provided
    if (coverage_regions !== undefined && Array.isArray(coverage_regions)) {
      // First, delete existing coverage regions
      await supabase
        .from('provider_coverage_regions')
        .delete()
        .eq('provider_id', id);

      // Then insert new coverage regions
      if (coverage_regions.length > 0) {
        const regionInserts = coverage_regions.map((region_code: string) => ({
          provider_id: id,
          region_code: region_code
        }));

        const { error: regionError } = await supabase
          .from('provider_coverage_regions')
          .insert(regionInserts);

        if (regionError) {
          console.error('Error updating provider coverage regions:', regionError);
          return new Response(
            JSON.stringify({ error: 'Failed to update coverage regions: ' + regionError.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' }}
          );
        }
      }
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'update',
          target_type: 'provider',
          target_id: id,
          changes: {
            before: currentProvider,
            after: updateData
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Provider updated successfully',
        provider: updatedProvider
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// DELETE - Delete provider
export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Super admin access required.' }),
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

    // Get provider data for logging - Provider minimalista model
    const { data: provider, error: fetchError } = await supabase
      .from('providers')
      .select(`
        id,
        company_name,
        email,
        status,
        is_manufacturer,
        is_service_provider
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Delete provider (this will cascade to related records)
    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete provider: ' + error.message }),
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
          target_type: 'provider',
          target_id: id,
          changes: {
            deleted: provider
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Provider deleted successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};