/**
 * THE 2ND SECOND PORTAL — Redesigned with Container-Flip Cards
 * =============================================================
 * the2ndsecond.com — The Distributed Factory
 *
 * Section 1: "What Can You Do Here?" — 3 value-prop flip cards (hero)
 * Section 2: "You Can Do This Too" — HexIsle Template with Level A/B/C flip triggers
 * Section 3: "Join the Prototyper Guild" — 3-step flip triggers + Register My Printer
 * Section 4: "Explore More" — footer links for user agency
 *
 * Post-join: STL Vault / Test & Report / NOIDS tabs (same as before)
 *
 * All content SEC-safe. No invest/equity/ROI/shares/dividend/profit/ownership.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Printer,
  Box,
  Upload,
  CheckCircle2,
  Factory,
  FileDown,
  Camera,
  Award,
  ShieldCheck,
  Rocket,
  Network,
  Clock,
  ShieldAlert,
  Flame,
  DollarSign,
  Users,
  Heart,
  Layers,
  Shuffle,
  Lock,
  Telescope,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  ContainerFlipControlled,
  type FlipTopic,
} from "@/components/ContainerFlip";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ── Topic data for each flip container ──

const VALUE_PROP_TOPICS: FlipTopic[] = [
  {
    title: "Getting Funded",
    icon: DollarSign,
    quickFacts:
      "The platform uses a patent sponsorship model — not venture capital. Your product is backed by the IP portfolio (1,511 patent claims). Sponsors contribute to pools, not to your company. You keep full control. The Cost+20% pricing model means you keep 83.3% of every sale.",
    intermediate:
      "Two sponsorship mechanisms: (1) Global Sponsor Pool — diversified across all platform projects, balanced quarterly. (2) Patent Buckets — concentrated funding for specific innovations. The 60/20/20 split: 60% platform operations, 20% creator allocation, 20% external capital pool. All stakes are capped at $10M with splitting for accessibility. This is service sponsorship — sponsors receive platform benefits, not securities.",
    deepLink: {
      label: "Read the Economics",
      route: "/economics",
    },
  },
  {
    title: "Build a Team with Marks",
    icon: Users,
    quickFacts:
      "Post bounties on the platform. Contributors complete work and earn Marks — an effort-debt currency backed by the patent portfolio. Marks clear through participation, not cash. You build a team without spending money. Contributors earn real platform value.",
    intermediate:
      "Four bounty types: NOID bounties (specialized distributed systems roles), Academic bounties (Didasko research), Platform bounties (core infrastructure), and Project bounties (your specific needs). Contributors can escalate to NOID roles by locking reputation as collateral for higher-value contracts with time-based bonus structures (faster completion = more Marks).",
    deepLink: {
      label: "Browse All Bounties",
      route: "/help-wanted",
    },
  },
  {
    title: "Bring Dreams to Life",
    icon: Heart,
    quickFacts:
      "Back projects from real creators. You receive the product or service you preordered — that is the primary value. You also earn a project medallion (a notarized record of your contribution) and Joules (internal platform working power). No speculation. No securities. Just supporting good work and getting real things in return.",
    intermediate:
      "Two tracks: Product-Only Track (just get what you ordered) or Backer Track (product + medallion + Joules). Joules use a \"forever stamp\" mechanic — they lock the exchange rate at the moment of earning, so 1 Joule always buys what it could when you earned it. Joules never become cash, never turn into securities, and their value does not change based on project performance. This is service sponsorship, not financial speculation.",
    deepLink: {
      label: "Learn About Backing",
      route: "/crows-nest",
    },
  },
];

const HEXISLE_TEMPLATE_TOPICS: FlipTopic[] = [
  {
    title: "Level A — Open",
    icon: Rocket,
    quickFacts:
      "Like HexIsle itself. Your STL files are freely available, your IP is included in the patent portfolio, and you get maximum community backing and volume. The community prints, tests, and improves your designs — and you earn Marks from every contribution.",
    intermediate:
      "Open means the community can freely download and print your designs for personal use. Commercial production still goes through the platform. You benefit from the entire distributed factory network: hundreds of printers, real-world testing data through Quorum Aggregation, and continuous design improvement. The trade-off is maximum exposure for maximum volume.",
    deepLink: {
      label: "Explore in the Crow's Nest",
      route: "/crows-nest",
    },
  },
  {
    title: "Level B — Hybrid",
    icon: Shuffle,
    quickFacts:
      "Keep more control while sharing specific components. You choose which parts are open and which are restricted. Balanced creator percentage — higher per-unit value, moderate community multiplier. Ideal for creators who want feedback on some parts while protecting key innovations.",
    intermediate:
      "Hybrid engagement lets you designate individual components as Open (community-printable) or Restricted (platform-produced only). Your restricted components benefit from the platform's manufacturing partnerships. You set the split — more restricted means higher per-unit margin, more open means higher volume. The Contingency Operators simulator lets you model different splits before committing.",
    deepLink: {
      label: "Try the Simulator",
      route: "/crows-nest",
    },
  },
  {
    title: "Level C — Closed",
    icon: Lock,
    quickFacts:
      "Maximum control, traditional IP protection. Your designs stay private and are produced only through authorized channels. Lower community multiplier but highest per-unit creator allocation. Best for products where design secrecy is critical.",
    intermediate:
      "Closed engagement uses the platform for distribution, payment processing, and the three-currency system, but keeps your designs fully proprietary. You still benefit from the patent portfolio protection (your IP is shielded alongside 1,511 claims), but you handle your own manufacturing. Community testing is opt-in via NDA-protected NOID contracts.",
    deepLink: {
      label: "Read About IP Protection",
      route: "/crows-nest",
    },
  },
];

const GUILD_STEP_TOPICS: FlipTopic[] = [
  {
    title: "Get Free STLs",
    icon: FileDown,
    quickFacts:
      "Access the Master STL Vault with 1,200+ CAD files. The 24 HexIsle core components are free for personal use immediately upon registration. Print them on any FDM or SLA printer — no strings attached.",
    intermediate:
      "The STL Vault contains every printable component in the HexIsle system: character bases, hex tiles, compliant mechanisms, IIFIS boots, treasury coins, merchant coffers, and more. Files are tagged by printer type (FDM/SLA), difficulty, and estimated print time (once Test-Pilots establish the specs). New files are added as the design evolves through community feedback.",
    deepLink: {
      label: "Preview the Vault",
      route: "/crows-nest",
    },
  },
  {
    title: "Print & Test",
    icon: Printer,
    quickFacts:
      "Print the files on your own printer for personal use. Test tolerances, compliant mechanisms, and IIFIS boots. Upload your results — print times, material usage, fit notes, and photos — to help establish the official specs through Quorum Aggregation.",
    intermediate:
      "Quorum Aggregation means your test data is combined with results from other Test-Pilots to establish verified specifications. No single report sets the standard — it takes consensus across multiple independent tests. This distributed quality assurance is what makes the platform different from traditional manufacturing. Every report you submit earns Marks and improves the product for everyone.",
    deepLink: {
      label: "How Quorum Works",
      route: "/crows-nest",
    },
  },
  {
    title: "Earn Marks",
    icon: Award,
    quickFacts:
      "Upload photos and test specs to earn Marks backed by the Liana Banyan patent portfolio. Marks are an effort-debt currency — they emerge from the differential between your contribution and the platform's value. Marks clear through continued participation.",
    intermediate:
      "Marks are one of three platform currencies (Credits, Marks, Joules). Unlike Credits (purchased with dollars), Marks can only be earned through effort. They are restricted to essential spending categories: food, medical, and platform services. Marks never expire but can only be cleared (converted to Credits) through ongoing participation. The more you contribute, the more your Marks are worth.",
    deepLink: {
      label: "Three-Currency System",
      route: "/economics",
    },
  },
];

// ── Component ──

export default function The2ndSecondPortal() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleJoinGuild = () => {
    navigate('/register-maker');
  };

  const handleUploadReport = () => {
    navigate('/test-pilot');
  };

  const registerButton = (
    <Button
      size="lg"
      className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 w-full sm:w-auto"
      onClick={handleJoinGuild}
    >
      Register My Printer
    </Button>
  );

  return (
    <PortalPageLayout>
      {/* ═══════════════ HEADER ═══════════════ */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-zinc-800 rounded-full text-zinc-100">
          <Factory className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            The 2nd Second Industrial Revolution
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The Distributed Factory. Download STLs, print prototypes, and earn
            IP-backed Platform Value.
          </p>
        </div>
      </div>

      {/* ═══════════════ SECTION 1: VALUE PROPOSITIONS (HERO) ═══════════════ */}
      <section className="mb-14" aria-labelledby="value-props-heading">
        <ContainerFlipControlled
          topics={VALUE_PROP_TOPICS}
          className="w-full"
          renderFront={({ flipToTopic }) => (
            <Card className="border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="p-4 bg-emerald-100 dark:bg-emerald-900 rounded-full flex-shrink-0">
                    <Sparkles className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h2
                      id="value-props-heading"
                      className="text-xl font-bold text-slate-900 dark:text-white mb-2"
                    >
                      What Can You Do Here?
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Three ways the platform works for you — click any box to
                      learn more.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <button
                        className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-transparent hover:border-emerald-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        onClick={() => flipToTopic(0)}
                        aria-label="Learn about Getting Funded — click to flip"
                      >
                        <span className="font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          Getting Funded
                        </span>
                        <p className="text-slate-500 mt-1">
                          Launch without venture capital. IP-backed sponsorship
                          model — no pitch decks needed.
                        </p>
                        <span className="text-[10px] text-emerald-500 mt-2 block font-medium">
                          Click to learn more →
                        </span>
                      </button>
                      <button
                        className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-transparent hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        onClick={() => flipToTopic(1)}
                        aria-label="Learn about building a team with Marks — click to flip"
                      >
                        <span className="font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Build a Team with Marks
                        </span>
                        <p className="text-slate-500 mt-1">
                          Post bounties. People work, earn Marks backed by the
                          patent portfolio. No cash outlay.
                        </p>
                        <span className="text-[10px] text-blue-500 mt-2 block font-medium">
                          Click to learn more →
                        </span>
                      </button>
                      <button
                        className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-transparent hover:border-rose-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        onClick={() => flipToTopic(2)}
                        aria-label="Learn about backing projects — click to flip"
                      >
                        <span className="font-bold text-rose-600 group-hover:text-rose-700 flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5" />
                          Bring Dreams to Life
                        </span>
                        <p className="text-slate-500 mt-1">
                          Back projects you believe in. Get the product, earn a
                          medallion, accumulate Joules.
                        </p>
                        <span className="text-[10px] text-rose-500 mt-2 block font-medium">
                          Click to learn more →
                        </span>
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 mt-4">
                      This is service sponsorship, not financial speculation.
                      Medallions are notarized records, not securities. Joules
                      are internal working power — never become cash.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        />

        {/* SEC-safe disclosure (visible when not flipped) */}
        <p className="text-[11px] text-muted-foreground/60 text-center mt-4 max-w-3xl mx-auto sr-only">
          This is service sponsorship, not financial speculation. You receive
          the product or service you preorder. Medallions are notarized records,
          not securities. Joules are internal working power — they never become
          cash and never change based on project performance.
        </p>
      </section>

      {/* ═══════════════ SECTION 2: HEXISLE TEMPLATE ═══════════════ */}
      <section className="mb-14" aria-labelledby="template-heading">
        <ContainerFlipControlled
          topics={HEXISLE_TEMPLATE_TOPICS}
          className="w-full"
          renderFront={({ flipToTopic }) => (
            <Card className="border-2 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                    <Rocket className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3
                      id="template-heading"
                      className="text-xl font-bold text-slate-900 dark:text-white mb-2"
                    >
                      You Can Do This Too: The HexIsle Template
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Everything we are doing with HexIsle is just the first
                      real-life example. You can launch your own product line
                      using this exact same engine. When you launch, you choose
                      your Level of Engagement:
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <button
                        className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-transparent hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        onClick={() => flipToTopic(0)}
                        aria-label="Learn about Level A Open engagement — click to flip"
                      >
                        <span className="font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1.5">
                          <Rocket className="h-3.5 w-3.5" />
                          Level A (Open)
                        </span>
                        <p className="text-slate-500 mt-1">
                          Like HexIsle. Free STLs, IP included, maximum
                          community backing and volume.
                        </p>
                        <span className="text-[10px] text-blue-500 mt-2 block font-medium">
                          Click to learn more →
                        </span>
                      </button>
                      <button
                        className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-transparent hover:border-purple-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        onClick={() => flipToTopic(1)}
                        aria-label="Learn about Level B Hybrid engagement — click to flip"
                      >
                        <span className="font-bold text-purple-600 group-hover:text-purple-700 flex items-center gap-1.5">
                          <Shuffle className="h-3.5 w-3.5" />
                          Level B (Hybrid)
                        </span>
                        <p className="text-slate-500 mt-1">
                          Keep more control, share specific components. Balanced
                          creator percentage.
                        </p>
                        <span className="text-[10px] text-purple-500 mt-2 block font-medium">
                          Click to learn more →
                        </span>
                      </button>
                      <button
                        className="bg-white dark:bg-slate-900 p-4 rounded-lg border-2 border-transparent hover:border-slate-400 hover:shadow-md transition-all text-left cursor-pointer group"
                        onClick={() => flipToTopic(2)}
                        aria-label="Learn about Level C Closed engagement — click to flip"
                      >
                        <span className="font-bold text-slate-600 group-hover:text-slate-700 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5" />
                          Level C (Closed)
                        </span>
                        <p className="text-slate-500 mt-1">
                          Maximum control, traditional IP protection. Lower
                          community multiplier.
                        </p>
                        <span className="text-[10px] text-slate-500 mt-2 block font-medium">
                          Click to learn more →
                        </span>
                      </button>
                    </div>
                    <p className="text-sm text-slate-500 mt-4 italic">
                      Not sure which to choose? Use the{" "}
                      <strong>Contingency Operators (Simulator)</strong> to test
                      your idea with Real People who earn Marks for giving you
                      real feedback.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        />
      </section>

      {/* ═══════════════ SECTION 3: PROTOTYPER GUILD ═══════════════ */}
      <section className="mb-14" aria-labelledby="guild-heading">
        {!isJoined ? (
          <ContainerFlipControlled
            topics={GUILD_STEP_TOPICS}
            className="max-w-3xl mx-auto"
            backFooter={registerButton}
            renderFront={({ flipToTopic }) => (
              <Card className="border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <CardHeader className="text-center pb-2">
                  <Printer className="h-16 w-16 mx-auto text-zinc-400 mb-4" />
                  <CardTitle id="guild-heading" className="text-3xl">
                    Join the Prototyper Guild
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Have an FDM or SLA 3D printer? Turn your idle machine time
                    into IP-backed Platform Value.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 mt-6">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <button
                      className="p-4 bg-white dark:bg-zinc-950 rounded-lg shadow-sm border-2 border-transparent hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => flipToTopic(0)}
                      aria-label="Learn about getting free STLs — click to flip"
                    >
                      <FileDown className="h-8 w-8 mx-auto text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold">1. Get Free STLs</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Access 1,200+ CAD files, starting with the 24 HexIsle
                        core components.
                      </p>
                      <span className="text-[10px] text-blue-500 mt-2 block font-medium">
                        Click to learn more →
                      </span>
                    </button>
                    <button
                      className="p-4 bg-white dark:bg-zinc-950 rounded-lg shadow-sm border-2 border-transparent hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => flipToTopic(1)}
                      aria-label="Learn about printing and testing — click to flip"
                    >
                      <Printer className="h-8 w-8 mx-auto text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold">2. Print & Test</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Print the files for personal use. Test tolerances,
                        compliant mechanisms, and IIFIS boots.
                      </p>
                      <span className="text-[10px] text-amber-500 mt-2 block font-medium">
                        Click to learn more →
                      </span>
                    </button>
                    <button
                      className="p-4 bg-white dark:bg-zinc-950 rounded-lg shadow-sm border-2 border-transparent hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => flipToTopic(2)}
                      aria-label="Learn about earning Marks — click to flip"
                    >
                      <Award className="h-8 w-8 mx-auto text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold">3. Earn Marks</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Upload photos and specs to earn Marks backed by the
                        Liana Banyan patent portfolio.
                      </p>
                      <span className="text-[10px] text-emerald-500 mt-2 block font-medium">
                        Click to learn more →
                      </span>
                    </button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center pb-8">
                  <Button
                    size="lg"
                    className="bg-zinc-900 hover:bg-zinc-800 text-white px-8"
                    onClick={handleJoinGuild}
                  >
                    Register My Printer
                  </Button>
                </CardFooter>
              </Card>
            )}
          />
        ) : (
          /* ═══ POST-JOIN: STL Vault / Test & Report / NOIDS ═══ */
          <Tabs defaultValue="vault" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-[600px] mb-8">
              <TabsTrigger value="vault">The STL Vault</TabsTrigger>
              <TabsTrigger value="report">Test & Report</TabsTrigger>
              <TabsTrigger
                value="noids"
                className="text-amber-600 data-[state=active]:text-amber-700"
              >
                Role Bounties (NOIDS)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vault" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    HexIsle Core Components
                  </h2>
                  <p className="text-sm text-slate-500">
                    We don't know the exact print times or material costs yet.
                    We need Proteus Test-Pilots to find out.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  <ShieldCheck className="h-3 w-3 mr-1" /> Free for Personal
                  Use
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Peasant Character Base",
                    type: "FDM/SLA",
                    time: "TBD",
                    size: "12mb",
                    needsPilot: true,
                  },
                  {
                    name: "Water Table Hex Tile",
                    type: "FDM",
                    time: "TBD",
                    size: "24mb",
                    needsPilot: true,
                  },
                  {
                    name: "Compliant Hit Point Ratchet",
                    type: "SLA",
                    time: "TBD",
                    size: "8mb",
                    needsPilot: true,
                  },
                  {
                    name: "Treasury Coin Set (1-5 holes)",
                    type: "FDM/SLA",
                    time: "TBD",
                    size: "15mb",
                    needsPilot: true,
                  },
                  {
                    name: "Lava IIFIS Boots",
                    type: "SLA",
                    time: "TBD",
                    size: "10mb",
                    needsPilot: true,
                  },
                  {
                    name: "Merchant Fitted Coffer",
                    type: "FDM",
                    time: "TBD",
                    size: "35mb",
                    needsPilot: true,
                  },
                ].map((file, i) => (
                  <Card
                    key={i}
                    className="overflow-hidden group hover:border-zinc-400 transition-colors relative"
                  >
                    {file.needsPilot && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
                          <Flame className="h-3 w-3 mr-1" /> TrailBlazer Needed
                        </Badge>
                      </div>
                    )}
                    <div className="h-40 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border-b">
                      <Box className="h-16 w-16 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{file.name}</h3>
                      <div className="flex gap-2 text-xs text-slate-500 mb-4">
                        <Badge variant="secondary">{file.type}</Badge>
                        <span className="text-amber-600 font-medium">
                          ⏱️ {file.time}
                        </span>
                        <span>📦 {file.size}</span>
                      </div>
                      <Button variant="outline" className="w-full gap-2">
                        <FileDown className="h-4 w-4" /> Download STL
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="report">
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle>Submit Prototyping Report</CardTitle>
                  <CardDescription>
                    Upload your print results to help us refine the CAD files.
                    Your data will enter{" "}
                    <strong>Quorum Aggregation</strong> with other Test-Pilots
                    to establish the official print specs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Which part did you print?
                    </label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option>Compliant Hit Point Ratchet</option>
                      <option>Peasant Character Base</option>
                      <option>Water Table Hex Tile</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Printer Model
                      </label>
                      <Input placeholder="e.g., Bambu X1C" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Material Used
                      </label>
                      <Input placeholder="e.g., PLA Basic" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Actual Print Time
                      </label>
                      <Input placeholder="e.g., 42 mins" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tolerance & Fit Notes
                    </label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Did the IIFIS boots snap in correctly? Did the compliant mechanism ratchet smoothly?"
                    />
                  </div>

                  <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center">
                    <Camera className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
                    <p className="text-sm font-medium">Upload Print Photos</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Drag & drop or click to select
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleUploadReport}
                    disabled={isUploading}
                  >
                    {isUploading
                      ? "Submitting to Quorum..."
                      : "Submit Report & Claim Marks"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="noids">
              <Card className="border-2 border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                    <Network className="h-6 w-6" />
                    Professional Testers (NOIDS)
                  </CardTitle>
                  <CardDescription>
                    Network Operators In Distributed Systems. Become a dedicated
                    R&D Test-Pilot for new projects. Commit your time, lock your
                    reputation as collateral, and earn substantial time-based
                    bonuses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm border-l-4 border-l-amber-500">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-4 w-4 text-amber-500" />
                      Interoperability: Roles vs. Stewardship
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Role Bounties are part of the broader{" "}
                      <strong>Stewardship System</strong>. While Stewards
                      (Captains, Commodores) take on long-term scope, authority,
                      and responsibility for an entire local initiative, NOIDS
                      take on highly focused, task-based roles with specific
                      durations and deliverables. Both require locking
                      collateral to guarantee performance.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg">
                          Project: HexIsle Water Table Stress Test
                        </h4>
                        <p className="text-sm text-slate-500">
                          Requested by: @Founder
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 border-amber-300"
                      >
                        Requires 50 Rep Collateral
                      </Badge>
                    </div>

                    <p className="text-sm mb-4">
                      Need 9 Professional Testers to print the Water Table Hex
                      Tile in PETG and test water retention for 48 hours. Must
                      provide video evidence of the seal.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800 text-center">
                        <Clock className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                        <div className="text-xs text-slate-500">
                          Done in 1 Hour
                        </div>
                        <div className="font-bold text-emerald-600">
                          500 Marks
                        </div>
                      </div>
                      <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800 text-center">
                        <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                        <div className="text-xs text-slate-500">
                          Done in 1 Day
                        </div>
                        <div className="font-bold text-blue-600">
                          100 Marks
                        </div>
                      </div>
                      <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800 text-center">
                        <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                        <div className="text-xs text-slate-500">
                          Done in 3 Days
                        </div>
                        <div className="font-bold text-amber-600">
                          50 Marks
                        </div>
                      </div>
                      <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800 text-center">
                        <Clock className="h-5 w-5 mx-auto text-slate-500 mb-1" />
                        <div className="text-xs text-slate-500">
                          Done in 1 Week
                        </div>
                        <div className="font-bold text-slate-600">
                          20 Marks
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2">
                      <ShieldAlert className="h-4 w-4" /> Lock 50 Rep & Accept
                      Role Bounty
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </section>

      {/* ═══════════════ SECTION 4: EXPLORE MORE ═══════════════ */}
      <section
        className="border-t pt-10"
        aria-labelledby="explore-more-heading"
      >
        <h2
          id="explore-more-heading"
          className="text-lg font-bold text-slate-900 dark:text-white mb-2 text-center"
        >
          Explore More
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Not ready to register? No problem. Browse at your own pace.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
            onClick={() => navigate("/factory-node")}
          >
            <Factory className="h-5 w-5 text-orange-500" />
            Factory Node
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
            onClick={() => navigate("/help-wanted")}
          >
            <Users className="h-5 w-5 text-blue-500" />
            Browse All Bounties
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
            onClick={() => navigate("/economics")}
          >
            <BookOpen className="h-5 w-5 text-emerald-500" />
            Read the Economics
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
            onClick={() => navigate("/crows-nest")}
          >
            <Telescope className="h-5 w-5 text-purple-500" />
            The Crow's Nest
          </Button>
          <Button
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
            onClick={() => navigate("/cephas")}
          >
            <Sparkles className="h-5 w-5 text-amber-500" />
            Academic Papers
          </Button>
        </div>
      </section>
    </PortalPageLayout>
  );
}
