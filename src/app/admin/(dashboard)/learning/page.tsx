import { FileText, Link2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { cohortScope, activeCohortWhere } from "@/lib/cohort-access";
import { cohortLabel } from "@/lib/lms";
import { PageHeading } from "@/components/admin/page-heading";
import { DeleteButton } from "@/components/admin/delete-button";
import { CohortPicker } from "@/components/lms/cohort-picker";
import { Badge } from "@/components/ui/badge";
import { AddModuleForm, AddLessonForm, AddMaterialForm } from "./forms";
import { deleteModule, deleteLesson, deleteMaterial } from "./actions";

export const dynamic = "force-dynamic";

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>;
}) {
  const user = await requireSection("learning");
  const { cohort: cohortId } = await searchParams;

  const cohorts = await prisma.cohort.findMany({
    where: { ...cohortScope(user), ...activeCohortWhere() },
    include: { programme: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const options = cohorts.map((c) => ({ id: c.id, label: cohortLabel(c) }));

  const allowed = !!cohortId && cohorts.some((c) => c.id === cohortId);
  const modules = allowed
    ? await prisma.module.findMany({
        where: { cohortId },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { materials: { orderBy: { order: "asc" } } },
          },
        },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Learning Content"
        description="Build the curriculum: modules, lessons, and downloadable materials."
        action={<CohortPicker cohorts={options} selected={cohortId} />}
      />

      {!allowed || !cohortId ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Select a cohort above to build its curriculum.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <AddModuleForm cohortId={cohortId} />
          </div>

          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules yet. Add your first module above.</p>
          ) : (
            modules.map((mod) => (
              <div key={mod.id} className="rounded-2xl border border-border bg-card shadow-soft">
                <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
                  <h2 className="text-sm font-semibold">{mod.title}</h2>
                  <DeleteButton id={mod.id} action={deleteModule} confirmText={`Delete "${mod.title}" and all its lessons?`} />
                </div>
                <div className="space-y-4 p-5">
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-medium">{lesson.title}</div>
                        <DeleteButton id={lesson.id} action={deleteLesson} confirmText={`Delete lesson "${lesson.title}"?`} />
                      </div>
                      {lesson.materials.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {lesson.materials.map((m) => (
                            <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                              <span className="flex items-center gap-2 text-muted-foreground">
                                {m.r2Key ? <FileText className="size-4" /> : <Link2 className="size-4" />}
                                {m.title}
                                <Badge variant="muted">{m.kind}</Badge>
                              </span>
                              <DeleteButton id={m.id} action={deleteMaterial} confirmText={`Delete material "${m.title}"?`} />
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-3">
                        <AddMaterialForm lessonId={lesson.id} />
                      </div>
                    </div>
                  ))}
                  <AddLessonForm moduleId={mod.id} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
