---
title: "🎙️🗄️ AI Blog Search"
date: "2025-02-23"
template: "post"
draft: false
slug: "/posts/2025/ai-search"
category: "walkthrough"
tags:
  - "walkthrough"
  - "Workers"
  - "Cloudflare"
  - "AI"
description: "Adding AI-powered vector DB search to the blog."
---

This blog is now home to dozens of posts (and dozens of readers)! I sometimes want to quickly find an old post, or let them find an old post, without having to open the GitHub repository and use the search function there.

So I added a new search function directly into the blog powered by Cloudflare Workers AI and our vector database, Vectorize.

**🎯 I have a few goals for this project:**

* Implement an essentially zero-cost search function in my blog.
* Make the search fuzzy enough that you do not need exact terms.
* Deliver the search experience and results within my blog homepage.
* Deploy this all inside of my existing Cloudflare Pages project without additional Workers or other auxillary services.

---

**🗺️ This walkthrough covers how to:**

* Use Cloudflare Vectorize to store vectors for each blog post.
* Add a front-end flow to my Lumen-themed Gatsby blog.
* Implement the search API as a Cloudflare Pages function.

**⏲️Time to complete: ~30 minutes**

---

> **👔 I work there.** I [work](https://www.linkedin.com/in/samrhea/) at Cloudflare. Several of my posts on this blog that discuss Cloudflare [focus on building](https://blog.samrhea.com/tag/workers/) things with Cloudflare Workers. I'm a Workers customer and [pay](https://twitter.com/LakeAustinBlvd/status/1200380340382191617) my invoice to use it.

## Vectorize the Posts

Cloudflare's [Vectorize](https://developers.cloudflare.com/vectorize/) product is a globally distributed vector database that enables you to build full-stack, AI-powered applications with Cloudflare Workers. I recently set it up to add vector-embedded search for my [personal blog](https://blog.samrhea.com/) posts. I wound up building a simple UI that allows me to test the search as well as view the associated metadata for the entries.

**Vector Embedding**

I have written posts on this blog for years, and I continue to add new ones, so I introduced a [GitHub action](https://github.com/TownLake/blog-samrhea/actions/workflows/blog-vector.yaml) in the blog repository that will take new posts and send them to Vectorize and it [also has a flow](https://github.com/TownLake/blog-samrhea/blob/main/.github/workflows/blog-vector.yaml#L10) that I can add old posts manually.

The manual option is tedious but I did not want all posts sent. You can adapt it to batch posts if you'd like.

**Local Review**

This repository contains a [script](https://github.com/TownLake/vectorize-explorer/blob/main/scripts/get-vector-metadata.py) where you can start reviewing your vector metadata without deploying the application as a whole.

1) Copy or download the python script linked above.
2) Replace `TOKEN` with your actual Cloudflare bearer token (it needs read/write permissions for Vectorize).
3) Replace `account-id` and `index-name` in the url with your account ID and the name of your Vectorize index.

The script makes two requests so be sure to replace it in both.

## Implement the UI

I will not go into too much detail here mostly because I finished this project during my son's morning nap and the time constraint meant I leaned **heavily** on an LLM to write the .scss and .tsx files to bring this to life in the blog. The interesting part about this is the vector DB and the search, anyway.

I'm going to move quickly through this section and just call out the pull requests and files if you want to copy these for your own usage.

**Search Toggle**
[Pull Request](https://github.com/TownLake/blog-samrhea/commit/33eacc03062c80a82b746adcaa85dc5fac5ec492)
* Most of the UI functionality is implemented in this commit to these files.
* I added a search-toggle component for the toggle and input field.
* I modified the sidebar-author component which houses the search-toggle experience.
* Some modifications to the theme-switcher component which this intends to mimic.

**Search Results**
[Pull Request](https://github.com/TownLake/blog-samrhea/commit/1851b776d15356002cc080fd5acf30962dfc011a)
* This implements the results UI.
* I have it only show the highest four matches because I don't think pagination inside of a page that already has pagination is useful. And if the embedding model is good enough, those first four should get you what you want.
* Some of the site-wide styles need to change to handle the rounded corners and focus indicators.

## Deploy the Search Function

I adapted [the scripts](https://github.com/TownLake/vectorize-explorer/blob/main/src/routes/search/%2Bserver.ts) in my explorer earlier into a Pages function iside of the project.

Unlike the first playground app, I used the bindings available in the Pages UI to set the variables I need (`VECTORIZE` and `AI`). Implementing it this way, inside of the project, means I do not have to worry about tokens or managing a separate deployment.

## What's next?

You can begin using this in the blog right now!

I am curious about how well the embedding model holds up. Will future models improve enough that it is worth blowing away my current Vector DB and redoing it with new embeddings? Probably.
