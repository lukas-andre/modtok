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
    
    const { data: provider, error } = await supabase
      .from('providers')
      .select('*')
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

    // Get current provider data for change tracking
    const { data: currentProvider, error: fetchError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Process form data
    const {
      company_name,
      email,
      phone,
      category_type,
      description,
      description_long,
      whatsapp,
      website,
      address,
      city,
      region,
      years_experience,
      certifications,
      specialties,
      services_offered,
      coverage_areas,
      price_range_min,
      price_range_max,
      price_per_m2_min,
      price_per_m2_max,
      llave_en_mano,
      financing_available,
      features,
      tier,
      status,
      featured_until,
      premium_until,
      featured_order,
      internal_rating,
      meta_title,
      meta_description,
      keywords,
      admin_notes,
      rejection_reason,
      logo_url,
      cover_image_url,
      gallery_images,
      catalog_pdf_url
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

    // Prepare update data
    const updateData: ProviderUpdate = {
      ...(company_name !== undefined && { company_name }),
      ...(slug !== currentProvider.slug && { slug }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(category_type !== undefined && { category_type }),
      ...(description !== undefined && { description }),
      ...(description_long !== undefined && { description_long }),
      ...(whatsapp !== undefined && { whatsapp }),
      ...(website !== undefined && { website }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(region !== undefined && { region }),
      ...(years_experience !== undefined && { years_experience: years_experience ? parseInt(years_experience) : null }),
      ...(certifications !== undefined && { certifications }),
      ...(specialties !== undefined && { specialties }),
      ...(services_offered !== undefined && { services_offered }),
      ...(coverage_areas !== undefined && { coverage_areas }),
      ...(price_range_min !== undefined && { price_range_min: price_range_min ? parseFloat(price_range_min) : null }),
      ...(price_range_max !== undefined && { price_range_max: price_range_max ? parseFloat(price_range_max) : null }),
      ...(price_per_m2_min !== undefined && { price_per_m2_min: price_per_m2_min ? parseFloat(price_per_m2_min) : null }),
      ...(price_per_m2_max !== undefined && { price_per_m2_max: price_per_m2_max ? parseFloat(price_per_m2_max) : null }),
      ...(llave_en_mano !== undefined && { llave_en_mano: Boolean(llave_en_mano) }),
      ...(financing_available !== undefined && { financing_available: Boolean(financing_available) }),
      ...(features !== undefined && { features }),
      ...(tier !== undefined && { tier }),
      ...(status !== undefined && { status }),
      ...(featured_until !== undefined && { featured_until: featured_until ? new Date(featured_until).toISOString() : null }),
      ...(premium_until !== undefined && { premium_until: premium_until ? new Date(premium_until).toISOString() : null }),
      ...(featured_order !== undefined && { featured_order: featured_order ? parseInt(featured_order) : null }),
      ...(internal_rating !== undefined && { internal_rating: internal_rating ? parseInt(internal_rating) : null }),
      ...(meta_title !== undefined && { meta_title }),
      ...(meta_description !== undefined && { meta_description }),
      ...(keywords !== undefined && { keywords }),
      ...(admin_notes !== undefined && { admin_notes }),
      ...(rejection_reason !== undefined && { rejection_reason }),
      ...(logo_url !== undefined && { logo_url }),
      ...(cover_image_url !== undefined && { cover_image_url }),
      ...(gallery_images !== undefined && { gallery_images }),
      ...(catalog_pdf_url !== undefined && { catalog_pdf_url }),
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

    // Get provider data for logging
    const { data: provider, error: fetchError } = await supabase
      .from('providers')
      .select('*')
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