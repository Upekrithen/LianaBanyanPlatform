import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  DollarSign,
  Users,
  CalendarClock,
  Pause,
  Play,
  XCircle,
  ShieldCheck,
  ShieldOff,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useFundingSchedules,
  useFundingTransactions,
  useAuthorizedFunders,
  useCreateFundingSchedule,
  usePauseFundingSchedule,
  useCancelFundingSchedule,
  useAuthorizeFunder,
  useRevokeFunder,
  type FundingSchedule,
} from "@/hooks/useLBCardFunding";

const PURPOSES = [
  { value: "rent", label: "Rent / Housing" },
  { value: "food", label: "Food / Groceries" },
  { value: "transportation", label: "Transportation" },
  { value: "education", label: "Education" },
  { value: "childcare", label: "Childcare" },
  { value: "tools", label: "Tools / Equipment" },
  { value: "general", label: "General Support" },
  { value: "other", label: "Other" },
];

const FUNDING_RELATIONSHIPS = [
  { value: "employer", label: "Employer" },
  { value: "family", label: "Family Member" },
  { value: "sponsor", label: "Sponsor / Mentor" },
  { value: "self", label: "Self-Funding" },
  { value: "guild", label: "Guild / Organization" },
  { value: "other", label: "Other" },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 weeks" },
  { value: "monthly", label: "Monthly" },
];

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function statusColor(s: string) {
  if (s === "active" || s === "completed")
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (s === "paused")
    return "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300";
  if (s === "cancelled" || s === "failed")
    return "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400";
  return "border-muted-foreground/30 bg-muted/40 text-muted-foreground";
}

