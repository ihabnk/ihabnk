import { defineCollection, z } from 'astro:content';

const postSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.date(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

const reviewSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.date(),
  updated: z.date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).optional(),

  kind: z.enum(['review', 'comparison']).default('review'),
  tools: z.array(z.string()).default([]),
  verdict: z.string().optional(),
  bestFor: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),

  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  scores: z.record(z.string(), z.number().min(1).max(5)).optional(),

  featured: z.boolean().default(false),
  toc: z.array(z.object({ label: z.string(), anchor: z.string() })).optional(),
});

export const collections = {
  'blog-en':    defineCollection({ type: 'content', schema: postSchema   }),
  'reviews-en': defineCollection({ type: 'content', schema: reviewSchema }),
};
