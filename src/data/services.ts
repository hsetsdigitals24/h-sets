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

/** A long-form body block rendered on the service page. */
export type ServiceSection = { heading: string; body: string[] };

export type Service = {
  slug: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  short: string;
  hero: string;
  problem: string;
  /**
   * Search-facing overrides. `name` stays the short nav/card label; these carry
   * the keyword + geography that <title> and <meta description> need. Optional —
   * a service without them falls back to name/short.
   */
  metaTitle?: string;
  metaDescription?: string;
  /** Long-form body, rendered between the features and process sections. */
  sections?: ServiceSection[];
  outcomes: string[];
  features: { title: string; description: string }[];
  process: { step: string; title: string; description: string }[];
  faqs: { q: string; a: string }[];
  related: string[];
};

export const services: Service[] = [
  {
    slug: "website-development",
    metaTitle: "Website Development Company in Nigeria",
    metaDescription:
      "H-SETS designs and builds fast, search-ready websites for Nigerian businesses — from Ilorin and Lagos to Abuja. Sub-2.5s loads, 90+ Lighthouse, built to convert.",
    sections: [
      {
        heading: "What a business website in Nigeria actually has to do",
        body: [
          "Most business websites here are judged in under five seconds, usually on a mid-range Android phone, often on mobile data the visitor is paying for by the megabyte. In that window a prospective customer decides whether you are a real company, whether you do the thing they need, and whether contacting you is worth the effort. A site that takes eight seconds to paint has already lost that decision before a single word has been read.",
          "That is why we treat speed as a commercial requirement rather than a technical nicety. Every site we build targets a Largest Contentful Paint under 2.5 seconds on a 4G connection and a Lighthouse performance score above 90 on mobile. Those are not vanity numbers: Google uses them as ranking inputs, and every second of delay measurably reduces the number of people who stay long enough to enquire.",
          "The second job is legibility to search engines. A beautiful site with no heading structure, no schema markup and no crawlable internal links is invisible to the channel that would otherwise deliver customers for free. We build the structure first — semantic headings, clean URLs, structured data, an XML sitemap — and design on top of it, so the site is discoverable on the day it launches rather than after a costly retrofit.",
        ],
      },
      {
        heading: "How we build: structure first, then design",
        body: [
          "We start with your funnel, not your homepage. In discovery we map who the site is for, what each audience needs to see before they will act, and what the single measurable action is on every page — a booked call, a form, a WhatsApp message, a purchase. Pages without a job do not get built.",
          "From there we produce clickable prototypes you can walk through and react to before any production code is written. Changing a prototype costs an afternoon; changing a built site costs a sprint. Most of the disagreements that would otherwise surface late — about hierarchy, tone, how much to say on the homepage — get settled here, cheaply.",
          "Build is Next.js on the edge: server-rendered pages for anything search needs to read, image optimisation and modern formats by default, and a component library so future pages stay visually consistent without a designer in the loop. Your content lives in a structured CMS, so your team edits real fields — headline, body, image, call to action — instead of fighting a page builder.",
        ],
      },
      {
        heading: "Built for Nigerian networks, devices and payments",
        body: [
          "We develop against the conditions your customers are actually on: mid-range Android hardware, variable 3G and 4G coverage, and data that costs real money. That shapes concrete decisions — aggressive image compression, fonts that do not block rendering, JavaScript kept to what the page genuinely needs, and layouts that hold their shape while assets load rather than shifting content under someone's thumb.",
          "Where you sell or take deposits online, we integrate the rails your customers already trust — Paystack and Flutterwave — including card, bank transfer and USSD flows, so nobody abandons a purchase because the only option was a card they do not have. Where you capture leads, WhatsApp is treated as a first-class channel rather than an afterthought, because for most Nigerian B2B buyers it is the first contact they will attempt.",
          "Accessibility is part of the same discipline. We build to WCAG 2.1 AA — keyboard navigation, real contrast ratios, labelled forms, meaningful alt text — which widens your audience and, not incidentally, is the same structural clarity search engines reward.",
        ],
      },
      {
        heading: "Getting found: the SEO work that ships with the site",
        body: [
          "Every site leaves our hands with the technical groundwork already done: unique titles and meta descriptions per page, self-referencing canonical tags, Open Graph images so shared links render properly, Organization and LocalBusiness structured data, a submitted XML sitemap and a robots file that keeps staging out of the index.",
          "For businesses serving a defined area we go further and build the local layer — location pages with genuine local content, consistent name-address-phone details across the site, and a Google Business Profile configured to match exactly. In markets like Ilorin and Kwara State, where commercial search competition is still thin, this is frequently the fastest route to page-one visibility for terms that bring in real enquiries.",
          "We wire GA4 and Google Search Console before launch, mark up the actions that matter as conversion events, and hand over a short written record of what is tracked and where to read it. You should be able to answer \"where did last month's leads come from?\" without calling us.",
        ],
      },
      {
        heading: "Timelines, cost and what happens after launch",
        body: [
          "A focused marketing site of eight to twelve pages typically ships in three to six weeks. A larger site with custom functionality — booking, portals, e-commerce, multi-language — usually runs six to twelve weeks. The single biggest variable is content readiness: projects where copy and imagery are ready move roughly twice as fast as projects where they are written during the build. We can write the content for you if that is the faster path.",
          "We quote fixed scope with staged payments rather than open-ended hourly billing, so you know the number before we start. Hosting runs on Vercel and Cloudflare, which for most business sites costs a fraction of traditional managed hosting and removes an entire category of maintenance and downtime problems.",
          "After launch you get the code, the accounts and the documentation — no hostage-taking. Most clients keep us on a light monthly retainer for content updates, performance monitoring and ongoing SEO, but that is a choice, not a lock-in. The site is yours.",
        ],
      },
      {
        heading: "Redesign, rebuild, or leave it alone",
        body: [
          "Not every underperforming website needs replacing, and we turn down rebuilds fairly often. If the structure is sound and the problem is copy, imagery or a confusing route to the enquiry form, a focused content and conversion pass costs a fraction of a rebuild and usually moves the numbers further. We will tell you when that is the case, before quoting for work you do not need.",
          "A rebuild is justified when the foundation itself is the constraint: a platform so slow that no amount of optimisation brings it under three seconds, a theme nobody can safely update, a site your team cannot edit without paying a developer, or a structure so tangled that search engines cannot crawl half of it. Those problems compound, and patching them costs more over two years than replacing them once.",
          "The honest test is what the site currently returns. If you cannot say how many enquiries came through it last month, that is the first thing to fix — instrumentation before investment. We would rather spend a week establishing what the current site actually does and then quote against evidence, than sell you a redesign whose success nobody will be able to measure afterwards.",
          "If you are weighing a redesign, the quickest useful step is a free audit: we will crawl the current site, check its Core Web Vitals, look at what it ranks for today, and send you the findings whether or not you engage us. It takes us a couple of days and it gives both sides something concrete to argue with.",
        ],
      },
    ],
    name: "Website Development",
    icon: Globe,
    tagline: "Fast, beautiful sites that convert.",
    short: "High-performance marketing sites and web platforms built to rank and convert.",
    hero: "Website development for Nigerian businesses that need to be found.",
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
    metaTitle: "Custom Software Development in Nigeria",
    metaDescription:
      "Custom web and business software built for Nigerian companies by H-SETS — internal platforms, customer portals and systems that replace the spreadsheets you have outgrown.",
    sections: [
      {
        heading: "When a business has outgrown its spreadsheets",
        body: [
          "Almost every custom software project we take on starts in the same place: a spreadsheet that three people edit, a WhatsApp group where decisions are made, and one person who is the only one who knows how it all fits together. It works, until volume doubles, or that person goes on leave, or two versions of the truth appear and nobody can tell which is correct.",
          "The cost of staying there is rarely a single dramatic failure. It is the slow leak — hours lost re-keying data between systems, invoices chased twice, stock counted three times, reporting that takes two days to assemble and is out of date by the time anyone reads it. Most businesses discover the size of that leak only when we sit with their team and time the work.",
          "Off-the-shelf software solves this for standard problems, and when it does we will tell you to buy it rather than build. Custom development earns its cost when your process is genuinely your own — the thing you do differently from competitors, the workflow that is your actual advantage — and bending it to fit someone else's product would mean giving that advantage up.",
        ],
      },
      {
        heading: "How we scope, build and hand over",
        body: [
          "We begin with a paid discovery: a week or two of sitting with the people who will use the system, watching the current process, and writing down what actually happens rather than what the org chart says happens. The output is a scoped specification with screens, data model and a fixed-price build plan. You own that document whether or not you build with us.",
          "Delivery runs in two-week increments against a visible backlog. At the end of each one there is something running that you can open and use — not a status report. That cadence means scope questions surface while they are still cheap, and it gives your team time to absorb the change instead of meeting the whole system on go-live day.",
          "Our default stack is TypeScript end to end — Next.js on the front, Node and PostgreSQL behind it, hosted on infrastructure that scales without a systems administrator. It is deliberately boring and widely known: if you later hire in-house or move to another partner, you are handing over a codebase thousands of Nigerian developers can read, not a bespoke framework only we understand.",
        ],
      },
      {
        heading: "What we build most often",
        body: [
          "Internal operations platforms are the bulk of it: systems that replace the spreadsheet-and-WhatsApp layer with real records, permissions and an audit trail. Job tracking, inventory, scheduling, approvals, field reporting — the unglamorous software that decides whether a growing business keeps its margins.",
          "Customer-facing portals are the second category. Letting clients check status, download documents, make payments and raise requests themselves removes an enormous volume of phone calls and email, and it tends to be the change staff notice first.",
          "The third is integration work: making the systems you already pay for talk to each other. Accounting software, payment gateways, logistics providers, bank statements, an existing ERP. Often the highest-return project is not new software at all but a set of reliable connections between what you already own — and we will say so when that is the case.",
        ],
      },
      {
        heading: "Security, data and keeping it running",
        body: [
          "Access control is designed in from the first sprint, not added when someone notices: role-based permissions, row-level rules so people see only their own records, hashed credentials, and audit logs on every consequential action. For businesses handling health, financial or student data this is not optional, and retrofitting it is considerably more expensive than building it in.",
          "Payment data never touches your servers. Card handling stays with PCI-compliant gateways — Paystack, Flutterwave — and your system stores references, not card numbers. Backups are automated and, more importantly, restoration is tested, because an untested backup is a hope rather than a plan.",
          "Every system ships with error monitoring and uptime alerting wired up, so problems reach us before they reach your customers. Support after launch is a written agreement with a defined response time, not an informal promise — and, as with everything we build, the code and the infrastructure accounts are in your name.",
        ],
      },
      {
        heading: "What it costs and how to start small",
        body: [
          "A focused internal tool — one workflow, a handful of user types — typically lands between six and ten weeks. A platform replacing several disconnected systems is a three-to-six-month programme, usually delivered in phases that each stand on their own. We price per phase, so you can stop, reassess or change direction at a phase boundary without stranding the investment.",
          "If you are not sure the whole thing is justified, start with the single most expensive manual process in the business. Automate that, measure the hours it returns, and let the result decide whether phase two happens. We would far rather build one thing you demonstrably need than a platform that impresses in a demo and gathers dust in production.",
        ],
      },
      {
        heading: "Build, buy, or integrate what you already own",
        body: [
          "Before scoping a build we work through the alternatives with you honestly. Buying beats building whenever your requirement is genuinely standard — accounting, payroll, email, basic CRM. These are solved problems, the products are mature and cheap relative to development, and a custom version would cost more and do less. If that is your situation we will say so and help you choose a product instead.",
          "Integration is the middle path, and it is undervalued. Many businesses already own most of what they need but operate it as islands, with staff acting as the connective tissue between systems. Building the connections — so an order in one place becomes an invoice in another without a human retyping it — often delivers most of the benefit of a new platform at a fraction of the cost and risk.",
          "Building is right when the process is your differentiator, when no product fits without distorting how you work, or when the integrations you need do not exist. Even then, we look for the smallest version that proves the value. A system that does one important thing well and is genuinely used beats a comprehensive platform that staff quietly route around.",
        ],
      },
      {
        heading: "What the project needs from your side",
        body: [
          "The projects that go well share one trait: a decision-maker on your side with the authority to settle questions within a day or two. Not a committee, and not someone who must escalate every choice. Most delays we see are not technical — they are a question sitting unanswered for a fortnight while a sprint's worth of work waits behind it.",
          "We also need access to the people who do the work today, for a few hours at the start and an hour or so per fortnight afterwards. The person who actually processes the orders knows the exceptions that never made it into any documentation, and those exceptions are what break systems designed purely from management's description of the process.",
          "Finally, expect to spend time on testing. Software that has only been checked by the people who built it meets reality on launch day, which is the most expensive place to meet it. We ask for a few hours from two or three of your staff at the end of each phase, working through real cases with real data.",
        ],
      },
    ],
    name: "Software Development",
    icon: Code2,
    tagline: "Custom software that scales.",
    short: "Bespoke web platforms, internal tools and SaaS products engineered to last.",
    hero: "Custom software built for Nigerian businesses — not a template.",
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
    metaTitle: "Mobile App Development Company in Nigeria",
    metaDescription:
      "iOS and Android apps built from one codebase by H-SETS — designed for Nigerian networks, devices and payment rails, shipped to both stores.",
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
    metaTitle: "AI Automation Services for Nigerian Businesses",
    metaDescription:
      "H-SETS automates the repetitive work draining your team's hours — document handling, customer replies, reporting and data entry — with AI that fits how your business already runs.",
    sections: [
      {
        heading: "Where AI actually pays for itself in a Nigerian business",
        body: [
          "The automation projects that return money are almost never the ambitious ones. They are the quiet, repetitive tasks nobody enjoys and everybody does: copying figures between a bank statement and a spreadsheet, answering the same twelve customer questions, pulling a weekly report together from four sources, reading invoices and typing their contents into another system.",
          "Individually each takes a few minutes. Aggregated across a team and a month, they routinely consume the equivalent of one or two full-time salaries — paid, invisibly, in the time of people you hired to do something more valuable. The first thing we do on an automation engagement is measure that, honestly, so the business case rests on your numbers rather than on a vendor's slide.",
          "The technology has shifted decisively in the last two years. Work that previously needed a rules engine and a developer for every edge case — reading messy documents, classifying free-text requests, drafting a reply that sounds like your business — is now reliably handled by language models called from a short script. What has not changed is that the value comes from choosing the right process, not from the model.",
        ],
      },
      {
        heading: "How an automation engagement runs",
        body: [
          "We start with a process audit: a structured walk through your operations with the people doing the work, timing tasks and mapping where information physically moves between systems and humans. The output is a ranked shortlist of candidate automations with an estimated hours-saved figure and an implementation cost against each.",
          "Then we pilot exactly one. A single process, built and running in production within two to three weeks, measured against the baseline we recorded. A pilot that works makes the case for the next one on evidence; a pilot that does not has cost you weeks rather than a budget cycle. We would rather find out early and cheaply.",
          "Automations are built on tooling your team can see into — n8n or Make for orchestration where that fits, custom code where it does not, with logging on every run. You get a dashboard showing what ran, what succeeded and what needs a human. Nothing operates as a black box, because the fastest way to kill trust in automation is a silent failure nobody catches for a fortnight.",
        ],
      },
      {
        heading: "What we automate most often",
        body: [
          "Document handling leads: invoices, delivery notes, receipts, forms and identity documents read, checked and posted into your accounting or operations system, with anything ambiguous routed to a person rather than guessed at.",
          "Customer communication is next: first-line responses on WhatsApp, email and your website that answer routine questions instantly, and — crucially — hand over to a human the moment the request stops being routine. Done properly this raises satisfaction, because the most common complaint is not \"I spoke to a bot\" but \"nobody replied for two days.\"",
          "Then reporting and data movement: figures gathered from several systems into one scheduled report, reconciliations run overnight, records kept in step between your CRM, accounting and operations tools. And lead handling — enquiries captured, enriched, scored and routed to the right person with the context they need, instead of sitting in a shared inbox until the prospect has bought elsewhere.",
        ],
      },
      {
        heading: "Keeping humans where they belong",
        body: [
          "Every automation we build has an explicit boundary: what it decides on its own, what it drafts for a person to approve, and what it must escalate untouched. Money moving, contractual commitments and anything touching a customer relationship of significance default to human approval. This is not timidity — it is what makes an automation safe to leave running unattended.",
          "We are equally direct about what AI should not do. It should not make hiring or credit decisions unsupervised, it should not invent information to fill a gap, and it should not be handed data your customers did not agree to share. Where a model touches personal data we design for the Nigeria Data Protection Act from the start: minimum necessary data, clear retention limits, and documentation of what goes where.",
          "Your team needs to trust the system to benefit from it. That means training as part of delivery, plain documentation of what each automation does, and a visible way to switch one off. Staff who understand the tool find new uses for it; staff who fear it quietly work around it.",
        ],
      },
      {
        heading: "Cost, timeline and measuring the return",
        body: [
          "A single process automation typically costs less than a month of the salary time it replaces and is live within two to three weeks. A broader programme covering several processes runs two to four months, delivered one process at a time so value arrives continuously rather than at the end.",
          "We report on the metric we agreed at the start — hours returned, response time, error rate, cost per transaction — measured against your recorded baseline. If an automation is not clearing its cost we will tell you to retire it. The goal is a business that runs better, not a longer list of things we built for you.",
        ],
      },
      {
        heading: "What AI still cannot do reliably",
        body: [
          "We are as interested in telling you where this technology fails as in selling you where it works. Language models are unreliable at precise arithmetic, so anything involving money is calculated in code and merely explained by the model. They can state something false with complete confidence, which is why every automation we build that touches published or customer-facing information is grounded in your actual documents and data rather than the model's memory.",
          "They also have no judgement about consequences. A model cannot weigh what it means to lose a ten-year client relationship, so decisions of that weight stay with people — the automation prepares the work and a human approves it. And they do not understand your business by default: quality comes from the context you give them, which is why our engagements spend more time on your documents, processes and edge cases than on model selection.",
          "The practical consequence is that the best automations are narrow. One process, clearly bounded, with a defined escalation path and a measurable result. Broad, open-ended \"AI assistants\" demonstrate well and deliver poorly, because nobody can say what they were supposed to achieve or tell whether they achieved it.",
        ],
      },
      {
        heading: "Getting your data in shape first",
        body: [
          "Automation exposes the state of your records. If the same customer exists three times under slightly different names, or half your invoices are photographs of paper, an automation will process that mess faithfully and at speed. Part of every engagement is an honest look at the data the automation will depend on, and a plan for cleaning what needs cleaning before anything goes live.",
          "This is usually less work than people fear. It is rarely a full data migration — more often deduplicating one customer list, agreeing a single naming convention, or moving a critical spreadsheet into a database where two people cannot overwrite each other. Doing it first is what separates an automation that runs unattended from one that generates a fortnight of corrections.",
          "Where records are genuinely in poor shape, we will sequence the cleanup as its own small phase with its own cost rather than folding it invisibly into the automation quote. You should be able to see what you are paying to tidy up and decide whether it is worth doing now or later.",
        ],
      },
    ],
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
    metaTitle: "AI Agents & Chatbot Development in Nigeria",
    metaDescription:
      "Always-on AI agents from H-SETS that answer customers, qualify leads and handle routine requests across your website, WhatsApp and internal tools.",
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
    metaTitle: "SEO Services & Agency in Nigeria",
    metaDescription:
      "Rank where your customers are searching. H-SETS delivers technical SEO, local search and content that puts Nigerian businesses on page one — and keeps them there.",
    name: "SEO",
    icon: Search,
    tagline: "Get found on Google.",
    short: "Technical and content SEO that earns durable organic traffic.",
    hero: "Rank where your Nigerian customers are searching.",
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
    metaTitle: "Digital Marketing Agency in Nigeria",
    metaDescription:
      "Performance marketing measured in leads, not likes. H-SETS runs paid, social and email campaigns for Nigerian businesses with reporting you can actually act on.",
    name: "Digital Marketing",
    icon: Megaphone,
    tagline: "Demand that converts.",
    short: "Full-funnel campaigns across search, social and email.",
    hero: "Digital marketing for Nigeria, measured in leads — not likes.",
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
    metaTitle: "UI/UX Design Agency in Nigeria",
    metaDescription:
      "Product and interface design from H-SETS — research, prototypes and design systems that make software feel effortless for the people who use it every day.",
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
    metaTitle: "IT Consulting Services in Nigeria",
    metaDescription:
      "Independent technology advice for Nigerian businesses. H-SETS helps you choose systems, plan migrations and spend your technology budget where it returns the most.",
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
    metaTitle: "Digital Transformation Consulting in Nigeria",
    metaDescription:
      "H-SETS modernises how Nigerian businesses run end to end — process, systems, data and team capability — in stages that keep the business trading throughout.",
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
