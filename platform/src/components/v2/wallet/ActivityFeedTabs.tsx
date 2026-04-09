import { Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { WalletActivityItem, WalletActivityTab } from "./types";

type ActivityFeedTabsProps = {
  activeTab: WalletActivityTab;
  onTabChange: (tab: WalletActivityTab) => void;
  activityItems: WalletActivityItem[];
};

const TAB_LABELS: Record<WalletActivityTab, string> = {
  all: "All",
  credits: "Credits",
  marks: "Marks",
  joules: "Joules",
};

const TAB_ACCENT: Record<WalletActivityTab, string> = {
  all: "border-primary/30 bg-primary/5",
  credits: "border-[hsl(var(--currency-credits)/0.4)] bg-[hsl(var(--currency-credits)/0.08)]",
  marks: "border-[hsl(var(--currency-marks)/0.4)] bg-[hsl(var(--currency-marks)/0.08)]",
  joules: "border-[hsl(var(--currency-joules)/0.4)] bg-[hsl(var(--currency-joules)/0.08)]",
};

function tabAmountClass(amount: number) {
  if (amount < 0) return "text-amber-600";
  if (amount > 0) return "text-foreground";
  return "text-muted-foreground";
}

function formatAmount(amount: number) {
  const absolute = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (amount > 0) return `+${absolute}`;
  if (amount < 0) return `-${absolute}`;
  return absolute;
}

function currencyTextClass(currency: "credits" | "marks" | "joules"): string {
  if (currency === "credits") return "text-[hsl(var(--currency-credits))]";
  if (currency === "marks") return "text-[hsl(var(--currency-marks))]";
  return "text-[hsl(var(--currency-joules))]";
}

export function ActivityFeedTabs({ activeTab, onTabChange, activityItems }: ActivityFeedTabsProps) {
  const filtered =
    activeTab === "all" ? activityItems : activityItems.filter((entry) => entry.currency === activeTab);

  return (
    <Card className={cn("border", TAB_ACCENT[activeTab])}>
      <CardHeader className="space-y-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">Activity feed</CardTitle>
          <span className="text-xs text-muted-foreground">{filtered.length} entries</span>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as WalletActivityTab)}>
          <TabsList className="grid h-9 w-full grid-cols-4 rounded-md bg-muted/60 p-1">
            {(Object.keys(TAB_LABELS) as WalletActivityTab[]).map((tab) => (
              <TabsTrigger key={tab} value={tab} className="h-7 text-xs">
                {TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
            <Clock3 className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm font-medium">No entries yet.</p>
            <p className="mt-1 text-xs">Activity appears here when movement is recorded.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <div key={entry.id} className="flex items-start justify-between gap-3 rounded-md border bg-card p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{entry.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn("font-semibold capitalize", currencyTextClass(entry.currency))}>
                      {entry.currency}
                    </span>
                    <span>•</span>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className={cn("tabular-nums text-sm font-semibold", tabAmountClass(entry.amount))}>
                  {formatAmount(entry.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
