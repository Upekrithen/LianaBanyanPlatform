/**
 * SPONSOR PORTAL — Johnny Appleseed Program
 * ===========================================
 * Sponsors fund memberships for others. They get:
 * - Seedling Sponsor badge
 * - Bracket standings (gamified leaderboard)
 * - Patent selection rights
 * - Medallion pools (general, locale, requirement-based)
 *
 * Backend: sponsor_profiles, sponsor_allocations, sponsor_commitments,
 * sponsor_invitations, sponsored_recipients, johnny_appleseed_offers,
 * bracket_standings, patent_selections
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  TreePine, Users, Trophy, Gift, Heart, ArrowRight,
  Award, Target, MapPin, Star, Coins, Crown, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";

export default function SponsorPortal() {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [sponsorAmount, setSponsorAmount] = useState("");

  // Sponsor profile
  const { data: sponsorProfile } = useQuery({
    queryKey: ["sponsor-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("sponsor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Sponsor's commitments
  const { data: commitments } = useQuery({
    queryKey: ["sponsor-commitments", user?.id],
    queryFn: async () => {
      if (!user || !sponsorProfile) return [];
      const { data } = await supabase
        .from("sponsor_commitments")
        .select("*")
        .eq("sponsor_id", sponsorProfile.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!sponsorProfile,
  });

  // Sponsored recipients
  const { data: recipients } = useQuery({
    queryKey: ["sponsored-recipients", user?.id],
    queryFn: async () => {
      if (!commitments || commitments.length === 0) return [];
      const commitmentIds = commitments.map((c) => c.id);
      const { data } = await supabase
        .from("sponsored_recipients")
        .select("*")
        .in("sponsor_commitment_id", commitmentIds)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!commitments && commitments.length > 0,
  });

  // Bracket standings (leaderboard)
  const { data: standings } = useQuery({
    queryKey: ["bracket-standings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bracket_standings")
        .select("*, sponsor_profiles:sponsor_id(display_name, is_anonymous)")
        .order("current_rank", { ascending: true })
        .limit(20);
      return data || [];
    },
  });

  // Johnny Appleseed offers
  const { data: offers } = useQuery({
    queryKey: ["appleseed-offers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("johnny_appleseed_offers")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const totalSponsored = Number(sponsorProfile?.total_members_sponsored || 0);
  const totalContributed = Number(sponsorProfile?.total_contributed || 0);

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TreePine className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Johnny Appleseed Program</h1>
          <p className="text-muted-foreground">
            Plant seeds. Sponsor memberships. Watch people grow.
          </p>
        </div>
      </div>

      {/* Sponsor Stats */}
      {sponsorProfile && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-1 text-green-500" />
              <div className="text-2xl font-bold">{totalSponsored}</div>
              <div className="text-xs text-muted-foreground">Members Sponsored</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Coins className="w-6 h-6 mx-auto mb-1 text-amber-500" />
              <div className="text-2xl font-bold">${totalContributed}</div>
              <div className="text-xs text-muted-foreground">Total Contributed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <div className="text-2xl font-bold">{sponsorProfile.participation_level || "Seedling"}</div>
              <div className="text-xs text-muted-foreground">Sponsor Level</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Shield className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-bold">{commitments?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Commitments</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="sponsor" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sponsor">Become a Sponsor</TabsTrigger>
          <TabsTrigger value="offers">Active Offers</TabsTrigger>
          <TabsTrigger value="leaderboard">Bracket Standings</TabsTrigger>
          <TabsTrigger value="my-sponsorships">My Sponsorships</TabsTrigger>
        </TabsList>

        {/* ─── BECOME A SPONSOR ─── */}
        <TabsContent value="sponsor" className="space-y-4">
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/10">
            <CardHeader>
              <CardTitle>Plant a Seed</CardTitle>
              <CardDescription>
                Every $5 sponsors one membership. That person gets a year of access,
                credits to start, and a real shot at building something.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { amount: 25, members: 5, label: "Seedling" },
                  { amount: 100, members: 20, label: "Sapling" },
                  { amount: 500, members: 100, label: "Grove" },
                ].map((tier) => (
                  <Card key={tier.amount} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSponsorAmount(String(tier.amount))}>
                    <CardContent className="pt-6 text-center">
                      <TreePine className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <div className="text-3xl font-bold">${tier.amount}</div>
                      <div className="text-sm text-muted-foreground">{tier.members} memberships</div>
                      <Badge className="mt-2" variant="outline">{tier.label} Sponsor</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Custom Amount ($)</label>
                  <Input
                    type="number"
                    min="5"
                    step="5"
                    value={sponsorAmount}
                    onChange={(e) => setSponsorAmount(e.target.value)}
                    placeholder="Amount (min $5)"
                    className="h-12 text-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {sponsorAmount ? `= ${Math.floor(Number(sponsorAmount) / 5)} memberships` : "Every $5 = 1 membership"}
                  </p>
                </div>
                <Button
                  className="h-12 px-8 gap-2"
                  disabled={!sponsorAmount || Number(sponsorAmount) < 5}
                  onClick={async () => {
                    const amt = Number(sponsorAmount);
                    if (amt < 5 || amt % 5 !== 0) {
                      toast.error("Amount must be at least $5 and a multiple of $5");
                      return;
                    }

                    // Seamless onboard: if not logged in, inline signup + payment flow
                    const triggerCheckout = async () => {
                      toast.info("Opening payment...");
                      const { data, error } = await supabase.functions.invoke("create-sponsor-checkout", {
                        body: { amount: amt },
                      });
                      if (error || data?.error) {
                        toast.error(data?.error || error?.message || "Checkout failed");
                        return;
                      }
                      if (data?.url) {
                        window.open(data.url, "_blank");
                      }
                    };

                    if (!user) {
                      openOnboard({
                        reason: "sponsor memberships",
                        actionLabel: `Sponsor $${amt}`,
                        membershipIncluded: true,
                        additionalAmount: amt,
                        additionalLabel: `Johnny Appleseed Sponsorship (${Math.floor(amt / 5)} memberships)`,
                        onComplete: triggerCheckout,
                      });
                      return;
                    }

                    await triggerCheckout();
                  }}
                >
                  <Heart className="w-4 h-4" />
                  Sponsor
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Sponsors Get</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Seedling Sponsor Badge</div>
                <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-purple-500" /> Bracket Standing (leaderboard)</div>
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-blue-500" /> Patent Selection Rights</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-500" /> Locale-targeted pools</div>
                <div className="flex items-center gap-2"><Target className="w-4 h-4 text-red-500" /> Requirement-based pools</div>
                <div className="flex items-center gap-2"><Gift className="w-4 h-4 text-pink-500" /> Babylon Candle cue cards to give</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ACTIVE OFFERS ─── */}
        <TabsContent value="offers" className="space-y-4">
          {offers && offers.length > 0 ? (
            offers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{offer.offer_name}</CardTitle>
                    <Badge>{offer.remaining_memberships} of {offer.total_memberships} left</Badge>
                  </div>
                  <CardDescription>{offer.purpose_statement}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={((offer.total_memberships - offer.remaining_memberships) / offer.total_memberships) * 100} className="h-2" />
                  {offer.sponsor_message && (
                    <p className="text-sm text-muted-foreground mt-3 italic">"{offer.sponsor_message}"</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <TreePine className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No active offers yet. Be the first to plant seeds!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── BRACKET STANDINGS ─── */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Bracket Standings
              </CardTitle>
              <CardDescription>Top sponsors by impact</CardDescription>
            </CardHeader>
            <CardContent>
              {standings && standings.length > 0 ? (
                <div className="space-y-3">
                  {standings.map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          i === 0 ? "bg-amber-500/20 text-amber-600" :
                          i === 1 ? "bg-gray-400/20 text-gray-600" :
                          i === 2 ? "bg-orange-500/20 text-orange-600" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {s.current_rank || i + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {s.sponsor_profiles?.is_anonymous
                              ? "Anonymous Sponsor"
                              : s.sponsor_profiles?.display_name || "Sponsor"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.members_drafted} drafted, {s.members_active} active
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{Number(s.total_score).toFixed(0)} pts</div>
                        <div className="text-xs text-muted-foreground">+{Number(s.bonus_points).toFixed(0)} bonus</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No bracket standings yet. Sponsor to enter!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── MY SPONSORSHIPS ─── */}
        <TabsContent value="my-sponsorships" className="space-y-4">
          {user ? (
            sponsorProfile ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Sponsored Members</CardTitle>
                    <CardDescription>{recipients?.length || 0} people sponsored</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recipients && recipients.length > 0 ? (
                      <div className="space-y-3">
                        {recipients.map((r) => {
                          const isActive = !!r.claimed_at;
                          // Milestone thresholds for sponsored members
                          const milestones = [
                            { label: "Joined", reached: isActive, icon: "🌱" },
                            { label: "First Exploration", reached: isActive && (r.pages_visited ?? 0) >= 5, icon: "🧭" },
                            { label: "First Bounty", reached: (r.bounties_completed ?? 0) >= 1, icon: "⚡" },
                            { label: "First Earned Mark", reached: (r.marks_earned ?? 0) >= 1, icon: "⭐" },
                            { label: "Community Contributor", reached: (r.bounties_completed ?? 0) >= 5, icon: "🔥" },
                          ];
                          const milestonesReached = milestones.filter(m => m.reached).length;

                          return (
                            <div key={r.id} className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <TreePine className="w-4 h-4 text-green-500" />
                                  <span className="text-sm font-medium">
                                    {r.recipient_name || r.recipient_email || "Seed Planted"}
                                  </span>
                                </div>
                                <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-green-600" : ""}>
                                  {isActive ? "Growing" : "Planted"}
                                </Badge>
                              </div>

                              {/* Milestone Progress — limited visibility */}
                              <div className="flex items-center gap-1">
                                {milestones.map((m, i) => (
                                  <div
                                    key={i}
                                    title={m.reached ? m.label : "???"}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all ${
                                      m.reached
                                        ? "bg-primary/20 border border-primary/40 scale-100"
                                        : "bg-muted border border-border opacity-40 scale-90"
                                    }`}
                                  >
                                    {m.reached ? m.icon : "?"}
                                  </div>
                                ))}
                                <span className="text-xs text-muted-foreground ml-2">
                                  {milestonesReached}/{milestones.length} milestones
                                </span>
                              </div>

                              {/* Latest milestone notification */}
                              {milestonesReached > 0 && (
                                <p className="text-xs text-muted-foreground italic">
                                  Latest: {milestones.filter(m => m.reached).pop()?.icon}{" "}
                                  {milestones.filter(m => m.reached).pop()?.label}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        No recipients yet. Your sponsored memberships will appear here.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <TreePine className="w-12 h-12 mx-auto mb-4 text-green-500/30" />
                  <p className="text-muted-foreground mb-4">You haven't sponsored anyone yet.</p>
                  <Button onClick={() => document.querySelector('[value="sponsor"]')?.dispatchEvent(new Event("click"))}>
                    Start Sponsoring
                  </Button>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Log in to view your sponsorships.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
