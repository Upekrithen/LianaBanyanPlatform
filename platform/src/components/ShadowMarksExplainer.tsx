/**
 * SHADOW MARKS EXPLAINER
 * ======================
 * Educational dialog explaining how Shadow Marks, Recipe Bounties,
 * and Escape Velocity work in The Pantry.
 *
 * Uses InfoFlipCard system with accordion expansion, navigation arrows,
 * and Anchor Beacon cue card dispatch integration.
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  TrendingUp,
  Award,
  Shield,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  ChefHat,
  Flame,
  Target,
  Rocket,
} from 'lucide-react';
import { InfoFlipCard, AnchorBeacon, type InfoSection, type CueCard } from './AnchorBeaconSystem';
import { SHADOW_MARKS_CUE_CARDS } from '@/data/shadowMarksCueCards';

// ─────────────────────────────────────────────────────────
// CUE CARDS (from shadowMarksCueCards.ts)
// ─────────────────────────────────────────────────────────

const cueCards: CueCard[] = SHADOW_MARKS_CUE_CARDS.map(card => ({
  id: card.id,
  title: card.title,
  subtitle: card.subtitle,
  front: card.front,
  back: card.back,
  category: card.category,
  tags: card.tags as unknown as string[],
}));

// ─────────────────────────────────────────────────────────
// INFO SECTIONS
// ─────────────────────────────────────────────────────────

const SHADOW_MARKS_SECTIONS: InfoSection[] = [
  {
    id: 'what-are-shadow-marks',
    title: 'What Are Shadow Marks?',
    icon: <Sparkles className="w-5 h-5 text-primary" />,
    summary: 'Seeds that grow into real Marks',
    content: (
      <div className="space-y-3">
        <p>
          <strong>Shadow Marks</strong> are speculative reputation tokens. Think of them as <em>seeds you plant</em>.
        </p>
        <p>
          They need <strong>sunlight</strong> (community votes) to grow into real plants (real Marks).
          Without sunlight, they wither. But once they're grown, they're yours forever.
        </p>
        <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
          <p className="font-medium">Example: "Water Salt"</p>
          <p className="text-sm mt-1">
            Your recipe "Water Salt" earned 50 Shadow Marks for being a French Elegant Dinner.
            If 10 people vote for it, those 50 become <strong>50 real MARKS</strong> — permanently yours.
          </p>
          <p className="text-sm mt-2 text-muted-foreground">
            But if nobody votes for "Water Salt"... well, it withers. 🥀
          </p>
        </div>
      </div>
    ),
    cueCards: cueCards.filter(c => c.id === 'shadow-marks-intro'),
  },
  {
    id: 'category-bounties',
    title: 'Category Bounties',
    icon: <Target className="w-5 h-5 text-amber-500" />,
    summary: 'Fill empty shelves, earn more',
    content: (
      <div className="space-y-3">
        <p>
          The Pantry rewards you for filling gaps. Empty categories pay the most.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border rounded-lg p-3 text-center bg-amber-500/10">
            <div className="text-2xl font-bold text-amber-600">50</div>
            <div className="text-xs text-muted-foreground">EMPTY (0 recipes)</div>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">30</div>
            <div className="text-xs text-muted-foreground">SPARSE (1-4)</div>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary/70">15</div>
            <div className="text-xs text-muted-foreground">GROWING (5-9)</div>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-muted-foreground">5</div>
            <div className="text-xs text-muted-foreground">ESTABLISHED (10-19)</div>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-900">
          <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <strong>Equal Opportunity:</strong> Everyone in the same tier gets the same reward!
          </p>
        </div>
      </div>
    ),
    cueCards: cueCards.filter(c => c.id === 'category-bounties'),
  },
  {
    id: 'vesting-crystallization',
    title: 'Vesting & Crystallization',
    icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
    summary: 'How votes turn Shadow into Real',
    content: (
      <div className="space-y-3">
        <p>
          Each vote <strong>crystallizes</strong> a portion of your Shadow Marks permanently.
        </p>
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">1 vote</span>
            <span className="text-sm font-medium text-primary">10% crystallized</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">5 votes</span>
            <span className="text-sm font-medium text-primary">50% crystallized</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">10 votes</span>
            <span className="text-sm font-medium text-green-600">100% crystallized ✓</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>Crystallized marks never decay.</strong> Only unvalidated Shadow Marks wither over time.
        </p>
      </div>
    ),
    cueCards: cueCards.filter(c => c.id === 'vesting-decay'),
  },
  {
    id: 'decay-schedule',
    title: 'Decay Schedule',
    icon: <Clock className="w-5 h-5 text-red-400" />,
    summary: 'Use it or lose it',
    content: (
      <div className="space-y-3">
        <p>
          Shadow Marks have a grace period, then decay if not crystallized.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
            <Badge variant="outline">Day 0</Badge>
            <span>Submit recipe → Shadow Marks awarded</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
            <Badge variant="outline">Day 3</Badge>
            <span>Grace period ends, decay begins</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded bg-amber-500/10">
            <Badge variant="outline" className="text-amber-600">Every 4 days</Badge>
            <span>-20% of remaining uncrystallized</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded bg-red-500/10">
            <Badge variant="outline" className="text-red-600">Day 30</Badge>
            <span>Fully expired if unused</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic">
          The community decides what's worth keeping. Good recipes grow. Bad recipes wither.
        </p>
      </div>
    ),
    cueCards: cueCards.filter(c => c.id === 'vesting-decay'),
  },
  {
    id: 'escape-velocity',
    title: 'Escape Velocity',
    icon: <Rocket className="w-5 h-5 text-orange-500" />,
    summary: '100 votes = permanent protection',
    content: (
      <div className="space-y-3">
        <p>
          When your recipe reaches <strong>100 votes</strong>, it achieves <em>escape velocity</em>
          and earns permanent IP Ledger protection.
        </p>
        <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-orange-500 mt-0.5" />
            <span className="text-sm"><strong>SHA-256 Hash</strong> — Permanent, immutable record</span>
          </div>
          <div className="flex items-start gap-2">
            <Flame className="w-4 h-4 text-red-500 mt-0.5" />
            <span className="text-sm"><strong>Hot Pepper Badge</strong> — 🌶️ Visual recognition</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
            <span className="text-sm"><strong>Portfolio Protection</strong> — Cannot be removed by platform</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
            <span className="text-sm"><strong>Perpetual Attribution</strong> — Creator rights locked forever</span>
          </div>
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-amber-500 mt-0.5" />
            <span className="text-sm"><strong>+50 Bonus MARKS</strong> — Immediate reward</span>
          </div>
        </div>
      </div>
    ),
    cueCards: cueCards.filter(c => c.id === 'escape-velocity'),
  },
  {
    id: 'makers-tasters',
    title: 'Makers & Tasters',
    icon: <Users className="w-5 h-5 text-violet-500" />,
    summary: '1:10 ratio — validation liquidity',
    content: (
      <div className="space-y-3">
        <p>
          For the system to work, we need more people <em>using</em> recipes than creating them.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="w-5 h-5 text-amber-600" />
              <span className="font-bold">MAKERS</span>
            </div>
            <p className="text-sm text-muted-foreground">Recipe creators</p>
            <p className="text-lg font-bold mt-2">First 100</p>
            <p className="text-xs">50 Shadow Marks for empty categories</p>
          </div>
          <div className="border rounded-lg p-4 bg-violet-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-violet-600" />
              <span className="font-bold">TASTERS</span>
            </div>
            <p className="text-sm text-muted-foreground">Recipe orderers & voters</p>
            <p className="text-lg font-bold mt-2">First 1,000</p>
            <p className="text-xs">5 MARKS for orders 1-100</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>Voting crystallizes Maker rewards</strong> and builds YOUR reputation too.
        </p>
      </div>
    ),
    cueCards: cueCards.filter(c => c.id === 'makers-tasters'),
  },
  {
    id: 'platform-economics',
    title: 'How Money Flows',
    icon: <DollarSign className="w-5 h-5 text-green-500" />,
    summary: '83.3% to creators and workers, 16.7% to platform',
    content: (
      <div className="space-y-3">
        <p>
          LB takes <strong>16.7% ONCE</strong> per transaction. That's Cost + 20% = 120% of cost.
        </p>
        <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
          <div className="text-muted-foreground mb-2">$15 Meal Order:</div>
          <div className="flex justify-between">
            <span>Chef receives:</span>
            <span className="text-green-600 font-bold">$12.50 (83.3%)</span>
          </div>
          <div className="flex justify-between">
            <span>Platform keeps:</span>
            <span>$2.50 (16.7%)</span>
          </div>
          <div className="border-t mt-2 pt-2 text-xs text-muted-foreground">
            From platform's $2.50:<br />
            → Recipe creator: $0.05-$0.25 per use<br />
            → Delivery worker: 83.3% of fee<br />
            → Operations + initiatives
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Yes, you can buy your own meals.</strong> Platform still functions.
            Same whether buying from yourself or someone else.
          </p>
        </div>
      </div>
    ),
    cueCards: cueCards.filter(c => c.id === 'platform-economics'),
  },
];

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────

interface ShadowMarksExplainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnderstood?: () => void;
  /** Which section to auto-expand */
  autoExpandSection?: string;
}

