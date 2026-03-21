/**
 * DESIGN BATTLE ARENA — Competitive Bounty Hub
 * =============================================
 * Where warriors compete for bounties. Auto-triggered when 2+ people
 * sign up for the same work.
 *
 * Features:
 * - Active battles grid
 * - Leaderboard
 * - Battle history
 * - Crow Feather collection
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { DesignBattleCard } from "@/components/DesignBattleCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Swords, Trophy, Flame, Clock, Users, Target,
  Crown, Medal, Award, Zap, History
} from "lucide-react";

export default function DesignBattleArena() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");

  // Fetch active battles
  const { data: activeBattles, isLoading: loadingActive } = useQuery({
    queryKey: ["design-battles", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_battles")
        .select("*")
        .in("status", ["pending", "active", "voting"])
        .order("ends_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch completed battles
  const { data: completedBattles, isLoading: loadingCompleted } = useQuery({
    queryKey: ["design-battles", "completed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_battles")
        .select("*")
        .eq("status", "completed")
        .order("updated_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user's crow feathers
  const { data: crowFeathers } = useQuery({
    queryKey: ["crow-feathers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("crow_feathers")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", "design_battle")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ["battle-leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_battle_participants")
        .select("user_id, display_name, vote_count, payout, crow_feather_earned")
        .eq("crow_feather_earned", true)
        .order("payout", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });

  const totalActiveBattles = activeBattles?.length || 0;
  const totalPot = activeBattles?.reduce((sum, b) => sum + Number(b.total_pot), 0) || 0;
  const myFeathers = crowFeathers?.length || 0;

  return (
    <PortalPageLayout maxWidth="xl" xrayId="design-battle-arena">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Swords className="h-10 w-10 text-red-500" />
          Design Battle Arena
        </h1>
        <p className="text-muted-foreground mt-2">
          Compete for bounties. Winner takes 50% + a Crow Feather.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10">
          <CardContent className="pt-4 text-center">
            <Flame className="h-6 w-6 mx-auto mb-1 text-red-500" />
            <div className="text-2xl font-bold">{totalActiveBattles}</div>
            <div className="text-xs text-muted-foreground">Active Battles</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10">
          <CardContent className="pt-4 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold">{totalPot.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Total Pot</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardContent className="pt-4 text-center">
            <span className="text-2xl">🪶</span>
            <div className="text-2xl font-bold">{myFeathers}</div>
            <div className="text-xs text-muted-foreground">Your Feathers</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <CardContent className="pt-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">{leaderboard?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Champions</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="gap-2">
                <Flame className="h-4 w-4" />
                Active
              </TabsTrigger>
              <TabsTrigger value="voting" className="gap-2">
                <Target className="h-4 w-4" />
                Voting
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              {loadingActive ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading battles...
                </div>
              ) : activeBattles?.filter(b => b.status !== "voting").length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <Swords className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium">No Active Battles</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Battles auto-start when 2+ people sign up for the same bounty
                    </p>
                    <Button className="mt-4" variant="outline">
                      Browse Bounties
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activeBattles
                  ?.filter(b => b.status !== "voting")
                  .map((battle) => (
                    <DesignBattleCard key={battle.id} battle={battle} />
                  ))
              )}
            </TabsContent>

            <TabsContent value="voting" className="space-y-4 mt-4">
              {activeBattles?.filter(b => b.status === "voting").length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium">No Battles in Voting</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check back when battles complete their work phase
                    </p>
                  </CardContent>
                </Card>
              ) : (
                activeBattles
                  ?.filter(b => b.status === "voting")
                  .map((battle) => (
                    <DesignBattleCard key={battle.id} battle={battle} showDetails />
                  ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              {loadingCompleted ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading history...
                </div>
              ) : completedBattles?.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium">No Battle History</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Completed battles will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                completedBattles?.map((battle) => (
                  <DesignBattleCard key={battle.id} battle={battle} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Champions
              </CardTitle>
              <CardDescription>Top battle winners</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center justify-center w-6 h-6">
                          {index === 0 ? (
                            <Medal className="h-5 w-5 text-yellow-500" />
                          ) : index === 1 ? (
                            <Medal className="h-5 w-5 text-gray-400" />
                          ) : index === 2 ? (
                            <Medal className="h-5 w-5 text-orange-600" />
                          ) : (
                            <span className="text-sm text-muted-foreground">{index + 1}</span>
                          )}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {entry.display_name?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {entry.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Number(entry.payout).toFixed(0)} Credits won
                          </p>
                        </div>
                        <span className="text-lg">🪶</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Crown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No champions yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">1</Badge>
                <p>2+ people sign up for the same bounty</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">2</Badge>
                <p>Design Battle auto-triggers</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">3</Badge>
                <p>Participants ante up (Credits, Marks, Joules)</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">4</Badge>
                <p>Submit work, community votes</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">5</Badge>
                <p>Winner gets 50% of pot + Crow Feather</p>
              </div>
            </CardContent>
          </Card>

          {/* Your Crow Feathers */}
          {user && crowFeathers && crowFeathers.length > 0 && (
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🪶</span>
                  Your Crow Feathers
                </CardTitle>
                <CardDescription>Trophies from battle victories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {crowFeathers.map((feather) => (
                    <Badge
                      key={feather.id}
                      variant="secondary"
                      className="gap-1"
                    >
                      🪶 {Number(feather.record_value).toFixed(0)} Credits
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PortalPageLayout>
  );
}
