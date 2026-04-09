import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Vault, DollarSign, ArrowUpRight, ArrowDownLeft, RefreshCw, AlertCircle, CheckCircle2, Crown, Loader2, Timer, Gavel, ShieldAlert, Zap } from "lucide-react";

interface EscrowHold {
  id: string;
  ledger_category: string;
  amount_cents: number;
  currency: string;
  payer_id: string | null;
  payee_id: string | null;
  project_id: string | null;
  status: string;
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

interface EscrowDispute {
  id: string;
  escrow_id: string;
  disputant_id: string;
  reason: string;
  status: string;
  resolution_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

const ESCROW_HOURS = 72;

function useCountdownTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);
}

function countdownLabel(createdAt: string): { text: string; urgent: boolean; expired: boolean } {
  const depositMs = new Date(createdAt).getTime();
  const releaseMs = depositMs + ESCROW_HOURS * 60 * 60 * 1000;
  const remainMs = releaseMs - Date.now();
  if (remainMs <= 0) return { text: "Auto-release pending", urgent: true, expired: true };
  const hours = Math.floor(remainMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainMs % (1000 * 60 * 60)) / (1000 * 60));
  return {
    text: `Auto-releases in ${hours}h ${minutes}m`,
    urgent: hours < 12,
    expired: false,
  };
}

interface Sponsorship {
  id: string;
  sponsor_id: string;
  project_id: string | null;
  bounty_id: string | null;
  amount_credits: number;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export default function AdminEscrowDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");
  const [releaseRecipient, setReleaseRecipient] = useState<Record<string, string>>({});
  const [refundReason, setRefundReason] = useState<Record<string, string>>({});

