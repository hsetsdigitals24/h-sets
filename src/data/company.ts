import { Target, Eye, Heart, Zap, Users, ShieldCheck, type LucideIcon } from "lucide-react";

export type Stat = { value: number; suffix?: string; prefix?: string; label: string };

/** Headline stats used across hero, "Why H-SETS" and About. */
export const stats: Stat[] = [
  { value: 120, suffix: "+", label: "Projects Delivered" },
  { value: 850, suffix: "+", label: "Students Trained" },
  { value: 60, suffix: "+", label: "Businesses Transformed" },
  { value: 6, label: "Years of Experience" },
];

export const aboutStats: Stat[] = [
  { value: 6, label: "Years of Experience" },
  { value: 120, suffix: "+", label: "Projects Delivered" },
  { value: 60, suffix: "+", label: "Clients Served" },
  { value: 4, label: "Countries Reached" },
];

export type Value = { icon: LucideIcon; title: string; description: string };

export const values: Value[] = [
  { icon: Target, title: "Outcomes over output", description: "We measure success by your results, not hours billed or features shipped." },
  { icon: Heart, title: "Genuine partnership", description: "We tell you the truth, push back when needed, and stay invested long-term." },
  { icon: Zap, title: "Speed with quality", description: "We ship fast without cutting the corners that come back to bite you later." },
  { icon: Users, title: "People first", description: "Whether client or student, we treat every person as a long-term relationship." },
  { icon: ShieldCheck, title: "Trust by default", description: "Security, transparency and reliability are built in, not bolted on." },
  { icon: Eye, title: "Built for Nigeria", description: "We understand the local context and build technology that works here." },
];

export type TeamMember = { name: string; role: string; initials: string; bio: string };

export const team: TeamMember[] = [
  { name: "Hassan Suleiman", role: "Founder & CEO", initials: "HS", bio: "Founded H-SETS to bridge the gap between world-class technology and Nigerian businesses." },
  { name: "Tunde Bello", role: "Lead Engineer", initials: "TB", bio: "Leads engineering across client projects and the H-SETS Academy curriculum." },
  { name: "Zainab Yusuf", role: "Head of Design", initials: "ZY", bio: "Shapes the product and brand design practice and mentors design cohorts." },
  { name: "Emeka Nwosu", role: "AI Lead", initials: "EN", bio: "Drives the AI Solutions practice and the AI Engineering programme." },
  { name: "Funke Adebayo", role: "Head of Growth", initials: "FA", bio: "Runs marketing strategy for clients and the company itself." },
  { name: "Amara Okafor", role: "Academy Director", initials: "AO", bio: "Oversees the Academy, having mentored hundreds into their first tech roles." },
];

export const milestones = [
  { year: "2020", title: "H-SETS founded", description: "Started as a small web studio with a big ambition." },
  { year: "2022", title: "Academy launched", description: "Began cohort-based training to close the tech talent gap." },
  { year: "2024", title: "AI practice", description: "Added AI automation and agents as demand surged." },
  { year: "2026", title: "Unified ecosystem", description: "Brought every service together into one connected platform." },
];
