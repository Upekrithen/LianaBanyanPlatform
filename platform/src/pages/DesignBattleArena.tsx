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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { BeaconDropButton } from "@/components/BeaconDropButton";
import { DesignBattleCard } from "@/components/DesignBattleCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Swords, Trophy, Flame, Clock, Users, Target,
  Crown, Medal, Award, Zap, History, Upload, CheckCircle,
  XCircle, Eye, Palette, Star
} from "lucide-react";

const DESIGN_CATEGORIES = [
  { value: "loteria_card", label: "Loteria Card" },
  { value: "cue_card_template", label: "Cue Card Template" },
  { value: "business_card_template", label: "Business Card Template" },
  { value: "logo", label: "Logo" },
  { value: "menu_template", label: "Menu Template" },
  { value: "coalition_brand", label: "Coalition Brand" },
] as const;

interface ArenaSubmission {
  id: string;
  creator_id: string;
  category: string;
  title: string;
  description: string | null;
  image_url: string;
  price: number | null;
  status: string;
  stamp_reviewer_id: string | null;
  stamp_rating: number | null;
  stamp_date: string | null;
  battle_id: string | null;
  royalty_uses: number;
  royalty_earnings: number;
  tags: string[] | null;
  created_at: string;
}

export default function DesignBattleArena() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");

  // Submit Design form state
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitDescription, setSubmitDescription] = useState("");
  const [submitCategory, setSubmitCategory] = useState("");
  const [submitImageUrl, setSubmitImageUrl] = useState("");
  const [submitPrice, setSubmitPrice] = useState("");
  const [submitTags, setSubmitTags] = useState("");

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

  // Fetch user's submissions
  const { data: mySubmissions } = useQuery({
    queryKey: ["arena-submissions", "mine", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("arena_submissions" as never)
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false }) as { data: ArenaSubmission[] | null };
      return (data || []) as ArenaSubmission[];
    },
    enabled: !!user,
  });

  // Fetch pending review queue (admin only)
  const { data: pendingReview } = useQuery({
    queryKey: ["arena-submissions", "pending"],
    queryFn: async () => {
      const { data } = await supabase
        .from("arena_submissions" as never)
        .select("*")
        .eq("status", "pending_review")
        .order("created_at", { ascending: true }) as { data: ArenaSubmission[] | null };
      return (data || []) as ArenaSubmission[];
    },
    enabled: !!user,
  });

  // Submit design mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (!submitTitle || !submitCategory || !submitImageUrl) {
        throw new Error("Title, category, and image URL are required");
      }
      const { error } = await supabase.from("arena_submissions" as never).insert({
        creator_id: user.id,
        title: submitTitle,
        description: submitDescription || null,
        category: submitCategory,
        image_url: submitImageUrl,
        price: submitPrice ? parseFloat(submitPrice) : null,
        tags: submitTags ? submitTags.split(",").map((t: string) => t.trim()) : [],
        status: "pending_review",
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Design Submitted!", description: "Your design is pending STAMP review." });
      setSubmitTitle(""); setSubmitDescription(""); setSubmitCategory("");
      setSubmitImageUrl(""); setSubmitPrice(""); setSubmitTags("");
      queryClient.invalidateQueries({ queryKey: ["arena-submissions"] });
    },
    onError: (err: Error) => {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    },
  });

  // STAMP review mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, approved, rating }: { id: string; approved: boolean; rating: number }) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase.from("arena_submissions" as never).update({
        status: approved ? "approved" : "rejected",
        stamp_reviewer_id: user.id,
        stamp_rating: rating,
        stamp_date: new Date().toISOString(),
      } as never).eq("id", id as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Review Complete" });
      queryClient.invalidateQueries({ queryKey: ["arena-submissions"] });
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
          <BeaconDropButton compact className="ml-2" />
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="active" className="gap-1 text-xs sm:text-sm">
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Active</span>
              </TabsTrigger>
              <TabsTrigger value="voting" className="gap-1 text-xs sm:text-sm">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Voting</span>
              </TabsTrigger>
              <TabsTrigger value="submit" className="gap-1 text-xs sm:text-sm">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Submit</span>
              </TabsTrigger>
              <TabsTrigger value="review" className="gap-1 text-xs sm:text-sm">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">STAMP</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 text-xs sm:text-sm">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
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

            {/* Submit Design Tab */}
            <TabsContent value="submit" className="space-y-4 mt-4">
              {!user ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium">Sign in to submit designs</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-purple-500" />
                        Submit a Design
                      </CardTitle>
                      <CardDescription>
                        Upload your work for STAMP review. Approved designs enter the Emporium.
                        If 2+ designs land in the same category within 7 days, a Design Battle auto-triggers.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Title *</Label>
                        <Input
                          placeholder="My Lotería Card Design"
                          value={submitTitle}
                          onChange={e => setSubmitTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Category *</Label>
                        <Select value={submitCategory} onValueChange={setSubmitCategory}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            {DESIGN_CATEGORIES.map(c => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Image URL * (PNG, SVG, or PDF)</Label>
                        <Input
                          placeholder="https://... or upload to Supabase Storage"
                          value={submitImageUrl}
                          onChange={e => setSubmitImageUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe your design, inspiration, intended use..."
                          value={submitDescription}
                          onChange={e => setSubmitDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price (Credits) — leave blank for bounty submission</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 25"
                            value={submitPrice}
                            onChange={e => setSubmitPrice(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Tags (comma-separated)</Label>
                          <Input
                            placeholder="modern, colorful, minimalist"
                            value={submitTags}
                            onChange={e => setSubmitTags(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => submitMutation.mutate()}
                        disabled={submitMutation.isPending || !submitTitle || !submitCategory || !submitImageUrl}
                        className="w-full gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {submitMutation.isPending ? "Submitting..." : "Submit for STAMP Review"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* User's own submissions */}
                  {mySubmissions && mySubmissions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Your Submissions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {mySubmissions.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                            <img
                              src={sub.image_url}
                              alt={sub.title}
                              className="w-12 h-12 rounded object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{sub.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {DESIGN_CATEGORIES.find(c => c.value === sub.category)?.label || sub.category}
                              </p>
                            </div>
                            <Badge variant={
                              sub.status === "approved" ? "default" :
                              sub.status === "in_emporium" ? "default" :
                              sub.status === "in_battle" ? "secondary" :
                              sub.status === "rejected" ? "destructive" : "outline"
                            }>
                              {sub.status.replace("_", " ")}
                            </Badge>
                            {sub.royalty_uses > 0 && (
                              <span className="text-xs text-emerald-400">{sub.royalty_uses} uses</span>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* STAMP Review Tab */}
            <TabsContent value="review" className="space-y-4 mt-4">
              {!pendingReview || pendingReview.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-medium">No Pending Reviews</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All submissions have been reviewed
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingReview.map((sub) => (
                  <Card key={sub.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <img
                          src={sub.image_url}
                          alt={sub.title}
                          className="w-24 h-24 rounded-lg object-cover border"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                        />
                        <div className="flex-1">
                          <h3 className="font-bold">{sub.title}</h3>
                          <Badge variant="outline" className="mt-1">
                            {DESIGN_CATEGORIES.find(c => c.value === sub.category)?.label || sub.category}
                          </Badge>
                          {sub.description && (
                            <p className="text-sm text-muted-foreground mt-2">{sub.description}</p>
                          )}
                          {sub.price && (
                            <p className="text-sm mt-1">
                              Price: <span className="font-bold text-amber-400">{sub.price} Credits</span>
                            </p>
                          )}
                          {sub.tags && sub.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {sub.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => reviewMutation.mutate({ id: sub.id, approved: false, rating: 0 })}
                          disabled={reviewMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => reviewMutation.mutate({ id: sub.id, approved: true, rating: 4.0 })}
                          disabled={reviewMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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
