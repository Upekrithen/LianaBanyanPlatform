import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { THREAD_LABELS, THREAD_ORDER, ThreadType } from "./types";

type ThreadSourceManagerProps = {
  enabled: Record<ThreadType, boolean>;
  onToggle: (thread: ThreadType, value: boolean) => void;
};

const SOURCE_BY_THREAD: Record<ThreadType, string> = {
  personal: "Personal calendar (stub source)",
  family: "Family Table",
  business: "Calendar business events",
  coalition: "Coalition meetings (stub source)",
  route: "Route planning / Local Wheels",
  defense: "Defense Klaus scheduling",
  education: "Didasko / learning blocks",
};

export function ThreadSourceManager({ enabled, onToggle }: ThreadSourceManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Thread source manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {THREAD_ORDER.map((thread) => (
          <div key={thread} className="flex items-center justify-between gap-3 rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">{THREAD_LABELS[thread]}</p>
              <p className="text-xs text-muted-foreground">{SOURCE_BY_THREAD[thread]}</p>
            </div>
            <Switch checked={enabled[thread]} onCheckedChange={(next) => onToggle(thread, next)} />
          </div>
        ))}
        <Button asChild variant="outline">
          <a href="#thread-source-manager">Adjust my sources</a>
        </Button>
      </CardContent>
    </Card>
  );
}
