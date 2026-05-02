/**
 * LibrarianPage — The Librarian Page
 * ====================================
 * Lives at Librarian.the2ndSecond.com
 *
 * This is the destination page that all LibrarianMedallion QR codes route to
 * (per Marked Exception / BP005 federation canon).
 *
 * Routes:
 *   /                     → Librarian overview + all 7 medallion gallery
 *   /medallion/:variant   → Single variant full-page (composes with Pod T)
 *   /install              → Install / AGPL v3 framing + pip install
 *   /federation           → Federation Library access (ONE OF US, $5/year)
 *   /receipts             → Cross-vendor benchmark receipts (public / Pod X)
 *
 * Architecture:
 *   - Librarian.LianaBanyan.com → redirects here (download-detail-page)
 *   - Librarian.the2ndSecond.com → this page
 *   - All /medallion/:variant routes compose with LibrarianMedallion (KN053-55)
 *   - Stage-2 Demo Content (KN061) live on every medallion card-back
 *   - AGPL v3 framing: solo substrate free, federation library member-only
 *
 * Composes with:
 *   - LibrarianMedallion (KN053-55, Pod T)
 *   - Stage2DemoPanel (KN061, Pod Y)
 *   - MedallionPage routing architecture (Pod T)
 *   - BP005 LB Frame broadcast funnel (5-stage)
 *
 * Tags: KN064 / BP005 (Pod Y Bean 2 Librarian Page Deployment)
 */

import { useParams, Link, useLocation } from "react-router-dom";
import {
  LibrarianMedallion,
  LibrarianMedallionGallery,
  type LibrarianMedallionVariant,
} from "@/components/LibrarianMedallion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Download,
  Users,
  BarChart2,
  ArrowLeft,
  ExternalLink,
  Terminal,
  GitBranch,
  Shield,
  Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

const VALID_VARIANTS = new Set<LibrarianMedallionVariant>([
  "canon",
  "platform-rules",
  "project-rules",
  "cathedral",
  "pied-piper",
  "ai-tuning",
  "furnace",
  "symbiote",
  "ultravision",
  "liana-banyan",
  "titan",
]);

const CROSS_VARIANT_NAV: Array<{ slug: LibrarianMedallionVariant; label: string }> = [
  { slug: "liana-banyan", label: "Liana Banyan" },
  { slug: "cathedral", label: "Cathedral" },
  { slug: "pied-piper", label: "Pied Piper" },
  { slug: "furnace", label: "Furnace" },
  { slug: "canon", label: "Canon" },
  { slug: "platform-rules", label: "Platform Rules" },
  { slug: "project-rules", label: "Project Rules" },
  { slug: "ai-tuning", label: "AI Tuning" },
  { slug: "symbiote", label: "Symbiote" },
  { slug: "ultravision", label: "UltraVision" },
  { slug: "titan", label: "Titan Librarian" },
];

function isValidVariant(v: string | undefined): v is LibrarianMedallionVariant {
  return !!v && VALID_VARIANTS.has(v as LibrarianMedallionVariant);
}

// ─────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────

