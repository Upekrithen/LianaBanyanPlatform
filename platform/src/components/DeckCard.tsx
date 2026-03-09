/**
 * DECK CARD — CSS Flip Card Component
 * =====================================
 * Front: card art, rarity border glow, title, subtitle, icon
 * Back: instructions, destination, action button
 * Click to flip with 3D perspective animation.
 *
 * Rarity tiers determine border color and glow:
 *   common=silver, uncommon=green, rare=blue, epic=purple,
 *   legendary=gold, mythic=holographic red, secret=black with ?
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Lock, Sparkles } from "lucide-react";

export type CardRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" | "secret";

export interface DeckCardData {
  id: string;
  cardCode: string;
  name: string;
  rarity: CardRarity;
  frontTitle: string;
  frontSubtitle?: string;
  frontIcon?: string;
  frontImageUrl?: string;
  backTitle: string;
  backInstructions: string;
  backDestination?: string;
  backAction?: string;
  borderColor: string;
  isConsumable: boolean;
  usesRemaining?: number;
  isInCastleKeep?: boolean;
}

interface DeckCardProps {
  card: DeckCardData;
  onUse?: (card: DeckCardData) => void;
  onStore?: (card: DeckCardData) => void;
  compact?: boolean;
}

const RARITY_STYLES: Record<CardRarity, { border: string; glow: string; label: string; bg: string }> = {
  common: { border: "border-gray-400", glow: "", label: "Common", bg: "from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" },
  uncommon: { border: "border-green-500", glow: "shadow-green-500/20", label: "Uncommon", bg: "from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900" },
  rare: { border: "border-blue-500", glow: "shadow-blue-500/30", label: "Rare", bg: "from-blue-50 to-sky-100 dark:from-blue-950 dark:to-sky-900" },
  epic: { border: "border-purple-500", glow: "shadow-purple-500/30", label: "Epic", bg: "from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900" },
  legendary: { border: "border-amber-500", glow: "shadow-amber-500/40", label: "Legendary", bg: "from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900" },
  mythic: { border: "border-red-500", glow: "shadow-red-500/50", label: "Mythic", bg: "from-red-50 to-rose-100 dark:from-red-950 dark:to-rose-900" },
  secret: { border: "border-foreground", glow: "shadow-foreground/20", label: "???", bg: "from-background to-muted" },
};

const RARITY_BADGE: Record<CardRarity, string> = {
  common: "bg-gray-400/10 text-gray-500 border-gray-400/20",
  uncommon: "bg-green-500/10 text-green-600 border-green-500/20",
  rare: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  epic: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  legendary: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  mythic: "bg-red-500/10 text-red-600 border-red-500/20",
  secret: "bg-foreground/10 text-foreground border-foreground/20",
};

export function DeckCard({ card, onUse, onStore, compact }: DeckCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const style = RARITY_STYLES[card.rarity];

  const cardWidth = compact ? "w-48" : "w-64";
  const cardHeight = compact ? "h-72" : "h-96";

  return (
    <div
      className={`${cardWidth} ${cardHeight} cursor-pointer`}
      style={{ perspective: "1000px" }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ─── FRONT ─── */}
        <div
          className={`absolute inset-0 rounded-xl border-2 ${style.border} ${style.glow} shadow-lg overflow-hidden bg-gradient-to-br ${style.bg}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex flex-col h-full p-4">
            {/* Rarity badge */}
            <div className="flex justify-between items-start">
              <Badge className={`text-xs ${RARITY_BADGE[card.rarity]}`}>
                {style.label}
              </Badge>
              {card.isInCastleKeep && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" /> Keep
                </Badge>
              )}
            </div>

            {/* Card art / icon area */}
            <div className="flex-1 flex items-center justify-center">
              {card.frontImageUrl ? (
                <img src={card.frontImageUrl} alt={card.name} className="max-h-32 max-w-full object-contain rounded" />
              ) : (
                <div className="text-6xl">
                  {card.frontIcon || (card.rarity === "secret" ? "❓" : "🃏")}
                </div>
              )}
            </div>

            {/* Title area */}
            <div className="text-center space-y-1">
              <h3 className={`font-bold ${compact ? "text-sm" : "text-lg"} text-foreground`}>
                {card.frontTitle}
              </h3>
              {card.frontSubtitle && (
                <p className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground`}>
                  {card.frontSubtitle}
                </p>
              )}
            </div>

            {/* Uses indicator */}
            {card.isConsumable && card.usesRemaining !== undefined && (
              <div className="text-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {card.usesRemaining} use{card.usesRemaining !== 1 ? "s" : ""} left
                </span>
              </div>
            )}

            {/* Tap to flip hint */}
            <p className="text-[10px] text-muted-foreground/50 text-center mt-1">
              tap to flip
            </p>
          </div>
        </div>

        {/* ─── BACK ─── */}
        <div
          className={`absolute inset-0 rounded-xl border-2 ${style.border} ${style.glow} shadow-lg overflow-hidden bg-card`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex flex-col h-full p-4">
            {/* Back header */}
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className={`font-bold ${compact ? "text-sm" : "text-lg"} text-foreground`}>
                {card.backTitle}
              </h3>
            </div>

            {/* Instructions */}
            <div className="flex-1">
              <p className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground leading-relaxed`}>
                {card.backInstructions}
              </p>

              {card.backDestination && (
                <div className="mt-3 p-2 rounded bg-muted/50 text-xs font-mono text-muted-foreground">
                  Goes to: {card.backDestination}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2 mt-3" onClick={(e) => e.stopPropagation()}>
              {onUse && card.usesRemaining !== 0 && (
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => onUse(card)}
                >
                  {card.backAction || "Use Card"}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              )}
              {onStore && !card.isInCastleKeep && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => onStore(card)}
                >
                  <Lock className="w-3 h-3" />
                  Store in Castle Keep
                </Button>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground/50 text-center mt-1">
              tap to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Mini deck card for inline display (e.g., in lists, rewards).
 */
export function MiniDeckCard({ card }: { card: DeckCardData }) {
  const style = RARITY_STYLES[card.rarity];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.border} ${style.glow} bg-gradient-to-r ${style.bg}`}>
      <span className="text-lg">{card.frontIcon || "🃏"}</span>
      <div>
        <span className="text-sm font-medium">{card.name}</span>
        <Badge className={`ml-2 text-[10px] ${RARITY_BADGE[card.rarity]}`}>
          {style.label}
        </Badge>
      </div>
    </div>
  );
}
