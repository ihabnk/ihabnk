/**
 * Interactive lessons — Brilliant-style, step-by-step learning.
 *
 * A lesson is a sequence of short steps. Each step is either a `concept`
 * (one idea, tap to continue) or an `mcq` (a question with instant feedback).
 * The Lesson.astro player renders one step at a time with a progress bar.
 *
 * Authoring rule of thumb: one idea per concept screen, keep bodies short,
 * and make every few screens an interactive check. Never a wall of text.
 */

export type LessonStep =
  | {
      kind: 'concept';
      title?: string;
      body: string;
      /** Optional aside shown in a tinted callout below the body. */
      note?: string;
    }
  | {
      kind: 'mcq';
      prompt: string;
      /** Exactly one option should be marked correct. */
      options: { text: string; correct?: boolean; feedback: string }[];
    };

export interface Lesson {
  slug: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  pathway?: string;
  /** Position within its level / pathway. */
  order: number;
  est: string;
  /** One-line dek shown on the lesson's intro screen. */
  intro: string;
  steps: LessonStep[];
}

export const lessons: Lesson[] = [
  {
    slug: 'think-like-a-tester',
    title: 'Think like a tester',
    level: 'beginner',
    pathway: 'Getting into QA',
    order: 1,
    est: '5 min',
    intro:
      "The core skill of QA isn't a tool — it's a way of looking at software and asking 'what did they forget?' Let's build that instinct.",
    steps: [
      {
        kind: 'concept',
        title: 'Testing is prediction',
        body: "A good tester doesn't just follow steps someone wrote down. They look at a feature and predict how it will break — before anyone clicks anything.",
        note: "That instinct is learnable. This lesson trains it with a few real examples.",
      },
      {
        kind: 'concept',
        title: 'A simple login form',
        body: "Picture a login screen: an email field, a password field, and a 'Log in' button. The developer built it for the obvious case — a real email and the right password.",
        note: "Your job is to think about everything *other* than the obvious case.",
      },
      {
        kind: 'mcq',
        prompt:
          'You can only try one input first. Which is most likely to reveal a bug the developer forgot about?',
        options: [
          {
            text: 'A normal, valid email and password',
            correct: false,
            feedback:
              "This is the 'happy path' — the one case the developer definitely tested. Bugs rarely hide here.",
          },
          {
            text: 'An email with no @ sign, like "ihab.example.com"',
            correct: true,
            feedback:
              'Exactly. Malformed input is where validation is forgotten. Testers probe the edges of what counts as "valid" first.',
          },
          {
            text: 'Leaving both fields exactly as the designer intended',
            correct: false,
            feedback:
              "That's just the happy path again. You want to push on what the developer *didn't* plan for.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'These are "edge cases"',
        body: "An edge case is an input or situation at the boundary of what the software expects: empty fields, huge values, weird characters, doing two things at once. Most real bugs live here.",
        note: "Train yourself to ask: what's the strangest thing a real person could do here?",
      },
      {
        kind: 'mcq',
        prompt:
          "A shopping cart lets you set the quantity of an item. The developer was thinking '1, 2, 3...'. What's the sharpest edge case to try?",
        options: [
          {
            text: 'Set the quantity to 2',
            correct: false,
            feedback: 'Totally normal — this is the case the developer already had in mind.',
          },
          {
            text: 'Set the quantity to -1',
            correct: true,
            feedback:
              "Yes. Negative quantity is a classic: does the price go negative? Does the cart pay *you*? Boundaries like 0 and -1 break things constantly.",
          },
          {
            text: 'Set the quantity to 3',
            correct: false,
            feedback: 'Still inside the expected range. Push past the boundary, not within it.',
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Finding the bug is half the job',
        body: "The other half is reporting it so it actually gets fixed. A vague report gets ignored. A clear one gets a developer nodding and reaching for the code.",
        note: "A good report has: what you did, what you expected, and what actually happened.",
      },
      {
        kind: 'mcq',
        prompt: 'Which of these bug reports is a developer most likely to fix quickly?',
        options: [
          {
            text: '"Login is broken, please fix."',
            correct: false,
            feedback:
              "No steps, no expected vs actual, no environment. The developer can't even reproduce it — so it sits.",
          },
          {
            text: '"The site is bad on my phone."',
            correct: false,
            feedback: 'Which page? Which phone? What happened? This is a feeling, not a report.',
          },
          {
            text: '"On login, entering an email with no @ shows a blank page instead of an error. Expected: a validation message. Chrome 130, desktop."',
            correct: true,
            feedback:
              'That\'s the one. Steps to reproduce, expected vs actual, and environment. The developer can act on this immediately.',
          },
        ],
      },
      {
        kind: 'concept',
        title: "That's the mindset",
        body: "You just did the real work of QA: predict where software breaks, push on the edges, and report what you find clearly. Tools come later — this thinking is the foundation everything else is built on.",
        note: "Next up in the pathway: what a QA engineer actually does all day.",
      },
    ],
  },

  {
    slug: 'what-a-qa-engineer-does',
    title: 'What a QA engineer does',
    level: 'beginner',
    pathway: 'Getting into QA',
    order: 2,
    est: '5 min',
    intro:
      "The job title says 'tester,' but testing is only part of it. Let's walk through what the work actually looks like — and why the best testers get involved early.",
    steps: [
      {
        kind: 'concept',
        title: 'The week is not just "run tests"',
        body: "A real QA week is a mix: refining features with the team, designing what to test, exploring the product, maintaining automation, and arguing for the bugs that matter. Communication and judgment are most of it.",
      },
      {
        kind: 'concept',
        title: 'The cheapest bug to fix',
        body: "Bugs get more expensive the later you catch them. A flaw caught while a feature is still an idea costs a conversation. The same flaw caught after release can cost a week — and some customers.",
        note: "This is why good testers want to be in the room early, not just at the end.",
      },
      {
        kind: 'mcq',
        prompt: 'When is a bug cheapest to fix?',
        options: [
          { text: 'When a customer reports it in production', correct: false, feedback: "This is the most expensive moment — code shipped, users affected, and now it's a fire drill." },
          { text: 'During planning, before any code is written', correct: true, feedback: "Exactly. Catching it as a question in refinement costs minutes, not days. That's the highest-leverage testing there is." },
          { text: 'During the final release check', correct: false, feedback: "Better than production, but the code is already built — changing it now is costly and rushed." },
        ],
      },
      {
        kind: 'concept',
        title: 'You translate risk',
        body: "Managers don't want a list of 40 bugs. They want to know which ones will actually hurt — and what you recommend. Turning 'here are all the problems' into 'here are the two that matter' is a core part of the job.",
      },
      {
        kind: 'mcq',
        prompt: "It's release day and you've found 12 bugs. What's the most useful thing to tell your manager?",
        options: [
          { text: 'The full list of all 12 bugs, unsorted', correct: false, feedback: "That pushes the hard decision onto them. Your value is in the judgment, not the raw list." },
          { text: "\"Two of these are serious — checkout fails on mobile. The rest are minor. I'd hold the release for the two.\"", correct: true, feedback: "That's the job: impact, a clear recommendation, and the reasoning. Now they can decide fast." },
          { text: "\"It's probably fine, ship it.\"", correct: false, feedback: "You found serious issues — waving them through is the opposite of advocating for quality." },
        ],
      },
      {
        kind: 'concept',
        title: 'How the role grows',
        body: "Junior: you execute tests and file great bugs. Intermediate: you design strategy and automate what deserves it. Advanced: you shape how the whole org thinks about quality — including how AI-generated code gets evaluated.",
        note: "The further you go, the more it's about preventing whole categories of bugs, not just finding them.",
      },
    ],
  },

  {
    slug: 'understand-the-business',
    title: 'Understand the business first',
    level: 'beginner',
    pathway: 'Getting into QA',
    order: 3,
    est: '4 min',
    intro:
      "You can't judge how serious a bug is without knowing what matters to the business. This is the skill that turns a tester into a trusted one.",
    steps: [
      {
        kind: 'concept',
        title: 'Not all bugs are equal',
        body: "A typo in the footer and a broken checkout are both 'bugs' — but one costs nothing and the other costs sales. Severity isn't about how the bug looks; it's about what it does to the business and its users.",
      },
      {
        kind: 'mcq',
        prompt: "You find two bugs on an online store. Which deserves attention first?",
        options: [
          { text: "The copyright year in the footer says 2023", correct: false, feedback: "Worth fixing eventually, but it costs nothing and no user is blocked. Low priority." },
          { text: "The 'Pay now' button fails silently on mobile", correct: true, feedback: "Yes — this directly stops people from giving the business money, on the device most shoppers use. This is a drop-everything bug." },
          { text: "A product image loads half a second slowly", correct: false, feedback: "Minor polish. Annoying at most, and nobody is blocked from buying." },
        ],
      },
      {
        kind: 'concept',
        title: 'Three questions for severity',
        body: "To rank any bug, ask: How many users hit it? How badly are they blocked? And does it touch money, trust, or safety? A 'yes' to that last one almost always makes it urgent.",
        note: "A rare cosmetic glitch and a common checkout failure are worlds apart — even if both are 'bugs.'",
      },
      {
        kind: 'mcq',
        prompt: "A bug only happens for users paying in a specific foreign currency — about 8% of revenue. How should you treat it?",
        options: [
          { text: "Ignore it — it's an edge case", correct: false, feedback: "'Edge case' is about likelihood, not impact. 8% of revenue is a lot of money to leave on the table." },
          { text: 'Flag it as high impact — it directly blocks real paying customers', correct: true, feedback: "Right. It touches money and blocks a meaningful slice of paying users. Rarity doesn't make it minor." },
          { text: 'Fix it only if you have spare time', correct: false, feedback: "Revenue-blocking bugs don't wait for spare time — that framing is how real losses slip through." },
        ],
      },
      {
        kind: 'concept',
        title: 'Ask what a feature is for',
        body: "Before testing anything, ask: what does this feature earn or protect? Once you know that, you know where the dangerous bugs are — and you can argue for them in language the business actually cares about.",
      },
    ],
  },

  {
    slug: 'manual-testing-that-matters',
    title: 'Manual testing still matters',
    level: 'beginner',
    pathway: 'Getting into QA',
    order: 4,
    est: '5 min',
    intro:
      "Automation didn't kill manual testing. The two do different jobs — and the human, exploratory kind finds bugs no script ever will.",
    steps: [
      {
        kind: 'concept',
        title: 'Two different jobs',
        body: "Automated tests check that known things still work — fast, on every change. Manual exploratory testing discovers unknown things: the confusing flow, the weird visual glitch, the 'wait, that's not right' moment a script can't feel.",
      },
      {
        kind: 'mcq',
        prompt: "Which of these is an automated test least likely to catch?",
        options: [
          { text: 'A button that returns the wrong data', correct: false, feedback: "Automation is great at this — assert the expected value and it'll catch the change instantly." },
          { text: 'A checkout flow that technically works but is deeply confusing to use', correct: true, feedback: "Exactly. A script sees 'the steps passed.' Only a human notices that a real person would get lost. That's exploratory territory." },
          { text: 'An API that returns a 500 error', correct: false, feedback: "Easy for automation — a status-code assertion catches this every time." },
        ],
      },
      {
        kind: 'concept',
        title: 'Exploratory testing',
        body: "Exploratory testing is structured curiosity: you use the product with a goal, follow your instincts when something feels off, and let each discovery shape what you try next. It's a skill, not random clicking.",
        note: "The best bugs — the embarrassing, customer-facing ones — usually come from exploration, not scripts.",
      },
      {
        kind: 'mcq',
        prompt: "What's the best mindset for an exploratory session on a new feature?",
        options: [
          { text: 'Click around randomly and hope something breaks', correct: false, feedback: "Randomness without intent misses the interesting paths. Exploration is curious, but it's still aimed." },
          { text: 'Pick a goal (e.g. "can a new user finish signup?") and probe the edges as you go', correct: true, feedback: "That's it — a mission plus instinct. You cover the real journey and notice the weird stuff along the way." },
          { text: 'Only run the steps written in the test case', correct: false, feedback: "That's scripted testing, not exploratory. You'd only find what someone already thought to write down." },
        ],
      },
      {
        kind: 'concept',
        title: 'When to automate vs explore',
        body: "Rule of thumb: automate the boring, repetitive checks you'll run forever (regression). Explore the new, the risky, and the human (UX, first-time flows). Strong testers do both and know which to reach for.",
      },
    ],
  },

  {
    slug: 'bug-reports-that-get-fixed',
    title: 'Bug reports that get fixed',
    level: 'beginner',
    pathway: 'Getting into QA',
    order: 5,
    est: '5 min',
    intro:
      "Finding a bug is half the job. Reporting it so a developer can act immediately is the other half — and it's the skill that gets juniors kept.",
    steps: [
      {
        kind: 'concept',
        title: 'The anatomy of a good report',
        body: "Every report a developer loves has four things: steps to reproduce, what you expected, what actually happened, and the environment (browser, device, version). Miss any one and the bug stalls.",
      },
      {
        kind: 'mcq',
        prompt: "Which title will get a developer's attention fastest?",
        options: [
          { text: "\"It's broken\"", correct: false, feedback: "Broken where? Doing what? This title tells the developer nothing and gets skipped." },
          { text: "\"Checkout: 'Pay' button does nothing on iOS Safari\"", correct: true, feedback: "Specific area, specific action, specific environment. A developer reads this and already knows where to look." },
          { text: '"Please help urgent!!!"', correct: false, feedback: "Urgency without information just adds noise. The fix needs facts, not exclamation marks." },
        ],
      },
      {
        kind: 'concept',
        title: 'Severity vs priority',
        body: "Severity is how bad the bug is technically. Priority is how soon it should be fixed given the business. A tiny crash on a rarely used admin page can be high severity but low priority — they're not the same axis.",
        note: "Reporting both helps the team decide without re-investigating your bug themselves.",
      },
      {
        kind: 'mcq',
        prompt: "Which of these is a report a developer can act on immediately?",
        options: [
          { text: '"Login is broken, please fix."', correct: false, feedback: "No steps, no environment, no expected vs actual. The developer can't even reproduce it — so it sits." },
          { text: '"On login, an email with no @ shows a blank page instead of a validation error. Chrome 130, desktop."', correct: true, feedback: "Steps, expected vs actual, and environment. The developer can reproduce and fix it in one sitting." },
          { text: '"The form feels weird."', correct: false, feedback: "A feeling, not a report. Which form? What did it do? What did you expect? None of it is here." },
        ],
      },
      {
        kind: 'concept',
        title: 'Reproducibility is everything',
        body: "A bug a developer can reproduce is a bug that gets fixed. If it only happens sometimes, say so and include exactly what you were doing — intermittent bugs still deserve precise notes, not a shrug.",
        note: "You've now got the full beginner foundation: think like a tester, know the role, read the business, test by hand, and report clearly.",
      },
    ],
  },
];

export const getLesson = (slug: string) => lessons.find((l) => l.slug === slug);
