import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';

/**
 * POST /api/admin/fabricantes/import
 *
 * Bulk import de fabricantes usando Provider minimalista model
 *
 * Estructura:
 * 1. Crea provider básico (identidad + HQ + roles)
 * 2. Crea manufacturer_profile si se declaran capabilities
 * 3. Crea provider_coverage_regions si se proveen regiones
 *
 * NO crea: tier, features corporativas, SEO, métricas
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const { data: importData } = await request.json();

    if (!importData || !Array.isArray(importData) || importData.length === 0) {
      return new Response(JSON.stringify({
        error: 'Invalid import data'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const results = {
      success: true,
      totalRows: importData.length,
      successfulRows: 0,
      failedRows: 0,
      errors: [] as Array<{ row: number; error: string; details?: string }>
    };

    // Log the import action
    if (auth.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'bulk_import',
          target_type: 'providers',
          target_id: null,
          changes: {
            import_type: 'fabricantes',
            model: 'provider_minimalista',
            file_name: 'bulk_import.csv',
            total_rows: importData.length,
            status: 'processing'
          }
        });
    }

    // Process each row
    for (let i = 0; i < importData.length; i++) {
      const row = importData[i];

      try {
        // Validate required fields (Provider minimalista)
        if (!row.company_name || !row.email) {
          results.errors.push({
            row: i + 1,
            error: 'Missing required fields',
            details: 'company_name and email are required'
          });
          results.failedRows++;
          continue;
        }

        // Generate slug
        const slug = row.company_name
          .toLowerCase()
          .replace(/[áàäâã]/g, 'a')
          .replace(/[éèëê]/g, 'e')
          .replace(/[íìïî]/g, 'i')
          .replace(/[óòöôõ]/g, 'o')
          .replace(/[úùüû]/g, 'u')
          .replace(/[ñ]/g, 'n')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Ensure slug is unique
        let finalSlug = slug;
        let counter = 1;
        while (true) {
          const { data: existing } = await supabase
            .from('providers')
            .select('id')
            .eq('slug', finalSlug)
            .single();

          if (!existing) break;
          finalSlug = `${slug}-${counter}`;
          counter++;
        }

        // Parse coverage regions if provided
        let coverageRegions: string[] = [];
        if (row.coverage_regions && typeof row.coverage_regions === 'string') {
          coverageRegions = row.coverage_regions
            .split(',')
            .map((r: string) => r.trim())
            .filter((r: string) => r.length > 0);
        } else if (Array.isArray(row.coverage_regions)) {
          coverageRegions = row.coverage_regions;
        }

        // 1. Create Provider (identidad corporativa ONLY)
        const providerData = {
          // Identidad
          company_name: row.company_name,
          slug: finalSlug,
          email: row.email,
          phone: row.phone || null,
          whatsapp: row.whatsapp || null,
          website: row.website || null,
          description: row.description || null,

          // HQ Location
          address: row.address || null,
          city: row.city || null,
          hq_region_code: row.hq_region_code || null,

          // Roles (flags)
          is_manufacturer: true, // Importing fabricantes = manufacturers
          is_service_provider: row.is_service_provider === true || row.is_service_provider === 'true' || false,

          // Moderation
          status: row.status || 'pending_review',
          admin_notes: row.admin_notes || null,

          // Metadata
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: provider, error: providerError } = await supabase
          .from('providers')
          .insert([providerData])
          .select('id')
          .single();

        if (providerError) {
          throw new Error(`Provider insert failed: ${providerError.message}`);
        }

        const providerId = provider.id;

        // 2. Create manufacturer_profile if capabilities are declared
        const hasCapabilities = row.dise_std || row.dise_pers || row.instalacion ||
                                row.financiamiento || row.llave_en_mano ||
                                row.tiny_houses || row.modulares_sip || row.modulares_madera;

        if (hasCapabilities) {
          const profileData = {
            provider_id: providerId,

            // Servicios Disponibles
            dise_std: row.dise_std === true || row.dise_std === 'true' || false,
            dise_pers: row.dise_pers === true || row.dise_pers === 'true' || false,
            insta_premontada: row.insta_premontada === true || row.insta_premontada === 'true' || false,
            contr_terreno: row.contr_terreno === true || row.contr_terreno === 'true' || false,
            instalacion: row.instalacion === true || row.instalacion === 'true' || false,
            kit_autocons: row.kit_autocons === true || row.kit_autocons === 'true' || false,
            ases_tecnica: row.ases_tecnica === true || row.ases_tecnica === 'true' || false,
            ases_legal: row.ases_legal === true || row.ases_legal === 'true' || false,
            logist_transporte: row.logist_transporte === true || row.logist_transporte === 'true' || false,
            financiamiento: row.financiamiento === true || row.financiamiento === 'true' || false,

            // Especialidad
            tiny_houses: row.tiny_houses === true || row.tiny_houses === 'true' || false,
            modulares_sip: row.modulares_sip === true || row.modulares_sip === 'true' || false,
            modulares_container: row.modulares_container === true || row.modulares_container === 'true' || false,
            modulares_hormigon: row.modulares_hormigon === true || row.modulares_hormigon === 'true' || false,
            modulares_madera: row.modulares_madera === true || row.modulares_madera === 'true' || false,
            prefabricada_tradicional: row.prefabricada_tradicional === true || row.prefabricada_tradicional === 'true' || false,
            oficinas_modulares: row.oficinas_modulares === true || row.oficinas_modulares === 'true' || false,

            // Generales
            llave_en_mano: row.llave_en_mano === true || row.llave_en_mano === 'true' || false,
            publica_precios: row.publica_precios === true || row.publica_precios === 'true' || false,
            precio_ref_min_m2: row.precio_ref_min_m2 ? parseFloat(row.precio_ref_min_m2) : null,
            precio_ref_max_m2: row.precio_ref_max_m2 ? parseFloat(row.precio_ref_max_m2) : null,
            experiencia_years: row.experiencia_years ? parseInt(row.experiencia_years) : null,

            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: profileError } = await supabase
            .from('manufacturer_profiles')
            .insert([profileData]);

          if (profileError) {
            // Rollback provider if profile fails
            await supabase
              .from('providers')
              .delete()
              .eq('id', providerId);

            throw new Error(`Manufacturer profile insert failed: ${profileError.message}`);
          }
        }

        // 3. Create provider_coverage_regions if provided
        if (coverageRegions.length > 0) {
          const coverageInserts = coverageRegions.map(region_code => ({
            provider_id: providerId,
            region_code: region_code
          }));

          const { error: coverageError } = await supabase
            .from('provider_coverage_regions')
            .insert(coverageInserts);

          if (coverageError) {
            // Log warning but don't fail import
            console.warn(`Coverage regions insert warning for provider ${providerId}:`, coverageError);
          }
        }

        results.successfulRows++;

      } catch (error: any) {
        results.errors.push({
          row: i + 1,
          error: error.message || 'Unknown error',
          details: error.details || error.hint
        });
        results.failedRows++;
      }
    }

    // Log import completion
    if (auth.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'bulk_import_complete',
          target_type: 'providers',
          target_id: null,
          changes: {
            successful_rows: results.successfulRows,
            failed_rows: results.failedRows,
            errors: results.errors,
            status: results.failedRows === 0 ? 'completed' : 'completed_with_errors'
          }
        });
    }

    results.success = results.failedRows === 0;

    return new Response(
      JSON.stringify(results),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in fabricantes import:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

/**
 * GET /api/admin/fabricantes/import
 *
 * Download CSV template for Provider minimalista + manufacturer_profiles
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // CSV Template for Provider minimalista + manufacturer_profiles
    const csvTemplate = `company_name,email,phone,whatsapp,website,description,address,city,hq_region_code,coverage_regions,is_service_provider,dise_std,dise_pers,insta_premontada,contr_terreno,instalacion,kit_autocons,ases_tecnica,ases_legal,logist_transporte,financiamiento,tiny_houses,modulares_sip,modulares_container,modulares_hormigon,modulares_madera,prefabricada_tradicional,oficinas_modulares,llave_en_mano,publica_precios,precio_ref_min_m2,precio_ref_max_m2,experiencia_years,status,admin_notes
"Constructora Modular Ejemplo","contacto@ejemplo.com","+56912345678","+56912345678","https://ejemplo.com","Especialistas en construcción modular sustentable","Av. Providencia 123","Santiago","RM","RM,V,VIII",false,true,true,false,false,true,false,true,false,true,true,true,true,false,false,true,false,false,true,true,25000,45000,15,"pending_review","Importado desde CSV ejemplo"`;

    return new Response(csvTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="fabricantes_minimalista_template.csv"'
      }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};
