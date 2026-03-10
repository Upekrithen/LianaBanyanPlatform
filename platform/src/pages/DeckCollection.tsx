/**
 * DECK COLLECTION — Card Binder, Trophy Case, Forging
 * ====================================================
 * View all cards you've collected. Sort by rarity. Store in Castle Keep.
 * Forge new cards. Track collection completion.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Layers, Trophy, Hammer, Star, Lock } from "lucide-react";
import { DeckCard, type DeckCardData, type CardRarity } from "@/components/DeckCard";
import { toast } from "sonner";

const RARITY_ORDER: CardRarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "secret"];

export default function DeckCollection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rarityFilter, setRarityFilter] = useState<CardRarity | "all">("all");

  // All card definitions
  const { data: allCards } = useQuery({
    queryKey: ["all-deck-cards"],
    queryFn: async () => {
      const { data } = await supabase
        .from("deck_cards")
        .select("*")
        .eq("is_active", true)
        .order("rarity");
      return data || [];
    },
  });

  // My collection
  const { data: myCollection } = useQuery({
    queryKey: ["my-deck-collection", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("deck_card_collection")
        .select("*, deck_cards(*)")
        .eq("user_id", user.id)
        .order("acquired_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const collectedIds = new Set(myCollection?.map((c) => (c as any).card_id) || []);
  const totalCards = allCards?.length || 0;
  const collectedCount = collectedIds.size;
  const completionPercent = totalCards > 0 ? (collectedCount / totalCards) * 100 : 0;

  const rarityCounts = RARITY_ORDER.map((r) => ({
    rarity: r,
    total: allCards?.filter((c) => c.rarity === r).length || 0,
    owned: myCollection?.filter((c) => (c as any).deck_cards?.rarity === r).length || 0,
  }));

  const mapToCardData = (item: any): DeckCardData => {
    const card = item.deck_cards || item;
    return {
      id: card.id,
      cardCode: card.card_code,
      name: card.name,
      rarity: card.rarity,
      frontTitle: card.front_title,
      frontSubtitle: card.front_subtitle,
      frontIcon: card.front_icon,
      frontImageUrl: card.front_image_url,
      backTitle: card.back_title,
      backInstructions: card.back_instructions,
      backDestination: card.back_destination,
      backAction: card.back_action,
      borderColor: card.border_color,
      isConsumable: card.is_consumable,
      usesRemaining: item.uses_remaining ?? card.max_uses,
      isInCastleKeep: item.is_in_castle_keep ?? false,
    };
  };

  const handleUseCard = async (card: DeckCardData) => {
    if (card.backDestination) {
      if (card.backDestination.startsWith("/")) {
        navigate(card.backDestination);
      } else {
        window.location.href = card.backDestination;
      }
    } else {
      toast.info(`${card.name} activated!`);
    }
  };

  const handleStoreCard = async (card: DeckCardData) => {
    if (!user) return;
    await supabase
      .from("deck_card_collection")
      .update({ is_in_castle_keep: true })
      .eq("user_id", user.id)
      .eq("card_id", card.id);
    toast.success(`${card.name} stored in Castle Keep permanently!`);
  };

  const filteredCollection = rarityFilter === "all"
    ? myCollection
    : myCollection?.filter((c) => (c as any).deck_cards?.rarity === rarityFilter);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Deck Collection</h1>
          <p className="text-muted-foreground">Your cards. Your power. Tap to flip.</p>
        </div>
      </div>

      {/* Collection Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Collection: {collectedCount} / {totalCards}</span>
            <span className="text-sm text-muted-foreground">{completionPercent.toFixed(0)}%</span>
          </div>
          <Progress value={completionPercent} className="h-3 mb-4" />
          <div className="flex flex-wrap gap-3">
            {rarityCounts.map((rc) => (
              <Badge
                key={rc.rarity}
                variant="outline"
                className="cursor-pointer"
                onClick={() => setRarityFilter(rc.rarity === rarityFilter ? "all" : rc.rarity)}
              >
                {rc.rarity}: {rc.owned}/{rc.total}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="collection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collection">My Cards ({filteredCollection?.length || 0})</TabsTrigger>
          <TabsTrigger value="castle">Castle Keep</TabsTrigger>
          <TabsTrigger value="catalog">Full Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="collection">
          {filteredCollection && filteredCollection.length > 0 ? (
            <div className="flex flex-wrap gap-6 justify-center">
              {filteredCollection.map((item) => (
                <DeckCard
                  key={item.id}
                  card={mapToCardData(item)}
                  onUse={handleUseCard}
                  onStore={handleStoreCard}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No cards yet. Explore the platform to discover and collect them!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="castle">
          {myCollection?.filter((c) => c.is_in_castle_keep).length ? (
            <div className="flex flex-wrap gap-6 justify-center">
              {myCollection.filter((c) => c.is_in_castle_keep).map((item) => (
                <DeckCard key={item.id} card={mapToCardData(item)} onUse={handleUseCard} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Lock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Castle Keep is empty. Store cards here to protect them from consumption.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="catalog">
          <div className="flex flex-wrap gap-6 justify-center">
            {allCards?.map((card) => {
              const owned = collectedIds.has(card.id);
              return (
                <div key={card.id} className={owned ? "" : "opacity-40 grayscale"}>
                  <DeckCard
                    card={mapToCardData(card)}
                    compact
                  />
                  {!owned && (
                    <p className="text-center text-xs text-muted-foreground mt-1">Not found</p>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
