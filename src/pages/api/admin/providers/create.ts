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
      category_type,
      description,
      description_long,
      
      // Contact & location
      whatsapp,
      website,
      address,
      city,
      region,
      
      // Business details
      years_experience,
      certifications,
      specialties,
      services_offered,
      coverage_areas,
      
      // Pricing
      price_range_min,
      price_range_max,
      price_per_m2_min,
      price_per_m2_max,
      
      // Features
      llave_en_mano,
      financing_available,
      features,
      
      // Tier and status
      tier = 'standard' as const,
      status = 'pending_review' as const,
      
      // Premium/featured settings
      featured_until,
      premium_until,
      featured_order,
      internal_rating,
      
      // SEO
      meta_title,
      meta_description,
      keywords,
      
      // Admin fields
      admin_notes,
      temp_password
    } = formData;

    // Validation
    if (!company_name || !email || !phone || !category_type) {
      return new Response(
        JSON.stringify({ error: 'Company name, email, phone, and category are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!['casas', 'fabricantes', 'habilitacion_servicios', 'decoracion'].includes(category_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid category type' }),
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

    if (temp_password && temp_password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Temporary password must be at least 8 characters' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Generate slug from company name
    const slug = company_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if slug already exists
    const { data: existingProvider } = await supabase
      .from('providers')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingProvider) {
      return new Response(
        JSON.stringify({ error: 'A provider with this company name already exists' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare provider data
    const providerData: ProviderInsert = {
      company_name,
      slug,
      email,
      phone,
      category_type: category_type as 'casas' | 'fabricantes' | 'habilitacion_servicios' | 'decoracion',
      description,
      description_long,
      whatsapp,
      website,
      address,
      city,
      region,
      years_experience: years_experience ? parseInt(years_experience) : null,
      certifications: certifications || [],
      specialties: specialties || [],
      services_offered: services_offered || [],
      coverage_areas: coverage_areas || [],
      price_range_min: price_range_min ? parseFloat(price_range_min) : null,
      price_range_max: price_range_max ? parseFloat(price_range_max) : null,
      price_per_m2_min: price_per_m2_min ? parseFloat(price_per_m2_min) : null,
      price_per_m2_max: price_per_m2_max ? parseFloat(price_per_m2_max) : null,
      llave_en_mano: Boolean(llave_en_mano),
      financing_available: Boolean(financing_available),
      features: features || {},
      tier: tier as 'premium' | 'destacado' | 'standard',
      status: status as 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected',
      featured_until: featured_until ? new Date(featured_until).toISOString() : null,
      premium_until: premium_until ? new Date(premium_until).toISOString() : null,
      featured_order: featured_order ? parseInt(featured_order) : null,
      internal_rating: internal_rating ? parseInt(internal_rating) : null,
      meta_title,
      meta_description,
      keywords: keywords || [],
      admin_notes,
      temp_password: temp_password ? await hashPassword(temp_password) : null,
      created_by: auth?.user?.id || null,
      onboarding_completed: false
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
            created: providerData
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
          status: provider.status
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

// Simple password hashing function (in production, use bcrypt or similar)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}