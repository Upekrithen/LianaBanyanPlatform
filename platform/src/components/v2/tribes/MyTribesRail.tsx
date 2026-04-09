import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type MyTribeItem = {
  id: string;
  name: string;
  category: string;
  unreadCount: number;
};

type MyTribesRailProps = {
  items: MyTribeItem[];
  onOpen: (tribeId: string) => void;
};

export function MyTribesRail({ items, onOpen }: MyTribesRailProps) {
  if (items.length === 0) return null;

  return (
    <section id="my-tribes-rail" className="space-y-3">
      <h2 className="text-lg font-semibold">My tribes</h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <Card key={item.id} className="min-w-[220px] border-orange-200/70 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <Badge variant="secondary">{item.category}</Badge>
              <div className="flex items-center gap-2">
                {item.unreadCount > 0 ? <Badge>{item.unreadCount} unread</Badge> : null}
                <Button size="sm" variant="outline" onClick={() => onOpen(item.id)}>
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
