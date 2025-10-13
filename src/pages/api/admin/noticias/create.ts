import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';
import type { NewsPostInsert } from '@/lib/database.types';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Check if user is admin
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const formData = await request.json();
    const {
      // Basic content
      title,
      content,
      excerpt,
      featured_image_url,

      // Organization
      news_type,
      tags = [],

      // SEO
      meta_title,
      meta_description,
      keywords = [],
      slug,

      // Publishing
      status = 'draft' as const,
      published_at,

      // Breaking news
      is_breaking = false,
      expires_at,

      // Schedule for Chile timezone
      schedule_publish = false,
      schedule_date,
      schedule_time,
    } = formData;

    // Validation
    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: 'Title and content are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (news_type && !['industria', 'empresa', 'producto', 'evento', 'normativa'].includes(news_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid news type' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!['draft', 'pending_review', 'published', 'archived'].includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Generate slug from title if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 100);
    }

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('news_posts')
      .select('id')
      .eq('slug', finalSlug)
      .single();

    if (existingPost) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    // Handle scheduled publishing for Chile timezone
    let finalPublishedAt = published_at;
    let finalStatus = status;

    if (schedule_publish && schedule_date && schedule_time) {
      // Combine date and time for Chile timezone (UTC-3)
      const chileDateTime = new Date(`${schedule_date}T${schedule_time}:00-03:00`);
      finalPublishedAt = chileDateTime.toISOString();
      finalStatus = 'draft'; // Keep as draft until scheduled time
    } else if (status === 'published' && !finalPublishedAt) {
      finalPublishedAt = new Date().toISOString();
    }

    // Handle expiration date
    let finalExpiresAt = expires_at;
    if (finalExpiresAt) {
      finalExpiresAt = new Date(finalExpiresAt).toISOString();
    }

    // Prepare news post data
    const newsPostData: NewsPostInsert = {
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      featured_image_url,
      news_type: news_type as 'industria' | 'empresa' | 'producto' | 'evento' | 'normativa' | null,
      tags: Array.isArray(tags) ? tags : [],
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt || content.substring(0, 160),
      keywords: Array.isArray(keywords) ? keywords : [],
      status: finalStatus as 'draft' | 'pending_review' | 'published' | 'archived',
      published_at: finalPublishedAt,
      is_breaking: Boolean(is_breaking),
      expires_at: finalExpiresAt,
      author_id: auth?.user?.id || null,
      editor_id: auth?.user?.id || null,
      views_count: 0
    };

    // Insert news post
    const { data: post, error: postError } = await supabase
      .from('news_posts')
      .insert(newsPostData)
      .select(`
        *,
        author:profiles!news_posts_author_id_fkey(id, full_name, email)
      `)
      .single();

    if (postError) {
      console.error('Error creating news post:', postError);
      return new Response(
        JSON.stringify({ error: 'Failed to create news post: ' + postError.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'create',
          target_type: 'news_post',
          target_id: post.id,
          changes: {
            created: newsPostData
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'News post created successfully',
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          news_type: post.news_type,
          is_breaking: post.is_breaking,
          published_at: post.published_at,
          expires_at: post.expires_at
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error creating news post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create news post' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
