---
title: "💘📊 Reviewing Plan-a-Date Data"
date: "2024-10-24"
template: "post"
draft: false
slug: "/posts/2024/plan-a-date-data"
category: "walkthrough"
tags:
  - "walkthrough"
  - "Workers"
  - "Cloudflare"
  - "AI"
description: "Even less romantic than the app"

---

A couple of weeks ago I [built](https://blog.samrhea.com/posts/2024/plan-a-date/) the Internet’s least romantic date planning service. [Plan-a-date](https://plan-a-date.com/) takes input from two users, compares their preferences, and then uses Cloudflare Workers AI to create a custom date night plan.

Reviews varied. Feedback ranged from my wife asking me “why would you build this? What is wrong with you?” to my college-bros-group-chat asking for kinkier toggles. So, another big win in my [project](https://blog.samrhea.com/pages/projects/) trophy case.

Now that the app has been out there in the wild, I was curious about the data. One neat thing about Cloudflare Workers AI is the integration with Cloudflare’s AI Gateway, a kind of proxy and gateway for the requests that your application sends to an AI model (any AI model, not just inference models running on Cloudflare).

You can use AI Gateway to cache responses, add rate limiting, and capture logs with feedback loops. The logs part is interesting to me for this experiment because I can evaluate the preferences of users. Important note: this data lacks anything that tells me who a submitter is - I am not capturing anything identifiable about any user. No account login or sneaky tracking etc.

So, that means we can play a kind of *The Newlywed Game* in anonymous aggregate. Just how agreeable are y’all?

## Exporting the Logs

It takes some manual effort but [you can export your logs](https://developers.cloudflare.com/ai-gateway/observability/logging/logpush/), in an encrypted format, via Cloudflare Logpush. I’ll skip over the details since they are covered in that documentation but, funny enough, it’s probably the most tedious part of building out this entire application.

Once you have the logs you can analyze them in your tool of choice. I used both a Google Sheet and OpenAI’s new o1 reasoning LLM and compared notes. The breakdown below combines outputs from both of those tools.

## Individual Preferences

First, let’s consider all entries as just one big population pool. We'll treat all users as individuals without regard for their partner. We can use this first pass to evaluate general popularity of certain preferences.

One important note: many of these toggles are multiselect. So, a user can submit that they would be open to eating out or getting take out food. As a result, the percentages in some of the categories below are not expected to add up to 100. They are also not required, so some users skipped some categories.

**Eating**  
Preference submitted by 87% of users.

* Eat Out: 46%  
* Take Out: 40%  
* Cook Together: 35%

No big surprise here, right? Going out on a big date night seems more popular than staying at home.

**Activity**  
Preference submitted by 81% of users.

* Stay Home: 48%  
* Culture-ing: 28%  
* Strolling: 25%  
* Dancing: 15%

Well, until we get to the activity. Most of y’all want to just stay in your pajamas. I get that. I do too. Like all selection options, though, a lot of this is going to be biased. I know exactly one person who likes to go out dancing regularly. And the other options are probably too generic. I don't have an option for, let's say, pottery class.

**Watching**  
Preference submitted by 81% of users.

* No Screens: 40%  
* Movie: 35%  
* Binge: 25%

This is probably the best example in this dataset of revealed versus stated preferences. More people claim they want to spend time together without screens, but I bet the real data suggests that many couples just wind up watching something on Netflix until one partner falls asleep. Purely hypothetical guess; definitely not talking about myself here...

**Genre**  
Preference submitted by 44% of users.

* Action: 13%  
* RomCom: 12%  
* SitCom: 11%  
* Drama: 9%

This is impacted by the fact that if you pick `No Screens` you cannot select a genre, so the percentages of all users selecting a genre will naturally be smaller.

**Physical Intimacy**  
Preference submitted by 90% of users.

* Hot & Heavy: 48%  
* Make Out: 31%  
* Snuggle: 27%  
* No Thanks: 8%

The most popular answer by percentage of preferences submitted. Nearly half of all respondents want to get hot and heavy, but let’s see if their partners agree.

## Couples’ Preferences

The section above treats everyone as an individual, but that is not the point of Plan-a-Date. Plan-a-Date’s mission is to find compromise. To that end, how hard does Plan-a-Date have to work? I can also use the AI Gateway logs to compare the inputs from the actual couples themselves to see how often they overlap.

*This raises an interesting point that I had not considered. Plan-a-Date uses AI to get creative because there are so many different permutations of what two people can prefer. While I bet it is rare, you could imagine a deterministic step that happens upfront where Plan-a-Date skips the AI model altogether and just says “hey, you picked the exact same things. Here they are - go nuts.”*

Anyway, on to the data.

**Eating:** 62% match  
**Activity:** 54% match  
**Watching:** 42% match  
**Genre:** 29% match  
**Physical Intimacy:** 71% match

I’m not sure what to make of this, but I will hazard a guess. I assume that physical intimacy is this high because that is something that can become a real headache in a relationship if you’re not on the same page about it (while acknowledging that some days are different from others). Whereas my preference for RomComs and my wife’s preference for Fantasy Epics doesn’t really impact the health of our relationship that much.

## What’s next?

I’ll leave this thing running until the domain expires (at which point I’ll just move it to something like a subdomain of `samrhea.com`. Admittedly, traffic has dropped off and I don’t think I’m going to see a whole lot of repeat customers. This is mostly an entertaining gimmick.

And given that it took just an hour or two to ship, that’s worth it to me. Fun chance to test out new pieces of the Cloudflare stack, specifically AI Gateway. Also a neat opportunity to experiment with OpenAI’s new o1 model.

I’m sure more scientific analysis could be done here. Real experts do that with real dating application data [all the time](https://www.google.com/search?q=dating+app+data+analysis&oq=dating+app+data+analysis&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIMCAcQABhDGIAEGIoFMgcICBAAGIAEMgcICRAAGIAE0gEIMjEwN2owajeoAgCwAgA&sourceid=chrome&ie=UTF-8). Like Plan-a-Date itself, though, this analysis is just for fun.
