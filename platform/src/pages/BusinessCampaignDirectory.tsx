import { useState } from "react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useBusinessCampaigns, CAMPAIGN_FILTER_GROUPS, getBusinessTypeLabel } from "@/hooks/useBusinessCampaigns";
import type { BusinessCampaign } from "@/hooks/useBusinessCampaigns";
import { Store, Loader2, MapPin, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LearnMoreBadge } from "@/components/cephas/LearnMoreBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

function CampaignCard({ campaign }: { campaign: BusinessCampaign }) {
  const pct = campaign.pledge_threshold > 0
    ? Math.min(100, Math.round((campaign.pledge_count / campaign.pledge_threshold) * 100))
    : 0;

  const statusColors: Record<string, string> = {
    gathering: "bg-blue-500/10 text-blue-700 border-blue-200",
    threshold_met: "bg-amber-500/10 text-amber-700 border-amber-200",
    pitched: "bg-purple-500/10 text-purple-700 border-purple-200",
    accepted: "bg-green-500/10 text-green-700 border-green-200",
    active: "bg-green-600/10 text-green-800 border-green-300",
    declined: "bg-red-500/10 text-red-700 border-red-200",
    expired: "bg-gray-500/10 text-gray-600 border-gray-200",
  };

  return (
    <Link to={`/campaigns/${campaign.slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight">{campaign.business_name}</CardTitle>
            <Badge variant="outline" className={statusColors[campaign.status] ?? ""}>
              {campaign.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {getBusinessTypeLabel(campaign.business_type)} · {campaign.business_city}
            {campaign.business_state ? `, ${campaign.business_state}` : ""}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {campaign.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.description}
            </p>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {campaign.pledge_count}/{campaign.pledge_threshold} pledges
              </span>
              <span className="font-medium">${Number(campaign.pledge_total_credits).toFixed(0)} committed</span>
            </div>
            <Progress value={pct} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{pct}%</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BusinessCampaignDirectory() {
  const [filter, setFilter] = useState("All");
  const { data: campaigns, isLoading } = useBusinessCampaigns(filter);

  const gathering = (campaigns ?? []).filter((c) => c.status === "gathering");
  const thresholdMet = (campaigns ?? []).filter((c) =>
    ["threshold_met", "pitched"].includes(c.status)
  );
  const active = (campaigns ?? []).filter((c) =>
    ["accepted", "active"].includes(c.status)
  );

  return (
    <PortalPageLayout
      title={<span className="inline-flex items-center gap-2">Local Business Campaigns <LearnMoreBadge featurePath="/campaigns" variant="icon" /></span>}
      subtitle={`"Volume discount, baby."`}
      maxWidth="2xl"
      xrayId="business-campaigns"
    >
      <div className="space-y-8 pb-12">
        <div className="flex flex-wrap items-center gap-2">
          {CAMPAIGN_FILTER_GROUPS.map((g) => (
            <Button
              key={g.label}
              size="sm"
              variant={filter === g.label ? "default" : "outline"}
              onClick={() => setFilter(g.label)}
            >
              {g.label}
            </Button>
          ))}

          <div className="ml-auto">
            <Button asChild size="sm">
              <Link to="/campaigns/nominate">
                <Plus className="h-4 w-4 mr-1" />
                Nominate a Business
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {gathering.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Gathering Pledges
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {gathering.map((c) => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                </div>
              </section>
            )}

            {thresholdMet.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Store className="h-5 w-5 text-amber-600" />
                  Ready to Pitch
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {thresholdMet.map((c) => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                </div>
              </section>
            )}

            {active.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Store className="h-5 w-5 text-green-600" />
                  Active Businesses
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {active.map((c) => (
                    <CampaignCard key={c.id} campaign={c} />
                  ))}
                </div>
              </section>
            )}

            {!gathering.length && !thresholdMet.length && !active.length && (
              <div className="rounded-lg border border-dashed py-16 text-center">
                <Store className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-medium mb-1">No campaigns yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                  Know a local business that should join Liana Banyan? Nominate them and rally your community.
                </p>
                <Button size="sm" asChild>
                  <Link to="/campaigns/nominate">
                    <Plus className="h-4 w-4 mr-1" />
                    Nominate a Business You Love
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PortalPageLayout>
  );
}
