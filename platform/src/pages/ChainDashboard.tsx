/**
 * ChainDashboard — HexIsle Chain Loyalty Dashboard
 * ==================================================
 * /chain — Tracks a backer's 13-campaign Kickstarter chain.
 * 5% stacking Joule bonus per link, 14-day timer, 20% floor on break.
 *
 * Bishop Session 011 / Knight Session 29
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  { number: 1, name: 'Peasant', character: 'Peasant', type: 'character', description: 'Sword Path entry — the humble beginning', launchEstimate: 'Ready' },
  { number: 2, name: 'Merchant', character: 'Merchant', type: 'character', description: 'Crown Path entry — trade and diplomacy', launchEstimate: 'Ready' },
  { number: 3, name: 'Golden Lotus', type: 'component', description: 'Tesla-valve turbine — the heart of every Hexel', launchEstimate: 'TBD' },
  { number: 4, name: 'Farmer', character: 'Farmer', type: 'character', description: 'Sword Path level 2 — cultivate the land', launchEstimate: 'Ready' },
  { number: 5, name: 'Healer', character: 'Healer', type: 'character', description: 'Crown Path level 2 — mend and protect', launchEstimate: 'Ready' },
  { number: 6, name: 'Sawtooth Coral', type: 'component', description: 'Ship keel engagement — 6-angle terrain piece', launchEstimate: 'TBD' },
  { number: 7, name: 'Warrior', character: 'Warrior', type: 'character', description: 'Sword Path level 3 — defend the realm', launchEstimate: 'Ready' },
  { number: 8, name: 'Assassin', character: 'Assassin', type: 'character', description: 'Crown Path level 3 — stealth and precision', launchEstimate: 'Ready' },
  { number: 9, name: 'Ouralis Gear', type: 'component', description: '20-tooth dual-level gear with tide cam slopes', launchEstimate: 'TBD' },
  { number: 10, name: 'King', character: 'King', type: 'character', description: 'Sword Path capstone — rule the board', launchEstimate: 'Ready' },
  { number: 11, name: 'Queen', character: 'Queen', type: 'character', description: 'Crown Path capstone — the ultimate strategist', launchEstimate: 'Ready' },
  { number: 12, name: 'Complete Hexels', type: 'assembly', description: 'Full 27-piece Hexel assembly — all pieces finalized by community', launchEstimate: 'TBD' },
  { number: 13, name: 'Water Table', type: 'capstone', description: 'The gravity-powered Water Table — launches when engineering is complete', launchEstimate: 'TBD' },
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
  { minLinks: 13, perk: 'Complete Collection pricing + Steward nomination' },
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" data-xray-id="hexisle-chain">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
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
            <p className="text-slate-400 text-sm">13 Campaigns. One Journey. Rewards that grow.</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-6 pb-16">
        {/* ── Visual Chain ── */}
        <section className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            Your Chain ({chain.chainLength}/13 links)
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
                        : 'bg-slate-800/60 border-slate-600/40 text-slate-500'
                    }`}
                    title={`Campaign ${c.number}: ${c.name}`}
                  >
                    {c.number}
                  </div>
                  {c.number < 13 && (
                    <div className={`w-3 h-0.5 ${isBacked && chain.backedCampaigns.includes(c.number + 1) ? 'bg-cyan-400' : 'bg-slate-700'}`} />
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
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chain Timer</span>
            </div>
            {daysLeft !== null ? (
              <div>
                <span className={`text-3xl font-bold ${daysLeft <= 3 ? 'text-red-400' : 'text-amber-300'}`}>
                  {daysLeft}
                </span>
                <span className="text-slate-400 text-sm ml-1">days left</span>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No active chain — back your first campaign to start!</p>
            )}
          </div>

          {/* Joule Bonus */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Joule Bonus</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-cyan-300">{currentBonus}%</span>
              {chain.chainLength < 13 && (
                <span className="text-slate-500 text-sm ml-2">→ {nextBonus}% at next link</span>
              )}
            </div>
          </div>

          {/* Perks Unlocked */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Perks Unlocked</span>
            </div>
            <span className="text-3xl font-bold text-emerald-300">{unlockedPerks.length}</span>
            <span className="text-slate-500 text-sm ml-1">/ {CHAIN_PERKS.length}</span>
          </div>
        </div>

        {/* ── Next Campaign ── */}
        {nextCampaign && (
          <section className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Next Campaign</h2>
            <div className={`rounded-lg border p-4 ${campaignTypeBg(nextCampaign.type)}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Hexagon className={`w-5 h-5 ${campaignTypeColor(nextCampaign.type)}`} />
                    <span className="font-bold text-lg">{nextCampaign.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded-full">
                      Campaign {nextCampaign.number} of 13
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{nextCampaign.description}</p>
                  <p className="text-slate-500 text-xs mt-1">Launch: {nextCampaign.launchEstimate}</p>
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
        <section className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Campaign Roadmap</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CAMPAIGNS.map((c) => {
              const isBacked = chain.backedCampaigns.includes(c.number);
              return (
                <div
                  key={c.number}
                  className={`rounded-lg border p-3 transition-all ${
                    isBacked
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-slate-800/60 border-slate-700/40'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      isBacked ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700/60 text-slate-400'
                    }`}>
                      #{c.number}
                    </span>
                    <span className={`font-medium text-sm ${isBacked ? 'text-cyan-200' : 'text-slate-300'}`}>
                      {c.name}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider ${campaignTypeColor(c.type)}`}>
                      {c.type}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">{c.description}</p>
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
        <section className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
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
                      : 'bg-slate-800/40 border border-slate-700/30'
                  }`}
                >
                  <span className={`text-xs font-bold w-12 ${unlocked ? 'text-emerald-300' : 'text-slate-500'}`}>
                    {p.minLinks === 1 ? '1 link' : `${p.minLinks}+ links`}
                  </span>
                  <span className={`text-xs font-bold mr-2 ${unlocked ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {bonusPercent(p.minLinks)}%
                  </span>
                  <span className={`text-sm ${unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
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
          <section className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              Referral Link
            </h2>
            <p className="text-slate-400 text-xs mb-3">
              Share your chain link. Referrals earn you Marks through the TasteMaker Trust Chain (5 links deep, 40/25/15/10/10% attribution).
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 bg-slate-900/60 border border-slate-600/40 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono"
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
          <section className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Chain Leaderboard
            </h2>
            <div className="space-y-2">
              {MOCK_LEADERBOARD.map((entry) => (
                <div key={entry.rank} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/30">
                  <span className={`text-sm font-bold w-6 text-center ${
                    entry.rank === 1 ? 'text-amber-400' : entry.rank === 2 ? 'text-slate-300' : entry.rank === 3 ? 'text-orange-400' : 'text-slate-500'
                  }`}>
                    {entry.rank}
                  </span>
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm text-slate-300 flex-1">{entry.username}</span>
                  <span className="text-xs font-bold text-cyan-400">{entry.chainLength} links</span>
                  <span className="text-xs text-slate-500">{bonusPercent(entry.chainLength)}%</span>
                </div>
              ))}
            </div>
            <p className="text-slate-600 text-[10px] mt-2 uppercase tracking-wider">Sample Data — live leaderboard populates with Kickstarter backers</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChainDashboard;
