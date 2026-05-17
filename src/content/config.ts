import { defineCollection, z } from 'astro:content';

const postSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.date(),
  draft: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export const collections = {
  'blog-en': defineCollection({ type: 'content', schema: postSchema }),
};
