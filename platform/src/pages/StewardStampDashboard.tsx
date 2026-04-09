import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Clock, Scale, ChevronRight } from "lucide-react";

type StampStatus = "filed" | "contested" | "upheld" | "dismissed" | "resolved_by_steward" | "appealed";
type AppealLevel = 1 | 2 | 3;

interface Stamp {
  id: string;
  agreement_id: string;
  stamper_id: string;
  respondent_id: string;
  category: string;
  description: string | null;
  status: StampStatus;
  photo_urls: string[];
  contested_at: string | null;
  contest_evidence: string | null;
  contest_photo_urls: string[] | null;
  incident_date: string;
  created_at: string;
  grace_period_ends: string;
  marks_forfeited: number;
  resolution_notes: string | null;
}

interface Appeal {
  id: string;
  stamp_id: string;
  appeal_level: AppealLevel;
  appellant_id: string;
  appeal_reason: string;
  decision: string | null;
  decided_by: string | null;
  decided_at: string | null;
  decision_notes: string | null;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  dishwashing: "Dishwashing",
  garbage_removal: "Garbage Removal",
  kitchen_hygiene: "Kitchen Hygiene",
  bathroom_hygiene: "Bathroom Hygiene",
  common_area: "Common Area",
};

const APPEAL_LEVEL_LABELS: Record<number, string> = {
  1: "Steward Review",
  2: "Ombudsperson",
  3: "AAA Arbitration",
};

