/**
 * Location landing pages (/locations/[slug]).
 *
 * Local commercial intent ("website design company Ilorin", "software company
 * in Kwara") has near-zero competition in our markets, and nothing on the site
 * targeted it before. Each entry carries genuinely differentiated copy — the
 * PRD's programmatic-SEO rule is a hard minimum of 400 unique words per page,
 * and a templated paragraph with the city name swapped in is exactly the thin
 * content Google discounts.
 *
 * `isOffice` marks the one location with a real, staffed address: only that
 * page emits LocalBusiness schema with a postal address and geo point. Claiming
 * a physical presence in a city where we have none is both a schema violation
 * and a trust problem if a client checks.
 */

export type LocationService = {
  /** Slug of the parent service page this links back to. */
  slug: string;
  label: string;
  /** Locally-framed one-liner — not a copy of the service page's `short`. */
  blurb: string;
};

export type Location = {
  slug: string;
  /** City or state name as it appears in copy. */
  city: string;
  /** Administrative region, e.g. "Kwara State". */
  region: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** Hero standfirst. */
  intro: string;
  /** Long-form body. Each location's sections are written for that market. */
  sections: { heading: string; body: string[] }[];
  services: LocationService[];
  faqs: { q: string; a: string }[];
  /** True only for the staffed office — drives LocalBusiness + address schema. */
  isOffice: boolean;
  /** Other locations to cross-link from this page. */
  nearby: string[];
  /** Keyword hints for metadata. */
  keywords: string[];
};

