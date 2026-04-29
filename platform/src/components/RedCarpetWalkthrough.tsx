/**
 * RED CARPET PERSONALIZED WALKTHROUGH
 * ====================================
 * Type-specific sections based on recipient category.
 * Each recipient type sees content relevant to them,
 * in the order that matters most for their role.
 *
 * Categories:
 *   crown      → Full economics, governance, initiatives, patents, team
 *   high-value → Economics, competitive analysis, the ask
 *   academic   → Academic papers, methodology, peer review, Press Junket
 *   journalist → Platform overview, enshittification defense, press kit
 *   others     → Standard walkthrough
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  ExternalLink,
  FileText,
  GraduationCap,
  Newspaper,
  Phone,
  Mail,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import type { Recipient, RecipientCategory } from "@/data/redCarpetRecipients";

// ─────────────────────────────────────────────
// ANIMATED SECTION
// ─────────────────────────────────────────────

function WalkthroughSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// SECTION CONFIGS PER CATEGORY
// ─────────────────────────────────────────────

type SectionKey =
  | "academic_papers"
  | "press_junket"
  | "enshittification_defense"
  | "press_kit"
  | "governance_deep_dive"
  | "founder_direct_line"
  | "family_overview";

const CATEGORY_SECTIONS: Record<RecipientCategory, SectionKey[]> = {
  crown: ["governance_deep_dive", "founder_direct_line"],
  "high-value": ["governance_deep_dive", "founder_direct_line"],
  journalist: ["enshittification_defense", "press_kit", "press_junket", "founder_direct_line"],
  academic: ["academic_papers", "press_junket", "governance_deep_dive", "founder_direct_line"],
  "thought-leader": ["governance_deep_dive", "founder_direct_line"],
  outreach: ["founder_direct_line"],
  blessing: ["founder_direct_line"],
  "media-pitch": ["press_kit", "enshittification_defense", "founder_direct_line"],
  professional: ["founder_direct_line"],
  family: ["family_overview", "governance_deep_dive", "founder_direct_line"],
};

// ─────────────────────────────────────────────
// SECTION COMPONENTS
// ─────────────────────────────────────────────

function AcademicPapersSection() {
  const navigate = useNavigate();
  return (
    <WalkthroughSection delay={100}>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Academic Papers</h3>
                  <p className="text-blue-500 font-medium">Peer review welcome</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We've published research on cooperative platform economics, ghost credit demand
                validation, constitutional governance mechanisms, and three-gear currency design.
                Every claim is linked to working code. Every innovation is documented.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">Ghost Credits & Demand Validation</h4>
                  <p className="text-sm text-muted-foreground">
                    Mathematical framework for pre-market testing in platform commerce
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">DNA Lock Governance</h4>
                  <p className="text-sm text-muted-foreground">
                    Constitutional economics — immutable margin and revenue split protections
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">The 300 Framework</h4>
                  <p className="text-sm text-muted-foreground">
                    Hard-coded organization size limits with overflow mechanics
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">Three-Gear Currency</h4>
                  <p className="text-sm text-muted-foreground">
                    Credits, Marks, and Joules — cooperative currency with PPP adjustment
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => navigate("/papers")} className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Browse All Academic Papers
                </Button>
                <Button variant="outline" onClick={() => navigate("/cephas")} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Full Documentation (Cephas)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </WalkthroughSection>
  );
}

function PressJunketSection() {
  return (
    <WalkthroughSection delay={100}>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Press Junket</h3>
                  <p className="text-purple-500 font-medium">Domain-verified review access</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                As a verified domain visitor, you can access the Press Junket — a structured review
                of the platform's claims, economics, patent portfolio, and production systems.
                Everything is transparent. Drop beacons, link implementations, and publish your findings.
              </p>
              <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-purple-600">Beacon Mechanism:</strong> As you explore,
                  drop beacons to mark your path. Share your beacon trail so your readers, students,
                  or colleagues can follow your exact investigation through the architecture.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-purple-500/30 text-purple-600 hover:bg-purple-500/5"
                onClick={() => window.open("https://cephas.lianabanyan.com/under-the-hood/", "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Enter Press Junket
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </WalkthroughSection>
  );
}

function EnshittificationDefenseSection() {
  return (
    <WalkthroughSection delay={100}>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    The Anti-Enshittification Architecture
                  </h3>
                  <p className="text-red-500 font-medium">Structural defense, not policy promises</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every platform promises to be different. We engineered it so breaking that promise
                is architecturally impossible. Here's how:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-red-500">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">DNA Lock</h4>
                    <p className="text-sm text-muted-foreground">
                      Constitutional economics — Cost+20% and 83.3% creator share are immutable.
                      No vote, no board, no CEO can change them. Not a policy. A structural lock.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-red-500">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">The 300 Framework</h4>
                    <p className="text-sm text-muted-foreground">
                      Hard-coded organization limits with overflow mechanics prevent the concentration
                      of power that enables extraction.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-red-500">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Steward / Red Queen Governance</h4>
                    <p className="text-sm text-muted-foreground">
                      Dual governance: a rotating executive (Steward) + a permanent constitutional
                      guardian (Red Queen) who can veto any change that violates the DNA Lock.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-red-500">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Harper Auditors</h4>
                    <p className="text-sm text-muted-foreground">
                      Community-trained facilitators who verify every marketplace listing shows a
                      transparent cost breakdown. The community polices itself.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </WalkthroughSection>
  );
}

function PressKitSection() {
  return (
    <WalkthroughSection delay={100}>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Press Kit</h3>
                  <p className="text-amber-500 font-medium">Everything you need for coverage</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">The Numbers</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>2,270 documented innovations</li>
                    <li>15 provisional patent applications</li>
                    <li>~2,506 formal claims</li>
                    <li>228 Crown Jewel innovations</li>
                    <li>36 production systems live</li>
                    <li>$5/year membership</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">The Story</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>37 years in development (1989–2026)</li>
                    <li>53-year-old Army veteran founder</li>
                    <li>Father of eight children</li>
                    <li>Funded with family emergency savings</li>
                    <li>No VC, no angels, no strings</li>
                    <li>Wyoming C-Corp (EIN: 41-2797446)</li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open("https://cephas.lianabanyan.com", "_blank")}
                >
                  <FileText className="w-4 h-4" />
                  Full Press Documentation
                </Button>
                <a href="mailto:Founder@LianaBanyan.com?subject=Press%20Inquiry" className="inline-flex">
                  <Button variant="outline" className="gap-2 w-full">
                    <Mail className="w-4 h-4" />
                    Schedule Interview
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </WalkthroughSection>
  );
}

function GovernanceDeepDiveSection() {
  return (
    <WalkthroughSection delay={100}>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Governance Architecture</h3>
                  <p className="text-emerald-500 font-medium">Designed to prevent power concentration</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">The 300 Framework</h4>
                  <p className="text-sm text-muted-foreground">
                    No governance body exceeds 300 members. When a group reaches capacity, it overflows
                    into a new autonomous unit with the same constitutional protections. Scale without
                    concentration.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">Steward / Red Queen</h4>
                  <p className="text-sm text-muted-foreground">
                    The Steward leads operations (rotating, accountable). The Red Queen guards the
                    constitution (permanent, can veto any change that violates DNA Lock). Neither
                    can override the other.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 border border-border">
                  <h4 className="font-semibold text-foreground mb-1">Crown Seats</h4>
                  <p className="text-sm text-muted-foreground">
                    One Crown, One Offer, One Leader per initiative. Crown holders set vision and
                    strategy but cannot alter constitutional economics. The role is leadership, not ownership.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-emerald-500/30"
                onClick={() => window.open("https://cephas.lianabanyan.com/under-the-hood/", "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Full Governance Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </WalkthroughSection>
  );
}

function FounderDirectLineSection() {
  return (
    <WalkthroughSection delay={100}>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-8 md:p-10 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                Direct Line to the Founder
              </h3>
              <p className="text-muted-foreground max-w-lg mx-auto">
                No scheduling, no salespeople, no pitch deck. Just the economics,
                the architecture, and your hardest questions answered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <a
                  href="tel:+14065781232"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground text-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  <Phone className="w-6 h-6" />
                  406-578-1232
                </a>
                <a
                  href="mailto:Founder@LianaBanyan.com"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-2 border-primary/30 text-foreground font-semibold hover:border-primary/50 transition-colors"
                >
                  <Mail className="w-6 h-6 text-primary" />
                  Founder@LianaBanyan.com
                </a>
              </div>
              <p className="text-sm text-muted-foreground pt-2">
                Jonathan Jones, Founder & General Manager
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </WalkthroughSection>
  );
}

function FamilyOverviewSection() {
  const navigate = useNavigate();
  return (
    <WalkthroughSection delay={100}>
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Welcome Home</h3>
                  <p className="text-rose-500 font-medium">Help me test this</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                This is what 37 years of work looks like. Sixteen initiatives, each one designed
                to help people help each other. I need you to explore everything, break what
                you can, and tell me what you think — honestly.
              </p>

              <h4 className="font-semibold text-foreground mb-3">The Sweet Sixteen Initiatives</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                {[
                  "Let's Make Dinner", "Let's Get Groceries", "Let's Go Shopping",
                  "Household Concierge", "The Family Table", "Health Accords",
                  "MSA", "Defense Klaus", "Rally Group", "VSL",
                  "Let's Make Bread", "Harper Guild", "JukeBox",
                  "Didasko", "Power to the People", "Brass Tacks",
                ].map((name) => (
                  <div key={name} className="p-2 rounded-lg bg-background/50 border border-border text-center">
                    <p className="text-xs font-medium text-foreground">{name}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-rose-500/5 border border-rose-500/20 mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-rose-600">X-Ray Goggles:</strong> As you explore,
                  look for the small magnifying glass icon on pages — that's the feedback overlay.
                  Tap it to leave notes about anything that's confusing, broken, or could be better.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => navigate('/dashboard')} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate('/starter-kit')} className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Starter Kit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </WalkthroughSection>
  );
}

// ─────────────────────────────────────────────
// SECTION RENDERER
// ─────────────────────────────────────────────

function renderSection(key: SectionKey) {
  switch (key) {
    case "academic_papers":
      return <AcademicPapersSection key={key} />;
    case "press_junket":
      return <PressJunketSection key={key} />;
    case "enshittification_defense":
      return <EnshittificationDefenseSection key={key} />;
    case "press_kit":
      return <PressKitSection key={key} />;
    case "governance_deep_dive":
      return <GovernanceDeepDiveSection key={key} />;
    case "founder_direct_line":
      return <FounderDirectLineSection key={key} />;
    case "family_overview":
      return <FamilyOverviewSection key={key} />;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────
// MAIN WALKTHROUGH COMPONENT
// ─────────────────────────────────────────────

interface RedCarpetWalkthroughProps {
  recipient: Recipient;
}

export function RedCarpetWalkthrough({ recipient }: RedCarpetWalkthroughProps) {
  const sections = CATEGORY_SECTIONS[recipient.category] || ["founder_direct_line"];

  return (
    <div className="space-y-0">
      {/* Type badge */}
      <WalkthroughSection delay={0}>
        <div className="text-center py-4">
          <Badge variant="outline" className="text-sm px-4 py-1.5 border-primary/30">
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Personalized walkthrough for {recipient.categoryLabel}
          </Badge>
        </div>
      </WalkthroughSection>

      {recipient.coverNote && (
        <WalkthroughSection delay={200}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{recipient.coverNote}</ReactMarkdown>
              {recipient.coverNoteCta && (
                <div className="flex gap-3 mt-4 not-prose">
                  <Button asChild>
                    <Link to={recipient.coverNoteCta.href}>
                      {recipient.coverNoteCta.label}
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const walkthroughStart = document.querySelector('[data-walkthrough-section]');
                    walkthroughStart?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Continue to Red Carpet Walkthrough →
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </WalkthroughSection>
      )}

      {/* Render type-specific sections */}
      <div data-walkthrough-section>
        {sections.map(renderSection)}
      </div>
    </div>
  );
}
