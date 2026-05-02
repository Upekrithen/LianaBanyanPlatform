import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useAuth } from "@/contexts/AuthContext";
import { useTourTarget } from "@/hooks/useTourTarget";
import { supabase } from "@/integrations/supabase/client";
import {
  ActivityFeedTabs,
  CurrencyExplainerBand,
  CurrencyHierarchyRow,
  RoleDefinitionStrip,
  WalletActionPanel,
} from "@/components/v2/wallet";
import { CurrencySummary, WalletActivityItem, WalletActivityTab, WalletCurrency } from "@/components/v2/wallet/types";
import { cn } from "@/lib/utils";

type WalletQueryData = {
  summaries: Record<WalletCurrency, CurrencySummary>;
  marksBacked: number;
  marksPledged: number;
  activity: WalletActivityItem[];
};

function formatMovement(amount: number): string {
  const text = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (amount > 0) return `+${text}`;
  if (amount < 0) return `-${text}`;
  return text;
}

export default function WalletPage() {
  const { user } = useAuth();
  const tourAnchor = useTourTarget("wallet");
  const [selectedCurrency, setSelectedCurrency] = useState<WalletCurrency>("credits");
  const [activityTab, setActivityTab] = useState<WalletActivityTab>("all");
  const miniSummarySentinelRef = useRef<HTMLDivElement | null>(null);
  const [showStickyMiniSummary, setShowStickyMiniSummary] = useState(false);

  const walletQuery = useQuery({
    queryKey: ["wallet-overview-v2", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<WalletQueryData> => {
      if (!user) {
        return {
          summaries: {
            credits: { balance: 0, roleLabel: "Transact daily value." },
            marks: { balance: 0, roleLabel: "Participate and carry governance weight." },
            joules: { balance: 0, roleLabel: "Persist specialized contribution surplus." },
          },
          marksBacked: 0,
          marksPledged: 0,
          activity: [],
        };
      }

      const [creditWalletRes, marksLedgerRes, jouleBalanceRes, creditTxRes, marksTxRes, joulesTxRes, bountyPayoutRes] =
        await Promise.all([
          supabase
            .from("credit_wallets" as never)
            .select("balance")
            .eq("user_id", user.id)
            .maybeSingle() as Promise<{ data: { balance: number } | null }>,
          supabase
            .from("shadow_marks_ledger" as never)
            .select("amount, mark_type")
            .eq("user_id", user.id) as Promise<{ data: { amount: number; mark_type: string }[] | null }>,
          supabase
            .from("joule_balances" as never)
            .select("balance")
            .eq("user_id", user.id)
            .maybeSingle() as Promise<{ data: { balance: number } | null }>,
          supabase
            .from("credit_transactions" as never)
            .select("id, amount, type, description, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(40) as Promise<{
              data: {
                id: string;
                amount: number;
                type: string;
                description: string | null;
                created_at: string;
              }[] | null;
            }>,
          supabase
            .from("marks_transactions" as never)
            .select("id, amount, reason, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(40) as Promise<{
              data: {
                id: string;
                amount: number;
                reason: string | null;
                created_at: string;
              }[] | null;
            }>,
          supabase
            .from("joules_transactions" as never)
            .select("id, joules_amount, reason, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(40) as Promise<{
              data: {
                id: string;
                joules_amount: number;
                reason: string | null;
                created_at: string;
              }[] | null;
            }>,
          // KN-H8: Bounty Marks payout history
          supabase
            .from("bounty_payout_ledger" as never)
            .select("id, marks_earned, tier_class, tier_multiplier, completion_quality_factor, payout_at")
            .eq("member_id", user.id)
            .order("payout_at", { ascending: false })
            .limit(40) as Promise<{
              data: {
                id: string;
                marks_earned: number;
                tier_class: string;
                tier_multiplier: number;
                completion_quality_factor: number;
                payout_at: string;
              }[] | null;
            }>,
        ]);

      const marksEntries = marksLedgerRes.data ?? [];
      const marksBalance = marksEntries.reduce((sum, row) => sum + Number(row.amount || 0), 0);
      const marksBacked = marksEntries
        .filter((row) => (row.mark_type ?? "").toLowerCase().includes("backed"))
        .reduce((sum, row) => sum + Math.abs(Number(row.amount || 0)), 0);
      const marksPledged = marksEntries
        .filter((row) => (row.mark_type ?? "").toLowerCase().includes("pledged"))
        .reduce((sum, row) => sum + Math.abs(Number(row.amount || 0)), 0);

      const creditTransactions = creditTxRes.data ?? [];
      const marksTransactions = marksTxRes.data ?? [];
      const joulesTransactions = joulesTxRes.data ?? [];
      const bountyPayouts = bountyPayoutRes.data ?? [];

      // Tier class display labels (KN-H8)
      const tierLabel = (tier_class: string) => {
        const map: Record<string, string> = {
          tier_a_floor_verification:  "Tier A (1.0×)",
          tier_b_uplift_verification: "Tier B (1.25×)",
          tier_c_founder_replication: "Tier C (1.5×)",
          cross_tier_comparison:      "Cross-Tier (2.0×)",
        };
        return map[tier_class] ?? tier_class;
      };

      // Add bounty Marks to the running Marks balance (one-way ratchet contribution)
      const bountyMarksTotal = bountyPayouts.reduce((sum, row) => sum + Number(row.marks_earned || 0), 0);

      const activity: WalletActivityItem[] = [
        ...creditTransactions.map((row) => ({
          id: `credits-${row.id}`,
          currency: "credits" as const,
          amount: Number(row.amount || 0),
          description: row.description || `Credits ${row.type || "movement"}`,
          createdAt: row.created_at,
          direction: Number(row.amount || 0) >= 0 ? "in" : "out",
          source: "credit_transactions" as const,
        })),
        ...marksTransactions.map((row) => ({
          id: `marks-${row.id}`,
          currency: "marks" as const,
          amount: Number(row.amount || 0),
          description: row.reason || "Marks movement",
          createdAt: row.created_at,
          direction: Number(row.amount || 0) >= 0 ? "in" : "out",
          source: "marks_transactions" as const,
        })),
        ...joulesTransactions.map((row) => {
          const amount = Number(row.joules_amount || 0);
          return {
            id: `joules-${row.id}`,
            currency: "joules" as const,
            amount,
            description: row.reason || "Joules movement",
            createdAt: row.created_at,
            direction: amount >= 0 ? "in" : "out",
            source: "joules_transactions" as const,
          };
        }),
        // KN-H8: Bounty Marks payout history (FORK-compliant; append-only ledger)
        ...bountyPayouts.map((row) => ({
          id: `bounty-${row.id}`,
          currency: "marks" as const,
          amount: Number(row.marks_earned || 0),
          description: `Bounty Marks Payout — ${tierLabel(row.tier_class)}`,
          createdAt: row.payout_at,
          direction: "in" as const,
          source: "bounty_payout_ledger" as const,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        summaries: {
          credits: {
            balance: Number(creditWalletRes.data?.balance || 0),
            roleLabel: "Transaction utility for everyday cooperative movement.",
            lastTransaction:
              creditTransactions.length > 0 ? formatMovement(Number(creditTransactions[0].amount || 0)) : undefined,
          },
          marks: {
            balance: marksBalance + bountyMarksTotal,
            roleLabel: "Participation and governance utility with accountability context.",
            lastTransaction:
              marksTransactions.length > 0 ? formatMovement(Number(marksTransactions[0].amount || 0)) : undefined,
          },
          joules: {
            balance: Number(jouleBalanceRes.data?.balance || 0),
            roleLabel: "Specialized utility for persistent production contribution flows.",
            lastTransaction:
              joulesTransactions.length > 0
                ? formatMovement(Number(joulesTransactions[0].joules_amount || 0))
                : undefined,
          },
        },
        marksBacked,
        marksPledged,
        activity,
      };
    },
  });

  useEffect(() => {
    const sentinel = miniSummarySentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyMiniSummary(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const data = walletQuery.data;
  const summaries = data?.summaries ?? {
    credits: { balance: 0, roleLabel: "Transaction utility for everyday cooperative movement." },
    marks: { balance: 0, roleLabel: "Participation and governance utility with accountability context." },
    joules: { balance: 0, roleLabel: "Specialized utility for persistent production contribution flows." },
  };

  const selectedSummary = useMemo(() => summaries[selectedCurrency], [selectedCurrency, summaries]);

  const marksDetailLine = useMemo(
    () =>
      `Backed ${Number(data?.marksBacked || 0).toLocaleString()} \u00b7 Pledged ${Number(data?.marksPledged || 0).toLocaleString()}`,
    [data?.marksBacked, data?.marksPledged],
  );

  const utilityStrip = ["3 currencies", "Unified history", "Role-based labels"];

  return (
    <AppShell
      xrayBase="wallet"
      pageTitle="Wallet"
      breadcrumbs="Member workspace / Wallet"
      hero={
        <div className="space-y-4">
          <Hero
            variant="app"
            eyebrow="Wallet"
            headline="Your balances, clearly separated."
            body="Track Credits, Marks, and Joules in one place, with distinct roles, movement history, and actions for each."
            primaryCTA={{ label: "Review activity", href: "#wallet-activity" }}
            secondaryCTA={{ label: "Open transfer tools", href: "#wallet-actions" }}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {utilityStrip.map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden>&middot;</span> : null}
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-24">
        <div ref={miniSummarySentinelRef} className="h-1 w-full" aria-hidden />

        {showStickyMiniSummary ? (
          <div className="fixed inset-x-0 top-[4.2rem] z-20 border-b bg-background/95 px-4 py-2 backdrop-blur md:hidden">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <p className="text-xs font-medium capitalize text-muted-foreground">{selectedCurrency}</p>
              <p
                className={cn(
                  "tabular-nums text-sm font-semibold",
                  selectedCurrency === "credits" && "text-[hsl(var(--currency-credits))]",
                  selectedCurrency === "marks" && "text-[hsl(var(--currency-marks))]",
                  selectedCurrency === "joules" && "text-[hsl(var(--currency-joules))]",
                )}
              >
                {selectedSummary.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        ) : null}

        <CurrencyHierarchyRow
          summaries={summaries}
          marksDetailLine={marksDetailLine}
          selectedCurrency={selectedCurrency}
          onSelectCurrency={setSelectedCurrency}
          creditsAnchorProps={tourAnchor}
        />

        <RoleDefinitionStrip />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section id="wallet-activity" className="xl:col-span-2">
            <ActivityFeedTabs
              activeTab={activityTab}
              onTabChange={(nextTab) => {
                setActivityTab(nextTab);
                if (nextTab !== "all") setSelectedCurrency(nextTab);
              }}
              activityItems={data?.activity ?? []}
            />
          </section>

          <section id="wallet-actions" className="space-y-4">
            <StickyMobileCTA
              primary={{ label: "Review activity", href: "#wallet-activity" }}
              secondary={{ label: "Open transfer tools", href: `/wallet/transfer-tools?currency=${selectedCurrency}` }}
            />
            <WalletActionPanel selectedCurrency={selectedCurrency} />
          </section>
        </div>

        <CurrencyExplainerBand />
      </div>
    </AppShell>
  );
}
