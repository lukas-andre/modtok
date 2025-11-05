import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';
import type { BlogPostInsert } from "@/lib/database.helpers";

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
      category,
      tags = [],
      
      // SEO
      meta_title,
      meta_description,
      keywords = [],
      slug,
      
      // Publishing
      status = 'draft' as const,
      published_at,
      
      // Schedule for Chile timezone
      schedule_publish = false,
      schedule_date,
      schedule_time,
      
      // Reading time (can be auto-calculated)
      reading_time_minutes,
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

    if (category && !['tendencias', 'guias', 'casos_exito', 'noticias', 'tutoriales'].includes(category)) {
      return new Response(
        JSON.stringify({ error: 'Invalid category' }),
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
      .from('blog_posts')
      .select('id')
      .eq('slug', finalSlug)
      .single();

    if (existingPost) {
      finalSlug = `${finalSlug}-${Date.now()}`;
    }

    // Calculate reading time if not provided (rough estimate: ~200 words per minute)
    let calculatedReadingTime = reading_time_minutes;
    if (!calculatedReadingTime && content) {
      const wordCount = content.split(/\s+/).length;
      calculatedReadingTime = Math.max(1, Math.round(wordCount / 200));
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

    // Prepare blog post data
    const blogPostData: BlogPostInsert = {
      title,
      slug: finalSlug,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      featured_image_url,
      category: category as 'tendencias' | 'guias' | 'casos_exito' | 'noticias' | 'tutoriales' | null,
      tags: Array.isArray(tags) ? tags : [],
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt || content.substring(0, 160),
      keywords: Array.isArray(keywords) ? keywords : [],
      status: finalStatus as 'draft' | 'pending_review' | 'published' | 'archived',
      published_at: finalPublishedAt,
      reading_time_minutes: calculatedReadingTime,
      author_id: auth?.user?.id || null,
      editor_id: auth?.user?.id || null,
      views_count: 0,
      likes_count: 0,
      shares_count: 0
    };

    // Insert blog post
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert(blogPostData)
      .select(`
        *,
        author:profiles!blog_posts_author_id_fkey(id, full_name, email)
      `)
      .single();

    if (postError) {
      console.error('Error creating blog post:', postError);
      return new Response(
        JSON.stringify({ error: 'Failed to create blog post: ' + postError.message }),
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
          target_type: 'blog_post',
          target_id: post.id,
          changes: {
            created: blogPostData
          }
        });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Blog post created successfully',
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          category: post.category,
          published_at: post.published_at
        }
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create blog post' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};