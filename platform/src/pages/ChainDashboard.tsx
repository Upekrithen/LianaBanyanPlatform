/**
 * ChainDashboard — HexIsle Chain Loyalty Dashboard
 * ==================================================
 * /chain — Tracks a backer's 13-campaign Kickstarter chain.
 * 5% stacking bonus per link, 14-day timer, 20% floor on break.
 *
 * K144 / Bishop 036
 */

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { ShipMedallion } from "@/components/ShipMedallion";
import {
  useChainStatus,
  useCampaigns,
  useChainLeaderboard,
  type KickstarterCampaign,
} from "@/hooks/useChainDashboard";
import {
  Link2, Clock, Gift, Trophy, Share2, ChevronRight, ExternalLink,
  Hexagon, Zap, Users, ArrowLeft, Copy, Check,
} from "lucide-react";

const CHAIN_PERKS = [
  { minLinks: 1, perk: "Founding backer badge" },
  { minLinks: 2, perk: "Free STL of previous campaign product" },
  { minLinks: 3, perk: "Free color upgrade on current campaign" },
  { minLinks: 4, perk: "Chain Backer exclusive stretch goals" },
  { minLinks: 5, perk: "Free shipping on current campaign" },
  { minLinks: 6, perk: "LB membership months + Marks grant" },
  { minLinks: 9, perk: "Early access to unreleased products" },
  { minLinks: 10, perk: "Name in credits" },
  { minLinks: 13, perk: "Complete Collection pricing + Ship Medallion" },
];

function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Expired";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

const typeColor = (t: KickstarterCampaign["product_type"]) => {
  switch (t) {
    case "character": return "text-emerald-400";
    case "component": return "text-cyan-400";
    case "creature": return "text-purple-400";
    case "assembly": return "text-amber-400";
  }
};

const typeBg = (t: KickstarterCampaign["product_type"]) => {
  switch (t) {
    case "character": return "bg-emerald-500/15 border-emerald-500/30";
    case "component": return "bg-cyan-500/15 border-cyan-500/30";
    case "creature": return "bg-purple-500/15 border-purple-500/30";
    case "assembly": return "bg-amber-500/15 border-amber-500/30";
  }
};

