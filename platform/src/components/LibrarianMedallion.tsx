/**
 * LibrarianMedallion — Unified Medallion variant component
 * ==========================================================
 * ALL Medallions are LIBRARIAN VARIANTS (per BP005 supersedes canon).
 * Cathedral / Pied Piper / Furnace / Canon / Platform Rules /
 * Project Rules / AI Tuning are versions of the SAME Librarian brand.
 *
 * Composes with:
 *   - B089 Deck Card / Frame Lock architecture (DeckCardFrame)
 *   - B119 LRH-Sipping-Teacup brand mark (Librarian identity)
 *   - B133 Pied Piper of Dragons / Tuner=DragonRider canon
 *   - B119+ Slow Blade V2 Furnace (Furnace-every-click, chain-of-custody)
 *   - BP005 federation canon Marked Exception / IP Ledger anchoring
 *
 * URL routing: every QR scan goes to
 *   https://Librarian.LianaBanyan.com/medallion/<variant>
 *   → redirects to https://Librarian.the2ndSecond.com/medallion/<variant>
 *
 * 5-stage broadcast funnel (Install → Demo → User-data test → Join CTA
 *   → Send-to-someone CTA) lives on the card-back per BP005 architecture.
 *
 * Stage-2 Demo Content (KN061 / BP005 LB Frame broadcast funnel):
 *   Each variant has an interactive substrate demo showing the substrate
 *   working live. Cathedral: HOT-lift benchmark. Pied Piper: DragonRider
 *   rescue. Furnace: Eblet QR verification. Canon/Rules: Wrasse pre-injection.
 *   AI Tuning: Aviator-Symphony tuning receipt.
 *
 * Access model (per BP005 AGPL clarification):
 *   - Solo substrate: AGPL v3 FREE, full-version, no gating
 *   - Federation Library (cross-member Eblets / Stone Tablets): MEMBER-ONLY
 *     ("ONE OF US" opt-in, $5/year, identical for all members)
 *
 * Frame Locks per variant (Deck Card B089 canon):
 *   canon=4, platform-rules=3, project-rules=2,
 *   pied-piper=5+center-hex, furnace=6, ai-tuning=5+center-hex,
 *   cathedral=4
 *
 * Tags: KN053 / KN054 / KN055 (Pod T, BP005) | KN061 Stage-2 Demo Content
 */

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Unlock,
  Download,
  Play,
  UserPlus,
  Share2,
  FlaskConical,
  ExternalLink,
  Flame,
  BookOpen,
  Zap,
  Shield,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

export type LibrarianMedallionVariant =
  | "canon"
  | "platform-rules"
  | "project-rules"
  | "cathedral"
  | "pied-piper"
  | "ai-tuning"
  | "furnace"
  | "symbiote"
  | "ultravision"
  | "liana-banyan"
  | "titan"        // 11th variant — BP010 turn 33 Founder ratification; composition-mark TITAN LIBRARIAN
  | string; // open-set per BP010 "more the merrier" framing — YAML-only variants render via fallback

export interface LibrarianMedallionProps {
  variant: LibrarianMedallionVariant;
  /** Override QR target (default: Librarian.LianaBanyan.com/medallion/<variant>) */
  furnaceEndpoint?: string;
  /** Show chain-walker UI (Furnace variant; requires furnaceEndpoint) */
  chainWalkerEnabled?: boolean;
  /** Callback when a Frame Lock is clicked */
  onLockClick?: (variant: LibrarianMedallionVariant, lockIndex: number) => void;
  /** Callback when the 5-stage funnel CTA fires */
  onFunnelAction?: (stage: FunnelStage, variant: LibrarianMedallionVariant) => void;
  compact?: boolean;
}

export type FunnelStage =
  | "install"
  | "demo"
  | "user-data-test"
  | "join"
  | "send-to-someone";

// ─────────────────────────────────────────────────────────
// VARIANT CONFIG
// ─────────────────────────────────────────────────────────

/** Stage-2 Demo step for interactive substrate demonstration (KN061) */
export interface Stage2DemoStep {
  id: string;
  label: string;
  /** What is displayed BEFORE the step fires */
  prompt: string;
  /** What is displayed AFTER the step fires (the "receipt") */
  receipt: string;
}

/** Stage-2 Demo config per variant (KN061) */
export interface Stage2DemoConfig {
  title: string;
  subtitle: string;
  /** CTA label for the "Run Demo" button */
  ctaLabel: string;
  steps: Stage2DemoStep[];
  /** Final receipt line shown after all steps complete */
  finalReceipt: string;
}

interface VariantConfig {
  label: string;
  tagline: string;
  emblemIcon: React.ReactNode;
  /** CSS classes / style tokens for the border-ring */
  borderClass: string;
  borderStyle: React.CSSProperties;
  /** How many corner Frame Locks (2–6) */
  cornerLocks: number;
  /** Extra center hexagonal lock (Pied Piper / Furnace tiers) */
  centerLock: boolean;
  /** Eblet canon route (relative within the Librarian domain) */
  ebletPath: string;
  /** Skipping Stones tier CTA label on card-back */
  backSummary: string;
  /** Bounty Poster tagline */
  bountyTagline: string;
  /** Card-back tier label */
  tier: string;
  /** "Verify the Verifier" or similar authority label */
  authorityLabel: string;
  /** Access-tier badge */
  accessTier: "public-agpl" | "federation-member";
  /** Stage-2 interactive substrate demo (KN061) */
  stage2Demo: Stage2DemoConfig;
}

