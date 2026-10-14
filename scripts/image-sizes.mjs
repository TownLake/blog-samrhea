// Records the display size of every Cloudflare Images photo used in a post, so pages can reserve
// space for them (width/height) and offer smaller versions (srcset). Only new images are fetched.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { IMAGE_BASE, PUBLIC_VARIANT } from '../src/markdown/images.ts';

const manifestPath = new URL('../src/data/image-sizes.json', import.meta.url);
const postsDir = new URL('../src/content/posts/', import.meta.url);

const sizes = JSON.parse(readFileSync(manifestPath, 'utf8'));
const ids = new Set();
for (const file of readdirSync(postsDir)) {
  const markdown = readFileSync(new URL(file, postsDir), 'utf8');
  for (const [, id] of markdown.matchAll(new RegExp(`${IMAGE_BASE}([\\w-]+)/public`, 'g'))) ids.add(id);
}

const missing = [...ids].filter((id) => !sizes[id]);
await Promise.all(
  missing.map(async (id) => {
    try {
      const res = await fetch(`${IMAGE_BASE}${id}/${PUBLIC_VARIANT},format=json`);
      const { width, height } = await res.json();
      sizes[id] = [width, height];
    } catch (error) {
      console.warn(`image-sizes: couldn't measure ${id}, it will render without dimensions (${error.message})`);
    }
  }),
);

const sorted = Object.fromEntries(Object.entries(sizes).filter(([id]) => ids.has(id)).sort());
writeFileSync(manifestPath, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`image-sizes: ${ids.size} images, ${missing.length} newly measured`);
