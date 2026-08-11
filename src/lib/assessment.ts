/**
 * AI Readiness Self-Assessment — questions, scoring and recommendation logic.
 *
 * Pure and dependency-free (no I/O, no server-only) so it runs on the client for
 * instant results AND on the server (API route) to validate/enrich the captured
 * lead. Mirrors PRD §12.1 (audit tools) and §16 (AI features).
 */

export type AssessmentOption = { label: string; value: number };

export type AssessmentQuestion = {
  id: string;
  /** Short pillar label shown as an eyebrow. */
  category: string;
  question: string;
  /** Options ordered lowest → highest maturity. */
  options: AssessmentOption[];
};

export const questions: AssessmentQuestion[] = [
  {
    id: "data",
    category: "Data",
    question: "How is your business data currently organised?",
    options: [
      { label: "Mostly on paper or in people's heads", value: 0 },
      { label: "Scattered across spreadsheets and inboxes", value: 1 },
      { label: "In a few systems, but siloed", value: 2 },
      { label: "Centralised, clean and accessible", value: 3 },
    ],
  },
  {
    id: "process",
    category: "Process",
    question: "How much of your day-to-day work is repetitive and manual?",
    options: [
      { label: "Almost everything is manual", value: 0 },
      { label: "A lot — we know it slows us down", value: 1 },
      { label: "Some tasks are automated", value: 2 },
      { label: "Most routine work is already automated", value: 3 },
    ],
  },
  {
    id: "people",
    category: "People",
    question: "How comfortable is your team with new technology?",
    options: [
      { label: "Resistant to change", value: 0 },
      { label: "Willing, but need guidance", value: 1 },
      { label: "Comfortable with new tools", value: 2 },
      { label: "Actively experimenting with AI", value: 3 },
    ],
  },
  {
    id: "tooling",
    category: "Tooling",
    question: "Have you tried any AI tools in your business yet?",
    options: [
      { label: "Not at all", value: 0 },
      { label: "A little, informally", value: 1 },
      { label: "A few tools in specific areas", value: 2 },
      { label: "AI is embedded in our workflows", value: 3 },
    ],
  },
  {
    id: "strategy",
    category: "Strategy",
    question: "Do you have a clear goal for what AI should achieve?",
    options: [
      { label: "No — just curious", value: 0 },
      { label: "A rough idea", value: 1 },
      { label: "A few specific use cases in mind", value: 2 },
      { label: "A defined roadmap and budget", value: 3 },
    ],
  },
  {
    id: "budget",
    category: "Investment",
    question: "Are you ready to invest in an AI initiative this year?",
    options: [
      { label: "Not yet — exploring", value: 0 },
      { label: "Possibly, if the ROI is clear", value: 1 },
      { label: "Yes, budget is being planned", value: 2 },
      { label: "Yes, budget is approved", value: 3 },
    ],
  },
];

/** Maximum achievable raw score (sum of each question's top option). */
export const MAX_SCORE = questions.reduce(
  (total, q) => total + Math.max(...q.options.map((o) => o.value)),
  0
);

export type ReadinessLevel = {
  key: "exploring" | "emerging" | "advancing" | "ready";
  title: string;
  headline: string;
  summary: string;
  recommendations: string[];
};

const LEVELS: (ReadinessLevel & { min: number })[] = [
  {
    min: 0,
    key: "exploring",
    title: "AI Explorer",
    headline: "You're at the very start of your AI journey.",
    summary:
      "There's real opportunity here, but the foundations — data, process and clear goals — need work first. The good news: small, focused wins can build momentum fast.",
    recommendations: [
      "Start by getting your core business data out of spreadsheets and into one place.",
      "Pick one repetitive, high-volume task to automate as a proof of value.",
      "Book an AI consultation to map the highest-ROI first step for your business.",
    ],
  },
  {
    min: 30,
    key: "emerging",
    title: "AI Emerging",
    headline: "You have the raw ingredients to put AI to work.",
    summary:
      "Your team is open to change and some systems are in place. With the right first project and a bit of structure, you can turn that potential into measurable results.",
    recommendations: [
      "Identify 2–3 concrete use cases where automation would save the most hours.",
      "Tidy and connect the data those use cases depend on.",
      "Run a scoped pilot with clear success metrics before scaling.",
    ],
  },
  {
    min: 56,
    key: "advancing",
    title: "AI Advancing",
    headline: "You're well positioned to scale AI across the business.",
    summary:
      "You already have data, tooling and buy-in. The focus now is moving from isolated experiments to a coordinated strategy that compounds value.",
    recommendations: [
      "Move from ad-hoc tools to an integrated AI strategy with a roadmap.",
      "Add guardrails, grounding and human-in-the-loop where judgment matters.",
      "Prioritise use cases by ROI and sequence them into a delivery plan.",
    ],
  },
  {
    min: 80,
    key: "ready",
    title: "AI-Ready",
    headline: "You're ready to build serious competitive advantage with AI.",
    summary:
      "You have strong foundations and clear intent. The opportunity now is bespoke, high-leverage AI built into the heart of your products and operations.",
    recommendations: [
      "Invest in custom AI agents and applications tailored to your workflows.",
      "Establish responsible-AI governance as you scale across teams.",
      "Partner on a strategy engagement to stay ahead of the curve.",
    ],
  },
];

/** Map a 0–100 readiness percentage onto its level. */
export function levelForPercent(percent: number): ReadinessLevel {
  let match = LEVELS[0];
  for (const level of LEVELS) {
    if (percent >= level.min) match = level;
  }
  // Strip the internal `min` before returning.
  const { min: _min, ...level } = match;
  void _min;
  return level;
}

/** Score a completed answer set. `answers` maps question id → chosen value. */
export function scoreAssessment(answers: Record<string, number>): {
  raw: number;
  percent: number;
  level: ReadinessLevel;
} {
  const raw = questions.reduce((total, q) => {
    const v = answers[q.id];
    return total + (typeof v === "number" ? v : 0);
  }, 0);
  const percent = MAX_SCORE > 0 ? Math.round((raw / MAX_SCORE) * 100) : 0;
  return { raw, percent, level: levelForPercent(percent) };
}
