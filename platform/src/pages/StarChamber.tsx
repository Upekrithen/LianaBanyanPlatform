import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Scale, Eye, Brain, Crown, Gavel, AlertTriangle, Shield, Clock,
  ChevronDown, ChevronUp, Plus, Trash2, FileText, Loader2, CheckCircle, XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  type StarChamberCase, type CaseSeverity, type CaseStatus, type CaseType,
  JUDGES, fetchCases, createCase, updateCaseStatus,
  setRecommendedAction, setFinalAction, setFounderOverride,
} from "@/lib/starChamberService";

const SEVERITY_STYLES: Record<CaseSeverity, { bg: string; text: string }> = {
  low: { bg: "bg-green-500/20", text: "text-green-400" },
  medium: { bg: "bg-amber-500/20", text: "text-amber-400" },
  high: { bg: "bg-orange-500/20", text: "text-orange-400" },
  critical: { bg: "bg-red-500/20", text: "text-red-400" },
};

const STATUS_STYLES: Record<CaseStatus, { bg: string; text: string }> = {
  open: { bg: "bg-blue-500/20", text: "text-blue-400" },
  under_review: { bg: "bg-purple-500/20", text: "text-purple-400" },
  analysis_complete: { bg: "bg-amber-500/20", text: "text-amber-400" },
  verdict_reached: { bg: "bg-green-500/20", text: "text-green-400" },
  closed: { bg: "bg-slate-500/20", text: "text-slate-400" },
  appealed: { bg: "bg-red-500/20", text: "text-red-400" },
};

const TYPE_STYLES: Record<CaseType, string> = {
  dispute: "bg-orange-500/20 text-orange-400",
  complaint: "bg-amber-500/20 text-amber-400",
  violation: "bg-red-500/20 text-red-400",
  appeal: "bg-blue-500/20 text-blue-400",
};

const JUDGE_ICONS = { Oracle: Eye, Morpheus: Brain, "Red Queen": Crown, Dredd: Gavel };
const JUDGE_COLORS = { Oracle: "text-purple-400 bg-purple-500/10 border-purple-500/30", Morpheus: "text-blue-400 bg-blue-500/10 border-blue-500/30", "Red Queen": "text-red-400 bg-red-500/10 border-red-500/30", Dredd: "text-amber-400 bg-amber-500/10 border-amber-500/30" };

const EVIDENCE_TYPES = ["document", "screenshot", "transaction_record", "chat_log", "witness_statement"] as const;

interface EvidenceItem {
  type: string;
  description: string;
  url: string;
}

