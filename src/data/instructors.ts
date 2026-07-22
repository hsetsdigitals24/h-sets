// Deduplicated list of Academy instructors. This is the seed source for the
// `Instructor` table; programmes link to a row here by `name` during seeding
// (see prisma/seed.ts). The admin CMS owns instructors after the initial seed.

export type Instructor = {
  name: string;
  title: string;
  bio: string;
  email: string;
};

export const instructors: Instructor[] = [
  {
    name: "Tunde Bello",
    title: "Lead Engineer, H-SETS",
    bio: "10+ years building production software for fintech and health startups across Africa.",
    email: "tunde.bello@hsets.academy",
  },
  {
    name: "Amara Okafor",
    title: "Frontend Engineer",
    bio: "Frontend specialist who has mentored 200+ beginners into their first tech roles.",
    email: "amara.okafor@hsets.academy",
  },
  {
    name: "Zainab Yusuf",
    title: "Product Designer",
    bio: "Product designer with a decade of experience shipping consumer and B2B products.",
    email: "zainab.yusuf@hsets.academy",
  },
  {
    name: "Emeka Nwosu",
    title: "AI Engineer",
    bio: "Builds AI systems for enterprise clients and contributes to open-source AI tooling.",
    email: "emeka.nwosu@hsets.academy",
  },
  {
    name: "Grace Adeyemi",
    title: "Data Analyst",
    bio: "Data analyst turning messy data into clear decisions for finance and retail clients.",
    email: "grace.adeyemi@hsets.academy",
  },
  {
    name: "Ibrahim Sani",
    title: "Security Engineer",
    bio: "Security engineer focused on defensive operations and secure-by-design architecture.",
    email: "ibrahim.sani@hsets.academy",
  },
  {
    name: "Chidi Okeke",
    title: "Product Manager",
    bio: "Product leader who has launched and scaled products across fintech and edtech.",
    email: "chidi.okeke@hsets.academy",
  },
  {
    name: "Funke Adebayo",
    title: "Growth Marketer",
    bio: "Growth marketer who has driven demand for startups and SMEs across West Africa.",
    email: "funke.adebayo@hsets.academy",
  },
  {
    name: "Daniel Eze",
    title: "Business Development Lead",
    bio: "BD leader who has built sales pipelines for service businesses from the ground up.",
    email: "daniel.eze@hsets.academy",
  },
];
