/** Global site configuration: company info, navigation, contact details. */

export const site = {
  name: "H-SETS",
  legalName: "H-SETS Digital & IT Solutions",
  tagline: "Nigeria's end-to-end technology growth partner.",
  description:
    "H-SETS is a unified digital ecosystem helping businesses transform with software, AI and digital marketing — and training the next generation of tech talent through the H-SETS Academy.",
  url: "https://h-sets.com",
  email: "hello@h-sets.com",
  phone: "+234 800 000 0000",
  address: "Ilorin · Lagos · Abuja, Nigeria",
  socials: {
    linkedin: "https://linkedin.com/company/h-sets",
    twitter: "https://twitter.com/hsets",
    instagram: "https://instagram.com/hsets",
    youtube: "https://youtube.com/@hsets",
  },
};

export type NavLink = { label: string; href: string; description?: string };
export type NavColumn = { heading: string; links: NavLink[] };
export type NavItem = {
  label: string;
  href: string;
  columns?: NavColumn[];
  featured?: { title: string; description: string; href: string };
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/services",
    featured: {
      title: "Digital Transformation",
      description: "End-to-end strategy, build and growth for ambitious teams.",
      href: "/services/digital-transformation",
    },
    columns: [
      {
        heading: "Build",
        links: [
          { label: "Website Development", href: "/services/website-development" },
          { label: "Software Development", href: "/services/software-development" },
          { label: "Mobile Apps", href: "/services/mobile-apps" },
          { label: "UI/UX Design", href: "/services/ui-ux-design" },
        ],
      },
      {
        heading: "Grow",
        links: [
          { label: "SEO", href: "/services/seo" },
          { label: "Digital Marketing", href: "/services/digital-marketing" },
          { label: "IT Consulting", href: "/services/it-consulting" },
          { label: "Digital Transformation", href: "/services/digital-transformation" },
        ],
      },
      {
        heading: "Automate",
        links: [
          { label: "AI Automation", href: "/services/ai-automation" },
          { label: "AI Agents", href: "/services/ai-agents" },
        ],
      },
    ],
  },
  {
    label: "AI Solutions",
    href: "/ai-solutions",
    featured: {
      title: "AI Readiness Assessment",
      description: "Find out where AI can cut costs and unlock growth in 5 minutes.",
      href: "/ai-solutions",
    },
    columns: [
      {
        heading: "Capabilities",
        links: [
          { label: "AI Automation", href: "/services/ai-automation" },
          { label: "AI Agents", href: "/services/ai-agents" },
          { label: "AI Strategy", href: "/ai-solutions" },
        ],
      },
      {
        heading: "By Industry",
        links: [
          { label: "AI for Healthcare", href: "/industries/healthcare" },
          { label: "AI for Fintech", href: "/industries/fintech" },
        ],
      },
    ],
  },
  {
    label: "Industries",
    href: "/industries",
    columns: [
      {
        heading: "Sectors",
        links: [
          { label: "Healthcare", href: "/industries/healthcare" },
          { label: "Fintech", href: "/industries/fintech" },
          { label: "Education", href: "/industries/education" },
          { label: "Manufacturing", href: "/industries/manufacturing" },
        ],
      },
      {
        heading: "More",
        links: [
          { label: "Government", href: "/industries/government" },
          { label: "NGOs", href: "/industries/ngos" },
          { label: "Real Estate", href: "/industries/real-estate" },
        ],
      },
    ],
  },
  { label: "Portfolio", href: "/portfolio" },
  {
    label: "Academy",
    href: "/academy",
    featured: {
      title: "Try the AI Career Advisor",
      description: "Answer a few questions and get matched to the right programme.",
      href: "/academy",
    },
    columns: [
      {
        heading: "Learn",
        links: [
          { label: "All Programmes", href: "/academy" },
          { label: "Software Development", href: "/academy/software-development" },
          { label: "AI Engineering", href: "/academy/ai-engineering" },
          { label: "UI/UX Design", href: "/academy/ui-ux-design" },
        ],
      },
      {
        heading: "More",
        links: [
          { label: "Data Analytics", href: "/academy/data-analytics" },
          { label: "Corporate Training", href: "/academy" },
          { label: "Graduate Stories", href: "/academy" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    columns: [
      {
        heading: "Read",
        links: [
          { label: "Insights / Blog", href: "/insights" },
          { label: "Portfolio", href: "/portfolio" },
        ],
      },
      {
        heading: "Download",
        links: [
          { label: "E-Books & Guides", href: "/resources" },
          { label: "Templates & Checklists", href: "/resources" },
          { label: "Industry Reports", href: "/resources" },
        ],
      },
    ],
  },
  { label: "Careers", href: "/careers" },
];

export const footerNav: NavColumn[] = [
  {
    heading: "Services",
    links: [
      { label: "Website Development", href: "/services/website-development" },
      { label: "Software Development", href: "/services/software-development" },
      { label: "AI Automation", href: "/services/ai-automation" },
      { label: "Digital Marketing", href: "/services/digital-marketing" },
      { label: "All Services", href: "/services" },
    ],
  },
  {
    heading: "Academy",
    links: [
      { label: "Programmes", href: "/academy" },
      { label: "Software Development", href: "/academy/software-development" },
      { label: "AI Engineering", href: "/academy/ai-engineering" },
      { label: "Corporate Training", href: "/academy" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Insights", href: "/insights" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Resource Hub", href: "/resources" },
      { label: "Industries", href: "/industries" },
      { label: "AI Solutions", href: "/ai-solutions" },
      { label: "Book a Consultation", href: "/contact#consultation" },
    ],
  },
];
