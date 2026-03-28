import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useFundingSchedules,
  type FundingSchedule,
} from "@/hooks/useLBCardFunding";

function toMonthly(s: FundingSchedule): number {
  if (s.status !== "active") return 0;
  switch (s.frequency) {
    case "daily":
      return s.amount * 30;
    case "weekly":
      return s.amount * 4.33;
    case "biweekly":
      return s.amount * 2.17;
    default:
      return s.amount;
  }
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function FundingWidget() {
  const nav = useNavigate();
  const { data: incoming = [] } = useFundingSchedules("recipient");
  const { data: outgoing = [] } = useFundingSchedules("funder");

  const monthlyIn = useMemo(() => incoming.reduce((s, r) => s + toMonthly(r), 0), [incoming]);
  const monthlyOut = useMemo(() => outgoing.reduce((s, r) => s + toMonthly(r), 0), [outgoing]);

  const activeCount =
    incoming.filter((s) => s.status === "active").length +
    outgoing.filter((s) => s.status === "active").length;

  const nextDate = useMemo(() => {
    const all = [...incoming, ...outgoing]
      .filter((s) => s.status === "active" && s.next_funding_at)
      .map((s) => new Date(s.next_funding_at!).getTime())
      .sort((a, b) => a - b);
    return all.length > 0 ? new Date(all[0]).toLocaleDateString() : null;
  }, [incoming, outgoing]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-5 w-5" />
          Card Funding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-card/60 p-3 text-center">
            <ArrowDownLeft className="mx-auto h-4 w-4 text-emerald-500" />
            <p className="mt-1 text-xs text-muted-foreground">Monthly In</p>
            <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatUsd(monthlyIn)}
            </p>
          </div>
          <div className="rounded-md border bg-card/60 p-3 text-center">
            <ArrowUpRight className="mx-auto h-4 w-4 text-blue-500" />
            <p className="mt-1 text-xs text-muted-foreground">Monthly Out</p>
            <p className="text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400">
              {formatUsd(monthlyOut)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            {activeCount} active schedule{activeCount !== 1 ? "s" : ""}
          </span>
          {nextDate && (
            <span className="text-xs text-muted-foreground">Next: {nextDate}</span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => nav("/dashboard/fund-card")}
        >
          Manage Card Funding
        </Button>
      </CardContent>
    </Card>
  );
}
