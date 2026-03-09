/**
 * DISCOVERY BOOKSHELF
 * ====================
 * Progressive disclosure navigation. Replaces the traditional sidebar.
 *
 * - Categories appear as user discovers them (or via gates)
 * - Each category shows 3 card slots across (the viewport)
 * - Slots are chalk-outline dashed borders (transparent center)
 * - Each slot is a CSS flip card: front = chalk outline or placed card,
 *   back = "How to fill this slot" hint
 * - Chevrons scroll through cards in a category (Price Is Right style)
 * - Cards are placed by discovering locations in the platform
 * - Keep tier determines how many categories are visible
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronUp, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── TYPES ───

interface DiscoveryCategory {
  slug: string;
  name: string;
  icon: string;
  sort_order: number;
}

interface DiscoverableCard {
  slug: string;
  category_slug: string;
  name: string;
  description: string;
  icon: string;
  destination_route: string;
  hint_text: string;
  sort_order: number;
}

interface UserDiscovery {
  category_slug: string;
  card_slug: string | null;
}

interface CardPlacement {
  category_slug: string;
  slot_index: number;
  card_slug: string;
}

interface ViewportState {
  [categorySlug: string]: number; // offset (which row of 3 is showing)
}

// ─── CHALK OUTLINE SLOT ───

function ChalkSlot({
  card,
  isDiscovered,
  isPlaced,
  onPlace,
  onClick,
  isNewReveal,
}: {
  card: DiscoverableCard | null;
  isDiscovered: boolean;
  isPlaced: boolean;
  onPlace: () => void;
  onClick: () => void;
  isNewReveal?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    if (isPlaced && card) {
      onClick();
    } else if (isDiscovered && card) {
      onPlace();
    } else {
      setFlipped(!flipped);
    }
  };

  return (
    <div
      className="relative w-full aspect-[3/4] cursor-pointer group"
      style={{ perspective: "600px" }}
      onClick={handleClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT: Chalk outline or placed card */}
        <div
          className="absolute inset-0 rounded-lg flex flex-col items-center justify-center text-center p-2 [backface-visibility:hidden]"
          style={
            isPlaced && card
              ? undefined
              : {
                  border: "2px dashed rgba(255,255,255,0.3)",
                  background: "transparent",
                  animation: isNewReveal ? "chalkDraw 1s ease-out forwards" : undefined,
                }
          }
        >
          {isPlaced && card ? (
            // Placed card — shows the card art
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex flex-col items-center justify-center gap-1 hover:border-primary/60 transition-colors">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-xs font-medium text-foreground leading-tight">
                {card.name}
              </span>
            </div>
          ) : isDiscovered && card ? (
            // Discovered but not placed — glowing chalk outline
            <div className="w-full h-full rounded-lg border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-1 animate-pulse">
              <span className="text-lg opacity-50">{card.icon}</span>
              <span className="text-[10px] text-muted-foreground">
                Ready to place
              </span>
            </div>
          ) : (
            // Empty chalk outline
            <>
              <div className="w-8 h-8 rounded border border-dashed border-white/20 mb-1" />
              <span className="text-[10px] text-white/30">Empty</span>
            </>
          )}
        </div>

        {/* BACK: Hint text */}
        <div
          className="absolute inset-0 rounded-lg bg-card border border-border p-2 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          {card ? (
            <>
              <span className="text-lg mb-1">{card.icon}</span>
              <span className="text-xs font-medium text-foreground mb-1">
                {card.name}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {card.hint_text || card.description}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground">
              Discover more to unlock this slot.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CATEGORY FRAME ───

