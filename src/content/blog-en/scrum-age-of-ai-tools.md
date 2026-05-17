---
title: "Scrum in the Age of AI Tools"
description: "How Scrum teams adapt to the wave of AI tooling without losing the rhythm of collaboration."
date: 2026-03-22
draft: false
tags: ["Scrum", "Product"]
---

Every Scrum team I've worked with in the past year is quietly rewriting its working agreements. The framework hasn't changed — sprints, stand-ups, retrospectives, definitions of done — but the texture of the work inside it has shifted enough that the old defaults stop fitting. Stories take less time to implement and more time to verify. Reviews surface model behavior more often than they surface UI bugs.

The teams that adapted well treated AI tooling the way Scrum already treats every other variable: as something to inspect and adapt every two weeks. The teams that struggled tried to bolt AI onto a Sprint Plan they hadn't redesigned in years.

## What changed in the ceremonies

Three rituals reshaped themselves first:

- **Refinement** now includes a "feasibility" step. Can the model actually do this, or is it a wish? Spike sooner.
- **Reviews** demo agent behavior, not features. We pre-record a few canonical runs because live demos are non-deterministic.
- **Retros** track eval scores in the same conversation as velocity. If our `pass@1` dropped, that's a quality conversation worth a whole retro.

These aren't radical changes. They're the same rituals, attended to with different questions.

> "AI didn't break Scrum. It just made the parts everyone was skipping suddenly load-bearing."

## The role of the Scrum Master

The job got more interesting. A Scrum Master used to spend most of their week unblocking, facilitating, and protecting the team from interruptions. Now they spend at least as much time helping the team build shared judgment about when to trust a model's output.

### A practical example

Last sprint, a developer asked whether they should ship a feature that worked 94% of the time. The classic answer is "depends on the cost of failure." The new answer is "depends on the cost of failure *and* how you're measuring that 94%." Getting the team to a shared definition of "good enough" is now part of facilitation, not engineering.

If your team feels like Scrum stopped working in the AI era, the chances are that Scrum is fine — the team just hasn't renegotiated what "done" means yet.
