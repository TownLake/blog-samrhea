import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.coerce.string();
const tag = z.string().trim().toLowerCase();

/** Rendered by src/markdown/book-details.ts as the "What is it?" and "How did I read it?" tables. */
const book = z.object({
  title: text,
  author: text,
  narrator: text.optional(),
  published: text,
  format: text,
  pages: text.optional(),
  length: text.optional(),
  amazon: z.url().optional(),
  asin: text.optional(),
  isbn: text.optional(),
  started: text,
  finished: text,
  places: z.array(text).default([]),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    category: tag.optional(),
    tags: z.array(tag).default([]),
    draft: z.boolean().default(false),
    book: book.optional(),
  }),
});

/** Posts Sam wrote for the Cloudflare blog, listed alongside local posts. */
const cloudflare = defineCollection({
  loader: file('src/data/cloudflare.json'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    url: z.url(),
    tags: z.array(tag).default([]),
  }),
});

export const collections = { posts, cloudflare };
