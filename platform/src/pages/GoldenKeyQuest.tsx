/**
 * GOLDEN KEY QUEST
 * ================
 * The treasure hunt / puzzle system.
 * Keys hidden in Cephas articles → find key word → submit → earn feathers/MARKS.
 * Daisy Chain: share your answer via Cue Card → others use it → you earn bonus.
 *
 * Backend tables: golden_tickets, golden_ticket_attempts, treasure_keys,
 * key_submissions, user_feathers, golden_key_multipliers, treasure_winners
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Key, Trophy, Feather, Star, Search, Lock, Unlock, Check, X,
  Sparkles, Share2, Map, BookOpen, Gift, Crown, Twitter, MessageCircle,
} from "lucide-react";
import { GoldenKeysSocial, ShareAchievementModal } from "@/components/GoldenKeysSocial";
import { toast } from "sonner";

export default function GoldenKeyQuest() {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [keyAnswer, setKeyAnswer] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [ticketAnswer, setTicketAnswer] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareAchievement, setShareAchievement] = useState<any>(null);

  // ─── User's feather count and key stats ───
  const { data: feathers } = useQuery({
    queryKey: ["user-feathers", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const { data } = await supabase
        .from("user_feathers")
        .select("*")
        .eq("user_email", user.email)
        .single();
      return data;
    },
    enabled: !!user?.email,
  });

  // ─── Golden Key multiplier stats ───
  const { data: multiplierStats } = useQuery({
    queryKey: ["golden-key-multipliers", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("golden_key_multipliers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // ─── Active treasure keys (hints visible) ───
  const { data: activeKeys } = useQuery({
    queryKey: ["treasure-keys"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treasure_keys")
        .select("id, document_name, circle, tier, feathers, hint, hiding_method, is_active, found_by")
        .eq("is_active", true)
        .order("circle")
        .order("tier");
      return data || [];
    },
  });

  // ─── Active golden tickets (puzzles) ───
  const { data: goldenTickets } = useQuery({
    queryKey: ["golden-tickets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("golden_tickets")
        .select("id, puzzle, hint, prize_type, prize_value, prize_description, is_active, found_by")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // ─── Recent winners ───
  const { data: recentWinners } = useQuery({
    queryKey: ["treasure-winners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("treasure_winners")
        .select("email, tier, marks_awarded, rank, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  // ─── Submit a key word ───
  const submitKey = useMutation({
    mutationFn: async (keyWord: string) => {
      if (!user?.email) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("key_submissions")
        .insert({
          user_email: user.email,
          key_word: keyWord.trim().toUpperCase(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.is_correct) {
        toast.success(`Correct! +${data.feathers_awarded} feathers earned!`);
      } else {
        toast.error("Not quite. Keep exploring Cephas for the right key word.");
      }
      setKeyAnswer("");
      queryClient.invalidateQueries({ queryKey: ["user-feathers"] });
      queryClient.invalidateQueries({ queryKey: ["treasure-keys"] });
      queryClient.invalidateQueries({ queryKey: ["golden-key-multipliers"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Submission failed");
    },
  });

  // ─── Submit a golden ticket answer ───
  const submitTicketAnswer = useMutation({
    mutationFn: async ({ ticketId, answer }: { ticketId: string; answer: string }) => {
      if (!user?.id) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("golden_ticket_attempts")
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          attempt_answer: answer.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.is_correct) {
        toast.success("GOLDEN TICKET! You found it!");
      } else {
        toast.error("Not the right answer. Try again.");
      }
      setTicketAnswer("");
      setSelectedTicket(null);
      queryClient.invalidateQueries({ queryKey: ["golden-tickets"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Attempt failed");
    },
  });

  const tierColors: Record<string, string> = {
    common: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    uncommon: "bg-green-500/10 text-green-600 border-green-500/20",
    rare: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    epic: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    legendary: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };

  const keysFound = feathers?.keys_found?.length || 0;
  const totalFeathers = feathers?.total_feathers || 0;
  const circlesCompleted = feathers?.circles_completed?.length || 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Key className="h-8 w-8 text-amber-500" />
        <div>
          <h1 className="text-3xl font-bold">Golden Key Quest</h1>
          <p className="text-muted-foreground">
            Find hidden keys in Cephas articles. Solve puzzles. Earn rewards.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Key className="w-6 h-6 mx-auto mb-1 text-amber-500" />
              <div className="text-2xl font-bold">{keysFound}</div>
              <div className="text-xs text-muted-foreground">Keys Found</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Feather className="w-6 h-6 mx-auto mb-1 text-sky-500" />
              <div className="text-2xl font-bold">{totalFeathers}</div>
              <div className="text-xs text-muted-foreground">Feathers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Map className="w-6 h-6 mx-auto mb-1 text-green-500" />
              <div className="text-2xl font-bold">{circlesCompleted}</div>
              <div className="text-xs text-muted-foreground">Circles Done</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <div className="text-2xl font-bold">{multiplierStats?.current_multiplier?.toFixed(1) || "1.0"}x</div>
              <div className="text-xs text-muted-foreground">Multiplier</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Crown className="w-6 h-6 mx-auto mb-1 text-amber-600" />
              <div className="text-2xl font-bold">{multiplierStats?.midas_tokens || 0}</div>
              <div className="text-xs text-muted-foreground">Midas Tokens</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="keys">Treasure Keys</TabsTrigger>
          <TabsTrigger value="tickets">Golden Tickets</TabsTrigger>
          <TabsTrigger value="submit">Submit Answer</TabsTrigger>
          <TabsTrigger value="winners">Hall of Fame</TabsTrigger>
          <TabsTrigger value="share">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </TabsTrigger>
        </TabsList>

        {/* ─── TREASURE KEYS ─── */}
        <TabsContent value="keys" className="space-y-4">
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardHeader>
              <CardTitle>How Treasure Keys Work</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Keys are hidden inside Cephas articles at <a href="https://the2ndsecond.com" target="_blank" className="text-primary underline">the2ndSecond.com</a>.</p>
              <p>Each key is a word or phrase. Find it, submit it below, earn feathers. Feathers convert to MARKS.</p>
              <p>Keys are organized in <strong>Circles</strong> (difficulty tiers). Complete a full circle for bonus rewards.</p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {activeKeys?.map((key) => (
              <Card key={key.id} className={`${key.found_by ? "opacity-50" : ""}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {key.found_by ? (
                        <Unlock className="w-5 h-5 text-green-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium">{key.document_name}</p>
                        <p className="text-xs text-muted-foreground">Circle {key.circle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={tierColors[key.tier || "common"] || tierColors.common}>
                        {key.tier}
                      </Badge>
                      <Badge variant="outline">
                        <Feather className="w-3 h-3 mr-1" />
                        {key.feathers}
                      </Badge>
                    </div>
                  </div>
                  {key.hint && !key.found_by && (
                    <p className="text-sm text-muted-foreground mt-3 italic">
                      Hint: {key.hint}
                    </p>
                  )}
                  {key.found_by && (
                    <p className="text-sm text-green-600 mt-2">Found!</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {(!activeKeys || activeKeys.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No active treasure keys right now. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── GOLDEN TICKETS ─── */}
        <TabsContent value="tickets" className="space-y-4">
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" />
                Golden Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Golden Tickets are special puzzles with bigger prizes. Solve the puzzle, claim the reward.</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {goldenTickets?.map((ticket) => (
              <Card key={ticket.id} className={`border-2 ${ticket.found_by ? "border-green-500/20 opacity-50" : "border-amber-500/20"}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{ticket.puzzle}</h3>
                      {ticket.hint && <p className="text-sm text-muted-foreground mt-1">Hint: {ticket.hint}</p>}
                    </div>
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      {ticket.prize_type}: {ticket.prize_value}
                    </Badge>
                  </div>

                  {ticket.prize_description && (
                    <p className="text-sm text-muted-foreground mb-4">{ticket.prize_description}</p>
                  )}

                  {ticket.found_by ? (
                    <Badge className="bg-green-500/10 text-green-600">
                      <Check className="w-3 h-3 mr-1" /> Claimed
                    </Badge>
                  ) : user ? (
                    selectedTicket === ticket.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={ticketAnswer}
                          onChange={(e) => setTicketAnswer(e.target.value)}
                          placeholder="Your answer..."
                          className="flex-1"
                        />
                        <Button
                          onClick={() => submitTicketAnswer.mutate({ ticketId: ticket.id, answer: ticketAnswer })}
                          disabled={submitTicketAnswer.isPending || !ticketAnswer.trim()}
                        >
                          {submitTicketAnswer.isPending ? "..." : "Submit"}
                        </Button>
                        <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => setSelectedTicket(ticket.id)}>
                        Try to Solve
                      </Button>
                    )
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => openOnboard({ reason: "Attempt this puzzle and earn Golden Keys", actionLabel: "Start Puzzle" })}>Try to Solve</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {(!goldenTickets || goldenTickets.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No active golden tickets. New puzzles are released periodically.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── SUBMIT ANSWER ─── */}
        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Key Word</CardTitle>
              <CardDescription>
                Found a hidden key word in a Cephas article? Enter it here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  <div className="flex gap-2">
                    <Input
                      value={keyAnswer}
                      onChange={(e) => setKeyAnswer(e.target.value)}
                      placeholder="Enter the key word you found..."
                      className="flex-1 h-12 text-lg"
                      onKeyDown={(e) => e.key === "Enter" && keyAnswer.trim() && submitKey.mutate(keyAnswer)}
                    />
                    <Button
                      className="h-12 px-6"
                      onClick={() => submitKey.mutate(keyAnswer)}
                      disabled={submitKey.isPending || !keyAnswer.trim()}
                    >
                      {submitKey.isPending ? "Checking..." : "Submit"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Key words are case-insensitive. They're hidden in articles, documents, and letters on Cephas.
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-muted-foreground">Log in or join to submit answers and earn rewards.</p>
                  <Button className="mt-4" onClick={() => openOnboard({ reason: "submit answers and earn rewards", actionLabel: "Join", membershipIncluded: true })}>
                    Join for $5/year
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daisy Chain explanation */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                The Daisy Chain
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>Self-solved:</strong> 100% value (full feathers)</p>
              <p><strong>Chain-provided:</strong> 50% value (still valuable!)</p>
              <p><strong>Share bonus:</strong> +10% for each person who uses your answer via Cue Card</p>
              <p className="pt-2 text-primary font-medium">"If I can help you win, I win too."</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── HALL OF FAME ─── */}
        <TabsContent value="winners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Hall of Fame
              </CardTitle>
              <CardDescription>Recent treasure winners</CardDescription>
            </CardHeader>
            <CardContent>
              {recentWinners && recentWinners.length > 0 ? (
                <div className="space-y-3">
                  {recentWinners.map((winner, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-600">
                          #{winner.rank || i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {winner.email?.replace(/(.{3}).*(@.*)/, "$1***$2") || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(winner.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={tierColors[winner.tier || "common"] || tierColors.common}>
                          {winner.tier}
                        </Badge>
                        <Badge variant="outline">
                          <Star className="w-3 h-3 mr-1" />
                          {winner.marks_awarded} MARKS
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No winners yet. Be the first!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SHARE & SOCIAL ─── */}
        <TabsContent value="share" className="space-y-4">
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-500" />
                Share Your Achievements
              </CardTitle>
              <CardDescription>
                Spread the word and earn bonus feathers through the Daisy Chain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Stats to share */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground">Your Shareable Stats</h4>
                  
                  {keysFound > 0 && (
                    <div 
                      className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer hover:bg-amber-500/20 transition-all"
                      onClick={() => {
                        setShareAchievement({
                          id: 'keys-found',
                          type: 'key_found',
                          title: `${keysFound} Golden Keys Found!`,
                          description: 'Treasure hunter in training',
                          value: totalFeathers,
                          tier: keysFound >= 10 ? 'legendary' : keysFound >= 5 ? 'epic' : keysFound >= 3 ? 'rare' : 'common',
                          earnedAt: new Date(),
                        });
                        setShowShareModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-amber-500" />
                          <span className="font-medium">{keysFound} Keys Found</span>
                        </div>
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  {circlesCompleted > 0 && (
                    <div 
                      className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-all"
                      onClick={() => {
                        setShareAchievement({
                          id: 'circles-complete',
                          type: 'circle_complete',
                          title: `${circlesCompleted} Circles Complete!`,
                          description: 'Master treasure hunter',
                          value: circlesCompleted,
                          tier: 'epic',
                          earnedAt: new Date(),
                        });
                        setShowShareModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-green-500" />
                          <span className="font-medium">{circlesCompleted} Circles Complete</span>
                        </div>
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  {multiplierStats?.current_multiplier && multiplierStats.current_multiplier > 1 && (
                    <div 
                      className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 cursor-pointer hover:bg-purple-500/20 transition-all"
                      onClick={() => {
                        setShareAchievement({
                          id: 'multiplier',
                          type: 'multiplier_reached',
                          title: `${multiplierStats.current_multiplier.toFixed(1)}x Multiplier!`,
                          description: 'Streak master',
                          value: multiplierStats.current_multiplier,
                          tier: multiplierStats.current_multiplier >= 3 ? 'legendary' : 'rare',
                          earnedAt: new Date(),
                        });
                        setShowShareModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          <span className="font-medium">{multiplierStats.current_multiplier.toFixed(1)}x Multiplier</span>
                        </div>
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}

                  {(!keysFound && !circlesCompleted) && (
                    <div className="p-6 rounded-lg bg-muted/50 text-center">
                      <Key className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        Find your first key to unlock sharing!
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Social sharing component */}
                <div className="bg-slate-900 rounded-xl p-4">
                  <GoldenKeysSocial
                    referralCode={user?.id?.slice(0, 8).toUpperCase()}
                    referralCount={multiplierStats?.referral_count || 0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Share Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:bg-sky-500/5 transition-all" onClick={() => {
              const text = `🔑 I'm hunting for Golden Keys on @LianaBanyan! ${keysFound} found so far. Join the treasure hunt: https://lianabanyan.com/golden-key-quest #GoldenKeyQuest`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            }}>
              <CardContent className="pt-4 text-center">
                <Twitter className="w-6 h-6 mx-auto mb-2 text-sky-500" />
                <p className="text-sm font-medium">Share on X</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-sky-400/5 transition-all" onClick={() => {
              const text = `🔑 I'm hunting for Golden Keys on Liana Banyan! ${keysFound} found so far. Join the treasure hunt: https://lianabanyan.com/golden-key-quest`;
              window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`, '_blank');
            }}>
              <CardContent className="pt-4 text-center">
                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-sky-400" />
                <p className="text-sm font-medium">Share on Bluesky</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-amber-500/5 transition-all" onClick={() => {
              toast.info("Cue Card generator coming soon!");
            }}>
              <CardContent className="pt-4 text-center">
                <Key className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-sm font-medium">Create Cue Card</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-green-500/5 transition-all" onClick={() => {
              const url = `https://lianabanyan.com/golden-key-quest${user?.id ? `?ref=${user.id.slice(0, 8).toUpperCase()}` : ''}`;
              navigator.clipboard.writeText(url);
              toast.success("Referral link copied!");
            }}>
              <CardContent className="pt-4 text-center">
                <Share2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">Copy Link</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Achievement Modal */}
      {shareAchievement && (
        <ShareAchievementModal
          achievement={shareAchievement}
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setShareAchievement(null);
          }}
          referralCode={user?.id?.slice(0, 8).toUpperCase()}
        />
      )}
    </div>
  );
}
