import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
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
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'bulk_import',
        target_type: 'houses',
        target_id: null,
        changes: {
          import_type: 'houses',
          file_name: 'bulk_import.csv',
          total_rows: importData.length,
          status: 'processing'
        }
      });

    // Process each row
    for (let i = 0; i < importData.length; i++) {
      const row = importData[i];
      const rowNumber = row._originalRowNumber || i + 1;
      
      try {
        // Validate required fields
        if (!row.name || !row.provider_id) {
          throw new Error('Missing required fields: name and provider_id');
        }

        // Generate slug if not provided
        if (!row.slug) {
          row.slug = row.name
            .toLowerCase()
            .replace(/[áàäâã]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöôõ]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }

        // Check if slug exists
        const { data: existing } = await supabase
          .from('houses')
          .select('id')
          .eq('slug', row.slug)
          .single();
        
        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from('houses')
            .update(row)
            .eq('id', existing.id);
          
          if (updateError) throw updateError;
        } else {
          // Insert new
          const { error: insertError } = await supabase
            .from('houses')
            .insert([row]);
          
          if (insertError) throw insertError;
        }
        
        results.successfulRows++;
      } catch (error: any) {
        results.failedRows++;
        results.errors.push({
          row: rowNumber,
          error: error.message || 'Unknown error'
        });
      }
    }

    // Log import completion
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'bulk_import_complete',
        target_type: 'houses', 
        target_id: null,
        changes: {
          successful_rows: results.successfulRows,
          failed_rows: results.failedRows,
          errors: results.errors,
          status: results.failedRows === 0 ? 'completed' : 'completed_with_errors'
        }
      });

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'bulk_import',
        target_type: 'house',
        changes: { 
          total_rows: results.totalRows,
          successful: results.successfulRows,
          failed: results.failedRows
        }
      });
    }

    return new Response(JSON.stringify(results), {
      status: results.failedRows === 0 ? 200 : 207,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error importing houses:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to import houses' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Export template
export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Generate CSV template
  const headers = [
    'name',
    'slug',
    'sku',
    'model_code',
    'provider_id',
    'topology_id',
    'description',
    'description_long',
    'bedrooms',
    'bathrooms',
    'area_m2',
    'area_built_m2',
    'floors',
    'price',
    'price_opportunity',
    'price_per_m2',
    'currency',
    'main_material',
    'technology_materials',
    'windows_type',
    'services_included',
    'llave_en_mano',
    'expandable',
    'mobile',
    'off_grid_ready',
    'sustainable',
    'smart_home',
    'energy_rating',
    'main_image_url',
    'gallery_images',
    'delivery_time_days',
    'assembly_time_days',
    'warranty_years',
    'status',
    'tier',
    'meta_title',
    'meta_description',
    'keywords'
  ];

  const csvContent = headers.join(',') + '\n';
  
  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="houses_import_template.csv"'
    }
  });
};