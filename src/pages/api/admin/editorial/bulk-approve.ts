import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, requireAdmin } from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies } as any);
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createSupabaseClient({ request, cookies } as any);
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: 'Items array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Group items by type
    const providerIds: string[] = [];
    const houseIds: string[] = [];
    const serviceIds: string[] = [];

    for (const item of body.items) {
      if (item.type === 'provider') {
        providerIds.push(item.id);
      } else if (item.type === 'house') {
        houseIds.push(item.id);
      } else if (item.type === 'service_product') {
        serviceIds.push(item.id);
      }
    }

    // Approve providers
    if (providerIds.length > 0) {
      const { error } = await supabase
        .from('providers')
        .update({
          has_quality_images: true,
          has_complete_info: true,
          editor_approved_for_premium: true,
          updated_at: new Date().toISOString()
        })
        .in('id', providerIds);

      if (error) {
        errors.push(`Providers: ${error.message}`);
        failedCount += providerIds.length;
      } else {
        successCount += providerIds.length;

        // Log admin actions
        if (user.id) {
          const actions = providerIds.map(id => ({
            admin_id: user.id,
            action_type: 'update' as const,
            entity_type: 'provider',
            entity_id: id,
            description: 'Approved for premium (bulk editorial review)'
          }));
          await supabase.from('admin_actions').insert(actions);
        }
      }
    }

    // Approve houses
    if (houseIds.length > 0) {
      const { error } = await supabase
        .from('houses')
        .update({
          has_quality_images: true,
          has_complete_info: true,
          editor_approved_for_premium: true,
          updated_at: new Date().toISOString()
        })
        .in('id', houseIds);

      if (error) {
        errors.push(`Houses: ${error.message}`);
        failedCount += houseIds.length;
      } else {
        successCount += houseIds.length;

        // Log admin actions
        if (user.id) {
          const actions = houseIds.map(id => ({
            admin_id: user.id,
            action_type: 'update' as const,
            entity_type: 'house',
            entity_id: id,
            description: 'Approved for premium (bulk editorial review)'
          }));
          await supabase.from('admin_actions').insert(actions);
        }
      }
    }

    // Approve service_products
    if (serviceIds.length > 0) {
      const { error } = await supabase
        .from('service_products')
        .update({
          has_quality_images: true,
          has_complete_info: true,
          editor_approved_for_premium: true,
          updated_at: new Date().toISOString()
        })
        .in('id', serviceIds);

      if (error) {
        errors.push(`Services: ${error.message}`);
        failedCount += serviceIds.length;
      } else {
        successCount += serviceIds.length;

        // Log admin actions
        if (user.id) {
          const actions = serviceIds.map(id => ({
            admin_id: user.id,
            action_type: 'update' as const,
            entity_type: 'service_product',
            entity_id: id,
            description: 'Approved for premium (bulk editorial review)'
          }));
          await supabase.from('admin_actions').insert(actions);
        }
      }
    }

    return new Response(JSON.stringify({
      success: successCount,
      failed: failedCount,
      errors,
      message: `Aprobados: ${successCount} | Errores: ${failedCount}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/admin/editorial/bulk-approve:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
