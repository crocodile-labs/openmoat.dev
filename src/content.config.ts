import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  blog: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/blog' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      author: z.string(),
      authorUrl: z.string().optional(),
      avatar: z.string().optional(),
      tag: z.string(),
      tags: z.array(z.string()).default([]),
      cover: z.string().optional(),
      coverResult: z.string().optional(),
      coverTone: z.enum(['deny', 'ok']).default('ok'),
      minutes: z.number(),
      notice: z.string().optional(),
    }),
  }),
};
