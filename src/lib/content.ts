import { getCollection } from 'astro:content';

export interface Entry {
  /** The full title, leading emoji included. */
  title: string;
  /** The title without its leading emoji. */
  name: string;
  /** The emoji every title starts with, shown as the post's tile. */
  emoji: string[];
  /** The post's N64-style icon, which replaces the emoji in its tile. */
  art?: string;
  tint: Tint;
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
    ...posts.map(({ id, data }) => {
      const topics = [...new Set([data.category, ...data.tags].filter((t) => t !== undefined))];
      return {
        ...splitTitle(data.title),
        title: data.title,
        art: artUrl(id, data.art),
        tint: tintFor(topics),
        date: data.date,
        description: data.description,
        url: `/posts/${id}/`,
        external: false,
        topics,
      };
    }),
    ...external.map(({ data }) => ({
      ...splitTitle(data.title),
      title: data.title,
      art: '/art/cloudflare.png',
      tint: 'cloudflare' as const,
      date: data.date,
      description: data.description,
      url: data.url,
      external: true,
      topics: [...new Set(['cloudflare', ...data.tags])],
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}

const graphemes = new Intl.Segmenter('en', { granularity: 'grapheme' });
const isEmoji = (grapheme: string) => /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20E3/u.test(grapheme);

/** Splits "🇫🇷🌐 Fixing the French Internet" into its leading emoji and the rest. */
export function splitTitle(title: string) {
  const emoji: string[] = [];
  let rest = 0;
  for (const { segment, index } of graphemes.segment(title)) {
    if (isEmoji(segment)) emoji.push(segment);
    else if (segment.trim()) break;
    rest = index + segment.length;
  }
  return { emoji, name: title.slice(rest).trim() };
}

/** Where a post's icon is rendered (by src/pages/art/), if it has art direction. */
export const artUrl = (id: string, art: unknown) => (art ? `/art/${id}.png` : undefined);

/** The color of a post's tile, from the first topic group it belongs to. */
export type Tint = 'reading' | 'portugal' | 'texas' | 'cloudflare' | 'tech' | 'neutral';

const TINTS: [Tint, string[]][] = [
  ['reading', ['reading', 'books', 'reading-list']],
  ['portugal', ['portugal', 'lisbon', 'sintra']],
  ['texas', ['texas', 'austin']],
  ['tech', ['walkthrough', 'technology', 'workers', 'ai', 'cloudflare']],
];

export const tintFor = (topics: string[]): Tint =>
  TINTS.find(([, group]) => group.some((t) => topics.includes(t)))?.[0] ?? 'neutral';

/** A view transition name shared by a post's tile in lists and on its page. */
export const tileTransition = (url: string) => `tile-${url.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`;

/** Entries grouped by year, newest first, for listing pages. */
export function byYear(entries: Entry[]) {
  const years = new Map<number, Entry[]>();
  for (const entry of entries) {
    const year = entry.date.getUTCFullYear();
    years.set(year, [...(years.get(year) ?? []), entry]);
  }
  return [...years];
}

const isReading = (entry: Entry) => entry.topics.includes('reading');

/** The tabs on the homepage. `slug` is the URL segment; `legacy` is the old `?filter=` value. */
export const FILTERS = [
  {
    slug: '',
    legacy: 'all',
    label: 'All',
    match: (e: Entry) => !isReading(e),
  },
  {
    slug: 'highlights',
    legacy: 'starred',
    label: 'Highlights',
    match: (e: Entry) => e.topics.includes('hits'),
  },
  {
    slug: 'reading',
    legacy: 'reading',
    label: 'Reading',
    match: isReading,
  },
  {
    slug: 'portugal',
    legacy: 'portugal',
    label: 'Portugal',
    match: (e: Entry) => e.topics.includes('portugal'),
  },
  {
    slug: 'texas',
    legacy: 'texas',
    label: 'Texas',
    match: (e: Entry) => e.topics.includes('texas'),
  },
  {
    slug: 'cloudflare',
    legacy: 'cloudflare',
    label: 'Cloudflare',
    match: (e: Entry) => e.external,
  },
] as const;

/** Topics that already have a homepage tab get redirected there instead of a /tag/ page. */
export const TOPICS_WITH_TABS: Record<string, string> = {
  reading: '/reading/',
  portugal: '/portugal/',
  texas: '/texas/',
  hits: '/highlights/',
};

export const topicSlug = (topic: string) => topic.replace(/\s+/g, '-');

/** Where a topic's posts are listed: its homepage tab, or its /tag/ page. */
export const topicUrl = (topic: string) => TOPICS_WITH_TABS[topic] ?? `/tag/${topicSlug(topic)}/`;

export const PAGE_SIZE = 15;

/** Dates are calendar days, so format them in UTC to avoid shifting into the previous day for western time zones. */
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions) {
  return date.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}
