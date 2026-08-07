import Link from "next/link";
import { KanbanSquare } from "lucide-react";
import type { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";
import { NewProjectDialog } from "./new-project-dialog";
import { ProjectsPresenceProvider, LiveDot } from "./presence";
import { PROJECT_STATUS_META, PROJECT_STATUS_ORDER } from "./project-status";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await requireSection("projects");
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { tasks: true, members: true } },
      tasks: { where: { status: "DONE" }, select: { id: true } },
    },
  });

  // Group projects by lifecycle status, preserving the recency order within
  // each group, then render the groups in canonical order (active work first).
  const byStatus = new Map<ProjectStatus, typeof projects>();
  for (const status of PROJECT_STATUS_ORDER) byStatus.set(status, []);
  for (const project of projects) {
    // Fall back to the first group for any unexpected/missing status so a
    // project can never silently disappear from the list.
    const bucket = byStatus.get(project.status) ?? byStatus.get(PROJECT_STATUS_ORDER[0]);
    bucket?.push(project);
  }

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Projects"
        description="Lightweight internal project boards for the team."
        action={isSuperAdmin ? <NewProjectDialog /> : undefined}
      />

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center shadow-soft">
          <KanbanSquare className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm text-muted-foreground">
            {isSuperAdmin
              ? "No projects yet. Create your first board to get started."
              : "No projects yet. A super admin needs to create one."}
          </p>
        </div>
      ) : (
        <ProjectsPresenceProvider projectIds={projects.map((p) => p.id)}>
          <div className="space-y-8">
          {PROJECT_STATUS_ORDER.map((status) => {
            const group = byStatus.get(status) ?? [];
            if (group.length === 0) return null;
            const meta = PROJECT_STATUS_META[status];
            return (
              <section key={status}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-tight">
                    {meta.label}
                  </h2>
                  <Badge variant={meta.badge}>{group.length}</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((project) => {
                    const total = project._count.tasks;
                    const done = project.tasks.length;
                    const pct = total ? Math.round((done / total) * 100) : 0;
                    return (
                      <Link
                        key={project.id}
                        href={`/admin/projects/${project.id}`}
                        className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold tracking-tight group-hover:text-primary">
                            {project.name}
                          </h3>
                          <div className="flex flex-col items-end gap-1.5">
                            <Badge variant="muted">
                              {project._count.members} members
                            </Badge>
                            <LiveDot projectId={project.id} />
                          </div>
                        </div>
                        {project.description && (
                          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {done}/{total} done
                            </span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
          </div>
        </ProjectsPresenceProvider>
      )}
    </div>
  );
}
