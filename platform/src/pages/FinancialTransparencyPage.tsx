import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FocusShell } from "@/components/shells";
import { StickyMobileCTA } from "@/components/v2";
import {
  LedgerHero,
  MoneySnapshot,
  CostPlusWorkedExample,
  RevenueExpenseTimeline,
  CategoryBreakdowns,
  GovernanceNote,
  ExportHistory,
} from "@/components/v2/transparency";
import { useTourTarget } from "@/hooks/useTourTarget";

const EMPTY_TIMELINE = [
  {
    id: "current",
    period: "Current period",
    note: "No posted entries yet. This row will annotate the first revenue and expense movements as they are recorded.",
    revenueLabel: "$0.00",
    expenseLabel: "$0.00",
  },
];

const EMPTY_CATEGORIES = [
  {
    id: "ops",
    label: "Platform operations",
    amountCents: 0,
    narrative: "Covers hosting, payments, support systems, and reliability essentials.",
  },
  {
    id: "member-services",
    label: "Member services",
    amountCents: 0,
    narrative: "Supports moderation, help pathways, and member-facing tools.",
  },
  {
    id: "stewardship",
    label: "Stewardship and governance",
    amountCents: 0,
    narrative: "Supports policy maintenance, audits, and long-horizon governance stewardship.",
  },
];

const EMPTY_EXPORTS = [] as Array<{ id: string; label: string; period: string; state: "ready" | "pending" }>;

const WILDFIRE_TIMELINE = [
  {
    id: "wf-q1",
    period: "Q1 snapshot",
    note: "Revenue lift followed onboarding completion while costs stayed centered on platform reliability.",
    revenueLabel: "$18,750.00",
    expenseLabel: "$12,430.00",
  },
  {
    id: "wf-q2",
    period: "Q2 snapshot",
    note: "Member service costs rose with support volume during launch, then stabilized with process updates.",
    revenueLabel: "$22,180.00",
    expenseLabel: "$14,090.00",
  },
];

const WILDFIRE_CATEGORIES = [
  {
    id: "wf-ops",
    label: "Platform operations",
    amountCents: 769000,
    narrative: "Reliability spend on hosting, payments, and security uptime.",
  },
  {
    id: "wf-member-services",
    label: "Member services",
    amountCents: 418000,
    narrative: "Member response and onboarding support during active growth windows.",
  },
  {
    id: "wf-stewardship",
    label: "Stewardship and governance",
    amountCents: 221000,
    narrative: "Process oversight, legal hygiene, and reporting discipline.",
  },
];

const WILDFIRE_EXPORTS = [
  { id: "wf-1", label: "Monthly ledger export", period: "March 2026", state: "ready" as const },
  { id: "wf-2", label: "Quarterly revision digest", period: "Q1 2026", state: "pending" as const },
];

export function FinancialTransparencyPage() {
  const [params] = useSearchParams();
  const tourAnchor = useTourTarget("transparency");
  const wildfireTourMode = params.get("tour") === "wildfire" || params.get("wildfire") === "1";

  const snapshot = useMemo(
    () =>
      wildfireTourMode
        ? { revenueCents: 4093000, expensesCents: 2652000, balanceCents: 1441000 }
        : { revenueCents: 0, expensesCents: 0, balanceCents: 0 },
    [wildfireTourMode],
  );

  const timeline = wildfireTourMode ? WILDFIRE_TIMELINE : EMPTY_TIMELINE;
  const categories = wildfireTourMode ? WILDFIRE_CATEGORIES : EMPTY_CATEGORIES;
  const exportHistory = wildfireTourMode ? WILDFIRE_EXPORTS : EMPTY_EXPORTS;

  const scrollToCurrentLedger = () => {
    document.getElementById("ledger-current")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToCostPlus = () => {
    document.getElementById("ledger-cost-plus")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <FocusShell
      xrayBase="ledger"
      seo={{
        title: "Transparency Ledger | Liana Banyan",
        description:
          "Plain-language financial transparency showing revenue, expenses, corporate balance, and the Cost+20% model.",
      }}
      hero={
        <>
          <StickyMobileCTA
            primary={{ label: "View current ledger", onClick: scrollToCurrentLedger }}
            secondary={{ label: "How Cost+20% works", onClick: scrollToCostPlus }}
          />
          <div {...tourAnchor}>
            <LedgerHero onViewCurrentLedger={scrollToCurrentLedger} onHowCostPlusWorks={scrollToCostPlus} />
          </div>
        </>
      }
      className="bg-background"
    >
      <div className="space-y-6 pb-20">
        <MoneySnapshot
          revenueCents={snapshot.revenueCents}
          expensesCents={snapshot.expensesCents}
          balanceCents={snapshot.balanceCents}
        />
        <CostPlusWorkedExample />
        <RevenueExpenseTimeline points={timeline} />
        <CategoryBreakdowns categories={categories} />
        <GovernanceNote />
        <ExportHistory exports={exportHistory} />
      </div>
    </FocusShell>
  );
}

export default FinancialTransparencyPage;
