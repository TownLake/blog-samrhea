import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { MODEL_NAMES, PLACE_NAMES, TIME_NAMES } from './art/compose.ts';

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

/** Art direction for the post's N64-style icon, rendered by src/art/: a subject and an optional accent. */
const art = z.object({
  place: z.enum(PLACE_NAMES),
  time: z.enum(TIME_NAMES).optional(),
  props: z
    .array(
      z.union([
        z.enum(MODEL_NAMES),
        z.object({
          model: z.enum(MODEL_NAMES),
          variant: z.string().optional(),
          at: z.tuple([z.number(), z.number()]).optional(),
          turn: z.number().optional(),
          scale: z.number().optional(),
          lift: z.number().optional(),
        }),
      ]),
    )
    .min(1)
    .max(2),
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
    art: art.optional(),
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
