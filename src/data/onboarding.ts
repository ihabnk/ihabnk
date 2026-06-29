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
    title: 'Who is everyone?',
    goal: 'Find your place in the squad — who does what, and where you fit.',
    skill: { id: 'reading-the-squad', label: 'Reading the squad' },
    intro: "Day 1 at Northwind. You can write a test case in your sleep — but you can't yet tell a PM from a PO, or work out where you even fit. Today isn't about bugs. It's about people, and finding your place among them.",
    scenes: [
      {
        kind: 'narration',
        text: "First morning. Badge on, coffee cooling, pulse a little quick. I know how to test — but everyone here moves to a rhythm I haven't learned. Who decides what we build? Who do I actually talk to? Right now it's all a blur. Someone's heading my way.",
      },
      {
        kind: 'dialogue',
        speaker: 'maya',
        line: "Welcome! I'm Maya, the PM. My job is the what and the why — I shape what we build and make the case for it. You and I will talk a lot: I care whether what we ship actually works for people. That's your world too.",
        replies: [
          { text: "So you decide what we build — and I help make sure it's right?", best: true, reply: "Exactly. I bring the idea; you keep it honest.", note: 'Maya looks pleased.' },
          { text: "Got it — so you're basically my boss?", reply: "Ha — not quite. We're peers with different jobs. You answer to quality, not to me.", note: 'A gentle correction.' },
          { text: "Cool. I'll wait for you to tell me what to test.", reply: "Other way round — you'll often spot what I missed. Don't wait for permission to think.", note: 'Noted.' },
        ],
        learn: "A PM (Product Manager) shapes what gets built and why. With a tester they're partners — you keep the 'what' honest.",
      },
      {
        kind: 'dialogue',
        speaker: 'priya',
        line: "Hi, I'm Priya — Product Owner. People mix us up with PMs constantly. Maya shapes the vision; I own the backlog — what's prioritised, what 'done' means, which story's next. When something's unclear, I'm who you nudge.",
        replies: [
          { text: "So priorities and acceptance criteria are your call?", best: true, reply: "Right. If a requirement's vague, come to me before it turns into a bug.", note: 'Priya nods.' },
          { text: "PM, PO… is there honestly a difference?", reply: "A big one. Maya = why & what. Me = order & 'done'. Knowing who to ask saves everyone time.", note: 'Said with a patient smile.' },
          { text: "I'll just test whatever's in the sprint.", reply: "You can — but flag gaps to me early. Far cheaper to fix a story than a shipped bug.", note: '' },
        ],
        learn: "A PO (Product Owner) owns the backlog: priorities and acceptance criteria. An unclear requirement is a PO conversation — early.",
      },
      {
        kind: 'dialogue',
        speaker: 'idris',
        line: "I'm Idris — I lead the devs. One thing up front: when you find a bug, come to me like a teammate, not a prosecutor. Clear steps, what you expected, what happened. We're on the same side — shipping something we're proud of.",
        replies: [
          { text: "Deal — I'll make my reports so clear you can reproduce them instantly.", best: true, reply: "That's the dream. A good report saves us both an afternoon.", note: 'Idris grins.' },
          { text: "What if it's obviously the dev's fault?", reply: "It's rarely 'fault' — usually a gap. Blame slows fixes; clarity speeds them.", note: 'Fair point, taken.' },
          { text: "I'll just log everything I find.", reply: "Log what matters, and tell me what's serious. Signal over noise.", note: '' },
        ],
        learn: "Developers build and fix. The tester↔dev relationship runs on clear, blameless bug reports — same side, same goal.",
      },
      {
        kind: 'choice',
        prompt: "Mid-morning, a sprint story reads simply: 'make search faster.' It's vague. Who do you raise it with first?",
        hint: "Who owns what 'done' means and what's prioritised?",
        options: [
          { text: "Priya — the PO who owns the backlog and acceptance criteria.", best: true, confidence: 12, feedback: "Yes. Vague requirements are a PO conversation, early — before they harden into bugs." },
          { text: "Idris — the devs can probably guess what 'faster' should mean.", confidence: 3, feedback: "Risky. Devs shouldn't have to guess intent — that's how the wrong thing gets built quickly." },
          { text: "No one — I'll test whatever they build and raise bugs later.", confidence: 3, feedback: "The expensive path. A question now is far cheaper than a defect after release." },
        ],
      },
      {
        kind: 'squad',
        text: "Standup wraps, and something clicks. I'm not under the devs, or after the PM in some line. I'm woven through all of it — close to product, close to the backlog, close to the people who build, standing in for the people who'll use it. For the first time, I can see the whole shape.",
        caption: "This is your squad. You sit in the middle of it — on purpose.",
      },
    ],
    recap: [
      'A PM owns what & why; a PO owns priorities & what “done” means — not the same person.',
      'Developers and testers are on the same side; clear, blameless reports make fixes fast.',
      'Raise vague requirements early, with the PO — before they become bugs.',
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
