import { useParams, useNavigate } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useContest, getContestPhase } from "@/hooks/useContests";
import { ContestEntryForm, ContestTimeline } from "@/components/contest";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useMembershipStatus } from "@/hooks/useMembershipStatus";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

export default function ContestEntryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: contest, isLoading } = useContest(slug);
  const membership = useMembershipStatus();

  if (isLoading) {
    return (
      <PortalPageLayout title="Enter Contest" maxWidth="lg">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PortalPageLayout>
    );
  }

  if (!contest) {
    return (
      <PortalPageLayout title="Contest Not Found" maxWidth="lg">
        <div className="py-16 text-center">
          <p className="text-muted-foreground">This contest doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate("/contests")}>
            Browse Contests
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  const phase = getContestPhase(contest);
  const submissionsOpen = phase === "submissions";

  if (!user) {
    return (
      <PortalPageLayout title={`Enter: ${contest.title}`} maxWidth="lg">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Create a free account to enter this contest. Membership is $5/year.
            </p>
            <Button onClick={() => navigate("/auth")}>Sign Up / Sign In</Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  const isActiveMember = !membership.isGated;

  if (!isActiveMember) {
    return (
      <PortalPageLayout title={`Enter: ${contest.title}`} maxWidth="lg">
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              An active $5/year membership is required to submit contest entries.
            </p>
            <Button onClick={() => navigate("/membership/confirm")}>
              Become a Member — $5/year
            </Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  if (!submissionsOpen) {
    return (
      <PortalPageLayout title={`Enter: ${contest.title}`} maxWidth="lg">
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <ContestTimeline contest={contest} />
            <p className="text-sm text-muted-foreground">
              {phase === "upcoming"
                ? `Submissions open ${new Date(contest.submission_start).toLocaleDateString()}.`
                : "Submissions are closed for this contest."}
            </p>
            <Button variant="outline" onClick={() => navigate(`/contests/${contest.slug}`)}>
              View Contest
            </Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout
      title={`Enter: ${contest.title}`}
      subtitle="Submit your design as a contest entry"
      maxWidth="lg"
      xrayId="contest-entry-page"
    >
      <div className="space-y-6 pb-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/contests/${contest.slug}`)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contest
        </Button>

        <ContestTimeline contest={contest} />

        <ContestEntryForm contestId={contest.id} contestSlug={contest.slug} />
      </div>
    </PortalPageLayout>
  );
}
