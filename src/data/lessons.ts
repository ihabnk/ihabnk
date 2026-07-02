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
  /** Closing line for the completion screen. Falls back to a generic one. */
  outro?: string;
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

  /* ------------------------------------------------------------------ */
  /* Intermediate — "Growing in QA"                                      */
  /* ------------------------------------------------------------------ */

  {
    slug: 'test-the-api-not-just-the-ui',
    title: 'Test the API, not just the UI',
    level: 'intermediate',
    pathway: 'Growing in QA',
    order: 1,
    est: '6 min',
    intro:
      "Most of what an app does happens below the buttons. Learning to test at the API layer makes you faster, sharper, and much harder to fool.",
    outro:
      "You can now test below the surface: talk to the API directly, read status codes like a native, and know when a green 200 is lying to you.",
    steps: [
      {
        kind: 'concept',
        title: 'The UI is just the front door',
        body: "When you tap 'Pay now', the app sends a request to a server — the API — which does the real work and sends back a response. The button is decoration; the API is the machine. Test only through the UI and you're testing the machine through a keyhole.",
        note: "API testing means sending those requests yourself and inspecting exactly what comes back.",
      },
      {
        kind: 'concept',
        title: 'Requests and responses',
        body: "Every API call is a small contract: you send a request (an action plus data, like 'create an order for 2 items'), and the server returns a response — a status code saying how it went, and a body with the result. Tools like Postman or plain curl let you do this without any UI at all.",
      },
      {
        kind: 'mcq',
        prompt:
          "The checkout total is wrong: the UI shows $40 for items worth $50. Where do you look first to isolate the bug?",
        options: [
          {
            text: 'Click through the UI again on three different browsers',
            correct: false,
            feedback:
              "If the API is returning the wrong total, every browser will faithfully display the same wrong number. You'd be testing the messenger, not the message.",
          },
          {
            text: 'Call the API directly and check the total in the raw response',
            correct: true,
            feedback:
              "Exactly. If the response says $40, the bug is server-side math. If it says $50, the UI is displaying it wrong. One request just cut the search space in half.",
          },
          {
            text: 'File the bug as-is and let a developer figure out the layer',
            correct: false,
            feedback:
              "You'd be handing over half an investigation. Pinning down the layer yourself is exactly the kind of report that gets fixed same-day.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Status codes in one minute',
        body: "The status code is the server's one-line verdict. 2xx: it worked. 4xx: your request was the problem (400 malformed, 401 not logged in, 403 not allowed, 404 not found). 5xx: the server itself broke. That first digit tells you who owns the bug.",
        note: "A 4xx for a valid request and a 5xx for any request are both bugs — but they point at different code.",
      },
      {
        kind: 'mcq',
        prompt:
          "You request an order that doesn't exist, and the API returns 500 Internal Server Error. What's your read?",
        options: [
          {
            text: "Correct behavior — the order isn't there, so it's an error",
            correct: false,
            feedback:
              "An error, yes — but the wrong kind. A missing resource is the client's problem to hear about (404), not a server crash.",
          },
          {
            text: 'A bug: a missing order should be a clean 404, not a server crash',
            correct: true,
            feedback:
              "Right. A 500 means unhandled failure — the server likely tried to use an order that wasn't there and fell over. That's a real bug even though 'an error' was expected.",
          },
          {
            text: 'Not worth reporting since no real user requests missing orders',
            correct: false,
            feedback:
              "Stale links, deleted orders, and probing attackers all hit this path. Unhandled 500s are exactly where reliability and security problems hide.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'A 200 can still be wrong',
        body: "The status code says the request was handled — not that the answer is right. A 200 with the wrong total, a missing field, or somebody else's data is a worse bug than a crash, because nothing looks broken. Always check the body, not just the code.",
      },
      {
        kind: 'mcq',
        prompt:
          "An API test asserts only 'status == 200' and it's green. The response body is another user's profile. What's the verdict on the test?",
        options: [
          {
            text: "It passed, so the feature works",
            correct: false,
            feedback:
              "The test is green and the product is leaking private data. A test that can't fail on the worst bug in the feature isn't protecting anything.",
          },
          {
            text: "The test is too shallow — it must also assert whose data came back",
            correct: true,
            feedback:
              "Exactly. Status-only checks are the API-testing happy path. Assert the things that would hurt if wrong: whose data, which fields, what values.",
          },
          {
            text: 'The API should have returned 500 to make the test fail',
            correct: false,
            feedback:
              "You can't rely on the server to announce its own logic bugs. The test's job is to catch what the status code can't say.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Why testers love this layer',
        body: "API tests skip rendering, clicking, and waiting — they run in milliseconds and rarely break when a button moves. Edge cases that are painful in a UI (weird characters, missing fields, wrong permissions) are one line in a request. Same instincts as before, sharper instrument.",
        note: "Next: now that you can test more layers, which checks deserve to be automated?",
      },
    ],
  },

  {
    slug: 'what-to-automate',
    title: 'What to automate (and what not to)',
    level: 'intermediate',
    pathway: 'Growing in QA',
    order: 2,
    est: '5 min',
    intro:
      "Automation is a bet: you spend time now to save time forever. Good testers know which checks pay that bet back — and which quietly lose it.",
    outro:
      "You now think about automation like an investment: automate the stable and repeated, keep exploring by hand, and shape the whole thing like a pyramid.",
    steps: [
      {
        kind: 'concept',
        title: 'Automation is an investment',
        body: "Every automated test costs time to write and time to maintain, and pays out a little every run. A check you'll repeat on every release for years is a great investment. A check you'll run twice is not — do it by hand and move on.",
        note: "The question is never 'can we automate this?' It's 'will this pay for itself?'",
      },
      {
        kind: 'mcq',
        prompt: 'Which of these is the best candidate for automation?',
        options: [
          {
            text: "'Users can log in' — checked before every single release",
            correct: true,
            feedback:
              "Exactly: stable, critical, and repeated forever. This check pays for itself within weeks and then keeps paying.",
          },
          {
            text: 'A one-time check that last year’s data migrated correctly',
            correct: false,
            feedback:
              "You'll run it once, maybe twice. Scripting it fully costs more than doing it carefully by hand.",
          },
          {
            text: "Whether the new onboarding flow 'feels confusing'",
            correct: false,
            feedback:
              "No script can feel confused. Judgment calls about UX stay human — that's exploratory territory.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'The test pyramid',
        body: "The classic shape for an automation suite: lots of fast unit tests at the bottom, a solid middle layer of API/integration tests, and a small set of end-to-end UI tests on top. Lower layers are faster, cheaper, and more precise about what broke.",
        note: "The pyramid isn't a law — it's a reminder that UI tests are the most expensive kind, so spend them carefully.",
      },
      {
        kind: 'mcq',
        prompt:
          "A team automated 400 UI tests and almost nothing else. The suite takes 3 hours and fails randomly. What's the actual problem?",
        options: [
          {
            text: 'They need a faster machine to run the UI tests on',
            correct: false,
            feedback:
              "Faster hardware shaves minutes off a strategy problem. The suite is slow and brittle because of *where* the tests live, not what they run on.",
          },
          {
            text: "The pyramid is upside down — most of those checks belong at the API or unit layer",
            correct: true,
            feedback:
              "Right. Most of those 400 flows are checking logic that an API test could verify in milliseconds. Keep a handful of true user journeys in the UI and push the rest down.",
          },
          {
            text: 'They should delete the failing tests to make the suite green',
            correct: false,
            feedback:
              "That makes the dashboard green and the product unprotected. The failures are a symptom of the architecture, not the individual tests.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'What stays human',
        body: "Automation checks what you already know to look for. Exploration finds what you didn't. New features, risky changes, UX judgment, and 'something feels off' all stay human — automation exists to free your hands for exactly that work.",
      },
      {
        kind: 'mcq',
        prompt:
          "Your regression suite is fully automated and green. You have a free afternoon before release. What's the highest-value use of it?",
        options: [
          {
            text: 'Re-run the automated suite a second time to be sure',
            correct: false,
            feedback:
              "Same tests, same code, same answer. A second green run adds confidence theatre, not information.",
          },
          {
            text: 'Explore the newest, riskiest feature by hand',
            correct: true,
            feedback:
              "Exactly. The suite covers the known; your afternoon is for the unknown. New and risky is where the undiscovered bugs are.",
          },
          {
            text: 'Start automating a screen that changes design every sprint',
            correct: false,
            feedback:
              "That test will be broken by next sprint's redesign — a maintenance bill, not an asset. Automate it once the screen settles down.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'The strategy in one line',
        body: "Automate the checks you'll repeat forever, at the lowest layer that can catch the bug — and spend the time you save exploring what no script can see.",
        note: "Next: automated tests are only useful if you can trust them. Time to deal with flaky tests.",
      },
    ],
  },

  {
    slug: 'flaky-tests',
    title: 'Flaky tests, and how to kill them',
    level: 'intermediate',
    pathway: 'Growing in QA',
    order: 3,
    est: '5 min',
    intro:
      "A test that fails sometimes is worse than no test at all — it teaches the whole team to ignore red. Here's how flakiness starts, and how to end it.",
    outro:
      "You now treat a flaky test as a bug in the suite: reproduce it, fix the root cause — usually timing or shared state — and never train the team to ignore red.",
    steps: [
      {
        kind: 'concept',
        title: 'What a flaky test costs',
        body: "A flaky test passes and fails on the same code, at random. The first cost is time — reruns, investigations. The real cost is trust: once 'it's probably just flaky' becomes a normal sentence, real failures start getting waved through with it.",
        note: "A suite the team doesn't believe is a suite that catches nothing.",
      },
      {
        kind: 'mcq',
        prompt:
          "A test fails on the build server, passes on rerun, and nobody can explain why. The team wants to ship. What's the right call?",
        options: [
          {
            text: "It passed on rerun — green is green, ship it",
            correct: false,
            feedback:
              "Maybe it's flaky timing. Maybe it's a real race condition in the product that appears one run in five. 'Passed on rerun' can't tell those apart — and one of them ships to users.",
          },
          {
            text: 'Investigate why it failed; if you must ship first, quarantine it as a tracked, known-flaky test',
            correct: true,
            feedback:
              "Right. A flaky failure is a question that needs an answer. Quarantine keeps the suite honest while someone finds the cause — silently rerunning until green just buries it.",
          },
          {
            text: 'Delete the test — it clearly causes more trouble than help',
            correct: false,
            feedback:
              "Now the flake is gone and so is the coverage. And if the randomness was in the product, you just deleted the only witness.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Cause #1: timing',
        body: "Most flakiness is a test racing the app. The test clicks 'Save' and immediately checks for the confirmation — but the server took 300ms longer than usual, so the check ran too early. Same code, different day, different speed, different result.",
      },
      {
        kind: 'mcq',
        prompt:
          "A test fails intermittently after clicking 'Save'. A teammate suggests adding a 5-second pause. What's the better fix?",
        options: [
          {
            text: 'Take the pause — 5 seconds is plenty',
            correct: false,
            feedback:
              "Until the day the server takes 6 seconds — and meanwhile every run wastes 5. Fixed pauses make tests slower *and* still flaky, just less often.",
          },
          {
            text: "Wait for the condition itself: proceed the moment 'Saved' actually appears",
            correct: true,
            feedback:
              "Exactly. Waiting for the real signal is fast when the app is fast and patient when it's slow. This one habit kills most flakiness in UI suites.",
          },
          {
            text: 'Configure the test to auto-retry three times before reporting failure',
            correct: false,
            feedback:
              "Retries hide the symptom and add minutes to every genuine failure. The race is still there — you've just paid to stop hearing about it.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Cause #2: shared state',
        body: "Tests that share data poison each other. Test A renames the account; test B assumes the old name — B now fails only when A runs first. Symptoms: tests that pass alone but fail together, or fail only in parallel runs.",
        note: "The cure is isolation: each test creates what it needs and cleans up after itself, owing nothing to the tests around it.",
      },
      {
        kind: 'mcq',
        prompt:
          'A test always passes when run alone but fails about half the time in the full suite. What does that pattern point to?',
        options: [
          {
            text: 'The test framework has a random bug',
            correct: false,
            feedback:
              "Frameworks get blamed for this daily and are almost never guilty. The pattern is too specific: alone-pass, together-fail is an interference signature.",
          },
          {
            text: "Another test is changing data or state this test depends on",
            correct: true,
            feedback:
              "Right — alone-pass, together-fail is the classic shared-state signature. Find which test runs before it in the failing orders and you'll find your culprit.",
          },
          {
            text: 'The test is simply too long and should be split in half',
            correct: false,
            feedback:
              "Length doesn't explain why running *alone* fixes it. The dependency on outside state does.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Treat flakes like bugs',
        body: "A flaky test is a bug in the test suite, and it earns a bug's treatment: reproduce it (run it 50 times, run it in parallel), find the root cause, fix it properly. Teams that do this have suites people trust — which is the entire point of having one.",
        note: "Next: where all these tests actually run — the CI pipeline.",
      },
    ],
  },

  {
    slug: 'testing-in-ci',
    title: 'Testing in the CI pipeline',
    level: 'intermediate',
    pathway: 'Growing in QA',
    order: 4,
    est: '5 min',
    intro:
      "Your tests are only as good as when they run. CI runs them on every change, minutes after it's made — here's how to make that feedback loop actually work.",
    outro:
      "You now see the pipeline as a feedback machine: every change tested in minutes, fast tests first, and a red main build treated as the team's top priority.",
    steps: [
      {
        kind: 'concept',
        title: 'What CI actually is',
        body: "Continuous Integration is a robot with one job: every time anyone pushes code, build the app and run the tests — automatically, within minutes. No 'testing phase' at the end. Every change gets checked while it's still small and fresh in someone's head.",
        note: "Remember the cheapest-bug lesson? CI is that idea built into the team's plumbing.",
      },
      {
        kind: 'mcq',
        prompt:
          "A developer pushes a change and CI turns red 4 minutes later. Why is this a *good* morning for the team?",
        options: [
          {
            text: "It isn't — red builds mean the process failed",
            correct: false,
            feedback:
              "The process just *worked*. The bug exists either way; red is the pipeline catching it. A process failure would be this bug surfacing in three weeks — in production.",
          },
          {
            text: 'The bug was caught within minutes, by the person who wrote it, while the change is one small diff',
            correct: true,
            feedback:
              "Exactly. Four minutes later, the developer knows which lines did it and fixes it before lunch. That same bug found in production would be an investigation.",
          },
          {
            text: 'Good, because now QA has something concrete to do',
            correct: false,
            feedback:
              "CI didn't catch it *for* QA — it caught it so no human has to spend time on already-known failures. Your time goes to what the pipeline can't see.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Fast feedback first',
        body: "Pipelines run in stages, cheapest first: lint and unit tests in the first minutes, API tests next, the slow end-to-end suite last. If a unit test fails, the pipeline stops immediately — no point running an hour of UI tests on code that can't add two numbers.",
        note: "This is the test pyramid again, laid on its side and turned into a schedule.",
      },
      {
        kind: 'mcq',
        prompt:
          'Your full end-to-end suite takes 50 minutes, so developers only get feedback once an hour. What actually fixes this?',
        options: [
          {
            text: 'Run the heavy suite only at night, so nobody waits on it',
            correct: false,
            feedback:
              "Now a bug pushed at 9am is discovered at 3am tomorrow, mixed with everyone else's changes. You traded slow feedback for anonymous, day-late feedback.",
          },
          {
            text: 'Stage it: fast unit and API tests on every push, the full end-to-end suite before merge or release',
            correct: true,
            feedback:
              "Right. Most bugs die in the first cheap minutes, and the expensive suite still guards the doors that matter. Speed and safety aren't actually in conflict here.",
          },
          {
            text: 'Cut the end-to-end suite down to the 5 fastest tests',
            correct: false,
            feedback:
              "Choosing tests by *speed* keeps the sprinters and cuts the goalkeepers. If you must trim, trim by risk — that's the next lesson.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Red means stop',
        body: "One rule separates teams where CI works from teams where it's wallpaper: a red main build is everyone's top priority. Fix it or revert the change — nothing new ships on top of red. Break the rule for a week and red becomes the normal color of the dashboard.",
        note: "This is the flaky-tests lesson at team scale: the pipeline only protects a team that believes it.",
      },
      {
        kind: 'mcq',
        prompt:
          "Main has been red for three days ('a known issue, ignore it') and new changes keep merging on top. What's the real damage?",
        options: [
          {
            text: 'Nothing serious yet — the issue is known and documented',
            correct: false,
            feedback:
              "The known issue isn't the damage. The damage is that for three days, the pipeline has been unable to tell anyone about a *second* problem.",
          },
          {
            text: "The team is now shipping blind: any new failure is invisible behind the red everyone's ignoring",
            correct: true,
            feedback:
              "Exactly. A red build can't turn red. Every change merged during those three days went out with no working alarm at all.",
          },
          {
            text: 'Mostly wasted compute from re-running a failing pipeline',
            correct: false,
            feedback:
              "The compute bill is trivia. The alarm system being offline for three days of merges is the cost that ends up in production.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Where you fit',
        body: "In a CI world the tester's job moves upstream: you decide what earns a place in the pipeline, keep it fast and trusted, and treat its gaps as your exploration map. The robot runs the checks; you decide what's worth checking.",
        note: "Last lesson in this pathway: with limited time, how do you decide what to test at all?",
      },
    ],
  },

  {
    slug: 'risk-based-testing',
    title: 'Test strategy: think in risk',
    level: 'intermediate',
    pathway: 'Growing in QA',
    order: 5,
    est: '5 min',
    intro:
      "You will never have time to test everything. Strategy is deciding what to test first, what to test lightly, and what to consciously skip — by risk.",
    outro:
      "That's the whole intermediate toolkit: API skills, an automation strategy, a trustworthy suite, a fast pipeline — and now the judgment to aim all of it at what matters most.",
    steps: [
      {
        kind: 'concept',
        title: 'The uncomfortable truth',
        body: "Complete testing is impossible — the input combinations of any real app outnumber the atoms you have time for. Everyone skips things; strong testers just *choose* what to skip instead of letting the clock choose for them.",
        note: "Risk = how likely something is to break × how much it hurts if it does.",
      },
      {
        kind: 'mcq',
        prompt: "Two hours before release. Where do your first 30 minutes go?",
        options: [
          {
            text: 'Start at the top of the test-case list and get as far as possible',
            correct: false,
            feedback:
              "That's letting a list written months ago make today's decision. The riskiest area might be case #212 — you'll never reach it.",
          },
          {
            text: "On what changed in this release, and on the flows that touch money",
            correct: true,
            feedback:
              "Exactly the two risk magnets: new code breaks most often, and payment flows hurt most when they do. Likelihood × impact, applied in one sentence.",
          },
          {
            text: 'Spread the time evenly so every feature gets a fair share',
            correct: false,
            feedback:
              "Fair to features, unfair to users. Equal time on the settings page and the checkout means under-testing the thing the business lives on.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Where bugs cluster',
        body: "Bugs aren't spread evenly. They cluster in what's new or just changed, in complex logic (pricing, permissions, sync), at integrations with other systems, and in whatever's been buggy before — defect history repeats. Your testing should be exactly as uneven as the risk.",
      },
      {
        kind: 'mcq',
        prompt:
          "This sprint: the checkout was rewritten, the FAQ got new text, and a date-picker got restyled. The rewritten checkout is also covered by automation. Test what first?",
        options: [
          {
            text: "The checkout — big change, big money, and automation only covers what it was told to expect",
            correct: true,
            feedback:
              "Right. A rewrite resets everything you knew about that code, and regression tests check yesterday's expectations against today's logic. New risk needs fresh human eyes.",
          },
          {
            text: 'The FAQ and date-picker first — clear them quickly, then focus',
            correct: false,
            feedback:
              "'Clear the easy ones first' feels productive, but if time runs out you'll have verified fonts and skipped the rewritten payment path.",
          },
          {
            text: "The checkout is automated, so trust the suite and split time between the other two",
            correct: false,
            feedback:
              "The suite was written against the *old* checkout's behavior. After a rewrite, passing tests mean less than they appear to — that's precisely when exploration matters.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Say what you skipped',
        body: "Risk-based testing has a price: things go untested, on purpose. The professional move is to make that visible — 'tested checkout and auth deeply; admin reports untouched.' Now the release decision includes the gaps, and the team chose them together.",
        note: "Silent gaps become your fault. Stated gaps are a team decision.",
      },
      {
        kind: 'mcq',
        prompt:
          "Time's up, and the admin reporting section is untested. What do you tell the release meeting?",
        options: [
          {
            text: "Nothing — you tested hard where it mattered, and mentioning gaps looks bad",
            correct: false,
            feedback:
              "If admin reports break next week, the silence becomes the story. The gap existed either way; hiding it just changes whose decision it was.",
          },
          {
            text: "'Checkout and auth are solid. Admin reporting is untested — low traffic, no money involved. I'd ship, and cover it Monday.'",
            correct: true,
            feedback:
              "That's a strategy speaking: coverage, the gap, the reasoning, a recommendation, and a plan. This is the sentence that turns a tester into the person the room trusts.",
          },
          {
            text: "'We need two more days to be sure everything works.'",
            correct: false,
            feedback:
              "'Sure' isn't on the menu — testing reduces uncertainty, it can't end it. Asking for time without naming the risk just delays the same decision.",
          },
        ],
      },
      {
        kind: 'concept',
        title: 'Strategy in one breath',
        body: "Find where the risk lives — new, complex, money, history. Spend your deepest testing there. Automate what you'll repeat. Explore what you can't predict. And say out loud what you skipped. That's test strategy; everything else is technique.",
      },
    ],
  },
];

export const getLesson = (slug: string) => lessons.find((l) => l.slug === slug);