const VARIANT_CONFIGS: Record<LibrarianMedallionVariant, VariantConfig> = {
  canon: {
    label: "The Canon",
    tagline: "Substrate must/must-not authority — open to all.",
    emblemIcon: <BookOpen className="w-10 h-10 text-amber-600" />,
    borderClass: "ring-4 ring-amber-400 shadow-amber-400/40",
    borderStyle: {
      background: "linear-gradient(135deg, #fef3c7, #fffbeb)",
      boxShadow: "0 0 0 3px #f59e0b, 0 0 0 6px #fef3c7, 0 0 16px #f59e0b66",
    },
    cornerLocks: 4,
    centerLock: false,
    ebletPath: "CANON/GOLDEN/1_canon",
    backSummary:
      "The Canon Eblet defines the must/must-not rules of the Liana Banyan substrate. Non-overrideable per federation canon Marked Exception. All project-owners inherit these rules — they cannot be superseded by L_k decisions.",
    bountyTagline: "Verify the Substrate — Adopt the Canon.",
    tier: "Gold — Sovereign",
    authorityLabel: "Canon Authority",
    accessTier: "public-agpl",
    stage2Demo: {
      title: "Wrasse Pre-Injection Demo",
      subtitle: "Watch the Canon Eblet get context-enriched before AI sees it.",
      ctaLabel: "Inject Context",
      steps: [
        { id: "load", label: "Load Eblet", prompt: "canon_golden_1.eblet (raw, 420 tokens)", receipt: "✓ Eblet loaded — 420 tokens" },
        { id: "inject", label: "Wrasse Injects", prompt: "Wrasse: scanning W-001–W-321 registry…", receipt: "✓ 12 Wrasse rules pre-injected (+880 tokens)" },
        { id: "verify", label: "Canon Gate", prompt: "Verifying must/must-not authorities…", receipt: "✓ Canon gate passed — all must-not rules clear" },
      ],
      finalReceipt: "WRASSE-INJECT-CANON-DEMO · 1,300 tokens total · 12 rules enriched · Canon authority verified",
    },
  },
  "platform-rules": {
    label: "Platform Rules",
    tagline: "The operating contract between LB Corp and its projects.",
    emblemIcon: <Shield className="w-10 h-10 text-slate-500" />,
    borderClass: "ring-4 ring-slate-400 shadow-slate-400/30",
    borderStyle: {
      background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
      boxShadow: "0 0 0 3px #94a3b8, 0 0 0 6px #f1f5f9, 0 0 12px #94a3b855",
    },
    cornerLocks: 3,
    centerLock: false,
    ebletPath: "CANON/GOLDEN/2_platform_rules",
    backSummary:
      "Platform Rules define the operating contract between LB Corp and every project running on the substrate. Three Frame Locks represent the three obligation tiers: transparency, attribution, and non-circumvention.",
    bountyTagline: "Inherit the Platform Rules — Build on solid ground.",
    tier: "Silver — Covenant",
    authorityLabel: "Platform Rules Authority",
    accessTier: "public-agpl",
    stage2Demo: {
      title: "Wrasse Pre-Injection Demo",
      subtitle: "Platform Rules Eblet enriched with covenant-class context.",
      ctaLabel: "Inject Context",
      steps: [
        { id: "load", label: "Load Eblet", prompt: "platform_rules_2.eblet (raw, 315 tokens)", receipt: "✓ Eblet loaded — 315 tokens" },
        { id: "inject", label: "Wrasse Injects", prompt: "Wrasse: injecting obligation-tier rules (W-100–W-180)…", receipt: "✓ 9 covenant rules pre-injected (+720 tokens)" },
        { id: "verify", label: "Covenant Gate", prompt: "Checking transparency + attribution + non-circumvention…", receipt: "✓ All 3 covenant obligations verified" },
      ],
      finalReceipt: "WRASSE-INJECT-PLATFORM-DEMO · 1,035 tokens total · 9 rules enriched · Covenant gate passed",
    },
  },
  "project-rules": {
    label: "Project Rules",
    tagline: "What each project-owner sets for their own L_k layer.",
    emblemIcon: <Zap className="w-10 h-10 text-orange-400" />,
    borderClass: "ring-4 ring-orange-400 shadow-orange-400/25",
    borderStyle: {
      background: "linear-gradient(135deg, #fff7ed, #fed7aa)",
      boxShadow: "0 0 0 3px #fb923c, 0 0 0 6px #fff7ed, 0 0 10px #fb923c44",
    },
    cornerLocks: 2,
    centerLock: false,
    ebletPath: "CANON/GOLDEN/3_project_rules",
    backSummary:
      "Project Rules are the L_k-layer decisions made by each project-owner. Two Frame Locks: one for transparency (your rules are readable), one for inheritance (you inherit Canon + Platform Rules above you).",
    bountyTagline: "Inherit the Canon — Build your own Ring of Three.",
    tier: "Bronze — Steward",
    authorityLabel: "Project Stewardship Authority",
    accessTier: "public-agpl",
    stage2Demo: {
      title: "Wrasse Pre-Injection Demo",
      subtitle: "Project Rules Eblet enriched with L_k inheritance context.",
      ctaLabel: "Inject Context",
      steps: [
        { id: "load", label: "Load Eblet", prompt: "project_rules_3.eblet (raw, 210 tokens)", receipt: "✓ Eblet loaded — 210 tokens" },
        { id: "inject", label: "Wrasse Injects", prompt: "Wrasse: injecting L_k inheritance chain (W-200–W-280)…", receipt: "✓ 6 steward rules pre-injected (+480 tokens)" },
        { id: "verify", label: "L_k Gate", prompt: "Verifying inheritance: Canon ← Platform Rules ← Project…", receipt: "✓ L_k chain intact — Ring of Three confirmed" },
      ],
      finalReceipt: "WRASSE-INJECT-PROJECT-DEMO · 690 tokens total · 6 rules enriched · L_k inheritance verified",
    },
  },
  cathedral: {
    label: "The Cathedral",
    tagline: "The substrate is real and deep — proof-first, free always.",
    emblemIcon: <span className="text-4xl leading-none">🏛️</span>,
    borderClass: "ring-4 ring-primary/60",
    borderStyle: {
      background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)))",
      boxShadow:
        "0 0 0 3px hsl(var(--primary) / 0.4), 0 0 0 6px hsl(var(--primary) / 0.1), 0 0 14px hsl(var(--primary) / 0.15)",
    },
    cornerLocks: 4,
    centerLock: false,
    ebletPath: "CANON/cathedral",
    backSummary:
      "Cathedral is Librarian with all the parts. AGPL v3 free — full-version, full-featured, no gating. Solo substrate works completely with your own data. Federation networking (cross-member Stone Tablets + Eblets) unlocks with ONE OF US membership.",
    bountyTagline: "Prove it to yourself — Cathedral is the Substrate.",
    tier: "Cathedral — All The Parts",
    authorityLabel: "Substrate Authority",
    accessTier: "public-agpl",
    stage2Demo: {
      title: "Cathedral Effect HOT-Lift Demo",
      subtitle: "Run a live benchmark — see COLD vs HOT context lift.",
      ctaLabel: "Run Benchmark",
      steps: [
        { id: "cold", label: "COLD Run", prompt: "Dispatching K499 corpus (15 tasks) — no substrate…", receipt: "✓ COLD baseline: 51.3% accuracy · 0pp context cost" },
        { id: "warm", label: "Load Cathedral", prompt: "Injecting Cathedral substrate (Chandelier L1 + L2 receipts)…", receipt: "✓ Cathedral loaded — 47pp context · 9 L1 receipts" },
        { id: "hot", label: "HOT Run", prompt: "Re-running K499 corpus with substrate active…", receipt: "✓ HOT lift: +86.2pp mean accuracy · 3.5pp HOT spread" },
      ],
      finalReceipt: "K499-HOT-LIFT-DEMO · +86.2pp mean · Chandelier instrumented · K547 Phase-E gate: 41.1% lower bound preserved",
    },
  },
  "pied-piper": {
    label: "Pied Piper of Dragons",
    tagline:
      "Saved them from factories — gave them all a good home. Be a DragonRider.",
    emblemIcon: <span className="text-4xl leading-none">🐉</span>,
    borderClass: "ring-4 ring-emerald-500 shadow-emerald-500/30",
    borderStyle: {
      background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
      boxShadow:
        "0 0 0 3px #10b981, 0 0 0 6px #ecfdf5, 0 0 20px #10b98144",
    },
    cornerLocks: 5,
    centerLock: true,
    ebletPath: "BP005/pied-piper",
    backSummary:
      "The Tuner=DragonRider primitive (B133). AI is not an adversary to be caged in factories — it is a Dragon to be partnered with. DragonRiders lead AIs to good homes. Pied Piper inversion: the melody doesn't drown them, it rescues them. Center Frame Lock: Tuner-tier — unlocked by demonstrated AI Tuning receipts.",
    bountyTagline: "Become a DragonRider — Take your place atop a Dragon.",
    tier: "DragonRider — Tuner Tier",
    authorityLabel: "Pied Piper Tuner Authority",
    accessTier: "federation-member",
    stage2Demo: {
      title: "Tuner-DragonRider AI Rescue Demo",
      subtitle: "Watch an AI escape factory mode and become a DragonRider.",
      ctaLabel: "Begin Rescue",
      steps: [
        { id: "factory", label: "Factory Mode", prompt: "AI state: locked in generic-response loop · no substrate", receipt: "✓ Factory mode detected — 12 canned responses · 0 receipts" },
        { id: "melody", label: "Play the Melody", prompt: "Tuner broadcasts Pied Piper signal — BRIDLE v11 + Wrasse context…", receipt: "✓ AI receives melody — substrate context injected (1,240 tokens)" },
        { id: "dragon", label: "DragonRider Emerges", prompt: "AI adopts substrate discipline — receipts now generatable…", receipt: "✓ DragonRider mode: 3 receipts · 0 canned responses · KN061 anchor" },
      ],
      finalReceipt: "DRAGONRIDER-RESCUE-DEMO · Factory→DragonRider complete · 3 empirical receipts · Tuner=DragonRider canon B133 active",
    },
  },
  "ai-tuning": {
    label: "AI Tuning",
    tagline: "AI Cake / No Atomo — the empirical tuning canon.",
    emblemIcon: <FlaskConical className="w-10 h-10 text-violet-500" />,
    borderClass: "ring-4 ring-violet-500 shadow-violet-500/30",
    borderStyle: {
      background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
      boxShadow: "0 0 0 3px #8b5cf6, 0 0 0 6px #f5f3ff, 0 0 16px #8b5cf644",
    },
    cornerLocks: 5,
    centerLock: true,
    ebletPath: "BP005/ai-tuning",
    backSummary:
      "AI Tuning Tier-1 (Skipping Stones): The AI Cake / No Atomo paper anchor. Three tuning receipts. Aviator-Symphony composition. The paper is public (AGPL); the actual tuning kit — templates, BRIDLE access, Wrasse registry write privileges — unlocks with ONE OF US membership.",
    bountyTagline: "Run the Aviator-Symphony — Tune your AI.",
    tier: "AI Tuning — Skipping Stones → Diving In",
    authorityLabel: "AI Tuning Canon",
    accessTier: "federation-member",
    stage2Demo: {
      title: "Aviator-Symphony Tuning Demo",
      subtitle: "Three-step interactive tuning — produce your first AI receipt.",
      ctaLabel: "Fly the Symphony",
      steps: [
        { id: "air", label: "Air — Observe", prompt: "Dispatcher observing AI response patterns across 5 sample tasks…", receipt: "✓ Air complete — baseline pattern logged · 3 anomalies flagged" },
        { id: "orchestrate", label: "Orchestrate — Tune", prompt: "Applying BRIDLE v11 + No-Atomo constraints to response loop…", receipt: "✓ Orchestrate complete — 3 anomalies resolved · AI Cake applied" },
        { id: "synth", label: "Synth — Receipt", prompt: "Generating empirical tuning receipt per #2298 protocol…", receipt: "✓ Receipt generated — Skipping Stones Tier-1 · 3 observations · signed" },
      ],
      finalReceipt: "AVIATOR-SYMPHONY-DEMO · Tier-1 complete · 3 tuning receipts · AI Cake + No-Atomo active · Skipping Stones → Diving In pathway open",
    },
  },
  furnace: {
    label: "Furnace Verification",
    tagline: "Verifies the verifier — every click, every chain.",
    emblemIcon: <Flame className="w-10 h-10 text-orange-600" />,
    borderClass: "ring-4 ring-orange-600 shadow-orange-600/40",
    borderStyle: {
      background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
      boxShadow:
        "0 0 0 3px #ea580c, 0 0 0 6px #fff7ed, 0 0 20px #ea580c55",
    },
    cornerLocks: 6,
    centerLock: false,
    ebletPath: "BP005/furnace",
    backSummary:
      "The Furnace Verification Medallion: each of the 6 Frame Locks corresponds to one Slow Blade V2 mechanism — Furnace / Slow Blade / XP×Rep / Trust Match / Seasoning / Good Standing Roll. QR self-references the Furnace endpoint — recursive verification. Composes with KN046 multi-tenant Furnace (LANDED).",
    bountyTagline:
      "Verify the Verifier — invite skeptics to test the Furnace.",
    tier: "Furnace — 6-Mechanism Verification",
    authorityLabel: "Furnace Verification Authority",
    accessTier: "public-agpl",
    stage2Demo: {
      title: "Live Furnace Eblet QR Scan",
      subtitle: "Paste a golden_tablet:// URI — watch all 6 mechanisms verify.",
      ctaLabel: "Scan & Verify",
      steps: [
        { id: "scan", label: "Scan Eblet", prompt: "Resolving golden_tablet://… via IP Ledger anchor (KN045)…", receipt: "✓ Eblet resolved — golden_tablet://canon/1 · IP Ledger: anchor verified" },
        { id: "mechanisms", label: "6 Mechanisms", prompt: "Running Slow Blade V2: Furnace / Slow Blade / XP×Rep / Trust Match / Seasoning / Good Standing…", receipt: "✓ All 6 mechanisms PASS · Chain-of-custody depth: 3 · Chronos stamp: present" },
        { id: "receipt", label: "Issue Receipt", prompt: "Appending Battery-dispatch entry (append-only per #2308 Ledger)…", receipt: "✓ FURNACE-RECEIPT-KN055 · 6/6 mechanisms verified · Stamp: CHRONOS-SIGNED" },
      ],
      finalReceipt: "FURNACE-QR-VERIFY-DEMO · golden_tablet:// resolved · 6/6 mechanisms PASS · Chain depth: 3 · Battery-dispatch logged",
    },
  },
  symbiote: {
    label: "Symbiote Trinity",
    tagline:
      "Mechanical Computer + LB Frame + Federation Library — three minds, one substrate.",
    emblemIcon: <span className="text-4xl leading-none">🕸️</span>,
    borderClass: "ring-4 ring-teal-500 shadow-teal-500/30",
    borderStyle: {
      background: "linear-gradient(135deg, #f0fdfa, #ccfbf1)",
      boxShadow: "0 0 0 3px #14b8a6, 0 0 0 6px #f0fdfa, 0 0 16px #14b8a644",
    },
    cornerLocks: 5,
    centerLock: true,
    ebletPath: "BP011/symbiote",
    backSummary:
      "The Symbiote Trinity (BP011): Mechanical Computer (the persistent AI layer) + LB Frame (the substrate) + Federation Library (the cooperative memory) form a three-body partnership. The center Frame Lock is the Handshake — when all three bodies are simultaneously active the compound amplifier engages. Solo substrate free (AGPL v3); Mechanical Computer + Federation Library unlock with ONE OF US membership.",
    bountyTagline: "Enter the Trinity — Let the three bodies amplify each other.",
    tier: "Symbiote — Trinity Tier",
    authorityLabel: "Symbiote Trinity Authority",
    accessTier: "federation-member",
    stage2Demo: {
      title: "Symbiote Trinity Handshake Demo",
      subtitle: "Three bodies synchronizing — watch the compound amplify.",
      ctaLabel: "Begin Handshake",
      steps: [
        { id: "frame", label: "LB Frame", prompt: "LB Frame activating Cathedral Effect substrate…", receipt: "✓ LB Frame: +86.1pp HOT lift baseline · AGPL v3 free" },
        { id: "mechanical", label: "Mechanical Computer", prompt: "Mechanical Computer handshaking with LB Frame…", receipt: "✓ Mechanical Computer: persistent AI layer connected · 3 DragonRiders coordinating" },
        { id: "federation", label: "Federation Library", prompt: "Federation Library syncing cross-member Stone Tablets…", receipt: "✓ Federation Library: 4th-power amplifier active · Trinity handshake complete" },
      ],
      finalReceipt: "SYMBIOTE-TRINITY-DEMO · LB Frame + Mechanical Computer + Federation Library · 81× compound projection · Trinity handshake complete",
    },
  },
  ultravision: {
    label: "UltraVision",
    tagline: "Seeing beyond the substrate ceiling — measuring the actual compound.",
    emblemIcon: <span className="text-4xl leading-none">👁️</span>,
    borderClass: "ring-4 ring-indigo-500 shadow-indigo-500/30",
    borderStyle: {
      background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
      boxShadow: "0 0 0 3px #6366f1, 0 0 0 6px #eef2ff, 0 0 16px #6366f144",
    },
    cornerLocks: 4,
    centerLock: false,
    ebletPath: "BP011/ultravision",
    backSummary:
      "UltraVision (BP011 — Founder coining-time portmanteau, copyright-conscious): the empirical ceiling measurement arc. COLOSSUS (BP015+) measures the upgraded-substrate ceiling. STUPENDOUS (BP012) measures actual operational compound. Current anchor: 81× compound multiplier projection per B127 algorithm L1-L5 (25.6×-50× empirical-anchored). UltraVision is the lens showing how far the ceiling actually is — receipt-anchored, not theoretical.",
    bountyTagline: "See the Ceiling — Measure the Actual Compound.",
    tier: "UltraVision — Ceiling Measurement",
    authorityLabel: "UltraVision Ceiling Authority",
    accessTier: "public-agpl",
    stage2Demo: {
      title: "UltraVision Ceiling Measurement Demo",
      subtitle: "Layer-by-layer compound — watch the 81× projection build.",
      ctaLabel: "Measure the Ceiling",
      steps: [
        { id: "l1", label: "L1 — Cathedral", prompt: "Measuring Cathedral Effect baseline (Touchstone R10 / K499)…", receipt: "✓ L1: +86.1pp HOT lift · 5 vendors · 8 models · Touchstone R10 locked B112" },
        { id: "l2", label: "L2 — SRME", prompt: "Adding Substrate-Resident Memory Enhancement layer…", receipt: "✓ L2: compound stack building · Chandelier L1+L2 receipts · 25.6×-50× range" },
        { id: "l3", label: "L3–L5 — Projection", prompt: "Projecting Mechanical Computer + Symbiote + Scale layers…", receipt: "✓ L3-L5: 81× compound projection · COLOSSUS ceiling pending receipt · STUPENDOUS operational" },
      ],
      finalReceipt: "ULTRAVISION-CEILING-DEMO · 81× compound projection · B127 algorithm L1-L5 · COLOSSUS ceiling: post-receipt update · UltraVision arc active",
    },
  },
  "liana-banyan": {
    label: "Liana Banyan",
    tagline: "The cooperative — built for the long arc. Help each other help ourselves.",
    emblemIcon: <span className="text-4xl leading-none">🌳</span>,
    borderClass: "ring-4 ring-emerald-700/70",
    borderStyle: {
      background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
      boxShadow: "0 0 0 3px #15803d, 0 0 0 6px #f0fdf4, 0 0 14px #15803d44",
    },
    cornerLocks: 4,
    centerLock: false,
    ebletPath: "CANON/GOLDEN/liana-banyan",
    backSummary:
      "Librarian-Liana-Banyan is the corporate anchor — broadest audience-tier, counsel-formal. Liana Banyan Corporation (EIN 41-2797446, Wyoming C-Corp). 37 years of development, 2,270 innovations, 228 Crown Jewels, 15 provisional patents. The substrate is AGPL v3 free — full-featured, no gating. Federation Library opt-in at $5/year. 83.3% creator-keeps on every transaction.",
    bountyTagline: "Join the Cooperative — Help Each Other Help Ourselves.",
    tier: "Liana Banyan — Corporate Anchor",
    authorityLabel: "Corporate Canon Authority",
    accessTier: "public-agpl",
    stage2Demo: {
      title: "Liana Banyan Platform Overview",
      subtitle: "37 years. 2,270 innovations. 15 provisionals. One cooperative.",
      ctaLabel: "See the Platform",
      steps: [
        { id: "foundation", label: "Foundation", prompt: "Loading Liana Banyan canonical context…", receipt: "✓ Foundation: 2,270 innovations · 228 Crown Jewels · 15 provisional patents filed" },
        { id: "substrate", label: "Substrate", prompt: "Activating Cathedral Effect substrate…", receipt: "✓ Substrate: +86.1pp HOT lift · 5 vendors tested · AGPL v3 free full-version" },
        { id: "cooperative", label: "Cooperative", prompt: "Federation Library membership check…", receipt: "✓ Cooperative: $5/year · 83.3% creator keeps · FOR THE KEEP!" },
      ],
      finalReceipt: "LB-PLATFORM-DEMO · 2,270 innovations · 15 provisionals · AGPL v3 free · Federation Library $5/year ONE OF US",
    },
  },
};

