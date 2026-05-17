---
title: "Evals Are the New Unit Tests"
description: "Why every team shipping AI features ends up rebuilding a test framework from scratch — and what the good ones look like."
date: 2026-01-30
draft: false
tags: ["AI/ML", "Engineering"]
---

The first time you try to write a unit test for an LLM-backed function, you discover the assertion library you've been using for ten years has nothing useful to say. `assertEqual` was designed for deterministic functions. When your function calls a model that gives a slightly different answer every time, you're going to want a vocabulary that doesn't exist yet in your test runner.

That's the moment most teams quietly start building their own eval framework. And almost every one of them ends up looking like a slightly-worse `pytest` with a graded judge bolted on. I've now seen this happen at four companies, and the pattern is identical enough to be funny.

## What an eval actually is

An eval is three things wrapped into one harness:

- A dataset of examples with inputs and (usually) reference outputs.
- A grader that compares the model's output to whatever "good" means for this task.
- A runner that does the comparison at scale and gives you a number.

The runner is the easy part. The grader is where everyone gets stuck — because "good" turns out to be a much harder concept than it looks when the right answer isn't a literal string match.

> "If you can't articulate what 'better' means in a sentence, your eval is going to tell you nothing."

## Three categories of grader

The graders I see in practice fall into three buckets. The cheap one is `exact match` — works for classification, fails for generation. The fancy one is `model graded` — a stronger model judges the weaker model's output against a rubric. The expensive one is `human graded` — slow, expensive, but still the gold standard for nuanced tasks.

### The trap of model-graded evals

Model-graded evals are seductive because they scale. They also drift in ways you won't notice. A grader prompt that looked rigorous in week one will quietly start rewarding verbosity, or politeness, or whatever the grading model happens to bias toward. Re-anchor against human grades at least once a quarter, or you'll wake up one morning to a metric that means nothing.

If you're starting an eval framework today, my advice is unromantic: copy whatever your test runner already does, add a `grader` interface, and avoid building a UI until you absolutely need one.
