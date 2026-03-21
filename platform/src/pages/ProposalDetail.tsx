/**
 * GOVERNANCE — Proposal Detail Page
 * ===================================
 * Individual proposal view with voting, discussion, and timeline.
 *
 * Route: /governance/proposals/:id
 * Backend: proposals, votes, vote_allocations
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare,
  Clock, User, Shield, Scale, CheckCircle, XCircle,
  AlertTriangle, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [voteComment, setVoteComment] = useState("");

  // Fetch proposal
  const { data: proposal, isLoading } = useQuery({
    queryKey: ["proposal", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch votes for this proposal
  const { data: votes } = useQuery({
    queryKey: ["proposal-votes", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("votes")
        .select("*")
        .eq("proposal_id", id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!id,
  });

  // Check if current user already voted
  const { data: myVote } = useQuery({
    queryKey: ["my-vote", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("votes")
        .select("*")
        .eq("proposal_id", id)
        .eq("voter_id", user.id)
        .single();
      return data;
    },
    enabled: !!id && !!user,
  });

  // Cast vote
  const castVote = useMutation({
    mutationFn: async (voteType: "for" | "against" | "abstain") => {
      if (!user || !id) throw new Error("Not ready");

      const { error } = await supabase.from("votes").upsert({
        proposal_id: id,
        voter_id: user.id,
        vote_type: voteType,
        comment: voteComment || null,
        weight: 1,
        created_at: new Date().toISOString(),
      }, { onConflict: "proposal_id,voter_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vote recorded!");
      setVoteComment("");
      queryClient.invalidateQueries({ queryKey: ["proposal-votes", id] });
      queryClient.invalidateQueries({ queryKey: ["my-vote", id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to cast vote");
    },
  });

  if (isLoading) {
    return (
      <PortalPageLayout>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </PortalPageLayout>
    );
  }

  if (!proposal) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold">Proposal Not Found</h1>
        <Button onClick={() => navigate("/governance")} className="mt-4">
          Back to Governance
        </Button>
      </div>
    );
  }

  const forVotes = votes?.filter((v) => v.vote_type === "for").length || 0;
  const againstVotes = votes?.filter((v) => v.vote_type === "against").length || 0;
  const abstainVotes = votes?.filter((v) => v.vote_type === "abstain").length || 0;
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const forPercent = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600",
    active: "bg-blue-500/10 text-blue-600",
    passed: "bg-green-500/10 text-green-600",
    failed: "bg-red-500/10 text-red-600",
    implemented: "bg-purple-500/10 text-purple-600",
  };

  return (
    <PortalPageLayout>
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate("/governance")} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Governance
      </Button>

      {/* Proposal Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{proposal.title || `Proposal ${proposal.id?.slice(0, 8)}`}</CardTitle>
              <CardDescription>{proposal.description || proposal.scope}</CardDescription>
            </div>
            <Badge className={statusColors[proposal.status] || "bg-muted"}>
              {proposal.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {new Date(proposal.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              {proposal.provider_id ? "Member Submitted" : "System"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="w-4 h-4" />
              {proposal.proposal_type || "Standard"}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              {proposal.requires_supermajority ? "Supermajority" : "Simple Majority"}
            </div>
          </div>

          {/* Proposal body */}
          {proposal.scope && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Proposal Details
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {proposal.scope}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vote Tally */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vote Tally</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
              <ThumbsUp className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{forVotes}</div>
              <div className="text-xs text-muted-foreground">For</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <ThumbsDown className="w-6 h-6 mx-auto mb-1 text-red-600" />
              <div className="text-2xl font-bold text-red-600">{againstVotes}</div>
              <div className="text-xs text-muted-foreground">Against</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-500/5 border border-gray-500/10">
              <MessageSquare className="w-6 h-6 mx-auto mb-1 text-gray-600" />
              <div className="text-2xl font-bold text-gray-600">{abstainVotes}</div>
              <div className="text-xs text-muted-foreground">Abstain</div>
            </div>
          </div>

          {totalVotes > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">For: {forPercent.toFixed(1)}%</span>
                <span className="text-red-600">Against: {(100 - forPercent).toFixed(1)}%</span>
              </div>
              <Progress value={forPercent} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                {totalVotes} total votes cast
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cast Vote */}
      {user && proposal.status !== "passed" && proposal.status !== "failed" && proposal.status !== "implemented" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {myVote ? "Update Your Vote" : "Cast Your Vote"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myVote && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm">
                  You voted: <strong className="text-primary">{myVote.vote_type}</strong>
                  {myVote.comment && <span className="text-muted-foreground"> — "{myVote.comment}"</span>}
                </p>
              </div>
            )}

            <Textarea
              value={voteComment}
              onChange={(e) => setVoteComment(e.target.value)}
              placeholder="Optional: explain your reasoning..."
              rows={3}
            />

            <div className="flex gap-3">
              <Button
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => castVote.mutate("for")}
                disabled={castVote.isPending}
              >
                <ThumbsUp className="w-4 h-4" />
                Vote For
              </Button>
              <Button
                className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
                onClick={() => castVote.mutate("against")}
                disabled={castVote.isPending}
              >
                <ThumbsDown className="w-4 h-4" />
                Vote Against
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => castVote.mutate("abstain")}
                disabled={castVote.isPending}
              >
                Abstain
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vote History */}
      {votes && votes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vote History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {votes.map((vote) => (
              <div key={vote.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {vote.vote_type === "for" && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {vote.vote_type === "against" && <XCircle className="w-4 h-4 text-red-600" />}
                  {vote.vote_type === "abstain" && <AlertTriangle className="w-4 h-4 text-gray-500" />}
                  <div>
                    <span className="text-sm font-medium capitalize">{vote.vote_type}</span>
                    {vote.comment && (
                      <p className="text-xs text-muted-foreground">{vote.comment}</p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(vote.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </PortalPageLayout>
  );
}
