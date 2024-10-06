---
title: "💘🤖 Building Plan-a-Date on Cloudflare"
date: "2024-10-06"
template: "post"
draft: false
slug: "/posts/2024/plan-a-date"
category: "walkthrough"
tags:
  - "walkthrough"
  - "Workers"
  - "Cloudflare"
  - "AI"
description: "The least romantic way to plan a date"
socialImage: "./media/plan-a-date.png"
---

>First, let me just say, "I get it." This is the least romantic way to plan anything, much less date night. This is more an experiment to demonstrate how easy it is to ship something now and the nearest problem I had was a Saturday without any concrete date night plans.

Alright, back to the blog.

My wife and I have an eight month old boy at home. We both work full-time. We both travel for work or social obligations frequently. We don’t see each other that often.

One night each week, during the middle of the week, we have a babysitter come visit so that we can get out of the house for dinner. We also have weekends after our son goes down but that means we are typically anchored to the range of our baby monitor unless we plan ahead.

And we are almost always too tired to plan ahead. Instead, we throw out suggestions at the last minute and eventually default to ordering out pizza, splitting a bottle of wine, and streaming something. Lately *Hacks*.

So, during one of our son’s naps, I decided to try to build something to solve that.

---

**🎯 I have a few goals for this project:**

* Build something silly that couples can use to plan date night without much pressure.
* Try out as much of the Cloudflare Developer Platform stack as possible.

---

**🗺️ This walkthrough covers how to:**

* Build a full-stack application running entirely on Cloudflare's Developer Platform.

**⏲️Time to complete: ~100 minutes**

---

