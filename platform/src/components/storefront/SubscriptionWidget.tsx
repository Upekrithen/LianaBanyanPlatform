import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarCheck, Check, Loader2, RefreshCw } from "lucide-react";

type SubscriptionTier = {
  id: string;
  name: string;
  price: number;
  frequency: string;
  description: string | null;
  prepaid_price?: number;
};

type SubscriptionWidgetProps = {
  storefrontId: string;
  storefrontName: string;
  tiers: SubscriptionTier[];
  onSubscribed?: () => void;
};

const FREQ_LABELS: Record<string, string> = {
  weekly: "/week",
  biweekly: "/visit",
  monthly: "/month",
  quarterly: "/quarter",
};

export function SubscriptionWidget({
  storefrontId,
  storefrontName,
  tiers,
  onSubscribed,
}: SubscriptionWidgetProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (tiers.length === 0) return null;

  const handleSubscribe = async () => {
    if (!user || !selected) return;

    const tier = tiers.find((t) => t.id === selected);
    if (!tier) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("storefront_subscriptions" as never)
        .insert({
          storefront_id: storefrontId,
          subscriber_user_id: user.id,
          tier_id: tier.id,
          frequency: tier.frequency,
          price_per_cycle: tier.prepaid_price ?? tier.price,
          payment_method: "credits",
          status: "active",
          next_service_date: getNextServiceDate(tier.frequency),
        } as never);

      if (error) throw error;

      toast.success(`Subscribed to ${tier.name}!`);
      onSubscribed?.();
    } catch {
      toast.error("Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Subscribe to {storefrontName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tiers.map((tier) => {
          const isSelected = selected === tier.id;
          const hasPrepaid = tier.prepaid_price != null && tier.prepaid_price < tier.price;

          return (
            <button
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                    <span className="font-medium text-sm">{tier.name}</span>
                  </div>
                  {tier.description && (
                    <p className="text-xs text-muted-foreground">
                      {tier.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm">
                    ${tier.price}
                    <span className="font-normal text-xs text-muted-foreground">
                      {FREQ_LABELS[tier.frequency] ?? ""}
                    </span>
                  </p>
                  {hasPrepaid && (
                    <Badge variant="secondary" className="text-[10px] mt-0.5">
                      ${tier.prepaid_price} prepaid
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        <Button
          className="w-full gap-2"
          disabled={!selected || loading || !user}
          onClick={handleSubscribe}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CalendarCheck className="w-4 h-4" />
          )}
          Subscribe
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Prepay with Credits and save. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  );
}

function getNextServiceDate(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case "weekly":
      now.setDate(now.getDate() + 7);
      break;
    case "biweekly":
      now.setDate(now.getDate() + 14);
      break;
    case "monthly":
      now.setMonth(now.getMonth() + 1);
      break;
    case "quarterly":
      now.setMonth(now.getMonth() + 3);
      break;
  }
  return now.toISOString().split("T")[0];
}
