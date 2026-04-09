import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, ShoppingCart, Loader2, CheckCircle2, Gift } from "lucide-react";
import { useBuyCredits, usePurchaseHistory, useCreditBalance } from "@/hooks/useBuyCredits";
import { toast } from "sonner";

const packages = [
  { key: "small", credits: 10, price: "$10", description: "Starter" },
  { key: "medium", credits: 50, price: "$50", description: "Builder" },
  { key: "large", credits: 100, price: "$100", description: "Producer" },
];

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function BuyCreditsPage() {
  const buy = useBuyCredits();
  const { data: balance } = useCreditBalance();
  const { data: purchases, isLoading: purchasesLoading } = usePurchaseHistory();

  const handleBuy = async (pkg: string) => {
    try {
      await buy.mutateAsync(pkg);
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
  };

  return (
    <PortalPageLayout
      title="Buy Credits"
      subtitle="Credits fuel projects, pledges, and production. $1 = 1 Credit."
      maxWidth="xl"
      xrayId="buy-credits-page"
    >
      <div className="space-y-8 pb-12">
        {/* Current balance */}
        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold tabular-nums">{balance ?? 0} Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packages */}
        <div>
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Choose a Package
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.key} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{pkg.description}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{pkg.credits}</p>
                    <p className="text-sm text-muted-foreground">Credits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold">{pkg.price}</p>
                    <p className="text-xs text-muted-foreground">$1 = 1 Credit</p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleBuy(pkg.key)}
                    disabled={buy.isPending}
                  >
                    {buy.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="mr-2 h-4 w-4" />
                    )}
                    Buy {pkg.credits} Credits
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5" />
            Early members may receive bonus credits based on participation tier.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70 max-w-md">
            Your payment is processed and held by our payment processor (Stripe) until applied to your account or a project reaches its production threshold. If conditions are not met, your payment is automatically refunded.
          </p>
        </div>

        {/* Purchase history */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5" />
              Purchase History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchasesLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : !purchases?.length ? (
              <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                <Coins className="mx-auto mb-3 h-10 w-10 opacity-40" />
                No purchases yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Credits</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 font-semibold tabular-nums">
                          {p.amount_credits}
                        </td>
                        <td className="py-3 pr-4 tabular-nums">
                          {formatUsd(p.amount_usd)}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className={
                              p.status === "completed"
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
                                : p.status === "pending"
                                  ? "border-amber-500/40 bg-amber-500/10 text-amber-700"
                                  : "border-red-500/40 bg-red-500/10 text-red-700"
                            }
                          >
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
