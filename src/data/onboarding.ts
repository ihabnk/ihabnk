import type { Day } from '../game/types';

/**
 * "The First 30 Days" — a narrative QA onboarding simulator.
 *
 * Days 1–3 are fully written. The remaining days follow the same shape and
 * can be appended without touching the engine or components. Designed so the
 * 30-day arc can later extend to 60/90 by adding more entries.
 *
 * Confidence (XP) per choice: ~12 best, ~6 reasonable, ~3 weak — always
 * positive to keep beginners motivated; the feedback teaches regardless.
 */
export const DAYS: Day[] = [
  {
    n: 1,
    week: 1,
    weekTitle: 'Observe',
    title: 'Orientation',
    goal: 'Quality means protecting the user — not gatekeeping.',
    skill: { id: 'user-advocacy', label: 'User Advocacy' },
    intro: "Welcome to Northwind. I'm Bit — I'll guide you through your first 30 days. Northwind makes a task-management app used by busy teams. Today is just orientation: let's get your head in the right place.",
    scenes: [
      {
        kind: 'mentor',
        mentor: 'welcome',
        text: "There's no pressure to find bugs today. The best testers start by understanding what 'good' even means here. Let me ask you a couple of things the way your new teammates might.",
      },
      {
        kind: 'choice',
        prompt: 'A teammate jokes: “QA just clicks around to find bugs, right?” What’s the most accurate way to think about your role?',
        options: [
          {
            text: 'Pretty much — my job is to click everything and report what breaks.',
            confidence: 4,
            feedback: 'Finding breakage matters, but that framing is too small. Clicking around is a tool, not the mission.',
          },
          {
            text: "I'm the user's advocate — I make sure the product does what people need, and I find where it won't.",
            best: true,
            confidence: 12,
            feedback: 'Exactly. Quality is about protecting the people who rely on the product. Bugs are just one way that protection shows up.',
          },
          {
            text: 'I approve releases and block bad code from shipping.',
            confidence: 3,
            feedback: 'Careful — QA as a gatekeeper creates an us-vs-them dynamic. You inform decisions and surface risk; the team ships together.',
          },
        ],
      },
      {
        kind: 'mentor',
        mentor: 'hint',
        text: "Good instinct. One more — your manager asks what you'll focus on this first week. They're not testing you; they genuinely want to know where you'll start.",
      },
      {
        kind: 'choice',
        prompt: 'As a brand-new QA, what’s the smartest first move this week?',
        options: [
          {
            text: 'File as many bugs as possible to prove my value fast.',
            confidence: 3,
            feedback: 'Tempting, but noisy. A pile of shallow bugs from someone who doesn’t yet understand the product erodes trust more than it builds it.',
          },
          {
            text: 'Learn the product and how real users actually use it before judging anything.',
            best: true,
            confidence: 12,
            feedback: 'Yes. You can’t spot what’s wrong until you understand what’s intended. Context first, critique second.',
          },
          {
            text: 'Rewrite the team’s existing test cases to my standard.',
            confidence: 2,
            feedback: 'Way too soon. You’d be changing things you don’t understand yet — and stepping on the team before you’ve earned context.',
          },
        ],
      },
    ],
    recap: [
      'Quality is advocacy for the user, not gatekeeping.',
      'Understand what “good” means before hunting for what’s wrong.',
      'Start your first week by learning the product, not proving yourself.',
    ],
  },

  {
    n: 2,
    week: 1,
    weekTitle: 'Observe',
    title: 'Map the product',
    goal: 'Learn the main user journeys before testing anything.',
    skill: { id: 'product-mapping', label: 'Product Mapping' },
    intro: "Day two. Before you can test Northwind, you need a map of it in your head. Today you'll explore — not to find bugs, but to understand how the whole thing fits together.",
    scenes: [
      {
        kind: 'mentor',
        mentor: 'welcome',
        text: "Open the app like a brand-new user would. The goal is to know the product's shape: what it's for, and the paths people take through it.",
      },
      {
        kind: 'choice',
        prompt: 'You open Northwind for the first time. What gets you to a useful mental model fastest?',
        options: [
          {
            text: 'Read through the entire codebase first.',
            confidence: 3,
            feedback: 'Code can come later. It’s slow, and it tells you how it’s built — not how it’s used or what it’s for.',
          },
          {
            text: 'Walk the core journeys end-to-end: sign up → create a task → complete it.',
            best: true,
            confidence: 12,
            feedback: 'Perfect. Following real user journeys reveals the product’s purpose and its critical paths in minutes.',
          },
          {
            text: 'Open every settings toggle and flip them one by one.',
            confidence: 5,
            feedback: 'You’ll learn some edges, but settings are the periphery. Start with the journeys that define what the product is.',
          },
        ],
      },
      {
        kind: 'mentor',
        mentor: 'hint',
        text: "Now that you've walked through it, let's sharpen the idea of a *critical path* — the flow that matters most to protect.",
      },
      {
        kind: 'choice',
        prompt: 'Spot the critical path: which flow, if broken, would hurt Northwind’s users the most?',
        subtitle: 'It’s a task-management app for teams.',
        options: [
          {
            text: 'Changing the account avatar color.',
            confidence: 3,
            feedback: 'Nice-to-have. If this broke, almost no one’s work would be blocked.',
          },
          {
            text: 'Creating, assigning, and completing a task.',
            best: true,
            confidence: 12,
            feedback: 'That’s the heart of the product. If this breaks, the app fails at its core job — this is where your attention belongs first.',
          },
          {
            text: 'Viewing the “About this app” page.',
            confidence: 2,
            feedback: 'Lowest stakes on the list. Informational, and no real user task depends on it.',
          },
        ],
      },
    ],
    recap: [
      'Map a product by walking its real user journeys, not its code.',
      'The critical path is the flow that hurts users most if it breaks.',
      'Focus your attention where the product does its core job.',
    ],
  },

  {
    n: 3,
    week: 1,
    weekTitle: 'Observe',
    title: 'Notice what feels off',
    goal: 'Train the instinct for issues, not just outright breakage.',
    skill: { id: 'critical-observation', label: 'Critical Observation' },
    intro: "Day three. You know the map — now we sharpen your eyes. The best testers notice what feels *off*, long before something is obviously broken.",
    scenes: [
      {
        kind: 'mentor',
        mentor: 'welcome',
        text: "Not every problem throws an error. Some of the worst ones look like they 'work'. Let's practice spotting those.",
      },
      {
        kind: 'choice',
        prompt: 'You save a task. The data saves correctly — but the app gives no message, no checkmark, nothing. Is this a bug?',
        options: [
          {
            text: 'No. It saved, so technically it works.',
            confidence: 4,
            feedback: 'Technically the data is fine — but “technically works” isn’t the bar. The user can’t tell it worked.',
          },
          {
            text: 'Yes — silent success confuses users and erodes trust, even when the data is correct.',
            best: true,
            confidence: 12,
            feedback: 'Exactly. Missing feedback is a real usability bug. People re-click, double-save, or assume it failed. Trust is part of quality.',
          },
          {
            text: 'Only if a user actually complains about it.',
            confidence: 3,
            feedback: 'Waiting for complaints means shipping the problem. Your job is to catch it before users have to.',
          },
        ],
      },
      {
        kind: 'mentor',
        mentor: 'hint',
        text: "That's the instinct — judge the experience, not just the outcome. One more, about what's *missing* rather than what's wrong.",
      },
      {
        kind: 'choice',
        prompt: 'A new “Delete task” feature works perfectly. What would a careful tester most likely flag?',
        subtitle: 'Think about what the team might have forgotten.',
        options: [
          {
            text: 'There’s no confirmation step before a task is permanently deleted.',
            best: true,
            confidence: 12,
            feedback: 'Spot on. “It works” isn’t enough when the action is destructive. One stray tap shouldn’t cost someone their work.',
          },
          {
            text: 'The delete button could be a louder shade of red.',
            confidence: 5,
            feedback: 'Polish, not protection. Colour helps, but it won’t save a user who taps it by accident.',
          },
          {
            text: 'It’s missing a delete animation.',
            confidence: 2,
            feedback: 'Cosmetic. A missing safeguard is far more important than a missing flourish.',
          },
        ],
      },
    ],
    recap: [
      'A feature can “work” and still be a real bug — judge the experience.',
      'Silent success (no feedback) breaks user trust.',
      'For destructive actions, ask what safeguard the team forgot.',
    ],
  },
];

export const getDay = (n: number) => DAYS.find((d) => d.n === n);
