import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { TestimonialForm } from "../testimonial-form";
import { createTestimonial } from "../actions";

export default async function NewTestimonialPage() {
  await requireSection("testimonials");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/testimonials", label: "Back to testimonials" }} title="New testimonial" />
      <TestimonialForm action={createTestimonial} />
    </div>
  );
}
