import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  Flame,
  Moon,
  Plus,
  Search,
  Sun,
  Timer,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TaskCard } from "@/components/planner/TaskCard";
import { TaskDialog, type TaskDraft } from "@/components/planner/TaskDialog";
import {
  computeStreak,
  formatMinutes,
  isOverdue,
  loadTasks,
  loadTheme,
  newId,
  priorityOrder,
  saveTasks,
  saveTheme,
  todayISO,
  type Task,
  type Theme,
} from "@/lib/planner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyForge - Offline Study Planner & Task Tracker" },
      {
        name: "description",
        content:
          "StudyForge is a fast, private study planner: add, edit and complete tasks, track progress and streaks, with dark mode and offline local storage.",
      },
      { property: "og:title", content: "StudyForge - Offline Study Planner" },
      {
        property: "og:description",
        content:
          "Plan study sessions, track progress bars and streaks, and keep every task saved on your own device.",
      },
    ],
  }),
  component: Planner,
});

type FilterKey = "all" | "today" | "upcoming" | "overdue" | "done";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "overdue", label: "Overdue" },
  { key: "done", label: "Completed" },
];

function Planner() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [clearDoneOpen, setClearDoneOpen] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    const stored = loadTheme();
    setTheme(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveTasks(tasks);
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveTheme(theme);
  }, [theme, hydrated]);

  const subjects = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.subject).filter(Boolean))).sort(),
    [tasks],
  );

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.completed).length;
    const total = tasks.length;
    const minutesLeft = tasks.filter((t) => !t.completed).reduce((a, t) => a + t.estimate, 0);
    const dueToday = tasks.filter((t) => !t.completed && t.dueDate === todayISO()).length;
    return {
      done,
      total,
      percent: total ? Math.round((done / total) * 100) : 0,
      minutesLeft,
      dueToday,
      overdue: tasks.filter(isOverdue).length,
      streak: computeStreak(tasks),
    };
  }, [tasks]);

  const visible = useMemo(() => {
    const today = todayISO();
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (subject !== "all" && t.subject !== subject) return false;
        if (q && !`${t.title} ${t.notes} ${t.subject}`.toLowerCase().includes(q)) return false;
        switch (filter) {
          case "today":
            return !t.completed && t.dueDate === today;
          case "upcoming":
            return !t.completed && !!t.dueDate && t.dueDate > today;
          case "overdue":
            return isOverdue(t);
          case "done":
            return t.completed;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (!!a.dueDate !== !!b.dueDate) return a.dueDate ? -1 : 1;
        if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
        if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
        return b.createdAt - a.createdAt;
      });
  }, [tasks, filter, query, subject]);

  function handleSave(draft: TaskDraft) {
    if (editing) {
      setTasks((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...draft } : t)));
      toast.success("Task updated");
    } else {
      setTasks((prev) => [
        {
          id: newId(),
          ...draft,
          completed: false,
          createdAt: Date.now(),
          completedAt: null,
        },
        ...prev,
      ]);
      toast.success("Task added to your plan");
    }
    setEditing(null);
  }

  function toggle(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : null }
          : t,
      ),
    );
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const removed = tasks.find((t) => t.id === pendingDelete);
    setTasks((prev) => prev.filter((t) => t.id !== pendingDelete));
    setPendingDelete(null);
    if (removed) {
      toast("Task deleted", {
        description: removed.title,
        action: {
          label: "Undo",
          onClick: () => setTasks((prev) => [removed, ...prev]),
        },
      });
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 surface-grid" />

      <main className="relative mx-auto max-w-4xl px-5 pt-10 pb-24 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <BookOpenCheck className="size-5" />
              </span>
              <h1 className="text-2xl font-semibold sm:text-3xl">StudyForge</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Plan the work, then do the work. Everything is saved on this device — no account, works
              offline.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </header>

        <section className="mt-8 rounded-2xl border bg-card p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Overall progress
              </p>
              <p className="mt-1 font-display text-3xl font-semibold">
                {stats.percent}%
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {stats.done} of {stats.total} tasks done
                </span>
              </p>
            </div>
            {stats.streak > 0 ? (
              <Badge variant="secondary" className="gap-1.5 py-1.5">
                <Flame className="size-3.5 text-accent" />
                {stats.streak}-day streak
              </Badge>
            ) : null}
          </div>

          <Progress value={stats.percent} className="mt-4 h-3" />

          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={<Timer className="size-4" />} label="Time left" value={formatMinutes(stats.minutesLeft)} />
            <Stat icon={<BookOpenCheck className="size-4" />} label="Due today" value={`${stats.dueToday}`} />
            <Stat
              icon={<Flame className="size-4" />}
              label="Overdue"
              value={`${stats.overdue}`}
              tone={stats.overdue ? "danger" : "default"}
            />
            <Stat icon={<CheckCircle2 className="size-4" />} label="Completed" value={`${stats.done}`} />
          </dl>
        </section>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, subjects, notes"
              className="pl-9"
              aria-label="Search tasks"
            />
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" /> New task
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                filter === f.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
          {subjects.length > 0 ? (
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                onClick={() => setSubject("all")}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs",
                  subject === "all" ? "border-accent bg-accent/15" : "border-border text-muted-foreground",
                )}
              >
                All subjects
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs",
                    subject === s ? "border-accent bg-accent/15" : "border-border text-muted-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {visible.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {visible.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggle}
                onEdit={(t) => {
                  setEditing(t);
                  setDialogOpen(true);
                }}
                onDelete={setPendingDelete}
              />
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed bg-card/60 px-6 py-14 text-center">
            <p className="font-display text-lg font-medium">
              {tasks.length === 0 ? "Your planner is empty" : "Nothing matches this view"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {tasks.length === 0
                ? "Add your first task — a chapter to revise, a problem set, a past paper — and StudyForge will track your progress."
                : "Try another filter or clear your search."}
            </p>
            {tasks.length === 0 ? (
              <Button
                className="mt-5"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                <Plus className="size-4" /> Add a task
              </Button>
            ) : null}
          </div>
        )}

        {completedCount > 0 ? (
          <div className="mt-8 flex justify-center">
            <Button variant="ghost" onClick={() => setClearDoneOpen(true)}>
              <Trash2 className="size-4" /> Clear {completedCount} completed
            </Button>
          </div>
        ) : null}
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        task={editing}
        subjects={subjects}
        onSave={handleSave}
      />

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from your planner. You can undo right after deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearDoneOpen} onOpenChange={setClearDoneOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear completed tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              {completedCount} completed task{completedCount === 1 ? "" : "s"} will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep them</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setTasks((prev) => prev.filter((t) => !t.completed));
                toast.success("Completed tasks cleared");
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-xl border bg-background/60 px-3 py-3">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 font-display text-lg font-semibold",
          tone === "danger" && "text-destructive",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
