import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaseRow, StarCase } from "./CaseRow";

type CaseQueueGridProps = {
  items: StarCase[];
  onOpen: (caseId: string) => void;
};

export function CaseQueueGrid({ items, onOpen }: CaseQueueGridProps) {
  return (
    <Card id="case-queue-grid">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Case queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length > 0 ? (
          items.map((item) => <CaseRow key={item.id} item={item} onOpen={onOpen} />)
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">No active cases.</p>
        )}
      </CardContent>
    </Card>
  );
}