function ScheduleRow({
  schedule,
  role,
  onPause,
  onCancel,
}: {
  schedule: FundingSchedule;
  role: "funder" | "recipient";
  onPause: (id: string, action: "pause" | "resume") => void;
  onCancel: (id: string) => void;
}) {
  const isPaused = schedule.status === "paused";
  const isActive = schedule.status === "active";
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("capitalize", statusColor(schedule.status))}>
            {schedule.status}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {schedule.purpose?.replace(/_/g, " ") || "general"}
          </Badge>
          <span className="text-xs text-muted-foreground capitalize">{schedule.frequency}</span>
        </div>
        <p className="text-lg font-bold tabular-nums">{formatUsd(schedule.amount)}</p>
        {schedule.purpose_note && (
          <p className="text-xs text-muted-foreground italic">"{schedule.purpose_note}"</p>
        )}
        <p className="text-xs text-muted-foreground">
          {role === "funder" ? "To" : "From"}: {role === "funder" ? schedule.recipient_id : schedule.funder_id}
        </p>
        {schedule.next_funding_at && isActive && (
          <p className="text-xs text-muted-foreground">
            Next: {new Date(schedule.next_funding_at).toLocaleDateString()}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Total funded: {formatUsd(schedule.total_funded)} ({schedule.funding_count} payments)
        </p>
      </div>
      {role === "funder" && (isActive || isPaused) && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPause(schedule.id, isPaused ? "resume" : "pause")}
          >
            {isPaused ? <Play className="mr-1 h-3.5 w-3.5" /> : <Pause className="mr-1 h-3.5 w-3.5" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          {isActive && (
            <Button size="sm" variant="destructive" onClick={() => onCancel(schedule.id)}>
              <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FundMyCard() {
  const { user } = useAuth();
  const [tab, setTab] = useState("my-funding");

  // Fund Someone form state
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [purpose, setPurpose] = useState("general");
  const [fundingRelationship, setFundingRelationship] = useState("other");
  const [note, setNote] = useState("");

  // Authorize funder form state
  const [authFunderEmail, setAuthFunderEmail] = useState("");

  // KYC check for current user
  const { data: myProfile } = useQuery({
    queryKey: ["my-kyc-profile"],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles" as never)
        .select("kyc_verified")
        .eq("id", user.id)
        .maybeSingle();
      return data as { kyc_verified: boolean | null } | null;
    },
    enabled: !!user?.id,
  });

  const isKycVerified = myProfile?.kyc_verified === true;

  // Data hooks
  const { data: outgoing = [], isLoading: outgoingLoading } = useFundingSchedules("funder");
  const { data: incoming = [], isLoading: incomingLoading } = useFundingSchedules("recipient");
  const { data: transactions = [], isLoading: txLoading } = useFundingTransactions();
  const { data: funders = [], isLoading: fundersLoading } = useAuthorizedFunders();

  const createSchedule = useCreateFundingSchedule();
  const pauseSchedule = usePauseFundingSchedule();
  const cancelSchedule = useCancelFundingSchedule();
  const authorizeFunder = useAuthorizeFunder();
  const revokeFunder = useRevokeFunder();

  // Recipient search
  const { data: searchResults } = useQuery({
    queryKey: ["member-search", recipientSearch],
    queryFn: async () => {
      if (recipientSearch.length < 3) return [];
      const { data } = await supabase
        .from("profiles" as never)
        .select("id, full_name, email")
        .or(`full_name.ilike.%${recipientSearch}%,email.ilike.%${recipientSearch}%`)
        .limit(8);
      return (data ?? []) as { id: string; full_name: string | null; email: string | null }[];
    },
    enabled: recipientSearch.length >= 3,
  });

  // Monthly summary
  const monthlyIncoming = useMemo(
    () =>
      incoming
        .filter((s) => s.status === "active")
        .reduce((sum, s) => {
          const monthly =
            s.frequency === "daily"
              ? s.amount * 30
              : s.frequency === "weekly"
                ? s.amount * 4.33
                : s.frequency === "biweekly"
                  ? s.amount * 2.17
                  : s.amount;
          return sum + monthly;
        }, 0),
    [incoming],
  );

  const monthlyOutgoing = useMemo(
    () =>
      outgoing
        .filter((s) => s.status === "active")
        .reduce((sum, s) => {
          const monthly =
            s.frequency === "daily"
              ? s.amount * 30
              : s.frequency === "weekly"
                ? s.amount * 4.33
                : s.frequency === "biweekly"
                  ? s.amount * 2.17
                  : s.amount;
          return sum + monthly;
        }, 0),
    [outgoing],
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!recipientId) {
      toast.error("Select a recipient");
      return;
    }
    if (!amt || amt < 1 || amt > 10000) {
      toast.error("Amount must be $1–$10,000");
      return;
    }
    try {
      await createSchedule.mutateAsync({
        recipient_id: recipientId,
        amount: amt,
        frequency,
        purpose,
        purpose_note: note || undefined,
        funding_relationship: fundingRelationship,
      });
      toast.success("Funding schedule created!");
      setRecipientId("");
      setRecipientSearch("");
      setAmount("");
      setNote("");
      setFundingRelationship("other");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleAuthorize(e: React.FormEvent) {
    e.preventDefault();
    if (!authFunderEmail.trim()) return;
    try {
      // Look up user by email
      const { data: profiles } = await supabase
        .from("profiles" as never)
        .select("id, email")
        .eq("email", authFunderEmail.trim().toLowerCase())
        .limit(1);
      const prof = (profiles as { id: string; email: string }[] | null)?.[0];
      if (!prof) {
        toast.error("No member found with that email");
        return;
      }
      await authorizeFunder.mutateAsync(prof.id);
      toast.success(`Authorized ${prof.email} to fund your card`);
      setAuthFunderEmail("");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <PortalPageLayout
      title="Card Funding"
      subtitle="Set up recurring funding for LB Cards — real money via Stripe"
      maxWidth="xl"
      xrayId="fund-my-card-page"
    >
      <div className="space-y-6 pb-12">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <ArrowDownLeft className="mx-auto h-6 w-6 text-emerald-500" />
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                Monthly Incoming
              </p>
              <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                ~{formatUsd(monthlyIncoming)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <ArrowUpRight className="mx-auto h-6 w-6 text-blue-500" />
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                Monthly Outgoing
              </p>
              <p className="text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
                ~{formatUsd(monthlyOutgoing)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CalendarClock className="mx-auto h-6 w-6 text-purple-500" />
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                Active Schedules
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {incoming.filter((s) => s.status === "active").length +
                  outgoing.filter((s) => s.status === "active").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fund-someone" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Fund Someone
            </TabsTrigger>
            <TabsTrigger value="my-funding" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> My Card Funding
            </TabsTrigger>
          </TabsList>

          {/* ────────────── Fund Someone Tab ────────────── */}
          <TabsContent value="fund-someone" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Set Up Recurring Funding
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isKycVerified && (
                  <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                    <ShieldOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        Identity Verification Required
                      </p>
                      <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
                        Complete your identity verification to enable card funding. Both the funder
                        and recipient must be verified cooperative members.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-5 flex items-center gap-2 rounded-md border border-muted bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                  <span>Daily funding limit: <strong>$9,500 per recipient</strong>. All card funding is processed through the cooperative's regulated financial infrastructure.</span>
                </div>

                <form onSubmit={handleCreate} className="space-y-5">
                  {/* Recipient search */}
                  <div className="space-y-2">
                    <Label>Recipient</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email…"
                        className="pl-10"
                        value={recipientSearch}
                        onChange={(e) => {
                          setRecipientSearch(e.target.value);
                          setRecipientId("");
                        }}
                      />
                    </div>
                    {searchResults && searchResults.length > 0 && !recipientId && (
                      <div className="rounded-lg border bg-popover shadow-md">
                        {searchResults.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
                            onClick={() => {
                              setRecipientId(p.id);
                              setRecipientSearch(p.full_name || p.email || p.id);
                            }}
                          >
                            <span className="font-medium">{p.full_name || "—"}</span>
                            <span className="ml-2 text-muted-foreground">{p.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {recipientId && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Recipient selected: {recipientSearch}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Amount ($1 – $10,000)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10000}
                        step="0.01"
                        placeholder="100.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select value={frequency} onValueChange={setFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map((f) => (
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Purpose</Label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PURPOSES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Funding Relationship</Label>
                      <Select value={fundingRelationship} onValueChange={setFundingRelationship}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FUNDING_RELATIONSHIPS.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Note (optional)</Label>
                    <Textarea
                      placeholder="e.g. 'Help with rent while you finish the certification'"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createSchedule.isPending || !recipientId || !isKycVerified}
                    className="w-full sm:w-auto"
                  >
                    {createSchedule.isPending ? "Creating…" : "Start Funding"}
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Funds are charged to your payment method via Stripe Billing and deposited as
                    REAL MONEY on the recipient's LB Card via the cooperative's platform account. 
                    This is NOT Credits — Credits never cash out to fiat.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Outgoing Schedules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowUpRight className="h-5 w-5" />
                  My Outgoing Funding
                </CardTitle>
              </CardHeader>
              <CardContent>
                {outgoingLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : outgoing.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                    No outgoing funding schedules yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {outgoing.map((s) => (
                      <ScheduleRow
                        key={s.id}
                        schedule={s}
                        role="funder"
                        onPause={(id, action) =>
                          pauseSchedule.mutate(
                            { id, action },
                            {
                              onSuccess: () => toast.success(`Schedule ${action}d`),
                              onError: (e) => toast.error(e.message),
                            },
                          )
                        }
                        onCancel={(id) =>
                          cancelSchedule.mutate(id, {
                            onSuccess: () => toast.success("Schedule cancelled"),
                            onError: (e) => toast.error(e.message),
                          })
                        }
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ────────────── My Card Funding Tab ────────────── */}
          <TabsContent value="my-funding" className="space-y-6">
            {/* Incoming Schedules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowDownLeft className="h-5 w-5" />
                  Incoming Funding
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incomingLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : incoming.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                    No one is funding your card yet. Authorize a funder below to let them help.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incoming.map((s) => (
                      <ScheduleRow
                        key={s.id}
                        schedule={s}
                        role="recipient"
                        onPause={() => {}}
                        onCancel={() => {}}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Authorize / Revoke Funders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Authorized Funders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Control who can fund your LB Card. Only authorized members can set up recurring
                  payments to your card.
                </p>
                <form onSubmit={handleAuthorize} className="flex gap-2">
                  <Input
                    placeholder="Member email to authorize…"
                    value={authFunderEmail}
                    onChange={(e) => setAuthFunderEmail(e.target.value)}
                    className="flex-1"
                    type="email"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={authorizeFunder.isPending || !authFunderEmail.trim()}
                  >
                    <ShieldCheck className="mr-1 h-4 w-4" />
                    {authorizeFunder.isPending ? "…" : "Authorize"}
                  </Button>
                </form>

                {fundersLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : funders.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                    No authorized funders yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {funders.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          <span className="font-mono text-xs">{f.authorized_funder_id}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600"
                          onClick={() =>
                            revokeFunder.mutate(f.id, {
                              onSuccess: () => toast.success("Funder revoked"),
                              onError: (e) => toast.error(e.message),
                            })
                          }
                        >
                          <ShieldOff className="mr-1 h-3.5 w-3.5" /> Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarClock className="h-5 w-5" />
                  Funding Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {txLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : transactions.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                    No funding transactions yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead>
                        <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Amount</th>
                          <th className="py-2 pr-4">Purpose</th>
                          <th className="py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t) => {
                          const isIncoming = t.recipient_id === user?.id;
                          return (
                            <tr
                              key={t.id}
                              className="border-b border-border/60 last:border-0"
                            >
                              <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">
                                {new Date(t.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 pr-4">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1 font-semibold tabular-nums",
                                    isIncoming
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-blue-600 dark:text-blue-400",
                                  )}
                                >
                                  {isIncoming ? (
                                    <ArrowDownLeft className="h-3.5 w-3.5" />
                                  ) : (
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  )}
                                  {formatUsd(t.amount)}
                                </span>
                              </td>
                              <td className="py-3 pr-4 capitalize">
                                {t.purpose?.replace(/_/g, " ") || "—"}
                              </td>
                              <td className="py-3">
                                <Badge
                                  variant="outline"
                                  className={cn("capitalize", statusColor(t.status))}
                                >
                                  {t.status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
  );
}
