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
      return new Response(JSON.stringify({ error: 'FAQ item ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data: faq, error } = await supabase
      .from('faq_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: 'FAQ item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ faq }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching FAQ item:', error);
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
      return new Response(JSON.stringify({ error: 'FAQ item ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();

    const { data: faq, error } = await supabase
      .from('faq_items')
      .update({
        category: body.category || 'General',
        question: body.question,
        answer: body.answer,
        is_featured: body.is_featured || false,
        tags: body.tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to update FAQ item' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'update',
        target_type: 'faq_items',
        target_id: id,
        changes: {
          question: body.question,
          category: body.category || 'General'
        }
      });
    }

    return new Response(JSON.stringify({
      faq,
      message: 'FAQ item updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating FAQ item:', error);
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
      return new Response(JSON.stringify({ error: 'FAQ item ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get FAQ item info before deleting
    const { data: faq } = await supabase
      .from('faq_items')
      .select('question, category')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to delete FAQ item' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'delete',
        target_type: 'faq_items',
        target_id: id,
        changes: {
          question: faq?.question,
          category: faq?.category
        }
      });
    }

    return new Response(JSON.stringify({
      message: 'FAQ item deleted successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error deleting FAQ item:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};