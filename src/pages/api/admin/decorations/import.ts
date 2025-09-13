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
        target_type: 'services',
        target_id: null,
        changes: {
            import_type: 'decorations',
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
        if (!row.name || !row.provider_id) {
          results.errors.push({
            row: i + 1,
            error: 'Missing required fields: name, provider_id'
          });
          results.failedRows++;
          continue;
        }

        // Generate slug
        const slug = row.name
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
            .from('services')
            .select('id')
            .eq('slug', finalSlug)
            .single();
          
          if (!existing) break;
          finalSlug = `${slug}-${counter}`;
          counter++;
        }

        // Note: sku field not supported in services table

        // Convert numeric fields
        const numericFields = ['price_from', 'price_to'];
        numericFields.forEach(field => {
          if (row[field] !== undefined && row[field] !== '') {
            row[field] = parseFloat(row[field]) || null;
          }
        });

        // Convert array fields that exist in services table
        const arrayFields = ['gallery_images', 'keywords', 'coverage_areas'];
        arrayFields.forEach(field => {
          if (row[field] && typeof row[field] === 'string') {
            row[field] = row[field].split(',').map((item: string) => item.trim());
          }
        });

        // Prepare service data
        const serviceData = {
          ...row,
          slug: finalSlug,
          service_type: row.service_type || 'decoracion',
          status: 'pending_review'
        };

        const { error } = await supabase
          .from('services')
          .insert(serviceData);

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
        target_type: 'services',
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
    console.error('Error in decorations import:', error);
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

    const csvTemplate = `name,provider_id,category_id,product_type,brand,model,sku,description,price,price_wholesale,discount_percentage,stock_quantity,materials,colors,sizes,dimensions,installation_required,installation_price,delivery_time_days,warranty_months,keywords
"Lámpara LED Moderna","uuid-provider","uuid-category","Iluminación","LuminaTech","LED-2024","LT-LED-001","Lámpara LED moderna con control remoto",89990,69990,15,50,"Metal,Vidrio,Plástico","Blanco,Negro,Dorado","Grande,Mediano,Pequeño","{""alto"": 30, ""ancho"": 20, ""profundo"": 15}",false,0,7,24,"lámpara,LED,moderna,iluminación,hogar"`;

    return new Response(csvTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="decorations_template.csv"'
      }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};