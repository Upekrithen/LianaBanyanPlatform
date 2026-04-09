import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type AuditEntry = {
  id: string;
  timestamp: string;
  event: string;
  detail: string;
};

type AuditTrailTableProps = {
  entries: AuditEntry[];
};

export function AuditTrailTable({ entries }: AuditTrailTableProps) {
  return (
    <Card id="audit-trail-table">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Audit trail</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Timestamp</th>
                  <th className="border p-2 text-left">Event</th>
                  <th className="border p-2 text-left">Detail</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="border p-2 text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="border p-2">{entry.event}</td>
                    <td className="border p-2 text-muted-foreground">{entry.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No audit entries yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
