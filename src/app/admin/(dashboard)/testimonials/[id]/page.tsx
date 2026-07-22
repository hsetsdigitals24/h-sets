import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { TestimonialForm } from "../testimonial-form";
import { updateTestimonial } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("testimonials");
  const { id } = await params;
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/testimonials", label: "Back to testimonials" }} title="Edit testimonial" description={`${testimonial.name} · ${testimonial.company}`} />
      <TestimonialForm action={updateTestimonial} testimonial={testimonial} />
    </div>
  );
}
