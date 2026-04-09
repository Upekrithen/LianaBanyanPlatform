/**
 * COASTER MEDALLION PROJECT — The Universal Physical Token
 * =========================================================
 * Innovation #1464: DaisyChainLink Architecture
 * Innovation #1466: Coaster Medallion as Standalone Project
 *
 * The Coaster Medallion is a PROJECT under Brass Tacks (#16) that
 * DaisyChainLinks to EVERY other project on the platform.
 *
 * It prints the physical medallion that represents membership/stake
 * in any project. It IS the physical manifestation of backing something.
 *
 * Origin: QR card → tea mug → compliant mechanism counter → medallion
 * Literary reference: Just So Stories — "How the Medallion Got Its Shape"
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Hexagon, Link2, QrCode, Cog, Factory, Package, Crown,
  ArrowRight, Sparkles, Shield, Star, Printer, TrendingUp,
  Users, Coins, Wrench, BookOpen, Zap, ChevronRight,
  Network, Map, Compass, Heart,
} from 'lucide-react';

import { DaisyChainLinkVisualizer } from '@/components/DaisyChainLinkVisualizer';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { COASTER_MEDALLION_PROJECT, SWEET_SIXTEEN, HEXISLE_PROJECT } from '@/lib/daisyChainLink';

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTION LEVELS — Volume Discount Tiers
// ═══════════════════════════════════════════════════════════════════════════════

const PRODUCTION_LEVELS = COASTER_MEDALLION_PROJECT.manufacturing.productionLevels;

// ═══════════════════════════════════════════════════════════════════════════════
// ORIGIN STORY — "How the Medallion Got Its Shape" (a Just So Story)
// ═══════════════════════════════════════════════════════════════════════════════

const ORIGIN_PHASES = [
  {
    phase: 1,
    title: 'The QR Card',
    description: 'Started as a QR code business card for the platform. Scan it, see your project.',
    icon: QrCode,
    color: 'text-blue-500',
  },
  {
    phase: 2,
    title: 'The Tea Mug Coaster',
    description: 'The card was too big, too wasteful. Why not embed it in something useful? A coaster.',
    icon: Compass,
    color: 'text-amber-600',
  },
  {
    phase: 3,
    title: 'The Counter',
    description: 'The coaster needed a way to track engagement. Added a compliant mechanism counter — a physical click tracker built into the hex shape.',
    icon: Cog,
    color: 'text-green-500',
  },
  {
    phase: 4,
    title: 'The Medallion',
    description: 'The counter medallion became the universal token for project backing. Your proof. Your skin in the game.',
    icon: Hexagon,
    color: 'text-primary',
  },
  {
    phase: 5,
    title: 'The DaisyChain',
    description: 'The medallion links to every project. Buy one, you\'re connected. Buy many, Chain Voting bonuses stack. The physical glue of the cooperative.',
    icon: Link2,
    color: 'text-purple-500',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURES — What makes the medallion special
// ═══════════════════════════════════════════════════════════════════════════════

const MEDALLION_FEATURES = [
  {
    title: 'QR Code',
    description: 'Links to project page + member profile. Scan to verify authenticity and see your contribution.',
    icon: QrCode,
  },
  {
    title: 'Compliant Mechanism Counter',
    description: 'A physical click tracker built into the hexagonal shape. Tracks engagements without electronics.',
    icon: Cog,
  },
  {
    title: 'Project-Specific Design',
    description: 'Each project\'s medallion has unique artwork on the face. Your medallion tells people what you backed.',
    icon: Star,
  },
  {
    title: 'Universal LB Reverse',
    description: 'The Liana Banyan logo on the back of every medallion. The stamp that connects all projects.',
    icon: Crown,
  },
  {
    title: 'Verified Serial',
    description: 'Each medallion\'s serial number matches its NFT on Base if the project elects to mint on-chain.',
    icon: Shield,
  },
  {
    title: 'DaisyChainLink',
    description: 'Physical proof of your network connection. Cross-purchase across linked projects for Joule bonuses.',
    icon: Link2,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CoasterMedallionProject() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <PortalPageLayout maxWidth="xl" xrayId="coaster-medallion">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex p-4 rounded-full bg-amber-500/10 mb-4">
          <Hexagon className="h-12 w-12 text-amber-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2">The Coaster Medallion</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The physical proof of everything you back. One hexagonal token,
          connected to every project on the platform.
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
            <Crown className="h-3 w-3 mr-1" /> Brass Tacks Initiative (#16)
          </Badge>
          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
            <Link2 className="h-3 w-3 mr-1" /> DaisyChainLinked to ALL Projects
          </Badge>
          <Badge variant="outline">
            <Factory className="h-3 w-3 mr-1" /> Designed in Fusion 360
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="origin">Origin Story</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
          <TabsTrigger value="daisychain">DaisyChain</TabsTrigger>
          <TabsTrigger value="economics">Economics</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* What Is It */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hexagon className="h-5 w-5 text-amber-500" />
                What is the Coaster Medallion?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Every project on the Liana Banyan platform gets a physical medallion. When you back a
                project, support an initiative, or join a guild — you earn a Coaster Medallion for that
                connection. It{"\u0027"}s not a trophy. It{"\u0027"}s not a toy. It{"\u0027"}s a physical, hexagonal proof
                that you showed up and put skin in the game.
              </p>
              <p className="text-muted-foreground">
                Your QR code. Your compliant mechanism counter. Your {"\u201C"}Just So Story{"\u201D"} made real.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEDALLION_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* DaisyChain Compact */}
          <DaisyChainLinkVisualizer
            projectId={COASTER_MEDALLION_PROJECT.id}
            projectName={COASTER_MEDALLION_PROJECT.name}
            variant="compact"
          />

          {/* Initiative Coverage */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Connected to All 16 Initiatives
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SWEET_SIXTEEN.map((init) => (
                  <div
                    key={init.slug}
                    className="p-2 rounded-lg bg-background border text-center"
                  >
                    <div className="text-xs font-bold text-primary">#{init.number}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                      {init.name.length > 25
                        ? init.name.split('(')[0].trim().split('/')[0].trim()
                        : init.name}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ORIGIN STORY TAB — "How the Medallion Got Its Shape" */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="origin" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                How the Medallion Got Its Shape
              </CardTitle>
              <CardDescription>
                A Just So Story — how a QR code became the physical backbone of a cooperative.
                (Kipling would approve.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-8">
                  {ORIGIN_PHASES.map((phase) => {
                    const Icon = phase.icon;
                    return (
                      <div key={phase.phase} className="relative flex items-start gap-4 pl-2">
                        {/* Timeline dot */}
                        <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${phase.color}`} />
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">Phase {phase.phase}</Badge>
                            <h4 className="font-bold">{phase.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Literary Reference */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <BookOpen className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 dark:text-amber-400">Literary DNA</h4>
                  <p className="text-sm text-amber-900/70 dark:text-amber-200/70 mt-1">
                    <strong>Just So Stories</strong> by Rudyard Kipling — {"\u201C"}How the Leopard Got His Spots,{"\u201D"}
                    {"\u201C"}How the Camel Got His Hump.{"\u201D"} Every origin story in the platform is a
                    Just So Story. The medallion{"\u0027"}s origin — from QR card to coaster to counter to
                    universal token — is ours.
                  </p>
                  <p className="text-sm text-amber-900/70 dark:text-amber-200/70 mt-2">
                    <strong>Jason and the Argonauts</strong> — Each project is a hero on the Argo.
                    The DaisyChain is the ship that carries them all. The Coaster Medallion is
                    the golden fleece they share.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MANUFACTURING TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="manufacturing" className="space-y-6 mt-6">
          {/* Design Software */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Design & Prototyping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="font-bold text-sm">Design Software</div>
                  <div className="text-2xl font-bold text-primary mt-1">Fusion 360</div>
                  <div className="text-xs text-muted-foreground">Autodesk — parametric CAD</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="font-bold text-sm">Prototype Printer</div>
                  <div className="text-2xl font-bold text-primary mt-1">Form 4</div>
                  <div className="text-xs text-muted-foreground">Formlabs — $4,499 SLA printer</div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="font-bold text-sm">Bulk Resin</div>
                  <div className="text-2xl font-bold text-primary mt-1">$35/L</div>
                  <div className="text-xs text-muted-foreground">Minimum bulk pricing</div>
                </div>
              </div>

              {/* Formlabs Integration */}
              <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Printer className="h-4 w-4 text-orange-500" />
                  <span className="font-bold text-sm">Formlabs Integration</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium">Local API:</span>
                    <span className="text-muted-foreground ml-1">PreFormServer — job submission</span>
                  </div>
                  <div>
                    <span className="font-medium">Web API:</span>
                    <span className="text-muted-foreground ml-1">Fleet monitoring, OAuth 2.0</span>
                  </div>
                  <div>
                    <span className="font-medium">Python SDK:</span>
                    <span className="text-muted-foreground ml-1">formlabs/formlabs-api-python</span>
                  </div>
                  <div>
                    <span className="font-medium">Form Now:</span>
                    <span className="text-muted-foreground ml-1">On-demand overflow at now.formlabs.com</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Manufacturing Volume Discount
              </CardTitle>
              <CardDescription>
                We don{"\u0027"}t guess demand. We prove it. Back early at a higher price, and if we reach
                a lower tier — you get the difference back as Joules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PRODUCTION_LEVELS.map((level, i) => {
                  // Level 1 is current — we're in prototyping phase (honest state)
                  const isActive = i === 0;

                  return (
                    <div
                      key={level.level}
                      className={`p-4 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-primary/5 border-primary'
                          : 'bg-muted/10 border-muted-foreground/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`font-mono font-bold ${
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            Lvl {level.level}
                          </span>
                          <span className={`font-medium ${isActive ? '' : 'text-muted-foreground'}`}>
                            {level.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({level.method})
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">
                            {level.units.toLocaleString()} units
                          </span>
                          <span className="font-bold text-lg">
                            ${level.unitPrice}
                          </span>
                          {isActive && <Badge>Current</Badge>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Maker Pivot */}
          <Card className="border-2 border-orange-500/20 bg-orange-500/5">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-orange-500/10 p-4 rounded-full">
                <Printer className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-orange-800 dark:text-orange-400 mb-2">
                  Have a 3D Printer? Become a Pioneer Node.
                </h3>
                <p className="text-sm text-orange-900/80 dark:text-orange-200/80">
                  Register your Formlabs printer as a manufacturing node. Print medallions
                  for your region and earn 83.3% of the manufacturing margin. The platform
                  sends you jobs via the PreFormServer API. You print, quality-check, and ship.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-orange-600 border-orange-500/30">
                    Form 4 or Form 3+ required
                  </Badge>
                  <Badge variant="outline" className="text-orange-600 border-orange-500/30">
                    83.3% creator share
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DAISYCHAIN TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="daisychain" className="space-y-6 mt-6">
          <DaisyChainLinkVisualizer
            projectId={COASTER_MEDALLION_PROJECT.id}
            projectName={COASTER_MEDALLION_PROJECT.name}
            variant="full"
          />

          {/* How DaisyChainLink Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                How DaisyChainLink Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border text-center">
                  <div className="p-3 rounded-full bg-amber-500/10 inline-block mb-2">
                    <Hexagon className="h-6 w-6 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-sm">Auto-Link</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Every new project automatically DaisyChainLinks to the Coaster Medallion.
                    No setup needed.
                  </p>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <div className="p-3 rounded-full bg-purple-500/10 inline-block mb-2">
                    <ArrowRight className="h-6 w-6 text-purple-500" style={{ transform: 'rotate(-45deg)' }} />
                  </div>
                  <h4 className="font-bold text-sm">Senior Pics Swap</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Projects can swap medallion designs with each other — like trading
                    senior pictures. Both audiences discover each other.
                  </p>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <div className="p-3 rounded-full bg-green-500/10 inline-block mb-2">
                    <Sparkles className="h-6 w-6 text-green-500" />
                  </div>
                  <h4 className="font-bold text-sm">Chain Voting Bonus</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Back projects across the chain: +5% Joule bonus per link,
                    stacking to 100%, sustaining at 20%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ECONOMICS TAB */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="economics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Creator Economics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Creator Economics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <span className="font-medium text-sm">Creator/Maker Share</span>
                    <span className="font-bold text-green-600 text-xl">83.3%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                    <span className="font-medium text-sm">Platform Margin</span>
                    <span className="font-bold text-muted-foreground">Cost + 20%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                    <span className="font-medium text-sm">Pool Contribution</span>
                    <span className="font-bold text-muted-foreground">33.33% of pledges</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <span className="font-medium text-sm">Chain Voting Bonus</span>
                    <span className="font-bold text-amber-600">+5% per link</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Joule Refund */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Early Backer Protection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If you back at Level 1 ($50) and we reach Level 4 ($15), you get the
                  $35 difference back as <strong>Joules</strong> — forever stamps that lock
                  in their exchange rate at the moment of purchase.
                </p>
                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">$35</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Maximum Joule refund (Level 1 → Level 6 differential)
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  This is not a {"\u201C"}return.{"\u201D"} It{"\u0027"}s a {"\u201C"}thank you for believing first.{"\u201D"}
                  The Joules are yours to spend anywhere on the platform, and their value
                  is frozen at the rate when they were issued — the {"\u201C"}Forever Stamp{"\u201D"} mechanic.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* The Killshot Quote */}
          <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="p-6">
              <blockquote className="text-center">
                <p className="text-lg font-medium italic">
                  {"\u201C"}At C20 per pool, a member in 4 pools pays C80/month but gets 4x what
                  they{"\u0027"}d have individually. With strangers, even. The pool doesn{"\u0027"}t care WHO
                  is in it, just that the economics work.{"\u201D"}
                </p>
              </blockquote>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
