/**
 * PROPOSALS LISTING — Browse all governance proposals
 * Route: /governance/proposals (ExplorerRoute)
 * Filter by status, sort by date or votes, link to ProposalDetail.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scale, FileText, Plus, Clock, Vote } from "lucide-react";

const STATUS_OPTIONS = ["all", "open", "pending", "voting", "passed", "rejected", "failed", "implemented"];

export default function ProposalsListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "votes">("date");

  const { data: proposals, isLoading } = useQuery({
    queryKey: ["proposals-listing", statusFilter],
    queryFn: async () => {
      let q = supabase
        .from("proposals")
        .select("id, title, description, scope, status, created_at, proposal_type, provider_id");
      if (statusFilter !== "all") {
        q = q.eq("status", statusFilter);
      }
      q = q.order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: voteCounts } = useQuery({
    queryKey: ["proposal-vote-counts", proposals?.map((p) => p.id)],
    queryFn: async () => {
      if (!proposals?.length) return {};
      const { data } = await supabase
        .from("votes")
        .select("proposal_id, vote_type")
        .in("proposal_id", proposals.map((p) => p.id));
      const counts: Record<string, { for: number; against: number }> = {};
      proposals.forEach((p) => { counts[p.id] = { for: 0, against: 0 }; });
      data?.forEach((v: { proposal_id: string; vote_type: string }) => {
        if (counts[v.proposal_id]) {
          if (v.vote_type === "for") counts[v.proposal_id].for++;
          else if (v.vote_type === "against") counts[v.proposal_id].against++;
        }
      });
      return counts;
    },
    enabled: !!proposals?.length,
  });

  const sorted = [...(proposals || [])].sort((a, b) => {
    if (sortBy === "votes") {
      const va = (voteCounts?.[a.id]?.for ?? 0) - (voteCounts?.[a.id]?.against ?? 0);
      const vb = (voteCounts?.[b.id]?.for ?? 0) - (voteCounts?.[b.id]?.against ?? 0);
      return vb - va;
    }
    return new Date((b.created_at || 0) as string).getTime() - new Date((a.created_at || 0) as string).getTime();
  });

  const statusColors: Record<string, string> = {
    open: "bg-green-500/10 text-green-600",
    pending: "bg-yellow-500/10 text-yellow-600",
    voting: "bg-blue-500/10 text-blue-600",
    passed: "bg-green-500/10 text-green-600",
    rejected: "bg-red-500/10 text-red-600",
    failed: "bg-red-500/10 text-red-600",
    implemented: "bg-purple-500/10 text-purple-600",
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6" data-xray-id="proposals-listing">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="w-8 h-8 text-primary" />
            Proposals
          </h1>
          <p className="text-muted-foreground">Browse and vote on governance proposals.</p>
        </div>
        {user && (
          <Button variant="outline" asChild>
            <Link to="/governance" className="gap-2">
              <Plus className="w-4 h-4" />
              Submit a Proposal
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "votes")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by date</SelectItem>
            <SelectItem value="votes">Sort by votes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No proposals match the current filter.</p>
            <Button variant="link" asChild className="mt-2">
              <Link to="/governance">Go to Governance</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((p) => {
            const counts = voteCounts?.[p.id];
            const title = (p as { title?: string }).title || (p as { cover_letter?: string }).cover_letter || `Proposal ${(p as { id: string }).id?.slice(0, 8)}`;
            return (
              <Card
                key={p.id}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => navigate(`/governance/proposals/${p.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{title}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {(p as { description?: string }).description || (p as { scope?: string }).scope || "—"}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[(p as { status?: string }).status || ""] || "bg-muted"}>
                      {(p as { status?: string }).status || "—"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date((p.created_at as string) || "").toLocaleDateString()}
                  </span>
                  {counts && (
                    <span className="flex items-center gap-1">
                      <Vote className="w-4 h-4" />
                      {counts.for} for · {counts.against} against
                    </span>
                  )}
                  <Link
                    to={`/governance/proposals/${p.id}`}
                    className="text-primary hover:underline ml-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View details →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
