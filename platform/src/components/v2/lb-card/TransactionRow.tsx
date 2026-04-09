import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LbCardTransaction } from "./types";

type TransactionRowProps = {
  transaction: LbCardTransaction;
  expanded: boolean;
  onToggleExpanded: () => void;
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function statusTone(status: LbCardTransaction["status"]): string {
  if (status === "completed") return "bg-emerald-500/10 text-emerald-700 border-emerald-300";
  if (status === "pending") return "bg-amber-500/10 text-amber-700 border-amber-300";
  return "bg-muted text-muted-foreground border-border";
}

export function TransactionRow({ transaction, expanded, onToggleExpanded }: TransactionRowProps) {
  return (
    <div className="rounded-lg border p-3" data-xray-id="lb-card-transaction-row">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{transaction.merchant}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(transaction.occurredAt).toLocaleString()} · {transaction.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {transaction.isMemberBusiness ? <Badge variant="secondary">Member business</Badge> : null}
          <Badge variant="outline" className={statusTone(transaction.status)}>
            {transaction.status}
          </Badge>
          <span className="min-w-24 text-right font-semibold tabular-nums">
            {formatUsd(transaction.amountCents)}
          </span>
          <Button type="button" size="icon" variant="ghost" onClick={onToggleExpanded} aria-label="Toggle details">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {expanded ? (
        <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
          {transaction.details || "No additional details."}
        </p>
      ) : null}
    </div>
  );
}
