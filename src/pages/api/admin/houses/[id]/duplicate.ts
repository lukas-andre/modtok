import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ params, request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const houseId = params.id;

  if (!houseId) {
    return new Response(JSON.stringify({ error: 'House ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get the original house
    const { data: originalHouse, error: fetchError } = await supabase
      .from('houses')
      .select('*')
      .eq('id', houseId)
      .single();

    if (fetchError || !originalHouse) {
      return new Response(JSON.stringify({ error: 'House not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create duplicate house data without unique fields
    const { 
      id, 
      created_at, 
      updated_at, 
      views_count, 
      clicks_count, 
      saves_count, 
      inquiries_count,
      ...houseData 
    } = originalHouse;
    
    // Create new name and slug
    const duplicateData = {
      ...houseData,
      name: `${houseData.name} (Copia)`,
      slug: `${houseData.slug}-copia-${Date.now()}`,
      model_code: houseData.model_code ? `${houseData.model_code}-COPIA` : null,
      status: 'draft' as const // Set as draft by default
    };
    
    // Insert the duplicate
    const { data: newHouse, error: insertError } = await supabase
      .from('houses')
      .insert([duplicateData])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Log admin action
    if (user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: user.id,
        action_type: 'duplicate',
        target_type: 'house',
        target_id: newHouse.id,
        changes: { 
          duplicated_from: houseId,
          new_id: newHouse.id 
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: newHouse,
      message: 'House duplicated successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Error duplicating house:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to duplicate house' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};