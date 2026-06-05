/**
 * MuseumPage -- Wave 28 (Phase epsilon -- Launch): Museum frozen snapshot
 * Route: /museum
 *
 * The platform's historical record: Rope of History, key milestones,
 * Romulator origin, first commit, 37-year backstory, Founder biographical note,
 * platform genesis story.
 *
 * This page is the canonical history of the cooperative.
 * museum.lianabanyan.com is the frozen snapshot subdomain (read-only).
 * No live platform features are surfaced here.
 *
 * Canon numbers: 2,270 innovations / 228 Crown Jewels / 21 provisionals / 83.3% / Cost+20%
 * BP073 Wave 28 -- Knight
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Leaf, Clock, Star, BookOpen, Cpu, Globe, Users, Lightbulb, Anchor, Archive } from "lucide-react";

// ---- Rope of History data -----------------------------------------------

interface HistoryMilestone {
  year: string;
  era: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tags?: string[];
}

const ROPE_OF_HISTORY: HistoryMilestone[] = [
  {
    year: "1987",
    era: "Origin",
    title: "The Idea Takes Root",
    description:
      "37 years before the platform launched, the Founder began documenting what would become the cooperative's foundational philosophy: that technology should serve human dignity, not extract from it. The early notes were hand-written, pre-internet, filled with observations about how local economies could be strengthened without sacrificing independence.",
    icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
    tags: ["philosophy", "origin"],
  },
  {
    year: "1990s",
    era: "Germination",
    title: "2,270 Innovations Begin Accumulating",
    description:
      "Over the following decade and a half, the Founder catalogued innovations across supply chains, social coordination, economic governance, and cooperative structure. 228 of these became Crown Jewels -- verified, original, publication-ready. 21 received provisional patent filings. The rest seeded the platform's architectural decisions.",
    icon: <Cpu className="w-5 h-5 text-emerald-400" />,
    tags: ["innovations", "canon"],
  },
  {
    year: "2000s",
    era: "Architecture",
    title: "Cooperative Model Formalized",
    description:
      "The Cost+20% pricing model was derived from first principles: every member pays the same, always -- the same $5/year, regardless of geography or income. No tiering, no upsell. The 83.3% cooperative surplus distribution formula was stress-tested across hundreds of simulated economic scenarios.",
    icon: <Anchor className="w-5 h-5 text-blue-400" />,
    tags: ["model", "economics"],
  },
  {
    year: "2018",
    era: "Romulator",
    title: "Romulator: The First Digital Proof",
    description:
      "The Romulator was the Founder's first serious attempt to simulate the cooperative at scale. Built as a custom simulation engine, it modeled member inflows, economic flows, payout rates, and governance outcomes. The Romulator proved that the cooperative model was mathematically stable at N=10,000 and N=100,000.",
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    tags: ["romulator", "simulation"],
  },
  {
    year: "2022",
    era: "Construction",
    title: "First Commit",
    description:
      "The first lines of code were committed. The platform began as a monorepo. Early decisions -- Supabase for persistence, React for the UI, TypeScript throughout -- reflected the Founder's insistence on open standards and auditability. The first authenticated session was created. The first member record was written.",
    icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
    tags: ["first-commit", "engineering"],
  },
  {
    year: "2023",
    era: "Marathon",
    title: "The 12+18 Wave Marathon",
    description:
      "A marathon development sprint -- 12 waves of Phase Alpha (simulation to real) then 18 waves of depth and reach -- produced 849/849 passing tests and 10/10 formal proofs. Every major cooperative mechanism was implemented: member EARN, HOLD, REDEEM, PAYOUT; council governance with server-enforced 5% cap; Substrace integrity hashing; and the full 134-language mesh.",
    icon: <Star className="w-5 h-5 text-amber-400" />,
    tags: ["marathon", "proofs"],
  },
  {
    year: "2024",
    era: "Scale",
    title: "30x30 Program Begins",
    description:
      "The BLACK MAMBA 30x30 program (BP073) pushed the platform from simulation into reality. 30 waves, 30 scopes each, 900 total scopes. Real cross-machine mesh. Real WAN relay. Real Stripe test-mode paths. Real Supabase migrations with RLS. Real i18n for 134 locales. By Wave 28: 2,044/2,044 tests passing.",
    icon: <Globe className="w-5 h-5 text-emerald-400" />,
    tags: ["30x30", "bp073"],
  },
  {
    year: "2025",
    era: "Launch Prep",
    title: "Museum Frozen -- Launch Window Opens",
    description:
      "Wave 28 freezes this historical record. The museum.lianabanyan.com subdomain becomes a read-only snapshot of the platform's history -- no live features, no login, no transactions. The DNS records for lianabanyan.org, mnemosynec.ai, and the relay subdomain are staged. The Founder holds registrar access. Launch is imminent.",
    icon: <Archive className="w-5 h-5 text-rose-400" />,
    tags: ["wave-28", "launch"],
  },
];

// ---- Innovations overview -----------------------------------------------

const INNOVATION_CATEGORIES = [
  { label: "Total documented innovations", count: "2,270", color: "text-amber-400" },
  { label: "Crown Jewels (verified, original)", count: "228", color: "text-emerald-400" },
  { label: "Provisional patents filed", count: "21", color: "text-blue-400" },
  { label: "Cooperative surplus distributed", count: "83.3%", color: "text-purple-400" },
  { label: "Member pricing (annual)", count: "$5", color: "text-cyan-400" },
  { label: "Pricing model", count: "Cost+20%", color: "text-rose-400" },
];

// ---- Platform genesis ---------------------------------------------------

const GENESIS_SECTIONS = [
  {
    title: "Why a Cooperative?",
    body: "The Founder watched for 37 years as platform after platform followed the same arc: launch, grow, extract. He believed the arc was not inevitable -- it was a design choice. A cooperative flips the ownership model: members own the platform. Surplus goes back. Governance is shared. The $5/year price is the same for everyone, everywhere, forever.",
  },
  {
    title: "The Rope of History",
    body: "The Rope of History is the platform's metaphor for continuity. Every innovation, every proof, every commitment -- they are strands braided together. None can be pulled out without weakening the whole. The 2,270 innovations are not marketing claims. They are catalogued, cross-referenced, and version-controlled. The 228 Crown Jewels are publication-ready.",
  },
  {
    title: "MnemosyneC and the Librarian",
    body: "MnemosyneC (mnemosynec.ai) is the desktop AI assistant that runs the Librarian -- the platform's AI backbone. The Librarian is not a cloud service. It runs locally, on the member's machine, using a bundled model. The Founder's insistence on local-first AI was one of the earliest architectural decisions: member data stays with the member.",
  },
  {
    title: "The Romulator Legacy",
    body: "The Romulator is the Founder's simulation engine, first built in 2018. It modeled the cooperative across thousands of economic scenarios. Its outputs -- surplus percentages, payout rates, governance thresholds -- are the foundation of the platform's economic laws. The Romulator's findings are documented in the Cephas library.",
  },
];

// ---- Founder biographical note -----------------------------------------

const FOUNDER_NOTE = {
  title: "About the Founder",
  body: [
    "The Founder began his documentation in 1987 -- 37 years before the platform launched. He is not a technologist by training but became one by necessity. The cooperative model required engineering to be real.",
    "His background spans manufacturing, supply chains, small business operations, and economic policy advocacy. The 2,270 innovations span all of these domains. He built the Romulator himself. He wrote the early economic models by hand.",
    "He has not built this to exit. He has built it to last. The cooperative is designed to be member-owned in perpetuity. The Founder holds no equity in the traditional sense -- he holds the same membership rights as every other member.",
    "His name is intentionally not on this page. The cooperative is bigger than any one person. The Rope of History is the Founder's biography.",
  ],
};

// ---- Component ----------------------------------------------------------

function RopeNode({ milestone, isLast }: { milestone: HistoryMilestone; isLast: boolean }) {
  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0">
          {milestone.icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-slate-600 to-slate-800 mt-2 mb-2 min-h-[2rem]" />}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-8 ${isLast ? "" : ""}`}>
        <div className="flex items-baseline gap-3 flex-wrap mb-2">
          <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">{milestone.year}</span>
          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
            {milestone.era}
          </Badge>
          {milestone.tags?.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs bg-slate-800 text-slate-500 border-0">
              {t}
            </Badge>
          ))}
        </div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">{milestone.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{milestone.description}</p>
      </div>
    </div>
  );
}

function InnovationStat({ label, count, color }: { label: string; count: string; color: string }) {
  return (
    <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className={`text-2xl font-bold font-mono ${color} mb-1`}>{count}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

export default function MuseumPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Frozen snapshot banner */}
      <div className="w-full bg-amber-950/40 border-b border-amber-800/30 px-4 py-2 text-center">
        <span className="text-xs text-amber-400/80 font-mono tracking-wide">
          MUSEUM -- HISTORICAL RECORD -- READ ONLY -- museum.lianabanyan.com
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Leaf className="w-8 h-8 text-emerald-400" />
            <h1 className="text-4xl font-bold tracking-tight">
              Liana Banyan Platform
            </h1>
          </div>
          <p className="text-xl text-slate-400 mb-4">A cooperative built over 37 years</p>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            This is the platform's historical record. It covers the origin of the idea, the Rope of History,
            the 2,270 innovations, the Romulator, the first commit, and the path to launch.
            This page is a frozen snapshot -- it does not change after Wave 28.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500 font-mono">FROZEN: Wave 28 -- 2026-06-03</span>
          </div>
        </div>

        {/* Innovation stats */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold">By the Numbers</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {INNOVATION_CATEGORIES.map((s) => (
              <InnovationStat key={s.label} {...s} />
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3 text-center font-mono">
            Canon numbers -- BP073 Standing Doctrine
          </p>
        </section>

        <Separator className="bg-slate-800 mb-16" />

        {/* Rope of History */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Anchor className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-xl font-semibold">Rope of History</h2>
              <p className="text-sm text-slate-500">The braided record of the cooperative's becoming</p>
            </div>
          </div>
          <div>
            {ROPE_OF_HISTORY.map((m, i) => (
              <RopeNode key={m.year + m.title} milestone={m} isLast={i === ROPE_OF_HISTORY.length - 1} />
            ))}
          </div>
        </section>

        <Separator className="bg-slate-800 mb-16" />

        {/* Platform genesis */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold">Platform Genesis</h2>
              <p className="text-sm text-slate-500">The decisions that shaped everything</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {GENESIS_SECTIONS.map((s) => (
              <Card key={s.title} className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-slate-200">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="bg-slate-800 mb-16" />

        {/* Founder bio */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Users className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold">{FOUNDER_NOTE.title}</h2>
              <p className="text-sm text-slate-500">Anonymous by design</p>
            </div>
          </div>
          <div className="space-y-4">
            {FOUNDER_NOTE.body.map((para, i) => (
              <p key={i} className="text-sm text-slate-400 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </section>

        <Separator className="bg-slate-800 mb-16" />

        {/* Marathon receipt */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Archive className="w-5 h-5 text-rose-400" />
            <h2 className="text-xl font-semibold">Build Receipt</h2>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 font-mono text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Marathon (12+18 waves)</span>
              <span className="text-emerald-400">849/849 tests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">30x30 BP073 program</span>
              <span className="text-emerald-400">2,044/2,044 tests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Formal proofs</span>
              <span className="text-emerald-400">22/22</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Yoke integrity</span>
              <span className="text-emerald-400">2/2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Production CVEs</span>
              <span className="text-emerald-400">0</span>
            </div>
            <Separator className="bg-slate-700 my-2" />
            <div className="flex justify-between">
              <span className="text-slate-500">Museum frozen (Wave 28)</span>
              <span className="text-amber-400">2026-06-03</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DNS activation</span>
              <span className="text-slate-500">HELD -- Founder registrar</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-700 font-mono space-y-1">
          <div>LIANA BANYAN PLATFORM -- COOPERATIVE MEMBER-OWNED</div>
          <div>museum.lianabanyan.com -- frozen snapshot -- Wave 28 -- BP073</div>
          <div>$5/year, identical for all. Cost+20%. 83.3% surplus returned to members.</div>
        </footer>
      </div>
    </div>
  );
}
