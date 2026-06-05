/**
 * GovernanceStarChamberPage -- /governance/star-chamber
 * Wave 11 / Phase E2 (staff-gated)
 *
 * Appeal flow, case status, 4-judge panel display, procedures,
 * immutable audit log entries per decision.
 *
 * Distinct from /star-chamber (StarChamberV2Page), which is the
 * operational AI review workspace. This page documents procedures
 * and provides the member-facing appeal submission interface.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Star,
  Scale,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Lock,
  Eye,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { usePageSEO } from "@/hooks/usePageSEO";

// ---------------------------------------------------------------------------
// Judge panel
// ---------------------------------------------------------------------------

interface Judge {
  name: string;
  backend: string;
  role: string;
  color: string;
}

const JUDGES: Judge[] = [
  {
    name: "Oracle",
    backend: "Claude",
    role: "Context integrity and precedent alignment. Oracle reviews the full history of the matter, weighing prior rulings and stated principles.",
    color: "from-violet-500/15 to-purple-500/10 border-violet-500/25",
  },
  {
    name: "Morpheus",
    backend: "Claude",
    role: "Scenario framing and impact pathway analysis. Morpheus maps the downstream consequences of each possible ruling.",
    color: "from-blue-500/15 to-cyan-500/10 border-blue-500/25",
  },
  {
    name: "Red Queen",
    backend: "Perplexity",
    role: "External signal check and contradiction detection. Red Queen surfaces information from outside the platform that is relevant to the case.",
    color: "from-red-500/15 to-rose-500/10 border-red-500/25",
  },
  {
    name: "Dredd",
    backend: "Perplexity",
    role: "Convergence review and ruling discipline. Dredd synthesizes the other three analyses and issues the final recommended disposition.",
    color: "from-amber-500/15 to-yellow-500/10 border-amber-500/25",
  },
];

// ---------------------------------------------------------------------------
// Procedures
// ---------------------------------------------------------------------------

const PROCEDURES = [
  {
    step: 1,
    title: "Submit Appeal",
    description:
      "Any member may submit an appeal within 30 days of a governance decision they wish to contest. The appeal must state the specific decision, the grounds for review, and the requested remedy.",
  },
  {
    step: 2,
    title: "Intake Review (48 hours)",
    description:
      "Staff reviews the appeal for standing and completeness. Appeals that are frivolous, duplicative, or outside the Star Chamber's jurisdiction are returned with an explanation. Valid appeals are assigned a case number.",
  },
  {
    step: 3,
    title: "Four-Judge Panel Review (7 days)",
    description:
      "Oracle, Morpheus, Red Queen, and Dredd each independently analyze the appeal and produce a written analysis. The four analyses are combined into a panel record.",
  },
  {
    step: 4,
    title: "Human Reviewer Decision",
    description:
      "A designated human reviewer reads the panel record and issues the final ruling. The reviewer may adopt, modify, or reject the panel's recommendation. The reviewer's written reasoning is recorded.",
  },
  {
    step: 5,
    title: "Founder Override (exceptional cases only)",
    description:
      "The Founder may override a Star Chamber ruling only in exceptional circumstances: clear procedural error, constitutional conflict, or emergency. Override reasons are recorded in the public audit log.",
  },
  {
    step: 6,
    title: "Immutable Record",
    description:
      "All case records -- submissions, panel analyses, rulings, and any override -- are written to the governance audit trail and the IP Ledger. Records cannot be edited or deleted.",
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StarCase {
  id: string;
  case_number: number;
  title: string;
  case_type: string;
  severity: string;
  status: string;
  created_at: string;
  final_action: string | null;
  resolved_at: string | null;
}

interface AuditEntry {
  id: string;
  event: string;
  detail: string;
  timestamp: string;
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

function severityBadge(severity: string) {
  const map: Record<string, string> = {
    low: "bg-slate-500/10 text-slate-500",
    medium: "bg-amber-500/10 text-amber-600",
    high: "bg-orange-500/10 text-orange-600",
    critical: "bg-red-500/10 text-red-600",
  };
  return map[severity] ?? "bg-slate-500/10 text-slate-500";
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: "bg-blue-500/10 text-blue-600",
    in_review: "bg-violet-500/10 text-violet-600",
    closed: "bg-green-500/10 text-green-600",
    dismissed: "bg-slate-500/10 text-slate-500",
  };
  return map[status] ?? "bg-slate-500/10 text-slate-500";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function JudgePanel() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {JUDGES.map((judge) => (
        <Card key={judge.name} className={`bg-gradient-to-br ${judge.color}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{judge.name}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {judge.backend}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {judge.role}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProcedureList() {
  return (
    <div className="space-y-3">
      {PROCEDURES.map((proc) => (
        <div key={proc.step} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {proc.step}
            </div>
            {proc.step < PROCEDURES.length && (
              <div className="w-px flex-1 bg-border mt-1" />
            )}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium">{proc.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {proc.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function GovernanceStarChamberPage() {
  usePageSEO({
    title: "Star Chamber | Liana Banyan Governance",
    description: "Senior governance review body for Liana Banyan. Appeals, deep reviews, and platform-wide policy decisions.",
    canonical: "https://lianabanyan.com/governance/star-chamber",
  });
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [appealTitle, setAppealTitle] = useState("");
  const [appealGrounds, setAppealGrounds] = useState("");
  const [appealRemedy, setAppealRemedy] = useState("");

  // Fetch cases
  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["governance-star-chamber-cases"],
    queryFn: async () => {
      const { data } = await supabase
        .from("star_chamber_cases")
        .select(
          "id,case_number,title,case_type,severity,status,created_at,final_action,resolved_at"
        )
        .order("created_at", { ascending: false })
        .limit(50);
      return (data ?? []) as StarCase[];
    },
  });

  // Audit entries derived from cases
  const auditEntries: AuditEntry[] = cases.slice(0, 20).map((c) => ({
    id: c.id,
    event: c.resolved_at
      ? `Case #${c.case_number} resolved`
      : `Case #${c.case_number} filed`,
    detail: c.final_action ?? c.title,
    timestamp: c.resolved_at ?? c.created_at,
  }));

  // Submit appeal
  const submitMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be signed in");
      if (!appealTitle.trim()) throw new Error("Title is required");
      if (!appealGrounds.trim()) throw new Error("Grounds are required");
      const { error } = await supabase.from("star_chamber_cases").insert({
        title: appealTitle.trim(),
        description: `Grounds: ${appealGrounds.trim()}\n\nRequested remedy: ${appealRemedy.trim()}`,
        case_type: "appeal",
        severity: "medium",
        status: "open",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Appeal submitted. You will receive a case number within 48 hours.");
      setAppealTitle("");
      setAppealGrounds("");
      setAppealRemedy("");
      qc.invalidateQueries({ queryKey: ["governance-star-chamber-cases"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not submit appeal");
    },
  });

  const openCases = cases.filter((c) => c.status !== "closed" && c.status !== "dismissed");
  const closedCases = cases.filter((c) => c.status === "closed" || c.status === "dismissed");

  return (
    <PortalPageLayout maxWidth="xl" xrayId="governance-star-chamber">
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
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-violet-500" />
            <div>
              <h1 className="text-3xl font-bold">Star Chamber</h1>
              <p className="text-muted-foreground">
                Four-judge AI panel for appeals and structured review. All decisions
                are immutably recorded.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Scale className="w-5 h-5 mx-auto mb-1 text-violet-500" />
              <div className="text-2xl font-bold">{cases.length}</div>
              <div className="text-xs text-muted-foreground">Total Cases</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <AlertCircle className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-bold">{openCases.length}</div>
              <div className="text-xs text-muted-foreground">Open</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <div className="text-2xl font-bold">{closedCases.length}</div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <div className="text-2xl font-bold">4</div>
              <div className="text-xs text-muted-foreground">Judges</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="panel" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="panel">Judge Panel</TabsTrigger>
            <TabsTrigger value="cases">Case Status</TabsTrigger>
            <TabsTrigger value="appeal">Submit Appeal</TabsTrigger>
            <TabsTrigger value="procedures">Procedures</TabsTrigger>
          </TabsList>

          {/* JUDGE PANEL */}
          <TabsContent value="panel" className="space-y-4">
            <Card className="border-violet-500/20 bg-violet-500/5">
              <CardContent className="py-4 text-sm text-muted-foreground">
                The Star Chamber convenes four independent AI judges for each
                case. Each judge operates from a distinct analytical perspective.
                The four analyses are combined and presented to a human reviewer
                who issues the final ruling.
              </CardContent>
            </Card>
            <JudgePanel />
            <Card>
              <CardContent className="py-4 text-xs text-muted-foreground space-y-2">
                <p className="font-medium text-foreground">Panel independence</p>
                <p>
                  Each judge runs independently with no access to the others'
                  analyses until the panel record is compiled. This prevents
                  anchoring and groupthink. Divergent analyses are surfaced, not
                  suppressed -- the reviewer sees the full range of conclusions.
                </p>
                <p>
                  All judge reasoning is recorded verbatim in the case record.
                  Panel records are part of the immutable audit trail.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CASE STATUS */}
          <TabsContent value="cases" className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Loading cases...
              </p>
            ) : cases.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No cases on record.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {openCases.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      Open Cases
                    </h2>
                    {openCases.map((c) => (
                      <Card key={c.id}>
                        <CardContent className="py-3 flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono">
                                #{c.case_number}
                              </span>
                              <span className="text-sm font-medium">
                                {c.title}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {c.case_type}
                              </Badge>
                              <Badge className={`text-xs ${severityBadge(c.severity)}`}>
                                {c.severity}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={`text-xs ${statusBadge(c.status)}`}>
                              {c.status.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(c.created_at)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {closedCases.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                      Resolved Cases
                    </h2>
                    {closedCases.slice(0, 10).map((c) => (
                      <Card key={c.id} className="opacity-70">
                        <CardContent className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-mono">
                              #{c.case_number}
                            </span>
                            <span className="text-sm">{c.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={`text-xs ${statusBadge(c.status)}`}>
                              {c.status}
                            </Badge>
                            {c.resolved_at && (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(c.resolved_at)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/star-chamber")}
                  className="gap-2"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Open Star Chamber Workspace
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </TabsContent>

          {/* SUBMIT APPEAL */}
          <TabsContent value="appeal" className="space-y-4">
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="py-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">
                  Before submitting an appeal:
                </p>
                <ul className="space-y-1 text-xs list-disc list-inside">
                  <li>Appeals must be filed within 30 days of the original decision</li>
                  <li>State the specific decision being contested</li>
                  <li>Provide clear grounds: procedural error, factual error, or constitutional conflict</li>
                  <li>Describe the remedy you are seeking</li>
                </ul>
              </CardContent>
            </Card>

            {!user ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <Lock className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Sign in to submit an appeal.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Submit an Appeal</CardTitle>
                  <CardDescription>
                    Your appeal will be reviewed for standing within 48 hours.
                    Valid appeals are assigned a case number.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">
                      Appeal Title <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={appealTitle}
                      onChange={(e) => setAppealTitle(e.target.value)}
                      placeholder="Brief description of the decision being appealed"
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">
                      Grounds for Review <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      value={appealGrounds}
                      onChange={(e) => setAppealGrounds(e.target.value)}
                      placeholder="Explain why the decision should be reviewed. Be specific about the error or conflict."
                      rows={4}
                      maxLength={2000}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">
                      Requested Remedy
                    </label>
                    <Textarea
                      value={appealRemedy}
                      onChange={(e) => setAppealRemedy(e.target.value)}
                      placeholder="What outcome are you seeking? (Optional but helpful)"
                      rows={2}
                      maxLength={1000}
                    />
                  </div>
                  <Button
                    onClick={() => submitMut.mutate()}
                    disabled={
                      submitMut.isPending ||
                      !appealTitle.trim() ||
                      !appealGrounds.trim()
                    }
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {submitMut.isPending ? "Submitting..." : "Submit Appeal"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* PROCEDURES */}
          <TabsContent value="procedures" className="space-y-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4 text-sm text-muted-foreground">
                The Star Chamber operates under fixed procedures. Procedures may
                only be amended through the DNA Lock process, which requires an
                80% supermajority of The 300 and Founder ratification.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Appeal Procedure</CardTitle>
              </CardHeader>
              <CardContent>
                <ProcedureList />
              </CardContent>
            </Card>

            {/* Audit log preview */}
            {auditEntries.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Immutable Decision Log
                  </CardTitle>
                  <CardDescription>
                    All Star Chamber decisions are appended here and cannot be
                    altered or deleted.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {auditEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between gap-3 py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{entry.event}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.detail}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/governance/audit")}
                    className="mt-2 gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Full Audit Trail
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PortalPageLayout>
  );
}
