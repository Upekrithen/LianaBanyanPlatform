import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ghost, Trophy, Clock, Feather } from "lucide-react";

interface LeaderboardEntry {
  id: number;
  category: string;
  timeBracket: string;
  username: string;
  recordValue: number;
  sessionDurationMinutes: number;
  achievedAt: Date;
  crowFeatherId: number | null;
}

const TIME_BRACKETS = [
  "Under 15 minutes",
  "15-30 minutes",
  "30 min - 1 hour",
  "1-2 hours",
  "2-3 hours",
  "3-4 hours",
  "4-6 hours",
  "6-8 hours",
  "8-10 hours",
  "10-12 hours",
];

const CATEGORIES = [
  { id: "golden_keys", label: "Golden Keys", icon: "🗝️" },
  { id: "areas_discovered", label: "Areas Discovered", icon: "🗺️" },
  { id: "labyrinth_speed", label: "Labyrinth Speed", icon: "🏃" },
  { id: "conduit_jumps", label: "Conduit Jumps", icon: "🪞" },
  { id: "friend_words", label: "Friend Words", icon: "📜" },
  { id: "candles_earned", label: "Candles Earned", icon: "🕯️" },
  { id: "deck_cards_viewed", label: "Deck Cards", icon: "🃏" },
  { id: "beacon_journeys", label: "Beacon Journeys", icon: "📍" },
];

export function GhostLeaderboard() {
  const [selectedCategory, setSelectedCategory] = useState("golden_keys");
  const [selectedBracket, setSelectedBracket] = useState("all");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["ghost-leaderboard", selectedCategory, selectedBracket],
    queryFn: async () => {
      let query = supabase
        .from("ghost_leaderboard")
        .select("*")
        .eq("category", selectedCategory)
        .order("record_value", { ascending: selectedCategory === "labyrinth_speed" });

      if (selectedBracket !== "all") {
        query = query.eq("time_bracket", selectedBracket);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      return (data || []).map((e) => ({
        id: e.id,
        category: e.category,
        timeBracket: e.time_bracket,
        username: e.username,
        recordValue: Number(e.record_value),
        sessionDurationMinutes: e.session_duration_minutes,
        achievedAt: new Date(e.achieved_at),
        crowFeatherId: e.crow_feather_id,
      })) as LeaderboardEntry[];
    },
  });

  const categoryConfig = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ghost className="h-5 w-5 text-purple-400" />
          Ghost World Leaderboards
        </CardTitle>
        <CardDescription>
          Speed • Discovery • Skill — Earn Crow Feathers for records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBracket} onValueChange={setSelectedBracket}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Time Bracket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time Brackets</SelectItem>
              {TIME_BRACKETS.map((bracket) => (
                <SelectItem key={bracket} value={bracket}>
                  {bracket}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryConfig?.icon}</span>
            <div>
              <div className="font-medium">{categoryConfig?.label}</div>
              <div className="text-xs text-muted-foreground">
                {selectedBracket === "all" ? "All time brackets" : selectedBracket}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading leaderboard...
          </div>
        ) : entries?.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-muted-foreground">No records yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Be the first to set a record in this category!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {entries?.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                >
                  <div className="w-8 text-center">
                    {index === 0 ? (
                      <span className="text-2xl">🥇</span>
                    ) : index === 1 ? (
                      <span className="text-2xl">🥈</span>
                    ) : index === 2 ? (
                      <span className="text-2xl">🥉</span>
                    ) : (
                      <span className="text-lg text-muted-foreground">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.username}</span>
                      {entry.crowFeatherId && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Feather className="h-3 w-3" />
                          Record
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{entry.timeBracket}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {entry.sessionDurationMinutes}m
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {selectedCategory === "labyrinth_speed"
                        ? formatTime(entry.recordValue)
                        : entry.recordValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.achievedAt.toLocaleDateString()}
                    </div>
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

export default GhostLeaderboard;
