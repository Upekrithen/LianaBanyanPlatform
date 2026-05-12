/**
 * LibrarianPage — CAI ◌ NotCents Download & Information Page
 * ============================================================
 * Lives at Librarian.the2ndSecond.com
 *
 * CAI = Conducted AI (pronounced "Kay-Eye")
 * Formula: CAI = log₁₀(S × A × E)
 *   S = Speed multiplier (substrate-routed vs cold)
 *   A = Accuracy lift (HOT score delta)
 *   E = Efficiency multiplier (cost reduction)
 *
 * DEPLOYMENT HOLD: Do NOT deploy until Prov 16, 17, and 18 are filed.
 *   Prov 16: Distributed Substrate Mesh / VoIP cooperative network (in flight)
 *   Prov 17: 12-Paper Series supplementary disclosure (supplementary)
 *   Prov 18: Cooperative Mesh Network physical layer (BP024)
 *   → Remove DEPLOYMENT_HOLD flag when all three are cleared.
 *
 * Routes:
 *   /                     → CAI home + applications + architectural boundaries
 *   /medallion/:variant   → Single medallion full-page
 *   /install              → Install / AGPL v3 + packages for replication
 *   /federation           → Federation Library access (ONE OF US, $5/year)
 *   /receipts             → Cross-vendor benchmark receipts (public)
 *
 * Architecture:
 *   - Librarian.LianaBanyan.com → redirects here
 *   - Librarian.the2ndSecond.com → this page (primary CAI surface)
 *   - CAI ◌ NotCents composite brand canon (BP021 Crown-Jewel-class)
 *   - AGPL v3: solo substrate free; Federation Library = $5/yr member-only
 *
 * Tags: KN064 / BP005 (Pod Y) / BP024 (CAI page rebrand)
 */

// DEPLOYMENT_HOLD: true until Prov 16 + 17 + 18 filed. See header comment.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DEPLOYMENT_HOLD = true;

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
  Scale,
  FileText,
  Code2,
  FlaskConical,
  GraduationCap,
  Microscope,
  Lock,
  AlertCircle,
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
// APPLICATION DOMAINS — what CAI has been proven on
// ─────────────────────────────────────────────────────────

const CAI_APPLICATIONS = [
  {
    id: "legal",
    title: "Legal Document Analysis",
    icon: Scale,
    description: "Contract review, patent claim language, cooperative legal structures.",
    examples: [
      "36 Crown Letters drafted + reviewed",
      "A&A formal patent claim scaffolding (2,270 innovations)",
      "Cooperative Defensive Patent Pledge (#2260)",
    ],
    package: "librarian-mcp",
    receipt: "Wave 1 cohort / B131",
  },
  {
    id: "patent",
    title: "Patent Drafting",
    icon: FileText,
    description: "USPTO provisional and formal application scaffolding at scale.",
    examples: [
      "15 USPTO provisionals filed (Prov 1–15)",
      "2,506 formal patent claims generated",
      "Cross-provisional consistency checking",
    ],
    package: "librarian-mcp + chandelier-bench",
    receipt: "Prov 13–15 / B133 BP001",
  },
  {
    id: "medical",
    title: "Medical & Health Research",
    icon: Microscope,
    description: "Systematic literature synthesis, clinical framework scaffolding.",
    examples: [
      "Healthcare systems paper (12-Paper Save-the-World Series)",
      "Cross-study synthesis across 455+ publications",
      "Skipping Stones depth routing: Skim → Article → Full Paper",
    ],
    package: "librarian-mcp",
    receipt: "Bushel 12 / BP022",
  },
  {
    id: "academic",
    title: "Academic Paper Scaffolding",
    icon: GraduationCap,
    description: "Multi-paper series coordination, cross-citation consistency, submission prep.",
    examples: [
      "41 papers drafted across interconnected series",
      "12-Paper Save-the-World Series structured in parallel",
      "INDL-9 Geneva Sep 2026 submission pipeline",
    ],
    package: "librarian-mcp",
    receipt: "Bushel 12 / BP022",
  },
  {
    id: "code",
    title: "Code Generation & Verification",
    icon: Code2,
    description: "Autonomous multi-agent build pipelines with substrate-routed context.",
    examples: [
      "77+ consecutive Knight builds (zero --no-verify)",
      "Shadow E-Giant autonomous build fleet (Bushel 16)",
      "64-nested subagent depth-3 parallel architecture",
    ],
    package: "librarian-mcp (MCP server mode)",
    receipt: "BP021 Bushel 16 / KN042",
  },
  {
    id: "benchmark",
    title: "Cross-Vendor AI Benchmarking",
    icon: FlaskConical,
    description: "Empirical HOT-lift measurement across models and providers.",
    examples: [
      "+86.1pp mean HOT lift · 8 models · 5 vendors · 1,200 calls",
      "23× cost spread measured across providers",
      "Chandelier L1 + L2 receipt infrastructure (KN019)",
    ],
    package: "chandelier-bench (open-source, part of librarian-mcp)",
    receipt: "K499 / B123 · K535 / B132",
  },
];

