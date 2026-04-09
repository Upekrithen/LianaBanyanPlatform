import { useMemo, useState } from "react";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  ActiveModerationQueue,
  CommunityFlag,
  CommunityFlagsFeed,
  ContentShieldCase,
  DefenseSystemExplainer,
  MyCasesPanel,
  ReportIssueFlow,
} from "@/components/v2/content-shield";
import { toast } from "sonner";

const WILDFIRE_CASES: ContentShieldCase[] = [
  {
    id: "case-1",
    category: "Harassment",
    summary: "Repeated hostile comments in discussion thread.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    status: "steward_review",
    visibilityNote: "Assigned to steward review with status updates enabled.",
  },
  {
    id: "case-2",
    category: "Misinformation",
    summary: "Potentially false claim in project update post.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 27).toISOString(),
    status: "community_flags",
    visibilityNote: "Gathering community context before steward judgment.",
  },
];

const WILDFIRE_FLAGS: CommunityFlag[] = [
  {
    id: "flag-1",
    target: "Post #R-2892",
    reason: "Coordinated spam pattern",
    flaggedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    flagCount: 7,
  },
  {
    id: "flag-2",
    target: "Comment #C-1198",
    reason: "Potential harassment",
    flaggedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    flagCount: 4,
  },
];

export default function ContentShieldV2Page() {
  const tourTarget = useTourTarget("content-shield");
  const { isRunning: isWildfireTour } = useWildfireRun();
  const { isAdmin, isProjectOwner } = useUserRole();
  const [cases, setCases] = useState<ContentShieldCase[]>([]);

  const canViewStewardSurfaces = isAdmin || isProjectOwner;

  const visibleCases = useMemo(() => {
    if (isWildfireTour) return WILDFIRE_CASES;
    return cases;
  }, [isWildfireTour, cases]);

  const communityFlags = isWildfireTour ? WILDFIRE_FLAGS : [];
  const moderationQueue = isWildfireTour ? WILDFIRE_CASES : [];

  const handleReportSubmit = (payload: { category: string; summary: string; details: string }) => {
    const nextCase: ContentShieldCase = {
      id: `case-${Date.now()}`,
      category: payload.category,
      summary: payload.summary,
      createdAt: new Date().toISOString(),
      status: "submitted",
      visibilityNote: "Submitted and visible. Automated review is next.",
    };

    setCases((current) => [nextCase, ...current]);
    toast.success("Issue submitted. You can track status in My Cases.");
  };

  return (
    <AppShell
      xrayBase="content-shield"
      pageTitle="Content Shield"
      breadcrumbs="Member workspace / Safety and defense"
      hero={
        <Hero
          variant="app"
          eyebrow="Safety and Defense"
          headline="Protect the commons without treating everyone like a suspect"
          body="Content Shield gives members a respectful path to report problems, follow case status, and understand how automated review, community flags, steward judgment, and founder override work together."
          primaryCTA={{ label: "Report an Issue", href: "#content-shield-report-anchor" }}
          secondaryCTA={{ label: "View My Cases", href: "#content-shield-cases-anchor" }}
          proofStrip={[
            "Automated review",
            "Community flags",
            "Steward judgment",
            "Founder override",
          ]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />

        <div id="content-shield-report-anchor" data-xray-id="content-shield-tour-anchor" />
        <ReportIssueFlow onSubmit={handleReportSubmit} />

        <div id="content-shield-cases-anchor" data-xray-id="content-shield-cases-anchor" />
        <MyCasesPanel cases={visibleCases} />

        <DefenseSystemExplainer />

        {canViewStewardSurfaces ? (
          <>
            <CommunityFlagsFeed flags={communityFlags} />
            <ActiveModerationQueue queue={moderationQueue} />
          </>
        ) : null}
      </div>
      <StickyMobileCTA primary={{ label: "Report an Issue", href: "#content-shield-report-anchor" }} />
    </AppShell>
  );
}