const ChainDashboard: React.FC = () => {
  const {
    chainLength, bonusPct, isComplete, getTimeRemaining,
    backedCampaignIds, bonusPerLink, maxChainLength, isLoading: chainLoading,
  } = useChainStatus();
  const { campaigns, isLoading: campLoading } = useCampaigns();
  const { leaderboard, totalHolders, isLoading: lbLoading } = useChainLeaderboard();
  const [copied, setCopied] = useState(false);

  const timeLeft = getTimeRemaining();
  const nextCampaign = campaigns.find(
    (c) => !backedCampaignIds.has(c.id) && c.status !== "cancelled"
  );
  const unlockedPerks = useMemo(
    () => CHAIN_PERKS.filter((p) => p.minLinks <= chainLength),
    [chainLength]
  );

  const referralLink = `https://lianabanyan.com/chain?ref=me`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = chainLoading || campLoading;

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
          <p className="text-muted-foreground text-sm">
            13 Campaigns. One Journey. 5% bonus per link.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Medallion + Chain Visual */}
        <section className="rounded-xl border border-border bg-muted p-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            Your Chain ({chainLength}/{maxChainLength} links)
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Medallion */}
            <div className="flex-shrink-0">
              <ShipMedallion
                size="md"
                earned={isComplete}
                flipEnabled={isComplete}
                remainingLinks={Math.max(0, maxChainLength - chainLength)}
              />
              {isComplete && (
                <p className="text-center text-amber-300 text-xs font-medium mt-2">
                  Ship Medallion Earned
                </p>
              )}
            </div>

            {/* Chain Links */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {campaigns.map((c) => {
                  const isBacked = backedCampaignIds.has(c.id);
                  const isNext = nextCampaign?.id === c.id;
                  return (
                    <div key={c.id} className="flex items-center flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                          isBacked
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                            : isNext
                            ? "bg-amber-500/10 border-amber-400/60 text-amber-300 animate-pulse"
                            : "bg-muted border-border text-muted-foreground/70"
                        }`}
                        title={`Campaign ${c.campaign_number}: ${c.title}`}
                      >
                        {c.campaign_number}
                      </div>
                      {c.campaign_number < maxChainLength && (
                        <div
                          className={`w-3 h-0.5 ${
                            isBacked ? "bg-cyan-400" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
                {campaigns.length === 0 && !isLoading && (
                  <p className="text-muted-foreground/70 text-sm">No campaigns loaded</p>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500/60" /> Character</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-500/60" /> Component</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500/40 border border-purple-500/60" /> Creature</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500/60" /> Assembly</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-muted p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chain Timer</span>
            </div>
            {timeLeft > 0 ? (
              <div>
                <span className={`text-3xl font-bold ${timeLeft < 3 * 86400 ? "text-red-400" : "text-amber-300"}`}>
                  {formatTimeRemaining(timeLeft)}
                </span>
                <span className="text-muted-foreground text-sm ml-1">remaining</span>
              </div>
            ) : (
              <p className="text-muted-foreground/70 text-sm">
                No active chain — back your first campaign to start!
              </p>
            )}
            <p className="text-muted-foreground/50 text-[10px] mt-1">14-day window (21 days during holidays)</p>
          </div>

          <div className="rounded-xl border border-border bg-muted p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Chain Bonus</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-cyan-300">{bonusPct}%</span>
              {chainLength < maxChainLength && (
                <span className="text-muted-foreground/70 text-sm ml-2">
                  → {bonusPct + bonusPerLink}% at next link
                </span>
              )}
            </div>
            <p className="text-muted-foreground/50 text-[10px] mt-1">{bonusPerLink}% per link · 20% floor on break</p>
          </div>

          <div className="rounded-xl border border-border bg-muted p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Perks Unlocked</span>
            </div>
            <span className="text-3xl font-bold text-emerald-300">{unlockedPerks.length}</span>
            <span className="text-muted-foreground/70 text-sm ml-1">/ {CHAIN_PERKS.length}</span>
          </div>
        </div>

        {/* Next Campaign */}
        {nextCampaign && (
          <section className="rounded-xl border border-border bg-muted p-5">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Next Campaign</h2>
            <div className={`rounded-lg border p-4 ${typeBg(nextCampaign.product_type)}`}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Hexagon className={`w-5 h-5 ${typeColor(nextCampaign.product_type)}`} />
                    <span className="font-bold text-lg">{nextCampaign.title}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Campaign {nextCampaign.campaign_number} of {maxChainLength}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>Goal: ${nextCampaign.goal_amount.toLocaleString()}</span>
                    {nextCampaign.status !== "upcoming" && (
                      <span>Raised: ${nextCampaign.raised_amount.toLocaleString()}</span>
                    )}
                    <span className={`uppercase tracking-wider font-bold ${
                      nextCampaign.status === "live" ? "text-emerald-400" : "text-muted-foreground/50"
                    }`}>
                      {nextCampaign.status}
                    </span>
                  </div>
                </div>
                {nextCampaign.kickstarter_url ? (
                  <a
                    href={nextCampaign.kickstarter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                  >
                    Back on Kickstarter <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground/50 bg-muted px-3 py-2 rounded-lg">Coming Soon</span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Campaign Roadmap */}
        <section className="rounded-xl border border-border bg-muted p-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Campaign Roadmap</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaigns.map((c) => {
              const isBacked = backedCampaignIds.has(c.id);
              const progress = c.goal_amount > 0 ? Math.min(100, (c.raised_amount / c.goal_amount) * 100) : 0;
              return (
                <div
                  key={c.id}
                  className={`rounded-lg border p-3 transition-all ${
                    isBacked ? "bg-cyan-500/10 border-cyan-500/30" : "bg-muted border-border"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      isBacked ? "bg-cyan-500/20 text-cyan-300" : "bg-muted text-muted-foreground"
                    }`}>
                      #{c.campaign_number}
                    </span>
                    <span className={`font-medium text-sm truncate ${
                      isBacked ? "text-cyan-200" : "text-muted-foreground"
                    }`}>
                      {c.title.split(" — ")[0]}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider flex-shrink-0 ${typeColor(c.product_type)}`}>
                      {c.product_type}
                    </span>
                  </div>
                  <p className="text-muted-foreground/70 text-xs truncate">{c.title}</p>
                  {c.status !== "upcoming" && progress > 0 && (
                    <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  )}
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

        {/* Perk Ladder */}
        <section className="rounded-xl border border-border bg-muted p-5">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-emerald-400" />
            Chain Perk Ladder
          </h2>
          <div className="space-y-2">
            {CHAIN_PERKS.map((p) => {
              const unlocked = p.minLinks <= chainLength;
              return (
                <div
                  key={p.minLinks}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                    unlocked
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-muted border border-border"
                  }`}
                >
                  <span className={`text-xs font-bold w-12 ${unlocked ? "text-emerald-300" : "text-muted-foreground/70"}`}>
                    {p.minLinks === 1 ? "1 link" : `${p.minLinks}+ links`}
                  </span>
                  <span className={`text-xs font-bold mr-2 ${unlocked ? "text-emerald-400" : "text-muted-foreground/70"}`}>
                    {p.minLinks * bonusPerLink}%
                  </span>
                  <span className={`text-sm ${unlocked ? "text-foreground" : "text-muted-foreground/70"}`}>
                    {p.perk}
                  </span>
                  {unlocked && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Referral Link */}
          <section className="rounded-xl border border-border bg-muted p-5">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              Referral Link
            </h2>
            <p className="text-muted-foreground text-xs mb-3">
              Share your chain link. Referrals earn you Marks through the TasteMaker Trust Chain (5 links deep, 40/25/15/10/10%).
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
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </section>

          {/* Leaderboard */}
          <section className="rounded-xl border border-border bg-muted p-5">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              Chain Leaderboard
            </h2>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={entry.user_id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted border border-border">
                    <span className={`text-sm font-bold w-6 text-center ${
                      i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-400" : "text-muted-foreground/70"
                    }`}>
                      {i + 1}
                    </span>
                    <Users className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span className="text-sm text-muted-foreground flex-1 truncate">
                      {entry.profiles?.display_name ?? "Chain Holder"}
                    </span>
                    <span className="text-xs font-bold text-cyan-400">{entry.chain_length} links</span>
                    <span className="text-xs text-muted-foreground/70">{entry.chain_length * bonusPerLink}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/70 text-sm">
                {lbLoading ? "Loading..." : "No chain holders yet — be the first!"}
              </p>
            )}
            {totalHolders > 0 && (
              <p className="text-muted-foreground/50 text-[10px] mt-2">{totalHolders} total chain holders</p>
            )}
          </section>
        </div>

        {/* Cross-links */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/hexisle/downloads" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
            STL Downloads <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link to="/hexisle" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
            HexIsle Portal <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link to="/2nd-second" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
            The 2nd Second <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default ChainDashboard;
