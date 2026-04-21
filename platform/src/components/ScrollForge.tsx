/**
 * SCROLL FORGE — Convert Scrolls to Deck Cards
 * =============================================
 * "The scroll is the journey. The Deck Card is the destination.
 *  But you can't arrive without traveling."
 *
 * UI for:
 * - Viewing available scrolls
 * - Sealing scrolls (100% read + Of Value note)
 * - Selecting scrolls to forge into Deck Card frames
 * - Tracking forge progress
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scroll, Hammer, Lock, Unlock, Star, Check,
  ChevronRight, Sparkles, BookOpen, Flame
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  type TreasureScroll,
  type DeckCardForge,
  type FrameSide,
  type FrameTier,
  type BeaconColor,
  getScrolls,
  sealScroll,
  canSealScroll,
  getForges,
  getOrCreateForge,
  unlockFrame,
  getForgeProgress,
  calculateScrollValue,
  getRecommendedCards,
  FRAME_COLOR_REQUIREMENTS,
  TIER_REQUIREMENTS,
} from "@/lib/scrollToDeckCard";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const BEACON_COLORS: Record<BeaconColor, { name: string; hex: string; meaning: string }> = {
  green: { name: 'Return', hex: '#22c55e', meaning: 'I want to come back' },
  blue: { name: 'Important', hex: '#3b82f6', meaning: 'Key information' },
  yellow: { name: 'Decision', hex: '#eab308', meaning: 'Major fork / caution' },
  red: { name: 'Blocked', hex: '#ef4444', meaning: 'Need help to proceed' },
  purple: { name: 'Complete', hex: '#a855f7', meaning: 'Fully explored' },
  orange: { name: 'Custom', hex: '#f97316', meaning: 'Special purpose' },
  gold: { name: 'Of Value', hex: '#ffd700', meaning: 'Worth sharing' },
};

const FRAME_LABELS: Record<FrameSide, { label: string; description: string }> = {
  front: { label: 'Front Face', description: 'What this card IS' },
  back: { label: 'Back Face', description: 'Key information' },
  left: { label: 'Left Edge', description: 'Trade-offs & considerations' },
  right: { label: 'Right Edge', description: 'Related resources' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ScrollCardProps {
  scroll: TreasureScroll;
  onSeal?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
}

function ScrollCard({ scroll, onSeal, onSelect, isSelected, showActions = true }: ScrollCardProps) {
  const { canSeal, reason } = canSealScroll(scroll);
  const value = calculateScrollValue(scroll);

  // Get dominant color
  const colorCounts = scroll.anchors.reduce((acc, anchor) => {
    acc[anchor.color] = (acc[anchor.color] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dominantColor = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] as BeaconColor || 'blue';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-primary' : ''
        } ${scroll.isSealed ? 'bg-amber-500/5 border-amber-500/30' : ''}`}
        onClick={onSelect}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Scroll className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base">{scroll.name}</CardTitle>
            </div>
            {scroll.isSealed && (
              <Badge className="bg-amber-500/20 text-amber-600">
                <Lock className="h-3 w-3 mr-1" />
                Sealed
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {scroll.pageTitle} • {scroll.anchors.length} anchors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Color breakdown */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(colorCounts).map(([color, count]) => (
              <Badge
                key={color}
                variant="outline"
                className="text-xs"
                style={{ borderColor: BEACON_COLORS[color as BeaconColor]?.hex }}
              >
                <span
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: BEACON_COLORS[color as BeaconColor]?.hex }}
                />
                {count}
              </Badge>
            ))}
          </div>

          {/* Read progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Read Progress</span>
              <span className={scroll.readProgress >= 100 ? 'text-green-500 font-medium' : ''}>
                {scroll.readProgress}%
              </span>
            </div>
            <Progress value={scroll.readProgress} className="h-1.5" />
          </div>

          {/* Value */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Scroll Value</span>
            <span className="font-medium flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              {value}
            </span>
          </div>

          {/* Actions */}
          {showActions && !scroll.isSealed && (
            <div className="pt-2">
              <Button
                size="sm"
                variant={canSeal ? "default" : "outline"}
                className="w-full gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (canSeal && onSeal) onSeal();
                }}
                disabled={!canSeal}
              >
                {canSeal ? (
                  <>
                    <Lock className="h-3 w-3" />
                    Seal Scroll
                  </>
                ) : (
                  <span className="text-xs truncate">{reason}</span>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORGE PROGRESS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ForgeProgressProps {
  forge: DeckCardForge;
  onUnlockFrame: (side: FrameSide) => void;
}

function ForgeProgress({ forge, onUnlockFrame }: ForgeProgressProps) {
  const progress = getForgeProgress(forge);

  return (
    <Card className={forge.isComplete ? 'border-amber-500 bg-amber-500/5' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="h-5 w-5 text-orange-500" />
            <CardTitle>{forge.cardName}</CardTitle>
          </div>
          {forge.isComplete && (
            <Badge className="bg-amber-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Complete!
            </Badge>
          )}
        </div>
        <CardDescription>
          {progress.framesUnlocked}/{progress.totalFrames} frames unlocked
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress.percentComplete} className="h-2" />

        <div className="grid grid-cols-2 gap-3">
          {(['front', 'back', 'left', 'right'] as FrameSide[]).map(side => {
            const frame = forge.frames[side];
            const colorInfo = BEACON_COLORS[frame.scrollColorRequired];
            const frameInfo = FRAME_LABELS[side];

            return (
              <div
                key={side}
                className={`p-3 rounded-lg border transition-all ${
                  frame.isUnlocked
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'hover:border-primary cursor-pointer'
                }`}
                onClick={() => !frame.isUnlocked && onUnlockFrame(side)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{frameInfo.label}</span>
                  {frame.isUnlocked ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Unlock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{frameInfo.description}</p>
                <div className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colorInfo.hex }}
                  />
                  <span className="text-xs">{colorInfo.name} scrolls</span>
                </div>
                {!frame.isUnlocked && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Need {frame.scrollsRequired} scrolls
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCROLL FORGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ScrollForge() {
  const [scrolls, setScrolls] = useState<TreasureScroll[]>([]);
  const [forges, setForges] = useState<DeckCardForge[]>([]);
  const [selectedScrolls, setSelectedScrolls] = useState<string[]>([]);
  const [forgeDialogOpen, setForgeDialogOpen] = useState(false);
  const [targetFrame, setTargetFrame] = useState<{ cardId: string; side: FrameSide } | null>(null);

  // Load data
  useEffect(() => {
    setScrolls(getScrolls());
    setForges(getForges());
  }, []);

  const handleSealScroll = (scrollId: string) => {
    const sealed = sealScroll(scrollId);
    if (sealed) {
      toast.success('Scroll sealed! It can now be used in enhanced forges.');
      setScrolls(getScrolls());
    }
  };

  const toggleScrollSelection = (scrollId: string) => {
    setSelectedScrolls(prev =>
      prev.includes(scrollId)
        ? prev.filter(id => id !== scrollId)
        : [...prev, scrollId]
    );
  };

  const handleOpenForgeDialog = (side: FrameSide, cardId: string = 'new-card') => {
    setTargetFrame({ cardId, side });
    setSelectedScrolls([]);
    setForgeDialogOpen(true);
  };

  const handleForge = () => {
    if (!targetFrame || selectedScrolls.length === 0) return;

    // Determine tier based on selected scrolls
    const sealedCount = selectedScrolls.filter(id =>
      scrolls.find(s => s.id === id)?.isSealed
    ).length;

    let tier: FrameTier = 'basic';
    if (selectedScrolls.length >= 9 && sealedCount >= 3) {
      tier = 'master';
    } else if (selectedScrolls.length >= 5 && sealedCount >= 1) {
      tier = 'enhanced';
    }

    // Get or create forge
    const forge = getOrCreateForge(targetFrame.cardId, 'Custom Deck Card');

    // Attempt to unlock frame
    const result = unlockFrame(targetFrame.cardId, targetFrame.side, tier, selectedScrolls);

    if (result) {
      toast.success(`${FRAME_LABELS[targetFrame.side].label} unlocked at ${tier} tier!`);
      setForges(getForges());
      setScrolls(getScrolls());
      setForgeDialogOpen(false);
      setSelectedScrolls([]);
    } else {
      toast.error('Could not unlock frame. Check scroll requirements.');
    }
  };

  const recommendations = getRecommendedCards(scrolls);
  const availableScrolls = scrolls.filter(s => !s.usedInForge);
  const usedScrolls = scrolls.filter(s => s.usedInForge);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Flame className="h-8 w-8 text-orange-500" />
        <div>
          <h1 className="text-3xl font-bold">Scroll Forge</h1>
          <p className="text-muted-foreground">
            Combine scrolls to create Deck Cards. Knowledge becomes action.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Scroll className="h-6 w-6 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{availableScrolls.length}</p>
            <p className="text-sm text-muted-foreground">Available Scrolls</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Lock className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="text-2xl font-bold">{scrolls.filter(s => s.isSealed).length}</p>
            <p className="text-sm text-muted-foreground">Sealed Scrolls</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Hammer className="h-6 w-6 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{forges.length}</p>
            <p className="text-sm text-muted-foreground">Active Forges</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-6 w-6 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{forges.filter(f => f.isComplete).length}</p>
            <p className="text-sm text-muted-foreground">Completed Cards</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.some(r => r.canUnlockBasic) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Ready to Forge!
            </CardTitle>
            <CardDescription>
              You have enough scrolls to unlock these frames
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {recommendations.filter(r => r.canUnlockBasic).map(rec => (
                <Button
                  key={rec.side}
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleOpenForgeDialog(rec.side)}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: BEACON_COLORS[rec.color].hex }}
                  />
                  {FRAME_LABELS[rec.side].label}
                  <Badge variant="secondary" className="ml-1">
                    {rec.availableScrolls} scrolls
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="scrolls" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scrolls">
            My Scrolls ({availableScrolls.length})
          </TabsTrigger>
          <TabsTrigger value="forges">
            Active Forges ({forges.length})
          </TabsTrigger>
          <TabsTrigger value="used">
            Used Scrolls ({usedScrolls.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scrolls">
          {availableScrolls.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableScrolls.map(scroll => (
                <ScrollCard
                  key={scroll.id}
                  scroll={scroll}
                  onSeal={() => handleSealScroll(scroll.id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Scroll className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No scrolls yet. Create Treasure Map Scrolls using the Lantern beacon system!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="forges">
          {forges.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {forges.map(forge => (
                <ForgeProgress
                  key={forge.cardId}
                  forge={forge}
                  onUnlockFrame={(side) => handleOpenForgeDialog(side, forge.cardId)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Hammer className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No active forges. Collect scrolls and start forging Deck Cards!</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleOpenForgeDialog('front')}
                >
                  Start New Forge
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="used">
          {usedScrolls.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usedScrolls.map(scroll => (
                <ScrollCard
                  key={scroll.id}
                  scroll={scroll}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No scrolls used yet. Forge scrolls into Deck Cards to see them here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Forge Dialog */}
      <Dialog open={forgeDialogOpen} onOpenChange={setForgeDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hammer className="h-5 w-5 text-orange-500" />
              Forge {targetFrame ? FRAME_LABELS[targetFrame.side].label : 'Frame'}
            </DialogTitle>
            <DialogDescription>
              Select scrolls to forge into this frame.
              {targetFrame && (
                <span className="block mt-1">
                  Requires <strong>{BEACON_COLORS[FRAME_COLOR_REQUIREMENTS[targetFrame.side]].name}</strong> scrolls.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Tier requirements */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 rounded bg-muted/50">
                <p className="font-medium">Basic</p>
                <p className="text-xs text-muted-foreground">3 scrolls</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="font-medium">Enhanced</p>
                <p className="text-xs text-muted-foreground">5 scrolls + 1 sealed</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="font-medium">Master</p>
                <p className="text-xs text-muted-foreground">9 scrolls + 3 sealed</p>
              </div>
            </div>

            {/* Scroll selection */}
            <div className="grid grid-cols-2 gap-3">
              {availableScrolls
                .filter(s => targetFrame && s.anchors.some(a =>
                  a.color === FRAME_COLOR_REQUIREMENTS[targetFrame.side]
                ))
                .map(scroll => (
                  <ScrollCard
                    key={scroll.id}
                    scroll={scroll}
                    isSelected={selectedScrolls.includes(scroll.id)}
                    onSelect={() => toggleScrollSelection(scroll.id)}
                    showActions={false}
                  />
                ))}
            </div>

            {availableScrolls.filter(s => targetFrame && s.anchors.some(a =>
              a.color === FRAME_COLOR_REQUIREMENTS[targetFrame.side]
            )).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No matching scrolls available. Create scrolls with{' '}
                {targetFrame && BEACON_COLORS[FRAME_COLOR_REQUIREMENTS[targetFrame.side]].name}{' '}
                beacons to forge this frame.
              </p>
            )}
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">
                {selectedScrolls.length} scrolls selected
                {selectedScrolls.filter(id => scrolls.find(s => s.id === id)?.isSealed).length > 0 && (
                  <span className="ml-2">
                    ({selectedScrolls.filter(id => scrolls.find(s => s.id === id)?.isSealed).length} sealed)
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setForgeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleForge}
                  disabled={selectedScrolls.length < 3}
                  className="gap-2"
                >
                  <Flame className="h-4 w-4" />
                  Forge Frame
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ScrollForge;
