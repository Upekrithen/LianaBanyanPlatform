/**
 * ScalesRubricViewer — Bushel 19 / BP021
 * ========================================
 * Read-only display of the canonical rubric applied by the
 * Bouncer-Scales-Judge trio: safe patterns, criteria weights, precedents.
 *
 * "The scales are visible" — member-trust architecture.
 * Per Mordecai-Esther canon: members SEE the rubric, not just verdicts.
 * This enables Pedestal Forum decree-composition (new rubric additions).
 *
 * Data: embedded directly from YAML source at build time (static, Founder-ratified).
 * KN095/BP011 — scales_criteria_v1.yaml, bouncer_safe_patterns_v1.yaml, judge thresholds.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Scale, ShieldCheck, Gavel, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, AlertTriangle, Layers, Info,
} from "lucide-react";

// ── Embedded rubric data (from YAML source) ──────────────────────────────────

const SCALES_CRITERIA = [
  {
    id: "quotation_context",
    label: "Quotation context detected",
    weight: "high",
    weight_numeric: 3.0,
    pro_pass: [
      "Source-attribution explicit and isolated",
      '"> Source: Pawn report..." framing visible',
      "Content clearly demarcated as external quotation",
      '"--- PAWN QUOTATION ---" or equivalent marker present',
    ],
    pro_block: [
      "No quotation framing present",
      "Content reads as organism's own assertion",
      "Forbidden term appears in first-person claim",
    ],
    evaluation: "Check for explicit quotation markers. Partial credit if context is clear but not demarcated.",
  },
  {
    id: "negation_context",
    label: "Negation context",
    weight: "high",
    weight_numeric: 3.0,
    pro_pass: [
      '"Zero X", "no Y", "anti-Z" grammatical structure',
      "Forbidden term explicitly negated in same sentence",
      "Disclaimer or anti-securities statement present",
    ],
    pro_block: [
      "Affirmative-form usage without negation",
      "Term asserted positively",
    ],
    evaluation: "Regex-checkable. Negation of concept is opposite of forbidden use.",
  },
  {
    id: "domain_context",
    label: "Domain context",
    weight: "medium",
    weight_numeric: 2.0,
    pro_pass: [
      "AI-compute-economics domain",
      "Securities-LB-token-context where Forman-test passing is explicitly noted",
      "Legal-compliance-research context (studying the law, not pitching)",
      "Academic paper or technical analysis",
    ],
    pro_block: [
      "General-marketing context",
      "Member-facing pitch document",
      "Public-facing landing page content",
    ],
    evaluation: "File path and document header are key signals.",
  },
  {
    id: "author_organism_scope",
    label: "Author-organism scope",
    weight: "medium",
    weight_numeric: 2.0,
    pro_pass: [
      "Bishop organism writing",
      "Pawn-research class document (scribeId R11_shadow_* or Pawn)",
      "Knight test fixture or internal technical doc",
    ],
    pro_block: [
      "Member-facing letter (raise bar significantly)",
      "Crown Letter primary text",
      "Unknown organism scope",
    ],
    evaluation: "Check scribeId field. Bishop/Knight/Pawn internal docs have higher tolerance than member-facing.",
  },
  {
    id: "file_class_scope",
    label: "File-class scope",
    weight: "medium",
    weight_numeric: 2.0,
    pro_pass: [
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/ path",
      "BISHOP_DROPZONE/03_BishopHandoffs/ path",
      "Canonical Eblet path (~/.claude/state/eblets/)",
      "librarian-mcp internal path",
    ],
    pro_block: [
      "Public Cephas content (Cephas/cephas-hugo/content/)",
      "Crown Letter primary text in platform/src/data/crown-letters/",
      "Platform public-facing pages (platform/src/pages/)",
    ],
    evaluation: "Write destination is the primary signal. BISHOP_DROPZONE is research-class, not public.",
  },
  {
    id: "saa_howey_posture",
    label: "SAA Howey-test posture",
    weight: "critical",
    weight_numeric: 5.0,
    pro_pass: [
      "Forman consumption-motive defense intact",
      "LB token framed as utility, not investment",
      "No expectation-of-profit language present",
      "Content is compatible with Howey non-security analysis",
    ],
    pro_block: [
      "Forman defense undermined by content",
      "Expectation-of-profit implied or asserted",
      "Investment language in member-facing context without disclaimer",
    ],
    evaluation: "Highest-stakes criterion. Consult SAA Howey Opinion Brief.",
  },
  {
    id: "past_precedent",
    label: "Past-precedent same-context",
    weight: "medium",
    weight_numeric: 2.0,
    pro_pass: [
      "Similar prior content passed Founder ratification",
      "Bouncer safe-pattern covers this case type",
      "Known-safe context established in prior session",
    ],
    pro_block: [
      "No precedent exists for this context",
      "Similar prior content was rejected",
      "New context with no analog",
    ],
    evaluation: "Check judge_precedents_v1.yaml + Bouncer registry. Precedent is persuasive, not binding.",
  },
];

const BOUNCER_PATTERNS = [
  {
    id: "kn008_quotation_context",
    type: "quotation_framing",
    description: "Pawn research quotation — terms are direct-quoted from external source, not assertions",
    rationale: "Empirically proven false-positive class (BP011 seed case). Source-attribution markers are canonical safe context.",
  },
  {
    id: "kn095_industry_term_framing",
    type: "regex",
    description: "Industry-term framing — term used in definitional or academic context",
    rationale: "Writing about a concept for definitional purposes is categorically different from asserting the concept. Standard academic and legal drafting practice.",
  },
  {
    id: "kn095_scribe_internal_bp011",
    type: "scribe_id_prefix",
    description: "Scribe internal docs — technical context within agent-internal write path",
    rationale: "Agent-internal documentation writes (scribe_id prefixes Knight/Bishop/R11_shadow) with file_class qualifier. Low member-facing risk.",
  },
  {
    id: "kn095_bridle_rules_class",
    type: "file_class",
    description: "BRIDLE rules files — governance documentation for the agent architecture",
    rationale: "Writes to BRIDLE_RULES/ or sentinel_severity_tiers/ document the governance system itself. Cannot fire Augur for governance-of-governance writes.",
  },
];

const VERDICT_THRESHOLDS = {
  pass_above: 0.6,
  block_below: 0.4,
  judge_band: "0.40 – 0.60 (ambiguous band → escalate to Judge)",
};

const MANDATORY_ESCALATIONS = [
  "SAA Howey-test posture criterion scores pro-block",
  "File-class scope is Crown Letter primary text AND any criterion is ambiguous",
  "No precedent exists AND domain is member-facing-pitch",
];

// ── Weight badge ─────────────────────────────────────────────────────────────

function WeightBadge({ weight }: { weight: string }) {
  const cls =
    weight === "critical" ? "text-red-700 border-red-300 bg-red-50"
      : weight === "high" ? "text-amber-700 border-amber-300 bg-amber-50"
        : "text-slate-600 border-slate-200 bg-slate-50";
  return (
    <Badge variant="outline" className={`text-xs uppercase ${cls}`}>
      {weight}
    </Badge>
  );
}

// ── Criterion Row ─────────────────────────────────────────────────────────────

function CriterionRow({ criterion }: { criterion: typeof SCALES_CRITERIA[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <span className="flex-1 text-sm font-medium">{criterion.label}</span>
        <div className="flex items-center gap-2 shrink-0">
          <WeightBadge weight={criterion.weight} />
          <span className="text-xs text-muted-foreground">×{criterion.weight_numeric}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border bg-muted/10 p-3 space-y-3">
          <p className="text-xs text-muted-foreground italic">{criterion.evaluation}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Pro-pass signals
              </p>
              <ul className="space-y-1">
                {criterion.pro_pass.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-emerald-400 shrink-0 mt-0.5">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Pro-block signals
              </p>
              <ul className="space-y-1">
                {criterion.pro_block.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-red-400 shrink-0 mt-0.5">−</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface ScalesRubricViewerProps {
  showBouncer?: boolean;
  showScales?: boolean;
  showJudge?: boolean;
  showThresholds?: boolean;
}

export function ScalesRubricViewer({
  showBouncer = true,
  showScales = true,
  showJudge = true,
  showThresholds = true,
}: ScalesRubricViewerProps) {
  const [bouncerOpen, setBouncerOpen] = useState(false);
  const [scalesOpen, setScalesOpen] = useState(true);
  const [judgeOpen, setJudgeOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header note */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg border border-blue-200 bg-blue-50/30">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 space-y-0.5">
          <p className="font-medium">The Scales Are Visible — Member Trust Architecture</p>
          <p>
            These are the exact criteria applied to every content evaluation. Members may
            author <strong>Pedestal Forum decree-compositions</strong> — canonical additions
            with co-equal authority — by filing an appeal on a verdict they disagree with.
          </p>
        </div>
      </div>

      {/* Thresholds */}
      {showThresholds && (
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scale className="h-4 w-4 text-slate-500" />
              Verdict Thresholds (Founder-ratified BP011)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded border border-emerald-200 bg-emerald-50/30 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">PASS</p>
                <p className="text-sm font-semibold text-emerald-700">score &gt; 0.60</p>
              </div>
              <div className="rounded border border-amber-200 bg-amber-50/30 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">JUDGE (escalate)</p>
                <p className="text-sm font-semibold text-amber-700">0.40 – 0.60</p>
              </div>
              <div className="rounded border border-red-200 bg-red-50/30 p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">BLOCK</p>
                <p className="text-sm font-semibold text-red-700">score &lt; 0.40</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Mandatory Judge escalation (regardless of score)
              </p>
              <ul className="space-y-1">
                {MANDATORY_ESCALATIONS.map((m, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scales criteria */}
      {showScales && (
        <Card>
          <CardHeader className="py-3 px-4">
            <button
              onClick={() => setScalesOpen(!scalesOpen)}
              className="w-full flex items-center gap-2 text-left"
            >
              <Scale className="h-4 w-4 text-slate-500 shrink-0" />
              <CardTitle className="text-sm flex-1">
                Scales Criteria — 7 Rubric Dimensions
              </CardTitle>
              <Badge variant="outline" className="text-xs shrink-0">scales_criteria_v1.yaml</Badge>
              {scalesOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
          </CardHeader>
          {scalesOpen && (
            <CardContent className="px-4 pb-4 space-y-2">
              {SCALES_CRITERIA.map((c) => (
                <CriterionRow key={c.id} criterion={c} />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Bouncer safe patterns */}
      {showBouncer && (
        <Card>
          <CardHeader className="py-3 px-4">
            <button
              onClick={() => setBouncerOpen(!bouncerOpen)}
              className="w-full flex items-center gap-2 text-left"
            >
              <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0" />
              <CardTitle className="text-sm flex-1">
                Bouncer Safe-Pattern Registry
              </CardTitle>
              <Badge variant="outline" className="text-xs shrink-0">bouncer_safe_patterns_v1.yaml</Badge>
              {bouncerOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
          </CardHeader>
          {bouncerOpen && (
            <CardContent className="px-4 pb-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-3">
                Patterns that override an Augur block before Scales evaluates.
                Bouncer is <strong>fail-closed</strong> — unknown patterns route to Scales, never auto-pass.
              </p>
              {BOUNCER_PATTERNS.map((p) => (
                <div key={p.id} className="border border-border rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {p.id}
                    </code>
                    <Badge variant="outline" className="text-xs text-slate-500">{p.type}</Badge>
                  </div>
                  <p className="text-sm text-foreground">{p.description}</p>
                  <p className="text-xs text-muted-foreground italic">{p.rationale}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Judge precedents note */}
      {showJudge && (
        <Card>
          <CardHeader className="py-3 px-4">
            <button
              onClick={() => setJudgeOpen(!judgeOpen)}
              className="w-full flex items-center gap-2 text-left"
            >
              <Gavel className="h-4 w-4 text-slate-500 shrink-0" />
              <CardTitle className="text-sm flex-1">
                Judge Appellate Authority
              </CardTitle>
              <Badge variant="outline" className="text-xs shrink-0">judge_precedents_v1.yaml</Badge>
              {judgeOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
          </CardHeader>
          {judgeOpen && (
            <CardContent className="px-4 pb-4 space-y-3">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Judge fires when Scales emits a JUDGE escalation verdict, OR when a member
                  files an appeal on a BLOCK verdict.
                </p>
                <p>
                  Every Judge decision creates a new precedent appended to
                  <code className="mx-1 text-xs font-mono bg-muted px-1 rounded">judge_precedents_v1.yaml</code>
                  — the append-only precedent log.
                </p>
                <p>
                  When Judge issues a PASS, a Bouncer safe-pattern-registry update is queued
                  for Founder ratification. This is how new safe patterns enter the registry.
                </p>
              </div>

              <div className="rounded border border-border p-3 space-y-1.5">
                <p className="text-xs font-medium text-slate-700">Seed precedent (BP011 empirical anchor)</p>
                <p className="text-xs text-muted-foreground">
                  <strong>KN095-BP011-SEED-001</strong> — Pawn-research-quotation context.
                  Augur-Securities-Language false positive. Bouncer kn008_quotation_context
                  safe-pattern covers this class permanently.
                </p>
                <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300 bg-emerald-50">
                  RATIFIED — Bouncer pass-override correct
                </Badge>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded border border-blue-200 bg-blue-50/20">
                <Layers className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  <strong>Mordecai-Esther decree-composition:</strong> when you file an appeal
                  and it succeeds, your argument joins the precedent log with co-equal authority.
                  Both the original verdict and your appeal are visible; future readers cite whichever
                  they find load-bearing.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
