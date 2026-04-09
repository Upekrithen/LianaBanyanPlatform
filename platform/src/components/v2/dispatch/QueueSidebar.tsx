import { QueueDispatchItem } from "@/components/v2/dispatch/types";
import { cn } from "@/lib/utils";

type QueueSidebarProps = {
  items: QueueDispatchItem[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function QueueSidebar({ items, collapsed, onToggleCollapsed }: QueueSidebarProps) {
  const ordered = [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  return (
    <aside className={cn("rounded-xl border bg-card/50 p-3", collapsed && "p-2")}>
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="mb-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {collapsed ? "Open queue" : "Collapse queue"}
      </button>
      {collapsed ? null : (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Queue</p>
          {ordered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending or past dispatches yet.</p>
          ) : (
            ordered.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-md border p-2">
                <p className="text-xs font-medium">{item.platform}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{item.content}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {item.status} · {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
}
