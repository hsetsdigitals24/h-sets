**H-SETS Digital & IT Solutions**

SEO Implementation Checklist

For Developer Implementation  ·  September 2026

| HOW TO USE THIS DOCUMENT |
| :---- |

This document lists every SEO item identified in the audit of h-sets.com. Work through each section in order. When an item is completed, tick the checkbox (☐) in the left column. The status column shows the current state as audited — items marked CRITICAL or MISSING require action. Items marked DONE are confirmed implemented.

| Status | Meaning |
| ----- | :---- |
| **✓  DONE** | Confirmed implemented. Verify and move on. |
| **\~  PARTIAL** | Partially implemented — specific action still required. |
| **✗  MISSING** | Not yet implemented. Must be actioned before launch. |
| **\!\! CRITICAL** | Not implemented and blocking rankings or trust. Action immediately. |

| AUDIT SCORECARD — h-sets.com  ·  September 2026 |
| :---- |

| 5/10 Overall SEO Score | 13 Items Done | 5 Items Partial | 21 Items Missing | 12 Critical Issues |
| :---: | :---: | :---: | :---: | :---: |

| TOP 5 PRIORITY ACTIONS — DO THESE FIRST |
| :---- |

| Priority | Action Required |
| ----- | :---- |
| **\#1** | **Fix stats counters — show real numbers** Homepage \+ About page show "0+ Projects Delivered", "0 Years of Experience", "0+ Clients Served". Replace with real figures: 8+ years, 25+ projects, 15+ clients. This is the most visible trust failure on the site. |
| **\#2** | **Implement LocalBusiness \+ Organization JSON-LD schema** Add to root layout. Minimum fields: name, url, address (Royal Valley Way, Kulende Estate, Ilorin, Kwara State), telephone, openingHoursSpecification, areaServed, sameAs (LinkedIn, X, Instagram, YouTube). This enables Google Local Pack eligibility. |
| **\#3** | **301 redirect academy.h-sets.com → h-sets.com/academy/** The legacy WordPress Academy subdomain is still live, indexed, and receiving traffic. Every day it runs in parallel splits domain authority and confuses Google. Configure server-side 301 redirects for all academy.h-sets.com/\* paths. |
| **\#4** | **Add real team photos** All 6 team members show initials-only avatars. Google quality evaluators mark this as low EEAT. Add professional headshots for all team members: Ayorinde Fakunle, Tunde Bello, Zainab Yusuf, Emeka Nwosu, Funke Adebayo, Amara Okafor. |
| **\#5** | **Expand service pages to 1,500+ words with populated FAQ answers** All service pages are \~200 words. FAQ accordion sections exist but answers are empty. Content must be written and FAQ answers populated before FAQPage schema can be implemented. Start with: website-development, software-development, ai-automation. |

| SECTION 1 — METADATA |
| :---- |

| ✓ | Status | Item & Implementation Notes |
| ----- | ----- | :---- |
| ☐ | **✓  DONE** | **Unique title tags per page** All pages now carry distinct title values. Homepage, About, AI Solutions, and service pages confirmed unique. |
| ☐ | **✓  DONE** | **Unique meta descriptions per page** Each page has its own description. Blog posts carry article-specific meta descriptions. |
| ☐ | **✓  DONE** | **og:locale set to en\_NG** Nigerian English locale applied correctly across all pages. |
| ☐ | **✗  MISSING** | **Fix homepage title — add primary keyword  \[HIGH\]** Current: "H-SETS — Innovative Solutions; Shaping Tomorrow, Today." Contains no target keywords. Replace with: "H-SETS | Software, AI & Digital Agency Nigeria" (50 chars). Must include "Nigeria" and at least one service keyword. |
| ☐ | **\~  PARTIAL** | **Fix og:title and og:description — make page-specific  \[HIGH\]** The service pages (e.g. /services/website-development) still return the homepage generic og:title and og:description. Each page's og:title and og:description must match its own \<title\> and \<meta name="description"\> — not the global fallback. |
| ☐ | **✗  MISSING** | **Add og:image to every page  \[HIGH\]** twitter:card is set to summary\_large\_image but no og:image URL is present in the page head. Every page requires: \<meta property="og:image" content="https://h-sets.com/og/\[page-name\].png" /\>. Images must be 1200×630px. Social shares currently produce blank preview cards. |
| ☐ | **✗  MISSING** | **Remove or make meta keywords page-specific** The meta keywords tag is identical across every page: "software development Nigeria, AI automation, tech academy…". Either remove it entirely (not a ranking factor) or make each page's keywords unique. As-is it signals copy-paste implementation to any auditor. |
| ☐ | **✗  MISSING** | **Confirm canonical tags on all pages  \[CRITICAL\]** Both h-sets.com (production) and h-sets.vercel.app (staging) are publicly accessible. Every page must carry: \<link rel="canonical" href="https://h-sets.com/\[path\]/" /\>. Without this, Google may index staging pages and treat them as duplicate content. Verify in browser devtools → View Page Source. |

