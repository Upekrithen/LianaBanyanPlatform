import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Star, Eye, Crown } from "lucide-react";
// import { useIslandPricingCalculator } from "@/hooks/useIslandPricingCalculator";
const useIslandPricingCalculator = (islandId: string, monthlyVisitors: number) => ({
  calculatePricing: () => ({ buyPrice: 1000, rentPrice: 10 }),
  isLoading: false,
  error: null
});

interface IslandPricingCardProps {
  islandId: string;
  monthlyVisitors: number;
}

export const IslandPricingCard = ({ islandId, monthlyVisitors }: IslandPricingCardProps) => {
  const { data: pricing, isLoading } = useIslandPricingCalculator(islandId, monthlyVisitors);

  if (isLoading || !pricing) {
    return null;
  }

  const getTierBadge = () => {
    if (monthlyVisitors >= 20000) return { label: "Premium", color: "bg-gradient-to-r from-purple-500 to-pink-500" };
    if (monthlyVisitors >= 5000) return { label: "High Traffic", color: "bg-gradient-to-r from-orange-500 to-red-500" };
    if (monthlyVisitors >= 1000) return { label: "Growing", color: "bg-gradient-to-r from-blue-500 to-cyan-500" };
    return { label: "Starter", color: "bg-gradient-to-r from-green-500 to-emerald-500" };
  };

  const tierBadge = getTierBadge();

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Current Pricing</h3>
        <Badge className={`${tierBadge.color} text-white`}>
          {tierBadge.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/70 dark:bg-black/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Rental (Monthly)</div>
          <div className="text-3xl font-bold text-blue-600">{pricing.rentalPrice}</div>
          <div className="text-xs text-muted-foreground">credits/month</div>
        </div>

        <div className="bg-white/70 dark:bg-black/30 rounded-lg p-4">
          <div className="text-sm text-muted-foreground mb-1">Purchase</div>
          <div className="text-3xl font-bold text-purple-600">{pricing.purchasePrice}</div>
          <div className="text-xs text-muted-foreground">credits (lifetime)</div>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2 mb-4">
        <div className="text-sm font-semibold mb-2">Included Benefits:</div>
        {pricing.benefits.featuredPlacement && (
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Featured placement on island</span>
          </div>
        )}
        {pricing.benefits.priorityVisibility && (
          <div className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-blue-500" />
            <span>Priority in search results</span>
          </div>
        )}
        {pricing.benefits.customBranding && (
          <div className="flex items-center gap-2 text-sm">
            <Crown className="w-4 h-4 text-purple-500" />
            <span>Custom branding options</span>
          </div>
        )}
        {!pricing.benefits.featuredPlacement && !pricing.benefits.priorityVisibility && (
          <div className="text-sm text-muted-foreground">
            • Standard listing visibility
          </div>
        )}
      </div>

      {/* Pricing Factors */}
      <div className="border-t pt-4 mt-4">
        <div className="text-xs text-muted-foreground mb-2">Pricing based on:</div>
        <div className="flex items-center gap-2 text-sm mb-1">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span>
            {monthlyVisitors.toLocaleString()} monthly visitors
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Price multiplier: {pricing.tierMultiplier}x base rate
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Islands near popular locations or with high traffic command premium prices,
          similar to prime real estate. Early adopters get locked-in rates!
        </div>
      </div>
    </Card>
  );
};
