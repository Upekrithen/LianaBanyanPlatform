import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { BountyClaimForm } from "@/components/BountyClaimForm";
import { PioneerBadge } from "@/components/PioneerBadge";
import { usePioneerAssignment } from "@/hooks/usePioneerAssignment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Trophy,
  Image,
  TrendingUp,
  Instagram,
} from "lucide-react";

interface Bounty {
  id: string;
  business_name: string;
  business_address: string | null;
  bounty_type: string;
  marks_reward: number;
  max_claims: number;
  claims_count: number;
  status: string;
  expires_at: string | null;
  created_at: string;
}

interface BountyClaim {
  id: string;
  social_url: string;
  social_platform: string;
  business_name: string;
  description: string | null;
  marks_awarded: number;
  status: string;
  created_at: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  verified: { label: "Verified", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  facebook: "📘",
  x: "𝕏",
};

export function BountyPhotographyPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("bounties");
  const [claimingBounty, setClaimingBounty] = useState<Bounty | null>(null);
  const { assignPioneer, isNewPioneer } = usePioneerAssignment("bounty_photographer");

  const { data: bounties, isLoading: bountiesLoading } = useQuery({
    queryKey: ["bounties", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photo_bounties" as never)
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Bounty[];
    },
  });

  const { data: myClaims, isLoading: claimsLoading } = useQuery({
    queryKey: ["bounty-claims", "mine", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("photo_bounty_claims" as never)
        .select("*")
        .eq("member_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BountyClaim[];
    },
    enabled: !!user,
  });

  const totalClaimed = myClaims?.length ?? 0;
  const totalVerified = myClaims?.filter((c) => c.status === "verified").length ?? 0;
  const totalMarks = myClaims?.filter((c) => c.status === "verified").reduce((sum, c) => sum + c.marks_awarded, 0) ?? 0;

  return (
    <PortalPageLayout
      title={
        <span className="flex items-center gap-3">
          <Camera className="w-8 h-8" />
          Photography Bounties
          <PioneerBadge role="bounty_photographer" />
        </span>
      }
      subtitle="Photograph local businesses, post to your social media, earn Marks. Zero uploads — LB stores only the link."
    >
      {/* Stats Banner */}
      {user && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-muted/50">
            <CardContent className="pt-4 text-center">
              <Image className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <p className="text-2xl font-bold">{totalClaimed}</p>
              <p className="text-xs text-muted-foreground">Photos Claimed</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
              <p className="text-2xl font-bold">{totalVerified}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="pt-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-amber-500" />
              <p className="text-2xl font-bold">{totalMarks}</p>
              <p className="text-xs text-muted-foreground">Marks Earned</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="bounties" className="gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Available Bounties</span>
            <span className="sm:hidden">Bounties</span>
          </TabsTrigger>
          <TabsTrigger value="claim" className="gap-2">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Claim a Bounty</span>
            <span className="sm:hidden">Claim</span>
          </TabsTrigger>
          <TabsTrigger value="my-claims" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">My Claims</span>
            <span className="sm:hidden">Mine</span>
          </TabsTrigger>
        </TabsList>

        {/* Available Bounties */}
        <TabsContent value="bounties" className="mt-6 space-y-4">
          {/* How it works */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-2">How Photography Bounties Work</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Find a business below that needs photos</li>
                <li>Visit the business and take a great photo</li>
                <li>Post to your Instagram, TikTok, Facebook, or X</li>
                <li>Paste the link here — that's it. +2 Marks per verified photo</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2 italic">
                LB never stores your photos. Your social platform hosts the image. We store only the URL (~850 bytes).
              </p>
            </CardContent>
          </Card>

          {bountiesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : bounties && bounties.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {bounties.map((bounty) => {
                const pct = Math.round((bounty.claims_count / bounty.max_claims) * 100);
                const spotsLeft = bounty.max_claims - bounty.claims_count;

                return (
                  <Card key={bounty.id} className="hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{bounty.business_name}</CardTitle>
                          {bounty.business_address && (
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {bounty.business_address}
                            </CardDescription>
                          )}
                        </div>
                        <Badge className="bg-amber-600/20 text-amber-600 border-amber-500/30">
                          +{bounty.marks_reward} Marks
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{bounty.claims_count} / {bounty.max_claims} claimed</span>
                          <span>{spotsLeft} spots left</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                      {bounty.expires_at && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires {new Date(bounty.expires_at).toLocaleDateString()}
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setClaimingBounty(bounty);
                          setActiveTab("claim");
                        }}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Claim This Bounty
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No Active Bounties</h3>
                <p className="text-sm text-muted-foreground">
                  Check back soon — Captains post new photography bounties regularly.
                  You can also submit an organic claim on the Claim tab.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Claim Form */}
        <TabsContent value="claim" className="mt-6">
          <BountyClaimForm
            bountyId={claimingBounty?.id}
            bountyBusinessName={claimingBounty?.business_name}
            onSuccess={async () => {
              setClaimingBounty(null);
              setActiveTab("my-claims");
              if (isNewPioneer) await assignPioneer();
            }}
          />
          {claimingBounty && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setClaimingBounty(null)}
            >
              Clear selected bounty (submit organic claim instead)
            </Button>
          )}
        </TabsContent>

        {/* My Claims */}
        <TabsContent value="my-claims" className="mt-6 space-y-4">
          {!user ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Sign in to see your claims</p>
              </CardContent>
            </Card>
          ) : claimsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : myClaims && myClaims.length > 0 ? (
            <div className="space-y-3">
              {myClaims.map((claim) => {
                const badge = STATUS_BADGE[claim.status] ?? STATUS_BADGE.pending;
                return (
                  <Card key={claim.id}>
                    <CardContent className="pt-4 flex items-center gap-4">
                      <span className="text-2xl">{PLATFORM_ICONS[claim.social_platform] ?? "📷"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{claim.business_name}</p>
                        <a
                          href={claim.social_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline truncate block"
                        >
                          {claim.social_url}
                        </a>
                        {claim.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {claim.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                        {claim.status === "verified" && (
                          <span className="text-xs text-amber-500 font-medium">+{claim.marks_awarded} Marks</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No Claims Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Photograph a local business, post it, and paste the link to earn Marks.
                </p>
                <Button onClick={() => setActiveTab("bounties")}>
                  Browse Bounties
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}

export default BountyPhotographyPage;
