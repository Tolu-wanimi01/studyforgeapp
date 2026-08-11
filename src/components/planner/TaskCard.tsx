import { Clock, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatDue, formatMinutes, isOverdue, type Task } from "@/lib/planner";

const priorityStyles: Record<Task["priority"], string> = {
  high: "border-destructive/40 bg-destructive/10 text-destructive",
  medium: "border-warning/40 bg-warning/15 text-warning-foreground dark:text-warning",
  low: "border-border bg-muted text-muted-foreground",
};

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function TaskCard({ task, onToggle, onEdit, onDelete }: Props) {
  const overdue = isOverdue(task);

  return (
    <li
      className={cn(
        "group relative flex gap-3 rounded-xl border bg-card p-4 shadow-card transition-all",
        "hover:-translate-y-0.5 hover:shadow-lift",
        task.completed && "opacity-65",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-3 left-0 w-1 rounded-full",
          task.completed
            ? "bg-success"
            : task.priority === "high"
              ? "bg-destructive"
              : task.priority === "medium"
                ? "bg-accent"
                : "bg-border",
        )}
      />
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-1 ml-2"
        aria-label={task.completed ? "Mark as not done" : "Mark as done"}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "font-display text-base font-medium",
              task.completed && "line-through decoration-2",
            )}
          >
            {task.title}
          </p>
          {task.subject ? (
            <Badge variant="secondary" className="font-normal">
              {task.subject}
            </Badge>
          ) : null}
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
              priorityStyles[task.priority],
            )}
          >
            {task.priority}
          </span>
        </div>

        {task.notes ? (
          <p className="mt-1.5 text-sm whitespace-pre-line text-muted-foreground">{task.notes}</p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className={cn(overdue && "font-medium text-destructive")}>
            {formatDue(task.dueDate)}
          </span>
          {task.estimate ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {formatMinutes(task.estimate)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-100">
        <Button variant="ghost" size="icon" aria-label="Edit task" onClick={() => onEdit(task)}>
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete task"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}
