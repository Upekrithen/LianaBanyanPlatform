/**
 * HEXEL SLOTTED TOP DETAIL PAGE
 * ==============================
 * The comprehensive detail page for the SlottedTop — Innovation #1552.
 * Week 1 of the weekly Hexel component series.
 *
 * This is a promotional page, not addressed to any individual.
 * Written for universal audiences: hex gamers, terrain makers,
 * 3D printers, manufacturers, potential partners, competitors.
 *
 * Route: /hexisle/hexels/slotted-top
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Hexagon, Cog, Shield, Wrench, Award, Crown, Layers,
  ArrowRight, ArrowLeft, CheckCircle2, Circle, AlertCircle,
  Zap, Factory, Users, Trophy, Download, Printer, Target,
  Calendar, Package, Handshake, ChevronRight,
} from "lucide-react";
import {
  COMPATIBLE_SYSTEMS, SLOTTED_TOP_HIGHLIGHTS, INNOVATION_1552,
  HEXEL_STACK, TRAP_MODES, GORGON_MECHANISM, ECOSYSTEM_NARRATIVE,
  CENTER_HEX_ANALYSIS, GAP_ANALYSIS, WIDENING_TRADEOFFS, STRATEGIC_CALL,
  MANUFACTURING_PATH, MANUFACTURING_PHILOSOPHY, DESIGN_CONTESTS,
  BOUNTY_PROGRAMS, WEEKLY_RELEASES, MODULAR_PRODUCT, COLLABORATION_INVITE,
  FOUNDER_STORY, ANCILLARY_DESIGN_PROGRAM, RELEASE_CADENCE, COMMUNITY_ENGAGEMENT,
  CENTER_HEX_MM, GAP_MM, RETENTION_ZONE_MM, TOTAL_PIECE_MM,
  type CompatibilityRating, type HexTerrainSystem,
} from "@/lib/hexSlottedTopShowcase";

// ─── Rating Styling ────────────────────────────────────────────────────────

const RATING_STYLE: Record<CompatibilityRating, string> = {
  perfect: "text-green-500 bg-green-500/10",
  excellent: "text-emerald-500 bg-emerald-500/10",
  good: "text-blue-500 bg-blue-500/10",
  near: "text-amber-500 bg-amber-500/10",
  incompatible: "text-red-500 bg-red-500/10",
};

// ─── Section Components ────────────────────────────────────────────────────

function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900/30 text-white p-8 md:p-12">
      {/* Hex pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">
            <Zap className="w-3 h-3 mr-1" /> Innovation #1552
          </Badge>
          <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30">Patent Protected</Badge>
          <Badge className="bg-white/10 text-white/70 border-white/20">Hexel Stack #14 of 14</Badge>
          <Badge className="bg-green-500/15 text-green-300 border-green-500/30">
            <Calendar className="w-3 h-3 mr-1" /> Week 1 Release
          </Badge>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-amber-300 via-white to-cyan-300 bg-clip-text text-transparent">
          SlottedTop
        </h1>
        <p className="text-xl md:text-2xl text-white/80 mb-2">
          {ECOSYSTEM_NARRATIVE.subtitle}
        </p>
        <p className="text-base text-white/60 max-w-3xl mb-4">
          {ECOSYSTEM_NARRATIVE.thesis}
        </p>
        <p className="text-sm text-white/50 max-w-3xl italic">
          {ECOSYSTEM_NARRATIVE.competitorInvite}
        </p>
      </div>
    </div>
  );
}

function DimensionalAnalysisSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Wrench className="w-6 h-6 text-cyan-500" />
        Engineering: Why These Dimensions Are Right
      </h2>

      <div className="grid md:grid-cols-4 gap-3">
        <Card className="border-amber-500/20">
          <CardContent className="pt-4 text-center">
            <div className="font-mono text-3xl font-bold text-amber-500">{CENTER_HEX_MM}mm</div>
            <p className="text-sm text-muted-foreground">Center Hex (flat-to-flat)</p>
          </CardContent>
        </Card>
        <Card className="border-cyan-500/20">
          <CardContent className="pt-4 text-center">
            <div className="font-mono text-3xl font-bold text-cyan-500">{GAP_MM}mm</div>
            <p className="text-sm text-muted-foreground">Gap Width (per side)</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20">
          <CardContent className="pt-4 text-center">
            <div className="font-mono text-3xl font-bold text-green-500">{RETENTION_ZONE_MM}mm</div>
            <p className="text-sm text-muted-foreground">Retention Zone (max tile)</p>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20">
          <CardContent className="pt-4 text-center">
            <div className="font-mono text-3xl font-bold text-purple-500">{TOTAL_PIECE_MM}mm</div>
            <p className="text-sm text-muted-foreground">Total Piece (flat-to-flat)</p>
          </CardContent>
        </Card>
      </div>

      {/* Center Hex Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">The 24mm Center Hex &mdash; Perfect As-Is</CardTitle>
          <CardDescription>
            The center hex is what the terrain tile sits on. 24mm gives 4-5mm of overhang across the
            entire target range &mdash; enough edge for pincers to grip, enough center for the tile to sit flat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Tile System</th>
                  <th className="text-right py-2 px-4">Tile Size</th>
                  <th className="text-right py-2 px-4">Overhang/side</th>
                  <th className="text-right py-2 px-4">Clearance/side</th>
                  <th className="text-left py-2 pl-4">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {CENTER_HEX_ANALYSIS.map((row) => (
                  <tr key={row.label} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium">{row.label}</td>
                    <td className="text-right py-2 px-4 font-mono">{row.tileSizeMm}mm</td>
                    <td className="text-right py-2 px-4 font-mono">{row.overhangPerSideMm}mm</td>
                    <td className="text-right py-2 px-4 font-mono">{row.clearancePerSideMm}mm</td>
                    <td className="py-2 pl-4">
                      <Badge variant="outline" className="text-green-600 bg-green-500/10 border-green-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {row.verdict}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gap Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">The 6mm Gap &mdash; Goldilocks Zone</CardTitle>
          <CardDescription>{GAP_ANALYSIS.retentionZoneFormula}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong>Clearance range:</strong> {GAP_ANALYSIS.clearanceRange}</p>
          <p><strong>Pincer behavior:</strong> {GAP_ANALYSIS.pincerBehavior}</p>
          <p><strong>WarHex sweet spot:</strong> {GAP_ANALYSIS.warHexIdeal}</p>
        </CardContent>
      </Card>

      {/* Wide Adapter Variant */}
      <Card className="border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            Future: Wide Adapter Variant
          </CardTitle>
          <CardDescription>{STRATEGIC_CALL.wideAdapterVariant.note}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Center Hex</p>
              <p className="font-mono font-bold">{STRATEGIC_CALL.wideAdapterVariant.centerHex}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Gap Width</p>
              <p className="font-mono font-bold">{STRATEGIC_CALL.wideAdapterVariant.gapWidth}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Retention Zone</p>
              <p className="font-mono font-bold">{STRATEGIC_CALL.wideAdapterVariant.retentionZone}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {STRATEGIC_CALL.wideAdapterVariant.purpose}. This variant is the first
            {" "}<strong>Design Contest</strong> &mdash; a community member designs it, wins licensing,
            and it becomes an Official Tereno HexIsle Model.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ManufacturingSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Factory className="w-6 h-6 text-amber-500" />
        Manufacturing Path: Garage to Factory Floor
      </h2>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm space-y-2 text-muted-foreground">
          <p className="font-medium text-foreground">{MANUFACTURING_PHILOSOPHY.core}</p>
          <p><strong>SLS machine funding:</strong> {MANUFACTURING_PHILOSOPHY.slsMachineModel}</p>
          <p><strong>Node placement:</strong> {MANUFACTURING_PHILOSOPHY.nodePlacement}</p>
          <p><strong>Pricing:</strong> {MANUFACTURING_PHILOSOPHY.pricing}</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {MANUFACTURING_PATH.map((stage) => (
          <Card key={stage.phase}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 font-bold shrink-0">
                  {stage.phase}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{stage.name}</h3>
                    <Badge variant="outline" className="text-xs">{stage.method}</Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                    <span>{stage.unitRange}</span>
                    <span>{stage.costPerUnit}/unit</span>
                    <span>{stage.timeline}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ContestsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="w-6 h-6 text-amber-500" />
        Design Contests &mdash; Official Tereno HexIsle Models
      </h2>

      <p className="text-muted-foreground">
        Win a design contest and your creation becomes an Official Tereno HexIsle Model.
        Licensing included. You keep 83.3% of every sale. Manufactured at the nearest Node.
      </p>

      {DESIGN_CONTESTS.map((contest) => (
        <Card key={contest.name} className="border-amber-500/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{contest.name}</CardTitle>
              <Badge className="bg-amber-500/10 text-amber-600">{contest.category}</Badge>
            </div>
            <CardDescription>{contest.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-3 text-amber-600">{contest.prize}</p>
            <div>
              <h4 className="text-sm font-semibold mb-2">Integration Rules (must pass all):</h4>
              <ul className="space-y-1">
                {contest.integrationRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BountiesSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Zap className="w-6 h-6 text-blue-500" />
        Bounty Programs &mdash; Earn While You Build
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {BOUNTY_PROGRAMS.map((bounty) => (
          <Card key={bounty.title}>
            <CardHeader>
              <CardTitle className="text-base">{bounty.title}</CardTitle>
              <CardDescription>
                <span className="font-mono font-bold text-foreground">{bounty.reward} {bounty.currency}</span>
                {" "}per completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{bounty.description}</p>
              <ul className="space-y-1">
                {bounty.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-blue-500" />
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WeeklySeriesSection() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary" />
        Weekly Release Series &mdash; 12 Weeks to a Complete Hexel
      </h2>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">{MODULAR_PRODUCT.startNow}</p>
          <p>{MODULAR_PRODUCT.description}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {WEEKLY_RELEASES.map((release) => (
          <Card
            key={release.week}
            className={`cursor-pointer transition-all hover:shadow-md ${
              release.status === "released"
                ? "border-green-500/30 bg-green-500/5"
                : release.status === "upcoming"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "opacity-70"
            }`}
            onClick={() => release.status === "released" && navigate(release.detailPageRoute)}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  release.status === "released" ? "bg-green-500 text-white" :
                  release.status === "upcoming" ? "bg-amber-500 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {release.week}
                </div>
                <div>
                  <p className="font-bold text-sm">{release.partName}</p>
                  <p className="text-xs text-muted-foreground">Stack #{release.stackPosition}</p>
                </div>
                <Badge
                  className="ml-auto text-[10px]"
                  variant={release.status === "released" ? "default" : "outline"}
                >
                  {release.status === "released" ? "LIVE" : release.status === "upcoming" ? "NEXT" : `Week ${release.week}`}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{release.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 7-Hexel Modular Product */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {MODULAR_PRODUCT.name}
          </CardTitle>
          <CardDescription>{MODULAR_PRODUCT.hexelCount} Hexels &mdash; The Actual Product</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2">
            {MODULAR_PRODUCT.whyModular.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function CollaborationSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Handshake className="w-6 h-6 text-green-500" />
        {COLLABORATION_INVITE.headline}
      </h2>
      <p className="text-muted-foreground">{COLLABORATION_INVITE.subheadline}</p>

      <div className="grid md:grid-cols-2 gap-4">
        {COLLABORATION_INVITE.points.map((point) => (
          <Card key={point.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{point.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-cyan-500/5">
        <CardContent className="pt-6 text-center">
          <p className="text-lg font-medium mb-2">{COLLABORATION_INVITE.ctaLine}</p>
          <p className="text-sm text-muted-foreground">
            {ECOSYSTEM_NARRATIVE.ipSharing}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CommunitySection() {
  return (
    <div className="space-y-6">
      {/* Founder's Story */}
      <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-cyan-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-green-500" />
            {FOUNDER_STORY.headline}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{FOUNDER_STORY.narrative}</p>
          <div className="rounded-lg border border-green-500/20 p-4 bg-green-500/5">
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">{FOUNDER_STORY.freeSTLs.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{FOUNDER_STORY.freeSTLs.description}</p>
            <p className="text-xs text-muted-foreground italic">{FOUNDER_STORY.freeSTLs.license}</p>
          </div>
        </CardContent>
      </Card>

      {/* Release Cadence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            {RELEASE_CADENCE.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium mb-1">Weekly Updates</p>
              <p className="text-xs text-muted-foreground">{RELEASE_CADENCE.updates}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium mb-1">File Drops</p>
              <p className="text-xs text-muted-foreground">{RELEASE_CADENCE.fileDrops}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{RELEASE_CADENCE.ahead}</p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">{RELEASE_CADENCE.promise}</p>
        </CardContent>
      </Card>

      {/* Ancillary Design Program — 6 Month Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            {ANCILLARY_DESIGN_PROGRAM.title}
          </CardTitle>
          <CardDescription>Opens: {ANCILLARY_DESIGN_PROGRAM.openDate}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{ANCILLARY_DESIGN_PROGRAM.description}</p>

          {/* Timeline */}
          <div className="space-y-3">
            {Object.values(ANCILLARY_DESIGN_PROGRAM.timeline).map((phase) => (
              <div key={phase.label} className="rounded-lg border p-4">
                <h4 className="font-semibold text-sm mb-2">{phase.label}</h4>
                <ul className="space-y-1">
                  {phase.tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground italic">{ANCILLARY_DESIGN_PROGRAM.whySixMonths}</p>
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{ANCILLARY_DESIGN_PROGRAM.countdown}</p>
        </CardContent>
      </Card>

      {/* Discord Q&A */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            {COMMUNITY_ENGAGEMENT.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{COMMUNITY_ENGAGEMENT.description}</p>

          <div className="rounded-lg border border-purple-500/20 p-4 bg-purple-500/5">
            <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
              {COMMUNITY_ENGAGEMENT.discord.title}
            </h4>
            <p className="text-sm text-muted-foreground mb-1">{COMMUNITY_ENGAGEMENT.discord.description}</p>
            <p className="text-xs text-muted-foreground italic">{COMMUNITY_ENGAGEMENT.discord.format}</p>
          </div>

          {/* What We Need */}
          <div>
            <h4 className="font-semibold mb-3">Who We Need</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {COMMUNITY_ENGAGEMENT.whatWeNeed.map((role) => (
                <div key={role.role} className="rounded-lg border p-3">
                  <p className="text-sm font-medium mb-1">{role.role}</p>
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            {COMMUNITY_ENGAGEMENT.invitation}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function HexelSlottedTopDetail() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => navigate("/hexisle")} className="hover:text-foreground transition-colors">
          HexIsle
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate("/hexisle")} className="hover:text-foreground transition-colors">
          Hexels
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">SlottedTop</span>
      </div>

      {/* Hero */}
      <HeroSection />

      {/* Tabbed Content */}
      <Tabs defaultValue="engineering" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
          <TabsTrigger value="contests">Contests</TabsTrigger>
          <TabsTrigger value="bounties">Bounties</TabsTrigger>
          <TabsTrigger value="series">Weekly Series</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="engineering">
          <DimensionalAnalysisSection />
        </TabsContent>

        <TabsContent value="manufacturing">
          <ManufacturingSection />
        </TabsContent>

        <TabsContent value="contests">
          <ContestsSection />
        </TabsContent>

        <TabsContent value="bounties">
          <BountiesSection />
        </TabsContent>

        <TabsContent value="series">
          <WeeklySeriesSection />
        </TabsContent>

        <TabsContent value="community">
          <CommunitySection />
        </TabsContent>
      </Tabs>

      {/* Collaboration Invite (always visible at bottom) */}
      <CollaborationSection />

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => navigate("/hexisle")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to HexIsle
        </Button>
        <Button variant="outline" onClick={() => navigate("/hexisle/hexels/sawtooth-coral")}>
          Next: SawtoothCoral <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
