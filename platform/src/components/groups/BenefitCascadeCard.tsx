import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useUnlockedBenefits,
  useNextBenefitTier,
  useBenefitProgress,
} from "@/hooks/useBenefitCascade";
import {
  Lock, Unlock, Gift, Users, ChevronRight,
  ShoppingCart, Search, Coins, HeadphonesIcon, Store,
  UtensilsCrossed, ShoppingBag, Handshake, Building,
} from "lucide-react";

const BENEFIT_ICONS: Record<string, React.ReactNode> = {
  discount: <ShoppingCart className="h-4 w-4" />,
  priority: <Search className="h-4 w-4" />,
  treasury: <Coins className="h-4 w-4" />,
  governance: <HeadphonesIcon className="h-4 w-4" />,
  marketplace: <Store className="h-4 w-4" />,
};

const TRIBE_ICONS: Record<number, React.ReactNode> = {
  5: <UtensilsCrossed className="h-4 w-4" />,
  10: <ShoppingBag className="h-4 w-4" />,
  25: <Coins className="h-4 w-4" />,
  50: <Handshake className="h-4 w-4" />,
  100: <Building className="h-4 w-4" />,
};

interface BenefitCascadeCardProps {
  groupType: "guild" | "tribe";
  memberCount: number;
  onInvite?: () => void;
}

export function BenefitCascadeCard({ groupType, memberCount, onInvite }: BenefitCascadeCardProps) {
  const { unlocked, locked, allTiers } = useUnlockedBenefits(groupType, memberCount);
  const { nextTier, membersNeeded } = useNextBenefitTier(groupType, memberCount);
  const { progress, unlockedCount, totalTiers } = useBenefitProgress(groupType, memberCount);

  const getIcon = (tier: typeof allTiers[0]) => {
    if (groupType === "tribe" && TRIBE_ICONS[tier.member_threshold]) {
      return TRIBE_ICONS[tier.member_threshold];
    }
    return BENEFIT_ICONS[tier.benefit_type] || <Gift className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" />
            Benefit Cascade
          </span>
          <Badge variant="outline" className="text-xs">
            {unlockedCount}/{totalTiers} unlocked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress toward next tier */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{memberCount} members</span>
              <span>Next: {nextTier.member_threshold}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm font-medium text-center">
              Invite <span className="text-purple-600">{membersNeeded} more</span> to unlock{" "}
              <span className="font-semibold">{nextTier.benefit_name}</span>
            </p>
          </div>
        )}

        {!nextTier && allTiers.length > 0 && (
          <div className="text-center py-2">
            <Badge className="bg-green-100 text-green-700 text-sm">All benefits unlocked!</Badge>
          </div>
        )}

        {/* Tier list */}
        <div className="space-y-2">
          {allTiers.map((tier) => {
            const isUnlocked = memberCount >= tier.member_threshold;
            return (
              <div
                key={tier.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isUnlocked
                    ? "bg-white border-green-200 dark:bg-green-950/20"
                    : "bg-muted/30 border-dashed opacity-60"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isUnlocked
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getIcon(tier)}
                    <span className={`text-sm font-medium ${!isUnlocked ? "text-muted-foreground" : ""}`}>
                      {tier.benefit_name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {tier.benefit_description}
                  </p>
                </div>

                <Badge variant="secondary" className="flex-shrink-0 text-xs">
                  {tier.member_threshold}+
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Recruit CTA */}
        {nextTier && onInvite && (
          <Button onClick={onInvite} className="w-full" variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Invite {membersNeeded} more to unlock {nextTier.benefit_name}
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
