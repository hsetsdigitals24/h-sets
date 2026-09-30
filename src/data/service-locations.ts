/**
 * Service × location landing pages (/services/[slug]/[city]).
 *
 * These target the local commercial keywords with the least competition and the
 * highest intent — "website development in Ilorin", "SEO company Ilorin" — that
 * neither the national service page nor the city page ranks for on its own.
 *
 * Every pair is written by hand rather than generated from a template. The PRD
 * sets a hard 400-word minimum of differentiated content per programmatic page
 * and forbids indexing thin ones; a shared paragraph with the city name
 * interpolated is precisely what Google discounts, so a pair that has nothing
 * specific to say simply does not get a page.
 */

export type ServiceLocation = {
  service: string; // service slug — must exist in the services table
  city: string; // location slug — must exist in data/locations.ts
  serviceLabel: string;
  cityLabel: string;
  regionLabel: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  keywords: string[];
  sections: { heading: string; body: string[] }[];
  /** Local proof points rendered as a stat / "what you get" strip. */
  highlights: { title: string; description: string }[];
  faqs: { q: string; a: string }[];
};

export const serviceLocations: ServiceLocation[] = [
  {
    service: "website-development",
    city: "ilorin",
    serviceLabel: "Website Development",
    cityLabel: "Ilorin",
    regionLabel: "Kwara State",
    metaTitle: "Website Development in Ilorin, Kwara State",
    metaDescription:
      "Website design and development for Ilorin businesses. Fast on mobile data, built to rank in local search, delivered by a team you can visit in Kulende Estate, Sango.",
    h1: "Website Development in Ilorin, Kwara State",
    intro:
      "Websites for Ilorin businesses that load fast on mobile data, rank for local searches, and are built by a team you can actually walk in and meet.",
    keywords: [
      "website development Ilorin",
      "website design company Ilorin",
      "web developers Ilorin",
      "website designer Kwara State",
    ],
    sections: [
      {
        heading: "What an Ilorin business website has to survive",
        body: [
          "Almost every visitor to an Ilorin business site arrives on a mid-range Android phone, on mobile data they are paying for by the megabyte, often on a connection that drops to 3G without warning. A site built and tested on office broadband can feel perfectly fine to the person who commissioned it and be effectively unusable for the customers it was built for. That gap is where most of the enquiries go missing.",
          "So we build to a hard budget rather than to a look. Largest Contentful Paint under 2.5 seconds on a 4G connection, Lighthouse performance above 90 on mobile, images compressed and sized for the device that will actually request them. Those numbers are not vanity: Google uses them as ranking inputs, and every extra second measurably reduces the number of people still on the page when your call-to-action appears.",
          "The second thing an Ilorin site has to survive is scepticism. Buyers here have been let down by enough abandoned projects that a site which looks generic, has no address, no named people and no evidence of real work reads as a risk rather than an option. We build in the trust signals deliberately — a full street address, named team, real client work, working phone numbers and a WhatsApp route that goes to a person.",
        ],
      },
      {
        heading: "Built to be found in Ilorin, not just to exist",
        body: [
          "A website that nobody finds is an expensive brochure. For a business with a physical presence in Ilorin, the traffic that converts comes from local search: someone types what they need plus where they are, then calls one of the first few results. Ranking there is a structural job, and it is one most Ilorin competitors have simply not done.",
          "Every site we build ships with the local foundations in place — LocalBusiness structured data carrying your exact name, address and phone; a Google Business Profile claimed and completed; consistent NAP details wherever they appear; location-specific pages that answer what local buyers actually ask; and clean internal linking so the pages reinforce each other. Because competition for Kwara terms is thin, these fundamentals typically produce map-pack impressions within weeks rather than the quarters the same effort would take in Lagos.",
          "We also build the site so it can keep earning. A structured content model, a CMS your own team can use, and a blog architecture that lets you publish the questions your customers keep asking — so the site accumulates relevance instead of going stale the month after launch.",
        ],
      },
      {
        heading: "Working with a team in Kulende, not a number that stops answering",
        body: [
          "Our office is on Royal Valley Way, beside the CAC Olorunsogo Zonal Headquarters in Kulende Estate, Sango. You can sit down with the people who will write your code, agree the scope in the room, and come back when something needs changing. For a category where the most common bad experience is a developer who disappears, that is worth more than any portfolio.",
          "Engagements are scoped in writing with fixed deliverables, a timeline and a price. You see reviewable work at the end of every cycle rather than waiting for a single reveal. At hand-over you get the code, the hosting and domain accounts, the documentation and a training session for whoever will maintain it — in person, because you are down the road.",
        ],
      },
    ],
    highlights: [
      { title: "Under 2.5s", description: "Target load time on a 4G mobile connection." },
      { title: "90+ mobile", description: "Lighthouse performance score on every build." },
      { title: "3–6 weeks", description: "Typical delivery for a marketing site." },
      { title: "You own it", description: "Code, domain and hosting accounts hand over to you." },
    ],
    faqs: [
      {
        q: "How much does a website cost in Ilorin?",
        a: "We price per project, not per hour, and scope drives the number. A focused marketing site for a small or mid-sized Ilorin business typically costs well below a comparable Lagos quote because our cost base is here. You get a fixed price with fixed deliverables before any work starts.",
      },
      {
        q: "How long does it take?",
        a: "Three to six weeks for a typical marketing site, assuming content is ready. Larger builds with e-commerce, booking or custom functionality run longer and we scope the timeline explicitly rather than estimating it loosely.",
      },
      {
        q: "Can I meet you in person before committing?",
        a: "Yes — that is usually the fastest way to decide. Our office is in Kulende Estate, Sango, Ilorin. Call +234 707 819 8353 to arrange a time.",
      },
      {
        q: "Will my site show up on Google for Ilorin searches?",
        a: "That is designed in, not added later. Every build ships with LocalBusiness structured data, a completed Google Business Profile, consistent NAP details and location-targeted pages. Kwara local competition is thin enough that these fundamentals usually start producing map-pack impressions within four to eight weeks.",
      },
      {
        q: "Can my team update the site ourselves?",
        a: "Yes. We hand over a structured CMS and run a training session so your team can publish and edit without calling us. Ongoing support is available if you want it, but it is never a condition of being able to use your own site.",
      },
      {
        q: "Do you take payments online?",
        a: "Where you need it, yes — integrated with Paystack and Flutterwave including card, bank transfer and USSD, because a checkout that assumes every customer holds a working debit card loses sales here every day.",
      },
    ],
  },
  {
    service: "seo",
    city: "ilorin",
    serviceLabel: "SEO",
    cityLabel: "Ilorin",
    regionLabel: "Kwara State",
    metaTitle: "SEO Company in Ilorin, Kwara State",
    metaDescription:
      "Local SEO for Ilorin businesses. Google Business Profile, map-pack rankings, local content and technical fixes — from an Ilorin-based team that does this for itself first.",
    h1: "SEO in Ilorin, Kwara State",
    intro:
      "Local search in Kwara is winnable in weeks, not years — because almost nobody here has done the basics properly. We do them, for our clients and for ourselves.",
    keywords: [
      "SEO company Ilorin",
      "SEO services Kwara State",
      "local SEO Ilorin",
      "Google Business Profile Ilorin",
    ],
    sections: [
      {
        heading: "Why Ilorin is the easiest local search market you will ever compete in",
        body: [
          "Ranking for a commercial keyword in Lagos means outspending agencies with years of accumulated domain authority and full-time content teams. Ranking in Ilorin usually means doing the things your competitors have not done at all: claiming a Google Business Profile, filling it in properly, publishing a page that actually targets the local search, and putting structured data on it.",
          "Survey the first page for most Kwara commercial terms and you find a Facebook page, a directory listing, a site with no address and a competitor whose profile has one photo and no hours. That is not a market you have to outspend. It is a market where competent execution wins quickly — we routinely see map-pack impressions inside four to eight weeks, where the same work in Lagos would be a six-to-twelve-month project.",
          "The catch is that the window is exactly as open for your competitors. Local search rewards whoever does the work first and then keeps doing it, and reclaiming a position from an established local result is much harder than taking a vacant one.",
        ],
      },
      {
        heading: "What we actually do",
        body: [
          "The first job is the Google Business Profile: claimed, verified, correctly categorised, with complete hours, a real service list, ten or more genuine photographs and a review flow that keeps new ones arriving. For a business with a physical location in Ilorin, the map pack drives more phone calls than the organic results below it, and the profile is the thing that decides whether you appear in it.",
          "The second is consistency. Your name, address and phone number must match exactly — character for character — across your website, your profile and every directory that lists you. Inconsistent NAP details are the single most common reason a legitimate Ilorin business fails to rank locally, and it is unglamorous, entirely fixable work.",
          "The third is on-site: LocalBusiness structured data, location pages that answer real local questions, internal linking that connects them to your service pages, and the technical fundamentals — crawlability, page speed, Core Web Vitals — that decide whether any of it gets indexed. The fourth is content: the questions your customers actually ask, answered properly, published consistently, so the site accumulates topical authority rather than sitting still.",
        ],
      },
      {
        heading: "Reported in enquiries, not in impressions",
        body: [
          "We report on the things that pay: calls from the map pack, form submissions, WhatsApp clicks and rankings for the specific commercial terms tied to those. Impressions and average position are diagnostics, not results, and we treat them as such.",
          "You also get the account access. Search Console, Analytics and the Business Profile are yours, verified in your name, so you can check everything we report and take the work in-house whenever you want. An agency that keeps its clients locked out of their own search data is telling you something.",
          "This is the same discipline we run on h-sets.com — location pages, structured data, a complete profile, consistent NAP and genuine content depth. We would rather you judged us on whether we can rank ourselves.",
        ],
      },
    ],
    highlights: [
      { title: "4–8 weeks", description: "Typical time to first map-pack impressions in Kwara." },
      { title: "Your accounts", description: "Search Console, Analytics and GBP verified in your name." },
      { title: "NAP audit", description: "Every listing reconciled to one exact address string." },
      { title: "Calls, not clicks", description: "Reporting tied to enquiries and phone calls." },
    ],
    faqs: [
      {
        q: "How long before we see results in Ilorin?",
        a: "Technical fixes and Google Business Profile work usually produce map-pack impressions within four to eight weeks, because local competition in Kwara is thin. Broader organic rankings for competitive commercial terms build over three to six months.",
      },
      {
        q: "Do we need a new website for SEO to work?",
        a: "Not necessarily. We audit what you have first. If the foundation is sound we fix speed, structure and local signals on top of it. If the site is fundamentally fighting you we will say so and quote a rebuild rather than charging monthly to maintain something that cannot rank.",
      },
      {
        q: "Can you set up and manage our Google Business Profile?",
        a: "Yes — claiming, verification, categories, service list, photography, posts and review generation. The profile is verified in your name and you keep ownership of it.",
      },
      {
        q: "What does SEO cost?",
        a: "We scope a fixed initial engagement — audit, technical fixes and local foundations — then an optional monthly retainer for content and ongoing work. Both are quoted up front with defined deliverables, never as an open-ended hourly arrangement.",
      },
      {
        q: "Do you guarantee a number one ranking?",
        a: "No, and nobody credible does — Google does not sell that and cannot be made to promise it. What we can commit to are the specific deliverables, the reporting, and a frank assessment of how winnable your target terms are before you spend anything.",
      },
      {
        q: "Do you also work on AI search visibility?",
        a: "Yes. We structure content as entities with clean schema so it can be retrieved and cited by ChatGPT, Perplexity and Gemini — an increasing share of commercial research now starts there rather than in a search box.",
      },
    ],
  },
  {
    service: "digital-marketing",
    city: "ilorin",
    serviceLabel: "Digital Marketing",
    cityLabel: "Ilorin",
    regionLabel: "Kwara State",
    metaTitle: "Digital Marketing Agency in Ilorin, Kwara State",
    metaDescription:
      "Digital marketing for Ilorin businesses — measured in enquiries, calls and bookings rather than likes. Local campaigns, WhatsApp-first funnels and honest reporting.",
    h1: "Digital Marketing in Ilorin, Kwara State",
    intro:
      "Campaigns for Ilorin businesses measured in enquiries, calls and bookings — not in likes, reach or any other number that does not pay a salary.",
    keywords: [
      "digital marketing agency Ilorin",
      "social media marketing Ilorin",
      "advertising agency Kwara State",
      "online marketing Ilorin",
    ],
    sections: [
      {
        heading: "Most marketing spend in Ilorin buys attention nobody can bank",
        body: [
          "The standard arrangement here is a monthly fee, a stream of posts and a report full of reach, impressions and follower growth. None of those numbers tell you whether the money produced a customer, and after six months most owners cannot say whether they are better off. The problem is not effort — it is that nothing in the arrangement was ever tied to an enquiry.",
          "We start from the other end. Before a campaign runs we agree what a lead is worth to you, where leads currently come from, and how one will be tracked from first click to signed customer. That means tracking set up properly — call tracking, WhatsApp click events, form submissions, offline conversions where a deal closes in person — so the reporting can answer the only question that matters.",
          "It also means being willing to tell you that a channel is not working. A campaign that produces reach and no enquiries gets cut, not optimised indefinitely because cutting it would shrink the retainer.",
        ],
      },
      {
        heading: "What works in the Kwara market specifically",
        body: [
          "WhatsApp is the conversion surface, not an afterthought. For most Ilorin B2B and service buyers the first contact attempt is a WhatsApp message, not a form — so the funnel is built around getting a qualified conversation started there, with a pre-filled message carrying the page context, and a response process on your side that does not leave it sitting for two days.",
          "Local paid social works well here because the audiences are small enough to target tightly and the cost per result is a fraction of Lagos. Meta and Google campaigns scoped to Ilorin and the surrounding towns, with creative shot for a local audience rather than borrowed from a stock library, consistently outperform broad national spend for a business whose customers are all within driving distance.",
          "And organic local search underpins all of it. Paid stops the day you stop paying; a business that also ranks in the map pack for its category has a floor of enquiries that costs nothing per click. We usually sequence the two deliberately — paid to produce enquiries now, search to reduce what those enquiries cost over the next year.",
        ],
      },
      {
        heading: "How we report",
        body: [
          "One monthly report, in plain language, covering enquiries generated, what each cost, which channel produced them and what we are changing next month. Vanity metrics appear only where they diagnose something. If a number went backwards, the report says so and says why.",
          "All accounts — ad accounts, analytics, business profile, pixels — are created and verified in your name. You can log in and check anything in the report, and if you end the engagement you keep the history and the audiences rather than starting from zero somewhere else.",
        ],
      },
    ],
    highlights: [
      { title: "Cost per enquiry", description: "The headline metric on every report." },
      { title: "WhatsApp-first", description: "Funnels built around how Nigerian buyers actually make contact." },
      { title: "Your accounts", description: "Ad accounts, pixels and audiences owned by you." },
      { title: "Local creative", description: "Shot for a Kwara audience, not borrowed from stock." },
    ],
    faqs: [
      {
        q: "What budget do we need to start?",
        a: "Enough for the data to mean something — for a local Ilorin campaign that is usually a modest monthly ad spend plus a management fee, and we will tell you honestly if your budget is too small to learn anything rather than taking it anyway.",
      },
      {
        q: "Do you handle content and creative?",
        a: "Yes — copy, design and locally shot photo and video. Creative made for a Kwara audience consistently outperforms stock imagery, and we would rather produce it than caption someone else's.",
      },
      {
        q: "Can you track leads that close over the phone or in person?",
        a: "Yes. Call tracking, WhatsApp click events and offline conversion import mean a deal closed in your office can still be attributed back to the campaign that started it.",
      },
      {
        q: "Do we own the ad accounts?",
        a: "Always. Accounts, pixels and audiences are created and verified in your name. If you leave, you take the history with you.",
      },
      {
        q: "How soon will we see enquiries?",
        a: "Paid campaigns produce enquiries in the first weeks; the first month is mostly learning which audience and message converts. Organic and local search work compounds over three to six months and lowers what those enquiries cost.",
      },
      {
        q: "Do you require a long contract?",
        a: "No. We work month to month after an initial setup engagement. An agency that needs a twelve-month lock-in to keep a client is telling you what its results look like in month four.",
      },
    ],
  },
  {
    service: "software-development",
    city: "ilorin",
    serviceLabel: "Software Development",
    cityLabel: "Ilorin",
    regionLabel: "Kwara State",
    metaTitle: "Software Development Company in Ilorin, Kwara State",
    metaDescription:
      "Custom software for Ilorin and Kwara businesses — inventory, scheduling, records, portals and dashboards. Built by a resident engineering team you can meet in person.",
    h1: "Software Development in Ilorin, Kwara State",
    intro:
      "Custom internal systems for Ilorin businesses that have outgrown the spreadsheet — built, documented and handed over by engineers based here.",
    keywords: [
      "software development company Ilorin",
      "custom software Kwara State",
      "software developers Ilorin",
      "app development Ilorin",
    ],
    sections: [
      {
        heading: "The spreadsheet-and-WhatsApp ceiling",
        body: [
          "Nearly every custom software project we take on in Ilorin starts from the same place: a spreadsheet that three people edit, a WhatsApp group where decisions get made, and one person who is the only one who genuinely understands how it all fits together. It works — until volume doubles, or that person travels, or two versions of the truth appear and nobody can establish which is correct.",
          "The cost of staying there is rarely a single dramatic failure. It is a steady tax: hours lost reconciling, stock written off, invoices missed, decisions made on numbers a week out of date, and a business that cannot open a second branch because the system is a person rather than a process.",
          "Replacing it does not mean buying enterprise software you will use eight percent of. It means building the specific thing your operation actually runs on — real records, permissions, an audit trail and reporting — so the knowledge lives in the system rather than in somebody's head.",
        ],
      },
      {
        heading: "What we build for Kwara operations",
        body: [
          "Inventory and stock systems that keep multiple locations straight. Job and field-service tracking with mobile capture for staff who are not at a desk. Scheduling and booking for clinics, schools and service businesses. Records and approvals workflows with a real audit trail. Customer portals, dashboards and reporting that give leadership a current number rather than last month's.",
          "Where the network is unreliable — and across Kwara it often is — we build offline-tolerant capture that queues locally and syncs when a signal returns, instead of an application that simply fails at the moment someone is standing in a warehouse trying to use it.",
          "We integrate rather than replace wherever that is the cheaper answer. If your accounting package works, the new system talks to it. Ripping out something functional to justify a bigger build is not engineering, it is billing.",
        ],
      },
      {
        heading: "Why being local changes the outcome",
        body: [
          "Internal software fails far more often on adoption than on code. The system that nobody uses is worse than the spreadsheet it replaced, and adoption is won in the room — sitting with the storekeeper, watching what they actually do, discovering the step that only exists because of a supplier's habit nobody documented.",
          "Being based in Kulende Estate, Sango means discovery happens on your premises, training happens with your staff present, and the first difficult week after go-live has someone physically available. That is not a nicety; it is the difference between a system that sticks and an expensive abandoned login.",
          "Hand-over includes the source code, the repositories, the infrastructure accounts and written documentation. You can retain us for support and iteration, or take it entirely in-house. Both are legitimate outcomes and we scope for either from the start.",
        ],
      },
    ],
    highlights: [
      { title: "On-site discovery", description: "We watch the real process before we design anything." },
      { title: "Offline-tolerant", description: "Capture that queues and syncs when the network returns." },
      { title: "You own the code", description: "Repositories, infrastructure and documentation hand over." },
      { title: "In-person training", description: "Go-live support with your staff in the room." },
    ],
    faqs: [
      {
        q: "How much does custom software cost?",
        a: "It depends entirely on scope, which is why we scope before we quote. A focused internal system for a single operation is a very different number from a multi-branch platform, and we give you a fixed price against defined deliverables rather than an hourly rate that can run.",
      },
      {
        q: "Should we buy off-the-shelf software instead?",
        a: "Sometimes, and we will say so. If an existing product covers most of what you need at a fraction of the cost, buying it and configuring it is the right answer. We build custom where the fit genuinely is not there — usually because the process is what makes your business work.",
      },
      {
        q: "Will it work when the network is down?",
        a: "Where that matters, yes. We build offline-tolerant data capture that stores locally and syncs when connectivity returns, rather than an application that stops being usable the moment the signal does.",
      },
      {
        q: "Who owns the code?",
        a: "You do, from the start. Repositories, infrastructure accounts and documentation are yours and hand over at the end of the engagement.",
      },
      {
        q: "How long does a project take?",
        a: "A focused internal system typically runs eight to sixteen weeks from discovery to go-live. We deliver in short cycles with something reviewable at the end of each, so you are not waiting months for a single reveal.",
      },
      {
        q: "Can you maintain it afterwards, or train our own people?",
        a: "Either. We offer ongoing support retainers, and we also hand over to in-house teams — including staff trained through the H-SETS Academy here in Ilorin. A client who can run their own system is a client who comes back for the next one.",
      },
    ],
  },
];

export function getServiceLocation(service: string, city: string) {
  return serviceLocations.find((sl) => sl.service === service && sl.city === city);
}
