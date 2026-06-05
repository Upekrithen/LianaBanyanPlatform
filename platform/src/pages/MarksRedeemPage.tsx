/**
 * MarksRedeemPage -- Wave 26 / Redeem flow
 * =========================================
 * Marks -> Credits -> Cost+20% purchase discount.
 * Shows current balances, conversion calculator, payout gate status.
 *
 * SECURITIES-CLEAN:
 *   "Participation credits that reduce your Cost+20% purchases."
 *   NOT equity, shares, or guaranteed financial return.
 *
 * HELD: Marks-to-Credits rate pending Founder ratification.
 * BP072-W26
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  Coins,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Lock,
  Info,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  redeemMarksForCredits,
  getPayoutGateStatus,
  MARKS_TO_CREDITS_RATE_HELD,
  REDEMPTION_DISCLOSURE,
  type PayoutGateStatus,
} from "@/lib/marks/economyService";

// ─── Wallet query ─────────────────────────────────────────────────────────────

interface WalletData {
  marksBalance: number;
  creditsBalance: number;
  joulesBalance: number;
}

function useWallet(userId: string) {
  return useQuery({
    queryKey: ["wallet", userId],
    queryFn: async (): Promise<WalletData> => {
      const [marksRes, creditsRes, joulesRes] = await Promise.all([
        supabase
          .from("shadow_marks_ledger" as never)
          .select("amount")
          .eq("user_id", userId) as any,
        supabase
          .from("credit_wallets" as never)
          .select("balance")
          .eq("user_id", userId)
          .maybeSingle() as any,
        supabase
          .from("joule_balances" as never)
          .select("balance")
          .eq("user_id", userId)
          .maybeSingle() as any,
      ]);

      const marks = (marksRes.data ?? []).reduce(
        (s: number, r: { amount: number }) => s + r.amount,
        0,
      );
      return {
        marksBalance: marks,
        creditsBalance: creditsRes.data?.balance ?? 0,
        joulesBalance: joulesRes.data?.balance ?? 0,
      };
    },
    enabled: !!userId,
    staleTime: 20_000,
  });
}

// ─── Gate status badge ────────────────────────────────────────────────────────

function PayoutGateBadge({ gate }: { gate: PayoutGateStatus }) {
  const colors = {
    green: "border-green-500/30 bg-green-500/8 text-green-700",
    amber: "border-amber-500/30 bg-amber-500/8 text-amber-700",
    red: "border-red-500/30 bg-red-500/8 text-red-700",
  };

  const icons = {
    green: <CheckCircle className="h-4 w-4 text-green-600" />,
    amber: <Lock className="h-4 w-4 text-amber-600" />,
    red: <AlertCircle className="h-4 w-4 text-red-600" />,
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${colors[gate.gate_color]}`}
    >
      <div className="mt-0.5 shrink-0">{icons[gate.gate_color]}</div>
      <div>
        <p className="text-sm font-semibold">{gate.gate_label}</p>
        <p className="text-xs mt-0.5 opacity-80">{gate.gate_detail}</p>
      </div>
    </div>
  );
}

// ─── Conversion calculator ────────────────────────────────────────────────────

function ConversionCalculator({
  maxMarks,
  onRedeem,
  redeeming,
}: {
  maxMarks: number;
  onRedeem: (amount: number) => void;
  redeeming: boolean;
}) {
  const [marksInput, setMarksInput] = useState<number>(0);
  const creditsPreview = Math.floor(marksInput * MARKS_TO_CREDITS_RATE_HELD);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ArrowRight className="h-5 w-5 text-primary" />
          Redeem Marks for Credits
        </CardTitle>
        <CardDescription>
          Convert participation credits to Credits for Cost+20% purchases.
          Rate is provisional, pending Founder ratification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Marks to Redeem
            </label>
            <Input
              type="number"
              min={0}
              max={maxMarks}
              value={marksInput || ""}
              onChange={(e) => setMarksInput(Math.max(0, Math.min(maxMarks, Number(e.target.value))))}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Available: {maxMarks.toLocaleString()} Marks
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Credits You Receive
            </label>
            <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3">
              <Coins className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-sm font-medium tabular-nums">
                {creditsPreview.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Rate: {MARKS_TO_CREDITS_RATE_HELD} Credits / Mark (HELD)
            </p>
          </div>
        </div>

        {/* Cost+20% example */}
        {creditsPreview > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <span className="font-medium">Example:</span> {creditsPreview} Credits reduces a
            Cost+20% service purchase by ~${(creditsPreview / 100).toFixed(2)} (if 1 Credit = $0.01).
            Final exchange rate set by Founder.
          </div>
        )}

        <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Info className="inline h-3.5 w-3.5 mr-1" />
          {REDEMPTION_DISCLOSURE}
        </div>

        <Button
          className="w-full gap-2"
          disabled={marksInput <= 0 || marksInput > maxMarks || redeeming}
          onClick={() => onRedeem(marksInput)}
        >
          <ArrowRight className="h-4 w-4" />
          {redeeming ? "Redeeming..." : `Redeem ${marksInput} Marks`}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarksRedeemPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: wallet, isLoading: walletLoading } = useWallet(user?.id ?? "");
  const { data: gateStatus, isLoading: gateLoading } = useQuery({
    queryKey: ["payout-gate-status"],
    queryFn: getPayoutGateStatus,
    staleTime: 60_000,
  });

  const redeemMutation = useMutation({
    mutationFn: (marksAmount: number) =>
      redeemMarksForCredits({
        memberId: user!.id,
        marksToSpend: marksAmount,
        purchaseContext: "member_redeem_page",
      }),
    onSuccess: (result) => {
      if (result.ok) {
        toast({
          title: "Marks redeemed!",
          description: `${result.creditsReceived?.toLocaleString()} Credits added to your wallet.`,
        });
        qc.invalidateQueries({ queryKey: ["wallet"] });
      } else {
        toast({ title: "Redemption failed", description: result.error, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Redemption failed", variant: "destructive" });
    },
  });

  if (!user) {
    return (
      <PortalPageLayout maxWidth="md" xrayId="marks-redeem">
        <div className="py-20 text-center text-muted-foreground">
          <p>Sign in to redeem Marks.</p>
          <Button className="mt-4" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="lg" xrayId="marks-redeem">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-amber-600" />
            Marks Redemption
          </h1>
          <p className="mt-1 text-muted-foreground">
            Convert your participation Marks to Credits for Cost+20% purchases.
          </p>
        </div>

        {/* NOT A GUARANTEE banner */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">NOT A GUARANTEE.</span> Marks are participation
            credits -- not equity, shares, or guaranteed financial return. Redemption converts
            them to Credits usable for Cost+20% service purchases on this platform only.
          </p>
        </div>

        {/* Payout gate */}
        {gateLoading ? (
          <Skeleton className="h-16 rounded-lg" />
        ) : gateStatus ? (
          <PayoutGateBadge gate={gateStatus} />
        ) : null}

        {/* Balances */}
        {walletLoading ? (
          <Skeleton className="h-28 rounded-lg" />
        ) : wallet ? (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5 text-center">
                <Shield className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                <p className="text-2xl font-bold tabular-nums">
                  {wallet.marksBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Marks</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Participation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 text-center">
                <Coins className="mx-auto mb-1 h-5 w-5 text-green-600" />
                <p className="text-2xl font-bold tabular-nums">
                  {wallet.creditsBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Credits</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Cost+20%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 text-center">
                <Zap className="mx-auto mb-1 h-5 w-5 text-purple-600" />
                <p className="text-2xl font-bold tabular-nums">
                  {wallet.joulesBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Joules</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Energy</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Conversion calculator */}
        {wallet && (
          <ConversionCalculator
            maxMarks={wallet.marksBalance}
            onRedeem={(amount) => redeemMutation.mutate(amount)}
            redeeming={redeemMutation.isPending}
          />
        )}

        {/* How it works */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              How EARN - HOLD - REDEEM Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">1</span>
                <div>
                  <span className="font-medium">EARN</span> -- Complete a bounty.
                  Marks are credited to your account when work is verified.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">2</span>
                <div>
                  <span className="font-medium">HOLD</span> -- Marks stay in your
                  account until you choose to redeem them. No expiry.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">3</span>
                <div>
                  <span className="font-medium">REDEEM</span> -- Convert Marks to
                  Credits here. Credits reduce Cost+20% service purchases.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">4</span>
                <div>
                  <span className="font-medium text-muted-foreground">PAYOUT (HELD)</span>
                  {" "}-- Direct cash payout gate opens after Stripe E2E test in LIVE mode.
                  Rates pending 15-language Founder ratification.
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/bounties">
              <Zap className="mr-1.5 h-4 w-4" />
              Earn More Marks
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/member">
              <Shield className="mr-1.5 h-4 w-4" />
              Member Dashboard
            </Link>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground border-t pt-4">
          Cost+20% architecture. 83.3% of platform revenue flows to creators.
          Membership: $5/year flat rate. No tiers.
        </p>
      </div>
    </PortalPageLayout>
  );
}
