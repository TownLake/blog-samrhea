---
title: "🤖⌚ Cloudflare Workers AI on the Apple Watch"
date: "2024-09-21"
template: "post"
draft: false
slug: "/posts/2024/workers-ai-watch"
category: "walkthrough"
tags:
  - "walkthrough"
  - "Workers"
  - "Cloudflare"
  - "AI"
description: "AI on the Apple Watch before Apple AI."

---

It has been nearly a year since I published a [walkthrough](https://blog.samrhea.com/category/walkthrough/) of any sort. The original purpose of this blog has given way to unhinged anecdotes about [Portugal](https://blog.samrhea.com/category/portugal/) and [Texas](https://blog.samrhea.com/category/portugal/).

Today I return to my roots! Apple released iOS 18 earlier this week but it was missing the biggest feature: their generative Artificial Intelligence (AI) platform called Apple Intelligence (also, cheekily, styled as _AI_). _A*AI_ is scheduled for a beta launch later this year.

As someone who [frequently wears](https://blog.samrhea.com/posts/2024/apple-mechanical-watch/) an Apple Watch, I'm excited about the Apple Intelligence but also impatient. I figured I could combine Cloudflare Workers AI, Meta's latest Large Language Model (LLM), and an iOS Shortcuts to build my own tool for the time being.

---

**🎯 I have a few goals for this project:**

* Use a leading LLM from my Apple Watch.
* Run that LLM in an environment that I control where I can modify system prompts and other details.
* Log the requests and responses in an AI gateway for future analytics.

---

**🗺️ This walkthrough covers how to:**

* Set up Cloudflare Workers AI and AI Gateway.
* Configure an iOS Shortcut to use your Cloudflare Workers AI/AI Gateway deployment.

**⏲️Time to complete: ~15 minutes**

---

> **👔 I work there.** I [work](https://www.linkedin.com/in/samrhea/) at Cloudflare. Some of my posts on this blog that discuss Cloudflare [focus on building](https://blog.samrhea.com/tag/workers/) things with Cloudflare Workers. That said, I am a real Workers customer and [pay](https://twitter.com/LakeAustinBlvd/status/1200380340382191617) my invoice to use it.

## Set Up Cloudflare Workers AI

Cloudflare's network provides a developer platform where builders can run compute workloads and store data. As part of that infrastructure, customers can also run AI inference. AI inference just refers to cases when you take an AI model and provide it with new information, like a question about Lisbon, and the model running on some piece of hardware infers a response. In this case, the model might have been built and trained elsewhere but is now running on Cloudflare hardware. You can use this type of inference in Cloudflare Workers AI to run one-off workflows or build real applications, like [this Lisbon recommendation tool](https://lisbon-ai.samrhea.com/) I put together last week.

Cloudflare [supports a range](https://developers.cloudflare.com/workers-ai/models/) of the most popular generative AI models, including the latest/greatest from Meta, [Llama-3.1](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct). Meta trains the model and, in this deployment, Cloudflare provides the infrastructure and tooling around it. This allows me to run a leading LLM for my own personal queries in an account where I control the configuration and data. I could use other models but I'll stick with Llama for this experiment.

I have already [turned on Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) in my account. What I also want, though, are the logs from this experiment. I would like to retain the requests/responses out of curiosity - maybe I can go back and run a model on those historical queries. Or I can at least just take a look at how frequently I use the tool. [Cloudflare Workers AI Gateway](https://developers.cloudflare.com/ai-gateway/) provides exactly this featureset, so I'll start there.

First, I'll navigate to the `Workers AI` section of the Cloudflare dashboard - specifically the `AI Gateway` page. Once there, I can create a new AI Gateway which will receive requests to the inference model behind it, log the requests and responses, and apply other optional features like caching and rate limiting.

![New AI Gateway](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/76fe95d7-4657-45dc-393d-3e575261f000/public)

Workers AI Gateway can act as a gateway between your users and any number of places where you run AI inference beyond just Cloudflare. Since the model I plan to use is running on Cloudflare Workers AI, though, the setup in the next step is even easier. I can click the `API` button and the dashboard will share an API endpoint that I can use for my gateway.

![AI Gateway Endpoint](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/87a304f7-20a0-4028-d3b4-b4036acfb100/public)

At the end of the path in that endpoint is the details of one available model for example purposes. I'll edit this path to use the specific Workers AI model in the next step. Before I do that, though, I need to create an API token that will allow me to call a model behind this API Gateway. I can do that from inside of the Workers AI section of the dashboard (example below) or from the API Token section as well.

![AI Gateway API Token](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/ad95de09-b219-40ca-1f65-9a0a30bb5800/public)

## Set Up the iOS Shortcut

Alright, now I have an AI Gateway configured in Cloudflare, a model that I want to use available in Cloudflare Workers AI, and an API token that can access both. That was fast. Up next, I need a way for my iPhone and Watch to send requests to that endpoint and receive responses. To do that, I am going to use the iOS Shortcuts app.

I'll start by grabbing a simple input action that will prompt for my question. Next, I will add a `Get contents of` action that uses the URL from my AI Gateway with the specific model I want in the path. This just tells the iOS Shortcut where to send the question and how to send it based on the details in the fields below. Like I mentioned earlier, since I want to use Llama 3.1 I will append that to the end of the AI Gateway path.

I need to set the method to `POST` and add a couple of important details to the actual request. First, I need to provide my Authorization token (do not worry, I have since rotated the one that you can see the first few characters from here). I do not want to leave an open LLM API that anyone can use - this is just for me - and providing this token allows my Shortcut to authenticate and send the query.

Next, the Workers AI API expects to receive the prompt in a message called, well, `prompt`. What I need to do is define that as a Key here. I can then long-press the `Text` field to tell the Shortcut that the text I want sent as the `prompt` is the text that the input action above captured from me as a user.

![Shortcut Part One](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/45c2b357-8536-4e7e-4e1e-3ac5223e0200/public)

If I try to run this, however, the response is going to come back as structured JSON like the example below, which is annoying. I want a way to strip it of that framing.

![Response JSON](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/208f67c8-8a14-4d59-1428-e1fc00043700/public)

To do that, I'll use the `Get Dictionary Value` action that will parse the response for just the value contained in the `result`. However, inside of the `result` is the `response` so I need to repeat that step.

![Shortcut Part One](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/c851b5f8-46c5-401b-b1a2-201af7cc6700/public)

## Run the Shortcut on Apple Watch

Now I can go ahead and configure this Shortcut to appear on my Apple Watch by long-pressing the tile and going into the `Details` view.

![Add to Watch](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/01c5c8a1-e7ac-4fda-36d9-dc2fe5619100/public)

Once configured, I can open the `Shortcuts` app on my watch (or call it with a spoken input or set it up as a quick click option in a watch face).

![Shortcut on Watch](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/0c3f118f-3b0f-4ce1-75b5-64f02b1d4500/public)

I can test it out with a simple question about Lisbon.

![Talk to Shortcut](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/428039ee-92f3-43d9-1f7c-6ce7a8282100/public)

And it will respond with a description that I can read or listen to if I had my headphones in!

![Shortcut Response](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/6389de5d-830f-4269-d149-f7e801351b00/public)

And even better - I can log into the Cloudflare dashboard to use Workers AI Gateway to see that request/response event that just happened.

![AI Gateway](https://imagedelivery.net/BO71HffCLgVKrpfgjL7r7Q/5b298acd-88e0-42fd-7c28-f03692b5a800/public)

## What's next?

This is, admittedly, just one piece of what Apple Intelligence aims to be. It's still useful, though, in the same way that the ChatGPT app from OpenAI is useful.

The real value from Apple Intelligence will be its ability to read from all of the data already on your device. "Hey Siri, when does my mom's flight land and when should I leave for the airport to pick her up?" In theory, Apple Intelligence will be able to look through my inbox for the tickets she forwarded me and use my current location to answer that question. That should be fantastic.

I'll still want to ask about random information, though. Like, "Hey Cloudflare, what would be the ideal way for a Roman legion to defend Sintra given its proximity to the coast and the mountainous terrain?" _This is a real thing I have asked._ This Shortcut covers that use case long before Apple Intelligence can.

You can also imagine a few different use cases where you would want to expand on this concept after Apple Intelligence lands. You could configure this beyond just the basic LLM to also pull in data or materials from your organization. Then team members in the field can use a shortcut to ask questions about your corporate wiki. You could have specific system prompts that you want to apply when asking an AI to rewrite something - [prompts more specific](https://blog.samrhea.com/posts/2024/tone-rewriter/) than what Apple Intelligence will provide. It's going to take a village of agents to get to this future. And now I am one step closer to needing my phone even less.
