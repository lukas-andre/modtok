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
    const news_type = searchParams.get('news_type') as 'industria' | 'empresa' | 'producto' | 'evento' | 'normativa' | null;
    const author_id = searchParams.get('author_id');
    const search = searchParams.get('search');
    const is_breaking = searchParams.get('is_breaking');

    // Date filters
    const published_after = searchParams.get('published_after');
    const published_before = searchParams.get('published_before');
    const expires_after = searchParams.get('expires_after');
    const expires_before = searchParams.get('expires_before');

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';

    // Build query
    let query = supabase
      .from('news_posts')
      .select(`
        *,
        author:profiles!news_posts_author_id_fkey(id, full_name, email, avatar_url),
        editor:profiles!news_posts_editor_id_fkey(id, full_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (status && ['draft', 'pending_review', 'published', 'archived'].includes(status)) {
      query = query.eq('status', status);
    }

    if (news_type && ['industria', 'empresa', 'producto', 'evento', 'normativa'].includes(news_type)) {
      query = query.eq('news_type', news_type);
    }

    if (author_id) {
      query = query.eq('author_id', author_id);
    }

    if (is_breaking !== null && is_breaking !== undefined) {
      query = query.eq('is_breaking', is_breaking === 'true');
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

    if (expires_after) {
      query = query.gte('expires_at', new Date(expires_after).toISOString());
    }

    if (expires_before) {
      query = query.lte('expires_at', new Date(expires_before).toISOString());
    }

    // Apply sorting
    const validSortFields = [
      'created_at',
      'updated_at',
      'published_at',
      'expires_at',
      'title',
      'status',
      'views_count',
      'is_breaking'
    ];

    if (validSortFields.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: news, error, count } = await query;

    if (error) {
      console.error('Error fetching news posts:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch news posts' }),
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        news,
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
    console.error('Error in news posts list:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
};

// POST - Bulk operations (publish, archive, delete, toggle breaking, set expiration, etc.)
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

          case 'toggle_breaking':
            // Get current breaking status
            const { data: currentPost } = await supabase
              .from('news_posts')
              .select('is_breaking')
              .eq('id', postId)
              .single();

            updateData = {
              ...updateData,
              is_breaking: !currentPost?.is_breaking
            };
            break;

          case 'set_breaking':
            updateData = {
              ...updateData,
              is_breaking: true,
              status: 'published' as const,
              published_at: new Date().toISOString()
            };
            break;

          case 'unset_breaking':
            updateData = {
              ...updateData,
              is_breaking: false
            };
            break;

          case 'set_expiration':
            if (!data?.expires_at) {
              throw new Error('Expiration date is required');
            }
            updateData = {
              ...updateData,
              expires_at: new Date(data.expires_at).toISOString()
            };
            break;

          case 'remove_expiration':
            updateData = {
              ...updateData,
              expires_at: null
            };
            break;

          case 'change_news_type':
            if (!data?.news_type || !['industria', 'empresa', 'producto', 'evento', 'normativa'].includes(data.news_type)) {
              throw new Error('Invalid news type');
            }
            updateData = {
              ...updateData,
              news_type: data.news_type
            };
            break;

          case 'add_tags':
            if (!data?.tags || !Array.isArray(data.tags)) {
              throw new Error('Tags array is required');
            }
            // Get current tags
            const { data: currentNewsPost } = await supabase
              .from('news_posts')
              .select('tags')
              .eq('id', postId)
              .single();

            const existingTags = currentNewsPost?.tags || [];
            const newTags = [...new Set([...existingTags, ...data.tags])];

            updateData = {
              ...updateData,
              tags: newTags
            };
            break;

          case 'delete':
            // For delete, we'll actually delete the record
            const { error: deleteError } = await supabase
              .from('news_posts')
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
                message: 'News post deleted successfully'
              });

              // Log admin action
              if (auth?.user?.id) {
                await supabase
                  .from('admin_actions')
                  .insert({
                    admin_id: auth.user.id,
                    action_type: 'delete',
                    target_type: 'news_post',
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
          .from('news_posts')
          .update(updateData)
          .eq('id', postId)
          .select('id, title, status, news_type, is_breaking')
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
                target_type: 'news_post',
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
        message: `${successCount} news posts updated successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
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
