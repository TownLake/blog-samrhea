# Blog Project - Agent Context

Personal blog for Sam Rhea, built with Astro and deployed to Cloudflare Pages.

## Tech Stack

- **Framework**: Astro 5.x (SSR mode with `output: 'server'`)
- **Styling**: TailwindCSS 3.x with typography plugin
- **Deployment**: Cloudflare Pages via `@astrojs/cloudflare` adapter
- **Font**: Inter (loaded from rsms.me)

## Project Structure

```
src/
├── components/       # Astro components (FilterBar, Nav, Footer, PostCard, Pagination)
├── content/
│   ├── config.ts     # Content collection schema
│   └── posts/        # Markdown blog posts (~133 files)
├── data/             # JSON data files
│   ├── cloudflare.json   # External Cloudflare blog posts
│   ├── career.json       # Career timeline for about page
│   ├── education.json    # Education data
│   └── patents.json      # Patent data
├── layouts/
│   └── Layout.astro  # Main HTML layout wrapper
├── pages/
│   ├── index.astro   # Homepage with filtering (SSR, prerender=false)
│   ├── about.astro   # About page
│   ├── 404.astro     # Not found page
│   └── posts/[...slug].astro  # Dynamic post routes (prerendered)
└── utils/
    └── data.ts       # getAllContent() - merges local posts + cloudflare.json
```

## Content Collections

### Posts Schema (`src/content/config.ts`)

```typescript
{
  title: string,
  date: string,
  description?: string,
  category?: string,
  tags?: string[],
  draft?: boolean
}
```

### Categories & Filters

Homepage filters posts by category/tag:
- **all**: Everything except reading posts
- **starred**: Posts tagged with `hits`
- **reading**: Posts with category `reading` or tag `reading`
- **portugal**, **texas**, **cloudflare**: Filter by matching category/tag

## Book/Reading Posts

Reading posts follow a specific template. Key distinguishing features:

### Frontmatter (extended beyond base schema)

```yaml
---
title: "📚 Book Title by Author"
date: "YYYY-MM-DD"           # Use finish date
template: "post"
draft: false
slug: "YYYY/slug-name"
category: "reading"          # REQUIRED for reading posts
tags:
  - "reading"
  - "books"
description: "Short tagline"

# Book-specific metadata (not in schema, but included):
book: "Book Title"
Author: "Author Name"
Year Published: "YYYY"
Format: "Kindle" | "Paperback" | "Hardcover" | "Audiobook"
Pages: number
ASIN: "Amazon ID" | ISBN: "ISBN number"
DateStart: "Month DD, YYYY"
DateFinish: "Month DD, YYYY"
---
```

### Content Structure

1. **Blockquote intro**: "Not a Book Report" disclaimer
2. **Why did I read it?**: Personal context
3. **What is it?**: Table with book details (Title, Author, Year, Format, Pages, ASIN/ISBN)
4. **Publisher Summary**: (optional) Book description
5. **How did I read it?**: Table with Date Started, Date Finished, Places Read
6. **Notes - No Spoilers**: Bullet points with thoughts

### Example File Naming

`YYYY-MM-DD-slug.md` where date is the **finish date**

Examples:
- `2024-12-21-we-are-legion.md`
- `2024-10-03-ghost-brigades.md`

## Data Flow

1. `getAllContent()` in `src/utils/data.ts` merges:
   - Local markdown posts from `src/content/posts/`
   - External posts from `src/data/cloudflare.json`
2. Returns sorted array (newest first) with normalized shape
3. Homepage filters and paginates (15 posts/page)

## Rendering Modes

- **index.astro**: SSR (`prerender = false`) - handles dynamic filtering
- **posts/[...slug].astro**: Static (`prerender = true`) - all posts prerendered at build

## Styling

- Dark theme ("midnight" color palette)
- Prose styling via `@tailwindcss/typography`
- Config in `tailwind.config.mjs`

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Deployment

Deployed to Cloudflare Pages. Config in `wrangler.jsonc`.
