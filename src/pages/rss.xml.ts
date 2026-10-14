import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getEntries } from '../lib/content';

export const GET: APIRoute = async ({ site }) => {
  const entries = await getEntries();

  return rss({
    title: 'Sam Rhea',
    description: 'Writing about technology, Texas, and Portugal',
    site: site!,
    items: entries.map((entry) => ({
      title: entry.title,
      description: entry.description,
      pubDate: entry.date,
      link: entry.url,
      categories: entry.topics,
    })),
  });
};
