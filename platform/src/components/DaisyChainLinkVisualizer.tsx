/**
 * DAISY CHAIN LINK VISUALIZER — Cross-Project Connection Graph
 * ==============================================================
 * Innovation #1465: DaisyChainLink Network Visualization
 *
 * Shows the network of connections radiating from any project.
 * The Coaster Medallion project shows ALL connections (universal hub).
 * Other projects show their specific DaisyChain neighborhood.
 *
 * Three views:
 * 1. Radial — Project at center, links radiating out (default)
 * 2. List — Sortable table of all connections with stats
 * 3. Initiative Map — Which of the Sweet Sixteen are connected
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Link2, Hexagon, ArrowRightLeft, Users, Sparkles,
  Network, List, Map, Zap, Crown, Package, Shield, Star,
  TrendingUp, QrCode, Coins, ChevronRight,
} from 'lucide-react';

import {
  DaisyChainLink,
  DaisyChainNetwork,
  LinkType,
  SWEET_SIXTEEN,
  COASTER_MEDALLION_PROJECT,
  buildDaisyChainNetwork,
  getLinkedProjects,
  getLinkedInitiatives,
  calculateChainVotingBonus,
} from '@/lib/daisyChainLink';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface DaisyChainLinkVisualizerProps {
  projectId: string;
  projectName: string;
  variant?: 'full' | 'compact' | 'badge-only';
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA — Initial DaisyChain connections for the Coaster Medallion project.
// These represent the canonical starting links. When daisy_chain_links table
// is populated in Supabase, this data will be supplemented by live queries.
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_LINKS: DaisyChainLink[] = [
  // Coaster Medallion → HexIsle
  {
    id: 'dcl-cm-hexisle',
    linkType: 'medallion',
    status: 'active',
    projectA: {
      id: COASTER_MEDALLION_PROJECT.id,
      name: 'Coaster Medallion',
      slug: 'coaster-medallion',
      initiative: 'Brass Tacks',
      initiativeSlug: 'brass-tacks',
    },
    projectB: {
      id: 'hexisle-tereno-001',
      name: 'HexIsle: Tereno Water Table',
      slug: 'hexisle',
      initiative: 'Brass Tacks',
      initiativeSlug: 'brass-tacks',
    },
    chainVotingBonus: 0.05,
    crossPurchaseCount: 142,
    jouleRewardsDistributed: 4260,
    createdAt: '2026-01-15T00:00:00Z',
    createdBy: 'SYSTEM',
    acceptedAt: '2026-01-15T00:00:00Z',
    acceptedBy: 'SYSTEM',
    physicalMedallionEligible: true,
    coasterMedallionProjectId: COASTER_MEDALLION_PROJECT.id,
  },
  // Coaster Medallion → Defense Klaus Bracelet
  {
    id: 'dcl-cm-dk',
    linkType: 'medallion',
    status: 'active',
    projectA: {
      id: COASTER_MEDALLION_PROJECT.id,
      name: 'Coaster Medallion',
      slug: 'coaster-medallion',
      initiative: 'Brass Tacks',
      initiativeSlug: 'brass-tacks',
    },
    projectB: {
      id: 'dk-bracelet-001',
      name: 'Defense Klaus Safety Bracelet',
      slug: 'dk-bracelet',
      initiative: 'Defense Klaus',
      initiativeSlug: 'defense-klaus',
    },
    chainVotingBonus: 0.05,
    crossPurchaseCount: 89,
    jouleRewardsDistributed: 2670,
    createdAt: '2026-01-20T00:00:00Z',
    createdBy: 'SYSTEM',
    acceptedAt: '2026-01-20T00:00:00Z',
    acceptedBy: 'SYSTEM',
    physicalMedallionEligible: true,
    coasterMedallionProjectId: COASTER_MEDALLION_PROJECT.id,
  },
  // HexIsle ↔ Modular Game Organizer (Senior Pics swap)
  {
    id: 'dcl-hexisle-organizer',
    linkType: 'senior-pics',
    status: 'active',
    projectA: {
      id: 'hexisle-tereno-001',
      name: 'HexIsle: Tereno Water Table',
      slug: 'hexisle',
      initiative: 'Brass Tacks',
      initiativeSlug: 'brass-tacks',
    },
    projectB: {
      id: 'game-organizer-001',
      name: 'Modular Game Organizer',
      slug: 'game-organizer',
      initiative: 'Brass Tacks',
      initiativeSlug: 'brass-tacks',
    },
    chainVotingBonus: 0.05,
    crossPurchaseCount: 47,
    jouleRewardsDistributed: 1410,
    createdAt: '2026-02-10T00:00:00Z',
    createdBy: 'founder-001',
    acceptedAt: '2026-02-15T00:00:00Z',
    acceptedBy: 'boardgamebeth',
    physicalMedallionEligible: true,
    coasterMedallionProjectId: COASTER_MEDALLION_PROJECT.id,
  },
  // Coaster Medallion → Rally Group Food Drive
  {
    id: 'dcl-cm-rally',
    linkType: 'medallion',
    status: 'active',
    projectA: {
      id: COASTER_MEDALLION_PROJECT.id,
      name: 'Coaster Medallion',
      slug: 'coaster-medallion',
      initiative: 'Brass Tacks',
      initiativeSlug: 'brass-tacks',
    },
    projectB: {
      id: 'rally-food-drive-001',
      name: 'Community Food Drive Tracker',
      slug: 'community-food-drive',
      initiative: 'Rally Group',
      initiativeSlug: 'rally-group',
    },
    chainVotingBonus: 0.05,
    crossPurchaseCount: 23,
    jouleRewardsDistributed: 690,
    createdAt: '2026-02-20T00:00:00Z',
    createdBy: 'SYSTEM',
    acceptedAt: '2026-02-20T00:00:00Z',
    acceptedBy: 'SYSTEM',
    physicalMedallionEligible: true,
    coasterMedallionProjectId: COASTER_MEDALLION_PROJECT.id,
  },
  // Coaster Medallion → JukeBox One Take Wonders
  {
    id: 'dcl-cm-jukebox',
    linkType: 'medallion',
    status: 'active',
    projectA: {
      id: COASTER_MEDALLION_PROJECT.id,
      name: 'Coaster Medallion',
      slug: 'coaster-medallion',
      initiative: 'Brass Tacks',
      initiativeSlug: 'brass-tacks',
    },
    projectB: {
      id: 'jukebox-otw-001',
      name: 'One Take Wonders Studio',
      slug: 'one-take-wonders',
      initiative: 'JukeBox',
      initiativeSlug: 'jukebox',
    },
    chainVotingBonus: 0.05,
    crossPurchaseCount: 34,
    jouleRewardsDistributed: 1020,
    createdAt: '2026-02-25T00:00:00Z',
    createdBy: 'SYSTEM',
    acceptedAt: '2026-02-25T00:00:00Z',
    acceptedBy: 'SYSTEM',
    physicalMedallionEligible: true,
    coasterMedallionProjectId: COASTER_MEDALLION_PROJECT.id,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LINK TYPE DISPLAY CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const LINK_TYPE_CONFIG: Record<LinkType, { label: string; icon: React.ElementType; color: string }> = {
  'medallion':        { label: 'Medallion Link',    icon: Hexagon,        color: 'text-amber-500' },
  'senior-pics':      { label: 'Senior Pics Swap',  icon: ArrowRightLeft, color: 'text-purple-500' },
  'parent-child':     { label: 'Parent → Child',    icon: ChevronRight,   color: 'text-blue-500' },
  'initiative-hub':   { label: 'Initiative Hub',    icon: Crown,          color: 'text-yellow-500' },
  'maker-product':    { label: 'Maker → Product',   icon: Package,        color: 'text-green-500' },
  'supply-chain':     { label: 'Supply Chain',      icon: TrendingUp,     color: 'text-cyan-500' },
  'cross-initiative': { label: 'Cross-Initiative',  icon: Network,        color: 'text-indigo-500' },
  'derivative':       { label: 'Derivative',        icon: Star,           color: 'text-pink-500' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function DaisyChainLinkVisualizer({
  projectId,
  projectName,
  variant = 'full',
}: DaisyChainLinkVisualizerProps) {
  const [activeTab, setActiveTab] = useState('radial');

  // Build the network from seed data (supplemented by Supabase when available)
  const network = useMemo(
    () => buildDaisyChainNetwork(projectId, projectName, SEED_LINKS),
    [projectId, projectName],
  );

  const linkedInitiatives = useMemo(
    () => getLinkedInitiatives(projectId, SEED_LINKS),
    [projectId],
  );

  // Badge-only variant
  if (variant === 'badge-only') {
    return (
      <Badge variant="outline" className="gap-1">
        <Link2 className="h-3 w-3" />
        {network.totalLinkedProjects} DaisyChain{network.totalLinkedProjects !== 1 ? 's' : ''}
      </Badge>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">DaisyChain Network</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Link2 className="h-3 w-3" /> {network.totalLinkedProjects} links
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> {network.totalCrossPurchases} cross-buys
              </span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3" /> {network.totalJouleRewards.toLocaleString()} J
              </span>
            </div>
          </div>
          {network.isUniversalHub && (
            <Badge className="mt-2 bg-amber-500/10 text-amber-500 border-amber-500/20">
              <Crown className="h-3 w-3 mr-1" /> Universal Hub — Links to ALL Projects
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Network className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                DaisyChain Network
                {network.isUniversalHub && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <Crown className="h-3 w-3 mr-1" /> Universal Hub
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {network.isUniversalHub
                  ? 'The Coaster Medallion links to every project on the platform'
                  : `${network.totalLinkedProjects} connected projects across ${linkedInitiatives.length} initiatives`}
              </CardDescription>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{network.totalLinkedProjects}</div>
            <div className="text-xs text-muted-foreground">Direct Links</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{network.networkReach}</div>
            <div className="text-xs text-muted-foreground">Network Reach</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{network.totalCrossPurchases}</div>
            <div className="text-xs text-muted-foreground">Cross-Purchases</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{network.totalJouleRewards.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Joules Earned</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="radial" className="gap-1">
              <Network className="h-3 w-3" /> Network
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1">
              <List className="h-3 w-3" /> Connections
            </TabsTrigger>
            <TabsTrigger value="initiatives" className="gap-1">
              <Map className="h-3 w-3" /> Initiatives
            </TabsTrigger>
          </TabsList>

          {/* Radial Network View */}
          <TabsContent value="radial" className="mt-4">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Center node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <div className="text-center">
                    <Hexagon className="h-6 w-6 text-primary mx-auto" />
                    <span className="text-[10px] font-medium">{projectName.split(':')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Radiating links */}
              {network.links.map((link, i) => {
                const angle = (i / Math.max(network.links.length, 1)) * 2 * Math.PI - Math.PI / 2;
                const radius = 140;
                const x = 50 + (radius / 250) * 100 * Math.cos(angle);
                const y = 50 + (radius / 250) * 100 * Math.sin(angle);
                const other = link.projectA.id === projectId ? link.projectB : link.projectA;
                const config = LINK_TYPE_CONFIG[link.linkType];
                const Icon = config.icon;

                return (
                  <React.Fragment key={link.id}>
                    {/* Connection line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                      <line
                        x1="50" y1="50"
                        x2={x} y2={y}
                        stroke="currentColor"
                        strokeWidth="0.3"
                        className="text-muted-foreground/30"
                        strokeDasharray={link.linkType === 'medallion' ? 'none' : '2,2'}
                      />
                    </svg>

                    {/* Linked project node */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <div className="group relative">
                        <div className={`w-14 h-14 rounded-full bg-card border-2 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${
                          link.linkType === 'medallion' ? 'border-amber-500' : 'border-muted-foreground/30'
                        }`}>
                          <Icon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                          <div className="bg-popover text-popover-foreground rounded-lg shadow-lg p-2 text-xs whitespace-nowrap border">
                            <div className="font-bold">{other.name}</div>
                            <div className="text-muted-foreground">{other.initiative}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span>{link.crossPurchaseCount} cross-buys</span>
                              <span className="text-amber-500">{link.jouleRewardsDistributed}J</span>
                            </div>
                          </div>
                        </div>
                        {/* Label */}
                        <div className="text-[8px] text-center text-muted-foreground mt-1 max-w-16 truncate">
                          {other.name.split(':')[0].split(' ').slice(0, 2).join(' ')}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-4">
            <div className="space-y-2">
              {network.links.map(link => {
                const other = link.projectA.id === projectId ? link.projectB : link.projectA;
                const config = LINK_TYPE_CONFIG[link.linkType];
                const Icon = config.icon;

                return (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-muted ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{other.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{other.initiative}</span>
                          <Badge variant="outline" className="text-[10px] h-4">
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <div className="font-medium">{link.crossPurchaseCount}</div>
                        <div className="text-[10px] text-muted-foreground">cross-buys</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-amber-500">{link.jouleRewardsDistributed}</div>
                        <div className="text-[10px] text-muted-foreground">Joules</div>
                      </div>
                      <Badge
                        variant={link.chainVotingBonus > 0.05 ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        +{(link.chainVotingBonus * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Initiative Map View */}
          <TabsContent value="initiatives" className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SWEET_SIXTEEN.map(initiative => {
                const isLinked = linkedInitiatives.some(li => li.slug === initiative.slug);
                const linkCount = network.links.filter(l => {
                  const other = l.projectA.id === projectId ? l.projectB : l.projectA;
                  return other.initiativeSlug === initiative.slug;
                }).length;

                return (
                  <div
                    key={initiative.slug}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isLinked
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-muted/20 border-muted-foreground/10 opacity-50'
                    }`}
                  >
                    <div className={`text-xs font-bold ${isLinked ? 'text-primary' : 'text-muted-foreground'}`}>
                      #{initiative.number}
                    </div>
                    <div className="text-[11px] font-medium mt-1 leading-tight">
                      {initiative.name.length > 20
                        ? initiative.name.split('(')[0].trim().split('/')[0].trim()
                        : initiative.name}
                    </div>
                    {isLinked && (
                      <Badge variant="secondary" className="mt-2 text-[9px] h-4">
                        {linkCount} link{linkCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Connected to <span className="font-bold text-primary">{linkedInitiatives.length}</span> of{' '}
              <span className="font-bold">16</span> initiatives
            </div>
          </TabsContent>
        </Tabs>

        {/* Chain Voting Calculator */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="font-medium text-sm">Chain Voting Bonus</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Back projects across this DaisyChain network and earn stacking 5% Joule bonuses per link.
            Caps at 100% (20 links), then sustains at 20%. Both creators earn Joule Pouches on every cross-purchase.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              +{(network.links.length * 5)}% potential bonus
            </Badge>
            <Badge variant="outline" className="text-xs">
              <QrCode className="h-3 w-3 mr-1" /> Physical medallion eligible
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
