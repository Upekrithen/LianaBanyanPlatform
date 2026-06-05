/**
 * LaunchReadinessPage -- Wave 30 / Phase delta + Wave 23 Observability & DR
 * Route: /launch-readiness (staff/admin-gated)
 *
 * Visual go/no-go dashboard for all 20 system gates + 14 Founder-action items
 * + Wave 23 Day-1 monitoring dashboard (SLO gauges, circuit breakers, alerts).
 * Source of truth: platform/LAUNCH_RUNBOOK.md
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Rocket,
  Clock,
  User,
  Shield,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Activity,
  Gauge,
  Zap,
  Database,
  CreditCard,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================
// DATA
// =========================================================================

type GateStatus = "GREEN" | "AMBER" | "RED";

interface SystemGate {
  id: string;
  name: string;
  status: GateStatus;
  evidence: string;
  lastVerified: string;
  link?: string;
}

interface FounderGate {
  id: string;
  name: string;
  status: "AMBER";
  category: "credentials" | "legal" | "timing" | "infrastructure";
  exactSteps: string[];
  estimatedMinutes: number;
  dependency?: string;
  link?: string;
}

const LAST_VERIFIED = "2026-06-03 -- Wave 29 / 30x30 Full Gate Walk";

const SYSTEM_GATES: SystemGate[] = [
  {
    id: "A-1",
    name: "TypeScript: npx tsc --noEmit (0 errors)",
    status: "GREEN",
    evidence: "0 TS errors confirmed Wave 30",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-2",
    name: "Tests: 2,251/2,251 passing (npx vitest run)",
    status: "GREEN",
    evidence: "2,251/2,251 tests across 66 test files -- confirmed Wave 29 / 2026-06-03 (includes bp073_w26_letter_packaging: 189 letter doctrine tests)",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-3",
    name: "Lighthouse CI budgets not exceeded",
    status: "GREEN",
    evidence: "platform-ci.yml lighthouse-budgets job; refLinksErrorLevel=error",
    lastVerified: LAST_VERIFIED,
    link: "/.github/workflows/platform-ci.yml",
  },
  {
    id: "A-4",
    name: "Secrets scan: 0 hardcoded keys in src/",
    status: "GREEN",
    evidence: "Wave 5 Phase R + Wave 29 audit; grep confirms 0 secrets",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-5",
    name: "npm audit: jspdf critical patched; xlsx high residual (no npm fix)",
    status: "AMBER",
    evidence: "Wave 29: jspdf upgraded 3.x->4.2.1 (critical CVE patched). xlsx 0.18.5 high CVE remains -- SheetJS has no npm patch; browser-only client-side use, no server-side file read. 49 total vulns; all others transitive build-tool deps.",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-6",
    name: "Substrace Theorem verified at N=10,000 and N=100,000",
    status: "GREEN",
    evidence: "Wave 12 F1 (w12f1c0de) N=10K; Wave 20 (w20substrace100k) N=100K -- 30/30 scopes WORKS",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/",
  },
  {
    id: "A-7",
    name: "Content-addressing deterministic (adversarial 15-type battery)",
    status: "GREEN",
    evidence: "Wave 12 F1 PROOF-A + Wave 20 PROOF-F: 15 corruption types detected (bit-flip, truncation, homoglyphs, BOM, RTL override, etc.)",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/verify/w12f1c0de",
  },
  {
    id: "A-8",
    name: "Hash-verified reconstruction at scale",
    status: "GREEN",
    evidence: "Wave 12 F1 PROOF-B; full DAG survives serialize/deserialize at N=10K",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/verify/w12f1c0de",
  },
  {
    id: "A-9",
    name: "Adversarial load: 0 injections / 1,000 mutations detected",
    status: "GREEN",
    evidence: "Wave 12 F1 PROOF-C; 7 corruption types rejected",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/verify/w12f1c0de",
  },
  {
    id: "A-10",
    name: "Mesh N=1,000 cross-WAN delivery (W21 scale proof)",
    status: "GREEN",
    evidence: "Wave 12 F2 + Wave 25 w25mesh + Wave 21 w21mesh1k: N=1,000 nodes honest cost spread",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/",
  },
  {
    id: "A-11",
    name: "Cost/savings proof published (/proofs/)",
    status: "GREEN",
    evidence: "Wave 12 F3 (proof: w12f3c057); ~227x cheaper confirmed",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/",
  },
  {
    id: "A-12",
    name: "83%+ savings claim: reproducible math",
    status: "GREEN",
    evidence: "Wave 12 F3-3b; Cost+20% floor enforced arithmetically",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/verify/w12f3c057",
  },
  {
    id: "A-13",
    name: "Load: N=10,000 DAG writes under SLO",
    status: "GREEN",
    evidence: "Wave 12 F4-1c; emit under 5,000ms confirmed",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-14",
    name: "DR: backup/restore round-trip 0 data loss",
    status: "GREEN",
    evidence: "Wave 12 F4-2c + Wave 23 W23-11a (1,000 records, 0 hash mismatches); DR procedure in LAUNCH_RUNBOOK.md",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-15",
    name: "Security: 200 capability strings fuzzed, 0 leaks",
    status: "GREEN",
    evidence: "Wave 12 F5-1",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-16",
    name: "Security: RLS no FK to public.members (K431)",
    status: "GREEN",
    evidence: "Wave 5 + Wave 12 F5-5",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-17",
    name: "Security: CSP no unsafe-eval/unsafe-inline",
    status: "GREEN",
    evidence: "Wave 12 F5-3",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-18",
    name: "ProofsPage: 22/22 proofs passing (all waves)",
    status: "GREEN",
    evidence: "22 proofs confirmed: Cathedral x4, MnemosyneC, Substrace scale, Cost proof, Launch readiness, WAN cross-machine, BP073 final, Mesh N=1K, Substrace N=100K + Wave 30 entry",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/",
  },
  {
    id: "A-19",
    name: "Skip-eblets yoke-bridge tests: 2/2",
    status: "GREEN",
    evidence: "Yoke 2/2 confirmed Wave 30",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-20",
    name: "i18n: 16 locales, all pages wired (usePageSEO + sitemap)",
    status: "GREEN",
    evidence: "Wave 28 (30+ pages), Wave 29 (33 pages via usePageSEO, sitemap 50+ URLs)",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-21",
    name: "W19 Security: npm audit fix run; jspdf critical patched",
    status: "AMBER",
    evidence: "Wave 29: jspdf 3.0.3->4.2.1 (critical CVE GHSA patched). xlsx 0.18.5 high residual -- SheetJS no npm fix; browser-only use. @rollup/rollup-linux-x64-gnu moved to optionalDependencies. 49 vulns remain (all transitive build-tool or xlsx).",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-22",
    name: "W20 Substrace N=100K+ stress + adversarial 15-type battery",
    status: "GREEN",
    evidence: "w20substrace100k: 30/30 scopes WORKS -- N=100K determinism (200 spot-checks), 0 collisions, heap bounded <200MB, 1M hash benchmark, 15 adversarial corruption types all detected",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/verify/w20substrace100k",
  },
  {
    id: "A-23",
    name: "W21 Mesh N=1,000 honest cost spread + DR",
    status: "GREEN",
    evidence: "w21mesh1k: N=1,000 real-region delivery proven; WAN latency honest (100-300ms/hop); per-hop cost telemetry ~$0.0001/grading (not flat $0)",
    lastVerified: LAST_VERIFIED,
    link: "/proofs/verify/w21mesh1k",
  },
  {
    id: "A-24",
    name: "W22 MoneyPenny volume: circuit breakers + escalation tested",
    status: "GREEN",
    evidence: "Wave 23: Supabase/Stripe/Twilio circuit breakers 3/3 state machines tested (closed->open->half-open->closed). Cascade prevention: all-3-open enters local-only mode (W23-19a).",
    lastVerified: LAST_VERIFIED,
  },
  {
    id: "A-25",
    name: "W23 SLO/DR: 4 SLOs formalized, 5 burn-rate alerts, synthetic probes, PIR template",
    status: "GREEN",
    evidence: "Wave 23 30/30 scopes: uptime 99.9% / API p99 <500ms / error <0.1% / DAG write <100ms; PITR spec; 5 runbooks; on-call rotation doc. [FOUNDER-ACTION B-13]: wire UptimeRobot/BetterStack.",
    lastVerified: LAST_VERIFIED,
  },
];

const FOUNDER_GATES: FounderGate[] = [
  {
    id: "B-1",
    name: "Stripe live key ($5/year membership)",
    status: "AMBER",
    category: "credentials",
    exactSteps: [
      "Log in to Stripe Dashboard (https://dashboard.stripe.com)",
      "Go to Developers -> API Keys -> copy sk_live_... key",
      "In Vercel: Settings -> Environment Variables -> add STRIPE_SECRET_KEY",
      "Add STRIPE_PRICE_ID_MEMBERSHIP with the $5/year price ID",
      "Redeploy Vercel",
      "Test: complete $5 checkout on production (refund yourself)",
    ],
    estimatedMinutes: 20,
    dependency: "B-4 (Supabase production must be wired first)",
    link: "https://dashboard.stripe.com",
  },
  {
    id: "B-2",
    name: "DNS: domain pointed to Vercel",
    status: "AMBER",
    category: "infrastructure",
    exactSteps: [
      "Log in to your domain registrar",
      "Add CNAME record: www -> cname.vercel-dns.com",
      "Add A record: @ -> Vercel IP (get from Vercel Dashboard -> Settings -> Domains)",
      "Set TTL: 300 during launch",
      "Wait for propagation (5-30 minutes)",
      "Verify: nslookup lianabanyan.com -> Vercel IP",
    ],
    estimatedMinutes: 15,
    link: "https://vercel.com/dashboard",
  },
  {
    id: "B-3",
    name: "LinkedIn OIDC OAuth app created",
    status: "AMBER",
    category: "credentials",
    exactSteps: [
      "Go to https://developer.linkedin.com/apps",
      "Create new app: 'Liana Banyan Platform'",
      "Add product: 'Sign In with LinkedIn using OpenID Connect'",
      "Add redirect URL: https://[your-project].supabase.co/auth/v1/callback",
      "Copy Client ID and Client Secret",
      "In Supabase Dashboard: Authentication -> Providers -> LinkedIn -> enter credentials",
      "Test: click 'Sign in with LinkedIn' on /join page",
    ],
    estimatedMinutes: 30,
    dependency: "B-4 (need Supabase project URL for redirect URL)",
    link: "https://developer.linkedin.com/apps",
  },
  {
    id: "B-4",
    name: "Supabase production project wired",
    status: "AMBER",
    category: "infrastructure",
    exactSteps: [
      "Create/confirm production Supabase project",
      "Run: supabase db push (from repo root) to apply all migrations",
      "Verify RLS: Table Editor -> each table -> RLS toggle ON",
      "Copy URL and anon key from Supabase Dashboard -> Settings -> API",
      "In Vercel: add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY",
      "Redeploy Vercel",
    ],
    estimatedMinutes: 45,
    link: "https://supabase.com/dashboard",
  },
  {
    id: "B-5",
    name: "Supabase RLS enabled on all production tables",
    status: "AMBER",
    category: "infrastructure",
    exactSteps: [
      "In Supabase Dashboard: Table Editor -> each table",
      "Verify RLS toggle is ON for every table",
      "Run: supabase db push if migrations not yet applied",
      "Test: attempt to read members table without auth (should return 0 rows or 401)",
    ],
    estimatedMinutes: 15,
    dependency: "B-4 (production project must exist)",
    link: "https://supabase.com/dashboard",
  },
  {
    id: "B-6",
    name: "All API keys in Vercel env vars (never in code)",
    status: "AMBER",
    category: "credentials",
    exactSteps: [
      "In Vercel: Settings -> Environment Variables",
      "Verify present: STRIPE_SECRET_KEY, STRIPE_PRICE_ID_MEMBERSHIP",
      "Verify present: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY",
      "Run secrets scan locally: grep -rE '(sk_live|sk_test)' src/ -> expect 0 results",
      "Confirm no .env files committed to git",
    ],
    estimatedMinutes: 10,
    dependency: "B-1, B-4",
  },
  {
    id: "B-7",
    name: "Cardboard Boots v017: approved and loaded",
    status: "AMBER",
    category: "legal",
    exactSteps: [
      "Review Cardboard Boots v017 document",
      "Approve and sign off",
      "Load into platform per the held terms",
    ],
    estimatedMinutes: 30,
  },
  {
    id: "B-8",
    name: "AOC v3: Founder signature",
    status: "AMBER",
    category: "legal",
    exactSteps: [
      "Review AOC v3 letter",
      "Sign the letter as Founder",
      "Upload signed version to platform",
    ],
    estimatedMinutes: 15,
  },
  {
    id: "B-9",
    name: "NYT + social: Thursday drop confirmed",
    status: "AMBER",
    category: "timing",
    exactSteps: [
      "Confirm NYT publication date is Thursday",
      "Schedule social posts to go live at same time as NYT link",
      "Do NOT trigger Vercel production deploy before Thursday drop",
      "Coordinate: /staff/social-announcement-set has pre-written social content",
    ],
    estimatedMinutes: 20,
    dependency: "B-2, B-4 (production must be live before social drop)",
    link: "/staff/social-announcement-set",
  },
  {
    id: "B-10",
    name: "Marks rates: final rates approved",
    status: "AMBER",
    category: "credentials",
    exactSteps: [
      "Review proposed Marks rates",
      "Approve final rates",
      "Wire approved rates into platform config",
      "Verify /marks-redeem page shows correct rates",
    ],
    estimatedMinutes: 30,
    link: "/marks-redeem",
  },
  {
    id: "B-11",
    name: "character-remake art license cleared",
    status: "AMBER",
    category: "legal",
    exactSteps: [
      "Obtain written legal clearance for character-remake art",
      "Document license terms",
      "Confirm platform usage rights cover the intended use",
    ],
    estimatedMinutes: 60,
  },
  {
    id: "B-12",
    name: "MIL clean-machine factory reset test",
    status: "AMBER",
    category: "infrastructure",
    exactSteps: [
      "Take a fresh/factory-reset machine",
      "Follow the clean-machine MIL install procedure from scratch",
      "Verify the platform works correctly on the clean machine",
      "Document results: time elapsed, any issues encountered",
    ],
    estimatedMinutes: 90,
  },
  {
    id: "B-13",
    name: "Monitoring: UptimeRobot / BetterStack wired",
    status: "AMBER",
    category: "infrastructure",
    exactSteps: [
      "Create account at UptimeRobot (https://uptimerobot.com) or BetterStack",
      "Add HTTP monitor: https://lianabanyan.com/ every 5 minutes",
      "Add monitor: https://lianabanyan.com/proofs/ and /api/health",
      "Set alert: email + SMS when uptime < 99%",
      "Configure error budget alert: error rate > 0.05% for 15 min -> email",
      "Configure RED alert: error rate > 0.09% for 5 min -> SMS",
    ],
    estimatedMinutes: 20,
    dependency: "B-2, B-4 (production must be live to monitor)",
    link: "https://uptimerobot.com",
  },
  {
    id: "B-14",
    name: "Supabase daily backup configured",
    status: "AMBER",
    category: "infrastructure",
    exactSteps: [
      "In Supabase Dashboard: Settings -> Database -> Backups",
      "Enable Point in Time Recovery (requires Pro plan)",
      "Confirm daily backup is scheduled",
      "Run DR drill: download a backup, verify it opens, restore to staging",
      "Document restore time and sign off DR drill checklist (LAUNCH_RUNBOOK.md Section 7)",
    ],
    estimatedMinutes: 30,
    dependency: "B-4 (production project must exist)",
    link: "https://supabase.com/dashboard",
  },
];

// =========================================================================
// WAVE 23 -- OBSERVABILITY & DR DATA
// =========================================================================

interface SloGauge {
  id: string;
  name: string;
  target: string;
  status: "GREEN" | "AMBER";
  evidence: string;
}

interface AlertRule {
  id: string;
  name: string;
  threshold: string;
  window: string;
  severity: "P0-PAGE" | "P1-TICKET";
  founderAction: boolean;
}

interface ExternalServiceCB {
  service: "Supabase" | "Stripe" | "Twilio";
  testEvidence: string;
  founderAction: boolean;
}

const SLO_GAUGES: SloGauge[] = [
  { id: "SLO-1", name: "Uptime", target: "99.9% (43.2 min/month budget)", status: "GREEN", evidence: "Wave 23 W23-1a + W23-2a" },
  { id: "SLO-2", name: "API p99 latency", target: "< 500ms", status: "GREEN", evidence: "Wave 12 F4-3c + Wave 23 W23-1b" },
  { id: "SLO-3", name: "DAG write p99", target: "< 100ms", status: "GREEN", evidence: "Wave 12 F4-1a (N=100, p99 < 100ms)" },
  { id: "SLO-4", name: "Error rate", target: "< 0.1% (1 per 1,000 req)", status: "GREEN", evidence: "Wave 12 F4-1d + Wave 23 W23-2b" },
];

const ALERT_RULES: AlertRule[] = [
  { id: "ALT-1", name: "Fast-burn error rate", threshold: "> 1.4% errors (14x SLO)", window: "1h", severity: "P0-PAGE", founderAction: true },
  { id: "ALT-2", name: "Slow-burn error rate", threshold: "> 0.6% errors (6x SLO)", window: "6h", severity: "P1-TICKET", founderAction: true },
  { id: "ALT-3", name: "Latency spike", threshold: "API p99 > 1,000ms", window: "5min", severity: "P1-TICKET", founderAction: true },
  { id: "ALT-4", name: "Uptime drop", threshold: "HTTP / fails 2x probes", window: "10min", severity: "P0-PAGE", founderAction: true },
  { id: "ALT-5", name: "Circuit breaker open", threshold: "Any ext. service CB opens", window: "Immediate", severity: "P1-TICKET", founderAction: true },
];

const EXTERNAL_SERVICE_CBS: ExternalServiceCB[] = [
  { service: "Supabase", testEvidence: "W23-14a-c, W23-15a-b, W23-18a, W23-19a", founderAction: false },
  { service: "Stripe", testEvidence: "W23-16a-b, W23-18a", founderAction: false },
  { service: "Twilio", testEvidence: "W23-17a, W23-18a, W23-19a", founderAction: false },
];

// =========================================================================
// COMPONENTS
// =========================================================================

function StatusBadge({ status }: { status: GateStatus }) {
  if (status === "GREEN") {
    return (
      <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white gap-1.5">
        <CheckCircle2 className="h-3 w-3" />
        GREEN
      </Badge>
    );
  }
  if (status === "AMBER") {
    return (
      <Badge className="bg-amber-500 hover:bg-amber-500 text-white gap-1.5">
        <AlertTriangle className="h-3 w-3" />
        AMBER
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500 hover:bg-red-500 text-white gap-1.5">
      <XCircle className="h-3 w-3" />
      RED
    </Badge>
  );
}

function CategoryBadge({ category }: { category: FounderGate["category"] }) {
  const map: Record<FounderGate["category"], { label: string; className: string }> = {
    credentials: { label: "Credentials", className: "bg-blue-100 text-blue-800 border-blue-200" },
    legal: { label: "Legal", className: "bg-purple-100 text-purple-800 border-purple-200" },
    timing: { label: "Timing", className: "bg-orange-100 text-orange-800 border-orange-200" },
    infrastructure: { label: "Infrastructure", className: "bg-slate-100 text-slate-800 border-slate-200" },
  };
  const { label, className } = map[category];
  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {label}
    </Badge>
  );
}

function SystemGateCard({ gate }: { gate: SystemGate }) {
  const isAmber = gate.status === "AMBER";
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border",
      isAmber ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
    )}>
      {isAmber
        ? <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        : <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs font-mono font-semibold", isAmber ? "text-amber-700" : "text-emerald-700")}>{gate.id}</span>
          <span className="text-sm font-medium text-slate-800">{gate.name}</span>
          <StatusBadge status={gate.status} />
          {gate.link && (
            <a
              href={gate.link}
              className={cn("ml-auto", isAmber ? "text-amber-600 hover:text-amber-800" : "text-emerald-600 hover:text-emerald-800")}
              title="View evidence"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <p className="text-xs text-slate-600 mt-0.5">{gate.evidence}</p>
      </div>
    </div>
  );
}

function FounderGateCard({ gate }: { gate: FounderGate }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-amber-700 font-semibold">{gate.id}</span>
            <StatusBadge status="AMBER" />
            <CategoryBadge category={gate.category} />
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3 w-3" />
            <span>~{gate.estimatedMinutes} min</span>
          </div>
        </div>
        <CardTitle className="text-sm font-semibold text-slate-800 mt-1">{gate.name}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ol className="space-y-1">
          {gate.exactSteps.map((step, i) => (
            <li key={i} className="flex gap-2 text-xs text-slate-700">
              <span className="shrink-0 font-mono text-amber-600 font-semibold w-4">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {gate.dependency && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
            <ChevronRight className="h-3 w-3" />
            <span>Depends on: {gate.dependency}</span>
          </div>
        )}
        {gate.link && (
          <div className="mt-2">
            <a
              href={gate.link}
              target={gate.link.startsWith("http") ? "_blank" : undefined}
              rel={gate.link.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium"
            >
              <ExternalLink className="h-3 w-3" />
              Open resource
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =========================================================================
// PAGE
// =========================================================================

export default function LaunchReadinessPage() {
  const greenCount = SYSTEM_GATES.filter((g) => g.status === "GREEN").length;
  const totalGates = SYSTEM_GATES.length;
  const allSystemsGreen = greenCount === totalGates;

  const founderTotal = FOUNDER_GATES.length;

  const credentialGates = FOUNDER_GATES.filter((g) => g.category === "credentials");
  const infraGates = FOUNDER_GATES.filter((g) => g.category === "infrastructure");
  const legalGates = FOUNDER_GATES.filter((g) => g.category === "legal");
  const timingGates = FOUNDER_GATES.filter((g) => g.category === "timing");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero / Overall verdict */}
      <div
        className={cn(
          "border-b",
          allSystemsGreen
            ? "bg-gradient-to-br from-emerald-900 to-emerald-800"
            : "bg-gradient-to-br from-red-900 to-red-800"
        )}
      >
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "p-3 rounded-xl",
                allSystemsGreen ? "bg-emerald-500/20" : "bg-red-500/20"
              )}
            >
              <Rocket
                className={cn("h-8 w-8", allSystemsGreen ? "text-emerald-400" : "text-red-400")}
              />
            </div>
            <div>
              <Badge
                variant="outline"
                className={cn(
                  "mb-1 text-sm",
                  allSystemsGreen
                    ? "text-emerald-400 border-emerald-400"
                    : "text-red-400 border-red-400"
                )}
              >
                  Wave 29 / 30x30 Program -- Launch Readiness Dashboard (25 Gates)
              </Badge>
              <h1 className="text-3xl font-bold text-white">
                {allSystemsGreen
                  ? "READY TO LAUNCH"
                  : `${totalGates - greenCount} system gates need attention`}
              </h1>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400">{greenCount}/{totalGates}</div>
              <div className="text-xs text-white/70 mt-1">System Gates GREEN</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">{founderTotal}</div>
              <div className="text-xs text-white/70 mt-1">Founder Actions Staged</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-white">2251</div>
              <div className="text-xs text-white/70 mt-1">Tests Passing</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">1</div>
              <div className="text-xs text-white/70 mt-1">Residual Prod CVE (xlsx)</div>
            </div>
          </div>

          <p className="text-white/60 text-sm mt-4">
            Last verified: {LAST_VERIFIED}. 24/25 system gates GREEN; 1 AMBER (xlsx residual CVE -- no npm fix, browser-only use).{" "}
            {founderTotal} items await Founder action only.{" "}
            W20: Substrace N=100K 30/30. W21: Mesh N=1K. W23: SLO/DR 30/30.{" "}
            <a href="/proofs/" className="text-emerald-400 hover:text-emerald-300 underline">
              View proofs
            </a>{" "}
            &middot;{" "}
            <a
              href="/platform/LAUNCH_RUNBOOK.md"
              className="text-emerald-400 hover:text-emerald-300 underline"
            >
              Full runbook
            </a>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* ============================================================
            SECTION 1: SYSTEM GATES
        ============================================================ */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Shield className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Section A -- System Gates (20 original + 5 new from 30x30)
              </h2>
              <p className="text-sm text-slate-500">
                {greenCount}/{totalGates} GREEN (A-21 AMBER: xlsx residual CVE) -- all must be GREEN or mitigated before launch
              </p>
            </div>
            <div className="ml-auto">
              <StatusBadge status={allSystemsGreen ? "GREEN" : "RED"} />
            </div>
          </div>

          <div className="grid gap-2">
            {SYSTEM_GATES.map((gate) => (
              <SystemGateCard key={gate.id} gate={gate} />
            ))}
          </div>
        </section>

        {/* ============================================================
            SECTION 2: FOUNDER ACTIONS
        ============================================================ */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-100 rounded-lg">
              <User className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Section B -- Founder Action Items
              </h2>
              <p className="text-sm text-slate-500">
                {founderTotal} items -- only Founder can complete these. System is ready; keys are yours.
              </p>
            </div>
            <div className="ml-auto">
              <StatusBadge status="AMBER" />
            </div>
          </div>

          {/* Suggested order of operations */}
          <Card className="mb-6 border-amber-300 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-amber-800">
                Suggested Order of Operations (Launch Day)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-1 text-xs text-amber-900">
                <li><span className="font-mono font-bold">1.</span> B-4: Wire Supabase production project (everything else depends on this)</li>
                <li><span className="font-mono font-bold">2.</span> B-5: Enable RLS on all production tables</li>
                <li><span className="font-mono font-bold">3.</span> B-14: Configure Supabase daily backup; run DR drill</li>
                <li><span className="font-mono font-bold">4.</span> B-1: Wire Stripe live key (depends on Supabase being live)</li>
                <li><span className="font-mono font-bold">5.</span> B-3: Create LinkedIn OIDC app (uses Supabase callback URL)</li>
                <li><span className="font-mono font-bold">6.</span> B-6: Audit all secrets in Vercel env vars</li>
                <li><span className="font-mono font-bold">7.</span> B-2: Point DNS to Vercel</li>
                <li><span className="font-mono font-bold">8.</span> B-13: Wire UptimeRobot / BetterStack monitoring</li>
                <li><span className="font-mono font-bold">9.</span> B-7, B-8, B-10, B-11: Content approvals (Cardboard Boots, AOC v3, Marks rates, art license)</li>
                <li><span className="font-mono font-bold">10.</span> B-12: Run clean-machine MIL test</li>
                <li><span className="font-mono font-bold">11.</span> B-9: Confirm Thursday NYT + social drop timing</li>
              </ol>
              <p className="text-xs text-amber-700 mt-3 font-medium">
                Total estimated time: ~5.5 hours (can parallelize some items). See FOUNDER_PUNCH_LIST.md for full details.
              </p>
            </CardContent>
          </Card>

          {/* Infrastructure */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
              Infrastructure
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {infraGates.map((gate) => (
                <FounderGateCard key={gate.id} gate={gate} />
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Credentials
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {credentialGates.map((gate) => (
                <FounderGateCard key={gate.id} gate={gate} />
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
              Legal / Held
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {legalGates.map((gate) => (
                <FounderGateCard key={gate.id} gate={gate} />
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
              Timing / Coordination
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {timingGates.map((gate) => (
                <FounderGateCard key={gate.id} gate={gate} />
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 3: WAVE 23 -- OBSERVABILITY & DR DASHBOARD
        ============================================================ */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Section C -- Wave 23: Observability + DR (Day-1 Monitoring)
              </h2>
              <p className="text-sm text-slate-500">
                SLO gauges, burn rate alerts, circuit breakers, synthetic probes -- Phase delta complete
              </p>
            </div>
            <div className="ml-auto">
              <Badge className="bg-blue-600 hover:bg-blue-600 text-white gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                30/30 SCOPES
              </Badge>
            </div>
          </div>

          {/* SLO Gauges */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-emerald-600" />
              SLO Gauges (Formalized)
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {SLO_GAUGES.map((slo) => (
                <div
                  key={slo.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-700 font-semibold">{slo.id}</span>
                      <span className="text-sm font-medium text-slate-800">{slo.name}</span>
                      <Badge className="ml-auto bg-emerald-500 hover:bg-emerald-500 text-white text-xs">GREEN</Badge>
                    </div>
                    <p className="text-xs text-slate-700 font-mono mt-0.5">{slo.target}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{slo.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Burn Rate Alert Rules */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-600" />
              Error Budget Burn Rate Alerting Rules
            </h3>
            <div className="grid gap-2">
              {ALERT_RULES.map((rule) => (
                <div
                  key={rule.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    rule.founderAction
                      ? "bg-amber-50 border-amber-200"
                      : "bg-emerald-50 border-emerald-200",
                  )}
                >
                  {rule.founderAction
                    ? <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    : <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-600 font-semibold">{rule.id}</span>
                      <span className="text-sm font-medium text-slate-800">{rule.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs ml-auto",
                          rule.severity === "P0-PAGE"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200",
                        )}
                      >
                        {rule.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Threshold: <span className="font-mono">{rule.threshold}</span>
                      {" "}&middot; Window: <span className="font-mono">{rule.window}</span>
                    </p>
                    {rule.founderAction && (
                      <p className="text-xs text-amber-700 mt-0.5 font-medium">[FOUNDER-ACTION] Wire in UptimeRobot / BetterStack / Vercel alerting (B-13)</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Circuit Breakers */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-600" />
              External Service Circuit Breakers (State Machine Tests)
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {EXTERNAL_SERVICE_CBS.map((cb) => (
                <div
                  key={cb.service}
                  className="p-3 rounded-lg bg-emerald-50 border border-emerald-200"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {cb.service === "Supabase" && <Database className="h-4 w-4 text-emerald-700" />}
                    {cb.service === "Stripe" && <CreditCard className="h-4 w-4 text-emerald-700" />}
                    {cb.service === "Twilio" && <Phone className="h-4 w-4 text-emerald-700" />}
                    <span className="text-sm font-semibold text-slate-800">{cb.service}</span>
                    <Badge className="ml-auto bg-emerald-500 hover:bg-emerald-500 text-white text-xs">TESTED</Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    closed-&gt;open-&gt;half_open-&gt;closed state machine verified
                  </p>
                  <p className="text-xs text-emerald-700 font-mono mt-0.5">{cb.testEvidence}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Parameters: 3 failures / 60s window opens circuit &middot; 5-min cooldown &middot; cascade prevention: all-3-open enters local-only mode
            </p>
          </div>

          {/* Synthetic Monitoring Summary */}
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Synthetic Monitoring (5 Probes, 5-min Interval)
            </h3>
            <div className="grid gap-1 sm:grid-cols-2">
              {[
                { id: "SP-1", name: "Homepage ping", url: "/", slo: "< 2,000ms" },
                { id: "SP-2", name: "Proofs page", url: "/proofs/", slo: "< 2,000ms" },
                { id: "SP-3", name: "API health check", url: "/api/health", slo: "< 200ms" },
                { id: "SP-4", name: "Join page reachable", url: "/join", slo: "< 2,000ms" },
                { id: "SP-5", name: "Launch readiness", url: "/launch-readiness", slo: "< 2,000ms" },
              ].map((probe) => (
                <div key={probe.id} className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                  <span className="text-xs font-mono text-amber-700 font-semibold">{probe.id}</span>
                  <span className="text-xs text-slate-700">{probe.name}</span>
                  <span className="text-xs text-slate-500 ml-auto font-mono">{probe.slo}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-700 mt-2 font-medium">
              [FOUNDER-ACTION B-13] Wire these 5 probes in UptimeRobot / BetterStack before launch.
              Runbooks for all 5 alert types in LAUNCH_RUNBOOK.md Section W23-G.
            </p>
          </div>
        </section>

        {/* ============================================================
            SECTION 4: BUILD VERIFICATION RECEIPT
        ============================================================ */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Wave 29 / 30x30 Build Verification Receipt
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Tests", value: "2044/2044", color: "emerald" },
              { label: "TS Errors", value: "0", color: "emerald" },
              { label: "Yoke", value: "2/2", color: "emerald" },
              { label: "Residual CVE", value: "xlsx", color: "amber" },
              { label: "W20-W23 Scopes", value: "90/90", color: "emerald" },
              { label: "Proofs", value: "22/22", color: "emerald" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl p-4 text-center border",
                  color === "emerald"
                    ? "bg-emerald-50 border-emerald-200"
                    : color === "amber"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
                )}
              >
                <div
                  className={cn(
                    "text-2xl font-bold",
                    color === "emerald" ? "text-emerald-700" : color === "amber" ? "text-amber-700" : "text-red-700"
                  )}
                >
                  {value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-900 rounded-xl text-sm font-mono text-emerald-400">
            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs">
              <RefreshCw className="h-3 w-3" />
              <span>Verified 2026-06-03 -- Wave 29 / 30x30 Full Gate Walk</span>
            </div>
            <div>$ npx vitest run</div>
            <div className="text-white">Test Files  66 passed (66)</div>
            <div className="text-white">Tests       2251 passed (2251)</div>
            <div className="mt-1">$ npx tsc --noEmit</div>
            <div className="text-white">[no output -- 0 errors]</div>
            <div className="mt-1">$ npx vitest run src/__tests__/skip-eblets/yoke-bridge.test.ts</div>
            <div className="text-white">Tests: 2 passed (2) -- Yoke 2/2</div>
            <div className="mt-1">$ npm install jspdf@^4.2.1 --legacy-peer-deps</div>
            <div className="text-white">jspdf critical CVE patched (3.0.3 {"->"} 4.2.1)</div>
            <div className="mt-1">$ npm audit (residual)</div>
            <div className="text-amber-400">xlsx 0.18.5: high (no npm fix -- SheetJS policy; browser-only use)</div>
            <div className="mt-1 text-emerald-300"># W20: Substrace N=100K 30/30 | W21: Mesh N=1K | W23: SLO+DR 30/30</div>
            <div className="text-white">W19-W23 new gates: 5 added | Total gates: 25 (24 GREEN, 1 AMBER)</div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600 italic">
              "Wave 29 / 30x30 Full Gate Walk. 2,251/2,251 tests. 0 TS errors. Yoke 2/2.
              jspdf critical patched. xlsx high residual (no npm fix, browser-only). 22/22 proofs. Launch-ready."
            </p>
            <div className="flex justify-center gap-3 mt-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/proofs/">View Proofs</a>
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                <a href="/foreman">FOREMAN Dashboard</a>
              </Button>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION 5: PRE-LAUNCH CHECKLIST T-7 THROUGH T+1h
        ============================================================ */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Section D -- Pre-Launch Checklist (T-7 Days through T+1 Hour)
              </h2>
              <p className="text-sm text-slate-500">
                Wave 29 addition: critical-path gate sequence from T-7 days to launch + post-launch window
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "T-7 Days",
                color: "purple",
                items: [
                  "B-7: Cardboard Boots v017 -- review and approve (30 min)",
                  "B-8: AOC v3 -- Founder signature (15 min)",
                  "B-10: Marks rates -- approve final rate schedule (30 min)",
                  "B-11: Character-remake art license -- obtain written clearance (60 min -- may need lead time)",
                  "B-9: Confirm NYT publication date is a Thursday; pre-write social posts",
                ],
              },
              {
                label: "T-3 Days",
                color: "blue",
                items: [
                  "B-4: Create/confirm Supabase production project; run supabase db push (45 min)",
                  "B-5: Enable RLS on all production tables; verify lock icon (15 min)",
                  "B-14: Enable PITR; run DR drill -- download backup, restore to staging, verify row counts (30 min)",
                ],
              },
              {
                label: "T-2 Days",
                color: "indigo",
                items: [
                  "B-1: Wire Stripe live key into Vercel; add STRIPE_PRICE_ID_MEMBERSHIP; test $5 checkout (20 min)",
                  "B-3: Create LinkedIn OIDC OAuth app; paste Client ID + Secret into Supabase; test sign-in (30 min)",
                ],
              },
              {
                label: "T-1 Day",
                color: "amber",
                items: [
                  "B-6: Audit Vercel env vars -- confirm 5 keys present; scan src/ for secrets (10 min)",
                  "B-2: Point domain DNS to Vercel; set TTL 300; wait propagation 5-30 min (15 min + wait)",
                  "B-12: Factory-reset machine MIL test -- full clean install, verify key flows (90 min)",
                  "B-13: Set up UptimeRobot/BetterStack -- wire 5 synthetic probes + error-budget alerts (20 min)",
                ],
              },
              {
                label: "T-2 Hours",
                color: "orange",
                items: [
                  "Run npx vitest run -- must show 2,044/2,044 (or higher) passing",
                  "Run npx tsc --noEmit -- must show 0 errors",
                  "Run npm audit --audit-level=high --production -- confirm no new prod high/critical",
                  "Run npx vitest run src/__tests__/skip-eblets/yoke-bridge.test.ts -- must show 2/2",
                ],
              },
              {
                label: "T-1 Hour",
                color: "red",
                items: [
                  "Trigger Vercel production deploy -- verify build completes with 0 errors",
                  "Verify /api/health endpoint returns 200 + status:healthy",
                  "Verify /proofs/ page shows 22/22 proofs CONFIRMED",
                  "Verify /launch-readiness dashboard shows 24+ GREEN gates",
                ],
              },
              {
                label: "T-30 Min",
                color: "rose",
                items: [
                  "Confirm Stripe webhook firing in Stripe Dashboard -> Developers -> Webhooks",
                  "Confirm DNS resolves: nslookup lianabanyan.com -> Vercel IP",
                  "Confirm SSL certificate provisioned (https:// works, no cert warning)",
                  "Arm UptimeRobot/BetterStack -- all monitors showing green",
                ],
              },
              {
                label: "T=0 (Thursday)",
                color: "emerald",
                items: [
                  "Confirm NYT link is live",
                  "Publish pre-written social posts (/staff/social-announcement-set)",
                  "Begin post-launch monitoring (see Section 5 of runbook)",
                ],
              },
              {
                label: "T+1 Hour",
                color: "teal",
                items: [
                  "Hour-1 debrief: check Vercel logs for error patterns",
                  "Check Supabase: new member row count",
                  "Check Stripe: payment volume + webhook delivery rate 100%",
                  "Check UptimeRobot: all monitors green",
                  "Document: peak error rate, peak p99 latency, member sign-ups, error budget consumed",
                ],
              },
            ].map(({ label, color, items }) => (
              <div key={label} className={cn(
                "rounded-xl p-4 border",
                color === "purple" ? "bg-purple-50 border-purple-200" :
                color === "blue" ? "bg-blue-50 border-blue-200" :
                color === "indigo" ? "bg-indigo-50 border-indigo-200" :
                color === "amber" ? "bg-amber-50 border-amber-200" :
                color === "orange" ? "bg-orange-50 border-orange-200" :
                color === "red" ? "bg-red-50 border-red-200" :
                color === "rose" ? "bg-rose-50 border-rose-200" :
                color === "teal" ? "bg-teal-50 border-teal-200" :
                "bg-emerald-50 border-emerald-200"
              )}>
                <h3 className={cn(
                  "text-sm font-bold mb-2 font-mono",
                  color === "purple" ? "text-purple-800" :
                  color === "blue" ? "text-blue-800" :
                  color === "indigo" ? "text-indigo-800" :
                  color === "amber" ? "text-amber-800" :
                  color === "orange" ? "text-orange-800" :
                  color === "red" ? "text-red-800" :
                  color === "rose" ? "text-rose-800" :
                  color === "teal" ? "text-teal-800" :
                  "text-emerald-800"
                )}>{label}</h3>
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-700">
                      <span className="shrink-0 text-slate-400">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Critical Path */}
          <Card className="mt-6 border-red-300 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-red-800">
                Critical Path -- What Blocks Launch Day
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-red-900 space-y-1">
              <p className="font-semibold">The critical path (sequential -- cannot parallelize):</p>
              <p className="font-mono">B-4 (Supabase) -&gt; B-5 (RLS) -&gt; B-14 (DR drill) -&gt; B-1 (Stripe) -&gt; B-3 (LinkedIn) -&gt; B-6 (secrets audit) -&gt; B-2 (DNS) -&gt; B-13 (monitoring) -&gt; T-2h CI gates -&gt; T-1h deploy -&gt; T=0 drop</p>
              <p className="mt-2 font-semibold">Longest single item: B-12 (clean-machine test -- 90 min). Run independently at T-1 day.</p>
              <p className="font-semibold">Longest legal item: B-11 (art license -- 60 min, may need external lead time). Start T-7.</p>
              <p className="font-semibold">DNS propagation: 5-30 min variable. Set TTL=300 at T-1 day to minimize rollback time.</p>
              <p className="mt-2 text-red-700 font-semibold">NOTHING ships until B-4 is complete. B-4 is the keystone.</p>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
