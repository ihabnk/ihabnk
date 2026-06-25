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
  toolRatings: z.record(z.string(), z.number().min(1).max(5)).optional(),

  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  scores: z.record(z.string(), z.number().min(1).max(5)).optional(),
  scoresByTool: z.record(z.string(), z.record(z.string(), z.number().min(1).max(5))).optional(),

  featured: z.boolean().default(false),
  toc: z.array(z.object({ label: z.string(), anchor: z.string() })).optional(),
});

const guideSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.date(),
  updated: z.date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).optional(),

  // Guidebook-specific
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  pathway: z.string().optional(),          // e.g. "Getting into QA"
  order: z.number().default(0),            // position within its level / pathway
  est: z.string().optional(),              // e.g. "12 min read"
  prerequisites: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
});

export const collections = {
  'blog-en':    defineCollection({ type: 'content', schema: postSchema   }),
  'reviews-en': defineCollection({ type: 'content', schema: reviewSchema }),
  'guides-en':  defineCollection({ type: 'content', schema: guideSchema  }),
};
