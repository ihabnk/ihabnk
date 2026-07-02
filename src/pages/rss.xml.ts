import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://ihabnk.org';

// Hand-rolled RSS 2.0 — no extra dependency. Surfaces both articles and
// reviews, newest first, so readers and feed-aware crawlers (Google,
// Feedly, etc.) have a single source of truth.
const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog-en', ({ data }) => !data.draft);
  const reviews = await getCollection('reviews-en', ({ data }) => !data.draft);
  const guides = await getCollection('guides-en', ({ data }) => !data.draft);

  const items = [
    ...posts.map(p => ({
      title: p.data.title,
      description: p.data.description ?? '',
      link: `${SITE}/blog/${p.id}`,
      date: p.data.date,
      categories: p.data.tags ?? [],
    })),
    ...reviews.map(r => ({
      title: r.data.title,
      description: r.data.verdict ?? r.data.description ?? '',
      link: `${SITE}/reviews/${r.id}`,
      date: r.data.updated ?? r.data.date,
      categories: r.data.tags ?? [],
    })),
    ...guides.map(g => ({
      title: g.data.title,
      description: g.data.description ?? '',
      link: `${SITE}/guides/${g.id}`,
      date: g.data.updated ?? g.data.date,
      categories: g.data.tags ?? [],
    })),
  ].sort((a, b) => b.date.valueOf() - a.date.valueOf());

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ihabnk — guides, reviews &amp; articles</title>
    <link>${SITE}</link>
    <description>Guides, independent tool reviews, and field notes for software quality engineers — testing, automation, evals, and AI-assisted quality.</description>
    <language>en</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    i => `    <item>
      <title>${xmlEscape(i.title)}</title>
      <link>${i.link}</link>
      <guid isPermaLink="true">${i.link}</guid>
      <pubDate>${i.date.toUTCString()}</pubDate>
      <description>${xmlEscape(i.description)}</description>
${i.categories.map(c => `      <category>${xmlEscape(c)}</category>`).join('\n')}
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
