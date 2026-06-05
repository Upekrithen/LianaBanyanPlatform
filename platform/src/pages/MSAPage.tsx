/**
 * MSAPage -- Member Savings Accounts (Medical Coordination Tool) / BP073 W8
 * ==========================================================================
 * Route: /initiatives/msa
 *
 * SECURITIES-CLEAN REMINDER:
 *   This is a COORDINATION TOOL -- NOT a financial account, bank, or investment.
 *   "NOT A FINANCIAL ACCOUNT" and "NOT A GUARANTEE" labels are required on
 *   every balance and savings display per platform doctrine.
 *
 * Switzerland Policy: No medical advice. Coordinates payment logistics only.
 * Cost+20% administration fee, fully disclosed.
 *
 * Supabase: msa_accounts (real table)
 */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  PiggyBank, HeartPulse, Users, ShieldCheck, ArrowRight,
  Plus, Activity, Wallet, Receipt, TrendingUp, Landmark,
  Info, AlertTriangle, CheckCircle, BookOpen, CreditCard,
  BarChart3, ShoppingCart, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InitiativeWalkthrough } from "@/components/initiatives/InitiativeWalkthrough";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { getWalkthrough, getCueCard } from "@/data/initiativeWalkthroughs";
import { calculateC20 } from "@/lib/c20Service";
import {
  getMSASavingsIllustrations,
  MSA_DEMO_ACCOUNT,
  MSA_DEMO_TRANSACTIONS,
  MSA_DEMO_GROUP_PURCHASES,
  MSA_DEMO_FAMILY_MEMBERS,
  MSA_DEMO_COMMUNITY_POOL,
} from "@/lib/msa/msaService";
import type { MSAAccount, MSATransaction, GroupPurchaseOpportunity } from "@/lib/msa/msaTypes";
import {
  MSA_DISCLAIMER_ACCOUNT,
  MSA_DISCLAIMER_SAVINGS,
  MSA_DISCLAIMER_SWITZERLAND,
} from "@/lib/msa/msaTypes";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDollars(cents: number): string {
  const abs = Math.abs(cents);
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(abs / 100).toFixed(2)}`;
}

function txnColor(type: MSATransaction["type"]): string {
  if (type === "deposit") return "text-emerald-600";
  if (type === "community_roundup") return "text-purple-600";
  return "text-foreground";
}

function txnIcon(type: MSATransaction["type"]) {
  if (type === "deposit") return <TrendingUp className="w-4 h-4 text-emerald-600" />;
  if (type === "community_roundup") return <ShieldCheck className="w-4 h-4 text-purple-600" />;
  if (type === "family_transfer") return <Users className="w-4 h-4 text-indigo-600" />;
  return <HeartPulse className="w-4 h-4 text-rose-600" />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NotAFinancialBanner() {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
      <div className="text-sm">
        <p className="font-bold text-amber-800 uppercase tracking-wide text-xs mb-1">
          NOT A FINANCIAL ACCOUNT -- Coordination Tool Only
        </p>
        <p className="text-amber-700">
          This MSA is cooperative payment coordination infrastructure, administered at Cost+20%.
          It is not a bank account, not an investment, and provides no guaranteed financial return.
          Savings comparisons are illustrative market references only.{" "}
          <span className="font-semibold">NOT A GUARANTEE.</span>
        </p>
      </div>
    </div>
  );
}

function SwitzerlandPolicyNote() {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-3 mt-2">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>{MSA_DISCLAIMER_SWITZERLAND}</span>
    </div>
  );
}

function SavingsLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col">
      {children}
      <span className="text-xs font-normal text-amber-600 mt-0.5">NOT A GUARANTEE</span>
    </span>
  );
}

interface BalanceCardProps {
  account: MSAAccount;
  isTour: boolean;
}

function BalanceCard({ account, isTour }: BalanceCardProps) {
  const ytdSavingsIllustration = getMSASavingsIllustrations().reduce(
    (sum, s) => sum + s.illustration_delta_cents, 0
  );

  return (
    <Card className="md:col-span-2 border-t-4 border-t-emerald-500 bg-white shadow-md">
      <CardContent className="p-8">
        {/* NOT A FINANCIAL ACCOUNT label on balance */}
        <div className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">
          NOT A FINANCIAL ACCOUNT -- Coordination Balance
        </div>
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Coordination Balance</p>
            <h2 className="text-5xl font-bold text-foreground">
              {formatDollars(account.balance_cents)}
            </h2>
          </div>
          <Badge
            className={
              account.status === "active"
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                : "bg-slate-100 text-muted-foreground hover:bg-slate-100"
            }
          >
            {account.status === "active" ? "Active" : "Pending Deposit"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Monthly Auto-Deposit</p>
            <p className="text-lg font-semibold">{formatDollars(account.monthly_deposit_cents)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">YTD vs Market Reference</p>
            <SavingsLabel>
              <p className={`text-lg font-semibold ${isTour ? "text-emerald-600" : "text-muted-foreground/70"}`}>
                {isTour
                  ? `+${formatDollars(ytdSavingsIllustration)}`
                  : "$0.00"}
              </p>
            </SavingsLabel>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">YTD Contributions</p>
            <p className="text-lg font-semibold">{formatDollars(account.ytd_contributions_cents)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">YTD Health Spending</p>
            <p className="text-lg font-semibold text-rose-600">
              {formatDollars(account.ytd_spending_cents)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Spent vs Contributed (YTD)</span>
            <span>
              {Math.round((account.ytd_spending_cents / account.ytd_contributions_cents) * 100)}% utilized
            </span>
          </div>
          <Progress
            value={Math.round((account.ytd_spending_cents / account.ytd_contributions_cents) * 100)}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionList({ transactions }: { transactions: MSATransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Wallet className="w-8 h-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No recent activity.</p>
        <p className="text-xs mt-1">Fund your MSA to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((txn) => (
        <div key={txn.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
              {txnIcon(txn.type)}
            </div>
            <div>
              <p className="text-sm font-medium">{txn.description}</p>
              <p className="text-xs text-muted-foreground">
                {txn.provider ?? txn.type.replace("_", " ")}
              </p>
            </div>
          </div>
          <span className={`text-sm font-bold ${txnColor(txn.type)}`}>
            {txn.amount_cents > 0 ? "+" : ""}
            {formatDollars(txn.amount_cents)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface GroupPurchaseCardProps {
  opportunity: GroupPurchaseOpportunity;
}

function GroupPurchaseCard({ opportunity }: GroupPurchaseCardProps) {
  const progress = Math.round(
    (opportunity.enrolled_count / opportunity.minimum_group_size) * 100
  );
  const c20Breakdown = calculateC20(opportunity.c20_price_cents / 100);
  const daysLeft = Math.ceil(
    (new Date(opportunity.closes_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="border-l-4 border-l-emerald-400">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{opportunity.service_name}</CardTitle>
            <CardDescription className="mt-1">{opportunity.description}</CardDescription>
          </div>
          <Badge
            className={
              opportunity.status === "active"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }
          >
            {opportunity.status === "forming" ? "Forming Group" : "Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">C+20% Price</p>
            <p className="font-bold text-emerald-700">
              {formatDollars(opportunity.c20_price_cents)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">
              Market Ref <span className="text-amber-600 font-semibold">(NOT A GUARANTEE)</span>
            </p>
            <p className="font-medium line-through text-muted-foreground">
              {formatDollars(opportunity.retail_reference_cents)}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Group forming: {opportunity.enrolled_count} / {opportunity.minimum_group_size} members</span>
            <span>{daysLeft}d left</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
          C+20% breakdown: base cost + 20% admin fee. Creator share: 83.3% of margin.
        </div>
      </CardContent>
      <CardFooter>
        <Button
          size="sm"
          variant="outline"
          className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          disabled={opportunity.status === "closed"}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {opportunity.status === "forming" ? "Join Group" : "Enroll"}
          {/* TODO: wire to group_purchase_opportunities enrollment mutation */}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MSAPage() {
  usePageSEO({
    title: "Mutual Service Agreement | Liana Banyan",
    description: "The Liana Banyan Mutual Service Agreement. Cooperative member obligations and platform service terms in plain language.",
    canonical: "https://lianabanyan.com/msa",
  });
  const navigate = useNavigate();
  const [isWildFireTour, setIsWildFireTour] = useState(false);
  const [roundupEnabled, setRoundupEnabled] = useState(false);

  // Live: load from msa_accounts table.
  const { data: liveAccount } = useQuery({
    queryKey: ["msa_accounts", "mine"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("msa_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !isWildFireTour,
  });

  const account: MSAAccount | null = isWildFireTour ? MSA_DEMO_ACCOUNT : (liveAccount as MSAAccount | null);
  const transactions = isWildFireTour ? MSA_DEMO_TRANSACTIONS : [];
  const familyMembers = isWildFireTour ? MSA_DEMO_FAMILY_MEMBERS : [];
  const groupPurchases = isWildFireTour ? MSA_DEMO_GROUP_PURCHASES : [];
  const communityPool = isWildFireTour ? MSA_DEMO_COMMUNITY_POOL : null;
  const savingsIllustrations = getMSASavingsIllustrations();

  const walkthrough = getWalkthrough("msa");
  const cueCard = getCueCard("msa");

  return (
    <LaunchConditionOverlay initiativeSlug="msa" initiativeName="MSA (Medical Savings Accounts)">
      <PortalPageLayout maxWidth="xl" xrayId="msa-page">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <Badge variant="outline" className="mb-4 text-emerald-600 border-emerald-600 bg-emerald-50">
              Initiative #13
            </Badge>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Landmark className="h-10 w-10 text-emerald-600" />
              Medical Savings Accounts (MSA)
            </h1>
            <p className="mt-2 text-xl text-muted-foreground max-w-2xl">
              Cooperative payment coordination for your health. Pre-fund care, share with family,
              and access group purchasing through the Health Accords network.
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-muted-foreground">WildFire Tour Mode:</span>
              <button
                onClick={() => setIsWildFireTour(!isWildFireTour)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isWildFireTour ? "bg-orange-500" : "bg-muted"}`}
                aria-label="Toggle WildFire tour mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isWildFireTour ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
            {account && (
              <div className="flex gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add Funds
                  {/* TODO: wire to MSA deposit flow */}
                </Button>
                <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <Receipt className="w-4 h-4 mr-2" /> Pay Provider
                  {/* TODO: wire to MSA payment flow */}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Top-level disclaimer -- always visible */}
        <NotAFinancialBanner />

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8 h-auto p-1 bg-muted/50">
            <TabsTrigger value="dashboard" className="py-3 text-base data-[state=active]:bg-background">
              <Wallet className="w-4 h-4 mr-2" /> My MSA
            </TabsTrigger>
            <TabsTrigger value="group-purchasing" className="py-3 text-base data-[state=active]:bg-background">
              <ShoppingCart className="w-4 h-4 mr-2" /> Group Buying
            </TabsTrigger>
            <TabsTrigger value="family" className="py-3 text-base data-[state=active]:bg-background">
              <Users className="w-4 h-4 mr-2" /> Family Pool
            </TabsTrigger>
            <TabsTrigger value="accords" className="py-3 text-base data-[state=active]:bg-background">
              <HeartPulse className="w-4 h-4 mr-2" /> Health Accords
            </TabsTrigger>
            <TabsTrigger value="community" className="py-3 text-base data-[state=active]:bg-background">
              <ShieldCheck className="w-4 h-4 mr-2" /> Community Fund
            </TabsTrigger>
            {walkthrough && (
              <TabsTrigger value="walkthrough" className="py-3 text-base data-[state=active]:bg-background">
                <BookOpen className="w-4 h-4 mr-2" /> How It Works
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── My MSA Tab ─────────────────────────────────────────────────────── */}
          <TabsContent value="dashboard" className="space-y-6">
            {!account ? (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-8 text-center">
                  <Landmark className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Open Your MSA Coordination Account
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-2">
                    Set aside funds for health expenses -- cooperatively administered at Cost+20%.
                    Your contributions are yours; they never expire and never revert to an employer.
                  </p>
                  <p className="text-xs text-amber-700 font-semibold mb-4">
                    NOT A FINANCIAL ACCOUNT -- NOT A GUARANTEE. Coordination tool only.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Open Account
                      {/* TODO: wire to MSA account creation flow */}
                    </Button>
                    <Button variant="outline" onClick={() => setIsWildFireTour(true)}>
                      Preview with Demo Data
                    </Button>
                  </div>
                  <SwitzerlandPolicyNote />
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BalanceCard account={account} isTour={isWildFireTour} />

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TransactionList transactions={transactions} />
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="ghost"
                      className="w-full text-sm text-muted-foreground"
                      disabled={transactions.length === 0}
                    >
                      View All Transactions
                      {/* TODO: wire to full transaction history page */}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* Savings Illustrations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Illustrative C+20% vs Market Reference
                </CardTitle>
                <CardDescription>
                  Comparing Cost+20% cooperative pricing to general public market references.{" "}
                  <span className="font-semibold text-amber-600">NOT A GUARANTEE</span> of individual savings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savingsIllustrations.map((s) => (
                    <div
                      key={s.service_name}
                      className="p-4 bg-muted/30 rounded-lg border flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{s.service_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground line-through">
                            {formatDollars(s.market_reference_cents)} market ref
                          </span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-bold text-emerald-700">
                            {formatDollars(s.c20_price_cents)} C+20%
                          </span>
                        </div>
                      </div>
                      <SavingsLabel>
                        <span className="text-lg font-bold text-emerald-600">
                          {formatDollars(s.illustration_delta_cents)}
                        </span>
                      </SavingsLabel>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                  <span className="font-bold">NOT A GUARANTEE:</span> {MSA_DISCLAIMER_SAVINGS}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Group Purchasing Tab ────────────────────────────────────────────── */}
          <TabsContent value="group-purchasing" className="space-y-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg shrink-0">
                <ShoppingCart className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Group Health Purchasing</h2>
                <p className="text-muted-foreground mt-1">
                  When members coordinate together, direct-pay providers offer Cost+20% pricing.
                  Join an open group to lock in coordinated rates for upcoming health services.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 mb-4">
              <span className="font-bold">NOT A GUARANTEE:</span> Market reference figures use publicly
              available data. Individual prices vary by provider and location. C+20% pricing is
              available only through verified Health Accords network providers.
            </div>

            {groupPurchases.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No open group purchasing opportunities right now.</p>
                  <p className="text-xs mt-1">Enable WildFire Tour to preview examples.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupPurchases.map((gpo) => (
                  <GroupPurchaseCard key={gpo.id} opportunity={gpo} />
                ))}
              </div>
            )}

            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  How Group Purchasing Works
                </h3>
                <ol className="text-sm text-emerald-800 space-y-2 list-decimal list-inside">
                  <li>Health Accords coordinators identify eligible services and direct-pay providers.</li>
                  <li>A group opportunity opens -- minimum enrollment required to activate.</li>
                  <li>Members enroll and coordinate payment through their MSA.</li>
                  <li>Provider delivers service at Cost+20% to all enrolled members.</li>
                  <li>No claims, no middlemen, no PBM markup.</li>
                </ol>
                <SwitzerlandPolicyNote />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Family Pool Tab ─────────────────────────────────────────────────── */}
          <TabsContent value="family" className="space-y-6">
            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-500" />
                  Family Pool
                </CardTitle>
                <CardDescription>
                  Share MSA coordination with members of your Family Table. Authorized members can
                  coordinate payments from this account up to their access limit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Authorized Members</h3>
                    {familyMembers.length === 0 ? (
                      <div className="p-6 bg-muted/50 rounded-lg border text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No family members added.</p>
                        <Button variant="link" className="text-indigo-600 mt-2 h-auto p-0">
                          Invite Members
                          {/* TODO: wire to family_table invite flow */}
                        </Button>
                      </div>
                    ) : (
                      familyMembers.map((member) => (
                        <div
                          key={member.id}
                          className="p-3 bg-muted/50 rounded-lg border flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                              {member.display_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{member.display_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {member.access_level === "admin" ? "Full Access" : "Limited Access"}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-white text-xs">
                            {member.access_level === "admin"
                              ? "Admin"
                              : `Up to ${formatDollars(member.monthly_limit_cents ?? 0)}/mo`}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col justify-center">
                    <PiggyBank className="w-12 h-12 text-indigo-400 mb-4" />
                    <h3 className="font-bold text-indigo-900 mb-2">Why Pool Coordination?</h3>
                    <p className="text-sm text-indigo-800 mb-4">
                      Instead of individual HSA/FSA deductibles that reset annually, the Family Pool
                      treats your household as a single coordination unit. Funds never expire, and
                      any authorized family member can coordinate payments instantly.
                    </p>
                    <div className="text-xs text-indigo-700 font-semibold mb-3">
                      NOT A FINANCIAL ACCOUNT -- Coordination tracking only.
                    </div>
                    <Button
                      variant="outline"
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                      onClick={() => navigate("/initiatives/family-table")}
                    >
                      Manage Family Table
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Health Accords Tab ──────────────────────────────────────────────── */}
          <TabsContent value="accords" className="space-y-6">
            <Card className="border-l-4 border-l-rose-500">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <HeartPulse className="h-6 w-6 text-rose-500" />
                  Health Accords Integration
                </CardTitle>
                <CardDescription>
                  Your MSA coordinates directly with the Tatiana Schlossburg Health Accords for
                  seamless payment at Cost+20%.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Prescriptions",
                      desc: "Generic and brand medications at C+20% through LifeLine Medications network. No PBM markup.",
                      icon: <CreditCard className="w-8 h-8 text-rose-400" />,
                    },
                    {
                      title: "Supplies & Equipment",
                      desc: "Medical supplies, glucose monitors, blood pressure cuffs, and approved devices.",
                      icon: <ShoppingCart className="w-8 h-8 text-rose-400" />,
                    },
                    {
                      title: "Direct-Pay Visits",
                      desc: "Coordinate payments with Health Accords-verified direct-pay providers. No insurance claims.",
                      icon: <HeartPulse className="w-8 h-8 text-rose-400" />,
                    },
                  ].map(({ title, desc, icon }) => (
                    <div key={title} className="bg-rose-50 rounded-lg p-4 border border-rose-100">
                      <div className="mb-3">{icon}</div>
                      <h4 className="font-bold text-rose-900 mb-1">{title}</h4>
                      <p className="text-sm text-rose-800">{desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-slate-50 rounded-lg border flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Zero-Friction Payment Routing</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      When you purchase through the Health Accords network, the system routes
                      payment from your MSA automatically. No claims, no reimbursements, no PBMs.
                    </p>
                    <SwitzerlandPolicyNote />
                  </div>
                  <Button
                    className="bg-rose-600 hover:bg-rose-700 text-white shrink-0"
                    onClick={() => navigate("/initiatives/tatiana-schlossburg-health-accords")}
                  >
                    Go to Health Accords
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Community Fund Tab ──────────────────────────────────────────────── */}
          <TabsContent value="community">
            <Card className="bg-slate-900 text-white border-none">
              <CardContent className="p-12">
                <div className="text-center mb-8">
                  <ShieldCheck className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4">The Boaz Principle in Action</h2>
                  <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                    A portion of every MSA contribution funds a community emergency pool managed by
                    Rally Group. When a neighbor faces a sudden medical crisis, they can access
                    the pool with a simple request and Marks verification.
                  </p>
                  <div className="mt-4 text-xs text-amber-400 font-semibold">
                    NOT A GUARANTEE -- Community pool access is subject to availability and
                    cooperative approval. This is not an insurance product.
                  </div>
                </div>

                {communityPool && (
                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-400">
                        {formatDollars(communityPool.total_cents)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Pool Coordination Total</p>
                      <p className="text-xs text-amber-400 mt-0.5">NOT A GUARANTEE</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-white">{communityPool.contributors_count}</p>
                      <p className="text-xs text-slate-400 mt-1">Contributing Members</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-400">
                        {formatDollars(communityPool.disbursements_ytd_cents)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Disbursed YTD</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    size="lg"
                    className={`border-none ${roundupEnabled ? "bg-purple-600 hover:bg-purple-700" : "bg-emerald-500 hover:bg-emerald-600"} text-white`}
                    onClick={() => setRoundupEnabled(!roundupEnabled)}
                  >
                    {roundupEnabled ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" /> Round-Ups Enabled
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" /> Enable Round-Ups
                      </>
                    )}
                    {/* TODO: wire to setRoundupEnabled() service call */}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-slate-700 hover:bg-slate-800"
                    onClick={() => navigate("/initiatives/rally-group")}
                  >
                    View Rally Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Walkthrough + Cue Card ─────────────────────────────────────────── */}
          {walkthrough && (
            <TabsContent value="walkthrough" className="space-y-8">
              {cueCard && (
                <div className="max-w-md">
                  <h3 className="text-lg font-semibold mb-3">MSA Cue Card</h3>
                  <InitiativeCueCard card={cueCard} />
                </div>
              )}
              <div>
                <InitiativeWalkthrough
                  steps={walkthrough.steps}
                  initiativeName="Medical Savings Accounts (MSA)"
                />
              </div>
              {walkthrough.originAnecdote && (
                <Card className="border-l-4 border-l-emerald-300 bg-muted/30">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Origin Story
                    </p>
                    <p className="text-foreground italic leading-relaxed">
                      "{walkthrough.originAnecdote}"
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
