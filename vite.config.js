// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

// Custom plugin to regenerate posts.json when posts are added/changed
const postListPlugin = () => {
  return {
    name: 'post-list-generator',
    buildStart() {
      // Generate posts.json at startup
      exec('node scripts/generate-post-list.js', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating posts.json: ${error}`);
          return;
        }
        console.log(stdout);
      });
    },
    configureServer(server) {
      // Watch the posts directory for changes
      server.watcher.add(path.resolve('public/content/posts/**/*.md'));
      
      // When a post is added, removed, or changed, regenerate posts.json
      server.watcher.on('change', (file) => {
        if (file.includes('/content/posts/') && file.endsWith('.md')) {
          exec('node scripts/generate-post-list.js', (error, stdout, stderr) => {
            if (error) {
              console.error(`Error regenerating posts.json: ${error}`);
              return;
            }
            console.log(stdout);
            // Trigger a page reload to see the changes
            server.ws.send({ type: 'full-reload' });
          });
        }
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), postListPlugin()],
  server: {
    port: 3000
  }
});