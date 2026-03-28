import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Megaphone,
  CheckCircle2,
  Clock,
  Share2,
  Download,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Utensils,
  Scissors,
  Wrench,
  ShoppingBag,
} from "lucide-react";
import {
  useCaptainPipeline,
  groupByStage,
  type PipelineCampaign,
  type PipelineStage,
} from "@/hooks/useCaptainPipeline";

const STAGE_BADGE: Record<PipelineStage, { label: string; className: string }> = {
  early: { label: "EARLY", className: "border-slate-500 text-slate-300 bg-slate-500/10" },
  rallying: { label: "RALLYING", className: "border-amber-500 text-amber-300 bg-amber-500/10" },
  ready_to_pitch: { label: "READY TO PITCH", className: "border-emerald-500 text-emerald-300 bg-emerald-500/10" },
  pitched: { label: "PITCHED", className: "border-blue-500 text-blue-300 bg-blue-500/10" },
  onboarded: { label: "ONBOARDED", className: "border-green-500 text-green-300 bg-green-500/10" },
  accepted: { label: "ACCEPTED", className: "border-green-500 text-green-300 bg-green-500/10" },
  declined: { label: "DECLINED", className: "border-red-500 text-red-300 bg-red-500/10" },
};

const CATEGORY_ICON: Record<string, typeof Utensils> = {
  restaurant: Utensils,
  food_truck: Utensils,
  bakery: Utensils,
  catering: Utensils,
  barber: Scissors,
  salon: Scissors,
  mechanic: Wrench,
  auto_service: Wrench,
  retail: ShoppingBag,
  grocery: ShoppingBag,
};

export function CaptainPipeline() {
  const { data: campaigns = [], isLoading } = useCaptainPipeline();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/30">
        <CardContent className="p-8 text-center text-slate-500 space-y-3">
          <Megaphone className="w-10 h-10 mx-auto text-slate-600" />
          <p>No campaigns in your pipeline yet.</p>
          <p className="text-xs text-slate-600">
            Claim uncaptained campaigns from the{" "}
            <Link to="/campaigns" className="text-blue-400 hover:underline">
              Campaign Directory
            </Link>{" "}
            or create one from your Territory view.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { active, pitched, onboarded } = groupByStage(campaigns);

  return (
    <div className="space-y-8">
      {/* Active campaigns */}
      {active.length > 0 && (
        <PipelineSection
          title={`Active Campaigns (${active.length})`}
          icon={<Megaphone className="w-5 h-5 text-amber-400" />}
          campaigns={active}
        />
      )}

      {/* Pitched — awaiting response */}
      {pitched.length > 0 && (
        <PipelineSection
          title={`Pitched — Awaiting Response (${pitched.length})`}
          icon={<Clock className="w-5 h-5 text-blue-400" />}
          campaigns={pitched}
        />
      )}

      {/* Recently onboarded */}
      {onboarded.length > 0 && (
        <PipelineSection
          title={`Recently Onboarded (${onboarded.length})`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          campaigns={onboarded}
        />
      )}
    </div>
  );
}

function PipelineSection({
  title,
  icon,
  campaigns,
}: {
  title: string;
  icon: React.ReactNode;
  campaigns: PipelineCampaign[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-300 uppercase tracking-wide">
        {icon}
        {title}
      </h3>
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: PipelineCampaign }) {
  const threshold = campaign.pledge_threshold || 30;
  const ratio = Math.min(campaign.pledge_count / threshold, 1);
  const badge = STAGE_BADGE[campaign.stage];
  const CategoryIcon = CATEGORY_ICON[campaign.business_type] ?? Megaphone;

  return (
    <Card className="border-slate-700 bg-slate-800/30 hover:border-slate-600 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <CategoryIcon className="w-4 h-4 text-slate-400 shrink-0" />
            {campaign.business_name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {campaign.pledge_count}/{threshold} pledges
            </span>
            {ratio >= 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
        </div>
        <CardDescription className="text-xs flex items-center gap-2">
          <span>{campaign.business_city}</span>
          <span className="text-slate-600">·</span>
          <span>${campaign.pledge_total_credits} pledged</span>
          <span className="text-slate-600">·</span>
          <Badge variant="outline" className={`text-[10px] ${badge.className}`}>
            {badge.label}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {(campaign.stage === "early" || campaign.stage === "rallying" || campaign.stage === "ready_to_pitch") && (
          <Progress value={ratio * 100} className="h-1.5" />
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {campaign.stage === "ready_to_pitch" && (
            <Button variant="outline" size="sm" className="text-xs border-emerald-500/30 text-emerald-300" asChild>
              <Link to={`/campaigns/${campaign.slug}/pitch`}>
                <Download className="w-3 h-3 mr-1" />
                Download Pitch Packet
              </Link>
            </Button>
          )}

          {(campaign.stage === "early" || campaign.stage === "rallying") && (
            <Button variant="outline" size="sm" className="text-xs border-blue-500/30 text-blue-300" asChild>
              <Link to={`/campaigns/${campaign.slug}`}>
                <Share2 className="w-3 h-3 mr-1" />
                Share Campaign
              </Link>
            </Button>
          )}

          {campaign.stage === "early" && (
            <Button variant="outline" size="sm" className="text-xs border-amber-500/30 text-amber-300" asChild>
              <Link to={`/campaigns/${campaign.slug}`}>
                <Zap className="w-3 h-3 mr-1" />
                Seed More Marks
              </Link>
            </Button>
          )}

          {campaign.stage === "pitched" && (
            <>
              <Button variant="outline" size="sm" className="text-xs border-emerald-500/30 text-emerald-300">
                <ThumbsUp className="w-3 h-3 mr-1" />
                Mark Accepted
              </Button>
              <Button variant="outline" size="sm" className="text-xs border-red-500/30 text-red-300">
                <ThumbsDown className="w-3 h-3 mr-1" />
                Mark Declined
              </Button>
            </>
          )}

          {campaign.stage === "pitched" && campaign.pitched_at && (
            <span className="text-[10px] text-slate-500 ml-auto">
              Pitched {new Date(campaign.pitched_at).toLocaleDateString()}
            </span>
          )}

          {campaign.stage === "onboarded" && campaign.accepted_at && (
            <span className="text-xs text-emerald-400/60 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Onboarded {new Date(campaign.accepted_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
