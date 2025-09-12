import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';
import type { BlogPostUpdate } from '@/lib/database.types';

// GET - Fetch single blog post
export const GET: APIRoute = async ({ params, request, cookies }) => {
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
        JSON.stringify({ error: 'Post ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:profiles!blog_posts_author_id_fkey(id, full_name, email, avatar_url),
        editor:profiles!blog_posts_editor_id_fkey(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Blog post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    return new Response(
      JSON.stringify({ post }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// PUT - Update blog post
export const PUT: APIRoute = async ({ params, request, cookies }) => {
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
        JSON.stringify({ error: 'Post ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const formData = await request.json();
    const supabase = createSupabaseClient({ request, cookies });

    // Get current post data for change tracking
    const { data: currentPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Blog post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Process form data
    const {
      title,
      content,
      excerpt,
      featured_image_url,
      category,
      tags,
      meta_title,
      meta_description,
      keywords,
      slug,
      status,
      published_at,
      reading_time_minutes,
      schedule_publish = false,
      schedule_date,
      schedule_time,
    } = formData;

    // Validation
    if (category && !['tendencias', 'guias', 'casos_exito', 'noticias', 'tutoriales'].includes(category)) {
      return new Response(
        JSON.stringify({ error: 'Invalid category' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    if (status && !['draft', 'pending_review', 'published', 'archived'].includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Generate new slug if title changed
    let finalSlug = currentPost.slug;
    if (title && title !== currentPost.title) {
      finalSlug = slug || title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 100);

      // Check if new slug already exists
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', finalSlug)
        .neq('id', id)
        .single();

      if (existingPost) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
    } else if (slug && slug !== currentPost.slug) {
      // Check if provided slug already exists
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (existingPost) {
        return new Response(
          JSON.stringify({ error: 'Slug already exists' }),
          { status: 400, headers: { 'Content-Type': 'application/json' }}
        );
      }
      finalSlug = slug;
    }

    // Calculate reading time if content changed
    let calculatedReadingTime = currentPost.reading_time_minutes;
    if (reading_time_minutes !== undefined) {
      calculatedReadingTime = reading_time_minutes;
    } else if (content && content !== currentPost.content) {
      const wordCount = content.split(/\s+/).length;
      calculatedReadingTime = Math.max(1, Math.round(wordCount / 200));
    }

    // Handle scheduled publishing for Chile timezone
    let finalPublishedAt = currentPost.published_at;
    let finalStatus = status || currentPost.status;
    
    if (schedule_publish && schedule_date && schedule_time) {
      // Combine date and time for Chile timezone (UTC-3)
      const chileDateTime = new Date(`${schedule_date}T${schedule_time}:00-03:00`);
      finalPublishedAt = chileDateTime.toISOString();
      finalStatus = 'draft'; // Keep as draft until scheduled time
    } else if (status === 'published' && currentPost.status !== 'published' && !published_at) {
      finalPublishedAt = new Date().toISOString();
    } else if (published_at !== undefined) {
      finalPublishedAt = published_at;
    }

    // Prepare update data
    const updateData: BlogPostUpdate = {
      ...(title !== undefined && { title }),
      ...(finalSlug !== currentPost.slug && { slug: finalSlug }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(featured_image_url !== undefined && { featured_image_url }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
      ...(meta_title !== undefined && { meta_title }),
      ...(meta_description !== undefined && { meta_description }),
      ...(keywords !== undefined && { keywords: Array.isArray(keywords) ? keywords : [] }),
      ...(finalStatus !== currentPost.status && { status: finalStatus as 'draft' | 'pending_review' | 'published' | 'archived' }),
      ...(finalPublishedAt !== currentPost.published_at && { published_at: finalPublishedAt }),
      ...(calculatedReadingTime !== currentPost.reading_time_minutes && { reading_time_minutes: calculatedReadingTime }),
      editor_id: auth?.user?.id || null,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof BlogPostUpdate] === undefined) {
        delete updateData[key as keyof BlogPostUpdate];
      }
    });

    // Update blog post
    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        author:profiles!blog_posts_author_id_fkey(id, full_name, email),
        editor:profiles!blog_posts_editor_id_fkey(id, full_name, email)
      `)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to update blog post: ' + error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'update',
          target_type: 'blog_post',
          target_id: id,
          changes: {
            before: currentPost,
            after: updateData
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Blog post updated successfully',
        post: updatedPost
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

// DELETE - Delete blog post
export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin access required.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Post ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });

    // Get post data for logging
    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: 'Blog post not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Delete blog post (this will cascade to related records like comments)
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to delete blog post: ' + error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Log admin action
    if (auth?.user?.id) {
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: auth.user.id,
          action_type: 'delete',
          target_type: 'blog_post',
          target_id: id,
          changes: {
            deleted: post
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Blog post deleted successfully'
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