export const locations: Location[] = [
  {
    slug: "ilorin",
    city: "Ilorin",
    region: "Kwara State",
    isOffice: true,
    metaTitle: "Digital Agency & Software Company in Ilorin, Kwara State",
    metaDescription:
      "H-SETS is a software, AI and digital marketing company based in Ilorin, Kwara State. Websites, custom software, automation and SEO for businesses across Kwara — built locally, to an international standard.",
    h1: "Digital Agency & Software Company in Ilorin, Nigeria",
    intro:
      "We are based in Ilorin. Not a satellite office, not a reseller — the team that builds your software, writes your content and answers your calls works from Kulende Estate, Sango.",
    keywords: [
      "software company Ilorin",
      "website design company Ilorin",
      "digital agency Ilorin",
      "IT company Kwara State",
      "web developers Ilorin",
    ],
    sections: [
      {
        heading: "A technology partner you can actually visit",
        body: [
          "Most Nigerian businesses that buy software buy it from someone they have never met. The brief goes out over WhatsApp, the money goes out on trust, and when something breaks six months later the number no longer connects. That pattern is the single biggest reason owners in Ilorin hesitate before commissioning a serious digital project, and it is a reasonable hesitation — plenty of people have been burned.",
          "H-SETS is registered and staffed in Ilorin. Our office is on Royal Valley Way, beside the CAC Olorunsogo Zonal Headquarters in Kulende Estate, Sango. Clients come in, sit down with the engineers who will write their code, and leave with a scope they understood before they signed it. When a system needs a hand-over session or a training day for your staff, we do it in the room rather than over a call that drops.",
          "Being here also changes what we build. We have watched enough Kwara businesses run on a mid-range Android and a data bundle to treat page weight as a commercial constraint rather than a technical preference, and we design payment flows around bank transfer and USSD because a checkout that assumes everybody holds a working debit card loses sales here every single day.",
        ],
      },
      {
        heading: "What Ilorin businesses usually come to us for",
        body: [
          "The most common first project is a website that a serious buyer will believe. Ilorin has a deep base of schools, clinics, hospitality, logistics operators, estate developers and professional practices whose entire online presence is a Facebook page and a phone number. A fast, well-structured site with real service pages moves those businesses from invisible to findable — and, because local search competition here is so much thinner than in Lagos, the return on a well-optimised site arrives faster than most owners expect.",
          "The second is internal software. A growing business in Ilorin typically runs on a spreadsheet that three people edit and a WhatsApp group where decisions get made. That works until volume doubles or the one person who understands the system takes leave. We replace that layer with real records, permissions and an audit trail — job tracking, inventory, scheduling, approvals, field reporting — so the business stops depending on institutional memory.",
          "The third is automation and AI. Routine customer questions, quotation requests, appointment reminders, order confirmations and reconciliation are the work that quietly eats a small team's week. Automating them does not require replacing anyone; it frees the people you already employ to do the work that actually needs judgement.",
        ],
      },
      {
        heading: "Why local search matters more here than anywhere else",
        body: [
          "Search behaviour in Kwara is overwhelmingly local and overwhelmingly mobile. People search for what they need plus where they are — \"printing press in Ilorin\", \"dental clinic Tanke\", \"school in GRA\" — and then call the first credible result. For a business with a physical location, ranking in the Google local pack for those searches is worth more than any amount of national brand advertising.",
          "The competition for those terms is remarkably weak. In Lagos, ranking for a commercial keyword means outspending established agencies with years of accumulated authority. In Ilorin, most competitors have no structured data, no location page, no complete Google Business Profile and no content beyond a homepage. A properly built local presence can reach the top of those results within a couple of months rather than a couple of years.",
          "That is the work we do for our own clients and for ourselves: a claimed and complete Google Business Profile, consistent name-address-phone details everywhere they appear, LocalBusiness structured data, genuine reviews, and location-specific pages that answer what local buyers actually ask.",
        ],
      },
      {
        heading: "How an engagement runs",
        body: [
          "We start with a free consultation, in person at our Ilorin office or over a call if that is easier. The point of it is to establish whether there is a real commercial problem worth solving; if there is not, we say so rather than selling you a website. From there we scope the work in writing, with fixed deliverables, a timeline and a price, so nothing about the cost is discovered later.",
          "Delivery runs in short cycles with something reviewable at the end of each one. You see the work as it is built rather than at a single reveal, which is how scope drift and unpleasant surprises get caught early. At hand-over you get the code, the accounts, the documentation and a training session — we do not hold your business hostage to our login details.",
          "After launch you can retain us for support, growth and iteration, or take it entirely in-house. Both are fine. A client who can run their own platform is a client who comes back for the next one.",
        ],
      },
    ],
    services: [
      {
        slug: "website-development",
        label: "Website Development",
        blurb:
          "Fast, search-ready websites for Ilorin businesses — built to load on mobile data and rank for local searches.",
      },
      {
        slug: "software-development",
        label: "Software Development",
        blurb:
          "Custom internal systems that replace the spreadsheet-and-WhatsApp layer growing Kwara businesses outgrow.",
      },
      {
        slug: "seo",
        label: "SEO",
        blurb:
          "Local SEO that puts you in the Google map pack for the \"in Ilorin\" searches your customers actually run.",
      },
      {
        slug: "digital-marketing",
        label: "Digital Marketing",
        blurb:
          "Campaigns measured in enquiries and bookings from Kwara — not in likes.",
      },
      {
        slug: "ai-automation",
        label: "AI Automation",
        blurb:
          "Automate the quotes, reminders and routine replies that eat your team's week.",
      },
      {
        slug: "ui-ux-design",
        label: "UI/UX Design",
        blurb:
          "Interfaces designed for the devices and connection speeds your customers really have.",
      },
    ],
    faqs: [
      {
        q: "Where exactly is the H-SETS office in Ilorin?",
        a: "Along Royal Valley Way, beside the CAC Olorunsogo Zonal Headquarters, Kulende Estate, Sango, Ilorin, Kwara State. Visits are welcome — call ahead on +234 707 819 8353 so the right person is available.",
      },
      {
        q: "Do you only work with businesses in Ilorin?",
        a: "No. Ilorin is where we are based, and we work with clients across Kwara, Lagos, Abuja and outside Nigeria. Being local simply means Kwara clients can meet us in person whenever they prefer to.",
      },
      {
        q: "How much does a website cost for a business in Ilorin?",
        a: "It depends on scope, but a focused marketing site for a small or mid-sized Ilorin business typically lands well below what a Lagos agency would quote for the same work, because our cost base is here. We price per project with fixed deliverables, never per hour, so the number you agree is the number you pay.",
      },
      {
        q: "How long before a new site starts bringing in local enquiries?",
        a: "Technical and local-search fundamentals — Google Business Profile, structured data, location pages — usually start producing map-pack impressions within four to eight weeks in Kwara, because local competition is thin. Broader organic rankings build over three to six months.",
      },
      {
        q: "Can you support our existing site instead of rebuilding it?",
        a: "Often, yes. We audit what you have first. If the foundation is sound we fix performance, structure and local SEO on top of it; if it is fighting you, we say so and quote a rebuild rather than charging you to maintain something that cannot be made to work.",
      },
      {
        q: "Do you train our staff to manage the system afterwards?",
        a: "Yes, and we do it in person for Ilorin clients. Hand-over includes the accounts, documentation and a working session with the people who will use the system day to day.",
      },
    ],
    nearby: ["kwara", "lagos"],
  },
  {
    slug: "kwara",
    city: "Kwara",
    region: "Kwara State",
    isOffice: false,
    metaTitle: "Software, Web & Digital Marketing Company in Kwara State",
    metaDescription:
      "H-SETS serves businesses across Kwara State from our Ilorin base — websites, custom software, AI automation and SEO for Offa, Omu-Aran, Jebba, Lafiagi, Patigi and beyond.",
    h1: "Technology & Digital Services Across Kwara State",
    intro:
      "From our Ilorin office we build software, websites and growth systems for businesses across Kwara — Offa, Omu-Aran, Jebba, Lafiagi, Patigi and everywhere in between.",
    keywords: [
      "software company Kwara State",
      "web design Kwara",
      "IT services Kwara State",
      "digital marketing Kwara",
    ],
    sections: [
      {
        heading: "One state, several very different markets",
        body: [
          "Kwara is not a single commercial market and treating it as one produces bad technology. Ilorin behaves like a small city: competitive, service-heavy, with buyers who compare options online before they call. Offa and Omu-Aran run on established trade and education networks where reputation travels by word of mouth long before it reaches a search engine. The riverine and agricultural belt around Jebba, Lafiagi and Patigi has different connectivity realities again, where a heavy web application is simply unusable for half the people who need it.",
          "What that means in practice is that the right build differs by where your customers are. For a school group recruiting across the state, the priority is a light, fast site that loads on a weak connection and answers admission questions without a phone call. For a trading business in Offa, it is usually an internal system that keeps stock and credit straight across branches. For an agricultural operation, it is often offline-tolerant data capture that syncs when a signal returns.",
          "We scope against those realities rather than against a template. The technology choices follow from where the work will actually be used.",
        ],
      },
      {
        heading: "What we deliver to Kwara businesses",
        body: [
          "Business websites and e-commerce that load quickly on mobile data and convert enquiries rather than collecting compliments. Custom internal software — inventory, scheduling, records, approvals, field reporting — for operations that have outgrown spreadsheets. AI automation for the routine correspondence and reconciliation that consumes a small team. And search and marketing work that targets the specific, low-competition local terms Kwara buyers actually type.",
          "Alongside client work we run the H-SETS Academy, which trains Kwara residents into employable software, design, data and marketing roles. For employers in the state that has a practical consequence: the pool of people who can maintain what we build for you is one we are actively growing, in your state, rather than one you have to import from Lagos at Lagos rates.",
        ],
      },
      {
        heading: "Working with a Kwara-based team",
        body: [
          "Distance inside Kwara is measured in hours, not days, so an on-site discovery session, a training day or a launch-week visit is a normal part of how we work rather than an expensive exception. For clients in Offa, Omu-Aran and the surrounding towns we typically run discovery in person and delivery remotely, which keeps cost down without losing the trust that face-to-face builds.",
          "Every engagement is scoped in writing with fixed deliverables, a timeline and a price. You own the code and the accounts at the end of it. If you would rather see the office and the people before committing anything, our Ilorin address is open — that is usually the fastest way to settle whether we are the right partner.",
        ],
      },
    ],
    services: [
      {
        slug: "website-development",
        label: "Website Development",
        blurb: "Light, fast sites that work on the connections your Kwara customers actually have.",
      },
      {
        slug: "software-development",
        label: "Software Development",
        blurb: "Multi-branch inventory, records and approvals for operations spread across the state.",
      },
      {
        slug: "seo",
        label: "SEO",
        blurb: "Rank for the town-level searches your buyers run before they call anyone.",
      },
      {
        slug: "it-consulting",
        label: "IT Consulting",
        blurb: "Independent advice on what to build, buy or leave alone.",
      },
      {
        slug: "ai-automation",
        label: "AI Automation",
        blurb: "Cut the routine correspondence that eats a small team's week.",
      },
      {
        slug: "digital-marketing",
        label: "Digital Marketing",
        blurb: "Reach buyers across Kwara with campaigns measured in enquiries.",
      },
    ],
    faqs: [
      {
        q: "Do you travel to clients outside Ilorin?",
        a: "Yes. Discovery sessions, training days and launch support across Kwara are part of how we work — Offa, Omu-Aran, Jebba, Lafiagi and Patigi included.",
      },
      {
        q: "Can you build something that works where the network is poor?",
        a: "Yes. Where connectivity is unreliable we build offline-tolerant data capture that queues locally and syncs when a signal returns, rather than an application that simply fails.",
      },
      {
        q: "Do you work with schools and institutions in Kwara?",
        a: "Regularly. Admissions sites, student record systems, results portals and parent communication are among the most common projects we take on in the state.",
      },
      {
        q: "Can you help us hire technical staff locally?",
        a: "The H-SETS Academy trains software, design, data and marketing talent in Kwara, and graduates who opt in are listed in our talent pool. Employers can brief us on a role and we will point you at candidates.",
      },
      {
        q: "Is there an in-person office we can visit?",
        a: "Our office is in Kulende Estate, Sango, Ilorin — Along Royal Valley Way, beside the CAC Olorunsogo Zonal Headquarters. Call +234 707 819 8353 before visiting.",
      },
    ],
    nearby: ["ilorin", "lagos"],
  },
  {
    slug: "lagos",
    city: "Lagos",
    region: "Lagos State",
    isOffice: false,
    metaTitle: "Software Development & Digital Agency for Lagos Businesses",
    metaDescription:
      "H-SETS builds software, AI automation and high-performance websites for Lagos businesses — senior engineering at a cost base outside Lagos, delivered remotely with in-person milestones.",
    h1: "Software & Digital Services for Lagos Businesses",
    intro:
      "Senior engineering, AI and growth work for Lagos companies — delivered remotely from Ilorin, with in-person milestones in Lagos when they matter.",
    keywords: [
      "software development company Lagos",
      "web development agency Lagos",
      "AI automation Lagos",
      "digital agency Lagos",
    ],
    sections: [
      {
        heading: "Lagos-grade delivery without the Lagos cost base",
        body: [
          "Lagos has the deepest technology market in West Africa and the price to match. Agency day rates there reflect Lagos rent, Lagos salaries and Lagos churn — and for a lot of well-run companies the arithmetic no longer works, particularly for the second and third systems that matter commercially but do not justify a flagship budget.",
          "We are based in Ilorin, which means our cost base is structurally lower while the engineering bar is not. The people who write your code are senior, they work on your project rather than rotating across five, and the same team stays with the system through delivery and support. For most Lagos clients that translates into a meaningfully lower quote for the same scope, with fewer hand-offs.",
          "Remote delivery is the default because it is genuinely better for this kind of work: written scopes, short review cycles, and something reviewable at the end of every sprint. Where in-person matters — discovery workshops, stakeholder sessions, launch week, staff training — we come to Lagos and do it in the room.",
        ],
      },
      {
        heading: "What Lagos clients typically engage us for",
        body: [
          "Custom software is the bulk of it: operations platforms, customer portals, dashboards and integrations that sit between the tools a growing company has already bought. Lagos businesses tend to arrive with a real, specific operational bottleneck rather than a vague desire for a website, which makes for good projects.",
          "AI automation and agents are the fastest-growing part of the practice. First-line customer response across web and WhatsApp, lead qualification, document processing and internal retrieval over a company's own knowledge — each with a human in the loop wherever judgement is required. Done properly these raise service quality rather than degrading it, because the most common complaint is not \"I spoke to a bot\" but \"nobody replied for two days\".",
          "And high-performance websites, particularly where an existing site is fast enough on office fibre but unusable on the mobile connection most Nigerian visitors are actually on. That gap is where a surprising share of lost enquiries live.",
        ],
      },
      {
        heading: "How we work with clients we are not next door to",
        body: [
          "Scope is written down before anything is built: deliverables, timeline, price. Delivery runs in short cycles with a reviewable increment at the end of each, so you are never waiting on a single reveal. Communication sits in one agreed channel with a named contact on our side, not scattered across three WhatsApp groups.",
          "You own the code, the repositories, the cloud accounts and the documentation throughout — not at the end, and not conditionally. Hand-over includes a working session with whoever will run the system. Clients who want ongoing support retain us; clients who want to take it in-house can, and we would rather that than a dependency neither side enjoys.",
        ],
      },
    ],
    services: [
      {
        slug: "software-development",
        label: "Software Development",
        blurb: "Operations platforms, portals and integrations for Lagos companies with a real bottleneck.",
      },
      {
        slug: "ai-automation",
        label: "AI Automation",
        blurb: "Automate first-line response, qualification and document work — with humans kept in the loop.",
      },
      {
        slug: "ai-agents",
        label: "AI Agents",
        blurb: "Always-on agents across your site, WhatsApp and internal tools.",
      },
      {
        slug: "website-development",
        label: "Website Development",
        blurb: "Sites that stay fast on the mobile connections your customers are actually using.",
      },
      {
        slug: "digital-transformation",
        label: "Digital Transformation",
        blurb: "Sequencing what to fix first when everything looks urgent.",
      },
      {
        slug: "seo",
        label: "SEO",
        blurb: "Earn organic demand in the most competitive market in the country.",
      },
    ],
    faqs: [
      {
        q: "Do you have an office in Lagos?",
        a: "No — our office is in Ilorin, Kwara State, and we say so plainly rather than listing a virtual Lagos address. We travel to Lagos for discovery workshops, stakeholder sessions, launch week and staff training.",
      },
      {
        q: "Is remote delivery a problem for a Lagos client?",
        a: "In practice it is an advantage: written scopes, short review cycles and a reviewable increment every sprint produce fewer surprises than a co-located team with informal process. The milestones that genuinely benefit from being in a room, we do in a room.",
      },
      {
        q: "How does your pricing compare with a Lagos agency?",
        a: "Usually materially lower for the same scope, because our cost base is outside Lagos. We quote per project with fixed deliverables rather than per hour, so the comparison is straightforward.",
      },
      {
        q: "Who actually writes the code?",
        a: "Senior engineers on our staff. We do not subcontract delivery, and the team that builds the system is the team that supports it.",
      },
      {
        q: "Can you work alongside our existing in-house team?",
        a: "Yes. A good share of our Lagos work is embedded delivery — we take a defined workstream, work to your standards and repositories, and hand it back documented.",
      },
    ],
    nearby: ["ilorin", "kwara"],
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
