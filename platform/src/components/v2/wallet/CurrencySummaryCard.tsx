import { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Coins, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WalletCurrency } from "./types";

type CurrencySummaryCardProps = {
  currency: WalletCurrency;
  balance: number;
  roleLabel: string;
  lastTransaction?: string;
  detailLine?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
  anchorProps?: Record<string, string>;
};

const CURRENCY_META: Record<
  WalletCurrency,
  { label: string; symbol: string; icon: ReactNode; accent: string; accentBg: string }
> = {
  credits: {
    label: "Credits",
    symbol: "CR",
    icon: <Coins className="h-4 w-4" />,
    accent: "text-[hsl(var(--currency-credits))]",
    accentBg: "bg-[hsl(var(--currency-credits)/0.16)]",
  },
  marks: {
    label: "Marks",
    symbol: "MK",
    icon: <Sparkles className="h-4 w-4" />,
    accent: "text-[hsl(var(--currency-marks))]",
    accentBg: "bg-[hsl(var(--currency-marks)/0.16)]",
  },
  joules: {
    label: "Joules",
    symbol: "JL",
    icon: <Zap className="h-4 w-4" />,
    accent: "text-[hsl(var(--currency-joules))]",
    accentBg: "bg-[hsl(var(--currency-joules)/0.16)]",
  },
};

function formatBalance(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function CurrencySummaryCard({
  currency,
  balance,
  roleLabel,
  lastTransaction,
  detailLine,
  isSelected = false,
  onSelect,
  className,
  anchorProps,
}: CurrencySummaryCardProps) {
  const meta = CURRENCY_META[currency];

  return (
    <Card
      className={cn(
        "transition-colors",
        onSelect ? "cursor-pointer" : "",
        isSelected ? "ring-2 ring-primary/40" : "hover:border-primary/30",
        className,
      )}
      onClick={onSelect}
      {...anchorProps}
    >
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md", meta.accentBg, meta.accent)}>
            {meta.icon}
          </div>
          <Badge variant="outline" className="tabular-nums text-[10px]">
            {meta.symbol}
          </Badge>
        </div>
        <CardTitle className="text-base">{meta.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className={cn("tabular-nums text-2xl font-semibold tracking-tight sm:text-3xl", meta.accent)}>
          {formatBalance(balance)}
        </div>
        <p className="text-xs text-muted-foreground">{roleLabel}</p>
        {detailLine ? <p className="text-xs font-medium text-muted-foreground">{detailLine}</p> : null}
        {lastTransaction ? (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {lastTransaction.startsWith("-") ? (
              <ArrowUpRight className="h-3 w-3 text-amber-500" />
            ) : (
              <ArrowDownLeft className="h-3 w-3 text-primary" />
            )}
            <span className="tabular-nums">{lastTransaction}</span>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">No movement yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
