import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  History,
  Settings,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LbCardholderRow = {
  id: string;
  user_id: string;
  stripe_cardholder_id: string | null;
  status: string;
  card_balance_cents: number;
  spending_limit_daily: number | null;
  spending_limit_monthly: number | null;
  created_at: string;
};

type LbCardRow = {
  id: string;
  cardholder_id: string;
  stripe_card_id: string | null;
  card_type: string;
  status: string;
  last_four: string | null;
  exp_month: number | null;
  exp_year: number | null;
  created_at: string;
};

type LbTxnRow = {
  id: string;
  card_id: string;
  amount_cents: number;
  merchant_name: string | null;
  status: string;
  created_at: string;
};

type LbFundingRow = {
  id: string;
  cardholder_id: string;
  amount_cents: number;
  funding_type: string;
  source_description: string | null;
  created_at: string;
};

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "approved" || s === "completed" || s === "active") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }
  if (s === "pending") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300";
  }
  if (s === "declined" || s === "failed" || s === "canceled") {
    return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400";
  }
  return "border-muted-foreground/30 bg-muted/40 text-muted-foreground";
}

type FeatureFlagRow = {
  feature_key: string;
  is_enabled: boolean | null;
  notes: string | null;
};

export default function LBCardPage() {
  const queryClient = useQueryClient();
  const [pageError, setPageError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [revealedPan, setRevealedPan] = useState<string | null>(null);
  const [revealedCvc, setRevealedCvc] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const [holderForm, setHolderForm] = useState({
    first_name: "",
    last_name: "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  const [limitDaily, setLimitDaily] = useState("");
  const [limitMonthly, setLimitMonthly] = useState("");

  const { data: flags } = useQuery({
    queryKey: ["lb-card-feature-flags"],
    queryFn: async () => {
      const { data } = await supabase
        .from("founder_feature_flags" as never)
        .select("*")
        .in("feature_key", ["lb_card_enabled", "lb_card_provider"]);
      return (data || []) as FeatureFlagRow[];
    },
  });

  const cardEnabled = flags?.find((f) => f.feature_key === "lb_card_enabled")?.is_enabled ?? false;
  const providerFlag = flags?.find((f) => f.feature_key === "lb_card_provider");
  const provider = providerFlag?.notes ?? "stripe";

  const { data: authUser } = useQuery({
    queryKey: ["lb-card-auth-user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  });

  const displayName = useMemo(() => {
    const meta = authUser?.user_metadata as Record<string, string> | undefined;
    const full =
      meta?.full_name ||
      [meta?.first_name, meta?.last_name].filter(Boolean).join(" ").trim();
    if (full) return full.toUpperCase();
    const email = authUser?.email;
    if (email) return email.split("@")[0].toUpperCase();
    return "MEMBER";
  }, [authUser]);

  const {
    data: cardholder,
    isLoading: cardholderLoading,
    error: cardholderError,
    isFetching: cardholderFetching,
  } = useQuery({
    queryKey: ["lb-cardholder"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lb_cardholders" as any)
        .select("*")
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as LbCardholderRow | null;
    },
  });

  const {
    data: cards,
    isLoading: cardsLoading,
  } = useQuery({
    queryKey: ["lb-cards", cardholder?.id],
    queryFn: async () => {
      if (!cardholder?.id) return [] as LbCardRow[];
      const { data, error } = await supabase
        .from("lb_cards" as any)
        .select("*")
        .eq("cardholder_id", cardholder.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as LbCardRow[];
    },
    enabled: !!cardholder?.id,
  });

  const primaryCard = cards?.[0] ?? null;
  const cardIds = useMemo(() => (cards ?? []).map((c) => c.id), [cards]);

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: ["lb-card-transactions", cardIds.join(",")],
    queryFn: async () => {
      if (cardIds.length === 0) return [] as LbTxnRow[];
      const { data, error } = await supabase
        .from("lb_card_transactions" as any)
        .select("*")
        .in("card_id", cardIds)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as LbTxnRow[];
    },
    enabled: cardIds.length > 0,
  });

  const { data: fundingRows, isLoading: fundingLoading } = useQuery({
    queryKey: ["lb-card-funding", cardholder?.id],
    queryFn: async () => {
      if (!cardholder?.id) return [] as LbFundingRow[];
      const { data, error } = await supabase
        .from("lb_card_funding" as any)
        .select("*")
        .eq("cardholder_id", cardholder.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as LbFundingRow[];
    },
    enabled: !!cardholder?.id,
  });

  useEffect(() => {
    if (!cardholder) return;
    if (cardholder.spending_limit_daily != null) {
      setLimitDaily(String(cardholder.spending_limit_daily / 100));
    }
    if (cardholder.spending_limit_monthly != null) {
      setLimitMonthly(String(cardholder.spending_limit_monthly / 100));
    }
  }, [cardholder?.id, cardholder?.spending_limit_daily, cardholder?.spending_limit_monthly]);

  const balanceCents = cardholder?.card_balance_cents ?? 0;
  const hasCardholder = !!cardholder;
  const hasCard = !!primaryCard;

  async function invalidateCardData() {
    await queryClient.invalidateQueries({ queryKey: ["lb-cardholder"] });
    await queryClient.invalidateQueries({ queryKey: ["lb-cards"] });
    await queryClient.invalidateQueries({ queryKey: ["lb-card-transactions"] });
    await queryClient.invalidateQueries({ queryKey: ["lb-card-funding"] });
  }

  async function handleCreateCardholder(e: React.FormEvent) {
    e.preventDefault();
    setPageError(null);
    setActionBusy("create-holder");
    try {
      const { data, error } = await supabase.functions.invoke("create-lb-cardholder", {
        body: {
          name: {
            first_name: holderForm.first_name.trim(),
            last_name: holderForm.last_name.trim(),
          },
          billing: {
            line1: holderForm.line1.trim(),
            city: holderForm.city.trim(),
            state: holderForm.state.trim() || undefined,
            postal_code: holderForm.postal_code.trim(),
            country: holderForm.country.trim() || "US",
          },
        },
      });
      if (error) throw error;
      const body = data as { error?: string; cardholder?: LbCardholderRow };
      if (body?.error) throw new Error(body.error);
      await invalidateCardData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create cardholder";
      setPageError(msg);
    } finally {
      setActionBusy(null);
    }
  }

  async function handleIssueCard() {
    setPageError(null);
    setActionBusy("issue-card");
    try {
      const { data, error } = await supabase.functions.invoke("create-lb-card", { body: {} });
      if (error) throw error;
      const body = data as { error?: string; card?: LbCardRow };
      if (body?.error) throw new Error(body.error);
      await invalidateCardData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not issue card";
      setPageError(msg);
    } finally {
      setActionBusy(null);
    }
  }

  async function handleRevealToggle() {
    if (!primaryCard) return;
    if (revealOpen) {
      setRevealOpen(false);
      setRevealedPan(null);
      setRevealedCvc(null);
      return;
    }
    setPageError(null);
    setActionBusy("reveal");
    try {
      const { data, error } = await supabase.functions.invoke("get-lb-card-details", {
        body: { card_id: primaryCard.id },
      });
      if (error) throw error;
      const body = data as {
        error?: string;
        number?: string;
        cvc?: string;
      };
      if (body?.error) throw new Error(body.error);
      setRevealedPan(body.number ?? null);
      setRevealedCvc(body.cvc ?? null);
      setRevealOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not load card details";
      setPageError(msg);
    } finally {
      setActionBusy(null);
    }
  }

  async function handleFreezeToggle() {
    if (!primaryCard) return;
    const isFrozen = primaryCard.status === "frozen";
    setPageError(null);
    setActionBusy("freeze");
    try {
      const { data, error } = await supabase.functions.invoke("update-lb-card-controls", {
        body: {
          card_id: primaryCard.id,
          action: isFrozen ? "unfreeze" : "freeze",
        },
      });
      if (error) throw error;
      const body = data as { error?: string };
      if (body?.error) throw new Error(body.error);
      await invalidateCardData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not update card";
      setPageError(msg);
    } finally {
      setActionBusy(null);
    }
  }

  async function handleSaveLimits() {
    if (!primaryCard) return;
    const daily = parseFloat(limitDaily);
    const monthly = parseFloat(limitMonthly);
    if (Number.isNaN(daily) && Number.isNaN(monthly)) {
      const msg = "Enter at least one spending limit.";
      setPageError(msg);
      return;
    }
    setPageError(null);
    setActionBusy("limits");
    try {
      const payload: Record<string, unknown> = {
        card_id: primaryCard.id,
        action: "update_limits",
      };
      if (!Number.isNaN(daily)) payload.spending_limit_daily = Math.round(daily * 100);
      if (!Number.isNaN(monthly)) payload.spending_limit_monthly = Math.round(monthly * 100);
      const { data, error } = await supabase.functions.invoke("update-lb-card-controls", {
        body: payload,
      });
      if (error) throw error;
      const body = data as { error?: string };
      if (body?.error) throw new Error(body.error);
      await invalidateCardData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not update limits";
      setPageError(msg);
    } finally {
      setActionBusy(null);
    }
  }

  const loadingInitial = cardholderLoading || (hasCardholder && cardsLoading);
  const isBusy = !!actionBusy || cardholderFetching;

  const lastFour = primaryCard?.last_four ?? "••••";
  const expMonth = primaryCard?.exp_month;
  const expYear = primaryCard?.exp_year;
  const expLabel =
    expMonth && expYear
      ? `${String(expMonth).padStart(2, "0")}/${String(expYear).slice(-2)}`
      : "—/—";

  const isFrozen = primaryCard?.status === "frozen";

  if (!cardEnabled) {
    return (
      <PortalPageLayout
        title="LB Card"
        subtitle="Cash domain — cooperative spending, dollars on card"
        maxWidth="xl"
        xrayId="lb-card-page"
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="relative mx-auto mb-8 max-w-lg rounded-2xl p-[1px] shadow-2xl bg-gradient-to-br from-[#D4A843]/50 via-[#1A1F36]/80 to-[#0f121f]"
          >
            <div className="rounded-2xl bg-[#1A1F36] px-8 py-10 text-[#D4A843]">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-[#D4A843]/90">
                LIANA BANYAN COOPERATIVE
              </p>
              <CreditCard className="mx-auto mt-6 h-16 w-16 opacity-60" />
              <h2 className="mt-4 text-2xl font-bold text-white">LB Card — Coming Soon</h2>
              <p className="mt-3 max-w-sm text-sm text-slate-300">
                The LB Card lets you spend earnings from the cooperative at local businesses. 
                Purchase-only. No ATM. No cash-out.
              </p>
              <p className="mt-4 text-sm text-[#D4A843]/80">
                Your earnings are tracked and ready. Cards will be available soon.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            <Shield className="mr-2 h-4 w-4" /> Provider selection in progress
          </Badge>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout
      title="LB Card"
      subtitle="Cash domain — cooperative spending, dollars on card"
      maxWidth="xl"
      xrayId="lb-card-page"
    >
      <div className="space-y-8 pb-12">
        {pageError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {pageError}
          </div>
        )}

        {cardholderError != null && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {cardholderError instanceof Error
              ? cardholderError.message
              : String(cardholderError)}
          </div>
        )}

        {/* Card visual */}
        <div
          className={cn(
            "relative mx-auto max-w-lg rounded-2xl p-[1px] shadow-2xl",
            "bg-gradient-to-br from-[#D4A843]/50 via-[#1A1F36]/80 to-[#0f121f]",
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8 sm:py-8",
              "bg-[#1A1F36] text-[#D4A843]",
              !hasCard && "opacity-85",
            )}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#D4A843]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#2a3358]/60 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.25em] text-[#D4A843]/90">
                  LIANA BANYAN COOPERATIVE
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <CreditCard className="h-6 w-6 opacity-90" />
                  <span className="text-xs uppercase tracking-wider text-[#D4A843]/70">
                    LB Card
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge
                  variant="outline"
                  className="border-[#D4A843]/40 bg-[#0f1428]/80 text-[10px] uppercase tracking-wider text-[#D4A843]"
                >
                  Cash
                </Badge>
                <span className="text-[9px] text-[#D4A843]/50 tracking-wide">
                  Powered by {provider === "stripe" ? "Stripe" : provider}
                </span>
              </div>
            </div>

            <div className="relative mt-8 space-y-2">
              <p className="font-mono text-lg tracking-[0.12em] sm:text-xl">
                {hasCard
                  ? `•••• •••• •••• ${lastFour}`
                  : "•••• •••• •••• ••••"}
              </p>
              {revealOpen && revealedPan && (
                <p className="break-all font-mono text-sm text-[#f0e6c8]">{revealedPan}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#D4A843]/80">
                <span>
                  EXP {hasCard ? expLabel : "—/—"}
                </span>
                {revealOpen && revealedCvc && (
                  <span className="font-mono text-[#f0e6c8]">CVC {revealedCvc}</span>
                )}
              </div>
            </div>

            <div className="relative mt-8 flex flex-col gap-1 border-t border-[#D4A843]/20 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#D4A843]/60">
                  Cardholder
                </p>
                <p className="text-sm font-semibold tracking-wide">{displayName}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#D4A843]/60">
                  <DollarSign className="h-3 w-3" />
                  Cash balance
                </p>
                <p className="text-2xl font-bold tabular-nums text-[#f5e5bc]">
                  {formatUsd(balanceCents)}
                </p>
              </div>
            </div>

            <div className="relative mt-6 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!hasCard || isBusy}
                className="bg-[#2a3358] text-[#D4A843] hover:bg-[#343e66]"
                onClick={handleRevealToggle}
              >
                {revealOpen ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" /> Hide details
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" /> Reveal details
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!hasCard || isBusy}
                className="bg-[#2a3358] text-[#D4A843] hover:bg-[#343e66]"
                onClick={handleFreezeToggle}
              >
                {isFrozen ? (
                  <>
                    <Unlock className="mr-2 h-4 w-4" /> Unfreeze
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" /> Freeze
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!hasCardholder || isBusy}
                className="border-[#D4A843]/40 text-[#D4A843] hover:bg-[#D4A843]/10"
                onClick={() => setSettingsOpen((v) => !v)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>

            {loadingInitial && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#1A1F36]/60 backdrop-blur-[2px]">
                <span className="text-sm text-[#D4A843]/80">Loading card…</span>
              </div>
            )}
          </div>
        </div>

        {/* Onboarding: no cardholder */}
        {!cardholderLoading && !cardholder && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Set Up Your LB Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Create your issuing profile with legal name and billing address. This unlocks your
                cooperative cash card (USD).
              </p>
              <form onSubmit={handleCreateCardholder} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name</Label>
                  <Input
                    id="first_name"
                    required
                    value={holderForm.first_name}
                    onChange={(e) =>
                      setHolderForm((f) => ({ ...f, first_name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input
                    id="last_name"
                    required
                    value={holderForm.last_name}
                    onChange={(e) => setHolderForm((f) => ({ ...f, last_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="line1">Street address</Label>
                  <Input
                    id="line1"
                    required
                    value={holderForm.line1}
                    onChange={(e) => setHolderForm((f) => ({ ...f, line1: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    required
                    value={holderForm.city}
                    onChange={(e) => setHolderForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    value={holderForm.state}
                    onChange={(e) => setHolderForm((f) => ({ ...f, state: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal code</Label>
                  <Input
                    id="postal_code"
                    required
                    value={holderForm.postal_code}
                    onChange={(e) =>
                      setHolderForm((f) => ({ ...f, postal_code: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country (ISO)</Label>
                  <Input
                    id="country"
                    required
                    placeholder="US"
                    value={holderForm.country}
                    onChange={(e) => setHolderForm((f) => ({ ...f, country: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={actionBusy === "create-holder"}>
                    {actionBusy === "create-holder" ? "Creating…" : "Create cardholder profile"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Issue card step */}
        {hasCardholder && !hasCard && !cardsLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issue your LB Card</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Your profile is ready. Issue a virtual card to start spending cooperative cash.
              </p>
              <Button onClick={handleIssueCard} disabled={actionBusy === "issue-card"}>
                {actionBusy === "issue-card" ? "Issuing…" : "Issue your card"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Settings (limits) */}
        {settingsOpen && hasCardholder && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-5 w-5" />
                Card settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Daily and monthly spending caps apply in <strong>dollars</strong> (cash domain).
                Stripe stores limits in cents; we convert for you.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="daily">Daily limit ($)</Label>
                  <Input
                    id="daily"
                    inputMode="decimal"
                    value={limitDaily}
                    onChange={(e) => setLimitDaily(e.target.value)}
                    placeholder="e.g. 50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly">Monthly limit ($)</Label>
                  <Input
                    id="monthly"
                    inputMode="decimal"
                    value={limitMonthly}
                    onChange={(e) => setLimitMonthly(e.target.value)}
                    placeholder="e.g. 500"
                  />
                </div>
              </div>
              <Button
                type="button"
                onClick={handleSaveLimits}
                disabled={!primaryCard || actionBusy === "limits"}
              >
                {actionBusy === "limits" ? "Saving…" : "Save spending limits"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Earnings Breakdown */}
        {hasCardholder && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Earnings Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {fundingLoading ? (
                <p className="text-sm text-muted-foreground">Loading earnings…</p>
              ) : !fundingRows?.length ? (
                <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  No earnings yet. When orders pay out, your breakdown appears here.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {(["creator_share", "delivery_fee", "onboarding_credit", "steward_fee"] as const).map((type) => {
                      const rows = fundingRows.filter((f) => f.funding_type === type);
                      const totalCents = rows.reduce((s, r) => s + r.amount_cents, 0);
                      const labels: Record<string, string> = {
                        creator_share: "Creator Share",
                        delivery_fee: "Delivery Fees",
                        onboarding_credit: "Onboarding",
                        steward_fee: "Steward Fee",
                      };
                      return (
                        <div
                          key={type}
                          className="rounded-lg border bg-card/50 p-4 text-center"
                        >
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {labels[type]}
                          </p>
                          <p className="mt-1 text-xl font-bold tabular-nums">
                            {formatUsd(totalCents)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rows.length} {rows.length === 1 ? "order" : "orders"}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                      Recent Earnings
                    </h4>
                    <div className="space-y-2">
                      {fundingRows.slice(0, 5).map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="capitalize">
                              {f.funding_type.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {new Date(f.created_at).toLocaleDateString()}
                            </span>
                            <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                              +{formatUsd(f.amount_cents)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Transaction history
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasCard ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                <History className="mx-auto mb-3 h-10 w-10 opacity-40" />
                Issue your LB Card to see purchase activity here.
              </div>
            ) : txLoading ? (
              <p className="text-sm text-muted-foreground">Loading transactions…</p>
            ) : !transactions?.length ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                No transactions yet. Purchases will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Merchant</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                        <tr key={t.id} className="border-b border-border/60 last:border-0">
                          <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                            {new Date(t.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-medium">
                              {t.merchant_name || "Unknown merchant"}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <ArrowDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatUsd(Math.abs(t.amount_cents))}
                            </span>
                          </td>
                          <td className="py-3">
                            <Badge
                              variant="outline"
                              className={cn("capitalize", statusBadgeClass(t.status))}
                            >
                              {t.status}
                            </Badge>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
              Funding history
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!hasCardholder ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                Complete cardholder setup to track how cash lands on your LB Card.
              </div>
            ) : fundingLoading ? (
              <p className="text-sm text-muted-foreground">Loading funding…</p>
            ) : !fundingRows?.length ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                No funding events yet. Transfers to your card balance will show here.
              </div>
            ) : (
              <ul className="space-y-3">
                {fundingRows.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-col gap-2 rounded-lg border bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(f.created_at).toLocaleString()}
                      </p>
                      <p className="font-medium">
                        {f.source_description || "Funding to LB Card"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {f.funding_type.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-lg font-semibold tabular-nums">
                        {formatUsd(f.amount_cents)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
