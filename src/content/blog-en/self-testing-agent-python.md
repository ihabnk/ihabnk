---
title: "Building a Self-Testing Agent in Python"
description: "Step by step: building a software agent that writes its own test cases, runs them, and learns from failure."
date: 2026-04-18
draft: false
tags: ["Engineering", "AI/ML"]
---

Self-testing agents sound like science fiction until you actually build one and realize how much of the work is plumbing. Most of the magic isn't in the LLM call — it's in the harness around it: deterministic fixtures, structured logs, a retry policy that doesn't waste tokens, and a feedback loop that turns a flaky run into a usable signal.

I've shipped two of these in the last year. One generates Selenium scripts for legacy web apps; the other authors `pytest` suites for a Python SDK. The second one is the more interesting case, because the agent could see the public API surface and use it to design tests that a human probably wouldn't write — including a few that immediately found bugs nobody else had spotted.

## The basic loop

The architecture is boring on purpose:

- Read the public API surface (signatures, types, docstrings).
- Ask the model for a list of test ideas, then a generated implementation.
- Run each test in an isolated subprocess against a real instance of the system.
- Feed failures back to the model, including the full traceback and any captured stdout.

The trick is keeping the loop tight enough that you don't burn your token budget waiting for the model to converge on a working test.

## Where it broke

The first version was over-eager. It would write tests that passed against the model's *imagination* of the SDK, not the SDK we actually shipped. The fix wasn't a smarter model — it was a stricter `eval` step that forced the agent to execute the test before claiming success.

> "An agent that doesn't run its own code is a hallucination with a pretty UI."

### Lessons after six months

The biggest surprise was how much the agent's test ideas improved when we let it read previous failures. It started writing edge-case tests on its own — things like passing empty strings to the chunker, or feeding it a 50MB document just to see what would break. That's the kind of contrarian instinct that takes a human tester years to develop.

If you're starting one of these projects, my advice is the same as for any infra project: keep the surface area small, log everything, and don't trust a single run.
