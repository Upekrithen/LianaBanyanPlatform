/**
 * ONBOARDING START PAGE — "You have a... I have a..."
 * ====================================================
 * The entry point for new users to understand what they can do.
 *
 * Flow:
 * 1. Hero with dropdown selectors
 * 2. Routes to appropriate flow based on selection
 * 3. Shows HexIsle Peasant/Farmer/Warrior as example
 * 4. Ghost voting demo
 * 5. Production tier progress
 * 6. Kickstarter passthrough
 * 7. $5 membership conversion
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Sparkles,
  Factory,
  Users,
  ShoppingBag,
  Lightbulb,
  Music,
  Utensils,
  Palette,
  Wrench,
  Vote,
  ExternalLink,
  Check,
  Play,
  ChevronRight,
  Hexagon,
  Crown,
  Sword,
  Shield,
} from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ═══════════════════════════════════════════════════════════════════════════════
// DROPDOWN OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const YOU_HAVE_OPTIONS = [
  { value: "product", label: "a product", icon: ShoppingBag, description: "Physical item to manufacture" },
  { value: "idea", label: "an idea", icon: Lightbulb, description: "Concept or invention" },
  { value: "project", label: "a project", icon: Factory, description: "Defined scope of work" },
  { value: "play", label: "a play", icon: Music, description: "Creative performance" },
  { value: "recipe", label: "a recipe", icon: Utensils, description: "Food creation" },
  { value: "design", label: "a design", icon: Palette, description: "Visual or CAD work" },
  { value: "service", label: "a service", icon: Wrench, description: "Offering to provide" },
];

const I_HAVE_OPTIONS = [
  { value: "factory", label: "a factory", icon: Factory, description: "Manufacturing pipeline" },
  { value: "stage", label: "a stage", icon: Music, description: "Platform visibility" },
  { value: "platform", label: "a platform", icon: Sparkles, description: "Full infrastructure" },
  { value: "audience", label: "an audience", icon: Users, description: "Community network" },
  { value: "marketplace", label: "a marketplace", icon: ShoppingBag, description: "Sales channel" },
  { value: "funding", label: "funding tools", icon: Vote, description: "Crowdfunding passthrough" },
];

// Route mapping based on selections
const ROUTE_MAP: Record<string, string> = {
  "product-factory": "/factory",
  "product-funding": "/factory",
  "product-marketplace": "/factory",
  "idea-platform": "/projects/create",
  "idea-funding": "/projects/create?crowdfund=true",
  "recipe-stage": "/lets-make-dinner/submit",
  "service-marketplace": "/marketplace/services/create",
  "play-audience": "/jukebox/submit",
  "design-factory": "/factory",
};

// Production tier thresholds
const PRODUCTION_TIERS = [
  { name: "Prototype", threshold: 10, unlocked: true, description: "3D Print (FDM/SLA)" },
  { name: "Small Batch", threshold: 50, unlocked: true, description: "SLS Printing" },
  { name: "Medium Run", threshold: 100, unlocked: false, description: "Desktop Injection" },
  { name: "Large Run", threshold: 500, unlocked: false, description: "Full Injection Molding" },
  { name: "Mass Production", threshold: 1000, unlocked: false, description: "Factory Line" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GHOST VOTING DEMO COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function GhostVotingDemo({
  currentVotes,
  onVote,
}: {
  currentVotes: number;
  onVote: (amount: number) => void;
}) {
  const [ghostCredits] = useState(10);
  const [usedCredits, setUsedCredits] = useState(0);
  const remainingCredits = ghostCredits - usedCredits;

  const handleVote = (amount: number) => {
    if (amount <= remainingCredits) {
      setUsedCredits((prev) => prev + amount);
      onVote(amount);
    }
  };

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Vote className="w-5 h-5 text-amber-500" />
          Try It: Vote with Ghost Credits
        </CardTitle>
        <CardDescription>
          Ghost Credits show how voting works. Real credits require $5 membership.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-background rounded-lg">
          <span className="text-sm text-muted-foreground">Your Ghost Credits:</span>
          <Badge variant="outline" className="text-amber-600 border-amber-500/30">
            {remainingCredits} / {ghostCredits}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Pledge:</span>
          {[1, 3, 5, 10].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              disabled={amount > remainingCredits}
              onClick={() => handleVote(amount)}
              className={amount <= remainingCredits ? "hover:bg-amber-500/10 hover:border-amber-500/50" : ""}
            >
              +{amount}
            </Button>
          ))}
        </div>

        {usedCredits > 0 && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              You voted {usedCredits} ghost credits!
            </p>
            <p className="text-xs text-green-600 mt-1">
              Current total: {currentVotes + usedCredits} votes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCTION TIER PROGRESS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ProductionTierProgress({
  currentVotes,
  ghostVotes,
}: {
  currentVotes: number;
  ghostVotes: number;
}) {
  const totalVotes = currentVotes + ghostVotes;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Production Tier Unlocks</CardTitle>
        <CardDescription>
          More votes = higher production tier = lower per-unit cost
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {PRODUCTION_TIERS.map((tier, idx) => {
          const isUnlocked = totalVotes >= tier.threshold;
          const progress = Math.min(100, (totalVotes / tier.threshold) * 100);
          const votesNeeded = Math.max(0, tier.threshold - totalVotes);

          return (
            <div key={tier.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isUnlocked ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={`text-sm font-medium ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                    {tier.name}
                  </span>
                  <span className="text-xs text-muted-foreground">({tier.description})</span>
                </div>
                <Badge variant={isUnlocked ? "default" : "outline"} className="text-xs">
                  {tier.threshold}+ votes
                </Badge>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isUnlocked ? "bg-green-500" : "bg-primary/50"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              {!isUnlocked && votesNeeded > 0 && (
                <p className="text-xs text-muted-foreground pl-6">
                  {votesNeeded} more votes needed
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function OnboardingStart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGhost = !user;

  // Dropdown selections
  const [youHave, setYouHave] = useState<string>("product");
  const [iHave, setIHave] = useState<string>("factory");

  // Demo state
  const [showDemo, setShowDemo] = useState(false);
  const [ghostVotes, setGhostVotes] = useState(0);

  // Example project data (Peasant/Farmer/Warrior)
  const exampleProject = {
    name: "Peasant / Farmer / Warrior",
    description: "Three modular characters for the HexIsle universe. Hexel 30/60 compatible bases, swappable weapons and accessories.",
    currentVotes: 47,
    kickstarterUrl: "https://www.kickstarter.com/projects/liana-banyan/liana-banyan-democracy-democratizing-manufacturing",
    features: [
      "28mm scale miniatures",
      "Hexel 30/60 compatible",
      "Modular weapon swaps",
      "Snap-fit assembly",
    ],
  };

  const handleStartProject = () => {
    const routeKey = `${youHave}-${iHave}`;
    const route = ROUTE_MAP[routeKey] || "/factory";
    navigate(route);
  };

  const handleGhostVote = (amount: number) => {
    setGhostVotes((prev) => prev + amount);
  };

  return (
    <PortalPageLayout>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center space-y-8">
          {/* Main headline */}
          <div className="space-y-4">
            <Badge variant="outline" className="text-primary border-primary/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Start Your Journey
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              You have{" "}
              <Select value={youHave} onValueChange={setYouHave}>
                <SelectTrigger className="inline-flex w-auto text-primary border-primary/30 bg-primary/5 text-4xl md:text-5xl font-bold h-auto py-1 px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YOU_HAVE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </h1>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              I have{" "}
              <Select value={iHave} onValueChange={setIHave}>
                <SelectTrigger className="inline-flex w-auto text-primary border-primary/30 bg-primary/5 text-4xl md:text-5xl font-bold h-auto py-1 px-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {I_HAVE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </h1>
          </div>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let's make it happen. Creator/Worker keeps <span className="text-primary font-bold">83.3%</span> of every transaction.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2 text-lg px-8" onClick={handleStartProject}>
              Start Your Project
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-lg"
              onClick={() => setShowDemo(true)}
            >
              <Play className="w-5 h-5" />
              See How It Works
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      {showDemo && (
        <div className="container mx-auto px-4 pb-16 max-w-4xl space-y-8">
          {/* Example Project Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Hexagon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      🏝️ HexIsle: {exampleProject.name}
                    </CardTitle>
                    <CardDescription>Example project walkthrough</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  {exampleProject.currentVotes + ghostVotes} votes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{exampleProject.description}</p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2">
                {exampleProject.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Hexel compatibility badge */}
              <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  Hexel 30/60 Compatible
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Works with all HexIsle terrain tiles
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ghost Voting Demo */}
          <GhostVotingDemo
            currentVotes={exampleProject.currentVotes}
            onVote={handleGhostVote}
          />

          {/* Production Tier Progress */}
          <ProductionTierProgress
            currentVotes={exampleProject.currentVotes}
            ghostVotes={ghostVotes}
          />

          {/* Kickstarter Passthrough */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Back This Project
              </CardTitle>
              <CardDescription>
                Voting determines WHAT gets made. Crowdfunding determines WHEN.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This project has a Kickstarter campaign. Liana Banyan doesn't take a cut of Kickstarter funds — we coordinate, they handle the money.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.open(exampleProject.kickstarterUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                View on Kickstarter
              </Button>
              <p className="text-xs text-muted-foreground italic">
                Platform, not a fund — we coordinate, verify, record, and display.
              </p>
            </CardContent>
          </Card>

          {/* Conversion CTA */}
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-lg">Ready to Make It Real?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Vote with real credits (not ghost)",
                  "Submit your own projects",
                  "Earn 83.3% on everything you create",
                  "Access the full Factory pipeline",
                  "Connect your own Kickstarter campaigns",
                  "Personal QR code for sharing",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    {benefit}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/RedCarpet")}
                >
                  <Crown className="w-5 h-5" />
                  Join for $5/year
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={handleStartProject}
                >
                  Start Your Project
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* HIVI & Sponsorship Info */}
      {showDemo && (
        <div className="container mx-auto px-4 pb-8 max-w-4xl space-y-8">
          {/* HIVI Pricing */}
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                HIVI: How We Price Services
              </CardTitle>
              <CardDescription>
                All platform services are priced using HIVI — an internal metric, not a speculative instrument.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-background rounded-lg">
                  <h4 className="font-medium text-sm mb-2">What HIVI Is:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Internal service-valuation metric</li>
                    <li>• Standardizes pricing across geographies</li>
                    <li>• "How the platform sizes services"</li>
                  </ul>
                </div>
                <div className="p-3 bg-background rounded-lg">
                  <h4 className="font-medium text-sm mb-2">What HIVI is NOT:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Not tradable or investable</li>
                    <li>• Not redeemable for cash</li>
                    <li>• Not a speculative index</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Credits, Marks, and Joules are prepaid claims on HIVI-measured services — like arcade tokens, not investments.
              </p>
              <Link
                to="/economics"
                className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 mt-2"
              >
                Explore all Five Economic Laws →
              </Link>
            </CardContent>
          </Card>

          {/* Sponsorship Cascade */}
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Sponsorship Cascade: Help Others Join
              </CardTitle>
              <CardDescription>
                Anyone with 25+ Credits can sponsor someone else. The cascade multiplies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-green-600 border-green-500/30">25 min</Badge>
                  <span>Anyone can sponsor with 25+ Credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-amber-600 border-amber-500/30">5K badge</Badge>
                  <span>Community Seeder badge at 5,000 Credits sponsored</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-blue-600 border-blue-500/30">Cascade</Badge>
                  <span>Recipients can split and add up to 5K more</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                One 5K sponsor can reach 45,500+ people through the cascade effect.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom info */}
      <div className="container mx-auto px-4 pb-16 max-w-4xl">
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            <span className="font-medium">Cost + 20%</span> — Creator/Worker keeps 83.3% forever.
            It's in the operating agreement.
          </p>
          <p>
            16 initiatives • {{innovationCount}} innovations • Built in public • Designed to be copied
          </p>
        </div>
      </div>
    </PortalPageLayout>
  );
}
