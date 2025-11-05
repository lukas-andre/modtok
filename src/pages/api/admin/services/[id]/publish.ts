import type { APIRoute } from 'astro';
import { createSupabaseClient } from '../../../../../lib/supabase';
import { validatePublish, groupMediaByRole, getTierFromEntity } from '../../../../../lib/validation/publishValidation';

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { id } = params;

  const { data: service } = await supabase.from('service_products').select('*').eq('id', id).single();
  if (!service) {
    return new Response(JSON.stringify({ error: 'Servicio no encontrado' }), { status: 404 });
  }

  const { data: media } = await supabase.from('media_assets').select('*').eq('owner_type', 'service_product').eq('owner_id', id);

  const tier = getTierFromEntity('service', service);
  const mediaAssets = groupMediaByRole(media || []);

  const validation = validatePublish({
    entityType: 'service',
    entityId: id,
    tier,
    record: service,
    mediaAssets,
  });

  if (!validation.ok) {
    return new Response(JSON.stringify({ error: 'Validación fallida', errors: validation.errors }), { status: 422 });
  }

  const { error } = await supabase.from('service_products').update({ status: 'active' }).eq('id', id);
  if (error) {
    return new Response(JSON.stringify({ error: 'Error al publicar' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
