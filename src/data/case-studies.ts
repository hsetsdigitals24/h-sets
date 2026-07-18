export type CaseStudy = {
  slug: string;
  client: string;
  industry: string;
  service: string;
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  results: { metric: string; label: string }[];
  tech: string[];
  testimonial?: { quote: string; name: string; role: string };
  related: string[];
  accent: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "medilogix-patient-platform",
    client: "MediLogix Health",
    industry: "Healthcare",
    service: "Software Development",
    title: "Rebuilding patient care for a fast-growing health network",
    summary:
      "A unified patient platform that lifted online bookings by 60% and cut admin time by nearly half.",
    challenge:
      "MediLogix was scaling fast but running on paper records and three disconnected tools. Staff spent hours each day on manual scheduling and data entry, patients struggled to book online, and leadership had no real-time view of operations.",
    solution:
      "We designed and built a single patient platform: online booking, electronic records, automated reminders and an operations dashboard. The system integrated with their existing lab partners and was rolled out clinic-by-clinic to avoid disruption.",
    results: [
      { metric: "+60%", label: "online bookings" },
      { metric: "−45%", label: "admin time per clinic" },
      { metric: "12k+", label: "patients onboarded" },
    ],
    tech: ["Next.js", "Node.js", "PostgreSQL", "Supabase"],
    testimonial: {
      quote:
        "H-SETS rebuilt our entire patient platform and the difference is night and day.",
      name: "Adaeze Okonkwo",
      role: "CEO, MediLogix Health",
    },
    related: ["bloom-ai-automation", "kudi-mobile-app"],
    accent: "bg-blue-500",
  },
  {
    slug: "bloom-ai-automation",
    client: "Bloom Retail",
    industry: "Retail",
    service: "AI Automation",
    title: "Reclaiming 15 hours a week with workflow automation",
    summary:
      "AI-driven order and support automation that paid for itself within two months.",
    challenge:
      "Bloom's small team was drowning in repetitive work — manually processing orders across channels, answering the same support questions, and reconciling inventory by hand. Growth was capped by operational overhead.",
    solution:
      "We mapped their workflows, then built automations to unify orders across channels, auto-respond to common queries with an AI agent, and sync inventory in real time. Humans stayed in the loop for anything requiring judgment.",
    results: [
      { metric: "15 hrs", label: "saved per week" },
      { metric: "2 mo", label: "to full ROI" },
      { metric: "−30%", label: "support response time" },
    ],
    tech: ["AI Agents", "Workflow Automation", "Node.js"],
    testimonial: {
      quote:
        "It paid for itself in the first two months. I only wish we'd done it sooner.",
      name: "Ngozi Eze",
      role: "Founder, Bloom Retail",
    },
    related: ["medilogix-patient-platform", "firstbridge-corporate-training"],
    accent: "bg-fuchsia-500",
  },
  {
    slug: "kudi-mobile-app",
    client: "Kudi Africa",
    industry: "Fintech",
    service: "Mobile Apps",
    title: "Shipping a cross-platform fintech app users trust",
    summary:
      "A single React Native codebase delivering a fast, secure app to both stores.",
    challenge:
      "Kudi needed to launch on iOS and Android quickly without doubling their build cost, while meeting the security and performance bar fintech users expect.",
    solution:
      "We built one React Native codebase with native integrations for biometrics, payments and push notifications, plus a hardened security layer. We managed the full app-store submission and launch.",
    results: [
      { metric: "1", label: "codebase, 2 stores" },
      { metric: "4.7★", label: "average store rating" },
      { metric: "−40%", label: "build cost vs. native" },
    ],
    tech: ["React Native", "TypeScript", "Paystack", "Supabase"],
    testimonial: {
      quote: "Professional, fast and genuinely strategic. The product is better for it.",
      name: "Daniel Mensah",
      role: "Product Lead, Kudi Africa",
    },
    related: ["medilogix-patient-platform", "bloom-ai-automation"],
    accent: "bg-teal-500",
  },
  {
    slug: "firstbridge-corporate-training",
    client: "FirstBridge Financial",
    industry: "Fintech",
    service: "Corporate Training",
    title: "Upskilling 80 staff with a private cohort programme",
    summary:
      "Two custom corporate cohorts with full reporting for HR and measurable completion.",
    challenge:
      "FirstBridge needed to upskill 80 employees in data and digital skills, but generic LMS tools offered no accountability and didn't fit their compliance reporting needs.",
    solution:
      "We delivered two private cohorts with a tailored curriculum, dedicated instructors, and a company-level reporting dashboard showing per-employee progress, attendance and certification for HR records.",
    results: [
      { metric: "80", label: "staff trained" },
      { metric: "92%", label: "completion rate" },
      { metric: "2", label: "private cohorts delivered" },
    ],
    tech: ["H-SETS Academy", "Custom Reporting"],
    testimonial: {
      quote: "A genuine training partner. The reporting is exactly what our HR team needed.",
      name: "Babatunde Alabi",
      role: "L&D Director, FirstBridge Financial",
    },
    related: ["medilogix-patient-platform", "bloom-ai-automation"],
    accent: "bg-orange-500",
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
