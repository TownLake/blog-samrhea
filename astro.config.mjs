import { defineConfig, fontProviders } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { bookDetails } from './src/markdown/book-details.ts';
import { dashes } from './src/markdown/dashes.ts';
import { lazyImages } from './src/markdown/lazy-images.ts';

export default defineConfig({
  site: 'https://blog.samrhea.com',
  integrations: [sitemap()],
  markdown: {
    processor: satteri({
      features: { smartPunctuation: { dashes: false } },
      mdastPlugins: [dashes, bookDetails],
      hastPlugins: [lazyImages],
    }),
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: ['100 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', '-apple-system', 'sans-serif'],
    },
  ],
  prefetch: {
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
