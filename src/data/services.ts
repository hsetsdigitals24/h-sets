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
      { q: "What does a website cost?", a: "We price per project against fixed deliverables, never per hour. Scope drives the number — a focused marketing site is very different from a site with e-commerce or booking — and you get the price in writing before any work starts." },
      { q: "Will my site rank on Google?", a: "The foundations are built in: clean semantic structure, schema markup, a valid sitemap, canonical tags, fast mobile performance and location pages where they apply. Ranking for competitive terms then depends on ongoing content and authority work, which we can take on separately." },
      { q: "What happens if I want to change something after launch?", a: "Small edits you make yourself in the CMS. Larger changes we quote as a small piece of work. There is no retainer you must hold to keep your own site editable." },
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
      { q: "Should we buy an off-the-shelf product instead?", a: "Sometimes, and we will say so. If an existing product covers most of what you need at a fraction of a custom build, buying and configuring it is the right answer. We build custom where the fit genuinely is not there — usually because the process is what makes the business work." },
      { q: "Who owns the code?", a: "You do, from day one. Repositories, infrastructure accounts and documentation are yours and hand over at the end of the engagement." },
      { q: "How do you handle changes mid-project?", a: "Delivery runs in short cycles with something reviewable at the end of each, so changes surface early and get priced as they arise rather than accumulating into a dispute at the end." },
    ],
    related: ["mobile-apps", "ai-automation", "it-consulting"],
  },
  {
    slug: "mobile-apps",
    metaTitle: "Mobile App Development Company in Nigeria",
    metaDescription:
      "iOS and Android apps built from one codebase by H-SETS — designed for Nigerian networks, devices and payment rails, shipped to both stores.",
    sections: [
      {
        heading: "Most businesses do not need an app — the ones that do, need it badly",
        body: [
          "The honest starting point is that a mobile app is the wrong answer more often than it is the right one. If what you have is a marketing problem, a responsive website will reach more people for a fraction of the cost and without asking anyone to install anything. Install friction is real: every step between hearing about you and using you loses a share of the audience, and an app store listing is several steps.",
          "Apps earn their cost in a narrower set of situations, and they earn it decisively. When usage is habitual rather than occasional — a daily check, a weekly order, a shift log — the icon on the home screen is worth more than any amount of retargeting. When you need the device itself, for camera capture, GPS, biometrics, Bluetooth hardware or offline storage, the browser will not take you all the way. When you need to reach a user who is not currently looking at you, a push notification is the only reliable channel. And when staff use a system all day in the field, a native app is simply faster and less frustrating than a web page over a patchy connection.",
          "We start every mobile conversation by testing your case against that list, in writing, before quoting anything. Talking a client out of an app they did not need has cost us projects and earned us better ones.",
        ],
      },
      {
        heading: "One codebase, two stores, no compromise where it counts",
        body: [
          "We build cross-platform with React Native, which means a single codebase ships to both iOS and Android instead of funding two separate teams writing the same product twice. For the overwhelming majority of business apps this is not a compromise — the shared code covers the screens, the navigation, the state and the networking, which is most of the app.",
          "Where the platforms genuinely differ we write native code rather than pretending they do not. Biometric authentication, push notification registration, background location, secure storage and payment sheets all touch platform-specific behaviour, and each gets a proper native implementation behind a shared interface. The result behaves like an app built for that platform, because in the places users can feel, it is.",
          "The economics follow from that structure. One team, one release process, one set of business logic to test, and features that ship to both platforms in the same sprint rather than one lagging a quarter behind the other. For a Nigerian business funding its first app, that difference frequently decides whether the project happens at all.",
        ],
      },
      {
        heading: "Designing for the phone your customer actually holds",
        body: [
          "The single most common failure in Nigerian mobile apps is that they were designed on a recent iPhone and used on a three-year-old Android with 32 GB of storage and an intermittent connection. A bundle that is casually large gets uninstalled the first time the phone runs out of space. A screen that assumes a live connection shows a spinner in the exact moments it is needed most.",
          "So we optimise for constraint. Install size is a design target, not an afterthought. Every screen has a defined offline behaviour — cached data, queued writes, an honest message — rather than an infinite loader. Data usage is kept deliberately low, because a customer who notices your app eating their bundle will uninstall it and will not tell you why. And we test on real mid-range Android hardware, not only on simulators, because a simulator will never show you what a cold start feels like on the device your customers own.",
          "Payments follow the same principle. Paystack and Flutterwave integration covers card, bank transfer and USSD, so a user without a working card is not simply turned away at checkout.",
        ],
      },
      {
        heading: "Launch is the start, not the finish",
        body: [
          "Getting into the stores is procedural work that catches first-time publishers out constantly: developer accounts, signing keys, privacy policies, data-safety declarations, review guidelines, and a rejection cycle that can cost weeks if the submission is careless. We manage the whole submission process and hold the keys in your accounts, not ours — an app whose signing key lives with an agency is an app that agency effectively owns.",
          "After release you get crash reporting, analytics on the flows that matter and a release process that lets you ship updates without a full store review for anything the platform allows. Most apps earn their return in the second and third releases, once real usage data replaces assumptions, so we scope the first version to be small enough to learn from rather than large enough to be right first time.",
          "Ongoing, you can retain us for maintenance and feature work or take the codebase in-house. It is documented, conventionally structured and written to be handed over — including to developers trained through the H-SETS Academy.",
        ],
      },
      {
        heading: "What an app project costs, and where the money actually goes",
        body: [
          "The first surprise for most first-time app owners is that the build is not the whole cost. There are two developer accounts to maintain, a backend to host, push notification infrastructure, crash reporting, and — crucially — an ongoing obligation to keep up with the platforms. Apple and Google both ship breaking changes on their own schedule, and an app left untouched for eighteen months will eventually stop being accepted for update, or stop working on the newest devices. Budgeting for the build alone and nothing after it is the single most common way an app project ends up abandoned.",
          "We quote those running costs explicitly at the start, separated from the build, so you can see the real annual figure before committing. For most business apps it is modest — but it is not zero, and discovering it in month seven is a bad way to find out.",
          "On the build itself, the way to control cost is scope discipline rather than cheaper delivery. A first release that does one job properly costs a fraction of one that attempts everything, launches sooner, and — more importantly — produces real usage data before the expensive decisions are made. Nearly every feature list we are handed at the start contains items that turn out to matter far less than assumed, and items nobody thought of that turn out to be the reason people open the app. Shipping a focused first version is how you find out which is which without paying to build both.",
          "So we scope release one deliberately small, instrument it properly, and plan the budget across two or three releases rather than one. That sequencing is not a way of charging more over time; it is a way of spending the same money on the features that turn out to earn it.",
        ],
      },
      {
        heading: "Who we build for",
        body: [
          "The apps we are asked for most often fall into three groups. Customer-facing apps for businesses with repeat custom — ordering, booking, loyalty, account management — where the habit is what justifies the icon. Field and operations apps for staff who work away from a desk, where offline capture, photographs, signatures and location data are the whole point. And fintech-adjacent products where security, biometrics and payment integration set a bar a web app cannot reach.",
          "Across all three the deciding factor is the same: whether the app will be opened repeatedly by the same person. If the honest answer is that most users will open it once, we will tell you that a well-built mobile web experience is the better investment — and we would rather say it before the quote than after the launch.",
        ],
      },
    ],
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
      { q: "Do we actually need an app, or would a website do?", a: "Often a website does. Apps earn their cost when usage is habitual, when you need device features like camera, GPS or biometrics, when push notifications matter, or when staff use it all day in the field. We test your case against that list in writing before quoting." },
      { q: "iOS and Android — do we pay twice?", a: "No. We build cross-platform with React Native so one codebase ships to both stores, writing native code only where the platforms genuinely differ." },
      { q: "Who handles App Store and Play Store submission?", a: "We do, end to end — developer accounts, signing, privacy and data-safety declarations, and the review cycle. The accounts and signing keys are created in your name, not ours." },
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
      { q: "How do we know it is worth it?", a: "The automation audit quantifies the hours a workflow currently consumes before anything is built, so the return is estimated against real numbers rather than assumed. If a workflow does not clear the bar, we say so." },
      { q: "What happens when the automation gets something wrong?", a: "Every workflow has a defined failure path — it stops, flags a human and preserves the record rather than silently proceeding. Anything consequential requires a human confirmation step by design." },
      { q: "Do we need to replace our existing tools first?", a: "Usually not. Most modern tools have an API, and integrating what you already use is faster and cheaper than replacing it. We only recommend replacing a tool when it genuinely cannot be connected." },
    ],
    related: ["ai-agents", "software-development", "digital-transformation"],
  },
  {
    slug: "ai-agents",
    metaTitle: "AI Agents & Chatbot Development in Nigeria",
    metaDescription:
      "Always-on AI agents from H-SETS that answer customers, qualify leads and handle routine requests across your website, WhatsApp and internal tools.",
    sections: [
      {
        heading: "The problem is not that customers hate bots",
        body: [
          "The received wisdom is that customers resent talking to automated systems. That is not quite what the complaints actually say. Go through a month of a typical Nigerian business's support messages and the recurring grievance is not \"I had to speak to a bot\" — it is \"nobody replied for two days\", \"I asked three times\", \"I had to explain it again to a different person\". The failure is absence, not automation.",
          "A well-built agent fixes exactly that failure. It answers instantly, at 11pm, on a public holiday, to the fortieth person asking the same question about delivery timelines — and it does so accurately, because it is answering from your actual policies rather than improvising. Satisfaction goes up, not down, because the alternative was never a prompt human reply. The alternative was silence.",
          "The agents that do earn resentment share one trait: they trap people. A loop with no exit, no handover, no way to reach a person when the request stops being routine. That is a design failure and an entirely avoidable one, and it is the first thing we design around.",
        ],
      },
      {
        heading: "Grounded answers, and a human on the other side of the door",
        body: [
          "Our agents are grounded in your content: policies, pricing, product documentation, past support threads and whatever else defines the correct answer. Retrieval happens before generation, so responses are drawn from your material rather than from a model's general impression of how a business like yours might operate. Where the source does not cover a question, the agent says so instead of inventing something plausible — a confident wrong answer about a refund policy costs far more than an admission of uncertainty.",
          "Every agent has an explicit escalation path. Defined triggers — a complaint, a payment dispute, a request outside scope, repeated failure to resolve, or simply the user asking for a person — hand the conversation to a human with the full transcript attached, so nobody has to start again. The agent's job is to clear the routine eighty percent so your team has time for the twenty percent that needs judgement.",
          "Boundaries are configured explicitly too. What the agent may commit to, what it may discount, what it must never state, what requires approval. An agent that can promise a delivery date it cannot keep is a liability, and the constraint belongs in the configuration rather than in a hope that the model behaves.",
        ],
      },
      {
        heading: "Where they run: WhatsApp first",
        body: [
          "For most Nigerian businesses the highest-value channel is WhatsApp, by a wide margin. It is where customers already are, where they expect a reply, and where an unanswered message quietly becomes a lost sale. We deploy agents there through the official WhatsApp Business API, alongside your website, email and internal tools, so one agent with one set of knowledge serves every channel rather than three inconsistent versions drifting apart.",
          "Internally, the same architecture answers staff questions over your own documentation — policies, process, product details, historical decisions. New employees stop interrupting senior colleagues for things that are written down somewhere nobody can find, which is a quieter benefit than customer support but often a larger one.",
          "Beyond answering, agents can act: create a ticket, check an order, book a slot, update a record, trigger a workflow. Each action is scoped and permissioned deliberately, and anything consequential requires a human confirmation step.",
        ],
      },
      {
        heading: "Measured, reviewed and improved",
        body: [
          "Every conversation is logged and reviewable. You see resolution rate, escalation rate, the questions the agent could not answer, and where users abandoned. That last category is the valuable one: the unanswered questions are a direct list of the gaps in your documentation, and closing them improves the agent and your human team at the same time.",
          "We start narrow on purpose. One channel, one clearly bounded set of questions, measured for a few weeks against what the agent is replacing. Scope expands once the data says it should. An agent launched everywhere at once, answering everything, is an agent nobody can evaluate and everybody eventually distrusts.",
          "Costs are transparent: model usage, channel fees and support are quoted separately so you can see what the running cost per conversation actually is, and compare it honestly against the staff time it displaces.",
        ],
      },
      {
        heading: "Building one: how an engagement actually runs",
        body: [
          "The first phase is knowledge, not technology. We gather the material the agent will answer from — policies, pricing, product documentation, delivery terms, opening hours, refund rules — and, almost always, discover that a good share of it exists only in the heads of two or three experienced staff. Writing that down is genuinely useful work in itself: it is the same material a new employee needs, and most businesses have never had a reason to produce it.",
          "The second phase defines boundaries. What may the agent commit to? What may it never state? What requires a human? What happens when someone is angry, or asking about a payment that has gone wrong, or requesting something outside scope entirely? These are business decisions rather than technical ones, and getting them written down before launch is what separates an agent that helps from one that creates problems the support team then has to clean up.",
          "The third phase is a narrow pilot. One channel, one bounded set of questions, running alongside your existing process rather than replacing it, measured for a few weeks against how those questions were handled before. We review the transcripts together — particularly the failures, which are the most informative part — and tighten the knowledge and the boundaries before widening scope.",
          "Only then does it expand: more question types, more channels, and where it makes sense, the ability to take actions rather than only answer. Each expansion is scoped and measured the same way. An agent launched everywhere at once, answering everything, is one nobody can evaluate and everybody eventually stops trusting — and regaining that trust internally is much harder than earning it incrementally in the first place.",
        ],
      },
      {
        heading: "What it costs to run",
        body: [
          "Agent economics have three components and we quote them separately so none of them arrives as a surprise. There is the build — knowledge preparation, configuration, integration and testing. There is the running cost, which is model usage plus any channel fees, and which scales with conversation volume rather than sitting flat. And there is support: reviewing transcripts, closing knowledge gaps and adjusting boundaries as the business changes.",
          "The comparison that matters is not the absolute figure but the cost per resolved conversation against what that resolution currently costs in staff time. For high-volume, highly repetitive enquiries the gap is usually large and obvious. For low-volume, high-judgement work it frequently is not, and in those cases an agent is the wrong investment — we would rather establish that during scoping than after a build.",
          "Running costs also fall over time as the knowledge base tightens and fewer conversations need long retrieval or escalation. We report the actual per-conversation figure monthly rather than estimating it once at the start, so the business case stays a live number rather than a proposal slide.",
        ],
      },
    ],
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
      { q: "Will customers know they are talking to an AI?", a: "Yes — we label it clearly. Concealing it damages trust the moment anybody notices, and the honest version performs better anyway because expectations are set correctly." },
      { q: "What stops it from inventing an answer?", a: "Responses are grounded in your own content through retrieval, and the agent is configured to say it does not know rather than improvise. Where the source does not cover a question, it hands over to a person with the transcript attached." },
      { q: "Can it work on WhatsApp?", a: "Yes, through the official WhatsApp Business API, alongside your website, email and internal tools — one agent with one set of knowledge across every channel." },
    ],
    related: ["ai-automation", "software-development", "mobile-apps"],
  },
  {
    slug: "seo",
    metaTitle: "SEO Services & Agency in Nigeria",
    metaDescription:
      "Rank where your customers are searching. H-SETS delivers technical SEO, local search and content that puts Nigerian businesses on page one — and keeps them there.",
    sections: [
      {
        heading: "Why organic search is the only channel that gets cheaper",
        body: [
          "Paid advertising has one structural problem: the day you stop paying, the leads stop the same afternoon. Every enquiry costs what the auction says it costs, and the auction gets more expensive as more competitors enter it. Nothing you spent last year reduces what this year costs.",
          "Organic search works the opposite way. A page that ranks keeps producing enquiries at no marginal cost, and the authority it earns makes the next page easier to rank. The investment compounds instead of evaporating. For a Nigerian business with a long sales cycle and a cost-per-lead that keeps climbing, that difference is usually the whole argument.",
          "The trade-off is honest: search is slower to start. Technical fixes show up in weeks, but content authority builds over three to six months. Anyone promising page one in thirty days for a competitive commercial term is describing something that does not happen. We would rather set that expectation at the start than manage a disappointment in month two.",
        ],
      },
      {
        heading: "The technical foundation almost nobody has",
        body: [
          "A great deal of Nigerian SEO spend goes into content that sits on a site Google struggles to crawl, render or trust. Before any content work is worth commissioning, the foundation has to hold: a site that loads quickly on mobile, clean crawlable URLs, a valid sitemap, sensible robots directives, canonical tags that resolve duplicate content, structured data that describes what each page is, and Core Web Vitals inside Google's thresholds.",
          "Structured data deserves particular attention because so few competitors implement it. Organization and LocalBusiness markup, FAQPage, Service, Article, Course, JobPosting, BreadcrumbList — each is a direct statement to Google about what a page is and how it relates to everything else. Sites with correct, comprehensive schema earn rich results their competitors cannot, and increasingly they are the sites that get retrieved and cited by AI answer engines.",
          "We start every engagement with a full technical audit and fix what it finds before writing a word of content. Publishing into a broken foundation is the most common way an SEO budget disappears with nothing to show for it.",
        ],
      },
      {
        heading: "Content built around what buyers actually search",
        body: [
          "Topical authority is earned by covering a subject properly, not by publishing frequently. Google's assessment of whether you are a credible source for a topic depends on whether your site answers the full range of questions a person researching that topic asks — including the unglamorous, low-volume ones that convert best.",
          "So we map the subject rather than chase keywords one at a time: the commercial terms, the comparison queries, the practical how-to questions, the objections people raise before buying, and the definitional content that catches someone early. Then we link them deliberately, so the cluster reinforces itself and a visitor who arrives on any page can find the rest.",
          "For local businesses the highest-return content is usually geographic. \"Service in city\" terms have real commercial intent and, across most of Nigeria outside Lagos, almost no serious competition. A properly built location page can rank within a couple of months where a national term would take a year.",
        ],
      },
      {
        heading: "AI search is a second front, and it is already open",
        body: [
          "A growing share of commercial research now begins in ChatGPT, Perplexity or Gemini rather than a search box, and those systems retrieve and cite sources differently. They favour content that states things plainly, is well structured, carries clear entity markup and reads as authoritative on a specific subject — and they are far less influenced by the link-building tactics that shaped classic SEO.",
          "In practice the work overlaps heavily with doing search properly: unambiguous factual statements, comprehensive schema, clean semantics, named authors with verifiable credentials, and content that answers a question completely rather than teasing a call. We build for both at once, because optimising separately for AI citation is largely a repackaging of what good search work already requires.",
          "We track branded and category citations in the major AI engines alongside conventional rankings, so the reporting reflects where discovery is actually happening rather than only where it used to.",
        ],
      },
      {
        heading: "Reported honestly, and your accounts stay yours",
        body: [
          "Reporting is tied to outcomes: enquiries, calls, form submissions and rankings for the specific commercial terms that produce them. Impressions and average position appear as diagnostics. If something went backwards, the report says so and says why, because a report that is always good news is not a report.",
          "Search Console, Analytics and the Google Business Profile are created and verified in your name. You can check every number we give you, and if you end the engagement you keep the history rather than starting from zero. We would rather earn the next month than hold the data hostage.",
        ],
      },
      {
        heading: "What the first ninety days look like",
        body: [
          "The first two to three weeks are audit and fix. We crawl the site, check what Google has actually indexed against what should be indexed, and work through the technical list: page speed and Core Web Vitals, crawl errors, redirect chains, duplicate content and missing canonicals, broken internal links, thin or accidentally noindexed pages, and structured data. This is unglamorous and it is where the fastest wins usually sit, because a site frequently has pages that would rank and simply cannot be reached or understood.",
          "In parallel we do the local work where it applies: claiming and completing the Google Business Profile, reconciling every listing to one exact name-address-phone string, and adding LocalBusiness markup to the site. For a business with a physical location this often produces the first measurable movement, because map-pack visibility responds in weeks rather than months.",
          "Weeks four to eight are structure and content. We map the topic properly — commercial terms, comparisons, practical questions, objections — and build out the pages that are missing, with internal linking that makes the cluster coherent rather than a set of orphans. Existing pages that are close to ranking get rewritten and expanded first, because improving a page Google already knows is faster than earning trust in a new one.",
          "From week eight onward it is publication cadence, measurement and iteration: what gained impressions, what gained position without gaining clicks, which pages convert and which attract traffic that never enquires. By day ninety you should have a clear read on which terms are winnable and what the realistic timeline for each is — and, in local markets, usually the first enquiries attributable to organic search.",
        ],
      },
      {
        heading: "How we work with your team",
        body: [
          "SEO is one of the few disciplines where the client's own knowledge is a genuine competitive input. Your sales team knows the objections buyers raise, the questions that come up in every call, and the terms customers use that no keyword tool will surface because nobody has typed them at volume yet. That material is the difference between content that ranks and content that also converts.",
          "So engagements include a short recurring session with whoever talks to customers — usually under an hour a month. We bring the data on what is being searched and what is ranking; they bring what is actually being asked. The content plan comes out of the overlap.",
          "Where you have an in-house marketer or writer, we are happy to hand over production entirely and stay on strategy, briefs and technical work. That is usually the cheapest effective arrangement and we will suggest it where it fits, rather than quoting for production you could do better and cheaper yourself.",
        ],
      },
    ],
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
      { q: "Do you guarantee a number one ranking?", a: "No, and nobody credible does — Google neither sells nor promises positions. We commit to defined deliverables, honest reporting, and a frank assessment of how winnable your target terms are before you spend anything." },
      { q: "Do we own the accounts?", a: "Yes. Search Console, Analytics and your Google Business Profile are created and verified in your name, so you can audit every number we report and keep the history if you leave." },
      { q: "Can you help with local search specifically?", a: "It is often the highest-return work we do. Google Business Profile, consistent NAP details, LocalBusiness schema and location pages — in most Nigerian markets outside Lagos, competition for local terms is thin enough to win quickly." },
    ],
    related: ["digital-marketing", "website-development", "it-consulting"],
  },
  {
    slug: "digital-marketing",
    metaTitle: "Digital Marketing Agency in Nigeria",
    metaDescription:
      "Performance marketing measured in leads, not likes. H-SETS runs paid, social and email campaigns for Nigerian businesses with reporting you can actually act on.",
    sections: [
      {
        heading: "Reach is not revenue",
        body: [
          "The standard agency arrangement in Nigeria is a monthly fee, a stream of posts and a report full of reach, impressions and follower growth. None of those numbers answer the only question that matters: did the money produce customers? Six months in, most business owners genuinely cannot say, and the reason is that nothing in the arrangement was ever connected to an enquiry.",
          "We invert the order. Before anything runs, we agree what a customer is worth to you, where your enquiries currently come from, and how a lead will be tracked from first click through to signed business. That means the measurement infrastructure goes in first — event tracking, call tracking, WhatsApp click attribution, form submissions and offline conversion import for deals that close in person or over the phone.",
          "Once that exists, every subsequent decision has an evidence base. A channel that produces impressions and no enquiries gets cut rather than optimised indefinitely, and a channel that works gets more budget. Without it, every decision is a preference dressed as a strategy.",
        ],
      },
      {
        heading: "WhatsApp is the conversion surface",
        body: [
          "For most Nigerian buyers — B2B and consumer alike — the first contact attempt is a WhatsApp message, not a contact form. A funnel that treats WhatsApp as an afterthought is leaking its highest-intent traffic at the last step, and it is one of the most common and most expensive mistakes we see in campaigns we inherit.",
          "So we build for it deliberately. Click-to-WhatsApp as a first-class campaign objective, entry points on every page with a pre-filled message carrying the page context so the conversation starts with something concrete, and click events tracked as conversions so the reporting can attribute them. Then, on your side, a response process — because an instant click into a chat that sits unanswered for two days is worse than no button at all.",
          "Where volume justifies it, we automate the first response so nobody waits, with a clean handover to a person the moment the request stops being routine.",
        ],
      },
      {
        heading: "Paid and organic, sequenced rather than chosen",
        body: [
          "Paid and organic are not alternatives, they are different points on the same timeline. Paid buys enquiries now, at a price that never falls. Organic takes months to arrive and then produces enquiries at effectively no marginal cost. A business that runs only paid is renting demand forever; a business that runs only organic has nothing while it waits.",
          "So we usually sequence them: paid campaigns to produce enquiries and, just as importantly, to generate data about which messages and audiences convert — then search and content work informed by that data, so the organic effort targets what is already proven to sell rather than what we guessed would.",
          "For local businesses this sequencing is especially effective, because paid social in a market like Ilorin or Kwara is cheap enough to buy real learning quickly, and the local organic terms it points you at are cheap enough to win.",
        ],
      },
      {
        heading: "Creative made here, for here",
        body: [
          "Campaign performance in Nigerian markets is driven by creative more than by targeting, and locally produced creative consistently outperforms stock imagery and imported templates. Audiences recognise the difference immediately — a photograph of an office nobody in the country has ever been in reads as a stock photograph, and it converts like one.",
          "We produce the work: copy, design, photography and short-form video shot with your team, your premises and your customers. It costs more than a stock library and it is almost always the highest-leverage line in the budget.",
          "Everything is versioned and tested rather than published once. Several hooks, several formats, a real read on which combination produces enquiries at the lowest cost — then budget consolidated behind what wins.",
        ],
      },
      {
        heading: "How the engagement runs",
        body: [
          "An initial setup engagement covers tracking, account structure, audience build and the first creative. After that we work month to month. We do not ask for long lock-ins — an agency that needs a twelve-month contract to retain a client is telling you what month four looks like.",
          "Every account is created and verified in your name: ad accounts, pixels, analytics, business profile. Audiences you have paid to build stay yours. Reporting is one document a month, in plain language, covering enquiries generated, what each cost, which channel produced them, and what we are changing next.",
        ],
      },
      {
        heading: "The channels, and when each is worth funding",
        body: [
          "Meta advertising is usually the fastest route to volume in Nigerian consumer and local service markets. Audiences are cheap relative to search, targeting by location and interest is precise enough for a business whose customers are all within driving distance, and creative testing produces usable answers within days. Its weakness is intent: you are interrupting someone rather than meeting a stated need, so it works best where the offer is easy to understand in three seconds.",
          "Google Search advertising is the opposite trade. You are reaching someone who has already described what they want, so conversion rates are far higher — and so is the cost per click, particularly for competitive commercial terms. It earns its place where the average customer is valuable enough to absorb that cost, and where the volume of people actively searching is large enough to matter.",
          "LinkedIn is narrow and expensive and occasionally exactly right, when what you sell is bought by a specific job title at a specific size of company. For most Nigerian SMEs it is not, and we will say so rather than adding it to a proposal because it looks thorough.",
          "Email remains the highest-return channel almost everywhere and is the one most businesses neglect. A list you own, contacted with something genuinely useful rather than a monthly newsletter nobody asked for, costs almost nothing per send and converts better than any paid channel. It only works with something worth opening, which is why it lives alongside the content and resource work rather than separately from it.",
          "We recommend the mix based on what your buyers actually do, and we are explicit about what we are not recommending and why. A proposal that includes every channel is a proposal written to look comprehensive rather than to work.",
        ],
      },
      {
        heading: "What we need from you",
        body: [
          "The campaigns that work have one thing in common: the client was reachable. Not heavily involved — reachable. Creative needs approval within days rather than weeks, because a test that waits a fortnight for sign-off is a fortnight of budget spent on the old version. Enquiries need answering quickly, because paid traffic is perishable and a lead that waits two days converts at a fraction of one answered in an hour.",
          "We also need honesty about what happens after the enquiry. If leads are arriving and not closing, the campaign is frequently not the problem — the follow-up is, or the offer is, or the price is. An agency that never raises this keeps billing while the client concludes marketing does not work for them. We would rather have the uncomfortable conversation in month two.",
          "Practically, that means a named person on your side who can approve creative and see the enquiry data, and a monthly review of an hour. Everything else is ours to run.",
          "And if the honest answer after a fair test is that paid acquisition is not the right growth lever for your business right now, we will say that too. Some businesses grow faster by fixing their follow-up, their pricing or their referral process than by buying more traffic, and spending a retainer to discover that slowly is the worst outcome for both of us. We would rather lose a month of billing than spend a year producing enquiries you cannot convert.",
        ],
      },
    ],
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
      { q: "How do you measure success?", a: "Cost per enquiry, and the enquiries themselves — calls, forms and WhatsApp conversations tracked from first click through to closed business, including deals that close offline." },
      { q: "Do we own the ad accounts and audiences?", a: "Always. Ad accounts, pixels and audiences are created and verified in your name. If you leave, the history and the audiences go with you." },
      { q: "Is there a minimum contract?", a: "No. After an initial setup engagement we work month to month. An agency that needs a long lock-in to keep clients is telling you what month four looks like." },
    ],
    related: ["seo", "website-development", "ui-ux-design"],
  },
  {
    slug: "ui-ux-design",
    metaTitle: "UI/UX Design Agency in Nigeria",
    metaDescription:
      "Product and interface design from H-SETS — research, prototypes and design systems that make software feel effortless for the people who use it every day.",
    sections: [
      {
        heading: "Design is where revenue is won or lost, quietly",
        body: [
          "Design tends to be discussed as appearance, which is why it is usually the first budget cut and the last thing measured. But the decisions that determine whether a product earns money are design decisions: how many fields stand between a visitor and an enquiry, whether the primary action is obvious on a small screen, whether an error message tells someone how to fix the problem, whether a returning user can find the thing they came for in one step or four.",
          "Those are not aesthetic questions and their cost is entirely measurable. A checkout that asks for information it does not need loses a predictable share of buyers at every extra field. A dashboard that buries the action staff perform forty times a day costs the business real hours every week. A form that rejects a valid Nigerian phone number because it was validated against a US format loses the enquiry outright and nobody ever finds out.",
          "We design against those outcomes. Every screen has a defined job and a measurable success action, and anything that does not serve it is a candidate for removal rather than refinement.",
        ],
      },
      {
        heading: "Research first, even when it is brief",
        body: [
          "Good design starts by understanding what people are actually trying to do, which is frequently not what the brief assumes. That does not require a research budget the size of the build. Interviewing five or six real users, watching support tickets for a fortnight, or sitting with the staff who use the current system for an afternoon reliably surfaces more than a month of internal debate.",
          "The recurring finding is that users are working around something. A spreadsheet kept in parallel because the system will not do one thing. A step done twice because nobody trusts the first. Those workarounds are the map: they show exactly where the current experience fails, and designing them away is usually where the biggest gains sit.",
          "We write down what we learn and what we are therefore deciding. A design decision with a documented reason can be revisited sensibly later; one made on taste alone gets relitigated every time somebody new sees it.",
        ],
      },
      {
        heading: "Designed for the device, the connection and the context",
        body: [
          "In Nigeria the realistic baseline is a mid-range Android phone on mobile data, often in bright sunlight, often one-handed, sometimes on a connection that drops mid-task. A design that only works on a desktop monitor in an office is a design that works for the people who commissioned it and nobody else.",
          "That baseline has concrete consequences. Tap targets sized for thumbs. Contrast that survives direct sun rather than merely passing a contrast checker in a dark room. Forms that save progress, because a dropped connection halfway through a long form loses both the data and the customer. Skeleton states and honest loading feedback instead of a spinner with no end. And weight kept down, because the most elegant interface in the world is useless if it has not painted yet.",
          "Accessibility is part of the same discipline rather than a compliance exercise bolted on at the end. Keyboard navigation, sensible focus order, real labels, semantic structure and WCAG 2.1 AA contrast — all of which also make the interface better for people using it in a hurry on a bad screen.",
        ],
      },
      {
        heading: "Systems, not screens",
        body: [
          "We deliver a design system rather than a folder of mockups: tokens for colour, type, spacing and elevation; documented components with their states; and usage rules explaining when each applies. The reason is durability. A set of individual screens degrades the moment someone has to design the fifteenth one that was never drawn — and someone always does.",
          "The system is built to be implemented, not admired. Tokens map to the CSS variables and Tailwind configuration the engineers will actually use, components correspond to real component boundaries, and the hand-over includes the states designers habitually skip: loading, empty, error, permission-denied, too-long-text, and the first-run case where the user has no data at all.",
          "Where we are also building the product, design and engineering run together rather than sequentially, which removes the translation loss that produces a shipped product noticeably worse than its mockups.",
        ],
      },
      {
        heading: "How a design engagement runs, and what it costs you in time",
        body: [
          "Design work fails most often not because the designer was wrong but because the decisions took three weeks each. So we structure engagements around a small number of scheduled decision points with named people attending, rather than an open-ended review process where feedback arrives piecemeal from whoever happens to see a link.",
          "A typical engagement opens with a discovery week: interviews with real users or staff, a review of your analytics and support tickets, an audit of the current experience, and a written statement of what we are designing for and how we will know it worked. That document is short, and agreeing it is the single highest-leverage hour in the project — most disagreements later turn out to be disagreements about this, discovered late.",
          "From there we work in cycles: structure and flows first, reviewed as low-fidelity wireframes where the conversation stays about what goes where rather than about colour; then visual design against agreed direction; then the system, components and states. Each cycle ends with a review session and a written record of what was decided and why. Clients consistently tell us the decision record is the part they did not expect to value and then refer back to for years.",
          "Your time commitment is real but bounded: a few hours in discovery, then roughly an hour per review cycle from the people who can actually decide. The most expensive projects we have run are the ones where the decision-maker delegated reviews and then reversed them in week nine. We would rather have three of the right people for an hour than nine of the wrong ones for three.",
        ],
      },
      {
        heading: "Design that survives contact with engineering",
        body: [
          "A depressing amount of design work never reaches users in the form it was drawn. Mockups get handed over, engineers hit cases the designs did not cover, decisions get made under deadline pressure, and the shipped product is a degraded copy of the file everyone approved. The design was not wrong; the hand-over was.",
          "We reduce that gap structurally. Designs are built on tokens that map directly to the CSS variables and Tailwind configuration the engineers will use, so spacing and colour are not reinterpreted. Components correspond to real component boundaries rather than visual groupings. And the states that get skipped in mockups — loading, empty, error, permission-denied, very long text, no data on first run — are specified, because those are precisely the cases where an engineer under deadline pressure has to improvise.",
          "Where we are also building the product, design and engineering run in the same team and the same cycle, which removes the hand-over entirely. Where another team is implementing, we stay available through the build for the questions the documentation did not anticipate — and there are always some.",
          "Finally, we design with the assumption that the product will keep changing. Screens get added, features get cut, someone joins in a year and has to extend the work without being able to ask us anything. A documented system with stated reasoning survives that; a beautiful set of screens with no rules behind them does not, and the difference shows up about eighteen months after launch when nobody can remember why anything is the way it is.",
        ],
      },
    ],
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
      { q: "What do we actually receive at the end?", a: "A design system, not a folder of pictures: tokens for colour, type and spacing, documented components with their states, and usage rules — plus the states that usually get skipped, including loading, empty, error and first-run." },
      { q: "Can you work with our existing brand?", a: "Yes. Where a brand exists we design within it and extend it where it has gaps. Where it does not, or where it is actively hurting the product, we will say so and quote that work separately." },
      { q: "Do you handle accessibility?", a: "Yes — WCAG 2.1 AA as a baseline: keyboard navigation, focus order, real labels, semantic structure and contrast that survives direct sunlight, not just a checker in a dark room." },
    ],
    related: ["website-development", "mobile-apps", "software-development"],
  },
  {
    slug: "it-consulting",
    metaTitle: "IT Consulting Services in Nigeria",
    metaDescription:
      "Independent technology advice for Nigerian businesses. H-SETS helps you choose systems, plan migrations and spend your technology budget where it returns the most.",
    sections: [
      {
        heading: "The cost of the decisions nobody wrote down",
        body: [
          "Most of the expensive technology problems we are called in to fix did not start as bad code. They started as a reasonable decision made quickly, by someone who had to choose that week, without anybody recording why. Two years later the reason is forgotten, the circumstances have changed, and the business is paying for a choice nobody can defend or safely reverse.",
          "The symptoms are familiar. Four systems that each hold a slightly different version of the customer list. A licence renewal for software three people use. A vendor who is the only person who knows how something works. A platform chosen because a competitor used it. None of these are dramatic failures; together they are a substantial, permanent tax on everything the business tries to do.",
          "Consulting is the work of stopping that accumulation: making the current state explicit, deciding deliberately what to fix, and writing down the reasoning so the next person inherits a decision rather than a mystery.",
        ],
      },
      {
        heading: "What an engagement actually produces",
        body: [
          "We start with an assessment: what systems you run, what they cost, who depends on them, where the data lives, which integrations exist, where the single points of failure are, and what your team can realistically support. This is done by talking to the people who use the systems, not only the people who bought them — the gap between those two accounts is usually where the real problems are.",
          "The output is a written document you own: current state, risks ranked by the damage they would do, a prioritised plan with effort and cost against each item, and a clear statement of what to do now, what to schedule and what to leave alone deliberately. That last category matters. A consultant who recommends replacing everything is usually quoting for the replacement.",
          "Where a decision is genuinely close, we say so and set out the trade-off rather than manufacturing certainty. Build or buy, migrate or maintain, hire or outsource — these are business decisions with technical inputs, and the person accountable for the outcome should be making them with the real picture in front of them.",
        ],
      },
      {
        heading: "Independent advice, and what that costs us",
        body: [
          "We take no vendor commissions or referral fees. If the right answer is an off-the-shelf product at a fraction of what a custom build would cost, that is the recommendation, and it means we do not get the build. We have made that recommendation often enough to know it is commercially expensive and reputationally worth it.",
          "It also means our advice can be checked. Every recommendation comes with its reasoning and the alternatives we rejected, so you can take the document to another party for a second opinion. Advice that only makes sense if you trust the adviser is not advice, it is a sales process.",
          "Where we are the right party to implement, we quote that separately and explicitly, so the consulting fee is never a foot in the door for a build you were steered toward.",
        ],
      },
      {
        heading: "Security, continuity and the questions nobody asks until it is too late",
        body: [
          "Two questions expose more risk than any audit checklist: what happens if your main system goes down on a Monday morning, and what happens if the one person who understands it leaves. In most growing Nigerian businesses the honest answers are uncomfortable — no tested backup, no documentation, no second person, and no plan beyond hoping.",
          "We work through the unglamorous fundamentals: backups that are actually restorable and have been restored in a test, access control so departures do not leave live credentials behind, documentation of the systems that matter, an incident plan somebody has read, and a realistic view of which data would hurt you most if it leaked. None of it is exciting and all of it is cheaper than the alternative.",
          "Where compliance matters — data protection obligations, sector regulation, client security requirements in tender processes — we map what applies to you specifically rather than handing over a generic framework, and sequence the work so the items that block a contract get done first.",
        ],
      },
      {
        heading: "Choosing what to build, what to buy and what to leave alone",
        body: [
          "The build-or-buy question is where the most money gets wasted in either direction. Businesses build things that exist off the shelf for a fraction of the cost, because a developer was enthusiastic. They also buy platforms that do eighty percent of what they need and then spend years working around the twenty percent, because buying felt safer.",
          "The test we apply is whether the process in question is what makes your business distinctive. Payroll is not — buy it. Accounting is not — buy it. The particular way you schedule field teams, grade a consignment, or price a job against six variables competitors handle by instinct frequently is, and that is where custom software returns its cost. Building your differentiator and buying your commodities is a rule that survives most specific circumstances.",
          "The third option, doing nothing, is genuinely underrated and almost never recommended by people paid to implement. A system that is unfashionable, ugly and working is not a problem. Replacing it carries migration risk, retraining cost and the near-certainty of discovering undocumented behaviour that mattered. We flag systems like that explicitly as leave-alone, with the reasoning, so nobody re-opens the question every year.",
          "Where we do recommend change, the plan is sequenced by dependency and by risk rather than by enthusiasm: what must be true before the next thing can work, what would hurt most if it failed tomorrow, and what can wait without compounding. You get that as a document with effort and cost against each item, which means you can also take it to someone else to implement. That is deliberate — advice you cannot get a second opinion on is not worth much.",
        ],
      },
      {
        heading: "How engagements are structured",
        body: [
          "Most consulting engagements start with a fixed-scope assessment: a defined number of days, a defined set of interviews and reviews, and a written report at the end. Fixed scope matters here more than elsewhere, because open-ended consulting has an obvious incentive to keep finding things. You should know what you are spending before you start and own something useful when it finishes.",
          "After the report, the options are yours. Take it in-house and execute. Take it to a third party for implementation. Retain us for a defined piece of the work. Or do nothing for now, with a clear record of what you decided to defer and why, which is a legitimate outcome and a far better position than the ambient anxiety most businesses carry about their systems.",
          "Where longer involvement makes sense we work as a fractional technology lead — a standing arrangement of a day or two a month for businesses that need senior technical judgement in decisions but cannot justify a full-time CTO. That covers vendor selection, architecture review, hiring input and sanity-checking proposals before they are signed, which is frequently where the largest savings sit.",
          "Throughout, everything we produce is written for you to keep and to share. No recommendation depends on trusting us, no document is structured so that acting on it requires hiring us, and the reasoning behind every call is stated plainly enough that a competent third party could disagree with it on the merits. That is the standard we would want applied to advice we were paying for, and it is the one we hold ourselves to.",
        ],
      },
    ],
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
      { q: "Do you take commissions from vendors?", a: "No. We take no referral fees, which is why we can recommend an off-the-shelf product at a fraction of a custom build even though it means we do not get the build." },
      { q: "What do we get at the end of an assessment?", a: "A written document you own: current state, risks ranked by impact, a prioritised plan with effort and cost against each item, and an explicit list of what to leave alone deliberately." },
      { q: "Can you help if we already have an in-house IT team?", a: "Frequently that is the best setup. We bring an outside view and specific expertise, your team brings context we would take months to acquire, and the plan is something they can execute and own." },
    ],
    related: ["digital-transformation", "software-development", "seo"],
  },
  {
    slug: "digital-transformation",
    metaTitle: "Digital Transformation Consulting in Nigeria",
    metaDescription:
      "H-SETS modernises how Nigerian businesses run end to end — process, systems, data and team capability — in stages that keep the business trading throughout.",
    sections: [
      {
        heading: "Transformation is a sequencing problem, not a technology problem",
        body: [
          "By the time a business starts using the phrase, the problem is rarely that nobody knows what to fix. It is that everything looks urgent at once — the records are a mess, the reporting is late, the website is embarrassing, the staff are drowning in manual work, and three departments each have a system the others cannot see. Facing all of that simultaneously, most organisations either freeze or start with whichever item the loudest person named.",
          "That is why so many transformation programmes fail without anybody doing bad work. The order is wrong. Automating a broken process makes it break faster. Building reporting on data nobody trusts produces confident wrong decisions. Rolling out a new system to staff who were not consulted produces a parallel spreadsheet within a month.",
          "The value we add is sequencing: establishing what has to be true before the next thing can work, then doing those in order, with each step delivering something usable rather than banking everything on a distant finish.",
        ],
      },
      {
        heading: "Start with the process, not the platform",
        body: [
          "We begin by mapping how work actually flows — not the documented version, the real one. Who touches what, where information is re-entered, where things wait, where the exceptions are handled by somebody remembering. That mapping is done with the people doing the work, because the undocumented steps only exist in their heads and those steps are usually the reason the last system failed.",
          "The map almost always shows that the biggest costs are not where leadership assumed. Duplicate data entry between two systems. A reconciliation that takes two days a month because one field is free text. An approval that waits because the approver is only reachable by phone. These are cheap to fix and nobody had quantified them.",
          "Only then do we talk about technology, and often the first recommendation is to fix a process rather than to buy anything. A business that automates its current mess ends up with an expensive, faster mess.",
        ],
      },
      {
        heading: "Build the data foundation before the ambitions",
        body: [
          "Almost every ambition a business has for AI, analytics or automation rests on having data that is complete, current and trusted. That foundation is usually missing, and the gap is not exotic: customers recorded three different ways, a product list that disagrees with the invoices, and no single system that can answer how many orders were placed last week without somebody assembling it by hand.",
          "So the early phases are unglamorous and non-negotiable. One authoritative record for customers, products, staff and transactions. Systems that talk to each other instead of being reconciled by a person. Reporting that comes from the source rather than from a monthly export nobody can audit. It is the least exciting part of any transformation and the part that determines whether the exciting parts are possible.",
          "With that in place, the things that looked far off become straightforward. Automation has reliable inputs. Dashboards can be trusted enough to act on. AI has something real to retrieve from. Businesses that skipped this step are the ones whose AI pilot produced impressive demonstrations and no operational change.",
        ],
      },
      {
        heading: "Adoption is the actual deliverable",
        body: [
          "A system nobody uses is worse than the spreadsheet it replaced, because now the business pays for both. Adoption is won long before launch, by involving the people who will use the system while it is being designed, and by being visibly willing to change the design when they say something will not work in practice.",
          "We plan roll-out to suit the operation rather than the project plan: one team or one branch first, real use for a few weeks, fixes, then expansion. Training happens with the actual people who will do the work, on the real system, not in an abstract session weeks before go-live. And the first difficult fortnight after launch has someone available, because that is when a system is either adopted or quietly abandoned.",
          "Success is measured in operational terms agreed at the start — hours recovered, errors reduced, cycle time cut, a report that arrives on the second of the month instead of the fifteenth. Not in features delivered.",
        ],
      },
      {
        heading: "What you keep at the end",
        body: [
          "Every engagement is scoped so the business is not left dependent on us. You own the code, the infrastructure accounts, the documentation and the decision record explaining why things are as they are. Your team is trained on the systems, and where you want to build internal capability we will train and hire into it — including from H-SETS Academy graduates.",
          "Transformation is not a project with an end date so much as a capability a business either has or does not. Our aim is to leave you with the second kind of outcome: a team that can keep going without us, and a standing invitation to come back for the next thing because you want to, not because you have to.",
        ],
      },
      {
        heading: "What it costs, and how to tell whether it is working",
        body: [
          "Transformation budgets go wrong in a predictable way: the software is costed and nothing else is. In practice the technology is frequently the minority of the total. The rest is process work, data cleaning, migration, training, the productivity dip during roll-out, and the internal time of the people who have to be involved for any of it to stick. A plan that has not budgeted for those is a plan that will overrun, and the overrun will be blamed on the technology.",
          "We cost them explicitly, including your team's time, because that is the line that most often gets discovered rather than planned. It also changes decisions: once internal time is visible as a cost, the argument for doing fewer things properly rather than many things partially makes itself.",
          "Measurement should be agreed before anything starts and stated in operational terms — hours recovered per week, error rate, cycle time, how long month-end close takes, how quickly a customer enquiry gets an answer. Not features delivered, not milestones hit, and not user satisfaction surveys taken the week after launch when everyone is being polite.",
          "We baseline those numbers first, which is frequently the first time a business has measured them at all, and report against the baseline at each phase. It makes the programme honest in both directions: where a phase has not delivered what it should, the numbers say so early enough to change course, and where it has, there is evidence for the next investment rather than an assertion. A transformation that cannot show its effect in operational numbers is one nobody will fund a second phase of, and usually should not.",
          "None of this requires a large organisation to be worth doing. A twenty-person business with clean records, systems that talk to each other and a reporting line it trusts runs measurably better than a two-hundred-person one without those things. The scale of the programme should match the scale of the business — what does not change is the order the work has to happen in, and that order is where most of the value of an outside partner actually lies.",
        ],
      },
    ],
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
      { q: "How long does a transformation take?", a: "It is a sequence, not a single project. The first phase usually delivers something usable within weeks; the foundational data work runs over months. We scope each phase so it stands on its own rather than banking everything on a distant finish." },
      { q: "What if our staff resist the new system?", a: "That is the main risk, and it is addressed by involving them in the design and being visibly willing to change it when they say something will not work. Roll-out runs team by team with real use before expansion, and someone is available through the first difficult fortnight." },
      { q: "Do we need to replace everything at once?", a: "Almost never, and doing so is a common way these programmes fail. We keep what works, integrate rather than rip out where that is cheaper, and replace only what genuinely cannot be made to work." },
    ],
    related: ["it-consulting", "ai-automation", "software-development"],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