export function ShadowMarksExplainer({
  open,
  onOpenChange,
  onUnderstood,
  autoExpandSection = 'what-are-shadow-marks',
}: ShadowMarksExplainerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Shadow Marks & Recipe Bounties
            <Badge variant="secondary" className="ml-2">
              The Pantry
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Visual */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-3">How It Works</h3>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                <ChefHat className="w-4 h-4" />
                Post Recipe
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4" />
                Earn Shadow Marks
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1 bg-blue-500/10 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4" />
                Get Votes
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Crystallize to Real MARKS
              </div>
            </div>
          </div>

          {/* Expandable Sections with Navigation */}
          <InfoFlipCard
            sections={SHADOW_MARKS_SECTIONS}
            defaultExpanded={autoExpandSection}
            showNavigation={true}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              I'll Review Later
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                onUnderstood?.();
                onOpenChange(false);
              }}
            >
              Got It — Let's Go!
            </Button>
          </div>

          {/* Master Anchor Beacon for all cards */}
          <div className="border-t pt-4">
            <AnchorBeacon
              cards={cueCards}
              label="Share all Shadow Marks cue cards"
              badge={`${cueCards.length} cards`}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Compact inline version for embedding in other pages
 */
export function ShadowMarksMiniExplainer({ className }: { className?: string }) {
  return (
    <div className={`bg-muted/30 p-4 rounded-lg text-sm space-y-2 ${className || ''}`}>
      <p className="font-medium flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        Shadow Marks
      </p>
      <ol className="space-y-1 text-muted-foreground ml-6 list-decimal">
        <li>Post a recipe in an empty category → earn 50 Shadow Marks</li>
        <li>Get votes → Shadow Marks crystallize into real MARKS</li>
        <li>No votes? They decay after 3 days</li>
        <li>100 votes = Escape Velocity (IP Ledger protection)</li>
      </ol>
    </div>
  );
}

export { SHADOW_MARKS_SECTIONS };
