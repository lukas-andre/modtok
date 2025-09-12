import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';
import { getAdminAuth } from '@/lib/auth';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const searchParams = new URL(request.url).searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status') as 'draft' | 'pending_review' | 'published' | 'archived' | null;
    const category = searchParams.get('category') as 'tendencias' | 'guias' | 'casos_exito' | 'noticias' | 'tutoriales' | null;
    const author_id = searchParams.get('author_id');
    const search = searchParams.get('search');

    // Date filters
    const published_after = searchParams.get('published_after');
    const published_before = searchParams.get('published_before');

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';

    // Build query
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        author:profiles!blog_posts_author_id_fkey(id, full_name, email, avatar_url),
        editor:profiles!blog_posts_editor_id_fkey(id, full_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (status && ['draft', 'pending_review', 'published', 'archived'].includes(status)) {
      query = query.eq('status', status);
    }

    if (category && ['tendencias', 'guias', 'casos_exito', 'noticias', 'tutoriales'].includes(category)) {
      query = query.eq('category', category);
    }

    if (author_id) {
      query = query.eq('author_id', author_id);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    if (published_after) {
      query = query.gte('published_at', new Date(published_after).toISOString());
    }

    if (published_before) {
      query = query.lte('published_at', new Date(published_before).toISOString());
    }

    // Apply sorting
    const validSortFields = [
      'created_at', 
      'updated_at', 
      'published_at',
      'title', 
      'status', 
      'views_count', 
      'likes_count',
      'shares_count',
      'reading_time_minutes'
    ];
    
    if (validSortFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Error fetching blog posts:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch blog posts' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        posts,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
          hasMore,
          hasPrev: page > 1
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error: any) {
    console.error('Error in blog posts list:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// POST - Bulk operations (publish, archive, delete, etc.)
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const auth = await getAdminAuth({ request, cookies });
    if (!auth.isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const formData = await request.json();
    const { action, post_ids, data } = formData;

    if (!action || !post_ids || !Array.isArray(post_ids)) {
      return new Response(
        JSON.stringify({ error: 'Action and post IDs are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const supabase = createSupabaseClient({ request, cookies });
    const results = [];

    for (const postId of post_ids) {
      try {
        let updateData: any = { 
          updated_at: new Date().toISOString(),
          editor_id: auth?.user?.id || null
        };

        switch (action) {
          case 'publish':
            updateData = {
              ...updateData,
              status: 'published' as const,
              published_at: new Date().toISOString()
            };
            break;

          case 'unpublish':
            updateData = {
              ...updateData,
              status: 'draft' as const,
              published_at: null
            };
            break;

          case 'archive':
            updateData = {
              ...updateData,
              status: 'archived' as const
            };
            break;

          case 'schedule':
            if (!data?.published_at) {
              throw new Error('Published date is required for scheduling');
            }
            updateData = {
              ...updateData,
              status: 'draft' as const,
              published_at: new Date(data.published_at).toISOString()
            };
            break;

          case 'change_category':
            if (!data?.category || !['tendencias', 'guias', 'casos_exito', 'noticias', 'tutoriales'].includes(data.category)) {
              throw new Error('Invalid category');
            }
            updateData = {
              ...updateData,
              category: data.category
            };
            break;

          case 'add_tags':
            if (!data?.tags || !Array.isArray(data.tags)) {
              throw new Error('Tags array is required');
            }
            // Get current tags
            const { data: currentPost } = await supabase
              .from('blog_posts')
              .select('tags')
              .eq('id', postId)
              .single();
            
            const existingTags = currentPost?.tags || [];
            const newTags = [...new Set([...existingTags, ...data.tags])];
            
            updateData = {
              ...updateData,
              tags: newTags
            };
            break;

          case 'delete':
            // For delete, we'll actually delete the record
            const { error: deleteError } = await supabase
              .from('blog_posts')
              .delete()
              .eq('id', postId);

            if (deleteError) {
              results.push({ 
                id: postId, 
                success: false, 
                error: deleteError.message 
              });
            } else {
              results.push({ 
                id: postId, 
                success: true, 
                message: 'Post deleted successfully' 
              });

              // Log admin action
              if (auth?.user?.id) {
                await supabase
                  .from('admin_actions')
                  .insert({
                    admin_id: auth.user.id,
                    action_type: 'delete',
                    target_type: 'blog_post',
                    target_id: postId,
                    changes: { action }
                  });
              }
            }
            continue; // Skip the update logic below

          default:
            throw new Error('Invalid action');
        }

        const { data: updatedPost, error } = await supabase
          .from('blog_posts')
          .update(updateData)
          .eq('id', postId)
          .select('id, title, status, category')
          .single();

        if (error) {
          results.push({ 
            id: postId, 
            success: false, 
            error: error.message 
          });
        } else {
          results.push({ 
            id: postId, 
            success: true, 
            post: updatedPost 
          });

          // Log admin action
          if (auth?.user?.id) {
            await supabase
              .from('admin_actions')
              .insert({
                admin_id: auth.user.id,
                action_type: action,
                target_type: 'blog_post',
                target_id: postId,
                changes: { action, data: updateData }
              });
          }
        }

      } catch (error: any) {
        results.push({ 
          id: postId, 
          success: false, 
          error: error.message 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: errorCount === 0,
        message: `${successCount} posts updated successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        results
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