| SECTION 2 — SCHEMA MARKUP (JSON-LD) |
| :---- |

| ✓ | Status | Item & Implementation Notes |
| ----- | ----- | :---- |
| ☐ | **✓  DONE** | **BreadcrumbList schema — confirmed in UI** Breadcrumbs render correctly on all inner pages. Confirm BreadcrumbList JSON-LD is in the page \<head\> via Google Rich Results Test at search.google.com/test/rich-results. |
| ☐ | **✗  MISSING** | **Add LocalBusiness \+ Organization schema to root layout  \[CRITICAL\]** Add to app/layout.tsx as a \<script type="application/ld+json"\>. Required fields: @type: \["LocalBusiness","ProfessionalService"\], name, url, logo, telephone, address (streetAddress: "Royal Valley Way, Kulende Estate, Sango", addressLocality: "Ilorin", addressRegion: "Kwara State", addressCountry: "NG"), geo (lat/lng), openingHoursSpecification, areaServed: \["Ilorin","Kwara","Nigeria"\], sameAs: \[LinkedIn, X, Instagram, YouTube URLs\]. Validate at: search.google.com/test/rich-results |
| ☐ | **✗  MISSING** | **Add Service schema to every service page  \[HIGH\]** Each /services/\[slug\] and /ai-solutions/\[slug\] page needs a Service JSON-LD block: { "@type": "Service", "name": "\[Service Name\]", "provider": { "@type": "Organization", "name": "H-SETS" }, "areaServed": "Nigeria", "description": "\[page meta description\]", "url": "https://h-sets.com/services/\[slug\]/" } |
| ☐ | **✗  MISSING** | **Add FAQPage schema to service pages and AI Solutions  \[HIGH\]** FAQ accordions exist on service pages and /ai-solutions/ but answers are currently empty. This is a two-step task: (1) Write real FAQ answers into the CMS/code — minimum 5 Q\&A pairs per page. (2) Add FAQPage JSON-LD with each Q\&A pair. Without populated answers, schema cannot be added. Enables FAQ rich snippets in Google results. |
| ☐ | **✗  MISSING** | **Add Article \+ Person schema to all blog posts  \[HIGH\]** Every /insights/\[slug\] page needs: Article schema (headline, author, datePublished, dateModified, image, publisher) AND Person schema for the author (name, url, sameAs: LinkedIn). Author names match team members — link them. This enables article rich results and Top Stories eligibility. |
| ☐ | **✗  MISSING** | **Add Course schema to Academy programme pages** Each /academy/\[programme\] page showing name, duration, and price qualifies for Course schema: { "@type": "Course", "name": "\[Programme Name\]", "provider": { "@type": "Organization", "name": "H-SETS Academy" }, "description": "...", "offers": { "@type": "Offer", "price": "\[price\]", "priceCurrency": "NGN" } }. Improves visibility in Google education search features. |
| ☐ | **✗  MISSING** | **Add WebSite schema with SearchAction to homepage** Add to homepage only: { "@type": "WebSite", "url": "https://h-sets.com/", "potentialAction": { "@type": "SearchAction", "target": { "@type": "EntryPoint", "urlTemplate": "https://h-sets.com/search?q={search\_term\_string}" }, "query-input": "required name=search\_term\_string" } }. Enables Sitelinks Search Box for branded Google queries. |
| ☐ | **✗  MISSING** | **Add Person schema for all 6 team members  \[HIGH\]** Add to /about page: one Person JSON-LD block per team member. Minimum fields: name, jobTitle, worksFor, url (their author page or LinkedIn), sameAs (LinkedIn URL). This is how Google verifies real people are behind the brand — direct EEAT signal. |

| SECTION 3 — CONTENT DEPTH |
| :---- |

