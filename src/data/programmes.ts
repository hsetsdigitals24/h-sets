import {
  Code2,
  Globe,
  PenTool,
  Megaphone,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  LayoutGrid,
  ClipboardList,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type Cohort = {
  id: string;
  startDate: string;
  endDate: string;
  format: "Full-time" | "Part-time" | "Weekend";
  seatsTotal: number;
  seatsLeft: number;
  status: "Open" | "Filling Fast" | "Full" | "Waitlist";
};

export type Programme = {
  slug: string;
  name: string;
  icon: LucideIcon;
  level: string;
  category: string;
  durationWeeks: number;
  feeFull: number;
  feeInstallment: number;
  short: string;
  overview: string;
  outcomes: string[];
  curriculum: { week: string; title: string; topics: string[] }[];
  tools: string[];
  instructor: { name: string; title: string; bio: string };
  cohorts: Cohort[];
  faqs: { q: string; a: string }[];
};

export const programmes: Programme[] = [
  {
    slug: "software-development",
    name: "Software Development",
    icon: Code2,
    level: "Advanced",
    category: "Engineering",
    durationWeeks: 20,
    feeFull: 450000,
    feeInstallment: 270000,
    short: "Become a job-ready full-stack engineer with real-world projects.",
    overview:
      "An intensive, project-based programme that takes you from fundamentals to deploying production full-stack applications. Built and taught by working engineers.",
    outcomes: [
      "Build and deploy full-stack web applications",
      "Master JavaScript, TypeScript, React and Node",
      "Work with databases, APIs and cloud deployment",
      "Graduate with a portfolio of real projects",
    ],
    curriculum: [
      { week: "Weeks 1–3", title: "Foundations", topics: ["Web fundamentals", "JavaScript & TypeScript", "Git & collaboration"] },
      { week: "Weeks 4–8", title: "Frontend Engineering", topics: ["React & state", "Next.js", "Styling & accessibility"] },
      { week: "Weeks 9–13", title: "Backend & Data", topics: ["Node & APIs", "PostgreSQL", "Auth & security"] },
      { week: "Weeks 14–17", title: "Full-stack Projects", topics: ["System design", "Testing", "Deployment & CI/CD"] },
      { week: "Weeks 18–20", title: "Capstone & Career", topics: ["Capstone project", "Portfolio", "Interview prep"] },
    ],
    tools: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Git"],
    instructor: { name: "Tunde Bello", title: "Lead Engineer, H-SETS", bio: "10+ years building production software for fintech and health startups across Africa." },
    cohorts: [
      { id: "sd-2026-q3", startDate: "2026-08-04", endDate: "2026-12-22", format: "Part-time", seatsTotal: 30, seatsLeft: 8, status: "Filling Fast" },
      { id: "sd-2026-q4", startDate: "2026-10-06", endDate: "2027-02-23", format: "Weekend", seatsTotal: 30, seatsLeft: 22, status: "Open" },
    ],
    faqs: [
      { q: "Do I need prior experience?", a: "No — we start from fundamentals, but commitment and consistency are essential given the pace." },
      { q: "Is there a payment plan?", a: "Yes, a two-part installment plan is available. Part one secures your seat." },
      { q: "Will I get a certificate?", a: "Yes — meet the attendance, assignment and assessment criteria and you earn a verifiable certificate." },
    ],
  },
  {
    slug: "web-development",
    name: "Web Development",
    icon: Globe,
    level: "Intermediate",
    category: "Engineering",
    durationWeeks: 14,
    feeFull: 300000,
    feeInstallment: 180000,
    short: "Go from beginner to building and shipping modern websites.",
    overview:
      "Perfect for career-switchers. Learn to build responsive, fast websites and land your first web role or freelance clients.",
    outcomes: [
      "Build responsive websites from scratch",
      "Master HTML, CSS, JavaScript and React",
      "Deploy live projects to the web",
      "Start freelancing or land a junior role",
    ],
    curriculum: [
      { week: "Weeks 1–3", title: "Web Basics", topics: ["HTML & semantics", "CSS & layout", "Responsive design"] },
      { week: "Weeks 4–7", title: "JavaScript", topics: ["Core JS", "DOM", "APIs & fetch"] },
      { week: "Weeks 8–11", title: "React", topics: ["Components", "State & hooks", "Routing"] },
      { week: "Weeks 12–14", title: "Ship It", topics: ["Project build", "Deployment", "Portfolio & freelancing"] },
    ],
    tools: ["HTML", "CSS", "JavaScript", "React", "Git", "Vercel"],
    instructor: { name: "Amara Okafor", title: "Frontend Engineer", bio: "Frontend specialist who has mentored 200+ beginners into their first tech roles." },
    cohorts: [
      { id: "wd-2026-q3", startDate: "2026-07-21", endDate: "2026-10-27", format: "Part-time", seatsTotal: 35, seatsLeft: 5, status: "Filling Fast" },
      { id: "wd-2026-q4", startDate: "2026-09-15", endDate: "2026-12-22", format: "Weekend", seatsTotal: 35, seatsLeft: 30, status: "Open" },
    ],
    faqs: [
      { q: "Is this good for total beginners?", a: "Yes — this is our most beginner-friendly engineering programme." },
      { q: "Can I freelance after?", a: "Many graduates start freelancing immediately using the portfolio they build." },
      { q: "What if I miss a class?", a: "Sessions are recorded and available in your student portal." },
    ],
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    icon: PenTool,
    level: "Intermediate",
    category: "Design",
    durationWeeks: 12,
    feeFull: 280000,
    feeInstallment: 170000,
    short: "Design digital products people love — from research to polished UI.",
    overview:
      "A hands-on design programme covering the full process: user research, wireframing, prototyping and high-fidelity UI in Figma.",
    outcomes: [
      "Run user research and synthesise insights",
      "Design wireframes and interactive prototypes",
      "Master Figma and design systems",
      "Build a job-ready design portfolio",
    ],
    curriculum: [
      { week: "Weeks 1–3", title: "UX Foundations", topics: ["Design thinking", "User research", "Information architecture"] },
      { week: "Weeks 4–6", title: "Interaction Design", topics: ["Wireframing", "Prototyping", "Usability testing"] },
      { week: "Weeks 7–9", title: "Visual Design", topics: ["Typography & colour", "UI patterns", "Design systems"] },
      { week: "Weeks 10–12", title: "Portfolio", topics: ["Capstone case study", "Portfolio site", "Design interviews"] },
    ],
    tools: ["Figma", "FigJam", "Maze", "Notion"],
    instructor: { name: "Zainab Yusuf", title: "Product Designer", bio: "Product designer with a decade of experience shipping consumer and B2B products." },
    cohorts: [
      { id: "ux-2026-q3", startDate: "2026-08-11", endDate: "2026-11-03", format: "Part-time", seatsTotal: 28, seatsLeft: 12, status: "Open" },
    ],
    faqs: [
      { q: "Do I need to draw well?", a: "No — design is about problem-solving and process, not artistic talent." },
      { q: "Which tools will I learn?", a: "Figma is the core tool, alongside research and testing tools." },
      { q: "Will I have a portfolio?", a: "Yes — you graduate with a polished case-study portfolio." },
    ],
  },
  {
    slug: "ai-engineering",
    name: "AI Engineering",
    icon: BrainCircuit,
    level: "Advanced",
    category: "AI & Data",
    durationWeeks: 22,
    feeFull: 550000,
    feeInstallment: 330000,
    short: "Build real AI applications — from LLM apps to RAG and agents.",
    overview:
      "An advanced programme for developers who want to build production AI systems: LLM apps, retrieval, agents and deployment.",
    outcomes: [
      "Build LLM-powered applications end to end",
      "Implement RAG and vector search",
      "Design and deploy AI agents",
      "Ship AI features to production responsibly",
    ],
    curriculum: [
      { week: "Weeks 1–4", title: "Python & ML Foundations", topics: ["Python for AI", "ML basics", "Data handling"] },
      { week: "Weeks 5–10", title: "LLM Applications", topics: ["Prompting", "APIs & tooling", "Evaluation"] },
      { week: "Weeks 11–16", title: "RAG & Agents", topics: ["Vector databases", "Retrieval", "Agentic systems"] },
      { week: "Weeks 17–22", title: "Production AI", topics: ["Deployment", "Monitoring", "Capstone project"] },
    ],
    tools: ["Python", "LangChain", "Vector DBs", "Claude API", "Next.js"],
    instructor: { name: "Emeka Nwosu", title: "AI Engineer", bio: "Builds AI systems for enterprise clients and contributes to open-source AI tooling." },
    cohorts: [
      { id: "ai-2026-q3", startDate: "2026-08-18", endDate: "2027-01-19", format: "Part-time", seatsTotal: 25, seatsLeft: 3, status: "Filling Fast" },
      { id: "ai-2026-q4", startDate: "2026-11-03", endDate: "2027-04-06", format: "Weekend", seatsTotal: 25, seatsLeft: 25, status: "Open" },
    ],
    faqs: [
      { q: "Do I need to know Python?", a: "Some programming experience is strongly recommended; we cover Python for AI early on." },
      { q: "Which models do we use?", a: "We work with leading LLMs including Claude, focusing on transferable patterns." },
      { q: "Is this hands-on?", a: "Very — you'll build and deploy real AI applications throughout." },
    ],
  },
  {
    slug: "data-analytics",
    name: "Data Analytics",
    icon: BarChart3,
    level: "Intermediate",
    category: "AI & Data",
    durationWeeks: 14,
    feeFull: 320000,
    feeInstallment: 192000,
    short: "Turn data into decisions with SQL, Python and visualisation.",
    overview:
      "Learn to collect, clean, analyse and visualise data to drive business decisions — a high-demand, well-paid skill set.",
    outcomes: [
      "Query data confidently with SQL",
      "Analyse data with Python and spreadsheets",
      "Build dashboards that tell a story",
      "Communicate insights to stakeholders",
    ],
    curriculum: [
      { week: "Weeks 1–3", title: "Data Foundations", topics: ["Spreadsheets", "Data thinking", "Statistics basics"] },
      { week: "Weeks 4–7", title: "SQL & Databases", topics: ["SQL queries", "Joins & aggregation", "Data modelling"] },
      { week: "Weeks 8–11", title: "Python for Analysis", topics: ["Pandas", "Cleaning", "Exploratory analysis"] },
      { week: "Weeks 12–14", title: "Visualisation", topics: ["Dashboards", "Storytelling", "Capstone"] },
    ],
    tools: ["SQL", "Python", "Pandas", "Power BI", "Excel"],
    instructor: { name: "Grace Adeyemi", title: "Data Analyst", bio: "Data analyst turning messy data into clear decisions for finance and retail clients." },
    cohorts: [
      { id: "da-2026-q3", startDate: "2026-09-01", endDate: "2026-12-08", format: "Part-time", seatsTotal: 30, seatsLeft: 18, status: "Open" },
    ],
    faqs: [
      { q: "Do I need a maths background?", a: "Comfort with numbers helps, but we teach the statistics you need from the ground up." },
      { q: "Is this beginner-friendly?", a: "Yes — no prior coding required." },
      { q: "What roles can I target?", a: "Data analyst, business analyst and reporting roles across many industries." },
    ],
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    icon: ShieldCheck,
    level: "Intermediate–Advanced",
    category: "Engineering",
    durationWeeks: 18,
    feeFull: 420000,
    feeInstallment: 252000,
    short: "Defend systems and data with hands-on security skills.",
    overview:
      "A practical security programme covering network security, ethical hacking fundamentals, and defensive operations for a high-demand field.",
    outcomes: [
      "Understand threats and attack surfaces",
      "Secure networks, apps and data",
      "Run vulnerability assessments responsibly",
      "Prepare for industry security certifications",
    ],
    curriculum: [
      { week: "Weeks 1–4", title: "Security Foundations", topics: ["Networking", "Threat models", "Cryptography basics"] },
      { week: "Weeks 5–9", title: "Defensive Security", topics: ["Hardening", "Monitoring", "Incident response"] },
      { week: "Weeks 10–14", title: "Offensive Basics", topics: ["Vulnerability assessment", "Ethical testing", "Tooling"] },
      { week: "Weeks 15–18", title: "Applied Security", topics: ["Cloud security", "Compliance", "Capstone"] },
    ],
    tools: ["Linux", "Wireshark", "Nmap", "Burp Suite"],
    instructor: { name: "Ibrahim Sani", title: "Security Engineer", bio: "Security engineer focused on defensive operations and secure-by-design architecture." },
    cohorts: [
      { id: "cs-2026-q4", startDate: "2026-10-13", endDate: "2027-02-16", format: "Part-time", seatsTotal: 25, seatsLeft: 20, status: "Open" },
    ],
    faqs: [
      { q: "Is this ethical-hacking focused?", a: "We balance defensive and offensive fundamentals, always within an ethical, authorised framing." },
      { q: "Do I need IT experience?", a: "Some IT or networking familiarity is recommended." },
      { q: "Does it prep for certs?", a: "The curriculum aligns with foundational industry security certifications." },
    ],
  },
  {
    slug: "product-design",
    name: "Product Design",
    icon: LayoutGrid,
    level: "Foundational–Intermediate",
    category: "Design",
    durationWeeks: 12,
    feeFull: 280000,
    feeInstallment: 170000,
    short: "Design end-to-end product experiences that ship.",
    overview:
      "Go beyond UI into full product design — strategy, discovery, design and collaboration with engineering and PM.",
    outcomes: [
      "Own the product design process end to end",
      "Collaborate with PMs and engineers",
      "Design systems and component libraries",
      "Ship a portfolio-ready product case study",
    ],
    curriculum: [
      { week: "Weeks 1–3", title: "Discovery", topics: ["Product thinking", "Research", "Problem framing"] },
      { week: "Weeks 4–6", title: "Design", topics: ["Flows", "Prototyping", "Design systems"] },
      { week: "Weeks 7–9", title: "Collaboration", topics: ["Working with PM/eng", "Handoff", "Iteration"] },
      { week: "Weeks 10–12", title: "Capstone", topics: ["End-to-end project", "Portfolio", "Presentation"] },
    ],
    tools: ["Figma", "Notion", "Maze"],
    instructor: { name: "Zainab Yusuf", title: "Product Designer", bio: "Product designer with a decade of experience shipping consumer and B2B products." },
    cohorts: [
      { id: "pd-2026-q4", startDate: "2026-09-22", endDate: "2026-12-15", format: "Part-time", seatsTotal: 28, seatsLeft: 24, status: "Open" },
    ],
    faqs: [
      { q: "How is this different from UI/UX?", a: "Product design adds strategy, discovery and cross-functional collaboration on top of UI/UX craft." },
      { q: "Do I need design experience?", a: "Foundational design familiarity helps but isn't required." },
      { q: "Will I work on real briefs?", a: "Yes — you design against realistic product problems throughout." },
    ],
  },
  {
    slug: "product-management",
    name: "Product Management",
    icon: ClipboardList,
    level: "Intermediate",
    category: "Business",
    durationWeeks: 12,
    feeFull: 300000,
    feeInstallment: 180000,
    short: "Lead products from idea to launch and growth.",
    overview:
      "Learn the craft of product management: discovery, prioritisation, roadmapping, delivery and working with design and engineering.",
    outcomes: [
      "Run product discovery and validation",
      "Prioritise and build roadmaps",
      "Write specs and lead delivery",
      "Measure and grow product success",
    ],
    curriculum: [
      { week: "Weeks 1–3", title: "Product Foundations", topics: ["PM role", "Discovery", "User research"] },
      { week: "Weeks 4–6", title: "Strategy", topics: ["Prioritisation", "Roadmaps", "Metrics"] },
      { week: "Weeks 7–9", title: "Delivery", topics: ["Specs", "Agile", "Working with teams"] },
      { week: "Weeks 10–12", title: "Growth", topics: ["Experimentation", "Analytics", "Capstone"] },
    ],
    tools: ["Notion", "Jira", "Amplitude", "Figma"],
    instructor: { name: "Chidi Okeke", title: "Product Manager", bio: "Product leader who has launched and scaled products across fintech and edtech." },
    cohorts: [
      { id: "pm-2026-q4", startDate: "2026-10-06", endDate: "2026-12-29", format: "Weekend", seatsTotal: 28, seatsLeft: 26, status: "Open" },
    ],
    faqs: [
      { q: "Do I need a tech background?", a: "No — but curiosity about technology and users is essential." },
      { q: "Is this practical?", a: "Yes — you work on a product from discovery to a launch plan." },
      { q: "What roles can I target?", a: "Associate PM and PM roles, or product ownership in your current company." },
    ],
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    icon: Megaphone,
    level: "Foundational–Intermediate",
    category: "Business",
    durationWeeks: 10,
    feeFull: 220000,
    feeInstallment: 132000,
    short: "Master the channels that drive real business growth.",
    overview:
      "A practical marketing programme covering SEO, paid ads, social, email and analytics — ideal for business owners and aspiring marketers.",
    outcomes: [
      "Run campaigns across search and social",
      "Build email and content funnels",
      "Measure marketing with analytics",
      "Grow a business or land a marketing role",
    ],
    curriculum: [
      { week: "Weeks 1–2", title: "Foundations", topics: ["Marketing strategy", "Audience & positioning", "Funnels"] },
      { week: "Weeks 3–5", title: "Channels", topics: ["SEO", "Paid ads", "Social media"] },
      { week: "Weeks 6–8", title: "Conversion", topics: ["Email", "Content", "Landing pages"] },
      { week: "Weeks 9–10", title: "Analytics", topics: ["GA4", "Attribution", "Capstone campaign"] },
    ],
    tools: ["GA4", "Meta Ads", "Google Ads", "Mailchimp"],
    instructor: { name: "Funke Adebayo", title: "Growth Marketer", bio: "Growth marketer who has driven demand for startups and SMEs across West Africa." },
    cohorts: [
      { id: "dm-2026-q3", startDate: "2026-08-25", endDate: "2026-11-03", format: "Part-time", seatsTotal: 35, seatsLeft: 15, status: "Open" },
    ],
    faqs: [
      { q: "Good for business owners?", a: "Absolutely — many students join to market their own business more effectively." },
      { q: "Is it hands-on?", a: "Yes — you plan and run a real campaign as your capstone." },
      { q: "Do I need a budget for ads?", a: "A small practice budget helps but isn't strictly required to complete the course." },
    ],
  },
  {
    slug: "business-development",
    name: "Business Development",
    icon: Briefcase,
    level: "Foundational",
    category: "Business",
    durationWeeks: 10,
    feeFull: 200000,
    feeInstallment: 120000,
    short: "Build the sales and growth skills to win business.",
    overview:
      "Learn to find, qualify and close opportunities — practical business development for entrepreneurs and sales professionals.",
    outcomes: [
      "Build a repeatable sales pipeline",
      "Qualify and close opportunities",
      "Craft proposals that win",
      "Grow revenue with confidence",
    ],
    curriculum: [
      { week: "Weeks 1–2", title: "Foundations", topics: ["Value proposition", "ICP", "Pipeline basics"] },
      { week: "Weeks 3–5", title: "Outreach", topics: ["Prospecting", "Messaging", "Discovery calls"] },
      { week: "Weeks 6–8", title: "Closing", topics: ["Proposals", "Negotiation", "Objection handling"] },
      { week: "Weeks 9–10", title: "Growth", topics: ["Accounts", "Referrals", "Capstone"] },
    ],
    tools: ["CRM", "LinkedIn", "Notion"],
    instructor: { name: "Daniel Eze", title: "Business Development Lead", bio: "BD leader who has built sales pipelines for service businesses from the ground up." },
    cohorts: [
      { id: "bd-2026-q4", startDate: "2026-09-29", endDate: "2026-12-08", format: "Weekend", seatsTotal: 30, seatsLeft: 28, status: "Open" },
    ],
    faqs: [
      { q: "Is sales experience required?", a: "No — this is a foundational programme suitable for beginners and founders." },
      { q: "Will I practise real outreach?", a: "Yes — you build and work a real pipeline during the course." },
      { q: "Good for founders?", a: "Very — many founders take it to drive their own sales." },
    ],
  },
];

export function getProgramme(slug: string) {
  return programmes.find((p) => p.slug === slug);
}

/** Flattened upcoming cohorts across all programmes, sorted by start date. */
export function upcomingCohorts() {
  return programmes
    .flatMap((p) =>
      p.cohorts.map((c) => ({ ...c, programme: p }))
    )
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
}
