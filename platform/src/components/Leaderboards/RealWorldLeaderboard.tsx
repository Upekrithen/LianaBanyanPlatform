import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Star, Clock, Heart, Users, TrendingUp, Crown } from "lucide-react";

interface RealWorldEntry {
  id: number;
  category: string;
  username: string;
  currentValue: number;
  periodType: string;
  updatedAt: Date;
  rank: number;
}

const CATEGORIES = [
  { id: "five_star_deliveries", label: "5-Star Deliveries", icon: Star, color: "text-yellow-400" },
  { id: "on_time_rate", label: "On-Time Rate", icon: Clock, color: "text-green-400" },
  { id: "gratitude_received", label: "Gratitude Marks", icon: Heart, color: "text-pink-400" },
  { id: "collaboration_score", label: "Collaboration", icon: Users, color: "text-blue-400" },
  { id: "consistency_streak", label: "Consistency Streak", icon: TrendingUp, color: "text-purple-400" },
  { id: "guild_ranking", label: "Guild Rankings", icon: Crown, color: "text-amber-400" },
];

export function RealWorldLeaderboard() {
  const [selectedCategory, setSelectedCategory] = useState("five_star_deliveries");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["real-leaderboard", selectedCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("real_leaderboard")
        .select("*")
        .eq("category", selectedCategory)
        .order("rank", { ascending: true })
        .limit(50);

      if (error) throw error;

      return (data || []).map((e) => ({
        id: e.id,
        category: e.category,
        username: e.username,
        currentValue: Number(e.current_value),
        periodType: e.period_type,
        updatedAt: new Date(e.updated_at),
        rank: e.rank,
      })) as RealWorldEntry[];
    },
  });

  const categoryConfig = CATEGORIES.find((c) => c.id === selectedCategory);
  const CategoryIcon = categoryConfig?.icon || Star;

  const formatValue = (category: string, value: number) => {
    switch (category) {
      case "on_time_rate":
        return `${value.toFixed(1)}%`;
      case "consistency_streak":
        return `${value} days`;
      default:
        return value.toLocaleString();
    }
  };

  const getPeriodLabel = (periodType: string) => {
    switch (periodType) {
      case "lifetime":
        return "All Time";
      case "rolling_30":
        return "Last 30 Days";
      case "rolling_7":
        return "Last 7 Days";
      case "current":
        return "Current";
      default:
        return periodType;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-400" />
          Real World Leaderboards
        </CardTitle>
        <CardDescription>
          Trust • Service • Delivery — Members Only
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                    <span>{cat.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <CategoryIcon className={`h-6 w-6 ${categoryConfig?.color}`} />
            <div>
              <div className="font-medium">{categoryConfig?.label}</div>
              <div className="text-xs text-muted-foreground">
                Service excellence rankings
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
            <Globe className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <p className="text-muted-foreground">No rankings yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start providing services to appear on the leaderboard
            </p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {entries?.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                >
                  <div className="w-8 text-center">
                    {entry.rank === 1 ? (
                      <span className="text-2xl">🥇</span>
                    ) : entry.rank === 2 ? (
                      <span className="text-2xl">🥈</span>
                    ) : entry.rank === 3 ? (
                      <span className="text-2xl">🥉</span>
                    ) : (
                      <span className="text-lg text-muted-foreground">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.username}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getPeriodLabel(entry.periodType)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatValue(selectedCategory, entry.currentValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated {entry.updatedAt.toLocaleDateString()}
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

export default RealWorldLeaderboard;
