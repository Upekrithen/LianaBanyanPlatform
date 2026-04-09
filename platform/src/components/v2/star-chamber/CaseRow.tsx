import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type StarCase = {
  id: string;
  caseNumber: number;
  title: string;
  caseType: string;
  severity: string;
  status: string;
  createdAt: string;
};

type CaseRowProps = {
  item: StarCase;
  onOpen: (caseId: string) => void;
};

export function CaseRow({ item, onOpen }: CaseRowProps) {
  return (
    <article className="rounded-lg border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Case #{item.caseNumber}</p>
          <p className="truncate text-sm font-medium">{item.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{item.caseType}</Badge>
          <Badge className="bg-amber-700 text-white">{item.severity}</Badge>
          <Badge variant="secondary">{item.status.replace(/_/g, " ")}</Badge>
          <Button size="sm" onClick={() => onOpen(item.id)}>Open</Button>
        </div>
      </div>
    </article>
  );
}
