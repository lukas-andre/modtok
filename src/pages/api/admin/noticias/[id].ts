import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, requireAdmin } from '@/lib/auth';

// GET /api/admin/noticias/[id] - Get single news post
export const GET: APIRoute = async ({ params, request, cookies }) => {
  const auth = await getAdminAuth({ request, cookies } as any);
  const user = requireAdmin(auth);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { id } = params;
  const supabase = createSupabaseClient({ request, cookies } as any);

  const { data: post, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !post) {
    return new Response(JSON.stringify({ error: 'News post not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ post }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

// PUT /api/admin/noticias/[id] - Update news post
export const PUT: APIRoute = async ({ params, request, cookies }) => {
  const auth = await getAdminAuth({ request, cookies } as any);
  const user = requireAdmin(auth);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const supabase = createSupabaseClient({ request, cookies } as any);

    // Update post
    const { data: post, error } = await supabase
      .from('news_posts')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ post }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/admin/noticias/[id] - Delete news post
export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  const auth = await getAdminAuth({ request, cookies } as any);
  const user = requireAdmin(auth);

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { id } = params;
  const supabase = createSupabaseClient({ request, cookies } as any);

  try {
    // Get post details before deleting for admin log
    const { data: post } = await supabase
      .from('news_posts')
      .select('id, title, slug')
      .eq('id', id)
      .single();

    // Delete the post
    const { error } = await supabase
      .from('news_posts')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (auth?.user?.id && post) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'delete',
          target_type: 'news_post',
          target_id: id,
          changes: {
            deleted: post
          }
        });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'News post deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
