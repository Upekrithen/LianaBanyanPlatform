import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FamilyTask, TaskCard } from "./TaskCard";

type TaskBoardProps = {
  tasks: FamilyTask[];
};

const COLUMNS: { key: FamilyTask["status"]; label: string }[] = [
  { key: "todo", label: "To Do" },
  { key: "doing", label: "Doing" },
  { key: "done", label: "Done" },
];

function isAmberOverdue(task: FamilyTask) {
  if (task.status === "done" || !task.dueAt) return false;
  const due = new Date(task.dueAt);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Task board</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-3">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.key);
            return (
              <section key={column.key} className="space-y-2 rounded-xl border bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{column.label}</h3>
                  <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
                </div>
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} amberOverdue={isAmberOverdue(task)} />
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                    Nothing here yet.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
