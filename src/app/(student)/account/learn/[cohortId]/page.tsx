import { BackLink } from "@/components/ui/back-link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Circle, FileText, Link2, Video, Download, CalendarClock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveEnrollment, cohortProgress } from "@/lib/lms";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/lms/action-button";
import { markLessonComplete, unmarkLessonComplete, confirmAttendance } from "@/app/(student)/actions";

export const metadata = { title: "Learning Center" };
export const dynamic = "force-dynamic";

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  doc: FileText,
  slide: FileText,
  video: Video,
  link: Link2,
  other: FileText,
};

export default async function LearningCenter({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const session = await auth();
  const user = session!.user;

  const enrollment = await getActiveEnrollment(user.id, cohortId);
  if (!enrollment) redirect("/account");

  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: { programme: { select: { name: true } } },
  });
  if (!cohort) notFound();

  const [modules, completed, sessions, myAttendance, progress] = await Promise.all([
    prisma.module.findMany({
      where: { cohortId },
      orderBy: { order: "asc" },
      include: {
        lessons: { orderBy: { order: "asc" }, include: { materials: { orderBy: { order: "asc" } } } },
      },
    }),
    prisma.lessonProgress.findMany({
      where: { studentId: user.id, lesson: { module: { cohortId } } },
      select: { lessonId: true },
    }),
    prisma.classSession.findMany({ where: { cohortId }, orderBy: { scheduledAt: "asc" } }),
    prisma.attendance.findMany({
      where: { studentId: user.id, session: { cohortId } },
      select: { sessionId: true },
    }),
    cohortProgress(user.id, cohortId),
  ]);

  const done = new Set(completed.map((c) => c.lessonId));
  const attended = new Set(myAttendance.map((a) => a.sessionId));

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/account/learn" label="Back to my learning" />
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{cohort.programme.name}</h1>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-2 w-40 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress.percent}%` }} />
        </div>
        <span className="text-sm text-muted-foreground">{progress.percent}% complete</span>
      </div>

      {/* Live sessions / attendance */}
      {sessions.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 text-sm font-semibold">Live sessions</h2>
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-muted-foreground" />
                  {s.title} · {formatDate(s.scheduledAt.toISOString())}
                </span>
                {attended.has(s.id) ? (
                  <Badge variant="success">Present</Badge>
                ) : (
                  <ActionButton
                    action={confirmAttendance}
                    fields={{ sessionId: s.id }}
                    successMessage="Attendance confirmed"
                  >
                    Confirm attendance
                  </ActionButton>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Curriculum */}
      <div className="mt-6 space-y-6">
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">Course content will appear here once your instructor adds it.</p>
        ) : (
          modules.map((mod) => (
            <div key={mod.id}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {mod.title}
              </h2>
              <div className="space-y-3">
                {mod.lessons.map((lesson) => {
                  const isDone = done.has(lesson.id);
                  const body = Array.isArray(lesson.body) ? (lesson.body as string[]) : [];
                  return (
                    <div key={lesson.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2">
                          {isDone ? (
                            <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />
                          ) : (
                            <Circle className="mt-0.5 size-5 text-muted-foreground" />
                          )}
                          <div>
                            <h3 className="font-semibold">{lesson.title}</h3>
                          </div>
                        </div>
                        <ActionButton
                          action={isDone ? unmarkLessonComplete : markLessonComplete}
                          fields={{ lessonId: lesson.id }}
                          variant={isDone ? "ghost" : "outline"}
                          successMessage={isDone ? "Marked incomplete" : "Lesson complete"}
                        >
                          {isDone ? "Mark incomplete" : "Mark complete"}
                        </ActionButton>
                      </div>

                      {body.length > 0 && (
                        <div className="mt-3 space-y-2 pl-7 text-sm text-muted-foreground">
                          {body.map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      )}

                      {lesson.liveUrl && (
                        <div className="mt-3 pl-7">
                          <Button asChild variant="outline" size="sm">
                            <a href={lesson.liveUrl} target="_blank" rel="noopener noreferrer">
                              <Video className="size-4" /> Join live session
                            </a>
                          </Button>
                        </div>
                      )}

                      {lesson.materials.length > 0 && (
                        <ul className="mt-3 space-y-1.5 pl-7">
                          {lesson.materials.map((m) => {
                            const Icon = KIND_ICON[m.kind] ?? FileText;
                            return (
                              <li key={m.id}>
                                <a
                                  href={`/api/materials/${m.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <Icon className="size-4" />
                                  {m.title}
                                  {m.r2Key ? <Download className="size-3.5" /> : <Link2 className="size-3.5" />}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
