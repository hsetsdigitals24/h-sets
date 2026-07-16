import {
  Globe,
  Code2,
  Smartphone,
  Bot,
  Sparkles,
  Search,
  Megaphone,
  PenTool,
  Lightbulb,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  short: string;
  hero: string;
  problem: string;
  outcomes: string[];
  features: { title: string; description: string }[];
  process: { step: string; title: string; description: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
};

export const services: Service[] = [
  {
    slug: "website-development",
    name: "Website Development",
    icon: Globe,
    tagline: "Fast, beautiful sites that convert.",
    short: "High-performance marketing sites and web platforms built to rank and convert.",
    hero: "Websites engineered for growth — not just good looks.",
    problem:
      "Most business websites are slow, hard to update, and built to impress designers rather than win customers. The result: high bounce rates, weak search rankings, and leads that never arrive.",
    outcomes: [
      "Sub-2.5s load times and 90+ Lighthouse scores",
      "SEO-ready architecture that ranks on Google",
      "A CMS your team can actually update",
      "Conversion-focused layouts mapped to your funnel",
    ],
    features: [
      { title: "Performance-first builds", description: "Next.js, edge delivery and image optimisation baked in from day one." },
      { title: "Conversion design", description: "Every page is designed around a measurable action — booked calls, signups, sales." },
      { title: "Headless CMS", description: "Update content without a developer using a structured, friendly editor." },
      { title: "Analytics & SEO", description: "GA4, schema markup and search-console wiring so you can see what works." },
    ],
    process: [
      { step: "01", title: "Discover", description: "We map your audience, goals and funnel before a single pixel is drawn." },
      { step: "02", title: "Design", description: "Clickable prototypes you can review and refine fast." },
      { step: "03", title: "Build", description: "Production-grade, accessible, responsive code." },
      { step: "04", title: "Launch & Grow", description: "We ship, measure and iterate on conversion." },
    ],
    faqs: [
      { q: "How long does a website take?", a: "A typical marketing site ships in 3–6 weeks depending on scope and content readiness." },
      { q: "Can my team edit the site?", a: "Yes. We hand over a structured CMS and a short training session so your team stays self-sufficient." },
      { q: "Do you handle hosting?", a: "We deploy to a global edge network with CI/CD and can manage it for you or hand over the keys." },
    ],
    related: ["ui-ux-design", "seo", "software-development"],
  },
  {
    slug: "software-development",
    name: "Software Development",
    icon: Code2,
    tagline: "Custom software that scales.",
    short: "Bespoke web platforms, internal tools and SaaS products engineered to last.",
    hero: "Custom software built for your business — not a template.",
    problem:
      "Off-the-shelf tools rarely fit how your business actually works, forcing manual workarounds and spreadsheets that don't scale.",
    outcomes: [
      "Software shaped around your exact workflow",
      "Secure, scalable, well-documented codebases",
      "Integrations with the tools you already use",
      "A long-term partner, not a one-off vendor",
    ],
    features: [
      { title: "Product engineering", description: "From MVP to scale, with TypeScript, modern frameworks and clean architecture." },
      { title: "API & integrations", description: "Connect payments, CRMs, ERPs and third-party services seamlessly." },
      { title: "Cloud & DevOps", description: "CI/CD, observability and infrastructure that stays up under load." },
      { title: "Security by default", description: "Row-level security, auth and best-practice data handling." },
    ],
    process: [
      { step: "01", title: "Scope", description: "We define the smallest version that delivers real value." },
      { step: "02", title: "Architect", description: "A technical plan that won't paint you into a corner." },
      { step: "03", title: "Build in sprints", description: "Working software every two weeks, not a big-bang reveal." },
      { step: "04", title: "Maintain", description: "Ongoing support, monitoring and iteration." },
    ],
    faqs: [
      { q: "Do you build MVPs?", a: "Yes — we specialise in shipping a focused first version fast, then iterating with real users." },
      { q: "What stack do you use?", a: "Primarily TypeScript, Next.js, Node and PostgreSQL, chosen per project for fit and longevity." },
      { q: "Who owns the code?", a: "You do. We hand over full source, documentation and infrastructure access." },
    ],
    related: ["mobile-apps", "ai-automation", "it-consulting"],
  },
  {
    slug: "mobile-apps",
    name: "Mobile Apps",
    icon: Smartphone,
    tagline: "iOS & Android, one codebase.",
    short: "Cross-platform mobile apps that feel native and ship fast.",
    hero: "Mobile experiences your customers keep coming back to.",
    problem:
      "Building separately for iOS and Android doubles cost and timelines, while clunky hybrid apps frustrate users and tank retention.",
    outcomes: [
      "One codebase, both app stores",
      "Native-feeling performance and gestures",
      "Push notifications and offline support",
      "Faster time to market and lower cost",
    ],
    features: [
      { title: "Cross-platform", description: "React Native delivers iOS and Android from a single, maintainable codebase." },
      { title: "Native integrations", description: "Camera, location, biometrics, payments and push, done properly." },
      { title: "App store launch", description: "We handle submission, review and release management." },
      { title: "Analytics & retention", description: "Event tracking and engagement loops built in." },
    ],
    process: [
      { step: "01", title: "Define", description: "Prioritise the features that matter for launch." },
      { step: "02", title: "Prototype", description: "Interactive flows tested on real devices." },
      { step: "03", title: "Build & test", description: "QA on real hardware across OS versions." },
      { step: "04", title: "Ship & iterate", description: "Launch, measure, improve." },
    ],
    faqs: [
      { q: "iOS and Android both?", a: "Yes — one React Native codebase serves both platforms with platform-specific polish where it counts." },
      { q: "Can you publish to the stores?", a: "We manage the full submission and review process for both the App Store and Google Play." },
      { q: "Do apps work offline?", a: "Where it makes sense, we build offline-first sync so the app stays useful without a connection." },
    ],
    related: ["software-development", "ui-ux-design", "ai-agents"],
  },
  {
    slug: "ai-automation",
    name: "AI Automation",
    icon: Bot,
    tagline: "Automate the busywork.",
    short: "Workflow automation and AI that removes repetitive manual work.",
    hero: "Let AI handle the repetitive work your team shouldn't.",
    problem:
      "Skilled staff lose hours every week to copy-paste tasks, manual data entry and routine responses — work that quietly drains margin.",
    outcomes: [
      "Hours of manual work reclaimed weekly",
      "Fewer errors from manual handoffs",
      "Faster response and turnaround times",
      "A clear, measurable ROI on automation",
    ],
    features: [
      { title: "Process automation", description: "Connect your tools so data flows without human copy-paste." },
      { title: "Document AI", description: "Extract, classify and summarise documents at scale." },
      { title: "Smart workflows", description: "Trigger-based pipelines with human-in-the-loop checkpoints." },
      { title: "Custom integrations", description: "Glue together the apps your business already runs on." },
    ],
    process: [
      { step: "01", title: "Audit", description: "We map where time and money leak in your workflows." },
      { step: "02", title: "Prioritise", description: "Target the automations with the biggest payback first." },
      { step: "03", title: "Implement", description: "Build, test and roll out with your team." },
      { step: "04", title: "Optimise", description: "Monitor and expand as ROI proves out." },
    ],
    faqs: [
      { q: "Where do we start?", a: "With an automation audit — we identify the highest-ROI workflows before building anything." },
      { q: "Will it replace staff?", a: "It removes drudge work so your team can focus on higher-value work. We design human-in-the-loop where judgment matters." },
      { q: "Which tools can you connect?", a: "Most modern SaaS with an API — CRMs, spreadsheets, email, payments, messaging and more." },
    ],
    related: ["ai-agents", "software-development", "digital-transformation"],
  },
  {
    slug: "ai-agents",
    name: "AI Agents",
    icon: Sparkles,
    tagline: "Always-on AI teammates.",
    short: "Custom AI agents for support, sales and internal operations.",
    hero: "AI agents that work around the clock.",
    problem:
      "Customers expect instant answers and your team can't be online 24/7. Generic chatbots frustrate more than they help.",
    outcomes: [
      "Instant, accurate answers grounded in your data",
      "24/7 coverage without burning out staff",
      "Qualified leads captured around the clock",
      "Seamless handoff to humans when needed",
    ],
    features: [
      { title: "Grounded in your data", description: "Agents answer from your docs, products and policies — not guesses." },
      { title: "Multi-channel", description: "Deploy on your site, WhatsApp, email or internal tools." },
      { title: "Tool use", description: "Agents take actions — booking, lookups, ticket creation — not just chat." },
      { title: "Guardrails", description: "Scope limits and escalation keep responses safe and on-brand." },
    ],
    process: [
      { step: "01", title: "Define scope", description: "Decide exactly what the agent should and shouldn't do." },
      { step: "02", title: "Ground", description: "Index your knowledge so answers are accurate." },
      { step: "03", title: "Deploy", description: "Launch on your chosen channels." },
      { step: "04", title: "Improve", description: "Review transcripts and tune continuously." },
    ],
    faqs: [
      { q: "Won't it make things up?", a: "We use retrieval-augmented generation so answers are grounded in your approved content, with escalation when unsure." },
      { q: "Which LLM do you use?", a: "We select the best model per use case — including Claude — balancing accuracy, latency and cost." },
      { q: "Can it take actions?", a: "Yes — agents can book, look up records and trigger workflows, not just answer questions." },
    ],
    related: ["ai-automation", "software-development", "mobile-apps"],
  },
  {
    slug: "seo",
    name: "SEO",
    icon: Search,
    tagline: "Get found on Google.",
    short: "Technical and content SEO that earns durable organic traffic.",
    hero: "Rank where your customers are searching.",
    problem:
      "Paid ads stop the moment you stop paying. Without strong organic search, your cost-per-lead keeps climbing.",
    outcomes: [
      "Top-3 rankings for commercial keywords",
      "Lower cost-per-lead from organic traffic",
      "Content that compounds over time",
      "Visibility in AI search (ChatGPT, Perplexity)",
    ],
    features: [
      { title: "Technical SEO", description: "Site speed, crawlability, schema and Core Web Vitals." },
      { title: "Content strategy", description: "Topical authority built around what your buyers search." },
      { title: "Programmatic SEO", description: "Scaled landing pages from structured data templates." },
      { title: "AI discoverability", description: "Entity-based content optimised to be cited by AI engines." },
    ],
    process: [
      { step: "01", title: "Audit", description: "Technical and content gap analysis." },
      { step: "02", title: "Strategy", description: "Keyword and topic roadmap tied to revenue." },
      { step: "03", title: "Execute", description: "Fixes, content and internal linking." },
      { step: "04", title: "Report", description: "Rankings, traffic and lead attribution." },
    ],
    faqs: [
      { q: "How long until results?", a: "Technical wins land in weeks; content authority typically compounds over 3–6 months." },
      { q: "Do you do AI search optimisation?", a: "Yes — we structure content as entities so it can be cited by ChatGPT, Perplexity and Gemini." },
      { q: "Is content included?", a: "We can strategise only, or handle production end-to-end — your call." },
    ],
    related: ["digital-marketing", "website-development", "it-consulting"],
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    icon: Megaphone,
    tagline: "Demand that converts.",
    short: "Full-funnel campaigns across search, social and email.",
    hero: "Marketing that's measured in leads, not likes.",
    problem:
      "Scattered, unmeasured marketing spend produces vanity metrics but no clear pipeline or ROI.",
    outcomes: [
      "A predictable, measurable lead pipeline",
      "Lower customer acquisition cost",
      "Campaigns tied to revenue, not vanity metrics",
      "A repeatable growth engine",
    ],
    features: [
      { title: "Paid acquisition", description: "Google and social campaigns optimised for cost-per-lead." },
      { title: "Email automation", description: "Nurture sequences that turn leads into customers." },
      { title: "Content & social", description: "On-brand content that builds trust and demand." },
      { title: "Attribution", description: "Know which channels actually drive revenue." },
    ],
    process: [
      { step: "01", title: "Strategy", description: "Define ICP, channels and offers." },
      { step: "02", title: "Launch", description: "Ship campaigns and tracking." },
      { step: "03", title: "Optimise", description: "Double down on what converts." },
      { step: "04", title: "Scale", description: "Grow spend against proven ROI." },
    ],
    faqs: [
      { q: "Do you manage ad budgets?", a: "Yes — we plan, run and optimise paid campaigns and report transparently on spend and return." },
      { q: "Can you set up email automation?", a: "We build nurture and lifecycle sequences that move leads toward a purchase automatically." },
      { q: "How do you measure success?", a: "By pipeline and cost-per-lead — not impressions. Every campaign maps to a revenue goal." },
    ],
    related: ["seo", "website-development", "ui-ux-design"],
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    icon: PenTool,
    tagline: "Design people love to use.",
    short: "Research-led product and brand design that drives engagement.",
    hero: "Interfaces that feel effortless.",
    problem:
      "Confusing interfaces lose users at every step, no matter how powerful the product underneath.",
    outcomes: [
      "Higher conversion and engagement",
      "Lower support load from clearer flows",
      "A consistent, scalable design system",
      "Designs validated with real users",
    ],
    features: [
      { title: "UX research", description: "Understand users before designing for them." },
      { title: "Product design", description: "Clean, accessible, conversion-focused interfaces." },
      { title: "Design systems", description: "Reusable components for speed and consistency." },
      { title: "Prototyping", description: "Test ideas before they're expensive to change." },
    ],
    process: [
      { step: "01", title: "Research", description: "Interviews, flows and competitive review." },
      { step: "02", title: "Wireframe", description: "Structure before style." },
      { step: "03", title: "Design", description: "Polished, accessible visuals." },
      { step: "04", title: "Validate", description: "Usability testing and iteration." },
    ],
    faqs: [
      { q: "Do you do design only?", a: "Yes — and we can also build it. Our designers and engineers work side by side." },
      { q: "Will you build a design system?", a: "For larger products we deliver a reusable component library to keep future work fast and consistent." },
      { q: "Do you test with users?", a: "Usability testing is part of our process so decisions are based on evidence, not opinion." },
    ],
    related: ["website-development", "mobile-apps", "software-development"],
  },
  {
    slug: "it-consulting",
    name: "IT Consulting",
    icon: Lightbulb,
    tagline: "Clarity for your tech decisions.",
    short: "Strategic guidance on architecture, tooling and digital roadmaps.",
    hero: "Make confident technology decisions.",
    problem:
      "Without senior technical guidance, teams over-invest in the wrong tools and accumulate costly technical debt.",
    outcomes: [
      "A clear, prioritised technology roadmap",
      "Reduced risk and wasted spend",
      "Vendor-neutral, honest advice",
      "Senior expertise without a full-time hire",
    ],
    features: [
      { title: "Tech strategy", description: "Roadmaps aligned to business goals and budget." },
      { title: "Architecture review", description: "Find and fix scaling and security risks early." },
      { title: "Vendor selection", description: "Choose the right tools without the sales noise." },
      { title: "Team enablement", description: "Upskill your people and processes." },
    ],
    process: [
      { step: "01", title: "Assess", description: "Where you are and where you want to be." },
      { step: "02", title: "Recommend", description: "A prioritised, costed roadmap." },
      { step: "03", title: "Support", description: "Help executing the plan." },
      { step: "04", title: "Review", description: "Course-correct as you grow." },
    ],
    faqs: [
      { q: "Is this a one-off or ongoing?", a: "Both — from a single architecture review to fractional CTO-style ongoing support." },
      { q: "Are you vendor-neutral?", a: "Yes. We recommend what's right for you, not what earns us a referral fee." },
      { q: "Can you help us hire?", a: "We can define roles, review candidates and set up the processes your team needs to succeed." },
    ],
    related: ["digital-transformation", "software-development", "seo"],
  },
  {
    slug: "digital-transformation",
    name: "Digital Transformation",
    icon: Rocket,
    tagline: "Modernise end to end.",
    short: "Strategy, build and change management to digitise your business.",
    hero: "Transform how your business runs — end to end.",
    problem:
      "Legacy processes and disconnected tools hold growing businesses back, but transformation feels too big and risky to start.",
    outcomes: [
      "Digitised, connected operations",
      "Measurable efficiency gains",
      "A phased, low-risk rollout",
      "A team confident in the new way of working",
    ],
    features: [
      { title: "Assessment", description: "A clear picture of your digital maturity and gaps." },
      { title: "Roadmap", description: "A phased plan that delivers value at each step." },
      { title: "Implementation", description: "We build and integrate the systems you need." },
      { title: "Change management", description: "Training and support so adoption actually sticks." },
    ],
    process: [
      { step: "01", title: "Assess", description: "Benchmark your current digital maturity." },
      { step: "02", title: "Plan", description: "A phased, ROI-driven roadmap." },
      { step: "03", title: "Execute", description: "Build, integrate and migrate." },
      { step: "04", title: "Embed", description: "Train teams and measure outcomes." },
    ],
    faqs: [
      { q: "Where do we begin?", a: "With a digital transformation assessment that benchmarks your maturity and surfaces the highest-impact moves." },
      { q: "Is it disruptive?", a: "We roll out in phases so the business keeps running and value lands early — no risky big-bang switch." },
      { q: "Do you train our team?", a: "Change management and training are core to every engagement so adoption sticks." },
    ],
    related: ["it-consulting", "ai-automation", "software-development"],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
