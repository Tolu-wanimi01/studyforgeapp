export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  notes: string;
  subject: string;
  priority: Priority;
  dueDate: string; // yyyy-mm-dd or ""
  estimate: number; // minutes
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
};

export type Theme = "light" | "dark";

const TASKS_KEY = "studyforge.tasks.v1";
const THEME_KEY = "studyforge.theme.v1";

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t) => t && typeof t.id === "string") as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    /* storage full or unavailable */
  }
}

export function loadTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function saveTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, theme);
}

export function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function isOverdue(task: Task) {
  if (!task.dueDate || task.completed) return false;
  return task.dueDate < todayISO();
}

export function todayISO() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function formatDue(dueDate: string) {
  if (!dueDate) return "No due date";
  const today = todayISO();
  if (dueDate === today) return "Due today";
  const d = new Date(dueDate + "T00:00:00");
  const diff = Math.round((d.getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
  if (diff === 1) return "Due tomorrow";
  if (diff === -1) return "1 day overdue";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff <= 6) return `Due in ${diff} days`;
  return `Due ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function formatMinutes(total: number) {
  if (!total) return "0m";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
}

/** Consecutive days (ending today or yesterday) with at least one completed task. */
export function computeStreak(tasks: Task[]) {
  const days = new Set(
    tasks
      .filter((t) => t.completed && t.completedAt)
      .map((t) => new Date(t.completedAt!).toDateString()),
  );
  if (days.size === 0) return 0;
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toDateString())) return 0;
  }
  let streak = 0;
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