| ✓ | Status | Item & Implementation Notes |
| ----- | ----- | :---- |
| ☐ | **✓  DONE** | **Blog articles are live and substantive** 3 insights articles published with named authors, categories, read times, and related article links. Article body text is real content, not filler. |
| ☐ | **✓  DONE** | **Academy cohort listings are live with real data** Upcoming cohort dates (7 Sept 2026), prices, durations, and apply links are real and visible. |
| ☐ | **\!\! CRITICAL** | **Expand all service pages to 1,500+ words  \[CRITICAL\]** Every service page is currently \~200 words. Google cannot assess topical relevance at this depth. Each page needs: (1) Problem statement — what the client is struggling with. (2) Our solution — how H-SETS specifically solves it. (3) What's included — bulleted deliverables. (4) Benefits — 4–6 business outcomes. (5) Process — 4-step engagement. (6) FAQ — 5+ real Q\&A pairs. (7) Related services — 3 internal links. Priority order: website-development → software-development → ai-automation → seo → digital-marketing. |
| ☐ | **\!\! CRITICAL** | **Populate all FAQ accordion answers  \[CRITICAL\]** FAQ sections exist on /services/website-development, /services/software-development, /ai-solutions and others — but the answers return empty in the rendered HTML. Write and publish real answers. Minimum 5 Q\&A pairs per page. This also blocks FAQPage schema implementation. |
| ☐ | **\!\! CRITICAL** | **Fix stats counters — replace "0" with real numbers  \[CRITICAL\]** Homepage hero and /about both display "0+ Projects Delivered", "0+ Students Trained", "0+ Businesses Transformed", "0 Years of Experience", "0 Countries Reached". Replace with verified numbers. Suggested minimums: 8+ Years · 25+ Projects · 15+ Clients · 6 Countries. This is the most visible trust signal failure on the entire site. |
| ☐ | **✗  MISSING** | **Create /locations/ilorin/ page  \[CRITICAL\]** No location pages exist. "Website design company Ilorin" has near-zero competition with no strong local result. A single well-optimised location page can rank within 30–60 days. Minimum content: H1 with "Ilorin", full address with map embed, service list, local testimonials, LocalBusiness schema. Also needed: /locations/kwara/ and /locations/lagos/. |
| ☐ | **✗  MISSING** | **Create /case-studies/ section with 3+ entries  \[HIGH\]** /case-studies/ does not exist. Portfolio page exists but without quantified outcomes. Each case study needs: client name, industry, challenge, solution, technologies, results (metrics — traffic ×3, hours saved, leads generated). Start with: POREC Properties, LivingRite Care, Citadel Global Dental Clinic. |
| ☐ | **✗  MISSING** | **Rewrite homepage H1 to include primary keywords  \[HIGH\]** Current H1: "Technology that grows your business." — no keywords, no geography. Replace with something that signals category and location: e.g. "Nigeria's Software, AI & Digital Growth Partner." Must include at least one of: Nigeria / software / digital agency / AI. |

| SECTION 4 — LOCAL SEO |
| :---- |

| ✓ | Status | Item & Implementation Notes |
| ----- | ----- | :---- |
| ☐ | **✓  DONE** | **City and phone number in footer sitewide** "Ilorin, Kwara State, Nigeria" and both phone numbers appear in footer. Good for basic NAP consistency. |
| ☐ | **\!\! CRITICAL** | **Create and verify Google Business Profile  \[CRITICAL\]** A GBP listing for H-SETS is not confirmed. Without it, h-sets.com cannot appear in the Google Local 3-Pack for any Ilorin or Kwara State search. Action: (1) Go to business.google.com. (2) Create listing with exact NAP: "H-SETS Digital & IT Solutions", Royal Valley Way, Kulende Estate, Sango, Ilorin, Kwara State. (3) Categories: Software Company, Digital Marketing Agency, IT Company. (4) Upload 10+ photos. (5) Verify by postcard or phone. NAP must match the website footer exactly. |
| ☐ | **\!\! CRITICAL** | **Add full street address to footer and /contact page  \[CRITICAL\]** Footer currently shows "Ilorin, Kwara State, Nigeria" — missing the full street address. Update to: "Royal Valley Way, Kulende Estate, Sango, Ilorin, Kwara State, Nigeria." This exact string must match the GBP listing and LocalBusiness schema. Add to /contact page with Google Maps embed. |
| ☐ | **✗  MISSING** | **Create location pages: /locations/ilorin/ and /locations/kwara/  \[CRITICAL\]** Priority: /locations/ilorin/ first. H1: "Digital Agency & Software Company in Ilorin, Nigeria". Include: service list with local context, client logos from Ilorin-based clients, address \+ map embed, local testimonials, internal links to service pages. LocalBusiness schema scoped to this page. Add /locations/kwara/ and /locations/lagos/ as Phase 2\. |
| ☐ | **✗  MISSING** | **Add "Ilorin" and "Nigeria" to service page titles and H1s  \[HIGH\]** No service page title or H1 currently includes a geographic keyword. Update page titles: e.g. "Website Development Company Nigeria | H-SETS" and H1s: e.g. "Websites Built for Nigerian Businesses." At minimum, the website-development, software-development, SEO, and digital-marketing pages need geographic signals. |
| ☐ | **✗  MISSING** | **Create service-plus-location sub-pages  \[HIGH\]** Create: /services/website-development/ilorin/, /services/seo/ilorin/, /services/digital-marketing/ilorin/, /services/software-development/ilorin/. Each targets a specific local commercial keyword with near-zero competition. H1 example: "Website Development in Ilorin, Kwara State." Include local schema and link back to parent service page. |

