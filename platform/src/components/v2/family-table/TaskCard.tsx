import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock3 } from "lucide-react";

export type FamilyTaskStatus = "todo" | "doing" | "done";

export type FamilyTask = {
  id: string;
  title: string;
  assigneeLabel: string;
  status: FamilyTaskStatus;
  dueAt: string | null;
};

type TaskCardProps = {
  task: FamilyTask;
  amberOverdue: boolean;
};

function formatDue(dueAt: string | null) {
  if (!dueAt) return "No due date";
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TaskCard({ task, amberOverdue }: TaskCardProps) {
  return (
    <Card
      className={
        amberOverdue
          ? "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
          : undefined
      }
    >
      <CardContent className="space-y-2 p-3">
        <p className="text-sm font-medium leading-tight">{task.title}</p>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="text-xs">
            {task.assigneeLabel}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock3 className="h-3 w-3" />
            {formatDue(task.dueAt)}
          </span>
        </div>
        {amberOverdue ? (
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Still open</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
