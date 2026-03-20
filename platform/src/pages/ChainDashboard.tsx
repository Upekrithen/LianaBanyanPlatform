/**
 * ChainDashboard — HexIsle Chain Loyalty Dashboard
 * ==================================================
 * /chain — Tracks a backer's 14-campaign Kickstarter chain.
 * 5% stacking Joule bonus per link, 14-day timer, 20% floor on break.
 *
 * Bishop Session 011 / Knight Session 29
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import {
  Link2, Clock, Gift, Trophy, Share2, ChevronRight, ExternalLink,
  Hexagon, Zap, Users, ArrowLeft, Copy, Check,
} from 'lucide-react';

// ─── CAMPAIGN DATA ───

interface Campaign {
  number: number;
  name: string;
  character?: string;
  type: 'character' | 'component' | 'assembly' | 'capstone';
  description: string;
  launchEstimate: string;
}

const CAMPAIGNS: Campaign[] = [
  { number: 1, name: 'SlottedTop', type: 'component', description: 'Universal hex tile adapter — the first piece of the 27-piece Hexel', launchEstimate: 'Ready' },
  { number: 2, name: 'Peasant', character: 'Peasant', type: 'character', description: 'Base body — becomes every character. Layers snap on top.', launchEstimate: 'Ready' },
  { number: 3, name: 'Merchant', character: 'Merchant', type: 'character', description: 'Same body + snap-on cloak. Remove cloak = Assassin beneath.', launchEstimate: 'Ready' },
  { number: 4, name: 'Golden Lotus', type: 'component', description: 'Tesla-valve turbine — the heart of every Hexel', launchEstimate: 'TBD' },
  { number: 5, name: 'Farmer / Warrior', character: 'Farmer', type: 'character', description: 'Peasant body + tool belt (Farmer) or + ScaleMail (Warrior). Same body, different layers.', launchEstimate: 'Ready' },
  { number: 6, name: 'Character Base', type: 'component', description: 'Hitbase Counter — coin-loaded boots base with level overlays, weapon scabbards, and dice-face terrain lock.', launchEstimate: 'TBD' },
  { number: 7, name: 'Sawtooth Coral', type: 'component', description: 'Ship keel engagement — 6-angle terrain piece + hidden Timing Belt', launchEstimate: 'TBD' },
  { number: 8, name: 'Healer / Assassin', character: 'Healer', type: 'character', description: 'Crown Path layers: +herbs+staff (Healer) or -cloak (Assassin reveals)', launchEstimate: 'Ready' },
  { number: 9, name: 'War Horse', character: 'Horse', type: 'character', description: 'Same horse body: Wild → Farm (bridle+cart) → War (armor). Layer system for creatures.', launchEstimate: 'Ready' },
  { number: 10, name: 'King', character: 'King', type: 'character', description: 'Sword Path capstone — ALL layers: tunic + ScaleMail + Terrain Armor + Crown', launchEstimate: 'Ready' },
  { number: 11, name: 'Pneumatic Palm', type: 'component', description: 'Telescoping plant — grows during play via pneumatic pump', launchEstimate: 'TBD' },
  { number: 12, name: 'Queen', character: 'Queen', type: 'character', description: 'Crown Path capstone — Orbs + Fiery Wings + Crown Helmet. 4-body evolution display.', launchEstimate: 'Ready' },
  { number: 13, name: 'Hexel Assembly', type: 'assembly', description: 'Full 27-piece Hexel — all pieces finalized by community improvements', launchEstimate: 'TBD' },
  { number: 14, name: 'Tereno Water Table', type: 'capstone', description: '420 Hexels, gravity-powered hydraulic surface. The crown jewel.', launchEstimate: 'TBD' },
];

const CHAIN_PERKS = [
  { minLinks: 1, perk: 'Founding backer badge' },
  { minLinks: 2, perk: 'Free STL of previous campaign product' },
  { minLinks: 3, perk: 'Free color upgrade on current campaign' },
  { minLinks: 4, perk: 'Chain Backer exclusive stretch goals' },
  { minLinks: 5, perk: 'Free shipping on current campaign' },
  { minLinks: 6, perk: 'LB membership months + Marks grant' },
  { minLinks: 9, perk: 'Early access to unreleased products' },
  { minLinks: 10, perk: 'Name in credits' },
  { minLinks: 13, perk: 'Complete Collection pricing' },
  { minLinks: 14, perk: 'Steward nomination + Grand Chain badge' },
];

// ─── MOCK USER STATE (replace with Supabase when wired) ───

const MOCK_CHAIN = {
  chainLength: 0,
  lastBackingDate: null as string | null,
  backedCampaigns: [] as number[],
  username: 'guest',
};

const MOCK_LEADERBOARD = [
  { rank: 1, username: 'Hex_Pioneer_01', chainLength: 4 },
  { rank: 2, username: 'WaterTableDreamer', chainLength: 3 },
  { rank: 3, username: 'CoralBuilder', chainLength: 3 },
  { rank: 4, username: 'LotusLover', chainLength: 2 },
  { rank: 5, username: 'GearHead99', chainLength: 2 },
];

// ─── HELPERS ───

function daysUntilExpiry(lastBackingDate: string | null): number | null {
  if (!lastBackingDate) return null;
  const last = new Date(lastBackingDate);
  const expiry = new Date(last.getTime() + 14 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function bonusPercent(chainLength: number): number {
  return chainLength * 5;
}

// ─── COMPONENT ───

const ChainDashboard: React.FC = () => {
  const [chain] = useState(MOCK_CHAIN);
  const [copied, setCopied] = useState(false);

  const daysLeft = daysUntilExpiry(chain.lastBackingDate);
  const currentBonus = bonusPercent(chain.chainLength);
  const nextBonus = bonusPercent(chain.chainLength + 1);
  const nextCampaign = CAMPAIGNS.find(c => !chain.backedCampaigns.includes(c.number));
  const unlockedPerks = useMemo(
    () => CHAIN_PERKS.filter(p => p.minLinks <= chain.chainLength),
    [chain.chainLength]
  );

  const referralLink = `https://lianabanyan.com/chain?ref=${chain.username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const campaignTypeColor = (type: Campaign['type']) => {
    switch (type) {
      case 'character': return 'text-emerald-400';
      case 'component': return 'text-cyan-400';
      case 'assembly': return 'text-amber-400';
      case 'capstone': return 'text-purple-400';
    }
  };

  const campaignTypeBg = (type: Campaign['type']) => {
    switch (type) {
      case 'character': return 'bg-emerald-500/15 border-emerald-500/30';
      case 'component': return 'bg-cyan-500/15 border-cyan-500/30';
      case 'assembly': return 'bg-amber-500/15 border-amber-500/30';
      case 'capstone': return 'bg-purple-500/15 border-purple-500/30';
    }
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="hexisle-chain">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/hexisle" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> HexIsle
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-cyan-400">Chain Dashboard</span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <Link2 className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">HexIsle Chain</h1>
            <p className="text-muted-foreground text-sm">14 Campaigns. One Journey. Rewards that grow.</p>
          </div>
        </div>

      <div className="space-y-6">
        {/* ── Visual Chain ── */}
        <section className="rounded-xl border border-border bg-muted p-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            Your Chain ({chain.chainLength}/14 links)
          </h2>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {CAMPAIGNS.map((c) => {
              const isBacked = chain.backedCampaigns.includes(c.number);
              return (
                <div key={c.number} className="flex items-center flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      isBacked
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                        : 'bg-muted border-border text-muted-foreground/70'
                    }`}
                    title={`Campaign ${c.number}: ${c.name}`}
                  >
                    {c.number}
                  </div>
                  {c.number < 14 && (
                    <div className={`w-3 h-0.5 ${isBacked && chain.backedCampaigns.includes(c.number + 1) ? 'bg-cyan-400' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500/60" /> Character</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-500/60" /> Component</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500/60" /> Assembly</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500/40 border border-purple-500/60" /> Capstone</span>
          </div>
        </section>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Chain Timer */}
          <div className="rounded-xl border border-border bg-muted p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chain Timer</span>
            </div>
            {daysLeft !== null ? (
              <div>
                <span className={`text-3xl font-bold ${daysLeft <= 3 ? 'text-red-400' : 'text-amber-300'}`}>
                  {daysLeft}
                </span>
                <span className="text-muted-foreground text-sm ml-1">days left</span>
              </div>
            ) : (
              <p className="text-muted-foreground/70 text-sm">No active chain — back your first campaign to start!</p>
            )}
          </div>

          {/* Joule Bonus */}
          <div className="rounded-xl border border-border bg-muted p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Joule Bonus</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-cyan-300">{currentBonus}%</span>
              {chain.chainLength < 14 && (
                <span className="text-muted-foreground/70 text-sm ml-2">→ {nextBonus}% at next link</span>
              )}
            </div>
          </div>

          {/* Perks Unlocked */}
          <div className="rounded-xl border border-border bg-muted p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Perks Unlocked</span>
            </div>
            <span className="text-3xl font-bold text-emerald-300">{unlockedPerks.length}</span>
            <span className="text-muted-foreground/70 text-sm ml-1">/ {CHAIN_PERKS.length}</span>
          </div>
        </div>

        {/* ── Next Campaign ── */}
        {nextCampaign && (
          <section className="rounded-xl border border-border bg-muted p-5">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Next Campaign</h2>
            <div className={`rounded-lg border p-4 ${campaignTypeBg(nextCampaign.type)}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Hexagon className={`w-5 h-5 ${campaignTypeColor(nextCampaign.type)}`} />
                    <span className="font-bold text-lg">{nextCampaign.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Campaign {nextCampaign.number} of 14
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{nextCampaign.description}</p>
                  <p className="text-muted-foreground/70 text-xs mt-1">Launch: {nextCampaign.launchEstimate}</p>
                </div>
                <a
                  href="https://kickstarter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                >
                  Back on Kickstarter <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── Full Campaign Roadmap ── */}
        <section className="rounded-xl border border-border bg-muted p-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Campaign Roadmap</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CAMPAIGNS.map((c) => {
              const isBacked = chain.backedCampaigns.includes(c.number);
              return (
                <div
                  key={c.number}
                  className={`rounded-lg border p-3 transition-all ${
                    isBacked
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-muted border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      isBacked ? 'bg-cyan-500/20 text-cyan-300' : 'bg-muted text-muted-foreground'
                    }`}>
                      #{c.number}
                    </span>
                    <span className={`font-medium text-sm ${isBacked ? 'text-cyan-200' : 'text-muted-foreground'}`}>
                      {c.name}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider ${campaignTypeColor(c.type)}`}>
                      {c.type}
                    </span>
                  </div>
                  <p className="text-muted-foreground/70 text-xs">{c.description}</p>
                  {isBacked && (
                    <span className="inline-block mt-1.5 text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full">
                      ✓ Backed
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Perk Ladder ── */}
        <section className="rounded-xl border border-border bg-muted p-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-400" />
            Chain Perk Ladder
          </h2>
          <div className="space-y-2">
            {CHAIN_PERKS.map((p) => {
              const unlocked = p.minLinks <= chain.chainLength;
              return (
                <div
                  key={p.minLinks}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                    unlocked
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-muted border border-border'
                  }`}
                >
                  <span className={`text-xs font-bold w-12 ${unlocked ? 'text-emerald-300' : 'text-muted-foreground/70'}`}>
                    {p.minLinks === 1 ? '1 link' : `${p.minLinks}+ links`}
                  </span>
                  <span className={`text-xs font-bold mr-2 ${unlocked ? 'text-emerald-400' : 'text-muted-foreground/70'}`}>
                    {bonusPercent(p.minLinks)}%
                  </span>
                  <span className={`text-sm ${unlocked ? 'text-foreground' : 'text-muted-foreground/70'}`}>
                    {p.perk}
                  </span>
                  {unlocked && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Referral Link ── */}
          <section className="rounded-xl border border-border bg-muted p-5">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              Referral Link
            </h2>
            <p className="text-muted-foreground text-xs mb-3">
              Share your chain link. Referrals earn you Marks through the TasteMaker Trust Chain (5 links deep, 40/25/15/10/10% attribution).
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground font-mono"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </section>

          {/* ── Leaderboard ── */}
          <section className="rounded-xl border border-border bg-muted p-5">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Chain Leaderboard
            </h2>
            <div className="space-y-2">
              {MOCK_LEADERBOARD.map((entry) => (
                <div key={entry.rank} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted border border-border">
                  <span className={`text-sm font-bold w-6 text-center ${
                    entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-muted-foreground' : entry.rank === 3 ? 'text-orange-400' : 'text-muted-foreground/70'
                  }`}>
                    {entry.rank}
                  </span>
                  <Users className="w-3.5 h-3.5 text-muted-foreground/70" />
                  <span className="text-sm text-muted-foreground flex-1">{entry.username}</span>
                  <span className="text-xs font-bold text-cyan-400">{entry.chainLength} links</span>
                  <span className="text-xs text-muted-foreground/70">{bonusPercent(entry.chainLength)}%</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground/70 text-[10px] mt-2 uppercase tracking-wider">Sample Data — live leaderboard populates with Kickstarter backers</p>
          </section>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default ChainDashboard;