// ─────────────────────────────────────────────────────────
// PACKAGES FOR REPLICATION
// ─────────────────────────────────────────────────────────

const CAI_PACKAGES = [
  {
    name: "librarian-mcp",
    install: "pip install librarian-mcp",
    description: "Full Librarian MCP server. Cathedral Effect, Wrasse, Chronos, Herder, Detective. AGPL v3.",
    license: "AGPL v3 Free",
    replicates: "All 6 application domains above",
  },
  {
    name: "chandelier-bench",
    install: "pip install librarian-mcp  # included",
    description: "Chandelier L1 + L2 benchmarking suite. Reproduce the +86.1pp HOT lift receipts.",
    license: "AGPL v3 Free",
    replicates: "Cross-vendor AI benchmarking",
  },
  {
    name: "pheromone-substrate",
    install: "# Bundled in librarian-mcp",
    description: "Append-only JSONL pheromone substrate + Wrasse pre-injection router. Core knowledge store.",
    license: "AGPL v3 Free",
    replicates: "Substrate-routed memory (all domains)",
  },
];

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
          CAI ◌ NotCents
        </Link>
        <span className="text-muted-foreground/40 text-xs">·</span>
        <Badge variant="outline" className="text-[10px]">
          Conducted AI
        </Badge>
        <Badge variant="outline" className="text-[10px] text-green-600 border-green-600/40">
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
    <div className="space-y-14" data-testid="librarian-home">

      {/* Hero — CAI ◌ NotCents */}
      <div
        className="text-center space-y-5 py-14"
        data-testid="librarian-hero"
      >
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold border"
              style={{ background: "#0a0a0a", color: "#22d3ee", borderColor: "rgba(34,211,238,0.4)" }}
            >
              CAI
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Conducted AI · Unparalleled accuracy, speed, with diminished cost
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            CAI ◌ NotCents.{" "}
            <span className="text-primary">It's HOW You Use It.</span>
          </h1>
          <div
            className="inline-block mx-auto rounded-lg px-4 py-2 font-mono text-sm border"
            style={{ background: "#0a0a0a", color: "#22d3ee", borderColor: "rgba(34,211,238,0.3)" }}
          >
            CAI = log₁₀(S × A × E)
            <span className="text-zinc-500 ml-3 text-xs">Speed · Accuracy · Efficiency</span>
          </div>
        </div>

        <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Conducted AI is not a model. It's an architecture. Route knowledge before the model sees the
          question — proven +86.1pp HOT lift across 5 vendors, 8 models, 1,200 calls.
          AGPL v3 free. Federation Library unlocks with{" "}
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
          <Link to="/receipts">
            <Button size="lg" variant="outline" data-testid="hero-receipts-btn">
              <BarChart2 className="w-4 h-4 mr-2" />
              See the Receipts
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

      {/* Application Domains */}
      <div className="space-y-5" data-testid="cai-applications">
        <div>
          <h2 className="text-xl font-bold">Proven Applications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Each domain below has been run on the CAI architecture with published receipts.
            Packages for replication are listed under{" "}
            <Link to="/install" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Install
            </Link>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAI_APPLICATIONS.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                className="rounded-lg border border-border/60 bg-card p-4 space-y-3"
                data-testid={`cai-app-${app.id}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{app.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {app.description}
                </p>
                <ul className="space-y-1">
                  {app.examples.map((ex, i) => (
                    <li key={i} className="flex gap-1.5 text-[11px] text-muted-foreground/80">
                      <span className="text-green-500 flex-shrink-0 mt-0.5">·</span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-1 border-t border-border/40 space-y-0.5">
                  <p className="text-[10px] text-muted-foreground/60 font-mono">
                    pkg: {app.package}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50">
                    receipt: {app.receipt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architectural Boundaries — why mining/hacking is impossible */}
      <div
        className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-4"
        data-testid="cai-architectural-boundaries"
      >
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-bold text-base">
              What CAI Cannot Do — By Architecture, Not Policy
            </h2>
            <p className="text-sm text-muted-foreground">
              This is not a terms-of-service restriction. The architecture does not contain the
              components required for these use cases. The AGPL v3 source is auditable to confirm.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="font-semibold text-sm">Cryptocurrency Mining — Architecturally Impossible</p>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed pl-6">
              Mining requires a tight compute loop executing SHA-256 or equivalent hashing billions
              of times per second, typically on GPU pipelines. The CAI architecture has no such loop.
            </p>
            <ul className="pl-6 space-y-1">
              {[
                "Arm A routes to external AI model APIs — it does not compute hashes",
                "Arm B reads from append-only JSONL files — it is a read layer, not a compute engine",
                "Wrasse pre-injection enriches text context — there is no GPU pipeline",
                "No proof-of-work mechanism exists anywhere in the substrate",
              ].map((item, i) => (
                <li key={i} className="text-[11px] text-muted-foreground/70 flex gap-1.5">
                  <span className="text-red-400/60 flex-shrink-0">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="font-semibold text-sm">Network Intrusion / Hacking — Architecturally Impossible</p>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed pl-6">
              Intrusion requires network scanners, exploit delivery, credential interception,
              and C2 channels. None of these exist in the CAI architecture.
            </p>
            <ul className="pl-6 space-y-1">
              {[
                "Outbound calls: AI model APIs only (OpenAI, Anthropic, Google, etc.)",
                "No network scanner, port prober, or exploit framework",
                "No shellcode generation, no arbitrary code execution against external targets",
                "No credential harvesting pipeline — the substrate stores knowledge, not secrets",
              ].map((item, i) => (
                <li key={i} className="text-[11px] text-muted-foreground/70 flex gap-1.5">
                  <span className="text-red-400/60 flex-shrink-0">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/50 border-t border-border/30 pt-3">
          CAI conducts knowledge routing between your AI model calls and an append-only substrate.
          The architecture is a knowledge layer, not a compute farm or network tool.
          Full source: AGPL v3 on GitHub. Audit it.
        </p>
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
            All Medallions are CAI variants.
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
          Other doors to CAI:
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

      {/* Empirical-anchor footnote */}
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
          CAI ◌ NotCents · Librarian.the2ndSecond.com · Liana Banyan Corporation (EIN [REDACTED-PRIVATE]) · C-Corp
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
      className="space-y-10 max-w-2xl mx-auto"
      data-testid="librarian-install"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Install CAI — Packages for Replication</h1>
        <p className="text-muted-foreground">
          AGPL v3 free. Full-version. No gating. No signup required.
          Every application domain above is reproducible with these packages.
        </p>
      </div>

      {/* Packages */}
      <div className="space-y-4" data-testid="cai-packages">
        {CAI_PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            className="rounded-lg border border-border/60 bg-card p-5 space-y-3"
            data-testid={`package-${pkg.name}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold font-mono text-sm">{pkg.name}</h2>
              <Badge variant="outline" className="text-[10px] text-green-600 border-green-600/40">
                {pkg.license}
              </Badge>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {pkg.description}
            </p>
            <div
              className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 font-mono text-sm"
              data-testid={`install-cmd-${pkg.name}`}
            >
              <div className="flex items-center gap-2 mb-2 text-zinc-500 text-[10px]">
                <Terminal className="w-3 h-3" />
                <span>Terminal</span>
              </div>
              <p className="text-green-400 text-[12px]">{pkg.install}</p>
            </div>
            <p className="text-[11px] text-muted-foreground/60">
              Replicates: {pkg.replicates}
            </p>
          </div>
        ))}
      </div>

      {/* MCP config block */}
      <div className="space-y-3">
        <h2 className="font-semibold text-sm">Configure your MCP client:</h2>
        <div
          className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 font-mono text-sm"
          data-testid="install-mcp-config"
        >
          <div className="flex items-center gap-2 mb-3 text-zinc-500 text-[11px]">
            <Terminal className="w-3 h-3" />
            <span>mcp_config.json</span>
          </div>
          <p className="text-zinc-300 text-[12px]">
            {"{"} &quot;librarian-mcp&quot;: {"{"} &quot;command&quot;: &quot;librarian-mcp&quot; {"}"} {"}"}
          </p>
        </div>
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
            All Medallions are CAI variants. Cathedral / Pied Piper /
            Furnace / Canon / Platform Rules / Project Rules / AI Tuning /
            Symbiote / UltraVision / Liana Banyan / Titan Librarian — one substrate, eleven doors.
          </p>
        </div>
        <LibrarianMedallionGallery />
        <div className="text-center">
          <Link to="/">
            <Button variant="outline" size="sm">← Back to CAI Home</Button>
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

      <div
        className="w-full max-w-lg rounded-xl border border-border/60 bg-card/60 p-4 space-y-2 text-center"
        data-testid={`cross-variant-nav-${resolvedVariant}`}
      >
        <p className="text-xs font-semibold text-muted-foreground">
          Other doors to CAI:
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
// ROOT COMPONENT
// ─────────────────────────────────────────────────────────

export default function LibrarianPage() {
  const location = useLocation();
  const path = location.pathname;

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
