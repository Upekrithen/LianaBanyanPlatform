/**
 * BountyDetail — full Bounty page with submission flow
 * KN088 / BP009. Used as a route page at /bounties/:slug
 * data-xray-id: bounty-detail
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trophy, CheckCircle2, Users, FileText } from "lucide-react";
import { getBountyBySlug } from "@/data/featured_bounties_bp009";
import { FeaturedBountyCard } from "./FeaturedBountyCard";
import { BountySubmissionForm } from "./BountySubmissionForm";
import { BountyVerificationStatus } from "./BountyVerificationStatus";
import { KallistraFramingCard } from "@/components/lb-frame-onboarding/KallistraFramingCard";

interface BountyDetailProps {
  slug: string;
}

interface AwardedSubmission {
  id: string;
  title: string;
  description: string;
  hardware_platform: string | null;
  marks_awarded: number;
  awarded_at: string;
  profiles: { full_name: string | null; username: string | null } | null;
}

export function BountyDetail({ slug }: BountyDetailProps) {
  const { user } = useAuth();
  const bounty = getBountyBySlug(slug);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: dbBounty } = useQuery({
    queryKey: ["bounty-db", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("bounties")
        .select("id, status, reward_marks")
        .eq("slug", slug)
        .single();
      return data;
    },
  });

  const { data: awardedSubmissions = [] } = useQuery<AwardedSubmission[]>({
    queryKey: ["bounty-awarded-submissions", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("bounty_submissions")
        .select("id, title, description, hardware_platform, marks_awarded, awarded_at, profiles(full_name, username)")
        .eq("bounty_id", dbBounty?.id ?? "")
        .eq("status", "awarded")
        .order("awarded_at", { ascending: false })
        .limit(10);
      return (data ?? []) as AwardedSubmission[];
    },
    enabled: !!dbBounty?.id,
  });

  if (!bounty) {
    return (
      <div className="text-center py-16 text-muted-foreground" data-xray-id="bounty-detail">
        Bounty not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8 px-4" data-xray-id="bounty-detail">
      <FeaturedBountyCard bounty={bounty} compact={false} />

      <KallistraFramingCard recipientContext={bounty.enterpriseCohort?.split('/')[0].trim()} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Submission Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>{bounty.submissionRequirements}</p>
          <div className="rounded bg-muted/40 p-3 text-xs">
            <strong>Verification method:</strong> {bounty.verificationMethod}
          </div>
        </CardContent>
      </Card>

      {/* Submission flow */}
      {!submittedId ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4 text-amber-500" />
              Submit Your Work — {bounty.rewardMarks.toLocaleString()} Marks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showForm ? (
              <BountySubmissionForm
                bounty={bounty}
                bountyDbId={dbBounty?.id}
                onSuccess={() => setShowForm(false)}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Ready to submit? Make sure you've addressed all requirements above.
                  Furnace gear-tooth-fit verification runs automatically.
                </p>
                <Button
                  onClick={() => {
                    if (!user) {
                      window.location.href = "/auth";
                    } else {
                      setShowForm(true);
                    }
                  }}
                  className="gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  {user ? "Submit My Work" : "Sign In to Submit"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Verification Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BountyVerificationStatus submissionId={submittedId} />
          </CardContent>
        </Card>
      )}

      {/* Awarded submissions */}
      {awardedSubmissions.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Awarded Submissions ({awardedSubmissions.length})
            </h3>
            {awardedSubmissions.map((sub) => (
              <Card key={sub.id} className="border-emerald-200 dark:border-emerald-800">
                <CardContent className="py-3 px-4 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{sub.title}</p>
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shrink-0 text-xs">
                      <Trophy className="w-3 h-3 mr-1" />
                      {sub.marks_awarded.toLocaleString()} Marks
                    </Badge>
                  </div>
                  {sub.hardware_platform && (
                    <p className="text-xs text-muted-foreground">Platform: {sub.hardware_platform}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {sub.profiles?.full_name ?? sub.profiles?.username ?? "Community member"} ·{" "}
                    {new Date(sub.awarded_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
