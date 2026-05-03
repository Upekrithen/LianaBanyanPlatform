/**
 * SubstackHookPage — Pre-Cathedral Empirical Floor Substack Hook (Productized)
 * =============================================================================
 * Bushel 13 / Phase A — BP021 Ratified
 *
 * Canonical status: LOCKED-IN BP015 post-fire 2026-05-02 (Founder direct).
 * Source: BISHOP_DROPZONE/14_CanonicalReferences/PRE_CATHEDRAL_EMPIRICAL_FLOOR_SUBSTACK_HOOK.md
 *
 * Surfaces:
 *   - Cephas-renderable (this component)
 *   - LB Substack publishable
 *   - EmergingAI cross-post ready
 *
 * Load-bearing copy composes:
 *   - pre_cathedral_empirical_floor_substack_hook (BP015 lock-in)
 *   - architecture_beats_more_grownup_table_unified_lb_philosophy_canon_bp021.eblet.md
 *   - project_the_cathedral_effect.md (empirical anchor B122 K477 + B123 K481)
 *
 * Per feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md:
 *   Bishop scaffolds structure here. Founder prose-passes at fire-time.
 *   All canonical verbatim quotes are LOCKED-IN per BP015 ratification — use verbatim.
 *   Section headers + non-verbatim scaffolding are Bishop placeholders for Founder fire-time pass.
 *
 * Augur-Pricing exemption: documentation-class canonical reference; membership-orthogonal;
 *   vendor-API spend industry term throughout.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  BookOpen,
  ExternalLink,
  ArrowRight,
  Zap,
  BarChart3,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Canonical verbatim quotes (LOCKED-IN BP015 — do not paraphrase) ────────
// Source: PRE_CATHEDRAL_EMPIRICAL_FLOOR_SUBSTACK_HOOK.md (Founder-ratified BP015 post-fire)

const CANON = {
  /** The framing — verbatim canonical (BP015 lock-in) */
  core_framing:
    "Pre-Cathedral isn't just an empirical floor — it's the default state of the AI industry as of 2026, " +
    "demonstrated at industrial scale every day, by every AI company, every API integration, every " +
    "prompt-engineering shop. They think \"good prompts\" + \"RAG\" + \"fine-tuning\" are the levers. " +
    "They aren't. The lever is the substrate-shape of the gears.",

  /** The closer — Founder favorite ("YEAH baby") (BP015 lock-in) */
  closer:
    "Go ask any AI you currently use a hard retrieval question; observe the floor; come back when you want the ceiling.",

  /** The empirical anchor (drop-in for hostile/skeptical readers) (BP015 lock-in) */
  empirical_anchor:
    "The Cathedral Effect's 51%→84% HOT lift isn't magic — it's the structural delta between " +
    "(a) raw-electricity-loose-components and (b) raw-electricity-through-properly-ground-and-interlocked-gears. " +
    "Same models, same vendors, same compute cost. Different gears.",

  /** Closing candidate (BP015) */
  closing_candidate:
    "The lift isn't from more electricity. It's from better gears.",

  /** Lede candidate (BP015) */
  lede_candidate:
    "The entire AI industry is currently demonstrating, every day, what happens when you flow AI-electricity " +
    "through ad-hoc loose components. Try this: ask any AI you currently use a hard retrieval question. " +
    "Observe the floor. We'll be here when you want to know what the ceiling looks like.",
} as const;

// ─── Title candidates (BP015 lock-in) ────────────────────────────────────────

const TITLE_CANDIDATES = [
  "What Everyone Else Is Doing — and What It Costs",
  "The Floor Is Pre-Cathedral. Here's the Ceiling.",
  "Same Electricity, Different Gears: The Cathedral Effect Explained",
  "Go Ask Any AI a Hard Question. Then Come Back.",
] as const;

// ─── Paper series hooks (per-paper Section derivative) ───────────────────────
// Each of 12 Save-the-World Series papers has a derivative hook composing this anchor.
// Full hook scaffolds: BISHOP_DROPZONE/14_CanonicalReferences/SUBSTACK_HOOK_PAPER_N_BP022_SCAFFOLD.md

