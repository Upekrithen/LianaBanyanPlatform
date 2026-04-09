import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  CreditCard,
  Building2,
  Zap,
  Clock,
  ExternalLink,
  RefreshCw,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ConnectAccountRow = {
  id: string;
  user_id: string;
  stripe_account_id: string;
  onboarding_status: string;
  payouts_enabled: boolean;
  charges_enabled: boolean;
  default_payout_speed: string;
  created_at: string;
};

type PayoutRow = {
  id: string;
  amount_cents: number;
  fee_cents: number;
  net_amount_cents: number;
  payout_speed: string;
  status: string;
  failure_reason: string | null;
  created_at: string;
  completed_at: string | null;
};

type CardholderRow = {
  id: string;
  card_balance_cents: number;
  payout_preference: string | null;
};

type CreditWalletRow = {
  balance: number;
  lifetime_earned: number;
};

type FeatureFlagRow = {
  feature_key: string;
  is_enabled: boolean | null;
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (s === "processing" || s === "pending") return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300";
  if (s === "failed" || s === "canceled") return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400";
  return "border-muted-foreground/30 bg-muted/40 text-muted-foreground";
}

export default function PayoutsPage() {
  const queryClient = useQueryClient();
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [cashOutAmount, setCashOutAmount] = useState("");
  const [cashOutSpeed, setCashOutSpeed] = useState<"standard" | "instant">("standard");

  const { data: flags } = useQuery({
    queryKey: ["payouts-feature-flags"],
    queryFn: async () => {
      const { data } = await supabase
        .from("founder_feature_flags" as never)
        .select("*")
        .in("feature_key", ["connect_payouts_enabled"]);
      return (data || []) as FeatureFlagRow[];
    },
  });

  const connectEnabled = flags?.find((f) => f.feature_key === "connect_payouts_enabled")?.is_enabled ?? false;

  const { data: authUser } = useQuery({
    queryKey: ["payouts-auth-user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  });

  const { data: connectAcct, isLoading: connectLoading } = useQuery({
    queryKey: ["connect-account", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;
      const { data, error } = await supabase
        .from("member_connect_accounts" as any)
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data as ConnectAccountRow | null;
    },
    enabled: !!authUser?.id,
  });

  const { data: cardholder, isLoading: cardholderLoading } = useQuery({
    queryKey: ["payouts-cardholder", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;
      const { data, error } = await supabase
        .from("lb_cardholders" as any)
        .select("id, card_balance_cents, payout_preference")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data as CardholderRow | null;
    },
    enabled: !!authUser?.id,
  });

  const { data: creditWallet } = useQuery({
    queryKey: ["payouts-credit-wallet", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return null;
      const { data, error } = await supabase
        .from("credit_wallets" as any)
        .select("balance, lifetime_earned")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;
      return data as CreditWalletRow | null;
    },
    enabled: !!authUser?.id,
  });

  const { data: payouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ["member-payouts", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return [] as PayoutRow[];
      const { data, error } = await supabase
        .from("member_payouts" as any)
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as PayoutRow[];
    },
    enabled: !!authUser?.id,
  });

  const cardBalanceCents = cardholder?.card_balance_cents ?? 0;
  const earnedCredits = creditWallet?.lifetime_earned ?? 0;
  const earnedCents = Math.round(earnedCredits * 100); // 1 credit = $1
  const totalAvailableCents = cardBalanceCents + earnedCents;
  const currentPref = cardholder?.payout_preference ?? "connect_standard";
  const connectReady = connectAcct?.onboarding_status === "complete" && connectAcct?.payouts_enabled;
  const connectPending = connectAcct && connectAcct.onboarding_status !== "complete";

  async function invalidateAll() {
    await queryClient.invalidateQueries({ queryKey: ["connect-account"] });
    await queryClient.invalidateQueries({ queryKey: ["payouts-cardholder"] });
    await queryClient.invalidateQueries({ queryKey: ["payouts-credit-wallet"] });
    await queryClient.invalidateQueries({ queryKey: ["member-payouts"] });
  }

  async function handleStartOnboarding() {
    setPageError(null);
    setSuccessMsg(null);
    setActionBusy("onboarding");
    try {
      const { data, error } = await supabase.functions.invoke("create-connect-account", { body: {} });
      if (error) throw error;
      const body = data as { error?: string; onboarding_url?: string };
      if (body?.error) throw new Error(body.error);
      if (body.onboarding_url) {
        window.open(body.onboarding_url, "_blank");
        setSuccessMsg("Onboarding opened in a new tab. Complete the setup and return here.");
      }
      await invalidateAll();
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Could not start onboarding");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleRefreshOnboarding() {
    setPageError(null);
    setSuccessMsg(null);
    setActionBusy("refresh");
    try {
      const { data, error } = await supabase.functions.invoke("connect-onboarding-refresh", { body: {} });
      if (error) throw error;
      const body = data as { error?: string; onboarding_url?: string };
      if (body?.error) throw new Error(body.error);
      if (body.onboarding_url) {
        window.open(body.onboarding_url, "_blank");
        setSuccessMsg("Fresh onboarding link opened. Complete the setup and return here.");
      }
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Could not refresh onboarding link");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleUpdatePreference(pref: string) {
    if (!cardholder?.id || !authUser?.id) return;
    setPageError(null);
    try {
      const { error } = await supabase
        .from("lb_cardholders" as any)
        .update({ payout_preference: pref })
        .eq("user_id", authUser.id);
      if (error) throw error;
      await invalidateAll();
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Could not update preference");
    }
  }

  async function handleCashOut() {
    setPageError(null);
    setSuccessMsg(null);
    const dollars = parseFloat(cashOutAmount);
    if (Number.isNaN(dollars) || dollars < 1) {
      setPageError("Minimum payout is $1.00");
      return;
    }
    const amountCents = Math.round(dollars * 100);
    if (amountCents > totalAvailableCents) {
      setPageError("Insufficient balance");
      return;
    }

    setActionBusy("cashout");
    try {
      // Route: earned credits first (via stripe-connect-payout),
      // then LB Card balance (via request-payout) for any remainder
      let remaining = amountCents;
      const results: string[] = [];

      // Draw from earned credits first
      if (remaining > 0 && earnedCents > 0) {
        const fromEarned = Math.min(remaining, earnedCents);
        const earnedCredits = fromEarned / 100; // cents -> credits (1:1)
        const { data, error } = await supabase.functions.invoke("stripe-connect-payout", {
          body: { amount: earnedCredits },
        });
        if (error) throw error;
        const body = data as { error?: string; success?: boolean };
        if (body?.error) throw new Error(body.error);
        remaining -= fromEarned;
        results.push(`$${(fromEarned / 100).toFixed(2)} from earned credits`);
      }

      // Draw from LB Card balance for any remainder
      if (remaining > 0 && cardBalanceCents > 0) {
        const fromCard = Math.min(remaining, cardBalanceCents);
        const { data, error } = await supabase.functions.invoke("request-payout", {
          body: { amount_cents: fromCard, payout_speed: cashOutSpeed },
        });
        if (error) throw error;
        const body = data as { error?: string; success?: boolean };
        if (body?.error) throw new Error(body.error);
        remaining -= fromCard;
        results.push(`$${(fromCard / 100).toFixed(2)} from LB Card`);
      }

      setCashOutAmount("");
      setSuccessMsg(
        cashOutSpeed === "instant"
          ? `Payout initiated (${results.join(" + ")}) — funds arrive in minutes.`
          : `Payout initiated (${results.join(" + ")}) — funds arrive in 1-2 business days.`
      );
      await invalidateAll();
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Payout failed");
    } finally {
      setActionBusy(null);
    }
  }

  const cashOutDollars = parseFloat(cashOutAmount) || 0;
  const feeCents = cashOutSpeed === "instant" ? Math.ceil(cashOutDollars * 100 * 100 / 10000) : 0;
  const netCents = Math.round(cashOutDollars * 100) - feeCents;

  if (!connectEnabled) {
    return (
      <PortalPageLayout
        title="Payouts"
        subtitle="Cash out earnings to your bank account or debit card"
        maxWidth="xl"
        xrayId="payouts-page"
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative mx-auto mb-8 max-w-lg rounded-2xl p-[1px] shadow-2xl bg-gradient-to-br from-emerald-500/50 via-slate-800/80 to-slate-900">
            <div className="rounded-2xl bg-slate-900 px-8 py-10 text-emerald-400">
              <Banknote className="mx-auto mt-2 h-16 w-16 opacity-60" />
              <h2 className="mt-4 text-2xl font-bold text-white">Payouts</h2>
              <p className="mt-3 max-w-sm text-sm text-slate-300">
                Cash out your cooperative earnings directly to your bank account or debit card.
                Standard payouts are free. Instant payouts arrive in minutes.
              </p>
              <p className="mt-4 text-sm text-emerald-400/80">
                Connect your Stripe account to begin receiving payouts.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            <Shield className="mr-2 h-4 w-4" /> Powered by Stripe Connect
          </Badge>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout
      title="Payouts"
      subtitle="Cash out earnings to your bank account or debit card"
      maxWidth="xl"
      xrayId="payouts-page"
    >
      <div className="space-y-8 pb-12">
        {pageError && (
          <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mr-2 inline h-4 w-4" />
            {pageError}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            {successMsg}
          </div>
        )}

        {/* Payout Preference Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Banknote className="h-5 w-5" />
              How do you want to get paid?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectLoading || cardholderLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Bank/Card option */}
                  <button
                    type="button"
                    onClick={() => connectReady && handleUpdatePreference("connect_standard")}
                    className={cn(
                      "relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all",
                      connectReady && (currentPref === "connect_standard" || currentPref === "connect_instant")
                        ? "border-emerald-500 bg-emerald-500/5 shadow-md"
                        : "border-muted hover:border-muted-foreground/40",
                      !connectReady && "opacity-60 cursor-default",
                    )}
                  >
                    <Building2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm font-semibold">My Bank / Card</p>
                      <p className="text-xs text-muted-foreground">Direct deposit via Stripe Connect</p>
                    </div>
                    {connectReady && (
                      <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px]">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Connected
                      </Badge>
                    )}
                    {connectPending && (
                      <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 text-[10px]">
                        <Clock className="mr-1 h-3 w-3" /> Setup incomplete
                      </Badge>
                    )}
                    {!connectAcct && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Not set up
                      </Badge>
                    )}
                  </button>

                  {/* LB Card option */}
                  <button
                    type="button"
                    onClick={() => handleUpdatePreference("lb_card")}
                    className={cn(
                      "relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all",
                      currentPref === "lb_card"
                        ? "border-[#D4A843] bg-[#D4A843]/5 shadow-md"
                        : "border-muted hover:border-muted-foreground/40",
                    )}
                  >
                    <CreditCard className="h-10 w-10 text-[#D4A843]" />
                    <div>
                      <p className="text-sm font-semibold">LB Card</p>
                      <p className="text-xs text-muted-foreground">Branded cooperative debit card</p>
                    </div>
                    <Badge variant="outline" className="border-[#D4A843]/40 bg-[#D4A843]/10 text-[#D4A843] text-[10px]">
                      Always available
                    </Badge>
                  </button>
                </div>

                {/* Onboarding actions */}
                {!connectAcct && (
                  <Button onClick={handleStartOnboarding} disabled={actionBusy === "onboarding"} className="w-full sm:w-auto">
                    {actionBusy === "onboarding" ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up…</>
                    ) : (
                      <><ExternalLink className="mr-2 h-4 w-4" /> Set up direct deposit</>
                    )}
                  </Button>
                )}
                {connectPending && (
                  <Button variant="outline" onClick={handleRefreshOnboarding} disabled={actionBusy === "refresh"}>
                    {actionBusy === "refresh" ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</>
                    ) : (
                      <><RefreshCw className="mr-2 h-4 w-4" /> Complete your setup</>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cash Out Section */}
        {connectReady && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ArrowDownRight className="h-5 w-5" />
                Cash Out to Your Bank / Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Balance breakdown */}
              <div className="space-y-2">
                {earnedCents > 0 && (
                  <div className="flex items-center justify-between rounded-lg border bg-emerald-500/5 px-4 py-3">
                    <span className="text-sm font-medium text-muted-foreground">Earned Credits</span>
                    <span className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{formatUsd(earnedCents)}</span>
                  </div>
                )}
                {cardBalanceCents > 0 && (
                  <div className="flex items-center justify-between rounded-lg border bg-[#D4A843]/5 px-4 py-3">
                    <span className="text-sm font-medium text-muted-foreground">LB Card Balance</span>
                    <span className="text-xl font-bold tabular-nums text-[#D4A843]">{formatUsd(cardBalanceCents)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                  <span className="text-sm font-medium text-muted-foreground">Total Available</span>
                  <span className="text-2xl font-bold tabular-nums">{formatUsd(totalAvailableCents)}</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cashout-amount">Amount ($)</Label>
                  <Input
                    id="cashout-amount"
                    inputMode="decimal"
                    placeholder="50.00"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Speed</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCashOutSpeed("standard")}
                      className={cn(
                        "flex-1 rounded-lg border-2 px-3 py-2.5 text-center text-sm transition-all",
                        cashOutSpeed === "standard"
                          ? "border-primary bg-primary/5 font-semibold"
                          : "border-muted hover:border-muted-foreground/40",
                      )}
                    >
                      <Clock className="mx-auto mb-1 h-4 w-4" />
                      Standard
                      <span className="block text-[10px] text-muted-foreground">Free · 1-2 days</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashOutSpeed("instant")}
                      className={cn(
                        "flex-1 rounded-lg border-2 px-3 py-2.5 text-center text-sm transition-all",
                        cashOutSpeed === "instant"
                          ? "border-primary bg-primary/5 font-semibold"
                          : "border-muted hover:border-muted-foreground/40",
                      )}
                    >
                      <Zap className="mx-auto mb-1 h-4 w-4" />
                      Instant
                      <span className="block text-[10px] text-muted-foreground">1% fee · Minutes</span>
                    </button>
                  </div>
                </div>
              </div>

              {cashOutDollars >= 1 && (
                <div className="rounded-lg border bg-muted/20 px-4 py-3 text-sm">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className="tabular-nums">{formatUsd(Math.round(cashOutDollars * 100))}</span>
                  </div>
                  {feeCents > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Instant fee (1%)</span>
                      <span className="tabular-nums">−{formatUsd(feeCents)}</span>
                    </div>
                  )}
                  <div className="mt-1 flex justify-between border-t pt-1 font-semibold">
                    <span>You receive</span>
                    <span className="tabular-nums">{formatUsd(netCents > 0 ? netCents : 0)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCashOut}
                disabled={actionBusy === "cashout" || cashOutDollars < 1}
                className="w-full"
              >
                {actionBusy === "cashout" ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                ) : (
                  `Cash out ${cashOutDollars >= 1 ? formatUsd(Math.round(cashOutDollars * 100)) : ""}`
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Banknote className="h-5 w-5" />
              Payout History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payoutsLoading ? (
              <p className="text-sm text-muted-foreground">Loading payouts…</p>
            ) : !payouts?.length ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                <Banknote className="mx-auto mb-3 h-10 w-10 opacity-40" />
                No payouts yet. Cash out your earnings to see history here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[580px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Fee</th>
                      <th className="py-2 pr-4">Speed</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 font-semibold tabular-nums">
                          {formatUsd(p.net_amount_cents)}
                        </td>
                        <td className="py-3 pr-4 tabular-nums text-muted-foreground">
                          {p.fee_cents > 0 ? formatUsd(p.fee_cents) : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center gap-1 text-xs capitalize">
                            {p.payout_speed === "instant" ? (
                              <Zap className="h-3 w-3 text-amber-500" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {p.payout_speed}
                          </span>
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className={cn("capitalize", statusBadgeClass(p.status))}
                            title={p.failure_reason || undefined}
                          >
                            {p.status}
                          </Badge>
                          {p.failure_reason && (
                            <p className="mt-0.5 text-[10px] text-red-500 max-w-[200px] truncate" title={p.failure_reason}>
                              {p.failure_reason}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
