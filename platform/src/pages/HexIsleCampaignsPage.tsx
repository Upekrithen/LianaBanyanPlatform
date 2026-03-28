/**
 * HexIsleCampaignsPage — Campaign Directory Grid
 * =================================================
 * /hexisle/campaigns — Grid of all 13 Kickstarter campaigns with chain
 * status banner, color-coded type/status, and Leap Frog visual pattern.
 *
 * K146 / Bishop 036
 */

import React from "react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  useCampaigns,
  useChainStatus,
  type KickstarterCampaign,
} from "@/hooks/useKickstarterCampaigns";
import {
  Rocket, Link2, ChevronRight, Hexagon, Package,
  Skull, Bug, Layers,
} from "lucide-react";

const typeConfig: Record<
  KickstarterCampaign["product_type"],
  { icon: typeof Hexagon; color: string; bg: string; label: string }
> = {
  component: {
    icon: Hexagon,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15 border-cyan-500/30",
    label: "Component",
  },
  character: {
    icon: Package,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15 border-emerald-500/30",
    label: "Character",
  },
  creature: {
    icon: Bug,
    color: "text-purple-400",
    bg: "bg-purple-500/15 border-purple-500/30",
    label: "Creature",
  },
  assembly: {
    icon: Layers,
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
    label: "Assembly",
  },
};

const statusConfig: Record<
  string,
  { label: string; cls: string; pulse?: boolean }
> = {
  upcoming: { label: "Upcoming", cls: "bg-zinc-600/50 text-zinc-300" },
  live: {
    label: "Live Now",
    cls: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    pulse: true,
  },
  funded: { label: "Funded", cls: "bg-emerald-500/20 text-emerald-300" },
  fulfilled: { label: "Fulfilled", cls: "bg-sky-500/20 text-sky-300" },
  cancelled: { label: "Cancelled", cls: "bg-red-500/20 text-red-400" },
};

function CampaignCard({ campaign }: { campaign: KickstarterCampaign }) {
  const type = typeConfig[campaign.product_type];
  const status = statusConfig[campaign.status] ?? statusConfig.upcoming;
  const progressPct = campaign.goal_amount
    ? Math.min(100, (campaign.raised_amount / campaign.goal_amount) * 100)
    : 0;
  const TypeIcon = type.icon;

  return (
    <Link
      to={`/hexisle/campaign/${campaign.slug}`}
      className={`group relative rounded-xl border p-5 transition-all hover:scale-[1.02] hover:shadow-lg ${type.bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono text-muted-foreground">
          #{campaign.campaign_number} of 13
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls} ${
            status.pulse ? "animate-pulse" : ""
          }`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <TypeIcon className={`h-5 w-5 ${type.color}`} />
        <h3 className="font-semibold text-white text-sm leading-tight">
          {campaign.title}
        </h3>
      </div>

      <span className={`text-xs ${type.color} font-medium`}>
        {type.label}
      </span>

      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>
            ${campaign.raised_amount.toLocaleString()} raised
          </span>
          <span>${campaign.goal_amount.toLocaleString()} goal</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground">
          {campaign.backer_count} backers
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}

const HexIsleCampaignsPage: React.FC = () => {
  const { campaigns, isLoading: campLoading } = useCampaigns();
  const {
    chainLength,
    bonusPct,
    backedCampaignIds,
    isLoading: chainLoading,
  } = useChainStatus();

  const nextCampaign = campaigns.find(
    (c) => !backedCampaignIds.has(c.id) && c.status !== "cancelled"
  );

  if (campLoading || chainLoading) {
    return (
      <PortalPageLayout variant="stage" title="HexIsle Campaigns">
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-muted-foreground animate-pulse">
            Loading campaigns...
          </div>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" backButton>
      {/* Chain Status Banner */}
      <div className="mb-8 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link2 className="h-6 w-6 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-white">
                THE HEXISLE CHAIN — 13 Campaigns. One Journey.
              </h2>
              <p className="text-sm text-amber-200/70">
                Your chain: {chainLength} link{chainLength !== 1 ? "s" : ""}{" "}
                → {bonusPct}% bonus
                {nextCampaign && (
                  <>
                    {" "}| Next:{" "}
                    <span className="text-amber-300 font-medium">
                      Campaign {nextCampaign.campaign_number} — {nextCampaign.title}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <Link
            to="/chain"
            className="text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            Chain Dashboard <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <Rocket className="h-7 w-7 text-cyan-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">
            HexIsle Campaigns
          </h1>
          <p className="text-muted-foreground text-sm">
            13 campaigns, Leap Frog cadence — component ↔ character alternation
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Object.entries(typeConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
              <span className={cfg.color}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </PortalPageLayout>
  );
};

export default HexIsleCampaignsPage;
