import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CardControls,
  CardOverviewHeader,
  FundingOptions,
  InsightsPanel,
  LbCardTransaction,
  TransactionsList,
  VirtualCardDetails,
  VirtualCardSnapshot,
} from "@/components/v2/lb-card";

const WILDFIRE_FIXTURES: LbCardTransaction[] = [
  {
    id: "wf-1",
    merchant: "Rivergrove Co-op Market",
    amountCents: 2845,
    occurredAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    category: "Groceries",
    status: "completed",
    isMemberBusiness: true,
    details: "Produce + pantry staples",
  },
  {
    id: "wf-2",
    merchant: "Neighborhood Tool Library",
    amountCents: 1200,
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    category: "Services",
    status: "completed",
    isMemberBusiness: true,
    details: "Workshop access pass",
  },
  {
    id: "wf-3",
    merchant: "Metro Transit",
    amountCents: 575,
    occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    category: "Transit",
    status: "pending",
    isMemberBusiness: false,
    details: "Day pass",
  },
];

const DEMO_VIRTUAL_CARD: VirtualCardSnapshot = {
  pan: "4242 4242 4242 4242",
  cvv: "123",
  expiry: "12/29",
};

function parseStatus(value: unknown): LbCardTransaction["status"] {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";
  if (normalized === "completed") return "completed";
  if (normalized === "pending") return "pending";
  return "reversed";
}

function coerceCategory(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  return "General";
}

export default function LBCardV2Page() {
  const { user } = useAuth();
  const { isRunning: isWildfireTour } = useWildfireRun();
  const tourTarget = useTourTarget("lb-card");
  const [isFrozen, setIsFrozen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showVirtualDetails, setShowVirtualDetails] = useState(false);

  const transactionsQuery = useQuery({
    queryKey: ["lb-card-v2-transactions", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<LbCardTransaction[]> => {
      const { data, error } = await supabase
        .from("transaction_ledger" as never)
        .select("*")
        .or(`payer_id.eq.${user!.id},payee_id.eq.${user!.id}`)
        .eq("currency", "usd")
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) return [];

      return ((data ?? []) as Array<Record<string, unknown>>).map((row, index) => {
        const fallbackAmount = Number(row.amount_cents ?? row.amount ?? 0);
        const amountCents = Number.isFinite(fallbackAmount) ? Math.round(fallbackAmount) : 0;

        return {
          id: String(row.id ?? `row-${index}`),
          merchant:
            typeof row.memo === "string" && row.memo.trim().length > 0 ? row.memo : "Card transaction",
          amountCents,
          occurredAt:
            typeof row.created_at === "string" && row.created_at.length > 0
              ? row.created_at
              : new Date().toISOString(),
          category: coerceCategory(row.ledger_category ?? row.category),
          status: parseStatus(row.status),
          isMemberBusiness: Boolean(row.member_business || row.is_member_business),
          details:
            typeof row.description === "string" && row.description.trim().length > 0
              ? row.description
              : undefined,
        };
      });
    },
    staleTime: 60_000,
  });

  const transactions = useMemo(() => {
    if (isWildfireTour) return WILDFIRE_FIXTURES;
    return transactionsQuery.data ?? [];
  }, [isWildfireTour, transactionsQuery.data]);

  const balanceCents = useMemo(() => {
    if (isWildfireTour) {
      return WILDFIRE_FIXTURES.reduce((sum, txn) => sum + txn.amountCents, 0) + 15_000;
    }
    return Math.max(
      0,
      transactions.reduce((sum, txn) => {
        return txn.status === "completed" ? sum - Math.abs(txn.amountCents) : sum;
      }, 0),
    );
  }, [isWildfireTour, transactions]);

  const categorySpend = useMemo(() => {
    const spend = new Map<string, number>();
    for (const txn of transactions) {
      if (txn.status !== "completed") continue;
      spend.set(txn.category, (spend.get(txn.category) ?? 0) + Math.abs(txn.amountCents));
    }
    return Array.from(spend.entries())
      .map(([category, amountCents]) => ({ category, amountCents }))
      .sort((a, b) => b.amountCents - a.amountCents)
      .slice(0, 5);
  }, [transactions]);

  const memberBusinessPercent = useMemo(() => {
    const completed = transactions.filter((txn) => txn.status === "completed");
    if (completed.length === 0) return 0;
    const memberCount = completed.filter((txn) => txn.isMemberBusiness).length;
    return Math.round((memberCount / completed.length) * 100);
  }, [transactions]);

  const handleAddFunds = () => {
    toast.info("Funding flow is stubbed pending DD-2 approval. Bank-account transfer only.");
  };

  const handleToggleFreeze = () => {
    setIsFrozen((prev) => !prev);
    toast.success(isFrozen ? "Card unfrozen." : "Card frozen instantly.");
  };

  return (
    <AppShell
      xrayBase="lb-card"
      pageTitle="LB Card"
      breadcrumbs="Member workspace / Specialized surfaces"
      hero={
        <Hero
          variant="app"
          eyebrow="LB Card"
          headline="A cooperative card that funds from cash, not from your contribution history."
          body="Add funds from your bank, freeze instantly, and see where your money lands in the local economy."
          primaryCTA={{ label: "Add funds", href: "#lb-card-funding-anchor" }}
          secondaryCTA={{ label: "Card controls", href: "#lb-card-controls-anchor" }}
          proofStrip={["Cash-only funding", "Instant freeze", "Member-business insights"]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />
        <div id="lb-card-funding-anchor" data-xray-id="lb-card-tour-anchor" />

        <CardOverviewHeader
          lastFour="2048"
          balanceCents={balanceCents}
          isFrozen={isFrozen}
          onAddFunds={handleAddFunds}
          onToggleFreeze={handleToggleFreeze}
          onViewDetails={() => setShowVirtualDetails(true)}
        />

        <FundingOptions onAddFunds={handleAddFunds} />
        <TransactionsList transactions={transactions} />
        <InsightsPanel categorySpend={categorySpend} memberBusinessPercent={memberBusinessPercent} />

        <div id="lb-card-controls-anchor" data-xray-id="lb-card-controls-anchor" />
        <CardControls
          isFrozen={isFrozen}
          notificationsEnabled={notificationsEnabled}
          onToggleFreeze={handleToggleFreeze}
          onToggleNotifications={setNotificationsEnabled}
          onShowVirtualDetails={() => setShowVirtualDetails(true)}
        />

        <VirtualCardDetails
          details={DEMO_VIRTUAL_CARD}
          isVisible={showVirtualDetails}
          onHide={() => setShowVirtualDetails(false)}
        />
      </div>
      <StickyMobileCTA primary={{ label: "Add funds", href: "#lb-card-funding-anchor" }} />
    </AppShell>
  );
}
