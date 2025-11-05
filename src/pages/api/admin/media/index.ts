/**
 * Media API Endpoints - GET and POST
 */

import type { APIRoute } from 'astro';
import { createSupabaseClient } from '../../../../lib/supabase';

export const GET: APIRoute = async ({ request, cookies, url }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const ownerType = url.searchParams.get('ownerType');
  const ownerId = url.searchParams.get('ownerId');
  
  if (!ownerType || !ownerId) {
    return new Response(JSON.stringify({ error: 'ownerType y ownerId requeridos' }), { status: 400 });
  }

  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('owner_type', ownerType)
    .eq('owner_id', ownerId)
    .order('position', { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener media' }), { status: 500 });
  }

  return new Response(JSON.stringify(data || []), { status: 200 });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseClient({ request, cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const ownerType = formData.get('ownerType') as string;
  const ownerId = formData.get('ownerId') as string;
  const ownerContext = (formData.get('ownerContext') as string) || 'product';
  const role = formData.get('role') as string;
  const position = parseInt((formData.get('position') as string) || '0', 10);

  if (!file || !ownerType || !ownerId || !role) {
    return new Response(JSON.stringify({ error: 'Campos requeridos faltantes' }), { status: 400 });
  }

  // Determine kind from file type
  let kind = 'image';
  if (file.type === 'application/pdf') kind = 'pdf';
  else if (file.type.startsWith('video/')) kind = 'video';

  // Upload to storage
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const cleanRole = role.replace(/_/g, '-');
  const storagePath = `${ownerType}/${ownerId}/${ownerContext}/${cleanRole}/${timestamp}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('media-public')
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    return new Response(JSON.stringify({ error: 'Error al subir archivo' }), { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from('media-public').getPublicUrl(storagePath);
  
  const { data: assetData, error: assetError } = await supabase
    .from('media_assets')
    .insert({
      owner_type: ownerType,
      owner_id: ownerId,
      owner_context: ownerContext,
      role,
      kind,
      url: publicUrlData.publicUrl,
      position,
    })
    .select()
    .single();

  if (assetError) {
    await supabase.storage.from('media-public').remove([storagePath]);
    return new Response(JSON.stringify({ error: 'Error al guardar media' }), { status: 500 });
  }

  return new Response(JSON.stringify(assetData), { status: 201 });
};
