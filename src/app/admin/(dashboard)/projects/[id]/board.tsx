"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import type { TaskStatus, SprintStatus } from "@prisma/client";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Circle,
  KanbanSquare,
  Layers,
  ListTree,
  MessageSquare,
  Pencil,
  Plus,
  Rocket,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormError, SubmitButton } from "@/components/admin/form-kit";
import {
  addComment,
  addMember,
  createEpic,
  createSprint,
  createTask,
  deleteEpic,
  deleteSprint,
  deleteTask,
  moveTask,
  removeMember,
  updateEpic,
  updateSprint,
  updateTask,
} from "../actions";

type Comment = {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  order: number;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  epicId: string | null;
  epicTitle: string | null;
  epicColor: string | null;
  sprintId: string | null;
  sprintName: string | null;
  commentCount: number;
  comments: Comment[];
};

type Person = { id: string; name: string; role: string };

type Epic = {
  id: string;
  title: string;
  description: string | null;
  color: string;
  sprintCount: number;
  taskCount: number;
};

type Sprint = {
  id: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  epicId: string | null;
  epicTitle: string | null;
  epicColor: string | null;
  startDate: string | null;
  endDate: string | null;
  taskCount: number;
};

const SPRINT_STATUS_META: Record<SprintStatus, { label: string; className: string }> = {
  PLANNED: { label: "Planned", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  ACTIVE: { label: "Active", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  COMPLETED: { label: "Completed", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
};

// Preset palette offered when creating/editing an epic.
const EPIC_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#64748b",
];

const COLUMNS: { key: TaskStatus; label: string; accent: string }[] = [
  { key: "TODO", label: "To do", accent: "bg-slate-400" },
  { key: "IN_PROGRESS", label: "In progress", accent: "bg-blue-500" },
  { key: "REVIEW", label: "Review", accent: "bg-amber-500" },
  { key: "DONE", label: "Done", accent: "bg-emerald-500" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// Sprint option label, prefixed with its parent epic so the hierarchy is visible
// in the flat <select> (Epic → Sprint).
function sprintOptionLabel(s: Sprint) {
  return s.epicTitle ? `${s.epicTitle} › ${s.name}` : s.name;
}

export function Board({
  projectId,
  tasks: tasksProp,
  members,
  admins,
  epics,
  sprints,
}: {
  projectId: string;
  tasks: Task[];
  members: Person[];
  admins: Person[];
  epics: Epic[];
  sprints: Sprint[];
}) {
  // Local, optimistic copy of the board. Re-synced whenever the server sends
  // fresh props (after a revalidatePath round-trip) using React's "adjust state
  // during render" pattern rather than an effect.
  const [tasks, setTasks] = useState(tasksProp);
  const [syncedProp, setSyncedProp] = useState(tasksProp);
  if (syncedProp !== tasksProp) {
    setSyncedProp(tasksProp);
    setTasks(tasksProp);
  }

  const [dragId, setDragId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  // New-task dialog context: which status column and (optionally) which sprint.
  const [adding, setAdding] = useState<{ status: TaskStatus; sprintId: string } | null>(
    null
  );
  // Two working surfaces: the Kanban "board" and the planning "backlog" outline.
  const [view, setView] = useState<"board" | "backlog">("board");
  // Board filter defaults to the active sprint (Jira-style "active sprint" board),
  // falling back to all tasks when no sprint is active.
  const activeSprintId = sprints.find((s) => s.status === "ACTIVE")?.id ?? "all";
  const [sprintFilter, setSprintFilter] = useState<string>(activeSprintId);
  const [, startTransition] = useTransition();

  // Keep the open drawer in sync with the latest task data.
  const selectedTask = selected ? tasks.find((t) => t.id === selected.id) ?? null : null;

  function matchesFilter(t: Task) {
    if (sprintFilter === "all") return true;
    if (sprintFilter === "backlog") return t.sprintId === null;
    return t.sprintId === sprintFilter;
  }

  function column(status: TaskStatus) {
    return tasks
      .filter((t) => t.status === status && matchesFilter(t))
      .sort((a, b) => a.order - b.order);
  }

  function persistMove(id: string, status: TaskStatus, order: number) {
    // Optimistic local update, then persist.
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, order } : t))
    );
    const fd = new FormData();
    fd.set("id", id);
    fd.set("projectId", projectId);
    fd.set("status", status);
    fd.set("order", String(order));
    startTransition(async () => {
      const res = await moveTask(fd);
      if (res?.error) toast.error(res.error);
    });
  }

  // Drop onto a column body → append to the end of that column.
  function dropInColumn(status: TaskStatus) {
    if (!dragId) return;
    const dragged = tasks.find((t) => t.id === dragId);
    if (!dragged) return;
    const col = column(status).filter((t) => t.id !== dragId);
    const order = (col[col.length - 1]?.order ?? 0) + 1;
    persistMove(dragId, status, order);
    setDragId(null);
  }

  // One-click completion toggle: DONE ⇄ TODO. Appends to the end of the target
  // status so it lands at the bottom of that column.
  function toggleDone(task: Task) {
    const next: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    const order =
      tasks
        .filter((t) => t.status === next && t.id !== task.id)
        .reduce((max, t) => Math.max(max, t.order), 0) + 1;
    persistMove(task.id, next, order);
  }

  // Drop onto a specific card → insert before it (midpoint of its neighbours).
  function dropBefore(target: Task) {
    if (!dragId || dragId === target.id) return;
    const col = column(target.status).filter((t) => t.id !== dragId);
    const idx = col.findIndex((t) => t.id === target.id);
    const prev = col[idx - 1];
    const order = prev ? (prev.order + target.order) / 2 : target.order - 1;
    persistMove(dragId, target.status, order);
    setDragId(null);
  }

  return (
    <div className="space-y-5">
      <MembersBar projectId={projectId} members={members} admins={admins} />

      <PlanningBar projectId={projectId} epics={epics} sprints={sprints} />

      {/* View switcher: execution (board) vs planning (backlog). */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setView("board")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "board"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <KanbanSquare className="size-4" /> Board
          </button>
          <button
            type="button"
            onClick={() => setView("backlog")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "backlog"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListTree className="size-4" /> Backlog
          </button>
        </div>

        {view === "board" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Sprint:</span>
            <Select
              className="h-9 w-52"
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
            >
              <option value="all">All tasks</option>
              <option value="backlog">Backlog (no sprint)</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {SPRINT_STATUS_META[s.status].label}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map(({ key, label, accent }) => {
            const col = column(key);
            return (
              <div
                key={key}
                className="flex flex-col rounded-2xl border border-border bg-muted/30 p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropInColumn(key)}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${accent}`} />
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="text-xs text-muted-foreground">{col.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAdding({
                        status: key,
                        sprintId:
                          sprintFilter !== "all" && sprintFilter !== "backlog"
                            ? sprintFilter
                            : "",
                      })
                    }
                    className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    aria-label={`Add task to ${label}`}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <div className="flex min-h-[2rem] flex-1 flex-col gap-2">
                  {col.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      dragging={dragId === task.id}
                      onDragStart={() => setDragId(task.id)}
                      onDragEnd={() => setDragId(null)}
                      onDropBefore={() => dropBefore(task)}
                      onOpen={() => setSelected(task)}
                      onToggleDone={() => toggleDone(task)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <BacklogView
          epics={epics}
          sprints={sprints}
          tasks={tasks}
          onOpenTask={(t) => setSelected(t)}
          onAddTask={(sprintId) => setAdding({ status: "TODO", sprintId })}
          onToggleDone={toggleDone}
        />
      )}

      {adding && (
        <NewTaskDialog
          projectId={projectId}
          status={adding.status}
          members={members}
          sprints={sprints}
          defaultSprintId={adding.sprintId}
          onClose={() => setAdding(null)}
        />
      )}

      {selectedTask && (
        <TaskDrawer
          key={selectedTask.id}
          projectId={projectId}
          task={selectedTask}
          members={members}
          sprints={sprints}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------- backlog ---

/**
 * Planning surface: a collapsible Epic → Sprint → Task outline. Complements the
 * board (execution) by exposing the full hierarchy for grooming and sprint
 * planning. Tasks with no sprint fall into a "Backlog" group; sprints with no
 * epic into a "No epic" group.
 */
function BacklogView({
  epics,
  sprints,
  tasks,
  onOpenTask,
  onAddTask,
  onToggleDone,
}: {
  epics: Epic[];
  sprints: Sprint[];
  tasks: Task[];
  onOpenTask: (t: Task) => void;
  onAddTask: (sprintId: string) => void;
  onToggleDone: (t: Task) => void;
}) {
  // Collapsed epic/sprint ids. Default everything expanded.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sprintsByEpic = (epicId: string | null) =>
    sprints
      .filter((s) => s.epicId === epicId)
      .sort((a, b) => a.name.localeCompare(b.name));
  const tasksInSprint = (sprintId: string) =>
    tasks.filter((t) => t.sprintId === sprintId).sort((a, b) => a.order - b.order);
  const backlogTasks = tasks
    .filter((t) => t.sprintId === null)
    .sort((a, b) => a.order - b.order);
  const orphanSprints = sprintsByEpic(null);

  function SprintGroup({ sprint }: { sprint: Sprint }) {
    const open = !collapsed.has(sprint.id);
    const rows = tasksInSprint(sprint.id);
    return (
      <div className="rounded-xl border border-border bg-background">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => toggle(sprint.id)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <ChevronRight
              className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                open ? "rotate-90" : ""
              }`}
            />
            <Rocket className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">{sprint.name}</span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SPRINT_STATUS_META[sprint.status].className}`}
            >
              {SPRINT_STATUS_META[sprint.status].label}
            </span>
            {sprint.startDate && sprint.endDate && (
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {fmtDate(sprint.startDate)}–{fmtDate(sprint.endDate)}
              </span>
            )}
            <span className="shrink-0 text-xs text-muted-foreground">
              {rows.length} {rows.length === 1 ? "task" : "tasks"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onAddTask(sprint.id)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label={`Add task to ${sprint.name}`}
          >
            <Plus className="size-4" />
          </button>
        </div>
        {open && (
          <div className="border-t border-border">
            {rows.length === 0 ? (
              <p className="px-3 py-2 pl-9 text-xs text-muted-foreground">
                No tasks in this sprint.
              </p>
            ) : (
              rows.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onOpen={() => onOpenTask(t)}
                  onToggleDone={() => onToggleDone(t)}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {epics.map((e) => {
        const open = !collapsed.has(e.id);
        const epicSprints = sprintsByEpic(e.id);
        return (
          <div
            key={e.id}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <button
              type="button"
              onClick={() => toggle(e.id)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/40"
            >
              <ChevronRight
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                  open ? "rotate-90" : ""
                }`}
              />
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ backgroundColor: e.color }}
              />
              <span className="truncate text-sm font-semibold">{e.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {e.sprintCount} {e.sprintCount === 1 ? "sprint" : "sprints"} ·{" "}
                {e.taskCount} {e.taskCount === 1 ? "task" : "tasks"}
              </span>
            </button>
            {open && (
              <div className="space-y-2 border-t border-border bg-muted/20 p-3">
                {epicSprints.length === 0 ? (
                  <p className="px-1 text-xs text-muted-foreground">
                    No sprints in this epic yet.
                  </p>
                ) : (
                  epicSprints.map((s) => <SprintGroup key={s.id} sprint={s} />)
                )}
              </div>
            )}
          </div>
        );
      })}

      {orphanSprints.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-card">
          <div className="px-3 py-2.5 text-sm font-semibold text-muted-foreground">
            No epic
          </div>
          <div className="space-y-2 border-t border-border bg-muted/20 p-3">
            {orphanSprints.map((s) => (
              <SprintGroup key={s.id} sprint={s} />
            ))}
          </div>
        </div>
      )}

      {/* Backlog — tasks not yet assigned to any sprint. */}
      <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-card">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Layers className="size-4 text-muted-foreground" /> Backlog
            <span className="text-xs font-normal text-muted-foreground">
              {backlogTasks.length} {backlogTasks.length === 1 ? "task" : "tasks"}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onAddTask("")}
            className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Add task to backlog"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <div className="border-t border-border">
          {backlogTasks.length === 0 ? (
            <p className="px-3 py-2 pl-9 text-xs text-muted-foreground">
              Nothing in the backlog.
            </p>
          ) : (
            backlogTasks.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onOpen={() => onOpenTask(t)}
                onToggleDone={() => onToggleDone(t)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Compact single-line task row used inside the backlog outline.
function TaskRow({
  task,
  onOpen,
  onToggleDone,
}: {
  task: Task;
  onOpen: () => void;
  onToggleDone: () => void;
}) {
  const done = task.status === "DONE";
  const overdue = task.dueDate && !done && new Date(task.dueDate) < new Date();
  return (
    <div className="flex w-full items-center gap-2 px-3 py-2 pl-3 hover:bg-muted/40">
      <button
        type="button"
        onClick={onToggleDone}
        className={`shrink-0 rounded-full transition-colors ${
          done
            ? "text-emerald-500 hover:text-emerald-600"
            : "text-muted-foreground/50 hover:text-emerald-500"
        }`}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        title={done ? "Mark as not done" : "Mark as done"}
      >
        {done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <span
          className={`min-w-0 flex-1 truncate text-sm ${
            done ? "text-muted-foreground line-through" : ""
          }`}
        >
          {task.title}
        </span>
      {task.dueDate && (
        <span
          className={`hidden shrink-0 items-center gap-1 text-xs sm:inline-flex ${
            overdue ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          <CalendarClock className="size-3.5" />
          {fmtDate(task.dueDate)}
        </span>
      )}
      {task.commentCount > 0 && (
        <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
          <MessageSquare className="size-3.5" />
          {task.commentCount}
        </span>
      )}
        {task.assigneeName && (
          <span
            className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary"
            title={task.assigneeName}
          >
            {task.assigneeName.slice(0, 1).toUpperCase()}
          </span>
        )}
      </button>
    </div>
  );
}

function TaskCard({
  task,
  dragging,
  onDragStart,
  onDragEnd,
  onDropBefore,
  onOpen,
  onToggleDone,
}: {
  task: Task;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDropBefore: () => void;
  onOpen: () => void;
  onToggleDone: () => void;
}) {
  const done = task.status === "DONE";
  const overdue =
    task.dueDate && !done && new Date(task.dueDate) < new Date();
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.stopPropagation();
        onDropBefore();
      }}
      onClick={onOpen}
      className={`cursor-pointer rounded-xl border border-border bg-card p-3 text-left shadow-soft transition-all hover:border-primary/40 ${
        dragging ? "opacity-40" : ""
      }`}
    >
      {(task.epicTitle || task.sprintName) && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {task.epicTitle && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium"
              style={{ color: task.epicColor ?? undefined }}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: task.epicColor ?? "currentColor" }}
              />
              {task.epicTitle}
            </span>
          )}
          {task.sprintName && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              <Rocket className="size-3" />
              {task.sprintName}
            </span>
          )}
        </div>
      )}
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleDone();
          }}
          className={`mt-0.5 shrink-0 rounded-full transition-colors ${
            done
              ? "text-emerald-500 hover:text-emerald-600"
              : "text-muted-foreground/50 hover:text-emerald-500"
          }`}
          aria-label={done ? "Mark as not done" : "Mark as done"}
          title={done ? "Mark as not done" : "Mark as done"}
        >
          {done ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <Circle className="size-4" />
          )}
        </button>
        <p
          className={`text-sm font-medium leading-snug ${
            done ? "text-muted-foreground line-through" : ""
          }`}
        >
          {task.title}
        </p>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {task.assigneeName && (
          <span className="inline-flex items-center gap-1">
            <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
              {task.assigneeName.slice(0, 1).toUpperCase()}
            </span>
            {task.assigneeName}
          </span>
        )}
        {task.dueDate && (
          <span
            className={`inline-flex items-center gap-1 ${
              overdue ? "text-destructive" : ""
            }`}
          >
            <CalendarClock className="size-3.5" />
            {fmtDate(task.dueDate)}
          </span>
        )}
        {task.commentCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {task.commentCount}
          </span>
        )}
      </div>
    </div>
  );
}

function MembersBar({
  projectId,
  members,
  admins,
}: {
  projectId: string;
  members: Person[];
  admins: Person[];
}) {
  const [, startTransition] = useTransition();
  const memberIds = new Set(members.map((m) => m.id));
  const addable = admins.filter((a) => !memberIds.has(a.id));

  function add(userId: string) {
    if (!userId) return;
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("userId", userId);
    startTransition(async () => {
      const res = await addMember(fd);
      if (res?.error) toast.error(res.error);
    });
  }

  function remove(userId: string) {
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("userId", userId);
    startTransition(async () => {
      const res = await removeMember(fd);
      if (res?.error) toast.error(res.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Members:</span>
      {members.map((m) => (
        <span
          key={m.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-2.5 pr-1.5 text-xs"
        >
          {m.name}
          <button
            type="button"
            onClick={() => remove(m.id)}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
            aria-label={`Remove ${m.name}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      {addable.length > 0 && (
        <div className="inline-flex items-center gap-1">
          <UserPlus className="size-4 text-muted-foreground" />
          <Select
            className="h-9 w-48"
            defaultValue=""
            onChange={(e) => {
              add(e.target.value);
              e.currentTarget.value = "";
            }}
          >
            <option value="" disabled>
              Add member…
            </option>
            {addable.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
}

function NewTaskDialog({
  projectId,
  status,
  members,
  sprints,
  defaultSprintId,
  onClose,
}: {
  projectId: string;
  status: TaskStatus;
  members: Person[];
  sprints: Sprint[];
  defaultSprintId: string;
  onClose: () => void;
}) {
  const [state, action] = useActionState(createTask, {});
  const okRef = useRef(false);
  useEffect(() => {
    if (state.ok && !okRef.current) {
      okRef.current = true;
      onClose();
    }
  }, [state.ok, onClose]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Added to the “{COLUMNS.find((c) => c.key === status)?.label}” column.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="status" value={status} />
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="assigneeId">Assignee</Label>
              <Select id="assigneeId" name="assigneeId" defaultValue="">
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="sprintId">Sprint</Label>
              <Select id="sprintId" name="sprintId" defaultValue={defaultSprintId}>
                <option value="">Backlog</option>
                {sprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {sprintOptionLabel(s)}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-muted-foreground">
                The task’s epic follows from its sprint.
              </p>
            </div>
          </div>
          <FormError error={state.error} />
          <div className="flex justify-end">
            <SubmitButton>Add task</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskDrawer({
  projectId,
  task,
  members,
  sprints,
  onClose,
}: {
  projectId: string;
  task: Task;
  members: Person[];
  sprints: Sprint[];
  onClose: () => void;
}) {
  const [state, action] = useActionState(updateTask, {});
  const [, startTransition] = useTransition();
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.ok) toast.success("Task saved");
  }, [state.ok]);

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    const body = commentRef.current?.value.trim();
    if (!body) return;
    const fd = new FormData();
    fd.set("taskId", task.id);
    fd.set("projectId", projectId);
    fd.set("body", body);
    startTransition(async () => {
      const res = await addComment(fd);
      if (res?.error) toast.error(res.error);
      else if (commentRef.current) commentRef.current.value = "";
    });
  }

  function onDelete() {
    if (!window.confirm("Delete this task?")) return;
    const fd = new FormData();
    fd.set("id", task.id);
    fd.set("projectId", projectId);
    startTransition(async () => {
      const res = await deleteTask(fd);
      if (res?.error) toast.error(res.error);
      else onClose();
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task details</DialogTitle>
          <DialogDescription className="sr-only">
            Edit this task, assign it, and discuss it.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-1.5">
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" name="title" defaultValue={task.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-desc">Description</Label>
            <Textarea
              id="t-desc"
              name="description"
              rows={4}
              defaultValue={task.description ?? ""}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-status">Status</Label>
              <Select id="t-status" name="status" defaultValue={task.status}>
                {COLUMNS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-assignee">Assignee</Label>
              <Select
                id="t-assignee"
                name="assigneeId"
                defaultValue={task.assigneeId ?? ""}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-due">Due date</Label>
              <Input
                id="t-due"
                name="dueDate"
                type="date"
                defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ""}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-sprint">Sprint</Label>
            <Select
              id="t-sprint"
              name="sprintId"
              defaultValue={task.sprintId ?? ""}
            >
              <option value="">Backlog</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {sprintOptionLabel(s)}
                </option>
              ))}
            </Select>
            {task.epicTitle ? (
              <p className="text-[11px] text-muted-foreground">
                Epic: <span className="font-medium">{task.epicTitle}</span>{" "}
                (from its sprint)
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Assign a sprint to place this task under an epic.
              </p>
            )}
          </div>
          <FormError error={state.error} />
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
            <SubmitButton>Save changes</SubmitButton>
          </div>
        </form>

        <div className="border-t border-border pt-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <MessageSquare className="size-4" /> Comments
            <Badge variant="muted">{task.comments.length}</Badge>
          </h4>
          <div className="mb-3 max-h-56 space-y-3 overflow-y-auto">
            {task.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              task.comments.map((c) => (
                <div key={c.id} className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {c.authorName}
                    </span>
                    <span>{fmtDate(c.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={submitComment} className="flex items-end gap-2">
            <Textarea
              ref={commentRef}
              rows={2}
              placeholder="Write a comment…"
              className="flex-1"
            />
            <Button type="submit" size="sm">
              Post
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------------------------------------- planning ---

/** Epics and sprints management strip, above the board. */
function PlanningBar({
  projectId,
  epics,
  sprints,
}: {
  projectId: string;
  epics: Epic[];
  sprints: Sprint[];
}) {
  const [epicDialog, setEpicDialog] = useState<Epic | "new" | null>(null);
  const [sprintDialog, setSprintDialog] = useState<Sprint | "new" | null>(null);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {/* Epics */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Layers className="size-4 text-primary" /> Epics
            <span className="text-xs text-muted-foreground">{epics.length}</span>
          </span>
          <Button size="sm" variant="outline" onClick={() => setEpicDialog("new")}>
            <Plus className="size-4" /> New epic
          </Button>
        </div>
        {epics.length === 0 ? (
          <p className="px-1 py-2 text-xs text-muted-foreground">
            No epics yet. An epic houses one or more sprints.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {epics.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setEpicDialog(e)}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium hover:border-primary/40"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: e.color }}
                />
                {e.title}
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Rocket className="size-3" />
                  {e.sprintCount}
                </span>
                <Pencil className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sprints */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Rocket className="size-4 text-primary" /> Sprints
            <span className="text-xs text-muted-foreground">{sprints.length}</span>
          </span>
          <Button size="sm" variant="outline" onClick={() => setSprintDialog("new")}>
            <Plus className="size-4" /> New sprint
          </Button>
        </div>
        {sprints.length === 0 ? (
          <p className="px-1 py-2 text-xs text-muted-foreground">
            No sprints yet. Create a sprint to plan a time-boxed iteration.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {sprints.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSprintDialog(s)}
                className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-1.5 text-left hover:border-primary/40"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  {s.epicTitle && (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground"
                      title={`Epic: ${s.epicTitle}`}
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: s.epicColor ?? "currentColor" }}
                      />
                      {s.epicTitle}
                      <span aria-hidden>›</span>
                    </span>
                  )}
                  {s.name}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SPRINT_STATUS_META[s.status].className}`}
                  >
                    {SPRINT_STATUS_META[s.status].label}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {s.startDate && s.endDate && (
                    <span>
                      {fmtDate(s.startDate)}–{fmtDate(s.endDate)}
                    </span>
                  )}
                  <span>{s.taskCount} tasks</span>
                  <Pencil className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {epicDialog && (
        <EpicDialog
          projectId={projectId}
          epic={epicDialog === "new" ? null : epicDialog}
          onClose={() => setEpicDialog(null)}
        />
      )}
      {sprintDialog && (
        <SprintDialog
          projectId={projectId}
          sprint={sprintDialog === "new" ? null : sprintDialog}
          epics={epics}
          onClose={() => setSprintDialog(null)}
        />
      )}
    </div>
  );
}

function EpicDialog({
  projectId,
  epic,
  onClose,
}: {
  projectId: string;
  epic: Epic | null;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState(epic?.color ?? EPIC_COLORS[0]);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("projectId", projectId);
    fd.set("color", color);
    if (epic) fd.set("id", epic.id);
    startTransition(async () => {
      const res = await (epic ? updateEpic(fd) : createEpic(fd));
      if (res?.error) setError(res.error);
      else {
        toast.success(epic ? "Epic updated" : "Epic created");
        onClose();
      }
    });
  }

  function onDelete() {
    if (!epic) return;
    if (!window.confirm("Delete this epic? Its tasks stay in the project.")) return;
    const fd = new FormData();
    fd.set("id", epic.id);
    fd.set("projectId", projectId);
    startTransition(async () => {
      const res = await deleteEpic(fd);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Epic deleted");
        onClose();
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{epic ? "Edit epic" : "New epic"}</DialogTitle>
          <DialogDescription>
            An epic is the top level — it houses one or more sprints.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="epic-title">Title</Label>
            <Input
              id="epic-title"
              name="title"
              defaultValue={epic?.title ?? ""}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="epic-desc">Description</Label>
            <Textarea
              id="epic-desc"
              name="description"
              rows={3}
              defaultValue={epic?.description ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Colour</Label>
            <div className="flex flex-wrap gap-2">
              {EPIC_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Colour ${c}`}
                  className={`size-7 rounded-full border-2 transition-transform ${
                    color === c ? "scale-110 border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <FormError error={error ?? undefined} />
          <div className="flex items-center justify-between">
            {epic ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                onClick={onDelete}
                disabled={pending}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={pending}>
              {epic ? "Save epic" : "Create epic"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SprintDialog({
  projectId,
  sprint,
  epics,
  onClose,
}: {
  projectId: string;
  sprint: Sprint | null;
  epics: Epic[];
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("projectId", projectId);
    if (sprint) fd.set("id", sprint.id);
    startTransition(async () => {
      const res = await (sprint ? updateSprint(fd) : createSprint(fd));
      if (res?.error) setError(res.error);
      else {
        toast.success(sprint ? "Sprint updated" : "Sprint created");
        onClose();
      }
    });
  }

  function onDelete() {
    if (!sprint) return;
    if (!window.confirm("Delete this sprint? Its tasks return to the backlog.")) return;
    const fd = new FormData();
    fd.set("id", sprint.id);
    fd.set("projectId", projectId);
    startTransition(async () => {
      const res = await deleteSprint(fd);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Sprint deleted");
        onClose();
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{sprint ? "Edit sprint" : "New sprint"}</DialogTitle>
          <DialogDescription>
            A sprint belongs to an epic and holds the tasks you assign to it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sprint-name">Name</Label>
            <Input
              id="sprint-name"
              name="name"
              defaultValue={sprint?.name ?? ""}
              placeholder="Sprint 1"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sprint-epic">Epic</Label>
            <Select
              id="sprint-epic"
              name="epicId"
              defaultValue={sprint?.epicId ?? ""}
            >
              <option value="">No epic</option>
              {epics.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </Select>
            {epics.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                Create an epic first to house this sprint.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sprint-goal">Goal</Label>
            <Textarea
              id="sprint-goal"
              name="goal"
              rows={2}
              defaultValue={sprint?.goal ?? ""}
              placeholder="What should this sprint achieve?"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="sprint-status">Status</Label>
              <Select
                id="sprint-status"
                name="status"
                defaultValue={sprint?.status ?? "PLANNED"}
              >
                {(Object.keys(SPRINT_STATUS_META) as SprintStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {SPRINT_STATUS_META[k].label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sprint-start">Start</Label>
              <Input
                id="sprint-start"
                name="startDate"
                type="date"
                defaultValue={sprint?.startDate ? sprint.startDate.slice(0, 10) : ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sprint-end">End</Label>
              <Input
                id="sprint-end"
                name="endDate"
                type="date"
                defaultValue={sprint?.endDate ? sprint.endDate.slice(0, 10) : ""}
              />
            </div>
          </div>
          <FormError error={error ?? undefined} />
          <div className="flex items-center justify-between">
            {sprint ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive"
                onClick={onDelete}
                disabled={pending}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={pending}>
              {sprint ? "Save sprint" : "Create sprint"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