  const { data: escrowHolds = [], isLoading } = useQuery({
    queryKey: ["admin-escrow-holds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_ledger")
        .select("*")
        .eq("ledger_category", "escrow_hold")
        .eq("status", "held")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as EscrowHold[];
    },
    enabled: !!user,
  });

  const { data: completedEscrows = [] } = useQuery({
    queryKey: ["admin-escrow-completed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_ledger")
        .select("*")
        .in("ledger_category", ["escrow_release", "escrow_refund"])
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as EscrowHold[];
    },
    enabled: !!user,
  });

  const { data: sponsorships = [] } = useQuery({
    queryKey: ["admin-sponsorships-escrowed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bounty_sponsorships")
        .select("*")
        .eq("status", "escrowed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Sponsorship[];
    },
    enabled: !!user,
  });

  const releaseMutation = useMutation({
    mutationFn: async ({
      sponsorshipId,
      recipientId,
    }: {
      sponsorshipId: string;
      recipientId: string;
    }) => {
      const { error } = await supabase.rpc("release_bounty_escrow", {
        p_sponsorship_id: sponsorshipId,
        p_recipient_id: recipientId,
        p_verifier_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-escrow-holds"] });
      queryClient.invalidateQueries({ queryKey: ["admin-escrow-completed"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sponsorships-escrowed"] });
      toast.success("Escrow released to recipient");
    },
    onError: (err: any) => toast.error(`Release failed: ${err.message}`),
  });

  const refundMutation = useMutation({
    mutationFn: async ({
      sponsorshipId,
      reason,
    }: {
      sponsorshipId: string;
      reason: string;
    }) => {
      const { error } = await supabase.rpc("refund_bounty_escrow", {
        p_sponsorship_id: sponsorshipId,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-escrow-holds"] });
      queryClient.invalidateQueries({ queryKey: ["admin-escrow-completed"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sponsorships-escrowed"] });
      toast.success("Escrow refunded to sponsor");
    },
    onError: (err: any) => toast.error(`Refund failed: ${err.message}`),
  });

  useCountdownTick();

  const { data: disputes = [] } = useQuery({
    queryKey: ["admin-escrow-disputes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escrow_disputes" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as EscrowDispute[];
    },
    enabled: !!user,
  });

  const openDisputes = disputes.filter((d) => d.status === "open");

  const [disputeReason, setDisputeReason] = useState<Record<string, string>>({});
  const [resolveNotes, setResolveNotes] = useState<Record<string, string>>({});

  const fileDisputeMutation = useMutation({
    mutationFn: async ({ escrowId, reason }: { escrowId: string; reason: string }) => {
      const { error } = await supabase
        .from("escrow_disputes" as never)
        .insert({ escrow_id: escrowId, disputant_id: user!.id, reason } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-escrow-disputes"] });
      toast.success("Dispute filed — auto-release blocked until resolved");
    },
    onError: (err: any) => toast.error(`Dispute failed: ${err.message}`),
  });

  const resolveDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, action, notes }: { disputeId: string; action: "resolved" | "dismissed"; notes: string }) => {
      const { error } = await supabase
        .from("escrow_disputes" as never)
        .update({ status: action, resolution_notes: notes, resolved_by: user!.id, resolved_at: new Date().toISOString() } as never)
        .eq("id", disputeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-escrow-disputes"] });
      toast.success("Dispute updated");
    },
    onError: (err: any) => toast.error(`Failed: ${err.message}`),
  });

  const forceReleaseMutation = useMutation({
    mutationFn: async (escrowId: string) => {
      const { error } = await supabase.rpc("force_release_escrow" as never, {
        p_escrow_id: escrowId,
        p_admin_id: user!.id,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-escrow-holds"] });
      queryClient.invalidateQueries({ queryKey: ["admin-escrow-completed"] });
      toast.success("Escrow force-released");
    },
    onError: (err: any) => toast.error(`Force release failed: ${err.message}`),
  });

  const totalHeld = escrowHolds.reduce((s, h) => s + h.amount_cents, 0);
  const totalReleased = completedEscrows
    .filter((e) => e.ledger_category === "escrow_release")
    .reduce((s, e) => s + e.amount_cents, 0);
  const totalRefunded = completedEscrows
    .filter((e) => e.ledger_category === "escrow_refund")
    .reduce((s, e) => s + e.amount_cents, 0);

  if (isLoading) {
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
        <Vault className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Escrow Management</h1>
          <p className="text-muted-foreground">
            Hold, release, and refund bounty sponsorship escrows
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">${(totalHeld / 100).toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">In Escrow</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">${(totalReleased / 100).toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Released</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">${(totalRefunded / 100).toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Refunded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{sponsorships.length}</div>
                <p className="text-sm text-muted-foreground">Active Sponsorships</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            Active Holds {escrowHolds.length > 0 && `(${escrowHolds.length})`}
          </TabsTrigger>
          <TabsTrigger value="sponsorships">
            Sponsorships {sponsorships.length > 0 && `(${sponsorships.length})`}
          </TabsTrigger>
          <TabsTrigger value="disputes">
            Disputes {openDisputes.length > 0 && `(${openDisputes.length})`}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Active Escrow Holds */}
        <TabsContent value="active" className="space-y-4">
          {escrowHolds.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Vault className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active escrow holds</p>
              </CardContent>
            </Card>
          ) : (
            escrowHolds.map((hold) => {
              const sponsorshipId = hold.metadata?.sponsorship_id as string | undefined;
              const countdown = countdownLabel(hold.created_at);
              const holdDisputes = openDisputes.filter((d) => d.escrow_id === hold.id);
              const isBlocked = holdDisputes.length > 0;
              return (
                <Card key={hold.id} className={`border-l-4 ${isBlocked ? "border-l-red-500" : "border-l-amber-500"}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        ${(hold.amount_cents / 100).toFixed(2)} Credits Held
                      </CardTitle>
                      <Badge variant="outline">
                        {new Date(hold.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                    <CardDescription>{hold.description}</CardDescription>
                    {/* Countdown timer */}
                    <div className={`flex items-center gap-2 text-sm mt-1 ${countdown.urgent ? "text-orange-600 font-medium" : "text-muted-foreground"}`}>
                      <Timer className="h-4 w-4" />
                      {isBlocked ? (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <ShieldAlert className="h-3.5 w-3.5" /> Blocked — {holdDisputes.length} open dispute(s)
                        </span>
                      ) : (
                        countdown.text
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sponsor:</span>{" "}
                        <code className="text-xs">{hold.payer_id?.slice(0, 8)}...</code>
                      </div>
                      {hold.project_id && (
                        <div>
                          <span className="text-muted-foreground">Project:</span>{" "}
                          <code className="text-xs">{hold.project_id.slice(0, 8)}...</code>
                        </div>
                      )}
                    </div>

                    {/* Force Release (admin) */}
                    <div className="flex gap-2 border-t pt-3">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => forceReleaseMutation.mutate(hold.id)}
                        disabled={forceReleaseMutation.isPending}
                      >
                        <Zap className="h-4 w-4 mr-1" /> Force Release
                      </Button>
                    </div>

                    {/* Dispute filing */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="text-sm font-medium">File dispute:</label>
                        <Input
                          placeholder="Reason for dispute..."
                          value={disputeReason[hold.id] || ""}
                          onChange={(e) => setDisputeReason((prev) => ({ ...prev, [hold.id]: e.target.value }))}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const reason = disputeReason[hold.id];
                          if (!reason?.trim()) { toast.error("Enter a reason"); return; }
                          fileDisputeMutation.mutate({ escrowId: hold.id, reason });
                          setDisputeReason((prev) => ({ ...prev, [hold.id]: "" }));
                        }}
                        disabled={fileDisputeMutation.isPending}
                      >
                        <Gavel className="h-4 w-4 mr-1" /> Dispute
                      </Button>
                    </div>

                    {sponsorshipId && (
                      <div className="space-y-2 border-t pt-3">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-sm font-medium">
                              Release to (recipient UUID):
                            </label>
                            <Input
                              placeholder="Recipient member UUID..."
                              value={releaseRecipient[sponsorshipId] || ""}
                              onChange={(e) =>
                                setReleaseRecipient((prev) => ({
                                  ...prev,
                                  [sponsorshipId]: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              const recipientId = releaseRecipient[sponsorshipId];
                              if (!recipientId) {
                                toast.error("Enter a recipient UUID");
                                return;
                              }
                              releaseMutation.mutate({
                                sponsorshipId,
                                recipientId,
                              });
                            }}
                            disabled={releaseMutation.isPending}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1" /> Release
                          </Button>
                        </div>

                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Refund reason:</label>
                            <Textarea
                              placeholder="Reason for refund..."
                              value={refundReason[sponsorshipId] || ""}
                              onChange={(e) =>
                                setRefundReason((prev) => ({
                                  ...prev,
                                  [sponsorshipId]: e.target.value,
                                }))
                              }
                              rows={1}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              refundMutation.mutate({
                                sponsorshipId,
                                reason: refundReason[sponsorshipId] || "Admin refund",
                              })
                            }
                            disabled={refundMutation.isPending}
                          >
                            <ArrowDownLeft className="h-4 w-4 mr-1" /> Refund
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Sponsorships Tab */}
        <TabsContent value="sponsorships" className="space-y-4">
          {sponsorships.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No escrowed sponsorships</p>
              </CardContent>
            </Card>
          ) : (
            sponsorships.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {s.amount_credits} Credits escrowed
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sponsor: <code className="text-xs">{s.sponsor_id.slice(0, 8)}...</code>
                        {s.project_id && (
                          <> | Project: <code className="text-xs">{s.project_id.slice(0, 8)}...</code></>
                        )}
                      </p>
                    </div>
                    <Badge>escrowed</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Disputes */}
        <TabsContent value="disputes" className="space-y-4">
          {disputes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No disputes filed</p>
              </CardContent>
            </Card>
          ) : (
            disputes.map((d) => (
              <Card key={d.id} className={`border-l-4 ${d.status === "open" ? "border-l-red-500" : "border-l-muted"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      Dispute on <code className="text-xs">{d.escrow_id.slice(0, 8)}...</code>
                    </CardTitle>
                    <Badge variant={d.status === "open" ? "destructive" : "secondary"}>
                      {d.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Filed by <code className="text-xs">{d.disputant_id.slice(0, 8)}...</code> on {new Date(d.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{d.reason}</p>
                  {d.resolution_notes && (
                    <div className="bg-muted/50 rounded-md p-2 text-sm">
                      <span className="font-medium">Resolution:</span> {d.resolution_notes}
                    </div>
                  )}
                  {d.status === "open" && (
                    <div className="flex gap-2 items-end border-t pt-3">
                      <div className="flex-1">
                        <Input
                          placeholder="Resolution notes..."
                          value={resolveNotes[d.id] || ""}
                          onChange={(e) => setResolveNotes((prev) => ({ ...prev, [d.id]: e.target.value }))}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => resolveDisputeMutation.mutate({
                          disputeId: d.id,
                          action: "resolved",
                          notes: resolveNotes[d.id] || "Resolved by admin",
                        })}
                        disabled={resolveDisputeMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveDisputeMutation.mutate({
                          disputeId: d.id,
                          action: "dismissed",
                          notes: resolveNotes[d.id] || "Dismissed by admin",
                        })}
                        disabled={resolveDisputeMutation.isPending}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" /> Dismiss
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4">
          {completedEscrows.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No escrow history yet</p>
              </CardContent>
            </Card>
          ) : (
            completedEscrows.map((e) => (
              <Card key={e.id} className="opacity-80">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          e.ledger_category === "escrow_release"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {e.ledger_category === "escrow_release" ? "Released" : "Refunded"}
                      </Badge>
                      <span className="font-medium">
                        ${(e.amount_cents / 100).toFixed(2)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {e.description && (
                    <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Pioneer Bonus Disbursement */}
      <PioneerBonusDisbursement />
    </div>
  );
}

function PioneerBonusDisbursement() {
  const [result, setResult] = useState<{
    billing_month: string;
    disbursed: number;
    skipped: number;
    expired: number;
    total_marks: number;
    total_pioneers_processed: number;
  } | null>(null);

  const disburseMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("disburse-pioneer-bonuses", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.error) throw new Error(res.error.message ?? "Disbursement failed");
      return res.data as {
        billing_month: string;
        disbursed: number;
        skipped: number;
        expired: number;
        total_marks: number;
        total_pioneers_processed: number;
      };
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(
        `Disbursed ${data.disbursed} bonuses totaling ${data.total_marks} Marks. Skipped ${data.skipped}. Expired ${data.expired}.`
      );
    },
    onError: (err) => {
      toast.error(`Disbursement failed: ${err.message}`);
    },
  });

  return (
    <Card className="mt-8 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          Pioneer Bonus Disbursement
        </CardTitle>
        <CardDescription>
          Disburse monthly Mark bonuses to all eligible Pioneers. Run once per month (1st of each month).
          Idempotent — safe to re-run; duplicates are prevented by unique constraint.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => disburseMutation.mutate()}
          disabled={disburseMutation.isPending}
          className="bg-amber-600 hover:bg-amber-500"
        >
          {disburseMutation.isPending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
          ) : (
            <><Crown className="w-4 h-4 mr-2" /> Disburse Pioneer Bonuses</>
          )}
        </Button>

        {result && (
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 space-y-2">
            <p className="font-medium text-sm">Billing Month: {result.billing_month}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
              <div className="bg-white dark:bg-black/20 rounded p-2">
                <div className="font-bold text-green-600">{result.disbursed}</div>
                <div className="text-xs text-muted-foreground">Disbursed</div>
              </div>
              <div className="bg-white dark:bg-black/20 rounded p-2">
                <div className="font-bold text-blue-600">{result.total_marks}</div>
                <div className="text-xs text-muted-foreground">Total Marks</div>
              </div>
              <div className="bg-white dark:bg-black/20 rounded p-2">
                <div className="font-bold text-slate-500">{result.skipped}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div className="bg-white dark:bg-black/20 rounded p-2">
                <div className="font-bold text-orange-500">{result.expired}</div>
                <div className="text-xs text-muted-foreground">Expired</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {result.total_pioneers_processed} pioneer(s) processed total
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
