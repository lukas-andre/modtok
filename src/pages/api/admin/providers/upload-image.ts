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
    const providerId = formData.get('providerId') as string;
    const imageType = formData.get('imageType') as string; // 'logo', 'cover', 'gallery'
    
    if (!file || !providerId || !imageType) {
      return new Response(
        JSON.stringify({ error: 'File, provider ID, and image type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate image type
    if (!['logo', 'cover', 'gallery'].includes(imageType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid image type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (imageType === 'logo') {
      allowedTypes.push('image/svg+xml');
    }

    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, WebP' + (imageType === 'logo' ? ', and SVG' : '') + ' are allowed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate file size
    const maxSizes = {
      logo: 2 * 1024 * 1024, // 2MB
      cover: 5 * 1024 * 1024, // 5MB
      gallery: 5 * 1024 * 1024 // 5MB
    };

    if (file.size > maxSizes[imageType as keyof typeof maxSizes]) {
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size for ${imageType} is ${maxSizes[imageType as keyof typeof maxSizes] / (1024 * 1024)}MB.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Verify provider exists
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, slug')
      .eq('id', providerId)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ error: 'Provider not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Determine bucket and path
    const buckets = {
      logo: 'provider-logos',
      cover: 'provider-covers',
      gallery: 'provider-gallery'
    };

    const bucket = buckets[imageType as keyof typeof buckets];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const fileName = `${providerId}/${imageType}_${timestamp}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
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
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    // Update provider record with new image URL
    let updateField: string;
    let updateValue: any;

    switch (imageType) {
      case 'logo':
        updateField = 'logo_url';
        updateValue = publicUrl;
        break;
      case 'cover':
        updateField = 'cover_image_url';
        updateValue = publicUrl;
        break;
      case 'gallery':
        // For gallery images, we need to add to the existing array
        const { data: currentProvider } = await supabase
          .from('providers')
          .select('gallery_images')
          .eq('id', providerId)
          .single();

        const currentImages = currentProvider?.gallery_images || [];
        updateField = 'gallery_images';
        updateValue = [...currentImages, publicUrl];
        break;
      default:
        throw new Error('Invalid image type');
    }

    // Update provider with new image URL
    const { error: updateError } = await supabase
      .from('providers')
      .update({
        [updateField]: updateValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', providerId);

    if (updateError) {
      // If provider update fails, try to delete the uploaded image
      await supabase.storage
        .from(bucket)
        .remove([fileName]);

      return new Response(
        JSON.stringify({ error: 'Failed to update provider with image URL: ' + updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth.user) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'upload_image',
          target_type: 'provider',
          target_id: providerId,
          changes: {
            image_type: imageType,
            file_name: fileName,
            url: publicUrl
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Image uploaded successfully',
        url: publicUrl,
        fileName: fileName
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Image upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to upload image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// DELETE - Remove image
export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { url, providerId, imageType } = await request.json();

    if (!url || !providerId || !imageType) {
      return new Response(
        JSON.stringify({ error: 'URL, provider ID, and image type are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Extract file path from URL
    const urlParts = url.split('/');
    const fileName = urlParts.slice(-2).join('/'); // providerId/filename

    // Determine bucket
    const buckets = {
      logo: 'provider-logos',
      cover: 'provider-covers',
      gallery: 'provider-gallery'
    };

    const bucket = buckets[imageType as keyof typeof buckets];

    // Remove from storage
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Continue with database update even if storage delete fails
    }

    // Update provider record
    let updateData: any = { updated_at: new Date().toISOString() };

    switch (imageType) {
      case 'logo':
        updateData.logo_url = null;
        break;
      case 'cover':
        updateData.cover_image_url = null;
        break;
      case 'gallery':
        // Remove from gallery array
        const { data: currentProvider } = await supabase
          .from('providers')
          .select('gallery_images')
          .eq('id', providerId)
          .single();

        const currentImages = currentProvider?.gallery_images || [];
        updateData.gallery_images = currentImages.filter((img: string) => img !== url);
        break;
    }

    const { error: updateError } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', providerId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update provider: ' + updateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth.user) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'remove_image',
          target_type: 'provider',
          target_id: providerId,
          changes: {
            image_type: imageType,
          removed_url: url
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Image removed successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};