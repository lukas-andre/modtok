import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.href || 'https://modtok.cl';
  const supabase = createSupabaseClient({} as any);

  // Fetch all published blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('updated_at', { ascending: false });

  // Fetch all published news posts (not expired)
  const { data: newsPosts } = await supabase
    .from('news_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
    .order('updated_at', { ascending: false });

  // Fetch all published providers
  const { data: providers } = await supabase
    .from('providers')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  // Fetch all published houses
  const { data: houses } = await supabase
    .from('houses')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  // Fetch all published service products
  const { data: services } = await supabase
    .from('service_products')
    .select('slug, updated_at')
    .eq('status', 'active')
    .order('updated_at', { ascending: false });

  // Static pages
  const staticPages = [
    { url: '', changefreq: 'daily', priority: '1.0' },
    { url: 'casas', changefreq: 'daily', priority: '0.9' },
    { url: 'fabricantes', changefreq: 'daily', priority: '0.9' },
    { url: 'h-y-s', changefreq: 'daily', priority: '0.9' },
    { url: 'blog', changefreq: 'daily', priority: '0.8' },
    { url: 'noticias', changefreq: 'daily', priority: '0.8' },
    { url: 'contacto', changefreq: 'monthly', priority: '0.6' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Static Pages -->
  ${staticPages.map(page => `
  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}

  <!-- Blog Posts -->
  ${blogPosts?.map(post => `
  <url>
    <loc>${siteUrl}blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}

  <!-- News Posts (with Google News tags for breaking news) -->
  ${newsPosts?.map(post => `
  <url>
    <loc>${siteUrl}noticias/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>MODTOK</news:name>
        <news:language>es</news:language>
      </news:publication>
      <news:publication_date>${new Date(post.published_at!).toISOString()}</news:publication_date>
    </news:news>
  </url>`).join('') || ''}

  <!-- Providers -->
  ${providers?.map(provider => `
  <url>
    <loc>${siteUrl}fabricantes/${provider.slug}</loc>
    <lastmod>${new Date(provider.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('') || ''}

  <!-- Houses -->
  ${houses?.map(house => `
  <url>
    <loc>${siteUrl}casas/${house.slug}</loc>
    <lastmod>${new Date(house.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('') || ''}

  <!-- Services -->
  ${services?.map(service => `
  <url>
    <loc>${siteUrl}h-y-s/${service.slug}</loc>
    <lastmod>${new Date(service.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('') || ''}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
