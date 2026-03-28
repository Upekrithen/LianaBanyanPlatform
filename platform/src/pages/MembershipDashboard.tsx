import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Calendar,
  CreditCard,
  Settings,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMembership, useManageSubscription, useCreateCheckout } from "@/hooks/useMembership";
import { useCreditTransactions } from "@/hooks/useCreditWallet";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function tierLabel(tier: string): string {
  return { free: "Explorer", member: "Member", builder: "Builder", patron: "Patron" }[tier] || tier;
}

function tierColor(tier: string): string {
  return {
    free: "bg-muted text-muted-foreground",
    member: "bg-primary/10 text-primary border-primary/30",
    builder: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    patron: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
  }[tier] || "";
}

export default function MembershipDashboard() {
  const navigate = useNavigate();
  const { data: membership, isLoading } = useMembership();
  const portal = useManageSubscription();
  const upgrade = useCreateCheckout();
  const { data: transactions } = useCreditTransactions(10);

  const handlePortal = async () => {
    try {
      await portal.mutateAsync();
    } catch (e: any) {
      toast.error(e.message || "Could not open billing portal");
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      await upgrade.mutateAsync({ type: "membership", tier });
    } catch (e: any) {
      toast.error(e.message || "Upgrade failed");
    }
  };

  const tier = membership?.tier || "free";
  const isActive = membership?.status === "active";
  const renewalDate = membership?.current_period_end
    ? new Date(membership.current_period_end).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <PortalPageLayout
      title="Manage Membership"
      subtitle="Your subscription and billing details"
      maxWidth="xl"
      xrayId="membership-dashboard"
    >
      <div className="space-y-6 pb-12">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={tierColor(tier)}>
                      {tierLabel(tier)}
                    </Badge>
                    {isActive && (
                      <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        Active
                      </Badge>
                    )}
                    {membership?.status === "past_due" && (
                      <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Past Due
                      </Badge>
                    )}
                  </div>
                  {membership?.price_usd && (
                    <span className="text-lg font-semibold">${membership.price_usd}/year</span>
                  )}
                </div>

                {renewalDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {membership?.cancel_at_period_end
                      ? `Expires ${renewalDate} (will not renew)`
                      : `Renews ${renewalDate}`}
                  </div>
                )}

                {tier === "free" ? (
                  <Button onClick={() => navigate("/membership")}>
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Join Now — $5/year
                  </Button>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {membership?.stripe_customer_id && (
                      <Button variant="outline" onClick={handlePortal} disabled={portal.isPending}>
                        {portal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Subscription
                      </Button>
                    )}
                    {tier !== "patron" && (
                      <Button
                        variant="outline"
                        onClick={() => handleUpgrade(tier === "member" ? "builder" : "patron")}
                        disabled={upgrade.isPending}
                      >
                        {upgrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Upgrade to {tier === "member" ? "Builder" : "Patron"}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!transactions?.length ? (
              <p className="text-sm text-muted-foreground text-center py-6">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-medium">{t.description || t.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={t.amount >= 0 ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                      {t.amount >= 0 ? "+" : ""}{t.amount} Credits
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
