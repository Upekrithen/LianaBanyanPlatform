import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Assignment } from "./types";

type ActiveAssignmentsPanelProps = {
  assignments: Assignment[];
};

export function ActiveAssignmentsPanel({ assignments }: ActiveAssignmentsPanelProps) {
  return (
    <Card data-xray-id="bounty-photography-active-assignments">
      <CardHeader>
        <CardTitle>My active assignments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignments.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            No active assignments yet.
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{assignment.bountyTitle}</p>
              <p className="text-muted-foreground">{assignment.merchant}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Due {new Date(assignment.dueAt).toLocaleDateString()} · {assignment.status.replace(/_/g, " ")}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
