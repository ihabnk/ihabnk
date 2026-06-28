import type { Day } from '../game/types';

/**
 * "The First 30 Days" — a narrative QA onboarding simulator.
 *
 * Each day follows a 5-beat flow: mentor brief → interactive task →
 * decision → feedback → recap. Days 1–3 are fully written; the shape
 * extends to 30/60/90 by appending entries — no engine changes needed.
 *
 * Confidence (XP): choices ~12 best / ~6 partial / ~3 weak; tasks award a
 * flat amount (select scales by correctness). Always positive — the feedback
 * teaches regardless, keeping beginners motivated.
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
        mentor: 'speaking',
        text: "First, let's get clear on what the job actually is — because it's bigger than 'find bugs'. Here's a quick warm-up.",
      },
      {
        kind: 'task',
        variant: 'select',
        prompt: 'Tap everything that’s genuinely part of your role as a quality engineer.',
        subtitle: 'Select all that apply, then confirm.',
        xp: 10,
        done: 'That’s the shape of the role: advocate, investigate, understand — not gatekeep or rubber-stamp.',
        items: [
          { label: 'Advocate for the people who use the product', correct: true },
          { label: 'Investigate where the product fails real users', correct: true },
          { label: 'Understand how the product is actually used', correct: true },
          { label: 'Personally approve every line of code' },
          { label: 'Act as the gate that blocks the team from shipping' },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Your manager asks what you’ll focus on this first week. What’s the smartest move?',
        hint: 'You can’t judge what’s wrong with something you don’t understand yet.',
        options: [
          {
            text: 'File as many bugs as possible to prove my value fast.',
            confidence: 3,
            feedback: 'Tempting, but noisy. Shallow bugs from someone still learning the product erode trust more than they build it.',
          },
          {
            text: 'Learn the product and how real users use it before judging anything.',
            best: true,
            confidence: 12,
            feedback: 'Yes. You can’t spot what’s wrong until you understand what’s intended. Context first, critique second.',
          },
          {
            text: 'Rewrite the team’s existing test cases to my own standard.',
            confidence: 2,
            feedback: 'Far too soon — you’d be changing things you don’t understand yet, and stepping on the team before earning context.',
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
        mentor: 'speaking',
        text: "Don't read the code yet. Walk the product like a new user would. Open each area below and see what it's for — exploration is a real testing skill.",
      },
      {
        kind: 'task',
        variant: 'explore',
        prompt: 'Explore Northwind. Open each area to learn what it does.',
        subtitle: 'Tap every card to continue.',
        xp: 8,
        done: 'Now the product’s shape is in your head — and you can already feel which parts matter most.',
        items: [
          { label: 'Dashboard', note: 'Where a user lands — an overview of their tasks and what’s due.' },
          { label: 'Create task', note: 'The starting point of real work: a user adds something they need to track.' },
          { label: 'Assign', note: 'Hand a task to a teammate — this is where collaboration happens.' },
          { label: 'Complete', note: 'Mark work as done. The payoff moment the whole app exists for.' },
          { label: 'Settings', note: 'Profile and preferences — useful, but on the edge of the product, not its core.' },
        ],
      },
      {
        kind: 'task',
        variant: 'order',
        prompt: 'Put Northwind’s core task journey in the right order.',
        subtitle: 'Tap the steps in sequence. This is the critical path you’ll protect most.',
        xp: 12,
        hint: 'Something has to exist before it can be handed off — and “done” always comes last.',
        done: 'That sequence is the product’s critical path. If any step breaks, the app fails at its core job.',
        items: [
          { label: 'Create a task' },
          { label: 'Assign it to a teammate' },
          { label: 'Complete the task' },
        ],
      },
    ],
    recap: [
      'Map a product by walking its real user journeys, not its code.',
      'Exploration is a genuine testing skill — it builds the mental model.',
      'The critical path is the flow that hurts users most if it breaks.',
    ],
  },

  {
    n: 3,
    week: 1,
    weekTitle: 'Observe',
    title: 'Notice what feels off',
    goal: 'Train the instinct for issues, not just outright breakage.',
    skill: { id: 'critical-observation', label: 'Critical Observation' },
    intro: "Day three. You know the map — now we sharpen your eyes. The best testers notice what feels off, long before something is obviously broken.",
    scenes: [
      {
        kind: 'mentor',
        mentor: 'speaking',
        text: "Not every problem throws an error. Some of the worst ones look like they 'work'. Let's practice catching those.",
      },
      {
        kind: 'choice',
        prompt: 'You save a task. The data saves correctly — but the app shows no message, no checkmark, nothing. Is this a bug?',
        hint: 'Ask yourself: can the user tell what happened? Quality is about the experience, not just the data.',
        options: [
          { text: 'No — it saved, so technically it works.', confidence: 4, feedback: '“Technically works” isn’t the bar. The user can’t tell it worked, so they’ll doubt it.' },
          { text: 'Yes — silent success confuses users and erodes trust, even when the data is fine.', best: true, confidence: 12, feedback: 'Exactly. Missing feedback is a real usability bug: people re-click, double-save, or assume failure. Trust is part of quality.' },
          { text: 'Only if a user actually complains about it.', confidence: 3, feedback: 'Waiting for complaints means shipping the problem. Catch it before users have to.' },
        ],
      },
      {
        kind: 'task',
        variant: 'select',
        prompt: 'A new “Delete task” feature works perfectly. Tap everything a careful tester would insist on before shipping it.',
        subtitle: 'Select all that truly matter.',
        xp: 10,
        done: 'Destructive actions need safeguards, not just polish — you flagged the things that actually protect users.',
        items: [
          { label: 'A confirmation step before a task is permanently deleted', correct: true },
          { label: 'An undo / “recently deleted” safety net', correct: true },
          { label: 'A louder shade of red on the button' },
          { label: 'A fancy delete animation' },
        ],
      },
    ],
    recap: [
      'A feature can “work” and still be a real bug — judge the experience.',
      'Silent success (no feedback) quietly breaks user trust.',
      'For destructive actions, safeguards matter more than polish.',
    ],
  },
];

export const getDay = (n: number) => DAYS.find((d) => d.n === n);
