import { createPostHandler } from "@/lib/api-handler";
import { assessmentSchema } from "@/lib/schemas";
import { insertLead } from "@/lib/db";
import { notifyNewLead } from "@/lib/email";
import { notifyRole } from "@/lib/notifications";
import { levelForPercent } from "@/lib/assessment";

export const runtime = "nodejs";

export const POST = createPostHandler(assessmentSchema, async (data) => {
  // Recompute the level server-side from the trusted percentage so the CRM
  // record and confirmation email can't be spoofed by the client payload.
  const level = levelForPercent(data.percent);

  const { id } = await insertLead({
    type: "contact",
    name: data.name,
    email: data.email,
    company: data.company,
    phone: data.phone,
    source: "ai-readiness-assessment",
    data: {
      assessment: "ai-readiness",
      percent: data.percent,
      level: level.title,
      answers: data.answers,
    },
  });

  await notifyNewLead({
    type: "AI readiness assessment",
    subject: `AI Readiness: ${data.name} scored ${data.percent}% (${level.title})`,
    fields: {
      name: data.name,
      email: data.email,
      company: data.company,
      phone: data.phone,
      score: `${data.percent}%`,
      level: level.title,
    },
    userEmail: data.email,
    userName: data.name,
    confirmation: {
      subject: `Your AI Readiness result: ${level.title}`,
      body: `<p>Thanks for completing the AI Readiness Assessment. Your business scored <strong>${data.percent}%</strong> — <strong>${level.title}</strong>.</p><p>${level.summary}</p><p>Want to talk it through? <a href="/contact#consultation">Book a free AI consultation</a> and we'll map your highest-ROI next step.</p>`,
    },
  });

  await notifyRole("SALES_ADMIN", {
    type: "lead",
    title: `AI Readiness: ${data.name} (${level.title})`,
    body: `${data.name} scored ${data.percent}% on the AI readiness assessment.`,
    link: "/admin/leads",
  });

  return { message: "Assessment received", data: { id } };
});
