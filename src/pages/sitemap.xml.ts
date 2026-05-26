import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://ihabnk.org';

// Hand-rolled so the sitemap lists ONLY the real English pages — no demo,
// tag, or alternate-locale routes ever leak in.
export const GET: APIRoute = async () => {
  const posts = await getCollection('blog-en', ({ data }) => !data.draft);
  const reviews = await getCollection('reviews-en', ({ data }) => !data.draft);

  const staticPages = ['/', '/blog', '/reviews', '/about'];

  const lastmod = (d: Date) => d.toISOString().split('T')[0];

  const urls = [
    ...staticPages.map(p => ({ loc: p })),
    ...posts.map(p => ({ loc: `/blog/${p.slug}`, lastmod: lastmod(p.data.date) })),
    ...reviews.map(r => ({ loc: `/reviews/${r.slug}`, lastmod: lastmod(r.data.updated ?? r.data.date) })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    u =>
      `  <url><loc>${SITE}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
