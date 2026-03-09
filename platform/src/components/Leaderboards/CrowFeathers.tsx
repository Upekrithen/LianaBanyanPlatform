import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Feather, Trophy, Clock, Target } from "lucide-react";

interface CrowFeather {
  id: number;
  featherNumber: number;
  category: string;
  recordValue: number;
  sessionDurationMinutes: number;
  timeBracket: string;
  earnedAt: Date;
  supersededBy: number | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  golden_keys: "🗝️",
  areas_discovered: "🗺️",
  labyrinth_speed: "🏃",
  conduit_jumps: "🪞",
  friend_words: "📜",
  candles_earned: "🕯️",
  deck_cards_viewed: "🃏",
  beacon_journeys: "📍",
};

const CATEGORY_LABELS: Record<string, string> = {
  golden_keys: "Most Golden Keys",
  areas_discovered: "Most Areas Discovered",
  labyrinth_speed: "Fastest Labyrinth Clear",
  conduit_jumps: "Most Conduit Jumps",
  friend_words: "Most Friend Words",
  candles_earned: "Most Candles Earned",
  deck_cards_viewed: "Most Deck Cards Viewed",
  beacon_journeys: "Most Beacon Journeys",
};

export function CrowFeathersDisplay({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();

  const { data: feathers, isLoading } = useQuery({
    queryKey: ["crow-feathers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("crow_feathers")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((f) => ({
        id: f.id,
        featherNumber: f.feather_number,
        category: f.category,
        recordValue: Number(f.record_value),
        sessionDurationMinutes: f.session_duration_minutes,
        timeBracket: f.time_bracket,
        earnedAt: new Date(f.earned_at),
        supersededBy: f.superseded_by,
      })) as CrowFeather[];
    },
    enabled: !!user,
  });

  const activeFeathers = feathers?.filter((f) => !f.supersededBy) || [];
  const totalFeathers = feathers?.length || 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
        <Feather className="h-5 w-5 text-amber-500" />
        <span className="font-bold">{totalFeathers}</span>
        <span className="text-sm text-muted-foreground">Crow Feathers</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Feather className="h-5 w-5 text-amber-500" />
          Crow Feathers: {totalFeathers}
        </CardTitle>
        <CardDescription>
          "The crow remembers what the ghost forgets."
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading feathers...
          </div>
        ) : activeFeathers.length === 0 ? (
          <div className="text-center py-8">
            <Feather className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-muted-foreground">No feathers earned yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Set a leaderboard record in Ghost World to earn your first feather
            </p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {activeFeathers.map((feather) => (
                <div
                  key={feather.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                >
                  <div className="text-2xl">
                    {CATEGORY_ICONS[feather.category] || "🪶"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        #{feather.featherNumber}
                      </span>
                      <span className="text-sm">
                        {CATEGORY_LABELS[feather.category] || feather.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {feather.recordValue}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {feather.timeBracket}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {feather.earnedAt.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function CrowFeatherBadge({ count }: { count: number }) {
  return (
    <Badge variant="outline" className="gap-1">
      <Feather className="h-3 w-3" />
      {count}
    </Badge>
  );
}

export default CrowFeathersDisplay;
