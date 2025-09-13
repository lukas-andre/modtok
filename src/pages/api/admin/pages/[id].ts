import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, requireAdmin } from '@/lib/auth';

export const GET: APIRoute = async ({ request, cookies, params }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const auth = await getAdminAuth({ request, cookies });
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Page ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: page, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: 'Page not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ page }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching page:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const auth = await getAdminAuth({ request, cookies });
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Page ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();

    // Prepare update data
    const updateData: any = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      featured_image_url: body.featured_image_url,
      status: body.status,
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      keywords: body.keywords || [],
      updated_by: user.id,
      updated_at: new Date().toISOString()
    };

    // Only update slug for non-system pages
    if (body.slug && !body.is_system_page) {
      updateData.slug = body.slug;
    }

    // Set published_at if status is published
    if (body.status === 'published' && body.current_status !== 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { data: page, error } = await supabase
      .from('static_pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update page' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'update',
        target_type: 'static_pages',
        target_id: id,
        changes: {
          updated_fields: Object.keys(updateData),
          page_title: body.title,
          status_change: body.current_status !== body.status ? {
            from: body.current_status,
            to: body.status
          } : null
        }
      });
    }

    return new Response(JSON.stringify({
      page,
      message: 'Page updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating page:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
  try {
    const supabase = createSupabaseClient({ request, cookies });
    const auth = await getAdminAuth({ request, cookies });
    const user = requireAdmin(auth);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Page ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if it's a system page
    const { data: page } = await supabase
      .from('static_pages')
      .select('is_system_page, title, type')
      .eq('id', id)
      .single();

    if (page?.is_system_page) {
      return new Response(JSON.stringify({ error: 'Cannot delete system pages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { error } = await supabase
      .from('static_pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete page' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'delete',
        target_type: 'static_pages',
        target_id: id,
        changes: {
          page_title: page?.title,
          page_type: page?.type
        }
      });
    }

    return new Response(JSON.stringify({
      message: 'Page deleted successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting page:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};