> **👔 I work there.** I [work](https://www.linkedin.com/in/samrhea/) at Cloudflare. Several of my posts on this blog that discuss Cloudflare [focus on building](https://blog.samrhea.com/tag/workers/) things with Cloudflare Workers. I'm a Workers customer and [pay](https://twitter.com/LakeAustinBlvd/status/1200380340382191617) my invoice to use it.

Want to jump straight to the code? Repo open [here](https://github.com/TownLake/DateNight).

## What is it?

[Plan-a-date.com](https://plan-a-date.com/) builds date night itineraries based on the merged, blinded, preferences of two partners. The first partner adds their choices and then receives a unique URL to share with the second partner. When the second partner inputs their preferences, an AI considers both sets of ideas and creates a joint itinerary. It is a compromise machine.

![Plan a Date][./media/plan-a-date.png]

The tool (based on the system prompt send to the AI) also takes into account some important things like if one partner says “No Thanks” about physical intimacy then it will never recommend any physical activity.

## How does this work?

![Plan a Date Architecture][./media/plan-a-date-architecture.png]

1. Partner 1 selects their preferences. Once they hit Submit, the Pages app sends those to a Cloudflare Worker.  
2. The Worker does two things at this point. First, the Worker creates a unique identifier for this particular date and sends it back to the app. Second, the Worker sends that identifier and the submitted preferences to Workers KV for storage.  
3. That identifier becomes the unique URL that Partner 1 can share with Partner 2 so that we don’t have to worry about user accounts. The app loads that response in the copy-link experience.  
4. Partner 1 shares that link with Partner 2\. Partner 2 sees a blank page and can submit their own preferences.  
5. The app sends their preferences to the same Worker.  
6. The Worker then sends Partner 2’s preferences to KV.  
7. The Worker also retrievers the other partner’s preferences based on the shared identifier.  
8. The Worker then sends both partners’ preferences and a system prompt (standard guardrails to tell the AI what to do) to Cloudflare’s AI Gateway, where a Large Language Model (LLM), in this case Meta’s Llama, drafts up an itinerary.  
9. The text of the itinerary is sent to the Worker.  
10. The Worker sends the text back to the app on Partner 2’s screen where a Markdown handler renders it *slightly* prettier.

And the actual domain, plan-a-date.com, was purchased on Cloudflare’s domain registrar. The domain was available which is another data point about how silly this is.

### What’s under the hood?

First, Cloudflare Pages. [Cloudflare Pages](https://pages.cloudflare.com/) is a “JAMstack platform for frontend developers to collaborate and deploy websites.” That just means it is a clean and easy place to deploy a simple web app like this.

The front-end consists of a single page Next.js application. The form handles collecting inputs, displaying responses, and interacting with the back-end. The page does feature some lightweight logic of its own. For example, if you select `No Screens` then the `Genre` options become grayed out. That runs entirely inside the app in your browser.

Cloudflare Pages integrates directly with the [GitHub repository](https://github.com/TownLake/DateNight) where the code lives. I can configure the build template, in this case Next.js, and Pages will build and deploy my application any time I make a change. I could set up a staging pipeline in Pages, as well, and protect it behind a simple authentication layer but this is not exactly a mission critical application and I don't mind breaking it.

![Pages][./media/plan-a-date-pages-app.png]

Behind the Pages application is a single [Cloudflare Worker](https://workers.cloudflare.com/) that has multiple jobs. The UI only ever interacts with this Worker which, in turn, communicates with the storage layer (Workers KV) and the AI LLM (Llama running on AI Gateway). The Worker handles finding your partner’s preferences if already submitted and then matching them up with yours. The Worker also generates the unique ID.

![KV Pairs][./media/kv-pairs.png]

Unlike [other recent Workers AI projects](https://lisbon-ai.samrhea.com/), we need a storage layer since this is not a single user inputting their preferences and getting a response. We need those preferences to sit somewhere until the user’s partner adds theirs. Workers KV (short for Key Value) provides an ideal set up for this. I can bind my Worker to a KV namespace that I create so that the Worker knows to access it.

Finally, Cloudflare Workers AI. Specifically [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/) \+ Workers AI. Cloudflare Workers AI is an inference platform where you can run AI models (like Meta’s popular Llama) on Cloudflare hardware. That makes it [very fast](https://blog.cloudflare.com/workers-ai-bigger-better-faster), especially for applications running entirely on Cloudflare like this one. My Worker can send the prompts and get the response very, very quickly.

![AI Gateway][./media/ai-gateway.png]

I layered on Cloudflare AI Gateway, as well. AI Gateway logs requests/responses, gives me a feedback mechanism for them, and adds additional features like rate limiting and caching.

And the best part is that I don't have to worry about anything else. The DNS record was created with a single click. The site is protected from DDoS attacks. The site is safer thanks to the default Cloudflare WAF rules. The site is lightning fast thanks to Cloudflare's CDN. I literally had to do exactly zero work for any of that.

## How was it built?

I cannot overstate how easy that new LLM tools make it to build an application - as long as you have the rough idea for what you want, a general architecture in mind, and the ability to debug. I leaned **heavily** on Anthropic’s Claude for this. To the point that writing code manually almost feels as tedious as washing clothes by hand. Like, sure, if you want to spend your time doing that you can and you can even do a better job, but why not just let the machines do it? They’ll do it faster and make fewer mistakes.

We aren’t (yet) at a place where you could build a full-stack application by just talking it into existence. I still needed to know that this would need to use KV, for example, and I needed to debug some issues with the Next.js application on Pages. These AI tools also really drop the ball when it comes to remembering the names of environment variables, which can cause all sorts of headaches for API tokens or storage retrieval.

We’re also a ways away from using these kinds of tools as an individual to build a single, complex, SaaS application without a software development background. This app is very simple. That said, it feels like absolute magic to just provide the file to Claude, bark at it with “hey make this dark mode too,” and then the file is updated and suddenly you have dark mode in your app. Magic.

## What is next?

Again, this is silly. Still can be fun, though. People seem tickled by it and that’s enough for me.

One interesting thing, though, is that Cloudflare's AI Gateway logs the prompts (and responses) sent to the LLM. Since nothing here can be used to identify an individual (there isn’t even free text input), I feel comfortable analyzing that data in aggregate. I’m curious about some of the overlap between partner preferences. I’ll let this run for a bit and then investigate.
