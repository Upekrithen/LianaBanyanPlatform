/**
 * KickstarterCampaignPage — Individual Campaign Detail
 * ======================================================
 * /hexisle/campaign/:slug — Full campaign view with hero, chain banner,
 * reward tiers, 13-campaign roadmap, Open Build section, and related bounties.
 *
 * K146 / Bishop 036
 */

import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { CampaignPledgeModal } from "@/components/hexisle/CampaignPledgeModal";
import {
  useCampaign,
  useChainStatus,
  useCampaignBounties,
  REWARD_TIERS,
  type KickstarterCampaign,
} from "@/hooks/useKickstarterCampaigns";
import {
  Link2, Clock, Hexagon, Package, Bug, Layers, Users,
  ChevronRight, Download, Wrench, Trophy, ArrowRight,
  ExternalLink, Check, Rocket,
} from "lucide-react";

const typeConfig: Record<
  KickstarterCampaign["product_type"],
  { icon: typeof Hexagon; color: string; bg: string; label: string; accent: string }
> = {
  component: {
    icon: Hexagon,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15 border-cyan-500/30",
    accent: "from-cyan-600 to-blue-600",
    label: "Component",
  },
  character: {
    icon: Package,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    accent: "from-emerald-600 to-teal-600",
    label: "Character",
  },
  creature: {
    icon: Bug,
    color: "text-purple-400",
    bg: "bg-purple-500/15 border-purple-500/30",
    accent: "from-purple-600 to-violet-600",
    label: "Creature",
  },
  assembly: {
    icon: Layers,
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
    accent: "from-amber-600 to-orange-600",
    label: "Assembly",
  },
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  upcoming: { label: "Upcoming", cls: "bg-zinc-600/50 text-zinc-300" },
  live: { label: "🔴 Live Now", cls: "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse" },
  funded: { label: "✅ Funded", cls: "bg-emerald-500/20 text-emerald-300" },
  fulfilled: { label: "📦 Fulfilled", cls: "bg-sky-500/20 text-sky-300" },
  cancelled: { label: "Cancelled", cls: "bg-red-500/20 text-red-400" },
};

function formatDaysRemaining(endDate: string | null): string | null {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.ceil(diff / 86400000);
  return `${days} day${days !== 1 ? "s" : ""} remaining`;
}

const KickstarterCampaignPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { campaign, campaigns, isLoading } = useCampaign(slug);
  const {
    chainLength, bonusPct, bonusPerLink, maxChainLength,
    backedCampaignIds, getTimeRemaining, isLoading: chainLoading,
  } = useChainStatus();
  const { data: bounties } = useCampaignBounties(campaign?.id);
  const [pledgeOpen, setPledgeOpen] = useState(false);
  const [preselectedTier, setPreselectedTier] = useState<string | undefined>();

  if (isLoading || chainLoading) {
    return (
      <PortalPageLayout variant="stage" title="Loading...">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-muted-foreground animate-pulse">Loading campaign...</div>
        </div>
      </PortalPageLayout>
    );
  }

  if (!campaign) {
    return (
      <PortalPageLayout variant="stage" title="Campaign Not Found" backButton>
        <p className="text-muted-foreground">
          This campaign doesn't exist.{" "}
          <Link to="/hexisle/campaigns" className="text-cyan-400 hover:underline">
            View all campaigns
          </Link>
        </p>
      </PortalPageLayout>
    );
  }

  const type = typeConfig[campaign.product_type];
  const status = statusBadge[campaign.status] ?? statusBadge.upcoming;
  const TypeIcon = type.icon;
  const progressPct = campaign.goal_amount
    ? Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100)
    : 0;
  const daysLeft = formatDaysRemaining(campaign.end_date);
  const alreadyBacked = backedCampaignIds.has(campaign.id);
  const chainTimeLeft = getTimeRemaining();
  const chainDays = Math.floor(chainTimeLeft / 86400);

  const openPledge = (tierId?: string) => {
    setPreselectedTier(tierId);
    setPledgeOpen(true);
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" backButton>
      {/* ═══════ HERO SECTION ═══════ */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
            Campaign {campaign.campaign_number} of 13
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>
            {status.label}
          </span>
          <span className={`text-xs px-2 py-1 rounded border ${type.bg} ${type.color} font-medium`}>
            <TypeIcon className="h-3 w-3 inline mr-1" />
            {type.label}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {campaign.title}
        </h1>

        {/* Funding Progress */}
        <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3">
            <div>
              <span className="text-3xl font-bold text-white">
                ${campaign.raised_amount.toLocaleString()}
              </span>
              <span className="text-muted-foreground ml-2">
                raised of ${campaign.goal_amount.toLocaleString()} goal
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {campaign.backer_count} backers
              </span>
              {daysLeft && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {daysLeft}
                </span>
              )}
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${type.accent} transition-all duration-700`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center gap-3">
            {alreadyBacked ? (
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check className="h-5 w-5" />
                You've backed this campaign
              </div>
            ) : (
              <button
                onClick={() => openPledge()}
                className={`px-6 py-3 bg-gradient-to-r ${type.accent} hover:opacity-90 text-white rounded-lg font-semibold transition-all flex items-center gap-2`}
              >
                <Rocket className="h-5 w-5" />
                Back This Campaign
              </button>
            )}
            {campaign.kickstarter_url && (
              <a
                href={campaign.kickstarter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-white flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                View on Kickstarter
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ CHAIN BANNER ═══════ */}
      <div className="mb-8 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
          <Link2 className="h-5 w-5 text-amber-400" />
          THE HEXISLE CHAIN — 13 Campaigns. One Journey.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="text-amber-200/80">
            Back this campaign → earn a Chain Link → {bonusPerLink}% bonus per link
          </div>
          <div className="text-amber-200/80">
            Your chain: {chainLength} links → next link ={" "}
            {(chainLength + 1) * bonusPerLink}% bonus
          </div>
          <div className="text-amber-200/80">
            {chainDays > 0
              ? `Chain expires in ${chainDays} day${chainDays !== 1 ? "s" : ""} — don't break the chain!`
              : chainLength > 0
                ? "Chain expired — back a campaign to restart at 20% floor"
                : "Start your chain with your first pledge!"}
          </div>
        </div>
      </div>

      {/* ═══════ REWARD TIERS ═══════ */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Reward Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {REWARD_TIERS.map((tier) => {
            const isEarlyBird =
              tier.earlyBirdPrice &&
              campaign.backer_count < (tier.earlyBirdLimit ?? 0);
            return (
              <div
                key={tier.id}
                className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{tier.name}</h3>
                  {isEarlyBird && (
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                      Early Bird — 20% off!
                    </span>
                  )}
                </div>
                <div className="mb-3">
                  {isEarlyBird ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">
                        ${tier.earlyBirdPrice}
                      </span>
                      <span className="text-sm line-through text-muted-foreground">
                        ${tier.price}
                      </span>
                      <span className="text-xs text-amber-300">
                        First {tier.earlyBirdLimit}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      ${tier.price}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3 flex-1">
                  {tier.description}
                </p>
                <ul className="space-y-1 mb-4">
                  {tier.includes.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-cyan-300/80 flex items-center gap-1.5"
                    >
                      <Check className="h-3 w-3 text-cyan-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openPledge(tier.id)}
                  disabled={alreadyBacked}
                  className={`mt-auto py-2 rounded-lg text-sm font-medium transition-all ${
                    alreadyBacked
                      ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                      : `bg-gradient-to-r ${type.accent} hover:opacity-90 text-white`
                  }`}
                >
                  {alreadyBacked ? "Already Backed" : "Select This Tier"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════ CAMPAIGN ROADMAP ═══════ */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">
          Campaign Roadmap — The Leap Frog Journey
        </h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-700" />
          <div className="space-y-3">
            {campaigns.map((c) => {
              const isCurrent = c.id === campaign.id;
              const isBacked = backedCampaignIds.has(c.id);
              const ct = typeConfig[c.product_type];
              const CIcon = ct.icon;
              const accumulatedBonus = c.campaign_number * bonusPerLink;

              return (
                <div
                  key={c.id}
                  className={`relative pl-10 py-2 rounded-lg transition-all ${
                    isCurrent
                      ? "bg-white/5 border border-white/10"
                      : ""
                  }`}
                >
                  <div
                    className={`absolute left-2.5 top-3.5 w-3 h-3 rounded-full border-2 ${
                      isBacked
                        ? "bg-emerald-500 border-emerald-400"
                        : isCurrent
                          ? "bg-cyan-500 border-cyan-400 animate-pulse"
                          : "bg-zinc-700 border-zinc-600"
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-4">
                        {c.campaign_number}
                      </span>
                      <CIcon className={`h-4 w-4 ${ct.color}`} />
                      {isCurrent ? (
                        <span className="text-sm font-semibold text-white">
                          {c.title}
                        </span>
                      ) : (
                        <Link
                          to={`/hexisle/campaign/${c.slug}`}
                          className="text-sm text-zinc-300 hover:text-white transition-colors"
                        >
                          {c.title}
                        </Link>
                      )}
                      {isBacked && (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      +{accumulatedBonus}% cumulative
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ OPEN BUILD SECTION ═══════ */}
      <section className="mb-8 bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
          <Download className="h-5 w-5 text-cyan-400" />
          OPEN BUILD: Download, Print, Improve
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          STL file included at $5+ tier. Print it yourself. Test it.
          Submit improvements at{" "}
          <Link to="/piggyback" className="text-cyan-400 hover:underline">
            /piggyback
          </Link>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">
                Tereno Certified (Tier 1)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Full innovation — new mechanism or function
            </p>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">
                HexIsle Compatible (Tier 4)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Compatible redesign — works with system
            </p>
          </div>
          <div className="p-3 rounded-lg bg-zinc-700/50 border border-zinc-600/30">
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-300">
                HexIsle Approved (Tier 2)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Minor tweak — cosmetic or ergonomic
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ RELATED BOUNTIES ═══════ */}
      {bounties && bounties.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Related Bounties
          </h2>
          <div className="space-y-2">
            {bounties.map((b: any) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg"
              >
                <div>
                  <span className="text-sm text-white font-medium">
                    {b.title}
                  </span>
                  {b.reward_amount && (
                    <span className="ml-2 text-xs text-emerald-400">
                      ${b.reward_amount}
                    </span>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pledge Modal */}
      {pledgeOpen && (
        <CampaignPledgeModal
          campaign={campaign}
          preselectedTier={preselectedTier}
          onClose={() => setPledgeOpen(false)}
        />
      )}
    </PortalPageLayout>
  );
};

export default KickstarterCampaignPage;