function LibrarianNav({ showBack }: { showBack?: boolean }) {
  return (
    <div
      className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-20"
      data-testid="librarian-nav"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        {showBack && (
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="librarian-nav-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
        <BookOpen className="w-4 h-4 text-primary" />
        <Link
          to="/"
          className="font-semibold text-sm hover:text-primary transition-colors"
          data-testid="librarian-nav-home"
        >
          The Librarian
        </Link>
        <span className="text-muted-foreground/40 text-xs">·</span>
        <Badge variant="outline" className="text-[10px]">
          AGPL v3 Free
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/install">
            <Button variant="ghost" size="sm" className="text-[11px] h-7">
              <Download className="w-3 h-3 mr-1" /> Install
            </Button>
          </Link>
          <Link to="/federation">
            <Button size="sm" className="text-[11px] h-7">
              ONE OF US →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HOME VIEW
// ─────────────────────────────────────────────────────────

function LibrarianHome() {
  return (
    <div className="space-y-12" data-testid="librarian-home">
      {/* Hero — V4 tagline (BP010 turn-21) */}
      <div
        className="text-center space-y-5 py-14"
        data-testid="librarian-hero"
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Librarian. Working Faster+Cheaper+Better. So you don't have to.
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            TRIPLE YOUR CONTEXT.{" "}
            <span className="text-primary">To the 4th Power.</span>{" "}
            <span className="text-green-600 dark:text-green-400">FREE.</span>
          </h1>
        </div>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          AI context substrate — proven +86.1pp HOT lift across 5 vendors.
          Cathedral Effect, Wrasse pre-injection, Chronos signing.
          AGPL v3 free, full-version, no gating. Federation Library unlocks with{" "}
          <span className="font-semibold text-foreground">ONE OF US</span>{" "}
          membership ($5/year).
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link to="/install">
            <Button size="lg" data-testid="hero-install-btn">
              <Download className="w-4 h-4 mr-2" />
              pip install librarian-mcp
            </Button>
          </Link>
          <Link to="/medallion/liana-banyan">
            <Button
              size="lg"
              variant="outline"
              data-testid="hero-gallery-btn"
            >
              Explore Medallions
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        data-testid="librarian-stats"
      >
        {[
          { label: "Vendors tested", value: "5+", icon: <BarChart2 className="w-4 h-4" /> },
          { label: "HOT lift", value: "+86.1pp", icon: <Zap className="w-4 h-4" /> },
          { label: "Membership", value: "$5/yr", icon: <Users className="w-4 h-4" /> },
          { label: "License", value: "AGPL v3", icon: <Shield className="w-4 h-4" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border/60 bg-card p-4 text-center space-y-1"
            data-testid={`librarian-stat-${stat.label.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <div className="flex justify-center text-muted-foreground">
              {stat.icon}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AGPL framing */}
      <div
        className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3"
        data-testid="librarian-agpl-framing"
      >
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-base">
            The Open Architecture
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="font-semibold text-foreground">
              Solo Substrate — AGPL v3 Free
            </p>
            <p className="text-muted-foreground text-[13px] leading-relaxed">
              Install Librarian-MCP. Run it with your own data. Cathedral
              Effect, Wrasse pre-injection, Chronos signing, Herder predictions
              — every component, full-featured, no gating. Zero cost beyond
              your AI provider tokens.
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">
              Federation Library — ONE OF US ($5/year)
            </p>
            <p className="text-muted-foreground text-[13px] leading-relaxed">
              Cross-member Stone Tablets, shared Eblets, personality chips,
              cooperative Wrasse registry writes. The community is opt-in; the
              substrate is always open. Identical price for all members —
              founder to latest joiner.
            </p>
          </div>
        </div>
      </div>

      {/* Medallion gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" data-testid="librarian-gallery-heading">
            11 Medallions — One Brand, Many Doors
          </h2>
          <p className="text-sm text-muted-foreground">
            All Medallions are Librarian variants.
          </p>
        </div>
        <LibrarianMedallionGallery />
      </div>

      {/* Cross-variant nav */}
      <div
        className="rounded-xl border border-border/60 bg-card/60 p-5 space-y-3"
        data-testid="librarian-cross-variant-nav"
      >
        <p className="text-sm font-semibold text-foreground/70">
          Other doors to The Librarian:
        </p>
        <div className="flex flex-wrap gap-2">
          {CROSS_VARIANT_NAV.map(({ slug, label }) => (
            <Link
              key={slug}
              to={`/medallion/${slug}`}
              data-testid={`cross-variant-link-${slug}`}
            >
              <Badge
                variant="outline"
                className="text-[11px] hover:bg-accent cursor-pointer transition-colors px-2.5 py-0.5"
              >
                {label}
              </Badge>
            </Link>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          "More the merrier" — open-set framing. Future variants append per Founder ratification.
        </p>
      </div>

      {/* Empirical-anchor footnote (BP010 current state; updates post-COLOSSUS receipt) */}
      <div
        className="rounded-lg border border-border/40 bg-muted/30 p-4 space-y-1"
        data-testid="librarian-empirical-footnote"
      >
        <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide mb-1">
          Empirical Anchor
        </p>
        <p className="text-[11px] text-muted-foreground/70 leading-relaxed italic">
          81× compound multiplier projection per B127 algorithm L1-L5 (25.6×-50× empirical-anchored
          compound across Cathedral + SRME + Mechanical Computer + Symbiote layers); 7-12×
          cheaper-than-cold measured per KN042 Pod O receipt; ~24× velocity multiplier per BP011 Pod W
          receipt; ~360× combined Founder-time × vendor-API-spend reduction per SCALE document.
          STUPENDOUS BP012 measures actual operational compound; COLOSSUS BP015+ measures
          upgraded-substrate ceiling. Receipts published as they land.
        </p>
        <p className="text-[10px] text-muted-foreground/50">
          Touchstone R10: +86.1pp mean HOT lift · 8 models · 5 vendors · 1,200 calls · locked B112
        </p>
      </div>

      {/* Footer */}
      <div
        className="text-center text-xs text-muted-foreground/50 pb-8 space-y-1.5"
        data-testid="librarian-footer"
      >
        <p>
          Librarian.the2ndSecond.com · Liana Banyan Corporation (EIN 41-2797446) · Wyoming C-Corp
        </p>
        <p className="flex flex-wrap justify-center gap-x-2 gap-y-0.5">
          <a
            href="https://lianabanyan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors underline-offset-2 hover:underline"
          >
            ← LB Frame (lianabanyan.com)
          </a>
          <span className="text-muted-foreground/30">·</span>
          <a
            href="https://lianabanyan.com/auth"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors underline-offset-2 hover:underline"
          >
            Federation Library opt-in ($5/year)
          </a>
          <span className="text-muted-foreground/30">·</span>
          <a
            href="https://cephas.lianabanyan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors underline-offset-2 hover:underline"
          >
            Cephas docs
          </a>
          <span className="text-muted-foreground/30">·</span>
          <a
            href="https://github.com/lianabanyan/librarian-mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors underline-offset-2 hover:underline"
          >
            AGPL v3 source
          </a>
          <span className="text-muted-foreground/30">·</span>
          <a
            href="https://cephas.lianabanyan.com/patents/cooperative-defensive-pledge"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors underline-offset-2 hover:underline"
          >
            Cooperative Defensive Patent Pledge (#2260)
          </a>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// INSTALL VIEW
// ─────────────────────────────────────────────────────────

function LibrarianInstall() {
  return (
    <div
      className="space-y-8 max-w-2xl mx-auto"
      data-testid="librarian-install"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Install Librarian-MCP</h1>
        <p className="text-muted-foreground">
          AGPL v3 free. Full-version. No gating. No signup required.
        </p>
      </div>

      {/* pip install block */}
      <div
        className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 font-mono text-sm"
        data-testid="install-code-block"
      >
        <div className="flex items-center gap-2 mb-3 text-zinc-500 text-[11px]">
          <Terminal className="w-3 h-3" />
          <span>Terminal</span>
        </div>
        <p className="text-green-400">pip install librarian-mcp</p>
        <p className="text-zinc-500 mt-2"># Then configure your MCP client:</p>
        <p className="text-amber-400">
          {"{"} &quot;librarian-mcp&quot;: {"{"} &quot;command&quot;: &quot;librarian-mcp&quot; {"}"} {"}"}
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <h2 className="font-semibold">What you get (free, always):</h2>
        {[
          "Cathedral Effect context substrate — proven +86.2pp HOT lift across 5 vendors",
          "Wrasse pre-injection — context-enriches your Eblets before AI sees them",
          "Chronos signing — every action signed + append-only audit trail",
          "Herder prediction — estimates context cost before running bundles",
          "Chandelier benchmarking — L1 + L2 receipt infrastructure",
          "Detective + Pheromone index — sub-ms cross-scribe queries",
        ].map((item) => (
          <div key={item} className="flex gap-2 text-muted-foreground">
            <span className="text-green-500 flex-shrink-0">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <a
          href="https://pypi.org/project/librarian-mcp/"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="install-pypi-link"
        >
          <Button>
            <ExternalLink className="w-3 h-3 mr-1.5" />
            PyPI Package
          </Button>
        </a>
        <a
          href="https://cephas.lianabanyan.com"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="install-docs-link"
        >
          <Button variant="outline">
            <BookOpen className="w-3 h-3 mr-1.5" />
            Full Docs (Cephas)
          </Button>
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FEDERATION VIEW
// ─────────────────────────────────────────────────────────

function LibrarianFederation() {
  return (
    <div
      className="space-y-8 max-w-2xl mx-auto"
      data-testid="librarian-federation"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Federation Library — ONE OF US</h1>
        <p className="text-muted-foreground">
          $5/year. Identical price for all members, from Founder to latest joiner.
        </p>
      </div>

      <div
        className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4"
        data-testid="federation-membership-box"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-lg">ONE OF US Membership</p>
            <p className="text-sm text-muted-foreground">Annual cooperative membership</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">$5</p>
            <p className="text-xs text-muted-foreground">/year</p>
          </div>
        </div>

        <div className="grid gap-2 text-sm">
          {[
            "Cross-member Stone Tablets + shared Eblets",
            "Cooperative Wrasse registry write privileges",
            "Personality chips (federation-class context pre-loading)",
            "BRIDLE access at full-member depth",
            "AI Tuning receipts + Aviator-Symphony tuning kit",
            "Pied Piper DragonRider tier (demonstrated receipts required)",
          ].map((item) => (
            <div key={item} className="flex gap-2">
              <span className="text-primary flex-shrink-0">→</span>
              <span className="text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

        <a
          href="https://lianabanyan.com/auth"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="federation-join-link"
        >
          <Button className="w-full mt-2">
            <Users className="w-4 h-4 mr-2" />
            Be ONE OF US — $5/year
          </Button>
        </a>
      </div>

      <p className="text-xs text-muted-foreground/60 leading-relaxed">
        The substrate is always AGPL v3 free. The Federation Library is the
        cooperative layer — opt-in, identical price for all, no tiers beyond
        solo vs. federated. Cooperative Defensive Patent Pledge (#2260)
        applies to all members.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// RECEIPTS VIEW
// ─────────────────────────────────────────────────────────

function LibrarianReceipts() {
  return (
    <div
      className="space-y-6 max-w-3xl mx-auto"
      data-testid="librarian-receipts"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Empirical Receipts</h1>
        <p className="text-muted-foreground">
          Cross-vendor benchmark results. All receipts are reproducible — each
          includes a reproducibility_instructions_hash per #2326.
        </p>
      </div>

      {/* Key receipts */}
      <div className="space-y-3" data-testid="receipts-list">
        {[
          {
            id: "k499",
            label: "K499 — Cross-Vendor HOT Lift",
            result: "+86.2pp mean accuracy",
            vendors: "5 vendors · 8 models",
            commit: "K499 / B123",
            tag: "public",
          },
          {
            id: "k535",
            label: "K535 — Cost Spread Analysis",
            result: "23× cost spread · 3.5pp HOT spread tightening",
            vendors: "5 vendors",
            commit: "K535 / B132",
            tag: "public",
          },
          {
            id: "kn019",
            label: "KN019 — Chandelier L1+L2 Benchmark",
            result: "9+ L1 receipts · 6+ L2 synergy receipts",
            vendors: "Sonnet 4.6 / Opus 4.7 / Haiku 4.5",
            commit: "KN019 / BP002 (604f097)",
            tag: "public",
          },
          {
            id: "pod-x",
            label: "PAPER 004 — Magic Beans 9-Bean Test",
            result: "Scenario A: all 9 beans landed · 126 tests clean",
            vendors: "Pod G+H+I · BP002 carry-forward",
            commit: "a34a631",
            tag: "public",
          },
        ].map((receipt) => (
          <div
            key={receipt.id}
            className="rounded-lg border border-border/60 bg-card p-4 space-y-2"
            data-testid={`receipt-${receipt.id}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-sm">{receipt.label}</p>
                <p className="text-xs text-muted-foreground">{receipt.vendors}</p>
              </div>
              <Badge variant="outline" className="text-[10px] flex-shrink-0">
                {receipt.tag}
              </Badge>
            </div>
            <p className="text-sm font-mono text-primary/80">{receipt.result}</p>
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              anchor: {receipt.commit}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/50">
        All receipts pre-registered per #2298 protocol before execution.
        Reproducibility packs available in Cephas documentation.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MEDALLION DETAIL VIEW
// ─────────────────────────────────────────────────────────

function LibrarianMedallionDetail() {
  const { variant } = useParams<{ variant?: string }>();
  const resolvedVariant = isValidVariant(variant) ? variant : null;

  if (!resolvedVariant) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">11 Medallions — One Brand, Many Doors</h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            All Medallions are Librarian variants. Cathedral / Pied Piper /
            Furnace / Canon / Platform Rules / Project Rules / AI Tuning /
            Symbiote / UltraVision / Liana Banyan / Titan Librarian — one substrate, eleven doors.
          </p>
        </div>
        <LibrarianMedallionGallery />
        <div className="text-center">
          <Link to="/">
            <Button variant="outline" size="sm">← Back to Librarian Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8" data-testid={`medallion-detail-${resolvedVariant}`}>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold capitalize">
          {resolvedVariant.replace(/-/g, " ")} Medallion
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Scan the QR to stay on this page, or flip the card to explore
          the Stage-2 Demo and 5-stage LB Frame broadcast funnel.
        </p>
      </div>

      <LibrarianMedallion
        variant={resolvedVariant}
        chainWalkerEnabled={resolvedVariant === "furnace"}
      />

      <div className="flex gap-3 flex-wrap justify-center">
        <Link to="/medallion">
          <Button variant="outline" size="sm">
            All Medallions
          </Button>
        </Link>
        <Link to="/install">
          <Button size="sm">
            <Download className="w-3 h-3 mr-1.5" />
            Install Free
          </Button>
        </Link>
      </div>

      {/* Cross-variant nav */}
      <div
        className="w-full max-w-lg rounded-xl border border-border/60 bg-card/60 p-4 space-y-2 text-center"
        data-testid={`cross-variant-nav-${resolvedVariant}`}
      >
        <p className="text-xs font-semibold text-muted-foreground">
          Other doors to The Librarian:
        </p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {CROSS_VARIANT_NAV.filter((v) => v.slug !== resolvedVariant).map(({ slug, label }) => (
            <Link
              key={slug}
              to={`/medallion/${slug}`}
              data-testid={`cross-variant-link-detail-${slug}`}
            >
              <Badge
                variant="outline"
                className="text-[10px] hover:bg-accent cursor-pointer transition-colors"
              >
                {label}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ROOT COMPONENT (renders based on path)
// ─────────────────────────────────────────────────────────

/**
 * LibrarianPage — top-level export.
 * Uses useLocation to determine which view to render.
 * Should be mounted at "/" with path-based sub-routing.
 */
export default function LibrarianPage() {
  const location = useLocation();
  const path = location.pathname;

  // Determine active view
  const isMedallion = path.startsWith("/medallion");
  const isInstall = path === "/install";
  const isFederation = path === "/federation";
  const isReceipts = path === "/receipts";

  return (
    <div
      className="min-h-screen bg-background"
      data-testid="librarian-page"
    >
      <LibrarianNav showBack={isMedallion || isInstall || isFederation || isReceipts} />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {isMedallion ? (
          <LibrarianMedallionDetail />
        ) : isInstall ? (
          <LibrarianInstall />
        ) : isFederation ? (
          <LibrarianFederation />
        ) : isReceipts ? (
          <LibrarianReceipts />
        ) : (
          <LibrarianHome />
        )}
      </div>
    </div>
  );
}
