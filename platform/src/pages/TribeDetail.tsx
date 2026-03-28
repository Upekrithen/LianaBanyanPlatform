import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useTribe, useTribeMembers, useMyTribes, useJoinTribe, useLeaveTribe } from "@/hooks/useTribes";
import { useTreasury } from "@/hooks/useGroupTreasury";
import { useDesignContestsForGroup } from "@/hooks/useDesignContests";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Flame, Coins, Trophy, ArrowLeft,
  UserPlus, UserMinus, Crown, UtensilsCrossed, Gift, Gavel,
} from "lucide-react";
import { BenefitCascadeCard } from "@/components/groups/BenefitCascadeCard";
import { TreasuryGovernance } from "@/components/groups/TreasuryGovernance";

const TYPE_LABELS: Record<string, string> = {
  family: "Family",
  neighborhood: "Neighborhood",
  interest: "Interest",
  cultural: "Cultural",
  hybrid: "Hybrid",
};

export default function TribeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: tribe, isLoading } = useTribe(slug);
  const { data: members } = useTribeMembers(tribe?.id);
  const { data: treasury } = useTreasury("tribe", tribe?.id);
  const { data: contests } = useDesignContestsForGroup("tribe", tribe?.id);
  const { data: myTribes } = useMyTribes();
  const joinTribe = useJoinTribe();
  const leaveTribe = useLeaveTribe();

  const isMember = myTribes?.some((m) => m.tribe_id === tribe?.id);
  const isElder = tribe?.elder_id === user?.id || tribe?.leader_id === user?.id;

  if (isLoading) {
    return (
      <PortalPageLayout>
        <div className="text-center py-24 text-muted-foreground">Loading tribe...</div>
      </PortalPageLayout>
    );
  }

  if (!tribe) {
    return (
      <PortalPageLayout>
        <div className="text-center py-24">
          <h2 className="text-xl font-bold mb-2">Tribe Not Found</h2>
          <Button variant="outline" onClick={() => navigate("/tribes")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tribes
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  async function handleJoin() {
    if (!tribe) return;
    try {
      await joinTribe.mutateAsync(tribe.id);
      toast({ title: "Welcome!", description: `You joined ${tribe.name}.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  async function handleLeave() {
    if (!tribe) return;
    try {
      await leaveTribe.mutateAsync(tribe.id);
      toast({ title: "Left tribe", description: `You left ${tribe.name}.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  }

  const treasuryBalance = treasury?.reduce((acc, tx) => {
    return tx.direction === "in" ? acc + tx.amount : acc - tx.amount;
  }, 0) ?? tribe.treasury_credits;

  return (
    <PortalPageLayout maxWidth="xl" xrayId="tribe-detail">
      <div className="space-y-6">
        {/* Banner */}
        <div
          className="h-40 rounded-xl flex items-end p-6 relative overflow-hidden"
          style={{ backgroundColor: tribe.color_primary || "#d97706" }}
        >
          {tribe.banner_url && (
            <img
              src={tribe.banner_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">{tribe.name}</h1>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 flex-wrap">
          {tribe.tribe_type && (
            <Badge className="bg-amber-100 text-amber-700">
              {TYPE_LABELS[tribe.tribe_type] || tribe.tribe_type}
            </Badge>
          )}
          {tribe.family_table_id && (
            <Badge variant="outline" className="text-xs">
              <UtensilsCrossed className="h-3 w-3 mr-1" /> Family Table
            </Badge>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {tribe.member_count} members
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" /> {treasuryBalance} credits
          </div>
          <div className="ml-auto flex gap-2">
            {!isMember && user && (
              <Button onClick={handleJoin} disabled={joinTribe.isPending} className="bg-amber-600 hover:bg-amber-700">
                <UserPlus className="h-4 w-4 mr-2" /> Join Tribe
              </Button>
            )}
            {isMember && !isElder && (
              <Button variant="outline" onClick={handleLeave} disabled={leaveTribe.isPending}>
                <UserMinus className="h-4 w-4 mr-2" /> Leave
              </Button>
            )}
            {isElder && (
              <Badge variant="outline" className="py-1 px-3">
                <Crown className="h-3 w-3 mr-1" /> Elder
              </Badge>
            )}
          </div>
        </div>

        {tribe.description && (
          <p className="text-muted-foreground">{tribe.description}</p>
        )}

        {/* Tabs */}
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-1" /> Members ({members?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value="treasury">
              <Coins className="h-4 w-4 mr-1" /> Treasury
            </TabsTrigger>
            <TabsTrigger value="benefits">
              <Gift className="h-4 w-4 mr-1" /> Benefits
            </TabsTrigger>
            <TabsTrigger value="governance">
              <Gavel className="h-4 w-4 mr-1" /> Governance
            </TabsTrigger>
            <TabsTrigger value="contests">
              <Trophy className="h-4 w-4 mr-1" /> Contests ({contests?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-4">
            {!members || members.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No members yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((m: any) => (
                  <Card key={m.id}>
                    <CardContent className="py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                        {(m.profile?.full_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {m.profile?.full_name || "Member"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                      </div>
                      {(m.role === "elder" || m.role === "leader") && (
                        <Crown className="h-4 w-4 text-amber-500" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="benefits" className="mt-4">
            <BenefitCascadeCard
              groupType="tribe"
              memberCount={tribe.member_count ?? members?.length ?? 0}
            />
          </TabsContent>

          <TabsContent value="governance" className="mt-4">
            <TreasuryGovernance
              groupType="tribe"
              groupId={tribe.id}
              memberCount={tribe.member_count ?? members?.length ?? 0}
              isLeader={isElder}
              isMember={!!isMember}
            />
          </TabsContent>

          <TabsContent value="treasury" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" /> Tribe Treasury
                </CardTitle>
                <CardDescription>
                  {treasuryBalance} credits &middot; {(tribe.treasury_reserve_pct * 100).toFixed(0)}% reserve
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!treasury || treasury.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No transactions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {treasury.slice(0, 20).map((tx) => (
                      <div key={tx.id} className="flex justify-between text-sm border-b pb-2">
                        <div>
                          <span className="font-medium capitalize">{tx.transaction_type}</span>
                          {tx.description && (
                            <span className="text-muted-foreground ml-2">{tx.description}</span>
                          )}
                        </div>
                        <span className={tx.direction === "in" ? "text-green-600" : "text-red-600"}>
                          {tx.direction === "in" ? "+" : "-"}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contests" className="mt-4">
            {!contests || contests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No design contests yet.</p>
                {isElder && (
                  <Button variant="outline">
                    <Trophy className="h-4 w-4 mr-2" /> Create First Contest
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contests.map((c) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{c.title}</CardTitle>
                        <Badge
                          variant={c.status === "open" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {c.status}
                        </Badge>
                      </div>
                      <CardDescription>{c.contest_type} contest</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {c.description || "No description."}
                      </p>
                      {c.prize_credits > 0 && (
                        <p className="text-sm font-medium mt-2">
                          Prize: {c.prize_credits} credits
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Button variant="ghost" onClick={() => navigate("/tribes")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tribes
        </Button>
      </div>
    </PortalPageLayout>
  );
}
