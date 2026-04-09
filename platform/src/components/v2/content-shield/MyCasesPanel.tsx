import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentShieldCase } from "./types";
import { CaseStatusBadge } from "./CaseStatusBadge";

type MyCasesPanelProps = {
  cases: ContentShieldCase[];
};

export function MyCasesPanel({ cases }: MyCasesPanelProps) {
  return (
    <Card data-xray-id="content-shield-my-cases">
      <CardHeader>
        <CardTitle>My cases</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cases.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
            No cases yet. If you report an issue, status appears here.
          </div>
        ) : (
          cases.map((item) => (
            <div key={item.id} className="rounded-lg border p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{item.category}</p>
                <CaseStatusBadge status={item.status} />
              </div>
              <p className="text-sm">{item.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Reported {new Date(item.createdAt).toLocaleString()} · {item.visibilityNote}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
