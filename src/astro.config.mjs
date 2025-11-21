import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server', // Required for Workers to handle dynamic filtering
  adapter: cloudflare({
    mode: 'directory', // Deploys as a Worker
  }),
  integrations: [tailwind()],
});