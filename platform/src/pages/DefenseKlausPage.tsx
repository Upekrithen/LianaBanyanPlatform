/**
 * Defense Klaus -- Community Safety Coordination Layer / BP073 W9
 * ===============================================================
 * Wave 20 -- Initiative #8 (community side)
 * Wave 21 = physical product spinout (separate)
 *
 * This page: neighborhood watch coordination, safety information sharing,
 * emergency contact networks, Marks for safety contributions.
 *
 * Switzerland Policy: NO political content, NO law enforcement advocacy.
 * Safety coordination is neutral, community-driven, non-partisan.
 *
 * Supabase: defense_neighbor_safety_reports, defense_safety_network_members
 * Migration: 20260603120004_bp073_w9_defense_safety.sql
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Heart, Users, MapPin, Bell, AlertTriangle,
  CheckCircle2, ArrowRight, MessageSquare, Phone, Star,
  Eye, BookOpen, Award, Globe, Lock, Zap, Radio,
  ClipboardList, UserCheck, Network,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaunchConditionOverlay from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const SAFETY_MARKS = [
  {
    action: "Submit a neighborhood safety report",
    marks: 5,
    icon: <ClipboardList className="h-4 w-4 text-emerald-500" />,
    desc: "Document a safety concern (traffic hazard, lighting gap, unsecured area) with location and photo.",
  },
  {
    action: "Complete a community safety training",
    marks: 20,
    icon: <BookOpen className="h-4 w-4 text-blue-500" />,
    desc: "First aid basics, conflict de-escalation, emergency protocols. One training per quarter.",
  },
  {
    action: "Organize a neighborhood watch meeting",
    marks: 15,
    icon: <Users className="h-4 w-4 text-purple-500" />,
    desc: "Host or co-host a local safety coordination meeting with 3+ neighbors.",
  },
  {
    action: "Verify an emergency contact network",
    marks: 10,
    icon: <Network className="h-4 w-4 text-amber-500" />,
    desc: "Confirm and update your local emergency contact chain (min. 5 contacts).",
  },
  {
    action: "Share a verified safety resource",
    marks: 3,
    icon: <Radio className="h-4 w-4 text-cyan-500" />,
    desc: "Post a vetted safety tip, resource, or local update to the community board.",
  },
  {
    action: "Respond to a safety coordination request",
    marks: 8,
    icon: <UserCheck className="h-4 w-4 text-indigo-500" />,
    desc: "Respond to a verified neighbor's safety coordination request within 2 hours.",
  },
];

const SAFETY_PILLARS = [
  {
    id: "watch",
    icon: Eye,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    title: "Neighborhood Watch Coordination",
    desc: "Organize overlapping watch zones with verified neighbors. No surveillance infrastructure -- just humans keeping an eye out for each other.",
    features: [
      "Zone mapping -- define your block and overlap with adjacent zones",
      "Check-in cadence -- daily or weekly status pings among zone members",
      "Incident log -- record safety events (non-emergency) for neighborhood pattern awareness",
      "Handoff protocol -- notify the next zone when something needs follow-through",
    ],
  },
  {
    id: "info",
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    title: "Safety Information Sharing",
    desc: "A community board for sharing vetted safety information. No rumors. No political framing. Facts, resources, and local updates only.",
    features: [
      "Verified posting -- members earn posting rights through Marks",
      "Source citation required for all safety claims",
      "Switzerland Policy enforced -- no law enforcement advocacy, no political content",
      "Moderator review for anything that affects emergency response",
    ],
  },
  {
    id: "network",
    icon: Network,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    title: "Emergency Contact Networks",
    desc: "Build your local emergency chain before you need it. Know who can drive, who has a generator, who speaks which languages, who can shelter pets.",
    features: [
      "Contact chain builder -- structured list with roles and capabilities",
      "Capability registry -- document resources (vehicle, first aid, shelter space)",
      "Language map -- who can communicate across language barriers in your zone",
      "Quarterly verification -- chains decay without maintenance; Marks reward upkeep",
    ],
  },
  {
    id: "training",
    icon: BookOpen,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    title: "Community Safety Training",
    desc: "Practical skills for community safety. First aid, de-escalation, emergency preparedness. Community-taught, community-validated.",
    features: [
      "First aid basics -- taught by trained members, verified by certification",
      "Conflict de-escalation -- non-confrontational communication under stress",
      "Emergency preparedness -- 72-hour kit, evacuation planning, shelter-in-place",
      "Marks for every completed module -- training is rewarded participation",
    ],
  },
];

const SAMPLE_REPORTS = [
  {
    id: "r1",
    type: "Lighting Gap",
    location: "Corner of 3rd Ave & Oak St",
    status: "open",
    submittedAt: "2026-05-28",
    upvotes: 12,
  },
  {
    id: "r2",
    type: "Traffic Hazard",
    location: "Crosswalk at Elm & Main -- faded markings",
    status: "acknowledged",
    submittedAt: "2026-05-20",
    upvotes: 24,
  },
  {
    id: "r3",
    type: "Unsecured Area",
    location: "Abandoned lot on Pine Street -- open fence",
    status: "resolved",
    submittedAt: "2026-05-10",
    upvotes: 8,
  },
];

const STATUS_BADGE: Record<string, string> = {
  open: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  acknowledged: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DefenseKlausPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const { data: liveReports = [] } = useQuery({
    queryKey: ["defense_neighbor_safety_reports", "open"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("defense_neighbor_safety_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const reports = liveReports.length > 0
    ? liveReports.map((r: any) => ({
        id: r.id,
        type: r.category,
        location: r.location ?? "Location not specified",
        status: r.status,
        submittedAt: new Date(r.created_at).toLocaleDateString(),
        upvotes: 0,
      }))
    : SAMPLE_REPORTS;

  const submitReportMutation = useMutation({
    mutationFn: async (report: { category: string; description: string; location: string; severity: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to submit a report");
      const { error } = await (supabase as any).from("defense_neighbor_safety_reports").insert({
        reporter_id: user.id,
        category: report.category,
        description: report.description,
        location: report.location,
        severity: report.severity,
        status: "open",
        marks_reward: 10,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defense_neighbor_safety_reports", "open"] });
      toast({ title: "Report submitted!", description: "+10 Marks earned for this safety contribution." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <LaunchConditionOverlay initiativeSlug="defense-klaus" initiativeName="Defense Klaus">
      <PortalPageLayout maxWidth="xl" xrayId="defense-klaus-community">

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 flex-wrap">
          <div className="p-3 bg-red-600 rounded-full text-white shrink-0">
            <Shield className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-4xl font-bold text-foreground">Defense Klaus</h1>
              <Badge variant="outline" className="text-red-600 border-red-400">Initiative #8</Badge>
            </div>
            <p className="text-lg text-muted-foreground">
              Community safety coordination -- neighborhood watch, information sharing,
              and emergency contact networks. Built by neighbors, for neighbors.
            </p>
          </div>
        </div>

        {/* Switzerland Policy Banner */}
        <Card className="border-cyan-500/30 bg-cyan-500/5 mb-8">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-cyan-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm">Switzerland Policy -- Community Safety Edition</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Defense Klaus is apolitical and non-partisan. This platform does{" "}
                  <strong>not</strong> advocate for or against any law enforcement approach,
                  political policy, or ideological framework. We coordinate neighbors -- we
                  do not coordinate politics. Any content that crosses into law enforcement
                  advocacy or political framing is auto-flagged for Switzerland Protocol review.
                </p>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Neighborhood safety coordination
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Emergency contact networks
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Safety information sharing
                  </span>
                  <span className="flex items-center gap-1.5 text-red-500">
                    <AlertTriangle className="h-3 w-3" /> No law enforcement advocacy
                  </span>
                  <span className="flex items-center gap-1.5 text-red-500">
                    <AlertTriangle className="h-3 w-3" /> No political content
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <MapPin className="h-6 w-6 mx-auto text-amber-500 mb-1" />
              <p className="text-2xl font-bold text-foreground">247</p>
              <p className="text-xs text-muted-foreground">Active Watch Zones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Users className="h-6 w-6 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold text-foreground">1,842</p>
              <p className="text-xs text-muted-foreground">Network Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <ClipboardList className="h-6 w-6 mx-auto text-emerald-500 mb-1" />
              <p className="text-2xl font-bold text-foreground">89</p>
              <p className="text-xs text-muted-foreground">Open Safety Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Award className="h-6 w-6 mx-auto text-purple-500 mb-1" />
              <p className="text-2xl font-bold text-foreground">12,450</p>
              <p className="text-xs text-muted-foreground">Safety Marks Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1">
            <TabsTrigger value="overview" className="py-2.5">
              <Shield className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="watch" className="py-2.5">
              <Eye className="w-4 h-4 mr-2" /> Watch Zones
            </TabsTrigger>
            <TabsTrigger value="reports" className="py-2.5">
              <ClipboardList className="w-4 h-4 mr-2" /> Safety Reports
            </TabsTrigger>
            <TabsTrigger value="marks" className="py-2.5">
              <Award className="w-4 h-4 mr-2" /> Earn Marks
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              Defense Klaus is the community safety coordination layer of Liana Banyan.
              It is <strong>not</strong> the physical product (that is Wave 21 -- the
              spinout). This is the coordination infrastructure: how neighbors organize,
              share safety information, build emergency contact networks, and earn Marks
              for contributing to community safety.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              {SAFETY_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card key={pillar.id} className={`border ${pillar.border}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${pillar.bg}`}>
                          <Icon className={`h-5 w-5 ${pillar.color}`} />
                        </div>
                        <CardTitle className="text-base leading-tight">{pillar.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-2">{pillar.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {pillar.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className={`h-3 w-3 mt-0.5 shrink-0 ${pillar.color}`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Physical product callout */}
            <Card className="border-slate-500/20 bg-slate-500/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Defense Klaus Wearable -- Coming in Wave 21</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      The physical NFC/Bluetooth bracelet, 24/7 monitoring, and pooled legal defense
                      fund are being built as a spinout. The community coordination layer (this page)
                      operates independently -- you can participate in neighborhood safety right now
                      without the wearable device.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2 text-xs"
                      onClick={() => navigate("/spinouts/defense-klaus")}
                    >
                      View Spinout Plan
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WATCH ZONES */}
          <TabsContent value="watch" className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-foreground">Neighborhood Watch Zones</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Overlapping zones ensure continuous coverage. Every zone has a lead and a
                  backup. Zones coordinate -- not compete.
                </p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <MapPin className="h-4 w-4" />
                Register My Zone
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { zone: "Zone A-7", lead: "M. Torres", members: 12, status: "active", coverage: 85 },
                { zone: "Zone B-3", lead: "K. Nkemdirim", members: 8, status: "active", coverage: 70 },
                { zone: "Zone C-11", lead: "Seeking Lead", members: 4, status: "needs-lead", coverage: 40 },
              ].map((zone) => (
                <Card key={zone.zone} className={zone.status === "needs-lead" ? "border-amber-500/30" : "border-emerald-500/30"}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-foreground">{zone.zone}</p>
                      <Badge className={zone.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                        {zone.status === "active" ? "Active" : "Needs Lead"}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>{zone.lead}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        <span>{zone.members} members</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Coverage</span>
                        <span>{zone.coverage}%</span>
                      </div>
                      <Progress value={zone.coverage} className="h-2" />
                    </div>
                    {zone.status === "needs-lead" && (
                      <Button size="sm" variant="outline" className="w-full mt-3 text-amber-600 border-amber-300 hover:bg-amber-50 text-xs">
                        Volunteer as Lead
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* How watch zones work */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How Watch Zones Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {[
                  { step: "1", title: "Define your block", desc: "Use the zone map to outline your watch area. Zones should overlap by at least 10% with adjacent zones." },
                  { step: "2", title: "Recruit neighbors", desc: "Every zone needs a lead and at least 4 members. More members means better coverage and more eyes." },
                  { step: "3", title: "Set your cadence", desc: "Agree on a check-in frequency: daily for dense areas, weekly for quieter neighborhoods." },
                  { step: "4", title: "Log and share", desc: "Non-emergency safety observations go to the zone log. Anything urgent uses the emergency contact chain." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-red-600">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SAFETY REPORTS */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-foreground">Community Safety Reports</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Document safety concerns with location and evidence. Reports are aggregated
                  to show neighborhood safety patterns and escalated to appropriate channels.
                </p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <ClipboardList className="h-4 w-4" />
                Submit Report
              </Button>
            </div>

            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="py-3 text-xs text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Switzerland Policy reminder:</strong> Reports
                  must describe observable safety conditions only. No political commentary, no
                  advocacy for or against law enforcement agencies, no ideological framing.
                  Factual, location-specific, and actionable only.
                </span>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className={`cursor-pointer hover:border-primary/30 transition-colors ${activeReport === report.id ? "border-primary/50" : ""}`}
                  onClick={() => setActiveReport(activeReport === report.id ? null : report.id)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                            {report.type}
                          </Badge>
                          <Badge className={`text-xs ${STATUS_BADGE[report.status]}`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground font-medium">{report.location}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Submitted {report.submittedAt}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        {report.upvotes} neighbors confirm
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="py-4 text-center text-muted-foreground">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Showing sample reports.</p>
                <p className="text-xs mt-1">Real reports are pulled from your registered zone.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EARN MARKS */}
          <TabsContent value="marks" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Award className="h-6 w-6 text-purple-500" />
                Earn Safety Marks
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Marks are cooperative participation records -- not currency, not equity.
                Safety Marks document your contribution to community safety.
                They unlock posting rights, council eligibility, and recognition in the
                Community Safety Council election.
              </p>
            </div>

            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="py-3 text-xs text-muted-foreground flex items-start gap-2">
                <Lock className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <span>
                  <strong className="text-foreground">DNA Lock reminder:</strong> Marks are
                  cooperative participation records only. They confer no equity, ownership,
                  or financial interest in the cooperative or any spinout. This is encoded in
                  the operating agreement and cannot be changed by any vote.
                </span>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {SAFETY_MARKS.map((item, idx) => (
                <Card key={idx} className="hover:border-primary/30 transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted rounded-lg shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground">{item.action}</p>
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0">
                            +{item.marks} Marks
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Marks use cases */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What Safety Marks Unlock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {[
                  { threshold: 10, unlock: "Community safety board posting rights" },
                  { threshold: 25, unlock: "Zone Lead eligibility" },
                  { threshold: 50, unlock: "Safety training facilitator badge" },
                  { threshold: 100, unlock: "Community Safety Council election eligibility" },
                  { threshold: 200, unlock: "Verified Safety Coordinator recognition" },
                ].map((row) => (
                  <div key={row.threshold} className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-muted-foreground">{row.unlock}</span>
                    </div>
                    <Badge variant="outline" className="text-xs text-amber-600">
                      {row.threshold} Marks
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Emergency contact network CTA */}
        <div className="mt-10 p-6 bg-red-950/30 border border-red-800/50 rounded-xl">
          <div className="flex items-start gap-4 flex-wrap">
            <Phone className="h-8 w-8 text-red-400 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">Build Your Emergency Contact Network</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Know who to call before you need to call them. Emergency contact networks
                are built zone-by-zone. Verify your chain quarterly to keep it active.
                A verified chain earns 10 Marks per quarter.
              </p>
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Network className="h-4 w-4" />
                Build My Network
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center border-t border-border pt-8">
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">Defense Klaus</strong> -- Initiative #8
          </p>
          <p className="text-xs mt-2 text-muted-foreground/70">
            Community safety coordination. Switzerland Policy enforced. No politics, no advocacy -- just neighbors.
          </p>
        </div>

      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
