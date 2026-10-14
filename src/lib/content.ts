import { getCollection } from 'astro:content';

export interface Entry {
  title: string;
  date: Date;
  description?: string;
  url: string;
  external: boolean;
  /** Category and tags together, lowercased. */
  topics: string[];
}

/** Local posts and Cloudflare blog posts, newest first. */
export async function getEntries(): Promise<Entry[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const external = await getCollection('cloudflare');

  return [
    ...posts.map(({ id, data }) => ({
      title: data.title,
      date: data.date,
      description: data.description,
      url: `/posts/${id}/`,
      external: false,
      topics: [...new Set([data.category, ...data.tags].filter((t) => t !== undefined))],
    })),
    ...external.map(({ data }) => ({
      title: data.title,
      date: data.date,
      description: data.description,
      url: data.url,
      external: true,
      topics: [...new Set(['cloudflare', ...data.tags])],
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}

const isReading = (entry: Entry) => entry.topics.includes('reading');

/** The tabs on the homepage. `slug` is the URL segment; `legacy` is the old `?filter=` value. */
export const FILTERS = [
  { slug: '', legacy: 'all', label: 'All', match: (e: Entry) => !isReading(e) },
  { slug: 'highlights', legacy: 'starred', label: 'Highlights', match: (e: Entry) => e.topics.includes('hits') },
  { slug: 'reading', legacy: 'reading', label: 'Reading', match: isReading },
  { slug: 'portugal', legacy: 'portugal', label: 'Portugal', match: (e: Entry) => e.topics.includes('portugal') },
  { slug: 'texas', legacy: 'texas', label: 'Texas', match: (e: Entry) => e.topics.includes('texas') },
  { slug: 'cloudflare', legacy: 'cloudflare', label: 'Cloudflare', match: (e: Entry) => e.external },
] as const;

/** Topics that already have a homepage tab get redirected there instead of a /tag/ page. */
export const TOPICS_WITH_TABS: Record<string, string> = {
  reading: '/reading/',
  portugal: '/portugal/',
  texas: '/texas/',
  hits: '/highlights/',
};

export const topicSlug = (topic: string) => topic.replace(/\s+/g, '-');

export const PAGE_SIZE = 15;

/** Dates are calendar days, so format them in UTC to avoid shifting into the previous day for western time zones. */
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}
