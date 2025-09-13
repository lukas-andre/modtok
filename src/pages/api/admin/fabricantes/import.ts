import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';

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
      errors: [] as Array<{ row: number; error: string }>
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
        // Validate required fields
        if (!row.company_name || !row.email) {
          results.errors.push({
            row: i + 1,
            error: 'Missing required fields: company_name, email'
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

        // Convert numeric fields
        const numericFields = ['price_range_min', 'price_range_max', 'price_per_m2_min', 'price_per_m2_max', 'years_experience'];
        numericFields.forEach(field => {
          if (row[field] !== undefined && row[field] !== '') {
            row[field] = parseFloat(row[field]) || null;
          }
        });

        // Convert array fields
        const arrayFields = ['specialties', 'services_offered', 'coverage_areas'];
        arrayFields.forEach(field => {
          if (row[field] && typeof row[field] === 'string') {
            row[field] = row[field].split(',').map((item: string) => item.trim());
          }
        });

        // Prepare fabricante data
        const fabricanteData = {
          ...row,
          slug: finalSlug,
          category_type: 'fabricantes',
          created_by: auth.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'pending_review'
        };

        const { error } = await supabase
          .from('providers')
          .insert(fabricanteData);

        if (error) {
          results.errors.push({
            row: i + 1,
            error: error.message
          });
          results.failedRows++;
        } else {
          results.successfulRows++;
        }

      } catch (error: any) {
        results.errors.push({
          row: i + 1,
          error: error.message || 'Unknown error'
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

// GET - Download CSV template
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const csvTemplate = `company_name,email,phone,description,years_experience,specialties,services_offered,coverage_areas,price_range_min,price_range_max,address,city,region,website
"Constructora Ejemplo","contacto@ejemplo.com","+56912345678","Especialistas en construcción modular","10","Casas Modulares,Tiny Houses","Diseño,Instalación,Financiamiento","Santiago,Valparaíso",50000000,150000000,"Av. Ejemplo 123","Santiago","Metropolitana","https://ejemplo.com"`;

    return new Response(csvTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="fabricantes_template.csv"'
      }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};