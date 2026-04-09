import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KIT_PRICING, KitTier } from "./types";

type KitRecommendationProps = {
  tier: KitTier;
  payoffSentence: string;
};

const LABELS: Record<KitTier, string> = {
  gravity: "Gravity",
  thermoplastic: "Thermoplastic",
  complete: "Complete",
};

export function KitRecommendation({ tier, payoffSentence }: KitRecommendationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kit recommendation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge>{LABELS[tier]}</Badge>
          <span className="text-lg font-semibold">${KIT_PRICING[tier]}</span>
        </div>
        <p className="text-sm text-muted-foreground">{payoffSentence}</p>
      </CardContent>
    </Card>
  );
}
