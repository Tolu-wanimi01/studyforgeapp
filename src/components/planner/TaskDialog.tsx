import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Priority, Task } from "@/lib/planner";

export type TaskDraft = {
  title: string;
  notes: string;
  subject: string;
  priority: Priority;
  dueDate: string;
  estimate: number;
};

const emptyDraft: TaskDraft = {
  title: "",
  notes: "",
  subject: "",
  priority: "medium",
  dueDate: "",
  estimate: 30,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  subjects: string[];
  onSave: (draft: TaskDraft) => void;
};

export function TaskDialog({ open, onOpenChange, task, subjects, onSave }: Props) {
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setDraft(
      task
        ? {
            title: task.title,
            notes: task.notes,
            subject: task.subject,
            priority: task.priority,
            dueDate: task.dueDate,
            estimate: task.estimate,
          }
        : emptyDraft,
    );
  }, [open, task]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) {
      setError("Give your task a title first.");
      return;
    }
    onSave({ ...draft, title: draft.title.trim(), subject: draft.subject.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New study task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Update the details and save your changes."
              : "What do you need to get through? Everything stays on this device."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task</Label>
            <Input
              id="title"
              autoFocus
              placeholder="Revise chapter 4: cell respiration"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                list="subject-suggestions"
                placeholder="Biology"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              />
              <datalist id="subject-suggestions">
                {subjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due">Due date</Label>
              <Input
                id="due"
                type="date"
                value={draft.dueDate}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={draft.priority}
                onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimate">Est. minutes</Label>
              <Input
                id="estimate"
                type="number"
                min={0}
                step={5}
                value={draft.estimate}
                onChange={(e) => setDraft({ ...draft, estimate: Number(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Pages 120-145, then past-paper questions."
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{task ? "Save changes" : "Add task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
