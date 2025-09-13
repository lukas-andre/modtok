import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth, requireAdmin } from '@/lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
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

    const body = await request.json();

    // Get the highest display_order for this category
    const { data: lastItem } = await supabase
      .from('faq_items')
      .select('display_order')
      .eq('page_id', body.page_id)
      .eq('category', body.category || 'General')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const newDisplayOrder = (lastItem?.display_order || 0) + 1;

    const { data: faq, error } = await supabase
      .from('faq_items')
      .insert({
        page_id: body.page_id,
        category: body.category || 'General',
        question: body.question,
        answer: body.answer,
        is_featured: body.is_featured || false,
        tags: body.tags || [],
        display_order: newDisplayOrder
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create FAQ item' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase.from('admin_actions').insert({
        admin_id: auth.user.id,
        action_type: 'create',
        target_type: 'faq_items',
        target_id: faq.id,
        changes: {
          question: body.question,
          category: body.category || 'General'
        }
      });
    }

    return new Response(JSON.stringify({
      faq,
      message: 'FAQ item created successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating FAQ item:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};