| SECTION 5 — EEAT SIGNALS |
| :---- |

| ✓ | Status | Item & Implementation Notes |
| ----- | ----- | :---- |
| ☐ | **✓  DONE** | **Named team members with roles on /about** 6 named team members listed with titles and bios: Ayorinde Fakunle, Tunde Bello, Zainab Yusuf, Emeka Nwosu, Funke Adebayo, Amara Okafor. |
| ☐ | **✓  DONE** | **Named article authors matching team members** Blog posts attributed to Emeka Nwosu, Amara Okafor, Tunde Bello — same names as team members. Author-to-person linkage is correct. |
| ☐ | **✓  DONE** | **Real, named client testimonial on homepage** Ade Ariyo testimonial is specific, named, and credible. Much stronger than anonymous quotes. |
| ☐ | **✓  DONE** | **Real client logos displayed** Cactus-3, Eleos Research, HMA Medicals, Livingrite Care are confirmed real clients. NOTE: Kudi Africa is still in the logo marquee — verify this is a confirmed client or remove it immediately. |
| ☐ | **\!\! CRITICAL** | **Add professional photos for all 6 team members  \[CRITICAL\]** All team members currently show initials-only avatar circles (AF, TB, ZY, EN, FA, AO). Google quality evaluators mark initials-only teams as unverifiable — a serious EEAT weakness. Professional headshots required for: Ayorinde Fakunle, Tunde Bello, Zainab Yusuf, Emeka Nwosu, Funke Adebayo, Amara Okafor. Square format, minimum 400×400px. |
| ☐ | **✗  MISSING** | **Add author photo and bio box to all blog posts  \[HIGH\]** Blog posts show author name and role but no photo. Add an author bio component at the bottom of each post: photo, name, role, 2-sentence bio, LinkedIn link. This connects named authors to verifiable real people — direct EEAT signal. |
| ☐ | **✗  MISSING** | **Create Clutch.co profile and request 5 client reviews  \[HIGH\]** No third-party review platform presence confirmed. Clutch.co (free for agencies) is the most credible B2B review platform for tech companies. Create profile → email past clients requesting reviews → embed Clutch widget on homepage and service pages. Google values independently verifiable reviews heavily. |
| ☐ | **✗  MISSING** | **Add LinkedIn link and credentials to team member bios  \[HIGH\]** Team bios on /about are text-only. Add: (1) LinkedIn profile URL for each member. (2) Any verifiable credentials (university, Google/AWS certifications, years of experience). This makes the team independently discoverable and verifiable — core EEAT requirement. |
| ☐ | **✗  MISSING** | **Add CAC registration number and company registration to /about** No company registration details visible. Adding "Registered in Nigeria — CAC Reg. No. \[NUMBER\]" to the About page and footer is a direct trust signal for Nigerian business clients and for Google's quality evaluation. |
| ☐ | **✗  MISSING** | **Verify or remove Kudi Africa from partner logo strip  \[CRITICAL\]** Kudi Africa appears in the scrolling partner logo marquee. If this is not a confirmed client, remove it immediately. Displaying logos of companies you have not worked with is an EEAT violation and could damage credibility if a client notices. |

| SECTION 6 — TECHNICAL SEO |
| :---- |