function CategoryFrame({
  category,
  cards,
  discoveries,
  placements,
  viewportOffset,
  onScroll,
  onNavigate,
  onPlaceCard,
  isNewReveal = false,
}: {
  category: DiscoveryCategory;
  cards: DiscoverableCard[];
  discoveries: Set<string>;
  placements: Map<string, string>; // card_slug -> category_slug
  viewportOffset: number;
  onScroll: (direction: "up" | "down") => void;
  onNavigate: (route: string) => void;
  onPlaceCard: (categorySlug: string) => void;
  isNewReveal?: boolean;
}) {
  const totalRows = Math.ceil(cards.length / 3);
  const startIdx = viewportOffset * 3;
  const visibleCards = cards.slice(startIdx, startIdx + 3);

  // Pad to always show 3 slots
  while (visibleCards.length < 3) {
    visibleCards.push(null as any);
  }

  return (
    <div className="space-y-1">
      {/* Category header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{category.icon}</span>
          <span className="text-xs font-medium text-foreground">
            {category.name}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {cards.filter((c) => discoveries.has(c.slug)).length}/{cards.length}
        </span>
      </div>

      {/* Scroll up */}
      {totalRows > 1 && (
        <button
          onClick={() => onScroll("up")}
          disabled={viewportOffset === 0}
          className="w-full flex justify-center py-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-opacity"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* 3-slot viewport */}
      <div className="grid grid-cols-3 gap-2">
        {visibleCards.map((card, i) => {
          const isDiscovered = card ? discoveries.has(card.slug) : false;
          const isPlaced = card ? placements.has(card.slug) : false;

          return (
            <ChalkSlot
              key={card?.slug || `empty-${i}`}
              card={card}
              isDiscovered={isDiscovered}
              isPlaced={isPlaced}
              onPlace={() => onPlaceCard(category.slug)}
              onClick={() => card && onNavigate(card.destination_route)}
              isNewReveal={isNewReveal}
            />
          );
        })}
      </div>

      {/* Scroll down */}
      {totalRows > 1 && (
        <button
          onClick={() => onScroll("down")}
          disabled={viewportOffset >= totalRows - 1}
          className="w-full flex justify-center py-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20 transition-opacity"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─── MAIN BOOKSHELF ───

export function DiscoveryBookshelf() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<DiscoveryCategory[]>([]);
  const [cards, setCards] = useState<DiscoverableCard[]>([]);
  const [discoveries, setDiscoveries] = useState<Set<string>>(new Set());
  const [discoveredCategories, setDiscoveredCategories] = useState<Set<string>>(new Set(["essentials"]));
  const [placements, setPlacements] = useState<Map<string, string>>(new Map());
  const [viewports, setViewports] = useState<ViewportState>({});
  const [maxCategories, setMaxCategories] = useState(3); // default = Closet tier
  const [placementTarget, setPlacementTarget] = useState<string | null>(null); // category_slug for placement dialog
  const [newReveal, setNewReveal] = useState<string | null>(null); // category being animated

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    // Load categories
    const { data: catData } = await supabase
      .from("discovery_categories")
      .select("slug, name, icon, sort_order")
      .order("sort_order");
    if (catData) setCategories(catData);

    // Load all discoverable cards
    const { data: cardData } = await supabase
      .from("discoverable_cards")
      .select("slug, category_slug, name, description, icon, destination_route, hint_text, sort_order")
      .order("sort_order");
    if (cardData) setCards(cardData);

    if (!user) return;

    // Load user discoveries
    const { data: discData } = await supabase
      .from("user_discovery_state")
      .select("category_slug, card_slug")
      .eq("user_id", user.id);

    if (discData) {
      const cardSlugs = new Set<string>();
      const catSlugs = new Set<string>(["essentials"]);
      for (const d of discData) {
        if (d.card_slug) cardSlugs.add(d.card_slug);
        catSlugs.add(d.category_slug);
      }
      setDiscoveries(cardSlugs);
      setDiscoveredCategories(catSlugs);
    }

    // Load placements
    const { data: placData } = await supabase
      .from("user_card_placements")
      .select("category_slug, slot_index, card_slug")
      .eq("user_id", user.id);

    if (placData) {
      const map = new Map<string, string>();
      for (const p of placData) {
        map.set(p.card_slug, p.category_slug);
      }
      setPlacements(map);
    }

    // Determine Keep tier
    // For now, default to Closet (3 categories) for members
    setMaxCategories(user ? 3 : 1);
  };

  const handleScroll = (categorySlug: string, direction: "up" | "down") => {
    setViewports((prev) => {
      const current = prev[categorySlug] || 0;
      const catCards = cards.filter((c) => c.category_slug === categorySlug);
      const maxOffset = Math.ceil(catCards.length / 3) - 1;
      const next =
        direction === "up"
          ? Math.max(0, current - 1)
          : Math.min(maxOffset, current + 1);
      return { ...prev, [categorySlug]: next };
    });
  };

  // Get cards that are discovered but not yet placed for a category
  const getPlaceableCards = (categorySlug: string): DiscoverableCard[] => {
    return cards.filter(
      (c) =>
        c.category_slug === categorySlug &&
        discoveries.has(c.slug) &&
        !placements.has(c.slug)
    );
  };

  // Place a card in a slot
  const placeCard = async (card: DiscoverableCard) => {
    if (!user || !placementTarget) return;

    // Find next available slot index
    const catCards = cards.filter((c) => c.category_slug === placementTarget);
    const usedSlots = new Set(
      Array.from(placements.entries())
        .filter(([, cat]) => cat === placementTarget)
        .map(([slug]) => catCards.findIndex((c) => c.slug === slug))
    );
    let slotIdx = 0;
    while (usedSlots.has(slotIdx)) slotIdx++;

    const { error } = await supabase.from("user_card_placements").upsert({
      user_id: user.id,
      category_slug: placementTarget,
      slot_index: slotIdx,
      card_slug: card.slug,
    }, { onConflict: "user_id,card_slug" });

    if (!error) {
      setPlacements((prev) => new Map([...prev, [card.slug, placementTarget]]));
      toast.success(`Placed ${card.name}!`);
    }
    setPlacementTarget(null);
  };

  // Filter to discovered categories, limited by Keep tier
  const visibleCategories = categories
    .filter((c) => discoveredCategories.has(c.slug))
    .slice(0, maxCategories);

  if (categories.length === 0) return null;

  return (
    <div className="w-full space-y-4 p-3">
      {/* Bookshelf title */}
      <div className="text-center">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Your Bookshelf
        </span>
      </div>

      {/* Category frames */}
      {visibleCategories.map((category) => {
        const catCards = cards.filter(
          (c) => c.category_slug === category.slug
        );
        return (
          <CategoryFrame
            key={category.slug}
            category={category}
            cards={catCards}
            discoveries={discoveries}
            placements={placements}
            viewportOffset={viewports[category.slug] || 0}
            onScroll={(dir) => handleScroll(category.slug, dir)}
            onNavigate={(route) => navigate(route)}
            onPlaceCard={(catSlug) => setPlacementTarget(catSlug)}
            isNewReveal={newReveal === category.slug}
          />
        );
      })}

      {/* Undiscovered hint */}
      {visibleCategories.length < categories.length && (
        <div className="text-center py-2">
          <span className="text-[10px] text-muted-foreground/50">
            {categories.length - visibleCategories.length} more to discover...
          </span>
        </div>
      )}

      {/* Card Placement Dialog */}
      <Dialog open={!!placementTarget} onOpenChange={() => setPlacementTarget(null)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm">Place a Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {placementTarget && getPlaceableCards(placementTarget).map((card) => (
              <button
                key={card.slug}
                onClick={() => placeCard(card)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <span className="text-lg">{card.icon}</span>
                <div>
                  <div className="text-sm font-medium">{card.name}</div>
                  <div className="text-xs text-muted-foreground">{card.description}</div>
                </div>
              </button>
            ))}
            {placementTarget && getPlaceableCards(placementTarget).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No discovered cards available for this category. Keep exploring!
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