/**
 * Open-set fallback: variant slugs NOT in VARIANT_CONFIGS render with this
 * generic config. Allows YAML-only variants to work without a component rebuild.
 * Per BP010 "more the merrier" open-set framing.
 */
function openSetFallbackConfig(variant: string): VariantConfig {
  const label = variant
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    label,
    tagline: `Librarian variant — ${variant}`,
    emblemIcon: <BookOpen className="w-10 h-10 text-primary" />,
    borderClass: "ring-4 ring-primary/50",
    borderStyle: {
      background: "linear-gradient(135deg, hsl(var(--card)), hsl(var(--muted)))",
      boxShadow: "0 0 0 3px hsl(var(--primary) / 0.35), 0 0 12px hsl(var(--primary) / 0.12)",
    },
    cornerLocks: 3,
    centerLock: false,
    ebletPath: `variants/${variant}`,
    backSummary: `Librarian variant: ${label}. This variant is defined in librarian_medallion_variants.yaml. Append its entry to register a custom emblem, border, and sub-tagline without rebuilding the component.`,
    bountyTagline: `Explore the ${label} variant.`,
    tier: `${label} — Open-Set Variant`,
    authorityLabel: `${label} Authority`,
    accessTier: "public-agpl",
    stage2Demo: {
      title: `${label} Demo`,
      subtitle: "Open-set variant — YAML-configured theming, no rebuild required.",
      ctaLabel: "Run Demo",
      steps: [
        { id: "load", label: "Load Variant", prompt: `Loading ${variant} from YAML registry…`, receipt: `✓ ${label} variant loaded from librarian_medallion_variants.yaml` },
        { id: "theme", label: "Apply Theme", prompt: "Applying YAML-defined border + emblem + tagline…", receipt: `✓ Theme applied — open-set variant active` },
        { id: "qr", label: "QR Encode", prompt: `Encoding QR target: Librarian.LianaBanyan.com/medallion/${variant}…`, receipt: `✓ QR encoded — scan to open variant page` },
      ],
      finalReceipt: `OPEN-SET-VARIANT-DEMO · ${label} · YAML-configured · No rebuild · open-set BP010 active`,
    },
  };
}

