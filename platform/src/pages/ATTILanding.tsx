/**
 * A.T.T.I. CAMPAIGN LANDING PAGE
 * ================================
 * Handles QR scan entry → BeaconRunCueCard flow
 * URL: /atti?ref=CODE&i=initiative
 *
 * Innovation #1555: "All That That Implies"
 *
 * Mobile-first. Anonymous-friendly. Click tracking integrated.
 * SEC-safe: Service marketing and member engagement tooling only.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  ArrowRight,
  Sparkles,
  Key,
  BookOpen,
  ShoppingBag,
  Users,
  Building2,
  Music,
  Stethoscope,
  GraduationCap,
  Home,
  Banknote,
  Globe,
  Vote,
  Wrench,
  Wheat,
  Shield,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import {
  getOrCreateSession,
  getLocalProgress,
  recordClick,
  parseScanParams,
  CLICKS_PER_LOCK,
  CLICKS_FOR_CANDLE_BURST,
  FUNNEL_STAGE_LABELS,
  type ClickType,
  type EngagementProgress,
} from "@/lib/attiCampaign";
import { CandleBurst, LockProgress } from "@/components/atti/CandleBurst";
import { SocialShareBar } from "@/components/atti/SocialShareBar";
import { IDontWantYourMoneyCard } from "@/components/cue-cards/IDontWantYourMoneyCard";

// ═══════════════════════════════════════════════════════════════════════════════
// INITIATIVE SHOWCASE DATA
// ═══════════════════════════════════════════════════════════════════════════════

interface InitiativeShowcase {
  key: string;
  name: string;
  tagline: string;
  icon: React.ElementType;
  color: string;
  highlights: string[];
  route: string;
  cephasLink?: string;
}

const INITIATIVE_SHOWCASES: InitiativeShowcase[] = [
  { key: "lets-make-bread", name: "Let's Make Bread", tagline: "Business Incubator", icon: Wheat, color: "amber", highlights: ["Start with $5", "Keep 83.3% of every sale", "Cooperative manufacturing support"], route: "/initiatives/lets-make-bread", cephasLink: "https://cephas.lianabanyan.com/initiatives/lets-make-bread/" },
  { key: "hexisle-manufacturing", name: "HexIsle", tagline: "Distributed Manufacturing", icon: Building2, color: "blue", highlights: ["3D printing network", "Open-source hardware", "Community test-pilots"], route: "/hexisle" },
  { key: "household-concierge", name: "Household Concierge", tagline: "Shared Butler for Your Home", icon: Home, color: "teal", highlights: ["World-class home management", "Shared across households", "Earn Marks for tasks"], route: "/initiatives/household-concierge" },
  { key: "jukebox", name: "JukeBox", tagline: "Fair Music Licensing", icon: Music, color: "purple", highlights: ["Artists keep 83.3%", "One Take Wonders", "Fair licensing model"], route: "/initiatives/jukebox" },
  { key: "didasko", name: "Didasko", tagline: "Education", icon: GraduationCap, color: "green", highlights: ["Learn and teach", "Earn while learning", "Community-driven courses"], route: "/initiatives/didasko" },
  { key: "msa-medical", name: "MSA", tagline: "Medical Savings Accounts", icon: Stethoscope, color: "red", highlights: ["Affordable services at Cost+20%", "Community health network", "Marks for essential care"], route: "/initiatives/msa" },
  { key: "salt-mines", name: "Salt Mines", tagline: "Bounty System", icon: Wrench, color: "orange", highlights: ["Find work immediately", "Earn Credits for tasks", "Build your reputation"], route: "/help-wanted" },
  { key: "vsl-loans", name: "VSL", tagline: "Voucher Short Loans", icon: Banknote, color: "emerald", highlights: ["Community-vouched lending", "No credit score required", "94% repayment rate"], route: "/initiatives/vsl" },
  { key: "power-to-the-people", name: "Power to the People", tagline: "Political Expedition", icon: Vote, color: "indigo", highlights: ["Civic engagement tools", "Community campaigns", "Transparent process"], route: "/initiatives/power-to-the-people" },
];

function getShowcaseForInitiative(key?: string): InitiativeShowcase | null {
  if (!key) return null;
  return INITIATIVE_SHOWCASES.find(s => s.key === key) || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function ATTILanding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = parseScanParams(searchParams);

  const [progress, setProgress] = useState<EngagementProgress>(getLocalProgress);
  const [showCandleBurst, setShowCandleBurst] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<InitiativeShowcase | null>(
    getShowcaseForInitiative(params.initiative)
  );

  // Initialize session on mount
  useEffect(() => {
    getOrCreateSession(params.cardId, params.referrerCode, params.initiative);
  }, []);

  // Track a click
  const trackClick = useCallback(async (type: ClickType, sectionId?: string) => {
    const result = await recordClick(type, sectionId);
    setProgress(result.progress);

    if (result.candleBurst) {
      setShowCandleBurst(true);
    }
  }, []);

  // Handle initiative selection
  const handleSelectInitiative = (showcase: InitiativeShowcase) => {
    setSelectedInitiative(showcase);
    trackClick("explore", showcase.key);
  };

  // Handle "Tell me more" clicks
  const handleTellMeMore = (showcase: InitiativeShowcase) => {
    trackClick("interact", `tellmemore-${showcase.key}`);
    navigate(showcase.route);
  };

  // Handle Cephas link clicks
  const handleCephasLink = (showcase: InitiativeShowcase) => {
    trackClick("explore", `cephas-${showcase.key}`);
    if (showcase.cephasLink) {
      window.open(showcase.cephasLink, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* ── Header ── */}
      <div className="container mx-auto px-4 pt-8 pb-6">
        <div className="text-center space-y-3">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">
            A.T.T.I. — All That That Implies
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
              Liana Banyan
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            A cooperative platform where creators keep 83.3% of every sale.
            Explore what's possible.
          </p>
        </div>

        {/* Cue card */}
        <div className="mt-6 max-w-md mx-auto">
          <IDontWantYourMoneyCard />
        </div>
        {/* Lock Progress */}
        <div className="mt-6 flex justify-center">
          <LockProgress
            clicks={progress.meaningfulClicks}
            locks={progress.locksEarned}
            className="bg-white/5 rounded-full px-4 py-2"
          />
        </div>
      </div>

      {/* ── Initiative Grid (or Selected Detail) ── */}
      <div className="container mx-auto px-4 py-8">
        {selectedInitiative ? (
          // ── Selected Initiative Detail ──
          <div className="max-w-2xl mx-auto space-y-6">
            <button
              onClick={() => setSelectedInitiative(null)}
              className="text-sm text-white/60 hover:text-white flex items-center gap-1"
            >
              ← Back to all initiatives
            </button>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <selectedInitiative.icon className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-white">
                      {selectedInitiative.name}
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      {selectedInitiative.tagline}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Highlights */}
                <div className="space-y-3">
                  {selectedInitiative.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-white/90">{h}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => handleTellMeMore(selectedInitiative)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2"
                  >
                    Tell Me More
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  {selectedInitiative.cephasLink && (
                    <Button
                      variant="outline"
                      onClick={() => handleCephasLink(selectedInitiative)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10 gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Read the Research
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                {/* Social Sharing */}
                <SocialShareBar
                  moment="initiative"
                  initiativeName={selectedInitiative.name}
                  referrerCode={params.referrerCode}
                  onShare={(platform) => trackClick("share", `share-${platform}-${selectedInitiative.key}`)}
                />

                {/* SEC Disclaimer */}
                <p className="text-[10px] text-white/30 text-center">
                  Showcase demonstration. Explore how platform services work.
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-amber-400">83.3%</div>
                <div className="text-xs text-white/50">Creator Share</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-amber-400">$5</div>
                <div className="text-xs text-white/50">Annual Membership</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl text-center">
                <div className="text-2xl font-bold text-amber-400">1,754</div>
                <div className="text-xs text-white/50">Innovations</div>
              </div>
            </div>
          </div>
        ) : (
          // ── Initiative Grid ──
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              What interests you?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {INITIATIVE_SHOWCASES.map((showcase) => (
                <button
                  key={showcase.key}
                  onClick={() => handleSelectInitiative(showcase)}
                  className="group p-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-amber-500/30 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                      <showcase.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{showcase.name}</h3>
                      <p className="text-xs text-white/50">{showcase.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-400 group-hover:text-amber-300">
                    Explore
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <p className="text-white/60">
            Ready to join a platform that puts people first?
          </p>
          <Button
            onClick={() => {
              trackClick("interact", "register-cta");
              navigate("/RedCarpet");
            }}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold gap-2 px-8"
          >
            <Sparkles className="w-5 h-5" />
            Walk the Red Carpet — $5/year
          </Button>
          <p className="text-[10px] text-white/30">
            No financial speculation. No equity. Just services. All That That Implies.
          </p>
          {/* General share bar at bottom */}
          <SocialShareBar
            moment="general"
            referrerCode={params.referrerCode}
            onShare={(platform) => trackClick("share", `share-${platform}-bottom`)}
            className="pt-4"
          />
        </div>
      </div>

      {/* ── Candle Burst Overlay ── */}
      <CandleBurst
        isActive={showCandleBurst}
        onDismiss={() => setShowCandleBurst(false)}
        locksEarned={progress.locksEarned}
        onRegister={() => {
          setShowCandleBurst(false);
          navigate("/RedCarpet");
        }}
      />
    </div>
  );
}
