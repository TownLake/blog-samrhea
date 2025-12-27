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
- `2025-12-21-we-are-legion.md`
- `2025-12-24-for-we-are-many.md`
- `2025-12-27-all-these-worlds.md`

## Adding a New Finished Book Post

Follow these steps to add a new book reading post:

### 1. File Creation

Create a new markdown file in `src/content/posts/` with the naming convention:
```
YYYY-MM-DD-book-title-slug.md
```

Where `YYYY-MM-DD` is the **date you finished reading the book**.

### 2. Copy the Template

Use this template structure:

```markdown
---
title: "📚 Book Title by Author Name"
date: "YYYY-MM-DD"           # Finish date
template: "post"
draft: false
slug: "YYYY/book-title-slug"
category: "reading"          # REQUIRED
tags:
  - "reading"
  - "books"
description: "Short one-line description"

book: "Book Title"
Author: "Author Name"
Year Published: "YYYY"
Format: "Kindle" | "Paperback" | "Hardcover" | "Audiobook"
Pages: XXX
ASIN: "B0XXXXXXXX"           # For Kindle books
# OR
ISBN: "978-XXXXXXXXXX"       # For physical books
DateStart: "Month DD, YYYY"
DateFinish: "Month DD, YYYY"
---

> ## Not a Book Report
> I enjoy [reflecting](https://blog.samrhea.com/posts/2019/analyze-media-habits) on the movies, TV, books and other media that I consume. I'm notoriously sentimental. This [series](https://blog.samrhea.com/category/reading) documents the books that I read. These aren't reviews or recommendations. Just a list. For me. Mostly so that I can page through what I read, where I was, and when.

## Why did I read it?
[Personal context about why you chose this book]

## What is it?
|Category|Value|
|---|---|
|**Title**|*Book Title*|
|**Author**|Author Name|
|**Year Published**|YYYY|
|**Format**|Kindle/Paperback/Hardcover/Audiobook|
|**Pages**|XXX|
|**ASIN**|B0XXXXXXXX|

### Publisher Summary

[Optional: Copy the publisher's book description]

## How did I read it?
|Category|Value|
|---|---|
|**Date Started**|Month DD, YYYY|
|**Date Finished**|Month DD, YYYY|
|**Places Read**|Location(s)|

## Notes - No Spoilers
* [Your thoughts and observations]
* [Keep them spoiler-free]
* [Use bullet points]
```

### 3. Emoji Conventions in Titles

Add emojis to the title to indicate progression in a series or special characteristics:
- Single book: `📚 Book Title`
- First in series: `📚 Book Title`
- Second in series: `📚📚 Book Title`
- Third in series: `📚📚📚 Book Title`
- Or use thematic emojis: `🤖 Robot Book`, `🚀 Space Book`, etc.

For the Bobiverse series specifically, use robot + person emojis:
- Book 1: `🤖👨 We Are Legion (We Are Bob)`
- Book 2: `👨👨 For We Are Many`
- Book 3: `👨👨👨 All These Worlds`

### 4. Key Details to Include

**Required Metadata:**
- `category: "reading"` - This is essential for filtering
- `tags: ["reading", "books"]` - Standard tags for all book posts
- Finish date as both `date` and `DateFinish`

**Book Information:**
- For Kindle books, use ASIN (found on Amazon product page)
- For physical books, use ISBN
- Page count (even for Kindle, approximate is fine)
- Actual start and finish dates

**Places Read:**
- List specific locations (cities, flights, etc.)
- Use `<br>` for multiple locations in the table

### 5. Content Guidelines

**Why did I read it?**
- Keep it brief (1-3 sentences)
- Personal context or how you discovered the book

**Publisher Summary:**
- Optional section
- Copy from Amazon or publisher
- Keep original formatting

**Notes:**
- Bullet points only
- NO SPOILERS
- Personal reactions, observations
- Can mention writing style, pacing, characters (without plot details)

### 6. Verification

After creating the file:
1. Check that filename uses finish date: `YYYY-MM-DD-slug.md`
2. Verify `category: "reading"` is set
3. Ensure dates are consistent between frontmatter fields
4. Review that notes are spoiler-free

### 7. Examples to Reference

Look at these existing posts for examples:
- `2025-12-21-we-are-legion.md` - First in series
- `2025-12-24-for-we-are-many.md` - Second in series
- `2025-12-27-all-these-worlds.md` - Third in series

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
