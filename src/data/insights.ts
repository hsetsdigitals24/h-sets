/**
 * Public/read shape consumed by marketing pages. `body` is rendered HTML
 * (produced by `bodyToHtml` in the content read layer). The seed data below
 * stores the legacy `string[]` form, which the read layer normalizes to HTML.
 */
export type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readMins: number;
  accent: string;
  body: string;
};

/** Raw seed shape: body is an array of plain paragraphs. */
type SeedInsight = Omit<Insight, "body"> & { body: string[] };

export const insights: SeedInsight[] = [
  {
    slug: "ai-automation-nigerian-smes",
    title: "How Nigerian SMEs are using AI automation to cut costs in 2026",
    excerpt:
      "AI automation is no longer just for big tech. Here's how small and medium businesses across Nigeria are reclaiming hours and reducing overhead.",
    category: "AI Solutions",
    author: "Emeka Nwosu",
    authorRole: "AI Engineer",
    date: "2026-06-10",
    readMins: 7,
    accent: "bg-fuchsia-500",
    body: [
      "For years, automation felt like something reserved for companies with deep pockets and dedicated engineering teams. That has changed. The combination of accessible AI models and no-code integration tools means a five-person business can now automate work that used to require a full department.",
      "The biggest wins are rarely glamorous. They're the repetitive tasks that quietly drain margin: copying data between systems, answering the same customer questions, reconciling spreadsheets. When you add up the hours, the cost is significant.",
      "The most successful businesses we work with start small. They pick one painful, repetitive workflow, automate it well, measure the time saved, and then expand. This approach builds confidence and delivers ROI quickly, rather than betting everything on a single large project.",
      "If you're considering automation, start by tracking where your team spends time on low-value, repetitive work for a week. That list is your roadmap. The opportunities are almost always bigger than people expect.",
    ],
  },
  {
    slug: "from-economics-degree-to-developer",
    title: "From economics degree to developer: a realistic 6-month plan",
    excerpt:
      "Switching into tech is possible, but the internet is full of unrealistic advice. Here's an honest, structured path that actually works.",
    category: "Career Growth",
    author: "Amara Okafor",
    authorRole: "Frontend Engineer",
    date: "2026-06-04",
    readMins: 9,
    accent: "bg-blue-500",
    body: [
      "Every week we meet people who want to switch into tech but feel overwhelmed by conflicting advice. The truth is that a career switch is absolutely achievable in six months — but only with structure, consistency and realistic expectations.",
      "The first mistake people make is trying to learn everything at once. You don't need to know five languages and three frameworks. You need to go deep on one path, build real projects, and develop the problem-solving muscle that employers actually hire for.",
      "The second mistake is learning in isolation. Cohort-based learning works because it adds accountability, feedback and a network. When you're stuck at 11pm, the difference between giving up and pushing through is often having people around you.",
      "Finally, treat your portfolio as your real CV. Three solid, deployed projects that solve real problems will do more for you than any certificate. Employers want evidence you can build, not just that you attended.",
    ],
  },
  {
    slug: "what-makes-website-actually-convert",
    title: "What actually makes a website convert (it's not the design)",
    excerpt:
      "Beautiful websites that don't convert are everywhere. The difference between a pretty site and a profitable one comes down to a few fundamentals.",
    category: "Web Development",
    author: "Tunde Bello",
    authorRole: "Lead Engineer",
    date: "2026-05-28",
    readMins: 6,
    accent: "bg-teal-500",
    body: [
      "We've rebuilt dozens of websites, and the pattern is consistent: the businesses that struggle usually have beautiful sites that don't convert. The problem is almost never the visual design. It's clarity, speed and a clear path to action.",
      "Clarity comes first. A visitor should understand what you do, who it's for, and what to do next within a few seconds. If they have to think, you've lost most of them. Strip away jargon and lead with the outcome you deliver.",
      "Speed is the silent killer. Every second of load time costs you conversions, especially on mobile networks. A site that loads in under 2.5 seconds isn't a nice-to-have — it's the baseline for being competitive.",
      "Finally, every page needs one obvious next step. Too many options paralyse visitors. Decide what action matters most on each page and make it the clear, unmissable choice.",
    ],
  },
  {
    slug: "ai-readiness-checklist-for-businesses",
    title: "Is your business actually ready for AI? A practical checklist",
    excerpt:
      "Before you invest in AI, it's worth knowing whether your foundations can support it. Here's how to assess your readiness honestly.",
    category: "AI Solutions",
    author: "Emeka Nwosu",
    authorRole: "AI Engineer",
    date: "2026-05-20",
    readMins: 5,
    accent: "bg-orange-500",
    body: [
      "AI is the headline everyone wants, but rushing in without the right foundations is how businesses waste money. Readiness comes down to three things: data, process and people.",
      "Data: AI is only as good as the information it can access. If your data is scattered, inconsistent or locked in silos, the first investment should be organising it, not bolting on AI.",
      "Process: automation amplifies whatever process it touches. Automate a broken process and you just break things faster. Map and tidy the workflow first, then automate it.",
      "People: the best AI projects have a clear human owner and buy-in from the team. AI should remove drudgery so people can focus on higher-value work — and that message matters for adoption.",
    ],
  },
  {
    slug: "designing-for-trust-fintech",
    title: "Designing for trust: lessons from building fintech products",
    excerpt:
      "In fintech, trust is the product. Here's what we've learned about designing interfaces that make people feel safe with their money.",
    category: "Design",
    author: "Zainab Yusuf",
    authorRole: "Product Designer",
    date: "2026-05-12",
    readMins: 6,
    accent: "bg-rose-500",
    body: [
      "When you're handling someone's money, every design decision either builds or erodes trust. We've learned that trust is rarely created by a single flourish — it's the accumulation of small, consistent signals.",
      "Clarity beats cleverness. Users want to understand exactly what's happening with their money at every step. Plain language, clear confirmations and transparent fees do more for trust than any visual trend.",
      "Speed and reliability are part of the design. A transaction that hangs, even briefly, plants doubt. Designing the loading, error and success states with as much care as the happy path is essential.",
      "Finally, consistency signals competence. When every screen behaves predictably and looks coherent, users relax. A solid design system isn't just an efficiency tool — in fintech, it's a trust tool.",
    ],
  },
  {
    slug: "seo-in-the-age-of-ai-search",
    title: "SEO in the age of AI search: what's changed and what hasn't",
    excerpt:
      "AI search is reshaping discoverability. Here's how to stay visible when your customers are asking ChatGPT and Perplexity instead of Google.",
    category: "SEO",
    author: "Funke Adebayo",
    authorRole: "Growth Marketer",
    date: "2026-05-05",
    readMins: 8,
    accent: "bg-purple-500",
    body: [
      "Search behaviour is shifting. More people are asking AI assistants direct questions instead of scanning a page of blue links. This doesn't make SEO obsolete — it changes what good SEO looks like.",
      "The fundamentals still hold: genuinely useful content, fast accessible pages, and clear structure. AI engines are trained on the same web and reward the same quality signals.",
      "What's new is the importance of being citable. AI engines synthesise answers from sources they trust. Structuring content around clear entities and answering questions directly increases the chance of being the source an AI cites.",
      "The practical takeaway: write content that answers real questions clearly, structure it well, and build genuine authority. That serves you across both traditional and AI search.",
    ],
  },
];

export function getInsight(slug: string) {
  return insights.find((i) => i.slug === slug);
}
