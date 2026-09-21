import { Hero } from "@/components/sections/hero";
import { ServicesOverview } from "@/components/sections/services-overview";
import { WhyHsets } from "@/components/sections/why-hsets";
import { AcademyShowcase } from "@/components/sections/academy-showcase";
import { IndustriesServed } from "@/components/sections/industries-served";
import { Testimonials } from "@/components/sections/testimonials";
import { RecentInsights } from "@/components/sections/recent-insights";
import { CtaStrip } from "@/components/common/cta-strip";
import { getTestimonials } from "@/lib/content";
import { site } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";

/**
 * The homepage previously fell through to the root layout's default title
 * ("H-SETS — Innovative Solutions; Shaping Tomorrow, Today."), which carries no
 * category or geographic keyword. It also inherited the layout's generic OG
 * tags and had no canonical.
 */
export const metadata = buildMetadata({
  title: "Software, AI & Digital Agency in Nigeria",
  description: site.description,
  path: "/",
});

export const revalidate = 3600; // ISR: rebuilt hourly; admin edits trigger instant on-demand revalidatePath

export default async function HomePage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <Hero />
      <ServicesOverview />
      <WhyHsets />
      <AcademyShowcase />
      <IndustriesServed />
      <Testimonials testimonials={testimonials} />
      <RecentInsights />
      <CtaStrip />
    </>
  );
}
