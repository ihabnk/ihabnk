---
title: "Shipping LLM Features in Production Without Losing Sleep"
description: "A practitioner's checklist for taking a prompt that works in a notebook and making it survive real users."
date: 2025-12-14
draft: false
tags: ["Engineering", "Product"]
---

There is a long, painful distance between "the prompt works on my laptop" and "the feature works in production for a hundred thousand users." Most of that distance has nothing to do with the model itself. It has to do with everything around the model: timeouts, retries, fallbacks, logging, rate limits, cost ceilings, and the cold sweat of a 3 a.m. page.

I've shipped enough LLM-backed features at this point to have a short checklist I run before I let one near real users. None of it is clever. All of it has bitten me at least once.

## The pre-flight list

Before shipping, these need an answer in writing:

- What's the timeout, and what do we render when we hit it?
- What's the fallback when the provider returns 5xx or rate-limits us?
- What's the budget per user per day, and how do we enforce it?
- Where do prompts and outputs get logged, and for how long?
- Who gets paged, on what signal, and what's the first thing they look at?

The last one is the most overlooked. Teams ship a prompt with no plan for what to do when it starts misbehaving in production — which it will, because prompts drift the moment the provider ships a new model version under the same name.

> "A prompt without a fallback isn't a feature. It's a wish."

## The two reliability patterns I keep reaching for

After enough incidents, my muscle memory has settled on two patterns. The first is `degrade gracefully` — every LLM-backed surface has a deterministic fallback that's worse but functional. Search falls back to keyword. Summarization falls back to first paragraph. Recommendations fall back to "popular this week." Users hate broken; they tolerate "less smart."

### The second pattern: budget at the edge

The second is enforcing per-user, per-day token budgets at the API gateway, not in the application. Application-level budgets get bypassed the first time you add a new endpoint. Edge-level budgets stay enforced regardless of which code path the user lands on. The day a confused script starts making a million requests, that single config saves the quarter.

There's no glamour in any of this. The glamour is upstream, in the prompt. The reliability lives downstream, in the boring layers nobody writes blog posts about — until something goes wrong.
