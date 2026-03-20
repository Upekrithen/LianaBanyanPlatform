/**
 * GOVERNANCE — The 300 + Proposals + Voting + Star Chamber
 * =========================================================
 * Backend: proposals, votes, votable_items, vote_allocations,
 * structural_bylaws, crown_positions, star_chamber_verifications
 */

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Users, Scale, Crown, FileText, Vote, Eye,
  CheckCircle, XCircle, Clock, Star, Lock, BookOpen,
} from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function Governance() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Crown positions
  const { data: crowns } = useQuery({
    queryKey: ["crown-positions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crown_positions")
        .select("*")
        .order("initiative");
      return data || [];
    },
  });

  // Active proposals
  const { data: proposals } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("proposals")
        .select("*, profiles:provider_id(full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Structural bylaws
  const { data: bylaws } = useQuery({
    queryKey: ["structural-bylaws"],
    queryFn: async () => {
      const { data } = await supabase
        .from("structural_bylaws")
        .select("*")
        .order("category");
      return data || [];
    },
  });

  // Star Chamber verifications
  const { data: verifications } = useQuery({
    queryKey: ["star-chamber"],
    queryFn: async () => {
      const { data } = await supabase
        .from("star_chamber_verifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  // Votable items
  const { data: votableItems } = useQuery({
    queryKey: ["votable-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("votable_items")
        .select("*")
        .eq("status", "open")
        .order("total_credits", { ascending: false });
      return data || [];
    },
  });

  const statusColors: Record<string, string> = {
    open: "bg-green-500/10 text-green-600",
    offered: "bg-blue-500/10 text-blue-600",
    accepted: "bg-primary/10 text-primary",
    vacant: "bg-amber-500/10 text-amber-600",
    pending: "bg-yellow-500/10 text-yellow-600",
    pass: "bg-green-500/10 text-green-600",
    fail: "bg-red-500/10 text-red-600",
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="governance">
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Governance</h1>
          <p className="text-muted-foreground">
            The 300 — AI-Human hybrid governance. Proposals, voting, and constitutional bylaws.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Crown className="w-6 h-6 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{crowns?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Crown Positions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Vote className="w-6 h-6 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">{votableItems?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Active Votes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <FileText className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">{bylaws?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Structural Bylaws</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Eye className="w-6 h-6 mx-auto mb-1 text-purple-500" />
            <div className="text-2xl font-bold">{verifications?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Star Chamber Reviews</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="crowns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="crowns">Crowns</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="bylaws">Bylaws</TabsTrigger>
          <TabsTrigger value="star-chamber">Star Chamber</TabsTrigger>
          <TabsTrigger value="the-300">The 300</TabsTrigger>
        </TabsList>

        {/* CROWNS */}
        <TabsContent value="crowns" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {crowns?.map((crown) => (
              <Card key={crown.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{crown.title}</h3>
                      <p className="text-sm text-muted-foreground">{crown.initiative}</p>
                      {crown.holder_name && (
                        <p className="text-sm font-medium text-primary mt-1">{crown.holder_name}</p>
                      )}
                      {crown.target_candidate && !crown.holder_name && (
                        <p className="text-sm text-amber-600 mt-1">Target: {crown.target_candidate}</p>
                      )}
                    </div>
                    <Badge className={statusColors[crown.status || "vacant"]}>
                      {crown.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* VOTING */}
        <TabsContent value="voting" className="space-y-4">
          {votableItems && votableItems.length > 0 ? (
            votableItems.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/governance/proposals/${item.id}`)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Badge>{item.item_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.total_credits || 0} credits pledged</span>
                    <span>Level {item.production_level || 1}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active votes. Proposals are submitted by The 300.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* BYLAWS */}
        <TabsContent value="bylaws" className="space-y-4">
          {bylaws?.map((bylaw) => (
            <Card key={bylaw.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <h3 className="font-bold">{bylaw.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{bylaw.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{bylaw.category}</Badge>
                    <Badge className={bylaw.protection_level === "structural" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"}>
                      {bylaw.protection_level}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Amendment: {bylaw.amendment_requirement}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* STAR CHAMBER */}
        <TabsContent value="star-chamber" className="space-y-4">
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                Star Chamber — Dual AI Verification
              </CardTitle>
              <CardDescription>
                Two independent AI agents verify content. Human reviewer makes final call.
              </CardDescription>
            </CardHeader>
          </Card>

          {verifications?.map((v) => (
            <Card key={v.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{v.content_type}: {v.content_id}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>AI1: {v.ai1_agent}</span>
                      <span>AI2: {v.ai2_agent}</span>
                      {v.agreement_percentage && (
                        <span>Agreement: {Number(v.agreement_percentage).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[v.final_decision || v.status || "pending"]}>
                    {v.final_decision || v.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* THE 300 */}
        <TabsContent value="the-300" className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle>The 300 Governance Framework</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" /> The Pledged (100 seats)
                </h3>
                <p className="text-muted-foreground">
                  AI Agents. Permanent. 24/7 monitoring, fraud detection, proposal scoring, compliance checking.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" /> The Committed (100 seats)
                </h3>
                <p className="text-muted-foreground">
                  Human Members. Elected, 1-year terms. Represent member interests. Vote on proposals.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Scale className="w-4 h-4" /> The Covenant (100 seats)
                </h3>
                <p className="text-muted-foreground">
                  Mixed AI-Human. Domain experts, technical specialists, emergency response.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voting Mechanics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span>Standard Proposal</span>
                  <span className="font-medium">51% majority, AI vote 1x</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span>Bylaw Change</span>
                  <span className="font-medium">67% majority, AI vote 0.5x</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-amber-500/5">
                  <span>Structural Bylaw</span>
                  <span className="font-medium">80% + Founder veto, AI vote 0x</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-red-500/5">
                  <span>Emergency</span>
                  <span className="font-medium">51% expedited, AI vote 2x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PortalPageLayout>
  );
}
