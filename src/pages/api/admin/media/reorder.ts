/**
 * Media API - Bulk reorder assets
 */

import type { APIRoute } from 'astro';
import { createSupabaseClient } from '../../../../lib/supabase';

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { updates } = await request.json();
  
  if (!Array.isArray(updates)) {
    return new Response(JSON.stringify({ error: 'updates debe ser un array' }), { status: 400 });
  }

  // Update each asset's position
  const promises = updates.map(({ id, position }) =>
    supabase
      .from('media_assets')
      .update({ position })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    return new Response(JSON.stringify({ error: 'Error al reordenar media' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
