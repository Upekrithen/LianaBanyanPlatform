import { useState } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Banknote,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useEarnings, usePayoutHistory, useRequestPayout } from "@/hooks/useEarnings";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "completed" || s === "paid") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (s === "processing" || s === "pending") return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300";
  if (s === "failed") return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400";
  return "border-muted-foreground/30 bg-muted/40 text-muted-foreground";
}

export default function EarningsDashboard() {
  const navigate = useNavigate();
  const { data: earnings, isLoading } = useEarnings();
  const { data: payouts, isLoading: payoutsLoading } = usePayoutHistory();
  const requestPayout = useRequestPayout();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount, 10);
    if (!amount || amount < 1) {
      toast.error("Enter a valid amount (minimum 1 credit)");
      return;
    }
    if (amount > (earnings?.availableToWithdraw || 0)) {
      toast.error("Amount exceeds available balance");
      return;
    }
    try {
      const result = await requestPayout.mutateAsync(amount);
      toast.success(`Payout initiated! You'll receive $${result.net_payout_usd}`);
      setWithdrawAmount("");
    } catch (e: any) {
      toast.error(e.message || "Payout failed");
    }
  };

  return (
    <PortalPageLayout
      title="Your Earnings"
      subtitle="Track your revenue and request payouts. Creator keeps 83.3%."
      maxWidth="xl"
      xrayId="earnings-dashboard"
    >
      <div className="space-y-6 pb-12">
        {/* Earnings Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold tabular-nums">
                {isLoading ? "—" : `${earnings?.totalEarned ?? 0} Credits`}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Banknote className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-sm text-muted-foreground">Available to Withdraw</p>
              <p className="text-2xl font-bold tabular-nums">
                {isLoading ? "—" : `${earnings?.availableToWithdraw ?? 0} Credits`}
              </p>
              {earnings && earnings.availableToWithdraw > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {formatUsd(earnings.netPayout)} after 20% platform fee
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="mx-auto mb-2 h-6 w-6 text-blue-500" />
              <p className="text-sm text-muted-foreground">Stripe Connect</p>
              <p className="text-lg font-semibold">
                {isLoading ? "—" : earnings?.connectStatus === "connected" ? (
                  <span className="text-emerald-600">Connected</span>
                ) : earnings?.connectStatus === "pending" ? (
                  <span className="text-amber-600">Pending</span>
                ) : (
                  <span className="text-muted-foreground">Not Set Up</span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Withdraw */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5" />
              Request Payout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {earnings?.connectStatus !== "connected" ? (
              <div className="text-center py-6 space-y-3">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
                <p className="text-sm text-muted-foreground">
                  Connect your Stripe account to receive payouts.
                </p>
                <Button variant="outline" onClick={() => navigate("/dashboard/payouts")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Set Up Stripe Connect
                </Button>
              </div>
            ) : !earnings?.payoutsEnabled ? (
              <div className="text-center py-6 space-y-3">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
                <p className="text-sm text-muted-foreground">
                  Complete Stripe onboarding to enable payouts.
                </p>
                <Button variant="outline" onClick={() => navigate("/dashboard/payouts")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Complete Onboarding
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium mb-2">Withdraw Credits</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        max={earnings?.availableToWithdraw || 0}
                        placeholder="Amount in credits"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                      <Button
                        onClick={handleWithdraw}
                        disabled={requestPayout.isPending || !withdrawAmount}
                      >
                        {requestPayout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Withdraw
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4 text-sm space-y-1">
                    <p className="font-medium">Fee Breakdown</p>
                    {withdrawAmount && parseInt(withdrawAmount) > 0 ? (
                      <>
                        <p>Gross: {withdrawAmount} Credits ({formatUsd(parseInt(withdrawAmount))})</p>
                        <p>Platform fee (20%): {formatUsd(parseInt(withdrawAmount) * 0.2)}</p>
                        <p className="font-semibold">
                          You receive: {formatUsd(parseInt(withdrawAmount) * 0.8)}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Enter an amount to see breakdown</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Creator keeps 83.3%. Platform margin is Cost + 20%.
                  Minimum payout: 1 credit ($1).
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Payout History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payoutsLoading ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : !payouts?.length ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                <Banknote className="mx-auto mb-3 h-10 w-10 opacity-40" />
                No payouts yet. Earn credits from project sales and production runs.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Gross</th>
                      <th className="py-2 pr-4">Fee</th>
                      <th className="py-2 pr-4">Net</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 tabular-nums">{formatUsd(p.amount_cents / 100)}</td>
                        <td className="py-3 pr-4 tabular-nums text-muted-foreground">{formatUsd(p.fee_cents / 100)}</td>
                        <td className="py-3 pr-4 tabular-nums font-semibold">{formatUsd(p.net_amount_cents / 100)}</td>
                        <td className="py-3">
                          <Badge variant="outline" className={statusBadgeClass(p.status)}>
                            {p.status === "completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {p.status}
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
      </div>
    </PortalPageLayout>
  );
}
