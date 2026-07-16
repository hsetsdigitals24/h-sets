import {
  HeartPulse,
  Landmark,
  GraduationCap,
  Factory,
  Building2,
  HandHeart,
  Home,
  type LucideIcon,
} from "lucide-react";

export type Industry = {
  slug: string;
  name: string;
  icon: LucideIcon;
  short: string;
  hero: string;
  challenges: string[];
  solutions: { title: string; description: string }[];
  useCases: string[];
  stat: { value: string; label: string };
  faqs: { q: string; a: string }[];
};

export const industries: Industry[] = [
  {
    slug: "healthcare",
    name: "Healthcare",
    icon: HeartPulse,
    short: "HIPAA-minded digital systems for clinics, hospitals and health startups.",
    hero: "Technology that helps you deliver better care.",
    challenges: [
      "Paper records and disconnected systems slow down care",
      "Patient communication is manual and inconsistent",
      "Compliance and data security carry real risk",
    ],
    solutions: [
      { title: "Patient portals", description: "Secure booking, records and communication in one place." },
      { title: "Clinical automation", description: "Reduce admin load with smart scheduling and reminders." },
      { title: "Health data platforms", description: "Connected, secure systems with audit trails built in." },
    ],
    useCases: [
      "Telemedicine and online booking platforms",
      "Electronic medical records and dashboards",
      "Automated patient reminders and follow-ups",
      "AI triage and document summarisation",
    ],
    stat: { value: "40%", label: "less admin time with clinical automation" },
    faqs: [
      { q: "Do you handle sensitive health data securely?", a: "Yes — we design with encryption, access controls and audit logging as defaults." },
      { q: "Can you integrate with existing systems?", a: "We build integrations to the EMRs, labs and tools you already use." },
    ],
  },
  {
    slug: "fintech",
    name: "Fintech",
    icon: Landmark,
    short: "Secure, scalable platforms for payments, lending and financial services.",
    hero: "Build financial products customers trust.",
    challenges: [
      "Security and fraud risk are existential",
      "Regulatory requirements are complex and shifting",
      "Users expect fast, flawless experiences",
    ],
    solutions: [
      { title: "Payment platforms", description: "Robust integrations with Paystack, Flutterwave and more." },
      { title: "Risk & fraud AI", description: "Detect anomalies and reduce fraud in real time." },
      { title: "Compliance-ready builds", description: "Auditable systems designed for financial regulation." },
    ],
    useCases: [
      "Digital wallets and payment apps",
      "Lending and credit-scoring platforms",
      "Fraud detection and KYC automation",
      "Financial dashboards and reporting",
    ],
    stat: { value: "99.9%", label: "uptime targets for financial workloads" },
    faqs: [
      { q: "Can you integrate Nigerian payment gateways?", a: "Yes — Paystack and Flutterwave are core to our payment work, with fallback handling." },
      { q: "How do you handle security?", a: "Defence-in-depth: encryption, least-privilege access, monitoring and PCI-conscious design." },
    ],
  },
  {
    slug: "education",
    name: "Education",
    icon: GraduationCap,
    short: "Learning platforms, school systems and edtech products that scale.",
    hero: "Digital learning that actually engages.",
    challenges: [
      "Generic LMS tools don't fit real teaching",
      "Student engagement and retention are hard to track",
      "Admin and reporting eat into teaching time",
    ],
    solutions: [
      { title: "Custom LMS", description: "Cohort-based learning built around how you teach." },
      { title: "Student analytics", description: "See engagement and outcomes at a glance." },
      { title: "Admin automation", description: "Enrolment, grading and reporting, streamlined." },
    ],
    useCases: [
      "Cohort-based and self-paced learning platforms",
      "School management and enrolment systems",
      "Assessment and certification engines",
      "Parent and student portals",
    ],
    stat: { value: "3x", label: "engagement vs. generic LMS tools" },
    faqs: [
      { q: "Do you build full learning platforms?", a: "Yes — the H-SETS Academy runs on technology we build, so we know this space deeply." },
      { q: "Can you handle certificates?", a: "We build automated, verifiable certification with public verification pages." },
    ],
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    icon: Factory,
    short: "Operations, inventory and IoT systems for modern manufacturing.",
    hero: "Connect and optimise your operations.",
    challenges: [
      "Manual tracking causes errors and delays",
      "No real-time view of inventory or output",
      "Disconnected systems across the floor",
    ],
    solutions: [
      { title: "Operations dashboards", description: "Real-time visibility into production and inventory." },
      { title: "Inventory automation", description: "Track stock and reorder intelligently." },
      { title: "IoT integration", description: "Bring machine data into one connected view." },
    ],
    useCases: [
      "Inventory and supply-chain platforms",
      "Production monitoring dashboards",
      "Predictive maintenance with AI",
      "Quality and compliance tracking",
    ],
    stat: { value: "25%", label: "fewer stockouts with smart inventory" },
    faqs: [
      { q: "Can you connect factory equipment?", a: "We integrate IoT and machine data into unified dashboards where the hardware supports it." },
      { q: "Do you build inventory systems?", a: "Yes — real-time tracking, automated reordering and supply-chain visibility." },
    ],
  },
  {
    slug: "government",
    name: "Government",
    icon: Building2,
    short: "Citizen services and digital infrastructure for the public sector.",
    hero: "Public services that work for citizens.",
    challenges: [
      "Legacy systems are slow and siloed",
      "Citizen-facing services are hard to access",
      "Transparency and accountability are demanded",
    ],
    solutions: [
      { title: "Citizen portals", description: "Accessible self-service for public services." },
      { title: "Digital records", description: "Secure, searchable, auditable data systems." },
      { title: "Process digitisation", description: "Replace paper with efficient workflows." },
    ],
    useCases: [
      "Citizen service and e-government portals",
      "Records and licensing systems",
      "Data dashboards for decision-making",
      "Accessible, multilingual public sites",
    ],
    stat: { value: "WCAG", label: "AA accessibility on public services" },
    faqs: [
      { q: "Do you meet accessibility standards?", a: "Yes — public-facing work is built to WCAG 2.1 AA so every citizen can use it." },
      { q: "Can you digitise paper processes?", a: "We map existing workflows and replace them with secure, auditable digital systems." },
    ],
  },
  {
    slug: "ngos",
    name: "NGOs",
    icon: HandHeart,
    short: "Impact-focused tech for non-profits, on non-profit budgets.",
    hero: "Do more good with the right tools.",
    challenges: [
      "Limited budgets and technical capacity",
      "Hard to measure and report impact",
      "Donor and volunteer management is manual",
    ],
    solutions: [
      { title: "Impact dashboards", description: "Track and report outcomes that matter to donors." },
      { title: "Donation platforms", description: "Make giving simple and recurring." },
      { title: "Volunteer systems", description: "Coordinate people and programmes with ease." },
    ],
    useCases: [
      "Donation and fundraising platforms",
      "Impact measurement dashboards",
      "Volunteer and programme management",
      "Grant and reporting automation",
    ],
    stat: { value: "100%", label: "of work scoped to fit lean budgets" },
    faqs: [
      { q: "Do you offer non-profit pricing?", a: "We scope engagements to fit lean budgets and prioritise the highest-impact work first." },
      { q: "Can you help us show impact?", a: "We build dashboards and reporting that make outcomes clear to donors and boards." },
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: Home,
    short: "Listing platforms, CRM and virtual tools for property businesses.",
    hero: "Sell and manage property, digitally.",
    challenges: [
      "Listings are scattered and hard to manage",
      "Lead follow-up is slow and manual",
      "Buyers expect rich, online experiences",
    ],
    solutions: [
      { title: "Listing platforms", description: "Searchable, fast property portals with rich media." },
      { title: "Lead CRM", description: "Capture and nurture buyer interest automatically." },
      { title: "Virtual experiences", description: "Tours and visualisers that close deals faster." },
    ],
    useCases: [
      "Property listing and search portals",
      "Agent CRM and lead automation",
      "Virtual tours and property visualisers",
      "Tenant and facility management apps",
    ],
    stat: { value: "2x", label: "faster lead response with automation" },
    faqs: [
      { q: "Can you build a listing portal?", a: "Yes — fast, searchable portals with rich media and map-based discovery." },
      { q: "Do you integrate CRM?", a: "We connect lead capture to CRM with automated follow-up so no enquiry slips through." },
    ],
  },
];

export function getIndustry(slug: string) {
  return industries.find((i) => i.slug === slug);
}
