import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';
import type { MediaAssetInsert } from '@/lib/database.types';

// GET - List media assets for an owner
export const GET: APIRoute = async ({ request, cookies, url }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Get query parameters
    const ownerType = url.searchParams.get('ownerType');
    const ownerId = url.searchParams.get('ownerId');
    const kind = url.searchParams.get('kind');

    if (!ownerType || !ownerId) {
      return new Response(
        JSON.stringify({ error: 'ownerType and ownerId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Build query
    let query = supabase
      .from('media_assets')
      .select('*')
      .eq('owner_type', ownerType)
      .eq('owner_id', ownerId)
      .order('sort_order', { ascending: true });

    // Optional filter by kind
    if (kind) {
      query = query.eq('kind', kind);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching media assets:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch media assets' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ data: data || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error in GET /api/admin/media:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// POST - Upload media asset
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
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const ownerType = formData.get('ownerType') as string;
    const ownerId = formData.get('ownerId') as string;
    const kind = formData.get('kind') as string;
    const altText = formData.get('altText') as string | null;
    const caption = formData.get('caption') as string | null;
    const sortOrder = formData.get('sortOrder') as string | null;
    const metaJson = formData.get('meta') as string | null;

    // Validate required fields
    if (!file || !ownerType || !ownerId || !kind) {
      return new Response(
        JSON.stringify({ error: 'file, ownerType, ownerId, and kind are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate owner type
    const validOwnerTypes = ['provider', 'house', 'service_product', 'blog', 'news'];
    if (!validOwnerTypes.includes(ownerType)) {
      return new Response(
        JSON.stringify({ error: `Invalid ownerType. Must be one of: ${validOwnerTypes.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate kind
    const validKinds = ['image', 'video', 'pdf', 'plan'];
    if (!validKinds.includes(kind)) {
      return new Response(
        JSON.stringify({ error: `Invalid kind. Must be one of: ${validKinds.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate file type based on kind
    let allowedTypes: string[] = [];
    let maxSize: number = 10 * 1024 * 1024; // Default 10MB

    switch (kind) {
      case 'image':
        allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
        maxSize = 5 * 1024 * 1024; // 5MB for images
        break;
      case 'video':
        allowedTypes = ['video/mp4', 'video/webm'];
        maxSize = 50 * 1024 * 1024; // 50MB for videos
        break;
      case 'pdf':
        allowedTypes = ['application/pdf'];
        maxSize = 10 * 1024 * 1024; // 10MB for PDFs
        break;
      case 'plan':
        allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        maxSize = 10 * 1024 * 1024; // 10MB for plans
        break;
    }

    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error: `Invalid file type for ${kind}. Allowed types: ${allowedTypes.join(', ')}`
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      return new Response(
        JSON.stringify({ error: `File size too large. Maximum ${maxSizeMB}MB allowed for ${kind}.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;

    // Storage path: {ownerType}/{ownerId}/{kind}/{fileName}
    const storagePath = `${ownerType}/${ownerId}/${kind}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage (bucket: 'media')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file: ' + uploadError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath);

    if (!urlData?.publicUrl) {
      return new Response(
        JSON.stringify({ error: 'Failed to get public URL' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Parse meta JSON if provided
    let meta = {};
    if (metaJson) {
      try {
        meta = JSON.parse(metaJson);
      } catch (e) {
        console.error('Invalid meta JSON:', e);
      }
    }

    // Insert into media_assets table
    const mediaAsset: MediaAssetInsert = {
      owner_type: ownerType as any,
      owner_id: ownerId,
      kind: kind as any,
      url: urlData.publicUrl,
      alt_text: altText || null,
      caption: caption || null,
      sort_order: sortOrder ? parseInt(sortOrder) : 0,
      meta: meta
    };

    const { data: insertData, error: insertError } = await supabase
      .from('media_assets')
      .insert(mediaAsset)
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      // Try to delete uploaded file if DB insert fails
      await supabase.storage.from('media').remove([storagePath]);

      return new Response(
        JSON.stringify({ error: 'Failed to create media asset record: ' + insertError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'upload_media',
          target_type: 'media_asset',
          target_id: insertData.id,
          changes: {
            owner_type: ownerType,
            owner_id: ownerId,
            kind: kind,
            file_name: fileName,
            file_size: file.size,
            file_type: file.type,
            storage_path: storagePath,
            public_url: urlData.publicUrl
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Media asset uploaded successfully',
        mediaAsset: insertData
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error uploading media asset:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to upload media asset' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};
