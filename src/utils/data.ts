import { getCollection } from 'astro:content';
import cloudflareData from '../data/cloudflare.json';

export async function getAllContent() {
  // 1. Get Local Markdown Posts
  const localPosts = await getCollection('posts', ({ data }) => {
    return data.draft !== true;
  });

  // 2. Format Local Posts
  const formattedLocal = localPosts.map(post => ({
    id: post.slug,
    title: post.data.title,
    // Ensure date is a Date object
    date: new Date(post.data.date),
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags || [],
    // Remove 'posts/' prefix if it exists in the slug
    url: `/posts/${post.slug.replace(/^posts\//, '')}`,
    isExternal: false
  }));

  // 3. Format External (Cloudflare) Posts
  const formattedExternal = cloudflareData.map(post => ({
    id: post.id,
    title: post.title,
    // Ensure date is a Date object
    date: new Date(post.date),
    description: post.description,
    category: 'cloudflare',
    tags: post.tags || [],
    url: post.url,
    isExternal: true
  }));

  // 4. Merge and Sort (Newest First)
  const allContent = [...formattedLocal, ...formattedExternal].sort((a, b) => {
    return b.date.getTime() - a.date.getTime();
  });

  return allContent;
}