import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';
import type { MediaAssetUpdate } from '@/lib/database.types';

// GET - Get single media asset
export const GET: APIRoute = async ({ request, cookies, params }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Media asset ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: 'Media asset not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error in GET /api/admin/media/[id]:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// PUT - Update media asset metadata
export const PUT: APIRoute = async ({ request, cookies, params }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Media asset ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const body = await request.json();

    const { alt_text, caption, meta, sort_order } = body;

    // Build update object
    const updates: MediaAssetUpdate = {
      updated_at: new Date().toISOString()
    };

    if (alt_text !== undefined) updates.alt_text = alt_text;
    if (caption !== undefined) updates.caption = caption;
    if (meta !== undefined) updates.meta = meta;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { data, error } = await supabase
      .from('media_assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update media asset: ' + error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'update_media',
          target_type: 'media_asset',
          target_id: id,
          changes: updates
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Media asset updated successfully',
        mediaAsset: data
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error updating media asset:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to update media asset' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// DELETE - Delete media asset
export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Media asset ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // First, get the media asset to get the storage path
    const { data: mediaAsset, error: fetchError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !mediaAsset) {
      return new Response(
        JSON.stringify({ error: 'Media asset not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Extract storage path from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/media/{path}
    const urlParts = mediaAsset.url.split('/media/');
    const storagePath = urlParts.length > 1 ? urlParts[1] : null;

    // Delete from storage if path exists
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([storagePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue anyway to delete DB record
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete media asset: ' + deleteError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'delete_media',
          target_type: 'media_asset',
          target_id: id,
          changes: {
            deleted_asset: {
              url: mediaAsset.url,
              owner_type: mediaAsset.owner_type,
              owner_id: mediaAsset.owner_id,
              kind: mediaAsset.kind
            }
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Media asset deleted successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error deleting media asset:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to delete media asset' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};
