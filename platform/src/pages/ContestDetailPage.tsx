import { useParams, Link, useNavigate } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useContest, useContestEntries, useUserContestVotes, getContestPhase } from "@/hooks/useContests";
import { ContestTimeline, ContestEntryGallery, ContestLeaderboard, ContestEntryForm } from "@/components/contest";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Calendar, ArrowRight, FileText, PenLine } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export default function ContestDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: contest, isLoading } = useContest(slug);
  const { data: entries } = useContestEntries(contest?.id);
  const { data: userVotes } = useUserContestVotes(contest?.id);

  const phase = contest ? getContestPhase(contest) : "upcoming";
  const votingOpen = phase === "voting";
  const submissionsOpen = phase === "submissions";

  const userVotedEntryIds = useMemo(
    () => new Set((userVotes ?? []).map((v) => v.entry_id)),
    [userVotes]
  );

  const userHasEntry = useMemo(
    () => (entries ?? []).some((e) => e.user_id === user?.id),
    [entries, user]
  );

  if (isLoading) {
    return (
      <PortalPageLayout title="Contest" maxWidth="2xl">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PortalPageLayout>
    );
  }

  if (!contest) {
    return (
      <PortalPageLayout title="Contest Not Found" maxWidth="2xl">
        <div className="py-16 text-center">
          <p className="text-muted-foreground">This contest doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate("/contests")}>
            Browse Contests
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  const subStart = new Date(contest.submission_start);
  const subEnd = new Date(contest.submission_end);
  const voteEnd = new Date(contest.voting_end);

  return (
    <PortalPageLayout
      title={contest.title}
      subtitle={contest.description}
      maxWidth="2xl"
      xrayId="contest-detail"
    >
      <div className="space-y-8 pb-12">
        {/* Timeline */}
        <ContestTimeline contest={contest} />

        {/* Info row */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Trophy className="h-3 w-3" />
            {contest.craft_type}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            Submissions: {subStart.toLocaleDateString()} – {subEnd.toLocaleDateString()}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            Voting ends: {voteEnd.toLocaleDateString()}
          </Badge>
          <Badge variant="outline" className="gap-1">
            {(entries ?? []).length} entries
          </Badge>
        </div>

        {/* Prize info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-amber-500" />
              Prize
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{contest.prize_description}</p>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-line">{contest.rules}</div>
          </CardContent>
        </Card>

        {/* CTA */}
        {submissionsOpen && !userHasEntry && (
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">
              <PenLine className="mr-2 inline h-5 w-5" />
              Enter This Contest
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a Turn-Key project with your design and submit it as your entry.
            </p>
            <Button
              onClick={() => navigate(`/contests/${contest.slug}/enter`)}
              className="gap-1.5"
            >
              Submit Entry <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Leaderboard */}
        <ContestLeaderboard entries={entries ?? []} />

        {/* Entry gallery */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Entries</h3>
          <ContestEntryGallery
            entries={entries ?? []}
            votingOpen={votingOpen}
            userVotedEntryIds={userVotedEntryIds}
          />
        </div>
      </div>
    </PortalPageLayout>
  );
}
