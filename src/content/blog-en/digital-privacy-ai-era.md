---
title: "Digital Privacy in the AI Era"
description: "What product builders need to consider when shipping data-driven AI products."
date: 2026-02-11
draft: false
tags: ["Product", "AI/ML"]
---

Privacy used to be a compliance line item — a checklist completed by a lawyer two weeks before launch, with a small banner at the bottom of the page. AI products don't get that luxury. The moment your product starts learning from user inputs, every prompt becomes a piece of data with a half-life longer than the session it came from. The defaults that shipped your last SaaS product will quietly leak.

I've watched two teams I respect make the same mistake within months of each other: shipping an "AI feature" that captured prompts, model outputs, and intermediate reasoning into the same warehouse they use for product analytics. By the time legal got involved, the data was already replicated across three downstream pipelines.

## The questions to ask before you ship

Before any AI feature reaches production, I now run a short checklist with the team:

- What gets sent to the model? Just the prompt, or context from elsewhere?
- Where is it stored, and for how long? Logs, traces, evals — all of them.
- Who can read it later? Engineers? Support? The model provider?
- What happens when a user asks for deletion? Can you actually delete it from the eval set?

None of these questions are new. What's new is that the answers used to be obvious, and now they aren't.

> "Privacy isn't a feature. It's an architectural decision you make every time you choose where to put the data."

## The hidden surface area

The thing I keep underestimating is how much *new* user data an AI feature creates that didn't exist before. A search bar generates queries. A chat surface generates entire conversations. A code assistant captures fragments of proprietary code as users iterate on prompts. All of this lives somewhere — and "somewhere" is usually the path of least resistance, which is your existing analytics pipeline.

### A small change with a big payoff

The cheapest fix I've shipped is segregating AI traffic at the edge: a separate ingestion endpoint, separate retention rules, separate access controls. It takes a sprint to set up and saves you months of cleanup when the policy conversation finally arrives — and it always arrives.

If you're shipping AI features and you haven't drawn the data-flow diagram lately, draw it. You'll find at least one surprise.
