/**
 * GovernancePedestalPage -- /governance/pedestal
 * Wave 11 / Phase E3
 *
 * Member Pedestals governance view:
 *   - Display pedestals from pedestal_vote_canon
 *   - IP-Ledger ties (link Pedestal entries to ipLedger records)
 *   - "Vote = you get a copy" letter mechanic: when a member votes on
 *     an AI-Gang letter, they receive a record copy routed through
 *     ShieldedLetterGate
 *   - Connect to ShieldedLetterGate from Wave 3
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Link2,
  CheckCircle,
  Clock,
  Crown,
  Star,
  Shield,
  ChevronRight,
  Mail,
  Info,
} from "lucide-react";
import {
  ShieldedLetterGate,
  isShieldLetter,
} from "@/components/outreach/ShieldedLetterGate";
import { useOutreachLetters } from "@/hooks/useOutreachLetters";
import { usePageSEO } from "@/hooks/usePageSEO";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PedestalCanon {
  id: string;
  recipient_name: string;
  recipient_slug: string;
  pedestal_class: string;
  vote_status: string;
  created_at: string;
  notes?: string | null;
}

interface IPLedgerEntry {
  id: string;
  sequence_number: number;
  entry_type: string;
  entry_data: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function pedestalClassBadge(cls: string) {
  const map: Record<string, string> = {
    honorary: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    active: "bg-green-500/10 text-green-600 border-green-500/20",
    legacy: "bg-slate-500/10 text-slate-500",
    nominated: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };
  return map[cls] ?? "bg-slate-500/10 text-slate-500";
}

function voteStatusBadge(status: string) {
  const map: Record<string, string> = {
    awaiting_initial_outreach:
      "bg-amber-500/10 text-amber-600 border-amber-500/20",
    outreach_sent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    ratified: "bg-green-500/10 text-green-600 border-green-500/20",
    declined: "bg-red-500/10 text-red-600 border-red-500/20",
    pending_vote: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  };
  return map[status] ?? "bg-slate-500/10 text-slate-500";
}

// ---------------------------------------------------------------------------
// Vote = get a copy banner
// ---------------------------------------------------------------------------

function VoteCopyMechanic() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-amber-500/5">
      <CardContent className="flex items-start gap-3 py-4">
        <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Vote = You Get a Copy</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When you vote on an AI-Gang letter through ShieldedLetterGate,
            a record copy is attributed to you in the governance ledger.
            This is a governance participation record -- it confirms you were
            part of the ratification process for that letter. It carries no
            financial value and is not transferable.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function GovernancePedestalPage() {
  usePageSEO({
    title: "Governance Pedestal | Liana Banyan",
    description: "Community pedestal governance and innovation recognition. Vote on and recognize the best cooperative innovations.",
    canonical: "https://lianabanyan.com/governance/pedestal",
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPedestal, setSelectedPedestal] =
    useState<PedestalCanon | null>(null);

  // Pedestal vote canon
  const { data: pedestals = [], isLoading: loadingPedestals } = useQuery({
    queryKey: ["pedestal-vote-canon"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pedestal_vote_canon")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as PedestalCanon[];
    },
  });

  // IP Ledger entries related to governance
  const { data: ledgerEntries = [] } = useQuery({
    queryKey: ["ip-ledger-governance"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ip_ledger")
        .select("id,sequence_number,entry_type,entry_data,created_at")
        .in("entry_type", [
          "governance.decision",
          "branch.vote",
          "intent.beacon",
        ])
        .order("sequence_number", { ascending: false })
        .limit(30);
      return (data ?? []) as IPLedgerEntry[];
    },
  });

  // Outreach letters (AI-Gang, shielded)
  const { letters } = useOutreachLetters();
  const shieldedLetters = (letters ?? []).filter((l) =>
    isShieldLetter(l.slug)
  );

  // Stats
  const ratified = pedestals.filter((p) => p.vote_status === "ratified").length;
  const pending = pedestals.filter(
    (p) =>
      p.vote_status === "pending_vote" ||
      p.vote_status === "awaiting_initial_outreach"
  ).length;

  return (
    <PortalPageLayout maxWidth="xl" xrayId="governance-pedestal">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/governance")}
            className="gap-2 -ml-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Governance
          </Button>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-amber-500" />
            <div>
              <h1 className="text-3xl font-bold">Governance Pedestals</h1>
              <p className="text-muted-foreground">
                Member Pedestals, AI-Gang letter ratification, and IP-Ledger
                governance ties.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild className="ml-auto shrink-0 gap-1">
            <a href="/governance/pedestal/nominate">
              <Star className="h-3.5 w-3.5" />
              Nominate Work
            </a>
          </Button>
          </div>
        </div>

        <VoteCopyMechanic />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Crown className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <div className="text-2xl font-bold">{pedestals.length}</div>
              <div className="text-xs text-muted-foreground">
                Total Pedestals
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <div className="text-2xl font-bold">{ratified}</div>
              <div className="text-xs text-muted-foreground">Ratified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-violet-500" />
              <div className="text-2xl font-bold">{pending}</div>
              <div className="text-xs text-muted-foreground">Pending Vote</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Link2 className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-bold">{ledgerEntries.length}</div>
              <div className="text-xs text-muted-foreground">Ledger Ties</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pedestals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pedestals">Pedestals</TabsTrigger>
            <TabsTrigger value="letters">AI-Gang Letters</TabsTrigger>
            <TabsTrigger value="ledger">IP Ledger Ties</TabsTrigger>
          </TabsList>

          {/* ---------------------------------------------------------------- */}
          {/* PEDESTALS */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="pedestals" className="space-y-4">
            {loadingPedestals ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Loading pedestals...
              </p>
            ) : pedestals.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <Crown className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No pedestals in the canon yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => navigate("/pedestals")}
                  >
                    Browse Pedestal Browser
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pedestals.map((ped) => (
                  <Card
                    key={ped.id}
                    className="hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() =>
                      setSelectedPedestal(
                        selectedPedestal?.id === ped.id ? null : ped
                      )
                    }
                  >
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-sm font-medium">
                              {ped.recipient_name}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {ped.recipient_slug}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                          <Badge
                            className={`text-xs capitalize ${pedestalClassBadge(ped.pedestal_class)}`}
                          >
                            {ped.pedestal_class}
                          </Badge>
                          <Badge
                            className={`text-xs ${voteStatusBadge(ped.vote_status)}`}
                          >
                            {ped.vote_status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>

                      {selectedPedestal?.id === ped.id && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          {ped.notes && (
                            <p className="text-xs text-muted-foreground">
                              {ped.notes}
                            </p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/the300/${ped.id}`);
                              }}
                            >
                              <BookOpen className="w-3 h-3" />
                              The300 Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/governance/audit");
                              }}
                            >
                              <Link2 className="w-3 h-3" />
                              Audit Trail
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Added {formatDate(ped.created_at)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* AI-GANG LETTERS */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="letters" className="space-y-4">
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="flex items-start gap-3 py-4">
                <Shield className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">
                    Shield-gated letters:{" "}
                  </span>
                  AI-Gang letters (Scholz, Brynjolfsson, Newmark, Doctorow,
                  Ollama) require member vote + Founder ratification before
                  dispatch. When you vote, your participation is recorded in
                  the governance audit trail. This is not an investment or
                  purchase -- it is a cooperative governance participation
                  record.
                </div>
              </CardContent>
            </Card>

            {shieldedLetters.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <Mail className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    No AI-Gang letters loaded. Check{" "}
                    <button
                      className="underline hover:no-underline"
                      onClick={() => navigate("/admin/outreach-letters")}
                    >
                      outreach letters admin
                    </button>{" "}
                    to confirm shield-gated letters are loaded.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {shieldedLetters.map((letter) => (
                    <Card key={letter.letter_id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-base">
                              {letter.recipient_name}
                            </CardTitle>
                            <CardDescription>
                              {letter.recipient_category}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {letter.slug}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ShieldedLetterGate
                          letter={letter}
                          verdict={null}
                          isFounder={false}
                        />
                        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          Voting on this letter adds a participation record to
                          your governance history.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* IP LEDGER TIES */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="ledger" className="space-y-4">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="flex items-start gap-3 py-4">
                <Link2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground">
                    IP Ledger ties:{" "}
                  </span>
                  Governance decisions, branch votes, and intent beacons are
                  hash-chained into the IP Ledger alongside innovation records.
                  This creates a tamper-evident trail linking pedestal
                  governance to the platform's integrity layer.
                </div>
              </CardContent>
            </Card>

            {ledgerEntries.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <Link2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No governance entries in the IP Ledger yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {ledgerEntries.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{entry.sequence_number}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {entry.entry_type}
                            </Badge>
                          </div>
                          {entry.entry_data &&
                            typeof entry.entry_data === "object" && (
                              <p className="text-xs text-muted-foreground">
                                {(entry.entry_data as Record<string, unknown>).description as string ??
                                  (entry.entry_data as Record<string, unknown>).action as string ??
                                  JSON.stringify(entry.entry_data).slice(0, 80)}
                              </p>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.created_at)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/governance/audit")}
              className="gap-2"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              Full Governance Audit Trail
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
  );
}
