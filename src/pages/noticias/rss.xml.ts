import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.href || 'https://modtok.cl';
  const supabase = createSupabaseClient({} as any);

  // Fetch latest 50 published news posts (not expired)
  const { data: posts } = await supabase
    .from('news_posts')
    .select('*')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(50);

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>MODTOK Noticias - Construcción Modular en Chile</title>
    <link>${siteUrl}noticias</link>
    <description>Noticias y actualizaciones sobre la industria de construcción modular y casas prefabricadas en Chile</description>
    <language>es-CL</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}noticias/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}logo.png</url>
      <title>MODTOK Noticias</title>
      <link>${siteUrl}noticias</link>
    </image>
    <copyright>Copyright ${new Date().getFullYear()} MODTOK. Todos los derechos reservados.</copyright>
    <category>Noticias Construcción</category>
    <category>Industria Modular</category>
    <category>Chile</category>

${posts?.map(post => `
    <item>
      <title><![CDATA[${post.is_breaking ? '🔴 URGENTE: ' : ''}${post.title}]]></title>
      <link>${siteUrl}noticias/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}noticias/${post.slug}</guid>
      <description><![CDATA[${post.summary || post.meta_description || ''}]]></description>
      ${post.content ? `<content:encoded><![CDATA[${post.content}]]></content:encoded>` : ''}
      <dc:creator><![CDATA[${post.author_name || 'MODTOK Editorial'}]]></dc:creator>
      <pubDate>${new Date(post.published_at!).toUTCString()}</pubDate>
      ${post.news_type ? `<category><![CDATA[${post.news_type}]]></category>` : ''}
      ${post.is_breaking ? `<category><![CDATA[urgente]]></category>` : ''}
      ${post.tags?.map(tag => `<category><![CDATA[${tag}]]></category>`).join('\n      ') || ''}
      ${post.featured_image_url ? `
      <enclosure url="${post.featured_image_url}" type="image/jpeg"/>` : ''}
    </item>`).join('') || ''}
  </channel>
</rss>`;

  return new Response(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes (news updates faster)
    },
  });
};
