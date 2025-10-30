import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';

// PATCH - Batch update sort_order for media assets
export const PATCH: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const body = await request.json();

    const { updates } = body;

    if (!updates || !Array.isArray(updates)) {
      return new Response(
        JSON.stringify({ error: 'updates array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Validate updates format
    for (const update of updates) {
      if (!update.id || typeof update.sortOrder !== 'number') {
        return new Response(
          JSON.stringify({ error: 'Each update must have id and sortOrder' }),
          { status: 400, headers: { 'Content-Type': 'application/json' }}
        );
      }
    }

    // Execute batch updates
    const updatePromises = updates.map(async (update: { id: string; sortOrder: number }) => {
      return supabase
        .from('media_assets')
        .update({
          sort_order: update.sortOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id);
    });

    const results = await Promise.all(updatePromises);

    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Reorder errors:', errors);
      return new Response(
        JSON.stringify({
          error: 'Some updates failed',
          details: errors.map(e => e.error?.message)
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'reorder_media',
          target_type: 'media_asset',
          target_id: null,
          changes: {
            updates: updates.map((u: any) => ({
              id: u.id,
              new_sort_order: u.sortOrder
            }))
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Media assets reordered successfully',
        updated_count: updates.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error reordering media assets:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to reorder media assets' }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};