export default function StewardStampDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [appealNotes, setAppealNotes] = useState<Record<string, string>>({});

  const { data: stamps = [], isLoading: stampsLoading } = useQuery({
    queryKey: ["steward-stamps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roommate_stamps")
        .select("*")
        .in("status", ["filed", "contested", "appealed"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Stamp[];
    },
    enabled: !!user,
  });

  const { data: appeals = [], isLoading: appealsLoading } = useQuery({
    queryKey: ["steward-appeals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roommate_stamp_appeals")
        .select("*")
        .is("decision", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Appeal[];
    },
    enabled: !!user,
  });

  const { data: resolvedStamps = [] } = useQuery({
    queryKey: ["steward-resolved-stamps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roommate_stamps")
        .select("*")
        .in("status", ["upheld", "dismissed", "resolved_by_steward"])
        .order("resolved_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as Stamp[];
    },
    enabled: !!user,
  });

  const resolveStampMutation = useMutation({
    mutationFn: async ({
      stampId,
      decision,
      notes,
    }: {
      stampId: string;
      decision: "upheld" | "dismissed" | "resolved_by_steward";
      notes: string;
    }) => {
      const { error } = await supabase
        .from("roommate_stamps")
        .update({
          status: decision,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", stampId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["steward-stamps"] });
      queryClient.invalidateQueries({ queryKey: ["steward-resolved-stamps"] });
      toast.success("Stamp resolved");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resolveAppealMutation = useMutation({
    mutationFn: async ({
      appealId,
      stampId,
      decision,
      notes,
    }: {
      appealId: string;
      stampId: string;
      decision: "upheld" | "overturned" | "modified";
      notes: string;
    }) => {
      const { error: appealErr } = await supabase
        .from("roommate_stamp_appeals")
        .update({
          decision,
          decided_by: user?.id,
          decided_at: new Date().toISOString(),
          decision_notes: notes,
        })
        .eq("id", appealId);
      if (appealErr) throw appealErr;

      if (decision === "overturned") {
        await supabase
          .from("roommate_stamps")
          .update({
            status: "dismissed",
            resolved_by: user?.id,
            resolved_at: new Date().toISOString(),
            resolution_notes: `Appeal ${decision}: ${notes}`,
          })
          .eq("id", stampId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["steward-stamps"] });
      queryClient.invalidateQueries({ queryKey: ["steward-appeals"] });
      queryClient.invalidateQueries({ queryKey: ["steward-resolved-stamps"] });
      toast.success("Appeal decided");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const pendingStamps = stamps.filter((s) => s.status === "filed" || s.status === "contested");
  const appealedStamps = stamps.filter((s) => s.status === "appealed");

  const isGracePeriodActive = (stamp: Stamp) =>
    new Date(stamp.grace_period_ends) > new Date();

  if (stampsLoading || appealsLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Steward Resolution Dashboard</h1>
          <p className="text-muted-foreground">
            Review, resolve, and manage roommate accountability stamps
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{pendingStamps.length}</div>
            <p className="text-sm text-muted-foreground">Pending Stamps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{appeals.length}</div>
            <p className="text-sm text-muted-foreground">Open Appeals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{appealedStamps.length}</div>
            <p className="text-sm text-muted-foreground">Escalated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{resolvedStamps.length}</div>
            <p className="text-sm text-muted-foreground">Resolved (Recent)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pendingStamps.length > 0 && `(${pendingStamps.length})`}
          </TabsTrigger>
          <TabsTrigger value="appeals">
            Appeals {appeals.length > 0 && `(${appeals.length})`}
          </TabsTrigger>
          <TabsTrigger value="resolved">History</TabsTrigger>
        </TabsList>

        {/* Pending Stamps */}
        <TabsContent value="pending" className="space-y-4">
          {pendingStamps.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending stamps to review</p>
              </CardContent>
            </Card>
          ) : (
            pendingStamps.map((stamp) => (
              <Card key={stamp.id} className="border-l-4 border-l-amber-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      {CATEGORY_LABELS[stamp.category] || stamp.category}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={stamp.status === "contested" ? "destructive" : "outline"}>
                        {stamp.status}
                      </Badge>
                      {isGracePeriodActive(stamp) && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Grace Period
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Incident: {new Date(stamp.incident_date).toLocaleDateString()} |
                    Filed: {new Date(stamp.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stamp.description && (
                    <div>
                      <p className="text-sm font-medium mb-1">Complaint:</p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {stamp.description}
                      </p>
                    </div>
                  )}

                  {stamp.photo_urls.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Evidence Photos ({stamp.photo_urls.length})
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {stamp.photo_urls.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Evidence ${i + 1}`}
                            className="w-20 h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {stamp.status === "contested" && stamp.contest_evidence && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-1 text-blue-600">
                        Contest Response:
                      </p>
                      <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded">
                        {stamp.contest_evidence}
                      </p>
                      {stamp.contest_photo_urls && stamp.contest_photo_urls.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2">
                          {stamp.contest_photo_urls.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`Contest evidence ${i + 1}`}
                              className="w-20 h-20 object-cover rounded border border-blue-300"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Textarea
                      placeholder="Resolution notes..."
                      value={resolutionNotes[stamp.id] || ""}
                      onChange={(e) =>
                        setResolutionNotes((prev) => ({ ...prev, [stamp.id]: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        resolveStampMutation.mutate({
                          stampId: stamp.id,
                          decision: "dismissed",
                          notes: resolutionNotes[stamp.id] || "Dismissed by steward",
                        })
                      }
                      disabled={resolveStampMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Dismiss
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        resolveStampMutation.mutate({
                          stampId: stamp.id,
                          decision: "resolved_by_steward",
                          notes: resolutionNotes[stamp.id] || "Resolved by steward mediation",
                        })
                      }
                      disabled={resolveStampMutation.isPending}
                    >
                      <Scale className="h-4 w-4 mr-1" /> Mediate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        resolveStampMutation.mutate({
                          stampId: stamp.id,
                          decision: "upheld",
                          notes: resolutionNotes[stamp.id] || "Stamp upheld by steward review",
                        })
                      }
                      disabled={resolveStampMutation.isPending || isGracePeriodActive(stamp)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Uphold
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Appeals */}
        <TabsContent value="appeals" className="space-y-4">
          {appeals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No open appeals</p>
              </CardContent>
            </Card>
          ) : (
            appeals.map((appeal) => (
              <Card key={appeal.id} className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Scale className="h-5 w-5 text-purple-500" />
                      Appeal Level {appeal.appeal_level}
                    </CardTitle>
                    <Badge variant="secondary">
                      {APPEAL_LEVEL_LABELS[appeal.appeal_level]}
                    </Badge>
                  </div>
                  <CardDescription>
                    Filed: {new Date(appeal.created_at).toLocaleDateString()} |
                    Stamp: {appeal.stamp_id.slice(0, 8)}...
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Appeal Reason:</p>
                    <p className="text-sm text-muted-foreground bg-purple-50 dark:bg-purple-950 p-3 rounded">
                      {appeal.appeal_reason}
                    </p>
                  </div>

                  {appeal.appeal_level >= 3 && (
                    <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Level 3: This appeal qualifies for AAA Arbitration.
                        Document your decision thoroughly.
                      </p>
                    </div>
                  )}

                  <div>
                    <Textarea
                      placeholder="Decision notes..."
                      value={appealNotes[appeal.id] || ""}
                      onChange={(e) =>
                        setAppealNotes((prev) => ({ ...prev, [appeal.id]: e.target.value }))
                      }
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        resolveAppealMutation.mutate({
                          appealId: appeal.id,
                          stampId: appeal.stamp_id,
                          decision: "overturned",
                          notes: appealNotes[appeal.id] || "Appeal granted — stamp overturned",
                        })
                      }
                      disabled={resolveAppealMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Overturn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        resolveAppealMutation.mutate({
                          appealId: appeal.id,
                          stampId: appeal.stamp_id,
                          decision: "modified",
                          notes: appealNotes[appeal.id] || "Appeal partially granted",
                        })
                      }
                      disabled={resolveAppealMutation.isPending}
                    >
                      <Scale className="h-4 w-4 mr-1" /> Modify
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        resolveAppealMutation.mutate({
                          appealId: appeal.id,
                          stampId: appeal.stamp_id,
                          decision: "upheld",
                          notes: appealNotes[appeal.id] || "Original decision upheld on appeal",
                        })
                      }
                      disabled={resolveAppealMutation.isPending}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Uphold Original
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Resolved History */}
        <TabsContent value="resolved" className="space-y-4">
          {resolvedStamps.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No resolved stamps yet</p>
              </CardContent>
            </Card>
          ) : (
            resolvedStamps.map((stamp) => (
              <Card key={stamp.id} className="opacity-80">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          stamp.status === "upheld"
                            ? "destructive"
                            : stamp.status === "dismissed"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {stamp.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        {CATEGORY_LABELS[stamp.category] || stamp.category}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {stamp.resolved_at
                        ? new Date(stamp.resolved_at).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  {stamp.resolution_notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {stamp.resolution_notes}
                    </p>
                  )}
                  {stamp.marks_forfeited > 0 && (
                    <p className="text-sm font-medium text-red-600 mt-1">
                      {stamp.marks_forfeited} Marks forfeited
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