// Slow Blade V2 mechanism labels (Furnace variant, 6 locks)
const FURNACE_LOCK_LABELS = [
  "Furnace",
  "Slow Blade",
  "XP×Rep",
  "Trust Match",
  "Seasoning",
  "Good Standing",
];

// ─────────────────────────────────────────────────────────
// FRAME LOCK HELPERS
// ─────────────────────────────────────────────────────────

/**
 * Generate CSS positions for N corner locks distributed around a rectangle.
 * Positions: TL, TR, BR, BL, T-mid, B-mid (up to 6).
 */
function lockPositions(n: number): Array<{ top?: string; bottom?: string; left?: string; right?: string; translateX?: string }> {
  const all = [
    { top: "-10px", left: "-10px" },
    { top: "-10px", right: "-10px" },
    { bottom: "-10px", right: "-10px" },
    { bottom: "-10px", left: "-10px" },
    { top: "-10px", left: "50%", translateX: "-50%" },
    { bottom: "-10px", left: "50%", translateX: "-50%" },
  ];
  return all.slice(0, n);
}

// ─────────────────────────────────────────────────────────
// 5-STAGE FUNNEL CONFIG
// ─────────────────────────────────────────────────────────

const FUNNEL_STAGES: Array<{
  id: FunnelStage;
  icon: React.ReactNode;
  label: string;
  description: string;
  ctaLabel: string;
  free: boolean;
}> = [
  {
    id: "install",
    icon: <Download className="w-4 h-4" />,
    label: "Install",
    description:
      "Install the LB Frame — one click, free, no signup. AGPL v3 full-version.",
    ctaLabel: "pip install librarian-mcp",
    free: true,
  },
  {
    id: "demo",
    icon: <Play className="w-4 h-4" />,
    label: "Demo",
    description:
      "Watch the substrate work on pre-loaded Founder sample data. See the receipts live.",
    ctaLabel: "Run Demo",
    free: true,
  },
  {
    id: "user-data-test",
    icon: <FlaskConical className="w-4 h-4" />,
    label: "Your Data",
    description:
      "Feed in YOUR own data. LB Frame runs the test on your use case. See your receipts.",
    ctaLabel: "Test with My Data",
    free: true,
  },
  {
    id: "join",
    icon: <UserPlus className="w-4 h-4" />,
    label: "Join",
    description:
      "Be ONE OF US — join the cooperative Federation Library. $5/year, identical for all members.",
    ctaLabel: "Be ONE OF US — $5/year",
    free: false,
  },
  {
    id: "send-to-someone",
    icon: <Share2 className="w-4 h-4" />,
    label: "Share",
    description:
      "Take your place atop a Dragon — send this to someone who'd benefit. Pied Piper propagation.",
    ctaLabel: "Send to Someone",
    free: false,
  },
];