const PAPER_DERIVATIVE_HOOKS = [
  { n: 1, title: "Universal Sustained Economic Prosperity", anchor: "Architecture beats more in currency design" },
  { n: 2, title: "DNA-Engineered AI", anchor: "Architecture beats more in AI substrate design" },
  { n: 3, title: "Universal Abundant Low Cost Energy", anchor: "Architecture beats more in energy systems" },
  { n: 4, title: "Abolishing World Hunger", anchor: "Architecture beats more in food coordination" },
  { n: 5, title: "Decentralized Factory Manufacturing", anchor: "Architecture beats more in production networks" },
  { n: 6, title: "Resolving Political Conflict", anchor: "Architecture beats more in civic coordination" },
  { n: 7, title: "Health Care", anchor: "Architecture beats more in medical cooperation" },
  { n: 8, title: "Engineering Conducted AI", anchor: "Architecture beats more — the receipt" },
  { n: 9, title: "Universal Lifelong Learning", anchor: "Architecture beats more in pedagogy" },
  { n: 10, title: "Universal Cooperative Shelter", anchor: "Architecture beats more in shelter aggregation" },
  { n: 11, title: "Universal Caregiving", anchor: "Architecture beats more in invisible-labor recognition" },
  { n: 12, title: "Universal Earth Stewardship", anchor: "Architecture beats more in cooperative restoration" },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function SubstackHookPage() {
  return (
    <PortalPageLayout maxWidth="2xl" xrayId="substack-hook-page">
      <div className="space-y-10">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">Pre-Cathedral Empirical Floor</Badge>
            <Badge variant="secondary" className="text-xs">Locked-In BP015</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Same Electricity, Different Gears
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            The Pre-Cathedral Empirical Floor Substack Hook — Cephas-renderable, LB Substack
            publishable, EmergingAI cross-post ready. Canonical verbatim copy locked-in BP015.
          </p>
        </div>

        {/* ── Title candidates ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Title Candidates (Founder selects at fire-time)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {TITLE_CANDIDATES.map((t, i) => (
                <li key={i} className="flex gap-2 items-start text-sm">
                  <span className="text-muted-foreground/50 font-mono text-xs mt-0.5 w-4">{i + 1}.</span>
                  <span className="font-medium">{t}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Lede ─────────────────────────────────────────────────────────── */}
        <Card className="border-2 border-foreground/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Lede</CardTitle>
              <Badge variant="outline" className="text-xs ml-auto">Scaffold — Founder prose-passes</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed text-muted-foreground italic">
              {CANON.lede_candidate}
            </p>
          </CardContent>
        </Card>

        {/* ── Core framing ─────────────────────────────────────────────────── */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                The Framing (Verbatim — Locked-In BP015)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed font-medium">
              {CANON.core_framing}
            </p>
          </CardContent>
        </Card>

        {/* ── [Bishop scaffold placeholder section] ────────────────────────── */}
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="p-5 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              [Article body — Bishop scaffold / Founder prose-pass at fire-time]
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              Section: How the Cathedral Effect works mechanically.
              The substrate-shape-of-gears analogy developed from electrical to mechanical to AI.
              Why "good prompts + RAG + fine-tuning" are the wrong levers.
              The structural delta explained for a skeptical technical reader.
            </p>
          </CardContent>
        </Card>

        {/* ── Empirical anchor ─────────────────────────────────────────────── */}
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                The Empirical Anchor (Verbatim — Locked-In BP015)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed font-medium">
              {CANON.empirical_anchor}
            </p>
          </CardContent>
        </Card>

        {/* ── [Bishop scaffold: peer verification section] ──────────────────── */}
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="p-5 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              [Reader verification section — Bishop scaffold / Founder prose-pass]
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              Section: Self-verifiable without trust. The five-step reader-runnable comparison.
              "1. Pick any AI. 2. Ask a hard institutional-knowledge question. 3. Note the HOT rate.
              4. Compare to the Cathedral Effect receipts at lianabanyan.com/cephas/under-the-hood.
              5. Draw your own conclusion." Why this is structurally distinct from a marketing claim.
            </p>
          </CardContent>
        </Card>

        {/* ── The closer ───────────────────────────────────────────────────── */}
        <Card className="border-2 border-foreground/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              The Closer (Verbatim — Founder Favorite)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl leading-relaxed font-bold italic">
              "{CANON.closer}"
            </p>
          </CardContent>
        </Card>

        {/* ── Closing candidate ─────────────────────────────────────────────── */}
        <Card className="border-muted">
          <CardContent className="p-5">
            <p className="text-base font-semibold text-center italic">
              "{CANON.closing_candidate}"
            </p>
          </CardContent>
        </Card>

        {/* ── 12 paper-derivative hooks ──────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">12-Paper Series Derivative Hooks</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Each of the 12 Save-the-World Series papers has a derivative Substack hook anchored
            by the architecture-beats-more principle. Full scaffolds in{" "}
            <code className="text-xs bg-muted px-1 rounded">BISHOP_DROPZONE/14_CanonicalReferences/</code>.
            Founder prose-passes at fire-time.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAPER_DERIVATIVE_HOOKS.map((hook) => (
              <Card key={hook.n} className="border-muted">
                <CardContent className="p-4 flex gap-3 items-start">
                  <span className="text-lg font-bold text-muted-foreground/40 leading-none mt-0.5 w-5 text-center flex-shrink-0">
                    {hook.n}
                  </span>
                  <div>
                    <p className="text-sm font-medium leading-snug">{hook.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 italic">{hook.anchor}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── Publication targets ───────────────────────────────────────────── */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Publication Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2 items-start">
                <span className="font-medium text-foreground w-32 flex-shrink-0">Primary:</span>
                LB's own Substack + EmergingAI cross-post (per B133 partnership)
              </li>
              <li className="flex gap-2 items-start">
                <span className="font-medium text-foreground w-32 flex-shrink-0">Academic/policy:</span>
                Stanford Social Innovation Review (SSIR) — cooperative-economics natural fit
              </li>
              <li className="flex gap-2 items-start">
                <span className="font-medium text-foreground w-32 flex-shrink-0">Popular tech:</span>
                Wired (cross-pollination with $600B Dollar Man cohort)
              </li>
              <li className="flex gap-2 items-start">
                <span className="font-medium text-foreground w-32 flex-shrink-0">Civic-political:</span>
                The American Prospect, The Nation, In These Times
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* ── CTAs ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline">
            <Link to="/papers">
              Browse All Papers
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/onboarding/sovereignty">
              3-Tier Sovereignty
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
          <Button asChild>
            <a
              href="https://lianabanyan.substack.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              LB Substack
              <ExternalLink className="w-4 h-4 ml-1.5" />
            </a>
          </Button>
        </div>

      </div>
    </PortalPageLayout>
  );
}