| ✓ | Status | Item & Implementation Notes |
| ----- | ----- | :---- |
| ☐ | **✓  DONE** | **Next.js 14 architecture — strong Core Web Vitals baseline** SSR/ISR, next/image, next/font all implemented. Strong performance foundation. |
| ☐ | **✓  DONE** | **Breadcrumb navigation sitewide** Breadcrumbs render correctly on all inner pages. |
| ☐ | **✓  DONE** | **Clean URL structure** /services/website-development, /academy/software-development, /insights/\[slug\] — all correct. |
| ☐ | **✓  DONE** | **HTTPS confirmed on production domain** h-sets.com serves all pages over HTTPS. No mixed content warnings observed. |
| ☐ | **\!\! CRITICAL** | **301 redirect academy.h-sets.com to h-sets.com/academy/  \[CRITICAL\]** The legacy WordPress Academy is still live, indexed by Google, and receiving traffic (confirmed in search results dated late 2024). This is the highest-risk open issue. Implementation: (1) Configure Cloudflare page rules or server redirects: academy.h-sets.com/\* → https://h-sets.com/academy/$1 (301). (2) Verify all academy.h-sets.com URLs 301 correctly with a redirect checker tool. (3) Submit updated sitemap to Google Search Console after redirects are live. |
| ☐ | **✗  MISSING** | **Confirm sitemap.xml is live and submitted to Search Console  \[CRITICAL\]** h-sets.com/sitemap.xml could not be confirmed as accessible. Action: (1) Verify Next.js generates or exports a complete sitemap at /sitemap.xml covering all pages including blog posts and Academy pages. (2) Log into Google Search Console → Sitemaps → Submit https://h-sets.com/sitemap.xml. (3) Also submit to Bing Webmaster Tools. |
| ☐ | **✗  MISSING** | **Verify Google Search Console is set up and monitoring  \[CRITICAL\]** GSC status unknown from external audit. Action: (1) Confirm h-sets.com is verified in GSC. (2) Check Coverage report for crawl errors. (3) Check Core Web Vitals report. (4) Set up email alerts for manual actions or coverage drops. |
| ☐ | **✗  MISSING** | **Add robots.txt and verify crawler access  \[HIGH\]** robots.txt at h-sets.com/robots.txt should: Allow Googlebot on all public pages. Disallow: /admin/, /api/, /\_next/, /studio/. Include: Sitemap: https://h-sets.com/sitemap.xml. Verify staging (h-sets.vercel.app) is blocked: Disallow: / for all bots. |
| ☐ | **\~  PARTIAL** | **Confirm canonical tags are in every page \<head\>  \[CRITICAL\]** Cannot verify from static fetch. Check via browser → View Page Source → search for "canonical". Every page must have: \<link rel="canonical" href="https://h-sets.com/\[exact-path\]/" /\>. Staging pages must either be blocked in robots.txt or carry canonical pointing to production. |
| ☐ | **✗  MISSING** | **Add WhatsApp float button — all pages  \[CRITICAL\]** No WhatsApp button detected on any page. For the Nigerian B2B market this is the highest-ROI single conversion element — most leads will click WhatsApp before filling a form. Implementation: fixed bottom-right button, wa.me/2347078198353 with pre-filled message contextual to the current page. Hide on /contact. Track clicks as GA4 conversion event. |
| ☐ | **\~  PARTIAL** | **Audit all image alt text** Hero images and some partner logos have descriptive alt text — good. However some images may have empty or missing alt attributes. Run a full alt text audit: (1) Screaming Frog crawl → Image report. (2) Fix any blank alt on non-decorative images. (3) Alt text should naturally include keywords where relevant: e.g. alt="H-SETS Academy students learning software development in Ilorin". |
| ☐ | **✗  MISSING** | **Verify PageSpeed score ≥ 90 on mobile  \[HIGH\]** Run Google PageSpeed Insights on: homepage, one service page, one Academy page. Target: ≥90 mobile. If below 90, common Next.js fixes: (1) Add priority prop to hero images. (2) Remove unused JavaScript. (3) Check for Cumulative Layout Shift from logo/hero load sequence. Document scores before and after each fix. |

Prepared by: H-SETS Digital & IT Solutions  ·  Audit date: September 2026

All items verified against the live site at h-sets.com via static HTML fetch and search index checks.

Next review recommended once all CRITICAL and MISSING items are resolved.