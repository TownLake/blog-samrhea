import { defineConfig, fontProviders } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { bookDetails } from './src/markdown/book-details.ts';
import { dashes } from './src/markdown/dashes.ts';
import { images } from './src/markdown/images.ts';

export default defineConfig({
  site: 'https://blog.samrhea.com',
  integrations: [sitemap()],
  markdown: {
    processor: satteri({
      features: { smartPunctuation: { dashes: false } },
      // Both themes are emitted as CSS variables; global.css picks one by color scheme.
      shikiConfig: { themes: { light: 'vitesse-light', dark: 'vitesse-dark' }, defaultColor: false },
      mdastPlugins: [dashes, bookDetails],
      hastPlugins: [images],
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
    {
      provider: fontProviders.fontsource(),
      name: 'Newsreader',
      cssVariable: '--font-newsreader',
      weights: ['200 800'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Georgia', 'serif'],
    },
  ],
  prefetch: {
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
