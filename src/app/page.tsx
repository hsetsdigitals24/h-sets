import { Hero } from "@/components/sections/hero";
import { ServicesOverview } from "@/components/sections/services-overview";
import { WhyHsets } from "@/components/sections/why-hsets";
import { AcademyShowcase } from "@/components/sections/academy-showcase";
import { IndustriesServed } from "@/components/sections/industries-served";
import { Testimonials } from "@/components/sections/testimonials";
import { RecentInsights } from "@/components/sections/recent-insights";
import { CtaStrip } from "@/components/common/cta-strip";
import { WebsiteSchema } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <WebsiteSchema />
      <Hero />
      <ServicesOverview />
      <WhyHsets />
      <AcademyShowcase />
      <IndustriesServed />
      <Testimonials />
      <RecentInsights />
      <CtaStrip />
    </>
  );
}
