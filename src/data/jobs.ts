export type Job = {
  id: string;
  title: string;
  company: string;
  type: "Internship" | "Graduate" | "Full-time";
  location: string;
  mode: "Remote" | "Hybrid" | "On-site";
  salary: string;
  category: string;
  posted: string;
  deadline: string;
  summary: string;
};

export const jobs: Job[] = [
  {
    id: "fe-andela",
    title: "Junior Frontend Developer",
    company: "Andela",
    type: "Graduate",
    location: "Lagos",
    mode: "Remote",
    salary: "₦400k – ₦650k / mo",
    category: "Engineering",
    posted: "2026-06-15",
    deadline: "2026-07-15",
    summary:
      "Join a distributed team building products for global clients. Strong React fundamentals required; mentorship provided.",
  },
  {
    id: "ux-kuda",
    title: "Product Design Intern",
    company: "Kuda",
    type: "Internship",
    location: "Lagos",
    mode: "Hybrid",
    salary: "₦250k / mo",
    category: "Design",
    posted: "2026-06-12",
    deadline: "2026-07-05",
    summary:
      "A 6-month paid internship working alongside senior designers on consumer fintech products. Figma proficiency expected.",
  },
  {
    id: "data-firstbridge",
    title: "Data Analyst",
    company: "FirstBridge Financial",
    type: "Full-time",
    location: "Abuja",
    mode: "On-site",
    salary: "₦600k – ₦900k / mo",
    category: "Data",
    posted: "2026-06-10",
    deadline: "2026-07-10",
    summary:
      "Own reporting and dashboards for a fast-growing financial services firm. SQL and visualisation skills essential.",
  },
  {
    id: "ai-bloom",
    title: "AI Engineer (Mid-level)",
    company: "Bloom Retail",
    type: "Full-time",
    location: "Remote (Nigeria)",
    mode: "Remote",
    salary: "₦900k – ₦1.4m / mo",
    category: "AI & Data",
    posted: "2026-06-08",
    deadline: "2026-07-20",
    summary:
      "Build and ship LLM-powered features for retail automation. Experience with RAG and agents strongly preferred.",
  },
  {
    id: "pm-kudi",
    title: "Associate Product Manager",
    company: "Kudi Africa",
    type: "Graduate",
    location: "Lagos",
    mode: "Hybrid",
    salary: "₦700k – ₦1m / mo",
    category: "Product",
    posted: "2026-06-05",
    deadline: "2026-07-01",
    summary:
      "Support the product team across discovery and delivery for a leading payments platform. Analytical and user-focused.",
  },
  {
    id: "be-medilogix",
    title: "Backend Engineer",
    company: "MediLogix Health",
    type: "Full-time",
    location: "Ilorin",
    mode: "Hybrid",
    salary: "₦700k – ₦1.1m / mo",
    category: "Engineering",
    posted: "2026-06-02",
    deadline: "2026-07-12",
    summary:
      "Build secure health systems with Node and PostgreSQL. Care about reliability, data security and clean APIs.",
  },
];
