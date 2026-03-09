/**
 * HEXISLE — Water-Powered Gaming Platform
 * ========================================
 * Crown Jewel #3: Tereno Hydraulic
 * Physical-digital hybrid. No batteries, no screens. Just physics.
 *
 * Backend: hexisle_cities, hexisle_buildings, hexisle_quests,
 * hexisle_player_state, hexisle_player_quests
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Waves, Map, Compass, Sword, BookOpen, Trophy, Star,
  Hexagon, Building, Droplets, Cog, Zap, Target, Crown,
  Package, ArrowRight, Shield, Anchor, Wrench, Sprout, Wand2, Search
} from "lucide-react";

import { RootLockDemo } from "@/components/hexisle/root-lock/RootLockDemo";
import { ViewPhaseSwitcher } from "@/components/hexisle/ViewPhaseSwitcher";

export default function HexIsle() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Player state
  const { data: playerState } = useQuery({
    queryKey: ["hexisle-player", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("hexisle_player_state")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Cities
  const { data: cities } = useQuery({
    queryKey: ["hexisle-cities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("hexisle_cities")
        .select("*")
        .order("name");
      return data || [];
    },
  });

  // Available quests
  const { data: quests } = useQuery({
    queryKey: ["hexisle-quests"],
    queryFn: async () => {
      const { data } = await supabase
        .from("hexisle_quests")
        .select("*")
        .eq("is_active", true)
        .order("difficulty");
      return data || [];
    },
  });

  // Player's active quests
  const { data: playerQuests } = useQuery({
    queryKey: ["hexisle-player-quests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("hexisle_player_quests")
        .select("*, hexisle_quests(*)")
        .eq("user_id", user.id)
        .in("status", ["accepted", "in_progress"]);
      return data || [];
    },
    enabled: !!user,
  });

  // Player's buildings
  const { data: buildings } = useQuery({
    queryKey: ["hexisle-buildings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("hexisle_buildings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const difficultyColors: Record<string, string> = {
    easy: "bg-green-500/10 text-green-600",
    medium: "bg-blue-500/10 text-blue-600",
    hard: "bg-orange-500/10 text-orange-600",
    epic: "bg-purple-500/10 text-purple-600",
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* View Phase Switcher (Portals / 2D / 3D) */}
      <ViewPhaseSwitcher />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Waves className="h-8 w-8 text-cyan-500" />
        <div>
          <h1 className="text-3xl font-bold">HexIsle</h1>
          <p className="text-muted-foreground">
            Water-powered gaming. No batteries. No screens. Just physics and imagination.
          </p>
        </div>
        <Badge className="ml-auto bg-amber-500/10 text-amber-600 border-amber-500/20">
          <Crown className="w-3 h-3 mr-1" /> Crown Jewel #3
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-blue-400 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900"
          onClick={() => navigate("/hexisle/world-3d")}
        >
          <CardContent className="pt-6 text-center">
            <Compass className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <h3 className="font-bold">3D World</h3>
            <p className="text-sm text-muted-foreground">Explore the archipelago in 3D</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-cyan-300 bg-gradient-to-b from-cyan-50 to-white"
          onClick={() => navigate("/hexisle/encyclopedia")}
        >
          <CardContent className="pt-6 text-center">
            <Crown className="h-8 w-8 mx-auto text-cyan-600 mb-2" />
            <h3 className="font-bold">Encyclopedia</h3>
            <p className="text-sm text-muted-foreground">33 patents, 6 mechanisms, physics proofs</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20"
          onClick={() => navigate("/hexisle/projects")}
        >
          <CardContent className="pt-6 text-center">
            <Package className="h-8 w-8 mx-auto text-primary mb-2" />
            <h3 className="font-bold">Shop Characters & Terrain</h3>
            <p className="text-sm text-muted-foreground">Browse products or design your own</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/factory")}
        >
          <CardContent className="pt-6 text-center">
            <Cog className="h-8 w-8 mx-auto text-amber-500 mb-2" />
            <h3 className="font-bold">The Factory</h3>
            <p className="text-sm text-muted-foreground">Manufacturing pipeline</p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/hexisle-dashboard")}
        >
          <CardContent className="pt-6 text-center">
            <Map className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <h3 className="font-bold">Campaign Dashboard</h3>
            <p className="text-sm text-muted-foreground">Track your progress</p>
          </CardContent>
        </Card>
      </div>

      {/* About Card */}
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-500" />
            Tereno Hydraulic Platform
          </CardTitle>
          <CardDescription>
            The physical game mechanics that bridge the real world and the digital platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-cyan-600">
              <Cog className="w-4 h-4" /> Physical Mechanics
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Hydraulic Power:</strong> Water channels power the game. No batteries.</li>
              <li><strong>IIFIS (If It Fits It Sits):</strong> Boots snap onto specific terrain types. You can't walk on lava without lava boots.</li>
              <li><strong>Compliant Mechanisms:</strong> Push down on a character's backpack to ratchet their Hit Point counter.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-amber-600">
              <Package className="w-4 h-4" /> Fitted Coffers & Coins
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>The Armory:</strong> Modular coffers store characters and their specific biome armor.</li>
              <li><strong>The Treasury:</strong> Coins (Square, Circle, Triangle) stack to represent character value.</li>
              <li><strong>Coin Slots:</strong> Characters have specific slot patterns (like dice faces) restricting which coins they can hold.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-primary">
              <Target className="w-4 h-4" /> Game to Platform
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Kickstarter Passthrough:</strong> Backing the game earns you Joules (Platform Service Vouchers).</li>
              <li><strong>Prototyping:</strong> Test free STL files, report results, earn Credits.</li>
              <li><strong>Community Campaigns:</strong> Build your own "Keep" to host game nights and earn when others play.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* The 7 Islands Mapping */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Map className="w-6 h-6 text-green-500" />
          The 7 Islands (Proving Grounds)
        </h2>
        <p className="text-muted-foreground">
          The physical game locations map directly to the digital platform's functional hubs.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:border-green-500/50 transition-colors cursor-pointer" onClick={() => navigate('/hexisle/harvest')}>
            <CardContent className="pt-6 text-center">
              <Sprout className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <h3 className="font-bold">Harvest</h3>
              <p className="text-xs text-muted-foreground">Merchant's Mile & Businesses</p>
            </CardContent>
          </Card>
          <Card className="hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => navigate('/hexisle/navigate')}>
            <CardContent className="pt-6 text-center">
              <Compass className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <h3 className="font-bold">Navigate</h3>
              <p className="text-xs text-muted-foreground">Scholar's Spire & Learning</p>
            </CardContent>
          </Card>
          <Card className="hover:border-amber-500/50 transition-colors cursor-pointer" onClick={() => navigate('/hexisle/engineer')}>
            <CardContent className="pt-6 text-center">
              <Wrench className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <h3 className="font-bold">Engineer</h3>
              <p className="text-xs text-muted-foreground">Builder's Basin & Makers</p>
            </CardContent>
          </Card>
          <Card className="hover:border-red-500/50 transition-colors cursor-pointer" onClick={() => navigate('/hexisle/battle')}>
            <CardContent className="pt-6 text-center">
              <Sword className="w-8 h-8 mx-auto text-red-500 mb-2" />
              <h3 className="font-bold">Battle</h3>
              <p className="text-xs text-muted-foreground">Arenas & Competitions</p>
            </CardContent>
          </Card>
          <Card className="hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => navigate('/hexisle/seek')}>
            <CardContent className="pt-6 text-center">
              <Search className="w-8 h-8 mx-auto text-purple-500 mb-2" />
              <h3 className="font-bold">Seek</h3>
              <p className="text-xs text-muted-foreground">Bounties & Exploration</p>
            </CardContent>
          </Card>
          <Card className="hover:border-cyan-500/50 transition-colors cursor-pointer" onClick={() => navigate('/hexisle/magic')}>
            <CardContent className="pt-6 text-center">
              <Wand2 className="w-8 h-8 mx-auto text-cyan-500 mb-2" />
              <h3 className="font-bold">Magic</h3>
              <p className="text-xs text-muted-foreground">Innovation & IP</p>
            </CardContent>
          </Card>
          <Card className="hover:border-orange-500/50 transition-colors cursor-pointer" onClick={() => navigate('/hexisle/train')}>
            <CardContent className="pt-6 text-center">
              <Shield className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <h3 className="font-bold">Train</h3>
              <p className="text-xs text-muted-foreground">Guilds & Apprenticeships</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/hexisle/keeps')}>
            <CardContent className="pt-6 text-center">
              <Building className="w-8 h-8 mx-auto text-primary mb-2" />
              <h3 className="font-bold">The Keeps</h3>
              <p className="text-xs text-muted-foreground">Community Campaign Lobbies</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Player Stats (if logged in and has state) */}
      {playerState && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <div className="text-xl font-bold">Lv {playerState.level}</div>
              <div className="text-xs text-muted-foreground">{playerState.xp} XP</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Droplets className="w-5 h-5 mx-auto mb-1 text-cyan-500" />
              <div className="text-xl font-bold">{playerState.water}</div>
              <div className="text-xs text-muted-foreground">Water</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Zap className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <div className="text-xl font-bold">{playerState.credits}</div>
              <div className="text-xs text-muted-foreground">Credits</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Cog className="w-5 h-5 mx-auto mb-1 text-gray-500" />
              <div className="text-xl font-bold">{playerState.materials}</div>
              <div className="text-xs text-muted-foreground">Materials</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <span className="text-xl">🌾</span>
              <div className="text-xl font-bold">{playerState.food}</div>
              <div className="text-xs text-muted-foreground">Food</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Map className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <div className="text-xl font-bold">{playerState.cities_discovered?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Cities Found</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="cities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cities">12 Cities ({cities?.length || 0})</TabsTrigger>
          <TabsTrigger value="quests">Quests ({quests?.length || 0})</TabsTrigger>
          <TabsTrigger value="buildings">My Buildings ({buildings?.length || 0})</TabsTrigger>
          <TabsTrigger value="active">Active ({playerQuests?.length || 0})</TabsTrigger>
        </TabsList>

        {/* CITIES */}
        <TabsContent value="cities" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities?.map((city) => {
              const discovered = playerState?.cities_discovered?.includes(city.id);
              return (
                <Card key={city.id} className={`${discovered ? "" : "opacity-60"}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{city.name}</CardTitle>
                      {discovered ? (
                        <Badge className="bg-green-500/10 text-green-600">Discovered</Badge>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </div>
                    {city.subtitle && <CardDescription>{city.subtitle}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground line-clamp-2">{city.description}</p>
                    {city.features && city.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {city.features.map((f: string) => (
                          <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span>Pop: {city.population || 0}</span>
                      {city.guild_hall && <span>Guild: {city.guild_hall}</span>}
                      {city.well_type && <span>Well: {city.well_type}</span>}
                    </div>
                    {city.unlock_requirement && !discovered && (
                      <p className="text-xs text-primary mt-2">
                        Unlock: {city.unlock_requirement}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* QUESTS */}
        <TabsContent value="quests" className="space-y-4">
          <div className="space-y-4">
            {quests?.map((quest) => (
              <Card key={quest.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{quest.title}</CardTitle>
                      <CardDescription>{quest.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={difficultyColors[quest.difficulty || "easy"]}>
                        {quest.difficulty}
                      </Badge>
                      {quest.is_real_world && (
                        <Badge variant="outline">Real World</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    {quest.reward_credits > 0 && (
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-500" />
                        {quest.reward_credits} credits
                      </span>
                    )}
                    {quest.reward_xp > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        {quest.reward_xp} XP
                      </span>
                    )}
                    {quest.reward_items && quest.reward_items.length > 0 && (
                      <span className="text-muted-foreground">
                        +{quest.reward_items.length} items
                      </span>
                    )}
                    {quest.city_id && (
                      <Badge variant="outline" className="text-xs">
                        <Map className="w-3 h-3 mr-1" />
                        {quest.city_id}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!quests || quests.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No quests available yet. Coming with the Kickstarter launch!
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* BUILDINGS */}
        <TabsContent value="buildings" className="space-y-6">
          <RootLockDemo />
          
          {buildings && buildings.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {buildings.map((b) => (
                <Card key={b.id}>
                  <CardContent className="pt-4 text-center">
                    <Building className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">{b.building_type}</p>
                    <p className="text-xs text-muted-foreground">
                      Hex ({b.hex_x}, {b.hex_y})
                    </p>
                    <Badge className="mt-2" variant={b.is_complete ? "default" : "outline"}>
                      {b.is_complete ? "Complete" : "Building..."}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {user ? "No buildings yet. Complete quests to unlock building." : "Log in to track your buildings."}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ACTIVE QUESTS */}
        <TabsContent value="active" className="space-y-4">
          {playerQuests && playerQuests.length > 0 ? (
            playerQuests.map((pq) => (
              <Card key={pq.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{(pq as any).hexisle_quests?.title || "Quest"}</CardTitle>
                    <Badge>{pq.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {(pq as any).hexisle_quests?.description}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {user ? "No active quests. Browse the Quests tab to start one!" : "Log in to accept quests."}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
