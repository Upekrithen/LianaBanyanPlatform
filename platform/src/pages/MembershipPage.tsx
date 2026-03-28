import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Key, Loader2, Crown, Star, Sparkles } from "lucide-react";
import { useMembership, useCreateCheckout, type MembershipTier } from "@/hooks/useMembership";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TierDef {
  key: MembershipTier;
  name: string;
  price: string;
  priceNote: string;
  icon: typeof Key;
  features: string[];
  highlight?: boolean;
}

const tiers: TierDef[] = [
  {
    key: "free",
    name: "Explorer",
    price: "FREE",
    priceNote: "Browse & buy",
    icon: Key,
    features: [
      "Browse marketplace",
      "Buy products",
      "Back projects",
      "Join community",
    ],
  },
  {
    key: "member",
    name: "Member",
    price: "$5",
    priceNote: "per year",
    icon: Star,
    highlight: true,
    features: [
      "Everything in Explorer",
      "Sell on marketplace",
      "Create Cue Cards",
      "Turn-Key project access",
      "Full calendar & plugs",
      "Ghost World island",
      "5 starter Credits",
    ],
  },
  {
    key: "builder",
    name: "Builder",
    price: "$10",
    priceNote: "per year",
    icon: Crown,
    features: [
      "Everything in Member",
      "Priority queue placement",
      "Builder badge",
      "Extended support",
      "Production pipeline access",
    ],
  },
  {
    key: "patron",
    name: "Patron",
    price: "$25",
    priceNote: "per year",
    icon: Sparkles,
    features: [
      "Everything in Builder",
      "Patron badge",
      "Crown Letter access",
      "Founding member recognition",
      "Direct feedback channel",
    ],
  },
];

export default function MembershipPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: membership, isLoading } = useMembership();
  const checkout = useCreateCheckout();

  const canceled = searchParams.get("canceled") === "true";

  const handleJoin = async (tier: MembershipTier) => {
    if (!user) {
      navigate(`/auth?redirect=/membership`);
      return;
    }
    if (tier === "free") return;

    try {
      await checkout.mutateAsync({ type: "membership", tier });
    } catch (e: any) {
      toast.error(e.message || "Failed to start checkout");
    }
  };

  const currentTier = membership?.tier || "free";
  const isActive = membership?.status === "active";

  return (
    <PortalPageLayout
      title="Choose Your Membership"
      subtitle="Your Access Key to the cooperative. Every dollar stays in the system."
      maxWidth="2xl"
      xrayId="membership-page"
    >
      <div className="space-y-8 pb-12">
        {canceled && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-center text-sm text-amber-800 dark:text-amber-300">
            Checkout was canceled. No charges were made.
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const isCurrent = currentTier === tier.key && isActive;
            const isUpgrade = isActive && tierRank(tier.key) > tierRank(currentTier);

            return (
              <Card
                key={tier.key}
                className={cn(
                  "relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg",
                  tier.highlight && "ring-2 ring-primary shadow-lg",
                  isCurrent && "ring-2 ring-emerald-500"
                )}
              >
                {tier.highlight && (
                  <div className="absolute top-0 left-0 right-0 bg-primary py-1 text-center text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <CardHeader className={cn("text-center", tier.highlight && "pt-8")}>
                  <tier.icon className="mx-auto mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    {tier.priceNote !== "Browse & buy" && (
                      <span className="text-sm text-muted-foreground ml-1">/{tier.priceNote}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    {isCurrent ? (
                      <Badge variant="outline" className="w-full justify-center py-2 border-emerald-500 text-emerald-700 dark:text-emerald-400">
                        Current Plan
                      </Badge>
                    ) : tier.key === "free" ? (
                      <Badge variant="outline" className="w-full justify-center py-2">
                        {isActive ? "Included" : "Default"}
                      </Badge>
                    ) : (
                      <Button
                        className="w-full"
                        variant={tier.highlight ? "default" : "outline"}
                        onClick={() => handleJoin(tier.key)}
                        disabled={checkout.isPending || isLoading}
                      >
                        {checkout.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isUpgrade ? "Upgrade" : "Join"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {isActive && (
          <div className="text-center">
            <Button variant="link" onClick={() => navigate("/dashboard/membership")}>
              Manage your subscription →
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>Membership is $5/year — a Structural Bylaw that cannot be changed by normal vote.</p>
          <p>Credits are prepaid store credit ($1 = 1 Credit). Not securities. Not investment.</p>
        </div>
      </div>
    </PortalPageLayout>
  );
}

function tierRank(tier: MembershipTier): number {
  return { free: 0, member: 1, builder: 2, patron: 3 }[tier] ?? 0;
}
