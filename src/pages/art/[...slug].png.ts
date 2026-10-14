import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getCollection } from 'astro:content';
import { CLOUDFLARE_ART, paint, type Art } from '../../art/index.ts';

// Each post's icon, rendered at build time from the `art` in its frontmatter.
export const getStaticPaths = (async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft && data.art !== undefined);
  return [
    ...posts.map((post) => ({ params: { slug: post.id }, props: { art: post.data.art as Art, seed: post.id } })),
    { params: { slug: 'cloudflare' }, props: { art: CLOUDFLARE_ART, seed: 'cloudflare' } },
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<InferGetStaticPropsType<typeof getStaticPaths>> = ({ props }) =>
  new Response(paint(props.art, props.seed), { headers: { 'Content-Type': 'image/png' } });
