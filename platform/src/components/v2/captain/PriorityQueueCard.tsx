import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export type PriorityQueueItem = {
  id: string;
  statusLine: string;
  actionLabel: string;
  actionHref?: string;
};

type PriorityQueueCardProps = {
  title: string;
  description: string;
  items: PriorityQueueItem[];
  emptyState: string;
  tourTargetProps?: { "data-tour-target": string };
};

export function PriorityQueueCard({
  title,
  description,
  items,
  emptyState,
  tourTargetProps,
}: PriorityQueueCardProps) {
  return (
    <Card
      id="priority-queue"
      className="border-primary/40 bg-gradient-to-b from-primary/10 to-background shadow-sm"
      {...tourTargetProps}
    >
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge variant="secondary">{items.length} active</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{emptyState}</p>
        ) : (
          items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-md border bg-background/90 p-3">
              <p className="text-sm">{item.statusLine}</p>
              <Button asChild size="sm" variant="outline" className="mt-2">
                <a href={item.actionHref ?? "#captain-deeper-layers"}>
                  {item.actionLabel}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