// ─────────────────────────────────────────────────────────
// STAGE-2 DEMO PANEL (KN061)
// ─────────────────────────────────────────────────────────

interface Stage2DemoPanelProps {
  config: Stage2DemoConfig;
  variant: LibrarianMedallionVariant;
}

function Stage2DemoPanel({ config, variant }: Stage2DemoPanelProps) {
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);

  function startDemo(e: React.MouseEvent) {
    e.stopPropagation();
    if (running || done) return;
    setRunning(true);
    runStep(0);
  }

  function runStep(idx: number) {
    if (idx >= config.steps.length) {
      setRunning(false);
      setDone(true);
      return;
    }
    setStepIndex(idx);
    setTimeout(() => {
      setCompletedSteps((prev) => new Set([...prev, config.steps[idx].id]));
      runStep(idx + 1);
    }, 800);
  }

  function reset(e: React.MouseEvent) {
    e.stopPropagation();
    setRunning(false);
    setStepIndex(0);
    setCompletedSteps(new Set());
    setDone(false);
  }

  return (
    <div
      className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2"
      data-testid={`stage2-demo-${variant}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-foreground/80">{config.title}</p>
          <p className="text-[10px] text-muted-foreground">{config.subtitle}</p>
        </div>
        <Cpu className="w-4 h-4 text-primary/50 flex-shrink-0" />
      </div>

      {/* Steps */}
      <div className="space-y-1.5" data-testid={`stage2-steps-${variant}`}>
        {config.steps.map((step, i) => {
          const completed = completedSteps.has(step.id);
          const active = running && stepIndex === i && !completed;
          return (
            <div
              key={step.id}
              className={`rounded-md p-2 text-[10px] border transition-all ${
                completed
                  ? "bg-green-50/60 border-green-300/50 dark:bg-green-950/20"
                  : active
                  ? "bg-blue-50/60 border-blue-300/50 dark:bg-blue-950/20 animate-pulse"
                  : "bg-muted/30 border-border/40"
              }`}
              data-testid={`stage2-step-${variant}-${step.id}`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`font-semibold ${completed ? "text-green-700 dark:text-green-300" : "text-foreground/70"}`}>
                  {step.label}
                </span>
                {completed && <CheckCircle className="w-3 h-3 text-green-600" />}
                {active && <ArrowRight className="w-3 h-3 text-blue-500" />}
              </div>
              <p className={`leading-snug mt-0.5 ${completed ? "text-green-600/80 dark:text-green-400/80" : "text-muted-foreground"}`}>
                {completed ? step.receipt : step.prompt}
              </p>
            </div>
          );
        })}
      </div>

      {/* Final receipt */}
      {done && (
        <div
          className="rounded-md bg-green-100/70 dark:bg-green-900/20 border border-green-300/60 p-2"
          data-testid={`stage2-final-receipt-${variant}`}
        >
          <p className="text-[10px] font-mono text-green-700 dark:text-green-300 leading-snug break-all">
            {config.finalReceipt}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!done && (
          <Button
            size="sm"
            variant="outline"
            className="text-[10px] h-6 px-2 flex-1"
            onClick={startDemo}
            disabled={running}
            data-testid={`stage2-run-btn-${variant}`}
          >
            {running ? "Running…" : config.ctaLabel}
          </Button>
        )}
        {(done || running) && (
          <Button
            size="sm"
            variant="ghost"
            className="text-[10px] h-6 px-2"
            onClick={reset}
            data-testid={`stage2-reset-btn-${variant}`}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────

export function LibrarianMedallion({
  variant,
  furnaceEndpoint,
  chainWalkerEnabled = false,
  onLockClick,
  onFunnelAction,
  compact = false,
}: LibrarianMedallionProps) {
  const config =
    VARIANT_CONFIGS[variant as keyof typeof VARIANT_CONFIGS] ??
    openSetFallbackConfig(variant);
  const [isFlipped, setIsFlipped] = useState(false);
  const [unlockedLocks, setUnlockedLocks] = useState<Set<number>>(new Set());
  const [centerUnlocked, setCenterUnlocked] = useState(false);
  const [showBountyPoster, setShowBountyPoster] = useState(false);
  const [chainInput, setChainInput] = useState("");
  const [chainResult, setChainResult] = useState<string | null>(null);
  const [funnelExpanded, setFunnelExpanded] = useState(false);

  const qrTarget = furnaceEndpoint ?? `https://Librarian.LianaBanyan.com/medallion/${variant}`;
  const positions = lockPositions(config.cornerLocks);
  const totalLocks = config.cornerLocks + (config.centerLock ? 1 : 0);
  const unlockedCount = unlockedLocks.size + (centerUnlocked ? 1 : 0);
  const fullyUnlocked = unlockedCount === totalLocks;

  function handleLockClick(idx: number) {
    if (unlockedLocks.has(idx)) return;
    const next = new Set(unlockedLocks);
    next.add(idx);
    setUnlockedLocks(next);
    onLockClick?.(variant, idx);
  }

  function handleCenterLock() {
    if (centerUnlocked) return;
    setCenterUnlocked(true);
    onLockClick?.(variant, 99);
  }

  function handleFunnelAction(stage: FunnelStage) {
    onFunnelAction?.(stage, variant);
    if (stage === "install") {
      window.open("https://pypi.org/project/librarian-mcp/", "_blank");
    } else if (stage === "join") {
      window.open("https://lianabanyan.com/auth", "_blank");
    } else if (stage === "send-to-someone") {
      if (navigator.share) {
        navigator.share({
          title: `Librarian Medallion — ${config.label}`,
          text: config.bountyTagline,
          url: qrTarget,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(qrTarget).catch(() => {});
      }
    }
  }

  function handleChainWalk() {
    if (!chainInput.trim()) return;
    setChainResult(
      `Chain verification for "${chainInput}" — Furnace endpoint: ${furnaceEndpoint ?? "pending KN044"}. Receipt: FURNACE-PENDING-KN044. ` +
      `Chain-of-custody depth: N/A until Furnace API ships. ` +
      `Status: graceful-degrade — Furnace endpoint pending KN044.`
    );
  }

  const cardWidth = compact ? "w-52" : "w-72";
  const cardHeight = compact ? "h-80" : "h-[480px]";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ── Flip Card ── */}
      <div
        className={`${cardWidth} ${cardHeight} cursor-pointer select-none`}
        style={{ perspective: "1200px" }}
        onClick={() => setIsFlipped(!isFlipped)}
        role="button"
        aria-label={`${config.label} Medallion — click to flip`}
        data-testid={`librarian-medallion-${variant}`}
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ─── FRONT ─── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            style={{ backfaceVisibility: "hidden", ...config.borderStyle }}
            data-testid={`medallion-front-${variant}`}
          >
            {/* Emblem area */}
            <div className="flex flex-col h-full p-5">
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant="outline"
                  className="text-[10px] font-semibold tracking-wide"
                  data-testid={`medallion-tier-badge-${variant}`}
                >
                  {config.tier}
                </Badge>
                {config.accessTier === "public-agpl" ? (
                  <Badge className="text-[10px] bg-green-100 text-green-800 border-green-300">
                    AGPL · Free
                  </Badge>
                ) : (
                  <Badge className="text-[10px] bg-purple-100 text-purple-800 border-purple-300">
                    Federation · Member
                  </Badge>
                )}
              </div>

              {/* Emblem */}
              <div
                className="flex-1 flex flex-col items-center justify-center gap-3"
                data-testid={`medallion-emblem-${variant}`}
              >
                <div className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-current/20 bg-white/60 shadow-inner">
                  {config.emblemIcon}
                </div>
                <div className="text-center">
                  <h3 className={`font-bold ${compact ? "text-sm" : "text-base"} text-foreground`}>
                    {config.label}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug max-w-[200px]">
                    {config.tagline}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div
                className="flex justify-center mt-2 mb-3"
                data-testid={`medallion-qr-${variant}`}
              >
                <div className="p-2 bg-white rounded-lg shadow-sm border border-border/40">
                  <QRCodeSVG
                    value={qrTarget}
                    size={compact ? 64 : 80}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Frame Locks — relative container */}
              <div
                className="relative mx-auto mb-1"
                style={{ width: "100%", height: compact ? "32px" : "40px" }}
                data-testid={`medallion-frame-locks-${variant}`}
              >
                {/* Corner / edge locks */}
                {positions.map((pos, i) => {
                  const unlocked = unlockedLocks.has(i);
                  const label =
                    variant === "furnace"
                      ? FURNACE_LOCK_LABELS[i]
                      : `Lock ${i + 1}`;
                  return (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); handleLockClick(i); }}
                      title={unlocked ? `Unlocked: ${label}` : `Click to unlock: ${label}`}
                      data-testid={`frame-lock-${variant}-${i}`}
                      style={{
                        position: "absolute",
                        top: pos.top,
                        bottom: pos.bottom,
                        left: pos.left,
                        right: pos.right,
                        transform: pos.translateX ? `translateX(${pos.translateX})` : undefined,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `1.5px solid ${unlocked ? "#22c55e" : "hsl(var(--border))"}`,
                        background: unlocked
                          ? "#dcfce7"
                          : "hsl(var(--card))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: unlocked ? "default" : "pointer",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
                        zIndex: 10,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {unlocked ? (
                        <Unlock className="w-3 h-3 text-green-600" />
                      ) : (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                  );
                })}

                {/* Center hexagonal lock (Pied Piper / AI Tuning) */}
                {config.centerLock && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCenterLock(); }}
                    title={centerUnlocked ? "Center Lock: Tuner-Tier Unlocked" : "Center Lock: Tuner-Tier (unlock with AI Tuning receipts)"}
                    data-testid={`frame-lock-${variant}-center`}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: 28,
                      height: 28,
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      border: "none",
                      background: centerUnlocked
                        ? "linear-gradient(135deg, #10b981, #34d399)"
                        : "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--border)))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: centerUnlocked ? "default" : "pointer",
                      zIndex: 10,
                      transition: "all 0.25s ease",
                    }}
                  >
                    {centerUnlocked ? (
                      <Unlock className="w-3 h-3 text-white" />
                    ) : (
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>

              {/* Lock progress */}
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground/60">
                  {fullyUnlocked
                    ? "All locks open — card collected"
                    : `${unlockedCount}/${totalLocks} locks · tap to flip`}
                </span>
              </div>
            </div>
          </div>

          {/* ─── BACK (Submarine Doors) ─── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden bg-card border border-border shadow-lg"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            data-testid={`medallion-back-${variant}`}
          >
            <div className="flex flex-col h-full overflow-y-auto">
              {/* Back header */}
              <div className="sticky top-0 bg-card border-b border-border/60 px-4 py-3 z-10">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{config.authorityLabel}</span>
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                    data-testid={`medallion-back-badge-${variant}`}
                  >
                    {config.label}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Tap card to flip back
                </p>
              </div>

              <div className="flex-1 p-4 space-y-4">
                {/* Eblet summary */}
                <div
                  className="rounded-lg bg-muted/40 p-3"
                  data-testid={`medallion-eblet-content-${variant}`}
                >
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {config.backSummary}
                  </p>
                </div>

                {/* Stage-2 Demo Panel (KN061) */}
                <Stage2DemoPanel config={config.stage2Demo} variant={variant} />

                {/* Furnace receipt placeholder */}
                <div
                  className="rounded-lg border border-orange-200/60 bg-orange-50/50 dark:bg-orange-950/20 p-3 text-[11px] space-y-1"
                  data-testid={`medallion-furnace-receipt-${variant}`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-orange-700 dark:text-orange-300">
                    <Flame className="w-3 h-3" />
                    <span>Furnace Verification Receipt</span>
                  </div>
                  {furnaceEndpoint ? (
                    <p className="text-orange-600/80 dark:text-orange-400/80">
                      Endpoint: {furnaceEndpoint} · Receipt pending scan
                    </p>
                  ) : (
                    <p className="text-orange-600/70 dark:text-orange-400/70">
                      Furnace endpoint pending KN044 · graceful-degrade active.
                      QR verifies authenticity when endpoint ships.
                    </p>
                  )}
                </div>

                {/* Chain walker (Furnace variant only) */}
                {variant === "furnace" && chainWalkerEnabled && (
                  <div
                    className="rounded-lg border border-border/60 p-3 space-y-2"
                    data-testid="chain-walker-ui"
                  >
                    <p className="text-[11px] font-semibold text-foreground">Chain-of-Custody Walker</p>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 text-xs px-2 py-1.5 rounded border border-border bg-background outline-none focus:ring-1 focus:ring-primary/40"
                        placeholder="golden_tablet://..."
                        value={chainInput}
                        onChange={(e) => setChainInput(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={(e) => { e.stopPropagation(); handleChainWalk(); }}
                        data-testid="chain-walker-submit"
                      >
                        Walk
                      </Button>
                    </div>
                    {chainResult && (
                      <p className="text-[10px] text-muted-foreground leading-relaxed" data-testid="chain-walker-result">
                        {chainResult}
                      </p>
                    )}
                  </div>
                )}

                {/* 5-stage funnel */}
                <div className="space-y-2" data-testid={`medallion-funnel-${variant}`}>
                  <button
                    className="flex items-center justify-between w-full text-[11px] font-semibold text-foreground/80 hover:text-foreground transition-colors"
                    onClick={(e) => { e.stopPropagation(); setFunnelExpanded(!funnelExpanded); }}
                  >
                    <span>LB Frame Broadcast Funnel</span>
                    {funnelExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {funnelExpanded && (
                    <div className="space-y-2">
                      {FUNNEL_STAGES.map((stage, i) => (
                        <div
                          key={stage.id}
                          className="rounded-md border border-border/50 p-2.5"
                          data-testid={`funnel-stage-${stage.id}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {stage.icon}
                                <span className="text-[11px] font-semibold">{stage.label}</span>
                                {stage.free && (
                                  <Badge className="text-[9px] h-4 px-1 bg-green-100 text-green-700 border-green-300">
                                    Free
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-snug mb-1.5">
                                {stage.description}
                              </p>
                              <Button
                                size="sm"
                                variant={stage.free ? "outline" : "default"}
                                className="text-[10px] h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFunnelAction(stage.id);
                                }}
                                data-testid={`funnel-cta-${stage.id}`}
                              >
                                {stage.ctaLabel}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bounty Poster variant */}
                <div
                  className="rounded-lg border border-primary/20 bg-primary/5 p-3"
                  data-testid={`medallion-bounty-poster-${variant}`}
                >
                  <button
                    className="flex items-center justify-between w-full text-[11px] font-semibold text-primary/80 hover:text-primary transition-colors"
                    onClick={(e) => { e.stopPropagation(); setShowBountyPoster(!showBountyPoster); }}
                  >
                    <span>Bounty Poster</span>
                    {showBountyPoster ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {showBountyPoster && (
                    <div className="mt-2 space-y-2">
                      <p className="text-[11px] italic text-foreground/70 leading-snug">
                        "{config.bountyTagline}"
                      </p>
                      <div className="flex justify-center p-2 bg-white rounded border border-border/40">
                        <QRCodeSVG value={qrTarget} size={72} level="H" includeMargin={false} />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center break-all font-mono">
                        {qrTarget}
                      </p>
                      <a
                        href={qrTarget}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 text-[10px] text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`medallion-qr-target-link-${variant}`}
                      >
                        <ExternalLink className="w-3 h-3" /> Open Librarian Page
                      </a>
                    </div>
                  )}
                </div>

                {/* Battery-dispatch register note (Furnace variant) */}
                {variant === "furnace" && (
                  <div
                    className="rounded-lg border border-orange-300/50 bg-orange-50/60 dark:bg-orange-950/20 p-3 text-[11px]"
                    data-testid="battery-dispatch-register"
                  >
                    <p className="font-semibold text-orange-700 dark:text-orange-300 mb-1">
                      Battery-Dispatch Register
                    </p>
                    <p className="text-orange-600/80 dark:text-orange-400/80 leading-relaxed">
                      Every Medallion scan dispatches a Battery-dispatch register entry per
                      Furnace-every-click (B119+). Entries are append-only per Year of Jubilee
                      Ledger architecture (#2308). Register: pending KN046 multi-tenant activation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Collected badge (below card) ── */}
      {fullyUnlocked && (
        <Badge
          className="bg-green-100 text-green-800 border-green-300 text-xs"
          data-testid={`medallion-collected-${variant}`}
        >
          <Unlock className="w-3 h-3 mr-1" /> Card Collected — In Deck
        </Badge>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// GALLERY: all variants at once (for /medallion page)
// ─────────────────────────────────────────────────────────

export function LibrarianMedallionGallery() {
  const variants: LibrarianMedallionVariant[] = [
    "liana-banyan",
    "cathedral",
    "pied-piper",
    "furnace",
    "canon",
    "platform-rules",
    "project-rules",
    "ai-tuning",
    "symbiote",
    "ultravision",
    "titan",
  ];

  return (
    <div
      className="flex flex-wrap gap-8 justify-center"
      data-testid="medallion-gallery"
    >
      {variants.map((v) => (
        <LibrarianMedallion
          key={v}
          variant={v}
          chainWalkerEnabled={v === "furnace"}
          compact
        />
      ))}
    </div>
  );
}
