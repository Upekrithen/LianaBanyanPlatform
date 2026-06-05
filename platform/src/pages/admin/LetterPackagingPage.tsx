/**
 * LetterPackagingPage — Wave 26 / Phase ε — Launch
 * =================================================
 * Unified send-readiness dashboard for all Crown and AI-Gang letters.
 * Route: /admin/letters
 *
 * Mechanic:
 *   - Displays all 9 letters with status (DRAFT / REVIEW / SEND-READY / SENT)
 *   - Per-letter send-readiness checklist (5 gates)
 *   - "Send Now" button staged and DISABLED until Founder ratifies each letter explicitly
 *   - ShieldedLetterGate wired for AI-Gang and Cardboard Boots letters
 *
 * NOTHING SHIPS without Founder ratification. No letter is sent from this page.
 *
 * Sonnet re-verify gate: All canon numbers verified by Sonnet 4.6 (Wave 26, 2026-06-03).
 * Re-verify before Founder ratification.
 *
 * Canon numbers: 2,270 innovations / 228 Crown Jewels / 21 provisionals /
 *   83.3% creator share / Cost+20% margin / $5-a-year identical for all
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  ArrowLeft,
  Crown,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Letter registry ─────────────────────────────────────────────────────────

export type LetterStatus = "DRAFT" | "REVIEW" | "SEND-READY" | "SENT";

export interface LetterReadinessChecklist {
  canonNumbersOK: boolean;
  emDashesClean: boolean;
  nomineeLanguage: boolean;
  securitiesClean: boolean;
  founderRatified: boolean;
}

export interface LetterRecord {
  id: string;
  slug: string;
  group: "crown" | "ai-gang";
  recipient: string;
  role?: string;
  status: LetterStatus;
  checklist: LetterReadinessChecklist;
  founderFillsRequired: string[];
  notes: string;
  filePath: string;
}

/** W26 canonical letter registry — 9 letters total */
export const LETTER_REGISTRY: LetterRecord[] = [
  // ── Crown letters (W7 send-ready) ──────────────────────────────────────
  {
    id: "mackenzie-scott",
    slug: "cardboard-boots-v017",
    group: "crown",
    recipient: "MacKenzie Scott",
    role: "Board Chair Crown (offered)",
    status: "REVIEW",
    checklist: {
      canonNumbersOK: true,
      emDashesClean: true,
      nomineeLanguage: true,
      securitiesClean: true,
      founderRatified: false,
    },
    founderFillsRequired: [
      "Fill [NAME] of the Defense Klaus woman + one line of her story",
      "Fill one line of Mauneet's need",
      "Verify 92.7/3.6 benchmark after Wave 5 re-run",
    ],
    notes:
      "v017 Cardboard Boots publish candidate. Canon numbers correct (2,270 / 228 / 21). " +
      "Two [FOUNDER TO FILL] gaps remain. Not SEND-READY until Founder fills and re-reads.",
    filePath:
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/CROWN_LETTER_MACKENZIE_SCOTT_v017_CARDBOARD_BOOTS_PUBLISH_CANDIDATE.md",
  },
  {
    id: "michael-seibel",
    slug: "seibel-ceo",
    group: "crown",
    recipient: "Michael Seibel",
    role: "CEO Crown (offered)",
    status: "DRAFT",
    checklist: {
      canonNumbersOK: true,
      emDashesClean: true,
      nomineeLanguage: true,
      securitiesClean: true,
      founderRatified: false,
    },
    founderFillsRequired: [
      "Replace {{founderAge}} with actual age",
      "Fill both [BISHOP DRAFT] sections in Founder's own voice",
      "Timing: April 29 Opening Gambit reference is now stale (date passed June 2026) - Founder to update or confirm still relevant",
    ],
    notes:
      "Numbers corrected to canon (2,270 / 228 / 21). Em-dashes clean. " +
      "Two [BISHOP DRAFT] sections and {{founderAge}} require Founder voice before send.",
    filePath:
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/CROWN_LETTER_SEIBEL_CEO_v002_B103.md",
  },
  {
    id: "tom-simon",
    slug: "simon-cfo",
    group: "crown",
    recipient: "Tom Simon",
    role: "CFO Crown (offered)",
    status: "DRAFT",
    checklist: {
      canonNumbersOK: true,
      emDashesClean: true,
      nomineeLanguage: true,
      securitiesClean: true,
      founderRatified: false,
    },
    founderFillsRequired: ["Replace {{founderAge}} with actual age"],
    notes:
      "Numbers corrected to canon (2,270 / 228 / 21). Em-dashes clean. " +
      "Nominee language fixed ('Crown holder' -> 'Crown nominee, once accepted'). " +
      "{{founderAge}} requires Founder fill.",
    filePath:
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/CROWN_LETTER_TOM_SIMON_CFO_v008_B103.md",
  },
  {
    id: "craig-newmark-crown",
    slug: "newmark-chancellor",
    group: "crown",
    recipient: "Craig Newmark",
    role: "Infrastructure Chancellor Crown (offered)",
    status: "DRAFT",
    checklist: {
      canonNumbersOK: true,
      emDashesClean: true,
      nomineeLanguage: true,
      securitiesClean: true,
      founderRatified: false,
    },
    founderFillsRequired: [
      "Replace {{founderAge}} with actual age",
      "Timing: February 2026 date is stale - Founder to update",
    ],
    notes:
      "Numbers corrected to canon (2,270 / 228 / 21). Domain fixed (.org -> .com). " +
      "Very stale numbers (was 1,200) now corrected. {{founderAge}} requires Founder fill.",
    filePath:
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/Wave_1_Apr12-13_Soft_Open/CROWN_LETTER_CRAIG_NEWMARK_V4_DRAFT.md",
  },

  // ── AI-Gang letters (READY_BP072) ──────────────────────────────────────
  {
    id: "trebor-scholz",
    slug: "scholz",
    group: "ai-gang",
    recipient: "Trebor Scholz",
    role: "Platform Cooperativism academic partner (invited)",
    status: "SEND-READY",
    checklist: {
      canonNumbersOK: true,
      emDashesClean: true,
      nomineeLanguage: true,
      securitiesClean: true,
      founderRatified: false,
    },
    founderFillsRequired: [],
    notes:
      "READY_BP072. Canon numbers verified (2,270 / 21 provisionals / 83.3% / Cost+20% / $5). " +
      "No equity/ROI language. ShieldedLetterGate: slug='scholz'. HELD until Founder ratifies.",
    filePath:
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_SCHOLZ_READY_BP072.md",
  },
  {
    id: "erik-brynjolfsson",
    slug: "brynjolfsson",
    group: "ai-gang",
    recipient: "Erik Brynjolfsson",
    role: "Stanford Digital Economy Lab (research case invited)",
    status: "SEND-READY",
    checklist: {
      canonNumbersOK: true,
      emDashesClean: true,
      nomineeLanguage: true,
      securitiesClean: true,
      founderRatified: false,
    },
    founderFillsRequired: [],
    notes:
      "READY_BP072. Canon numbers verified (2,270 / 21 provisionals / 83.3% / Cost+20%). " +
      "No equity/ROI language. ShieldedLetterGate: slug='brynjolfsson'. HELD until Founder ratifies.",
    filePath:
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_BRYNJOLFSSON_READY_BP072.md",
  },
  {
    id: "craig-newmark-aigang",
    slug: "newmark",
    group: "ai-gang",
    recipient: "Craig Newmark",
    role: "Journalism cooperative / philanthropy alignment (invited)",
    status: "SEND-READY",
    checklist: {
      canonNumbersOK: true,
      emDashesClean: true,
      nomineeLanguage: true,
      securitiesClean: true,
      founderRatified: false,
    },
    founderFillsRequired: [],
    notes:
      "READY_BP072. Canon numbers verified (21 provisionals / 83.3% / Cost+20% / $5). " +
      "No funding ask. ShieldedLetterGate: slug='newmark'. HELD until Founder ratifies. " +
      "DISTINCT from the Crown letter to Newmark (Infrastructure Chancellor).",
    filePath:
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_NEWMARK_READY_BP072.md",
  },
  {
    id: "cory-doctorow",
    slug: "doctorow",
    group: "ai-gang",
    recipient: "Cory Doctorow",
    role: "Anti-enshittification architecture (reading list ask)",
    status: "SEND-READY",
    checklist: {
      canonNumbersOK: true,
      emDashesClean: true,
      nomineeLanguage: true,
      securitiesClean: true,
      founderRatified: false,
    },
    founderFillsRequired: [],
    notes:
      "READY_BP072. Canon numbers verified (21 provisionals / 83.3% / Cost+20%). " +
      "No equity/ROI. ShieldedLetterGate: slug='doctorow'. HELD until Founder ratifies.",
    filePath:
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_DOCTOROW_READY_BP072.md",
  },
  {
    id: "ollama",
    slug: "ollama",
    group: "ai-gang",
    recipient: "Michael Chiang & Jeffrey Morgan (Ollama)",
    role: "Thank-you + local-AI floor cooperation (invited)",
    status: "SEND-READY",
    checklist: {
      canonNumbersOK: true,
      emDashesClean: true,
      nomineeLanguage: true,
      securitiesClean: true,
      founderRatified: false,
    },
    founderFillsRequired: [],
    notes:
      "READY_BP072. Canon numbers verified (21 provisionals / 83.3% / Cost+20% / $5). " +
      "No money ask. ShieldedLetterGate: slug='ollama'. HELD until Founder ratifies.",
    filePath:
      "BISHOP_DROPZONE/00_FOUNDER_REVIEW/LETTER_OLLAMA_READY_BP072.md",
  },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  LetterStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  DRAFT: {
    label: "DRAFT",
    color: "border-slate-500/40 text-slate-300 bg-slate-800/60",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  REVIEW: {
    label: "REVIEW",
    color: "border-amber-500/40 text-amber-300 bg-amber-900/30",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  "SEND-READY": {
    label: "SEND-READY",
    color: "border-blue-500/40 text-blue-300 bg-blue-900/30",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  SENT: {
    label: "SENT",
    color: "border-emerald-500/40 text-emerald-300 bg-emerald-900/30",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
};

// ─── Per-letter checklist component ──────────────────────────────────────────

function ChecklistRow({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      {passed ? (
        <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
      ) : (
        <XCircle className="w-3 h-3 text-red-400 shrink-0" />
      )}
      <span style={{ color: passed ? "#86efac" : "#fca5a5" }}>{label}</span>
    </div>
  );
}

function LetterChecklist({ checklist }: { checklist: LetterReadinessChecklist }) {
  return (
    <div className="space-y-1.5 mt-2">
      <ChecklistRow label="Canon numbers OK (2,270 / 228 / 21 / 83.3% / Cost+20% / $5)" passed={checklist.canonNumbersOK} />
      <ChecklistRow label="Em-dashes clean (hyphens only, no — character)" passed={checklist.emDashesClean} />
      <ChecklistRow label='Nominee language (not "holder" before acceptance)' passed={checklist.nomineeLanguage} />
      <ChecklistRow label="Securities-clean (Marks = participation, no equity/ROI/dividends)" passed={checklist.securitiesClean} />
      <ChecklistRow label="Founder ratified (dispatch path open)" passed={checklist.founderRatified} />
    </div>
  );
}

// ─── Letter card component ────────────────────────────────────────────────────

function LetterCard({ letter }: { letter: LetterRecord }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[letter.status];
  const allChecksPassed = Object.values(letter.checklist).every(Boolean);
  const checksPendingRatification =
    letter.checklist.canonNumbersOK &&
    letter.checklist.emDashesClean &&
    letter.checklist.nomineeLanguage &&
    letter.checklist.securitiesClean &&
    !letter.checklist.founderRatified;

  return (
    <Card
      className="border"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide" style={{ borderColor: "rgba(212,168,83,0.3)", color: "#d4a853" }}>
                {letter.group === "crown" ? "Crown" : "AI-Gang"}
              </Badge>
              <CardTitle className="text-sm font-semibold">{letter.recipient}</CardTitle>
            </div>
            {letter.role && (
              <p className="text-[11px]" style={{ color: "#94a3b8" }}>{letter.role}</p>
            )}
          </div>
          <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
            {cfg.icon}
            {cfg.label}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Checklist */}
        <LetterChecklist checklist={letter.checklist} />

        {/* Founder fills required */}
        {letter.founderFillsRequired.length > 0 && (
          <div
            className="rounded-lg p-3 space-y-1"
            style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#fbbf24" }}>
              Founder fills required before send
            </p>
            {letter.founderFillsRequired.map((fill, i) => (
              <p key={i} className="text-[10px]" style={{ color: "#fcd34d" }}>
                {i + 1}. {fill}
              </p>
            ))}
          </div>
        )}

        {/* Expandable notes */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] transition-colors"
          style={{ color: "#64748b" }}
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Hide" : "Show"} W26 audit notes
        </button>
        {expanded && (
          <p className="text-[10px] leading-relaxed" style={{ color: "#94a3b8" }}>
            {letter.notes}
            <br />
            <span style={{ color: "#475569" }}>File: {letter.filePath}</span>
          </p>
        )}

        {/* Send Now button - staged, always disabled */}
        <div
          className="rounded-lg p-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-3.5 h-3.5" style={{ color: "#64748b" }} />
            <span className="text-[10px]" style={{ color: "#64748b" }}>
              {allChecksPassed
                ? "All checks passed. Dispatch path open when Founder ratifies via /admin/outreach-letters."
                : checksPendingRatification
                ? "Content checks passed. Awaiting Founder ratification."
                : "Letter must pass all content checks and Founder ratification before dispatch."}
            </span>
          </div>
          <Button
            size="sm"
            disabled
            className="w-full text-[11px] cursor-not-allowed"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#475569",
            }}
          >
            <Lock className="w-3 h-3 mr-1.5" />
            Send Now (held - Founder ratification required)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LetterPackagingPage() {
  const navigate = useNavigate();

  const crownLetters = LETTER_REGISTRY.filter((l) => l.group === "crown");
  const aiGangLetters = LETTER_REGISTRY.filter((l) => l.group === "ai-gang");

  const counts = {
    draft: LETTER_REGISTRY.filter((l) => l.status === "DRAFT").length,
    review: LETTER_REGISTRY.filter((l) => l.status === "REVIEW").length,
    sendReady: LETTER_REGISTRY.filter((l) => l.status === "SEND-READY").length,
    sent: LETTER_REGISTRY.filter((l) => l.status === "SENT").length,
  };

  return (
    <PortalPageLayout variant="stage" xrayId="letter-packaging">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/outreach-letters")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Outreach Letters Admin
        </Button>

        {/* Title */}
        <div className="flex items-start gap-3">
          <Crown className="h-8 w-8 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-3xl font-bold">Letter Send-Readiness Packaging</h1>
            <p className="text-muted-foreground mt-1">
              Wave 26 / Phase epsilon — All Crown + AI-Gang letters staged for Founder ratification.
              Nothing ships without explicit Founder ratification.
            </p>
          </div>
        </div>

        {/* Sonnet gate notice */}
        <Card style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <CardContent className="py-3 flex items-start gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div style={{ color: "#93c5fd" }}>
              <strong>Sonnet 4.6 re-verify gate (Wave 26, 2026-06-03):</strong> All canon numbers
              were verified by Sonnet 4.6. Re-verify with Sonnet 4.6 before Founder ratification of
              any letter. Canon: 2,270 innovations / 228 Crown Jewels / 21 provisionals / 83.3%
              creator share / Cost+20% margin / $5-a-year identical for all.
            </div>
          </CardContent>
        </Card>

        {/* Doctrine notice */}
        <Card style={{ background: "rgba(212,168,83,0.05)", border: "1px solid rgba(212,168,83,0.15)" }}>
          <CardContent className="py-3 flex items-start gap-2 text-sm">
            <Lock className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#d4a853" }} />
            <div style={{ color: "#d4a853" }}>
              <strong>NOTHING SHIPS without Founder ratification.</strong> The "Send Now" button is
              staged and permanently disabled here. Ratification path:{" "}
              <span className="font-mono text-[11px]">/admin/outreach-letters</span> then letter
              detail then "Ratify and Enable Dispatch."
            </div>
          </CardContent>
        </Card>

        {/* Summary counts */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "DRAFT", count: counts.draft, color: "#94a3b8" },
            { label: "REVIEW", count: counts.review, color: "#fbbf24" },
            { label: "SEND-READY", count: counts.sendReady, color: "#60a5fa" },
            { label: "SENT", count: counts.sent, color: "#4ade80" },
          ].map(({ label, count, color }) => (
            <Card
              key={label}
              className="text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <CardContent className="py-3">
                <div className="text-2xl font-bold" style={{ color }}>
                  {count}
                </div>
                <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#64748b" }}>
                  {label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Crown letters section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            <h2 className="text-xl font-semibold">Crown Letters ({crownLetters.length})</h2>
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: "rgba(212,168,83,0.3)", color: "#d4a853" }}>
              W7 send-ready cohort
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Permanent leadership seat offers to MacKenzie Scott, Michael Seibel, Tom Simon, and Craig
            Newmark. All in DRAFT status - Founder fills required before these reach SEND-READY.
          </p>
          <div className="space-y-4">
            {crownLetters.map((letter) => (
              <LetterCard key={letter.id} letter={letter} />
            ))}
          </div>
        </section>

        {/* AI-Gang letters section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold">AI-Gang Letters ({aiGangLetters.length})</h2>
            <Badge variant="outline" className="text-[10px]" style={{ borderColor: "rgba(96,165,250,0.3)", color: "#60a5fa" }}>
              READY_BP072 cohort
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Outreach to Trebor Scholz, Erik Brynjolfsson, Craig Newmark, Cory Doctorow, and Ollama
            founders. All SEND-READY pending Founder ratification only - no content fills required.
          </p>
          <div className="space-y-4">
            {aiGangLetters.map((letter) => (
              <LetterCard key={letter.id} letter={letter} />
            ))}
          </div>
        </section>

        {/* ShieldedLetterGate status */}
        <Card style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-sm">ShieldedLetterGate Coverage</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-[11px] space-y-2" style={{ color: "#94a3b8" }}>
            <p>
              ShieldedLetterGate is wired for all AI-Gang slugs (scholz, brynjolfsson, newmark,
              doctorow, ollama) and Cardboard Boots (cardboard-boots-v016). The gate renders
              shield_pending state until Founder ratifies via{" "}
              <span className="font-mono">/admin/outreach-letters</span>.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["scholz", "brynjolfsson", "newmark", "doctorow", "ollama", "cardboard-boots-v016"].map(
                (slug) => (
                  <span
                    key={slug}
                    className="px-2 py-0.5 rounded font-mono text-[10px]"
                    style={{ background: "rgba(212,168,83,0.08)", border: "1px solid rgba(212,168,83,0.2)", color: "#d4a853" }}
                  >
                    {slug}
                  </span>
                )
              )}
            </div>
            <p className="mt-2 text-[10px]" style={{ color: "#64748b" }}>
              Crown letters use the same ratification mechanic but are not registered in
              AI_GANG_LETTER_SLUGS or CARDBOARD_BOOTS_LETTER_SLUGS - they are dispatched directly
              by Founder when SEND-READY.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center pb-4">
          Wave 26 / Phase epsilon / BP073 -- Letter packaging verified by Sonnet 4.6 on 2026-06-03.
          No letter sends. Founder ratification required for every dispatch.
        </p>
      </div>
    </PortalPageLayout>
  );
}
