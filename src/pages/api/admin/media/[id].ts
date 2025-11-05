/**
 * Media API - Update and Delete specific asset
 */

import type { APIRoute } from 'astro';
import { createSupabaseClient } from '../../../../lib/supabase';

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { id } = params;
  const updates = await request.json();
  
  const { data, error } = await supabase
    .from('media_assets')
    .update({
      alt_text: updates.alt_text,
      caption: updates.caption,
      position: updates.position,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Error al actualizar media' }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const { id } = params;
  
  // Get asset info first to delete from storage
  const { data: asset } = await supabase
    .from('media_assets')
    .select('url')
    .eq('id', id)
    .single();

  if (asset?.url) {
    // Extract storage path from URL
    const urlParts = asset.url.split('/media-public/');
    if (urlParts.length > 1) {
      const storagePath = urlParts[1];
      await supabase.storage.from('media-public').remove([storagePath]);
    }
  }

  const { error } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: 'Error al eliminar media' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
