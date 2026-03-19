import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Scale, Eye, Brain, Crown, Gavel, AlertTriangle, Shield, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import {
  type StarChamberCase, type CaseSeverity, type CaseStatus, type CaseType,
  JUDGES, SAMPLE_CASES, fetchCases,
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

export default function StarChamber() {
  const { user } = useAuth();
  const [cases, setCases] = useState<StarChamberCase[]>(SAMPLE_CASES);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<CaseType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<CaseStatus | "all">("all");

  useEffect(() => { fetchCases().then(setCases); }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <Card className="bg-slate-900/80 border-slate-800 max-w-md"><CardContent className="py-8 text-center"><p className="text-slate-400 mb-4">Sign in to access the Star Chamber.</p><Button asChild><Link to="/auth">Sign in</Link></Button></CardContent></Card>
      </div>
    );
  }

  const filteredCases = cases.filter(c => (filterType === "all" || c.caseType === filterType) && (filterStatus === "all" || c.status === filterStatus));
  const closedCases = cases.filter(c => c.status === "closed" || c.status === "verdict_reached");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" data-xray-id="star-chamber">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Scale className="w-8 h-8 text-amber-400" />
            Star Chamber v9.7
          </h1>
          <p className="text-slate-400">Justice, Analyzed. Fairness, Enforced.</p>
        </header>

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
          {filteredCases.map(c => {
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
            <h3 className="text-lg font-bold text-amber-400 mb-2">Coming Soon: Star Chamber as a Service</h3>
            <p className="text-sm text-slate-400 mb-3">Bring AI-powered governance to your cooperative, HOA, or organization.</p>
            <p className="text-xs text-slate-500 mb-4">Pricing: $5/mo (community) to $500/mo (enterprise)</p>
            <Button variant="outline" size="sm" disabled>Join the Waitlist</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
