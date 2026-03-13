/**
 * AMBASSADOR PORTFOLIO STATS — Verified stats for portfolio page (V2).
 * data-xray-id: ambassador-portfolio-stats
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AmbassadorPortfolioStatsProps {
  membersOnboarded?: number;
  ambassadorsTrained?: number;
  downstreamMembers?: number;
  crewSuccessRate?: number | null;
  avgOnboardingMinutes?: number | null;
  className?: string;
}

export function AmbassadorPortfolioStats({
  membersOnboarded = 0,
  ambassadorsTrained = 0,
  downstreamMembers = 0,
  crewSuccessRate,
  avgOnboardingMinutes,
  className,
}: AmbassadorPortfolioStatsProps) {
  return (
    <Card className={cn("border-2 border-border", className)} data-xray-id="ambassador-portfolio-stats">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Verified stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>Members onboarded: {membersOnboarded}</p>
        <p>Ambassadors trained: {ambassadorsTrained}</p>
        <p>Downstream members: {downstreamMembers}</p>
        {crewSuccessRate != null && <p>Crew success: {Number(crewSuccessRate) * 100}%</p>}
        {avgOnboardingMinutes != null && <p>Avg onboarding: {avgOnboardingMinutes} min</p>}
      </CardContent>
    </Card>
  );
}
