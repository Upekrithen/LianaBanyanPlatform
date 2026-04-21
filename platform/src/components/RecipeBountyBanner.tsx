/**
 * RECIPE BOUNTY BANNER
 * ====================
 * Shows category bounty opportunities to encourage recipe contributions.
 * Highlights empty/sparse categories with Shadow Marks rewards.
 *
 * "Be the FIRST to add a French Elegant Dinner! Earn 50 Shadow Marks"
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getTopBounties,
  BOUNTY_TIERS,
  type CategoryBounty
} from "@/lib/shadowMarksService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  ChefHat,
  HelpCircle,
  ArrowRight,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeBountyBannerProps {
  onAddRecipe?: (cuisine: string, mealType: string) => void;
  compact?: boolean;
}

export function RecipeBountyBanner({ onAddRecipe, compact = false }: RecipeBountyBannerProps) {
  const navigate = useNavigate();
  const [showExplainer, setShowExplainer] = useState(false);

  const { data: bounties, isLoading } = useQuery({
    queryKey: ['top-bounties'],
    queryFn: () => getTopBounties(5),
  });

  if (isLoading || !bounties || bounties.length === 0) {
    return null;
  }

  // Find the best opportunity
  const bestBounty = bounties[0];
  const tierInfo = BOUNTY_TIERS[bestBounty.shelfStatus];

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:border-amber-500/50 transition-colors",
          tierInfo.bg,
          "border-amber-500/30"
        )}
        onClick={() => onAddRecipe?.(bestBounty.cuisine, bestBounty.mealType)}
      >
        <span className="text-2xl">{bestBounty.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{bestBounty.displayName}</span>
            <Badge className={cn("shrink-0", tierInfo.bg, tierInfo.color)}>
              {bestBounty.shadowMarksAvailable} Shadow Marks
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{tierInfo.label}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4">
      {/* Sparkle decoration */}
      <Sparkles className="absolute top-2 right-2 h-5 w-5 text-amber-400/30" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <ChefHat className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-amber-200">Recipe Bounties</h3>
        <button
          onClick={() => setShowExplainer(true)}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Best opportunity highlight */}
      <div className={cn(
        "p-4 rounded-lg mb-3",
        tierInfo.bg,
        "border border-amber-500/30"
      )}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{bestBounty.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg">{bestBounty.displayName}</span>
              <Badge className={cn(tierInfo.bg, tierInfo.color, "border-0 text-sm font-bold")}>
                {bestBounty.shadowMarksAvailable} Shadow Marks
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {tierInfo.label}
              {bestBounty.recipeCount === 0 && " — You'll be the pioneer!"}
            </p>
          </div>
        </div>

        <Button
          onClick={() => onAddRecipe?.(bestBounty.cuisine, bestBounty.mealType)}
          className="w-full mt-3 bg-amber-600 hover:bg-amber-700 gap-2"
        >
          Add a Recipe <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Other opportunities */}
      {bounties.length > 1 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">More Opportunities</p>
          <div className="grid gap-2">
            {bounties.slice(1).map((bounty) => {
              const tier = BOUNTY_TIERS[bounty.shelfStatus];
              return (
                <button
                  key={bounty.id}
                  onClick={() => onAddRecipe?.(bounty.cuisine, bounty.mealType)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                    "hover:bg-white/5 border border-transparent hover:border-white/10"
                  )}
                >
                  <span className="text-lg">{bounty.icon}</span>
                  <span className="flex-1 text-sm truncate">{bounty.displayName}</span>
                  <Badge variant="outline" className={cn("shrink-0 text-xs", tier.color)}>
                    {bounty.shadowMarksAvailable}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Vesting Explainer Dialog */}
      <Dialog open={showExplainer} onOpenChange={setShowExplainer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              What are Shadow Marks?
            </DialogTitle>
            <DialogDescription>
              Think of them as seeds waiting to grow into real Marks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* The "Water Salt" educational story */}
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm leading-relaxed mb-3">
                Think of Shadow Marks like <strong>seeds you plant</strong>. They need sunlight
                (community votes) to grow into real plants (real Marks). Without sunlight, they wither.
                But once they're grown, they're yours forever.
              </p>
              <div className="p-3 rounded bg-black/20 border border-white/10 text-sm italic">
                <span className="not-italic font-semibold text-amber-300">Example:</span> Your recipe
                "Water Salt" earned 50 Shadow Marks for being a French Elegant Dinner recipe.
                If 10 people vote for it within 7 days, those 50 Shadow Marks become 50 real MARKS —
                permanently yours. But if nobody votes for "Water Salt"... well, it withers. 🥀
              </div>
            </div>

            {/* Equal opportunity note */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-sm">
                <strong className="text-emerald-400">Fair for everyone:</strong> Every person who posts
                in the same category tier gets the same Shadow Marks. If 3 people all post to an empty
                category, all 3 get 50 Shadow Marks. The bounty only drops when the shelf fills up.
              </p>
            </div>

            {/* How it works */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                How Vesting Works
              </h4>

              <div className="grid gap-2 text-sm">
                <div className="flex items-start gap-3 p-2 rounded bg-muted/30">
                  <span className="text-lg">🌱</span>
                  <div>
                    <strong>Day 0:</strong> You submit a recipe → earn Shadow Marks
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded bg-muted/30">
                  <span className="text-lg">☀️</span>
                  <div>
                    <strong>Votes come in:</strong> Each vote crystallizes some Shadow → real Marks
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded bg-muted/30">
                  <span className="text-lg">⏰</span>
                  <div>
                    <strong>Day 3+:</strong> Uncrystallized Shadow Marks start to decay (20% every 4 days)
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded bg-muted/30">
                  <span className="text-lg">💎</span>
                  <div>
                    <strong>10 votes:</strong> Fully crystallized — all Shadow Marks become real Marks!
                  </div>
                </div>
              </div>
            </div>

            {/* Bounty tiers */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Bounty Tiers
              </h4>

              <div className="grid gap-1 text-sm">
                {Object.entries(BOUNTY_TIERS).map(([status, tier]) => (
                  tier.marks > 0 && (
                    <div key={status} className={cn("flex items-center justify-between p-2 rounded", tier.bg)}>
                      <span>{tier.label}</span>
                      <Badge className={cn(tier.bg, tier.color, "border-0")}>
                        {tier.marks} Shadow Marks
                      </Badge>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* The why */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                Why This System?
              </h4>
              <p className="text-sm text-muted-foreground">
                We want to reward pioneers who fill empty shelves. But we also need quality —
                so your reward depends on the community actually wanting your recipe.
                Good recipes earn their full reward. "Water Salt" recipes? They wither.
                The community decides what's worth keeping.
              </p>
            </div>

            {/* Escape Velocity — IP Ledger Protection */}
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <h4 className="font-semibold flex items-center gap-2 mb-2 text-rose-300">
                🚀 Escape Velocity: IP Ledger Protection
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                When your recipe reaches <strong className="text-rose-300">100 votes</strong>,
                it achieves "escape velocity" and earns permanent protection:
              </p>
              <ul className="text-sm space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">🔐</span> IP Ledger stamp (SHA-256 hash, immutable record)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">🌶️</span> "Hot Pepper" badge recognition
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">🛡️</span> Portfolio protection (cannot be removed)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">✍️</span> Perpetual creator attribution rights
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400">💰</span> +50 bonus MARKS
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
