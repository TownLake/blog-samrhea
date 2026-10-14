# blog.samrhea.com

Sam Rhea's personal blog. A static [Astro](https://astro.build) site served from Cloudflare.

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check, build to dist/, and check internal links
npm run preview  # serve the build with wrangler, as in production
```

Posts live in `src/content/posts/`. Pushes to `main` deploy through Cloudflare Workers Builds. See [agents.md](agents.md) for the project layout and the reading-post format.
