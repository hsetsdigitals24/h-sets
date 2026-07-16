export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  initials: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Adaeze Okonkwo",
    role: "CEO",
    company: "MediLogix Health",
    quote:
      "H-SETS rebuilt our entire patient platform and the difference is night and day. Booking is up 60% and our team finally has systems that work the way we do.",
    rating: 5,
    initials: "AO",
  },
  {
    name: "Chukwuemeka Eze",
    role: "Software Developer",
    company: "Paystack",
    quote:
      "I came in with an economics degree and no code. Five months later I had a portfolio and a job offer. The cohort structure and mentorship made all the difference.",
    rating: 5,
    initials: "CE",
  },
  {
    name: "Babatunde Alabi",
    role: "L&D Director",
    company: "FirstBridge Financial",
    quote:
      "We've run two corporate cohorts with H-SETS for 80 staff. The reporting and accountability are exactly what our HR team needed. A genuine training partner.",
    rating: 5,
    initials: "BA",
  },
  {
    name: "Ngozi Eze",
    role: "Founder",
    company: "Bloom Retail",
    quote:
      "The AI automation H-SETS built saves us roughly fifteen hours a week. It paid for itself in the first two months. I only wish we'd done it sooner.",
    rating: 5,
    initials: "NE",
  },
  {
    name: "Daniel Mensah",
    role: "Product Lead",
    company: "Kudi Africa",
    quote:
      "Professional, fast and genuinely strategic. They pushed back when we were wrong and the product is better for it. Rare in an agency.",
    rating: 5,
    initials: "DM",
  },
  {
    name: "Fatima Bello",
    role: "Graduate, AI Engineering",
    company: "Now at Andela",
    quote:
      "The AI Engineering track is the real deal. We shipped actual production projects, not toy examples. It directly landed me my role.",
    rating: 5,
    initials: "FB",
  },
];

export const clientLogos = [
  "Paystack",
  "Andela",
  "Kuda",
  "Flutterwave",
  "Interswitch",
  "MediLogix",
  "FirstBridge",
  "Bloom Retail",
];
