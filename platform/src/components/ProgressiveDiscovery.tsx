/**
 * PROGRESSIVE DISCOVERY — Landing Page System
 * ============================================
 * UX innovation for gradual content reveal based on user engagement.
 *
 * Features:
 * - Chalk-outline card slots (empty placeholders that fill in)
 * - Spinning carousel viewports (rotating content panels)
 * - Discovery gates (content unlocked by actions)
 * - Keep size tiers (Bronze → Diamond based on engagement)
 * - CSS Zen Garden theming
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Lock, Unlock, Eye, EyeOff, Sparkles, ChevronLeft, ChevronRight,
  Star, Crown, Shield, Gem, Zap, Gift, ArrowRight, Check
} from "lucide-react";
import "./ProgressiveDiscovery.css";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface DiscoveryCard {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  unlockCondition?: string;
  isUnlocked: boolean;
  content?: React.ReactNode;
}

interface KeepTier {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  icon: React.ReactNode;
  benefits: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEEP TIERS
// ═══════════════════════════════════════════════════════════════════════════════

const KEEP_TIERS: KeepTier[] = [
  {
    name: "Bronze Keep",
    minPoints: 0,
    maxPoints: 100,
    color: "from-orange-600/20 to-amber-700/20",
    icon: <Shield className="h-5 w-5 text-orange-600" />,
    benefits: ["Basic access", "Community forums", "Public content"],
  },
  {
    name: "Silver Keep",
    minPoints: 101,
    maxPoints: 500,
    color: "from-gray-400/20 to-slate-500/20",
    icon: <Star className="h-5 w-5 text-gray-500" />,
    benefits: ["Extended access", "Priority support", "Early announcements"],
  },
  {
    name: "Gold Keep",
    minPoints: 501,
    maxPoints: 2000,
    color: "from-yellow-500/20 to-amber-500/20",
    icon: <Crown className="h-5 w-5 text-yellow-600" />,
    benefits: ["Full access", "Voting rights", "Exclusive content"],
  },
  {
    name: "Platinum Keep",
    minPoints: 2001,
    maxPoints: 10000,
    color: "from-slate-300/20 to-gray-400/20",
    icon: <Gem className="h-5 w-5 text-slate-400" />,
    benefits: ["Premium access", "Direct founder access", "Beta features"],
  },
  {
    name: "Diamond Keep",
    minPoints: 10001,
    maxPoints: Infinity,
    color: "from-purple-400/20 to-pink-400/20",
    icon: <Sparkles className="h-5 w-5 text-purple-500" />,
    benefits: ["Unlimited access", "Governance council", "Joules allocation"],
  },
];

function getKeepTier(points: number): KeepTier {
  return KEEP_TIERS.find(t => points >= t.minPoints && points <= t.maxPoints) || KEEP_TIERS[0];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHALK OUTLINE CARD SLOT
// ═══════════════════════════════════════════════════════════════════════════════

interface ChalkOutlineSlotProps {
  card: DiscoveryCard;
  onUnlock?: () => void;
  className?: string;
}

export function ChalkOutlineSlot({ card, onUnlock, className }: ChalkOutlineSlotProps) {
  const [isRevealing, setIsRevealing] = useState(false);

  const handleReveal = () => {
    if (!card.isUnlocked) return;
    setIsRevealing(true);
  };

  return (
    <div
      className={cn(
        "chalk-outline-slot",
        card.isUnlocked ? "chalk-outline-slot--unlocked" : "chalk-outline-slot--locked",
        isRevealing && "chalk-outline-slot--revealing",
        className
      )}
      onClick={handleReveal}
    >
      {card.isUnlocked ? (
        <Card className="h-full bg-gradient-to-br from-background to-muted/50 border-2 border-primary/30 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              {card.icon}
              {card.title}
            </CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
          {card.content && (
            <CardContent>{card.content}</CardContent>
          )}
        </Card>
      ) : (
        <div className="chalk-outline-slot__placeholder">
          <div className="chalk-outline-slot__dashed-border">
            <Lock className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground/70 mt-2">{card.title}</p>
            {card.unlockCondition && (
              <p className="text-xs text-muted-foreground/50 mt-1">
                {card.unlockCondition}
              </p>
            )}
            {onUnlock && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 opacity-70 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnlock();
                }}
              >
                <Unlock className="h-4 w-4 mr-1" />
                Unlock
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPINNING CAROUSEL VIEWPORT
// ═══════════════════════════════════════════════════════════════════════════════

interface CarouselViewportProps {
  items: React.ReactNode[];
  autoRotate?: boolean;
  rotateInterval?: number;
  className?: string;
}

export function CarouselViewport({
  items,
  autoRotate = true,
  rotateInterval = 5000,
  className,
}: CarouselViewportProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoRotate && items.length > 1) {
      intervalRef.current = setInterval(() => {
        goToNext();
      }, rotateInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRotate, rotateInterval, items.length]);

  const goToNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToPrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      setIsAnimating(false);
    }, 300);
  };

  const goToIndex = (index: number) => {
    if (index === currentIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className={cn("carousel-viewport", className)}>
      <div className="carousel-viewport__container">
        {/* Navigation arrows */}
        <button
          className="carousel-viewport__nav carousel-viewport__nav--prev"
          onClick={goToPrev}
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Content area */}
        <div className="carousel-viewport__content">
          <div
            className={cn(
              "carousel-viewport__item",
              isAnimating && "carousel-viewport__item--animating"
            )}
          >
            {items[currentIndex]}
          </div>
        </div>

        <button
          className="carousel-viewport__nav carousel-viewport__nav--next"
          onClick={goToNext}
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="carousel-viewport__dots">
        {items.map((_, index) => (
          <button
            key={index}
            className={cn(
              "carousel-viewport__dot",
              index === currentIndex && "carousel-viewport__dot--active"
            )}
            onClick={() => goToIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISCOVERY GATE
// ═══════════════════════════════════════════════════════════════════════════════

interface DiscoveryGateProps {
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockAction?: string;
  onUnlock?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function DiscoveryGate({
  title,
  description,
  isUnlocked,
  unlockAction,
  onUnlock,
  children,
  className,
}: DiscoveryGateProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleUnlock = () => {
    if (onUnlock) {
      setIsOpening(true);
      setTimeout(() => {
        onUnlock();
        setIsOpening(false);
      }, 800);
    }
  };

  return (
    <div className={cn("discovery-gate", className)}>
      {isUnlocked ? (
        <div className="discovery-gate__content discovery-gate__content--open">
          {children}
        </div>
      ) : (
        <div className={cn(
          "discovery-gate__barrier",
          isOpening && "discovery-gate__barrier--opening"
        )}>
          <div className="discovery-gate__lock">
            <div className="discovery-gate__lock-icon">
              {isOpening ? (
                <Unlock className="h-12 w-12 text-primary animate-pulse" />
              ) : (
                <Lock className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-xl font-bold mt-4">{title}</h3>
            <p className="text-muted-foreground mt-2 max-w-md text-center">
              {description}
            </p>
            {unlockAction && onUnlock && (
              <Button
                className="mt-4 gap-2"
                onClick={handleUnlock}
                disabled={isOpening}
              >
                <Zap className="h-4 w-4" />
                {unlockAction}
              </Button>
            )}
          </div>

          {/* Blurred preview */}
          <div className="discovery-gate__preview">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEEP SIZE DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════

interface KeepSizeDisplayProps {
  points: number;
  showProgress?: boolean;
  compact?: boolean;
  className?: string;
}

export function KeepSizeDisplay({
  points,
  showProgress = true,
  compact = false,
  className,
}: KeepSizeDisplayProps) {
  const tier = getKeepTier(points);
  const nextTier = KEEP_TIERS.find(t => t.minPoints > points);
  const progressToNext = nextTier
    ? ((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100
    : 100;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {tier.icon}
        <span className="font-medium">{tier.name}</span>
        <Badge variant="outline">{points.toLocaleString()} pts</Badge>
      </div>
    );
  }

  return (
    <Card className={cn(`bg-gradient-to-br ${tier.color}`, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          {tier.icon}
          {tier.name}
        </CardTitle>
        <CardDescription>
          {points.toLocaleString()} discovery points
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress to next tier */}
        {showProgress && nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextTier.name}</span>
              <span>{nextTier.minPoints - points} pts needed</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        {/* Benefits */}
        <div>
          <h4 className="text-sm font-medium mb-2">Your Benefits</h4>
          <ul className="space-y-1">
            {tier.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Next tier preview */}
        {nextTier && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span>Next: {nextTier.name}</span>
              <span className="ml-auto">{nextTier.benefits[0]}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESSIVE DISCOVERY GRID
// ═══════════════════════════════════════════════════════════════════════════════

interface ProgressiveDiscoveryGridProps {
  cards: DiscoveryCard[];
  columns?: 2 | 3 | 4;
  onCardUnlock?: (cardId: string) => void;
  className?: string;
}

export function ProgressiveDiscoveryGrid({
  cards,
  columns = 3,
  onCardUnlock,
  className,
}: ProgressiveDiscoveryGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  const unlockedCount = cards.filter(c => c.isUnlocked).length;
  const totalCount = cards.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {unlockedCount} of {totalCount} discovered
          </span>
        </div>
        <Progress value={(unlockedCount / totalCount) * 100} className="w-32 h-2" />
      </div>

      {/* Card grid */}
      <div className={cn("grid gap-4", gridCols[columns])}>
        {cards.map((card) => (
          <ChalkOutlineSlot
            key={card.id}
            card={card}
            onUnlock={onCardUnlock ? () => onCardUnlock(card.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default {
  ChalkOutlineSlot,
  CarouselViewport,
  DiscoveryGate,
  KeepSizeDisplay,
  ProgressiveDiscoveryGrid,
};
