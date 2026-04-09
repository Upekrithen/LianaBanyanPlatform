import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseStatusBadge } from "./CaseStatusBadge";
import { ContentShieldCase } from "./types";

type ActiveModerationQueueProps = {
  queue: ContentShieldCase[];
};

export function ActiveModerationQueue({ queue }: ActiveModerationQueueProps) {
  return (
    <Card data-xray-id="content-shield-moderation-queue">
      <CardHeader>
        <CardTitle>Active moderation queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {queue.length === 0 ? (
          <p className="text-sm text-muted-foreground">Queue is clear.</p>
        ) : (
          queue.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-medium">{item.category}</p>
                <CaseStatusBadge status={item.status} />
              </div>
              <p className="text-sm">{item.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Intake {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
