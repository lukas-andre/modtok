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

  const { data: provider } = await supabase.from('providers').select('*').eq('id', id).single();
  if (!provider) {
    return new Response(JSON.stringify({ error: 'Provider no encontrado' }), { status: 404 });
  }

  const { data: landing } = await supabase.from('provider_landings').select('*').eq('provider_id', id).single();
  const { data: media } = await supabase.from('media_assets').select('*').eq('owner_type', 'provider_landing').eq('owner_id', id);

  const tier = getTierFromEntity('provider', provider, landing);
  const mediaAssets = groupMediaByRole(media || []);

  const validation = validatePublish({
    entityType: 'provider',
    entityId: id,
    tier,
    record: provider,
    mediaAssets,
    landingRecord: landing,
  });

  if (!validation.ok) {
    return new Response(JSON.stringify({ error: 'Validación fallida', errors: validation.errors }), { status: 422 });
  }

  const { error } = await supabase.from('providers').update({ status: 'active' }).eq('id', id);
  if (error) {
    return new Response(JSON.stringify({ error: 'Error al publicar' }), { status: 500 });
  }

  if (landing) {
    await supabase.from('provider_landings').update({ editorial_status: 'published', published_at: new Date().toISOString() }).eq('provider_id', id);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
