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
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'blog';
    const post_id = formData.get('post_id') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, WebP and GIF are allowed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size too large. Maximum 10MB allowed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${originalName}`;
    
    // Determine storage path
    let storagePath: string;
    if (folder === 'featured' && post_id) {
      storagePath = `blog/featured/${post_id}/${fileName}`;
    } else if (folder === 'content' && post_id) {
      storagePath = `blog/content/${post_id}/${fileName}`;
    } else {
      storagePath = `blog/general/${fileName}`;
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload image: ' + uploadError.message }),
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

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'upload',
          target_type: 'blog_image',
          target_id: post_id,
          changes: {
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
        message: 'Image uploaded successfully',
        file: {
          name: fileName,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          path: storagePath
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error uploading image:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to upload image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};