export default function StarChamber() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [cases, setCases] = useState<StarChamberCase[]>([]);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<CaseType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CaseStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  // File a Case state
  const [showFileCase, setShowFileCase] = useState(false);
  const [filing, setFiling] = useState(false);
  const [caseType, setCaseType] = useState<CaseType>("dispute");
  const [caseSeverity, setCaseSeverity] = useState<CaseSeverity>("medium");
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [respondentSearch, setRespondentSearch] = useState("");
  const [respondentId, setRespondentId] = useState<string | null>(null);
  const [respondentResults, setRespondentResults] = useState<{ id: string; name: string }[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);

  // Admin verdict state
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideAction, setOverrideAction] = useState("");
  const [verdictLoading, setVerdictLoading] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCases();
    setCases(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadCases(); }, [loadCases]);

  const searchRespondent = async (query: string) => {
    setRespondentSearch(query);
    setRespondentId(null);
    if (query.length < 2) { setRespondentResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name")
      .or(`display_name.ilike.%${query}%`)
      .limit(5);
    setRespondentResults((data || []).map((p: any) => ({ id: p.id, name: p.display_name || "Unknown" })));
  };

  const addEvidence = () => {
    setEvidenceItems([...evidenceItems, { type: "document", description: "", url: "" }]);
  };

  const removeEvidence = (idx: number) => {
    setEvidenceItems(evidenceItems.filter((_, i) => i !== idx));
  };

  const updateEvidence = (idx: number, field: keyof EvidenceItem, value: string) => {
    setEvidenceItems(evidenceItems.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const resetFileForm = () => {
    setCaseType("dispute");
    setCaseSeverity("medium");
    setCaseTitle("");
    setCaseDescription("");
    setRespondentSearch("");
    setRespondentId(null);
    setRespondentResults([]);
    setEvidenceItems([]);
  };

  const handleFileCase = async () => {
    if (!caseTitle.trim() || !caseDescription.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setFiling(true);
    try {
      const result = await createCase({
        caseType,
        title: caseTitle.trim(),
        description: caseDescription.trim(),
        severity: caseSeverity,
        complainantUserId: user?.id,
        respondentUserId: respondentId || undefined,
        evidence: evidenceItems.filter(e => e.description.trim()),
      });

      if (!result) {
        toast.error("Failed to file case");
        return;
      }

      toast.success(`Case #${result.caseNumber} filed — AI judges activated`);
      setShowFileCase(false);
      resetFileForm();
      loadCases();

      triggerAnalysis(result.id);
    } catch (err) {
      toast.error("Error filing case");
    } finally {
      setFiling(false);
    }
  };

  const triggerAnalysis = async (caseId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) return;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://bzmicoleqgfiblniojkz.supabase.co"}/functions/v1/star-chamber-analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ caseId }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("AI analysis complete — judges have ruled");
        loadCases();
      } else {
        toast.warning(`Analysis issue: ${data.error || "Check back shortly"}`);
      }
    } catch {
      toast.info("Analysis queued — refresh in a few moments");
    }
  };

  const handleAcceptVerdict = async (c: StarChamberCase) => {
    if (!c.recommendedAction) return;
    setVerdictLoading(c.id);
    const ok = await setFinalAction(c.id, c.recommendedAction);
    if (ok) { toast.success(`Case #${c.caseNumber}: verdict accepted`); loadCases(); }
    else toast.error("Failed to set verdict");
    setVerdictLoading(null);
  };

  const handleOverrideSubmit = async (c: StarChamberCase) => {
    if (!overrideReason.trim() || !overrideAction.trim()) {
      toast.error("Override reason and action are required");
      return;
    }
    setVerdictLoading(c.id);
    await setFounderOverride(c.id, overrideReason.trim());
    const ok = await setFinalAction(c.id, overrideAction.trim());
    if (ok) { toast.success(`Case #${c.caseNumber}: founder override applied`); setOverrideId(null); setOverrideReason(""); setOverrideAction(""); loadCases(); }
    else toast.error("Failed to apply override");
    setVerdictLoading(null);
  };

  const handleDismiss = async (c: StarChamberCase) => {
    setVerdictLoading(c.id);
    const ok = await updateCaseStatus(c.id, "closed");
    if (ok) { toast.success(`Case #${c.caseNumber}: dismissed`); loadCases(); }
    else toast.error("Failed to dismiss case");
    setVerdictLoading(null);
  };

  if (!user) {
    return (
      <PortalPageLayout variant="stage" maxWidth="xl" xrayId="star-chamber">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-slate-900/80 border-slate-800 max-w-md"><CardContent className="py-8 text-center"><p className="text-slate-400 mb-4">Sign in to access the Star Chamber.</p><Button asChild><Link to="/auth">Sign in</Link></Button></CardContent></Card>
        </div>
      </PortalPageLayout>
    );
  }

  const filteredCases = cases.filter(c => (filterType === "all" || c.caseType === filterType) && (filterStatus === "all" || c.status === filterStatus));
  const closedCases = cases.filter(c => c.status === "closed" || c.status === "verdict_reached");

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="star-chamber">
      <div className="space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Scale className="w-8 h-8 text-amber-400" />
              Star Chamber v9.7
            </h1>
            <p className="text-slate-400">Justice, Analyzed. Fairness, Enforced.</p>
          </div>
          <Button onClick={() => setShowFileCase(true)} data-xray-id="star-chamber-file-case">
            <Plus className="w-4 h-4 mr-1" /> File a Case
          </Button>
        </header>

        {/* ─── File a Case Dialog ─── */}
        <Dialog open={showFileCase} onOpenChange={(open) => { if (!open) { setShowFileCase(false); resetFileForm(); } }}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" /> File a New Case
              </DialogTitle>
              <DialogDescription>
                Submit a dispute, complaint, violation, or appeal for AI judge review.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Case Type</Label>
                  <Select value={caseType} onValueChange={(v) => setCaseType(v as CaseType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dispute">Dispute</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="violation">Violation</SelectItem>
                      <SelectItem value="appeal">Appeal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Severity</Label>
                  <Select value={caseSeverity} onValueChange={(v) => setCaseSeverity(v as CaseSeverity)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  placeholder="Brief title for the case"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the situation in detail..."
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Respondent (optional)</Label>
                <Input
                  placeholder="Search member by name..."
                  value={respondentSearch}
                  onChange={(e) => searchRespondent(e.target.value)}
                />
                {respondentResults.length > 0 && !respondentId && (
                  <div className="border rounded-md divide-y text-sm max-h-32 overflow-y-auto">
                    {respondentResults.map((r) => (
                      <button
                        key={r.id}
                        className="w-full px-3 py-2 text-left hover:bg-muted/50"
                        onClick={() => { setRespondentId(r.id); setRespondentSearch(r.name); setRespondentResults([]); }}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
                {respondentId && (
                  <Badge variant="secondary" className="text-xs">
                    Selected: {respondentSearch}
                    <button className="ml-1 text-xs" onClick={() => { setRespondentId(null); setRespondentSearch(""); }}>×</button>
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Evidence</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addEvidence}>
                    <Plus className="w-3 h-3 mr-1" /> Add Evidence
                  </Button>
                </div>
                {evidenceItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 border rounded-md">
                    <Select value={item.type} onValueChange={(v) => updateEvidence(idx, "type", v)}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EVIDENCE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateEvidence(idx, "description", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="URL (optional)"
                      value={item.url}
                      onChange={(e) => updateEvidence(idx, "url", e.target.value)}
                      className="w-[140px]"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeEvidence(idx)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => { setShowFileCase(false); resetFileForm(); }}>Cancel</Button>
              <Button onClick={handleFileCase} disabled={filing || !caseTitle.trim() || !caseDescription.trim()}>
                {filing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Gavel className="w-4 h-4 mr-1" />}
                Submit Case
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Four AI Judges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {JUDGES.map(judge => {
            const Icon = JUDGE_ICONS[judge.name as keyof typeof JUDGE_ICONS] || Scale;
            const colors = JUDGE_COLORS[judge.name as keyof typeof JUDGE_COLORS] || "";
            return (
              <Card key={judge.name} className={`border ${colors}`}>
                <CardContent className="pt-4 pb-3 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-bold">{judge.name}</p>
                  <p className="text-xs text-slate-400 mb-2">{judge.description}</p>
                  <div className="text-xs space-y-1">
                    <p>Cases: {judge.casesAnalyzed}</p>
                    <p>Agreement: {judge.agreementRate}%</p>
                    <p>Avg: {judge.avgTimeHours}h</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
            <option value="all">All Types</option>
            <option value="dispute">Disputes</option>
            <option value="complaint">Complaints</option>
            <option value="violation">Violations</option>
            <option value="appeal">Appeals</option>
          </select>
          <select className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-white" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="analysis_complete">Analysis Complete</option>
            <option value="verdict_reached">Verdict Reached</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Cases List */}
        <section className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>
          ) : filteredCases.length === 0 ? (
            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="text-center py-12">
                <Scale className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 text-lg font-medium mb-2">No cases filed yet.</p>
                <p className="text-slate-500 text-sm">The Star Chamber awaits its first petition.</p>
              </CardContent>
            </Card>
          ) : filteredCases.map(c => {
            const isExpanded = expandedCase === c.id;
            const sev = SEVERITY_STYLES[c.severity];
            const stat = STATUS_STYLES[c.status];
            return (
              <Card key={c.id} className="bg-slate-900/60 border-slate-800">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 cursor-pointer" onClick={() => setExpandedCase(isExpanded ? null : c.id)}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-slate-500">#{c.caseNumber}</span>
                      <Badge className={`${TYPE_STYLES[c.caseType]} border-0`}>{c.caseType}</Badge>
                      <span className="font-medium">{c.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${sev.bg} ${sev.text} border-0`}>{c.severity}</Badge>
                      <Badge className={`${stat.bg} ${stat.text} border-0`}>{c.status.replace("_", " ")}</Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm text-slate-300">{c.description}</p>

                      {c.evidence.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-1">Evidence:</p>
                          <div className="flex flex-wrap gap-2">
                            {c.evidence.map((e, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{e.type}: {e.description}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          { name: "Oracle", analysis: c.oracleAnalysis, color: "purple" },
                          { name: "Morpheus", analysis: c.morpheusAnalysis, color: "blue" },
                          { name: "Red Queen", analysis: c.redQueenAnalysis, color: "red" },
                          { name: "Dredd", analysis: c.dreddVerdict, color: "amber" },
                        ].map(judge => (
                          <div key={judge.name} className={`p-3 rounded-lg border ${judge.analysis ? `border-${judge.color}-500/30 bg-${judge.color}-500/5` : "border-slate-800 bg-slate-900/30"}`}>
                            <p className={`text-xs font-bold mb-1 text-${judge.color}-400`}>{judge.name}</p>
                            <p className="text-xs text-slate-300">{judge.analysis || (judge.name === "Dredd" ? "Consensus reached — Dredd not required" : "Awaiting analysis...")}</p>
                          </div>
                        ))}
                      </div>

                      {c.recommendedAction && (
                        <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5">
                          <p className="text-xs font-bold text-green-400 mb-1">Recommended Action</p>
                          <p className="text-sm text-slate-300">{c.recommendedAction}</p>
                        </div>
                      )}

                      {c.finalAction && (
                        <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                          <p className="text-xs font-bold text-primary mb-1">Final Action</p>
                          <p className="text-sm text-slate-300">{c.finalAction}</p>
                        </div>
                      )}

                      {c.founderOverride && (
                        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                          <p className="text-xs font-bold text-amber-400 mb-1">Founder Override</p>
                          <p className="text-sm text-slate-300">{c.founderOverrideReason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* ─── Admin Verdict Panel ─── */}
        {isAdmin && (() => {
          const pendingCases = cases.filter(c => c.status === "analysis_complete");
          if (pendingCases.length === 0) return null;
          return (
            <>
              <Separator className="border-slate-800" />
              <section className="space-y-4" data-xray-id="star-chamber-admin-verdicts">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-amber-400" />
                  Pending Verdicts ({pendingCases.length})
                </h2>
                {pendingCases.map(c => (
                  <Card key={c.id} className="bg-slate-900/60 border-amber-800/30">
                    <CardContent className="py-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-mono text-slate-500 mr-2">#{c.caseNumber}</span>
                          <span className="font-medium">{c.title}</span>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-400 border-0">analysis complete</Badge>
                      </div>
                      {c.recommendedAction && (
                        <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5">
                          <p className="text-xs font-bold text-green-400 mb-1">AI Recommended Action</p>
                          <p className="text-sm text-slate-300">{c.recommendedAction}</p>
                        </div>
                      )}

                      {overrideId === c.id ? (
                        <div className="space-y-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                          <Label className="text-amber-400 text-xs">Override Action</Label>
                          <Input
                            placeholder="Your alternative action..."
                            value={overrideAction}
                            onChange={(e) => setOverrideAction(e.target.value)}
                          />
                          <Label className="text-amber-400 text-xs">Override Reason</Label>
                          <Textarea
                            placeholder="Why are you overriding the AI recommendation?"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleOverrideSubmit(c)} disabled={verdictLoading === c.id}>
                              {verdictLoading === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply Override"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setOverrideId(null); setOverrideReason(""); setOverrideAction(""); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptVerdict(c)}
                            disabled={verdictLoading === c.id || !c.recommendedAction}
                          >
                            {verdictLoading === c.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                            Accept Recommendation
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setOverrideId(c.id)}>
                            Override
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400"
                            onClick={() => handleDismiss(c)}
                            disabled={verdictLoading === c.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Dismiss
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </section>
            </>
          );
        })()}

        <Separator className="border-slate-800" />

        {/* Verdict Stats */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Verdict History</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-slate-900/60 border-slate-800"><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-slate-400">Resolved</p><p className="text-2xl font-bold">{closedCases.length}</p></CardContent></Card>
            <Card className="bg-slate-900/60 border-slate-800"><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-slate-400">Override Rate</p><p className="text-2xl font-bold">{cases.length > 0 ? ((cases.filter(c => c.founderOverride).length / cases.length) * 100).toFixed(0) : 0}%</p></CardContent></Card>
            <Card className="bg-slate-900/60 border-slate-800"><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-slate-400">Open</p><p className="text-2xl font-bold">{cases.filter(c => c.status === "open").length}</p></CardContent></Card>
          </div>
        </section>

        <Separator className="border-slate-800" />

        {/* SCaaS Teaser */}
        <Card className="bg-gradient-to-r from-amber-950/40 to-slate-900/60 border-amber-800/30">
          <CardContent className="py-6 text-center">
            <h3 className="text-lg font-bold text-amber-400 mb-2">Star Chamber as a Service — Preview</h3>
            <p className="text-sm text-slate-400 mb-3">Bring AI-powered governance to your cooperative, HOA, or organization.</p>
            <p className="text-xs text-slate-500 mb-4">Pricing: $5/mo (community) to $500/mo (enterprise)</p>
            <Button variant="outline" size="sm" disabled>Join the Waitlist</Button>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
