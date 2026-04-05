import { Building2, Download, FileText, Landmark, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MoneySnapshotProps = {
  revenueCents: number;
  expensesCents: number;
  balanceCents: number;
};

type RevenueExpenseTimelineProps = {
  points: Array<{
    id: string;
    period: string;
    note: string;
    revenueLabel: string;
    expenseLabel: string;
  }>;
};

type CategoryBreakdownsProps = {
  categories: Array<{
    id: string;
    label: string;
    amountCents: number;
    narrative: string;
  }>;
};

type ExportHistoryProps = {
  exports: Array<{
    id: string;
    label: string;
    period: string;
    state: "ready" | "pending";
  }>;
};

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function LedgerHero({
  onViewCurrentLedger,
  onHowCostPlusWorks,
}: {
  onViewCurrentLedger: () => void;
  onHowCostPlusWorks: () => void;
}) {
  return (
    <Hero
      variant="focus"
      eyebrow="Transparency Ledger"
      headline="See how the platform handles money."
      body="Review revenue, expenses, corporate balance, and the Cost+20% operating model in a format designed to explain, not obscure."
      primaryCTA={{ label: "View current ledger", onClick: onViewCurrentLedger }}
      secondaryCTA={{ label: "How Cost+20% works", onClick: onHowCostPlusWorks }}
      proofStrip={[
        "Mercury balance",
        "revenue/expense visibility",
        "public-trust purpose",
        "non-extractive model",
      ]}
    />
  );
}

export function MoneySnapshot({ revenueCents, expensesCents, balanceCents }: MoneySnapshotProps) {
  return (
    <section id="ledger-current" className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Trust statement</p>
        <h2 className="text-2xl font-semibold tracking-tight">A civic ledger, written for people.</h2>
        <p className="text-sm text-muted-foreground">
          This page explains how money moves through LIANA BANYAN CORPORATION in plain language. It prioritizes
          transparency and public trust over financial jargon.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide">Money in</CardDescription>
            <CardTitle className="text-lg">Revenue posted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{formatCurrency(revenueCents)}</p>
            <p className="mt-1 text-xs text-muted-foreground">All posted receipts for the current reporting window.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide">Money out</CardDescription>
            <CardTitle className="text-lg">Expenses posted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{formatCurrency(expensesCents)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Operating costs, service obligations, and infrastructure spend.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide">Current balance</CardDescription>
            <CardTitle className="text-lg">Corporate operating balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">{formatCurrency(balanceCents)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Published to maintain clarity on sustainability and reserves.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export function CostPlusWorkedExample() {
  return (
    <section id="ledger-cost-plus" className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Worked transaction example</p>
        <h2 className="text-2xl font-semibold tracking-tight">How Cost+20% works on one transaction</h2>
        <p className="text-sm text-muted-foreground">
          This is the core transparency module: one full walkthrough showing exactly where money goes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Transaction total</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">$500.00</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Creator keeps (83.3%)</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">$416.67</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Platform share</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">$83.33</p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Operating rule</p>
          <p className="mt-1 text-xl font-semibold">Cost + 20%</p>
        </div>
      </div>

      <ol className="space-y-2 text-sm text-muted-foreground">
        <li className="flex gap-2">
          <span className="font-semibold text-foreground">1.</span>
          <span>The transaction posts at $500.00 with traceable line items.</span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-foreground">2.</span>
          <span>$416.67 is routed to the creator side under the 83.3% structural keep rule.</span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-foreground">3.</span>
          <span>$83.33 remains for platform operation under the Cost+20% doctrine.</span>
        </li>
        <li className="flex gap-2">
          <span className="font-semibold text-foreground">4.</span>
          <span>The record is retained for member review and audit history export.</span>
        </li>
      </ol>
    </section>
  );
}

export function RevenueExpenseTimeline({ points }: RevenueExpenseTimelineProps) {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Revenue and expense timeline</p>
        <h2 className="text-2xl font-semibold tracking-tight">Annotated movement over time</h2>
        <p className="text-sm text-muted-foreground">
          Timeline notes explain what changed and why, so members can track context instead of guessing from charts.
        </p>
      </div>

      <div className="space-y-3">
        {points.map((point) => (
          <div key={point.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{point.period}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="tabular-nums">Revenue: {point.revenueLabel}</span>
                <span className="tabular-nums">Expenses: {point.expenseLabel}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{point.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryBreakdowns({ categories }: CategoryBreakdownsProps) {
  const maxAmount = Math.max(1, ...categories.map((item) => item.amountCents));

  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Category breakdowns</p>
        <h2 className="text-2xl font-semibold tracking-tight">Narrative labels for every category</h2>
        <p className="text-sm text-muted-foreground">
          Bars are simplified for readability, and each category is paired with a plain-language reason for the spend.
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const widthPct = Math.max(4, Math.round((category.amountCents / maxAmount) * 100));
          return (
            <div key={category.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">{category.label}</p>
                <p className="text-sm font-semibold tabular-nums">{formatCurrency(category.amountCents)}</p>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary/70" style={{ width: `${widthPct}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{category.narrative}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function GovernanceNote() {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-md border bg-muted/40 p-2">
          <Landmark className="h-4 w-4" />
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Governance note</p>
          <h2 className="text-2xl font-semibold tracking-tight">Why this ledger exists</h2>
          <p className="text-sm text-muted-foreground">
            LIANA BANYAN CORPORATION publishes this ledger to support member trust, public accountability, and practical
            governance oversight. The objective is clarity: explain where money goes, why it moved, and how decisions are
            constrained by structure.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
              <Building2 className="h-3 w-3" />
              Corporate reporting posture
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1">
              <ShieldCheck className="h-3 w-3" />
              Member-readable accountability
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ExportHistory({ exports }: ExportHistoryProps) {
  return (
    <section id="ledger-export-history" className="space-y-4 rounded-xl border bg-card p-5 sm:p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Export and history</p>
        <h2 className="text-2xl font-semibold tracking-tight">Download records and track revisions</h2>
        <p className="text-sm text-muted-foreground">
          Exports and revision history keep this ledger auditable over time while staying understandable in the present.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export current ledger
        </Button>
        <Button type="button" variant="outline" className="sm:w-auto">
          <FileText className="mr-2 h-4 w-4" />
          Open revision history
        </Button>
      </div>

      <div className="rounded-lg border">
        {exports.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No exports yet. The first export will appear here with a timestamp.</p>
        ) : (
          <ul className="divide-y">
            {exports.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.period}</p>
                </div>
                <span className="rounded-full border px-2 py-0.5 text-xs capitalize">{item.state}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
