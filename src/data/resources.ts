import {
  BookOpen,
  FileText,
  ListChecks,
  BookMarked,
  BarChart4,
  Gauge,
  type LucideIcon,
} from "lucide-react";

export type ResourceGate = "email" | "emailRole" | "emailCompany" | "full";

export type Resource = {
  id: string;
  title: string;
  type: string;
  icon: LucideIcon;
  description: string;
  gate: ResourceGate;
  tag: string;
  accent: string;
};

export const resources: Resource[] = [
  {
    id: "digital-transformation-guide",
    title: "The Complete Guide to Digital Transformation",
    type: "E-Book",
    icon: BookOpen,
    description:
      "A practical, jargon-free playbook for modernising your business operations — with a phased roadmap you can actually follow.",
    gate: "emailCompany",
    tag: "For business leaders",
    accent: "bg-blue-500",
  },
  {
    id: "social-media-calendar",
    title: "90-Day Social Media Content Calendar",
    type: "Template",
    icon: FileText,
    description:
      "A ready-to-use content calendar template with post ideas, formats and a planning system for three months of consistent posting.",
    gate: "email",
    tag: "For marketers",
    accent: "bg-rose-500",
  },
  {
    id: "seo-audit-checklist",
    title: "The 50-Point SEO Audit Checklist",
    type: "Checklist",
    icon: ListChecks,
    description:
      "Run a professional-grade SEO audit on your own site with this step-by-step checklist covering technical, content and off-page factors.",
    gate: "email",
    tag: "For everyone",
    accent: "bg-teal-500",
  },
  {
    id: "b2b-gtm-playbook",
    title: "B2B Go-to-Market Playbook",
    type: "Playbook",
    icon: BookMarked,
    description:
      "How to take a B2B product or service to market in Nigeria — positioning, channels, pricing and a 90-day launch plan.",
    gate: "emailRole",
    tag: "For founders",
    accent: "bg-fuchsia-500",
  },
  {
    id: "nigerian-digital-report-2026",
    title: "Nigerian Digital Transformation Report 2026",
    type: "Industry Report",
    icon: BarChart4,
    description:
      "Original research on how Nigerian businesses are adopting digital tools and AI — benchmarks, trends and what's coming next.",
    gate: "full",
    tag: "Original research",
    accent: "bg-orange-500",
  },
  {
    id: "ai-readiness-assessment",
    title: "AI Readiness Self-Assessment",
    type: "Audit Tool",
    icon: Gauge,
    description:
      "A guided assessment that scores your organisation's readiness for AI across data, process and people — with tailored next steps.",
    gate: "full",
    tag: "Interactive tool",
    accent: "bg-purple-500",
  },
];

export const gateFields: Record<ResourceGate, string[]> = {
  email: ["name", "email"],
  emailRole: ["name", "email", "role"],
  emailCompany: ["name", "email", "company"],
  full: ["name", "email", "company", "role", "phone"],
};
