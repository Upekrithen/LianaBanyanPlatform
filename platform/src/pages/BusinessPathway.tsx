/**
 * BUSINESS PATHWAY — Recommended paths for every person
 * =====================================================
 * Three main pathways:
 * 1. Existing Business → Incremental C+20 adoption
 * 2. Have an Idea → Cold start that idea
 * 3. Looking for Work → Cold start finding work
 *
 * Each pathway shows gradual steps to get started.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpandableBlock, ProgressIndicator, DataVizBar } from "@/components/pudding";
import {
  Building2,
  Lightbulb,
  Briefcase,
  ArrowRight,
  Check,
  ChevronRight,
  Sparkles,
  Users,
  ShoppingBag,
  Calculator,
  Shield,
  Star,
  TrendingUp,
  Zap,
  Target,
  Clock,
  DollarSign,
  Handshake,
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

// ═══════════════════════════════════════════════════════════════════════════════
// PATHWAY DATA
// ═══════════════════════════════════════════════════════════════════════════════

const EXISTING_BUSINESS_STEPS = [
  {
    step: 1,
    title: "Sync Your StoreFront",
    description: "Don't rebuild from scratch. Use our StoreFront Aggregation to sync your Shopify, Etsy, or Fiverr items.",
    action: "Connect your existing store URL to pull in your Cold Start C20 items",
    tip: "We use the Shirley Temple Policy: we do more together than apart.",
    icon: ShoppingBag,
    link: "/storefront-aggregation"
  },
  {
    step: 2,
    title: "Pick ONE Item",
    description: "Choose a single product or service to try C+20 pricing on. Something simple, low-risk.",
    action: "Calculate your true cost for that item (materials + labor + overhead share)",
    tip: "Start with something you sell regularly so you can compare results quickly.",
    icon: Target,
  },
  {
    step: 2,
    title: "Calculate C+20 Price",
    description: "Take your true cost and add exactly 20%. That's your C+20 price.",
    action: "Use our Cost Calculator to verify your numbers",
    tip: "Be honest about ALL costs. The system only works with real numbers.",
    icon: Calculator,
  },
  {
    step: 3,
    title: "List It Alongside",
    description: "Offer the C+20 version alongside your regular pricing. Let customers choose.",
    action: "Create a listing that explains the transparent pricing",
    tip: "Some customers will pay MORE for transparency. You might be surprised.",
    icon: ShoppingBag,
  },
  {
    step: 4,
    title: "Track & Compare",
    description: "Run both prices for 30 days. Track which sells better and customer feedback.",
    action: "Log sales in your dashboard to see the comparison",
    tip: "C+20 customers tend to be more loyal and refer others.",
    icon: TrendingUp,
  },
  {
    step: 5,
    title: "Expand or Adjust",
    description: "Based on results, add more items to C+20 or adjust your approach.",
    action: "Gradually convert more of your catalog as you see what works",
    tip: "Most businesses find 20-40% of items work great with C+20.",
    icon: Zap,
  },
];

const IDEA_COLD_START_STEPS = [
  {
    step: 1,
    title: "Document Your Idea",
    description: "Write down what you want to create. Be specific about what it does and who it's for.",
    action: "Create a project brief (we have templates)",
    tip: "The clearer your idea, the easier it is to get support.",
    icon: Lightbulb,
  },
  {
    step: 2,
    title: "Calculate True Cost",
    description: "Figure out what it would actually cost to make your idea real. Materials, time, tools.",
    action: "Use the Project Cost Calculator",
    tip: "Include your time at a fair hourly rate. Your labor has value.",
    icon: Calculator,
  },
  {
    step: 3,
    title: "Create a Cue Card",
    description: "Make a shareable card that explains your idea. This is how you gather interest.",
    action: "Build your Cue Card in Hofund Studio",
    tip: "Good Cue Cards get shared. Shares unlock your Deck Card.",
    icon: Star,
  },
  {
    step: 4,
    title: "Gather Ghost Votes",
    description: "Share your Cue Card. People vote with Ghost Credits to show interest.",
    action: "Share on social media, with friends, in communities",
    tip: "20 clicks unlocks your Deck Card. More votes = higher production tier.",
    icon: Users,
  },
  {
    step: 5,
    title: "Hit Production Threshold",
    description: "When enough people vote, your idea unlocks production at the appropriate tier.",
    action: "Watch your vote count grow toward production thresholds",
    tip: "10 votes = prototype, 50 = small batch, 100 = medium run, 500+ = mass production",
    icon: Target,
  },
];

const WORK_COLD_START_STEPS = [
  {
    step: 1,
    title: "List Your Skills",
    description: "What can you do? Be specific. Include both professional skills and things you're good at.",
    action: "Create your skill profile",
    tip: "Don't undersell yourself. If you can do it, list it.",
    icon: Briefcase,
  },
  {
    step: 2,
    title: "Set Your Rate",
    description: "Calculate your hourly rate using C+20. Your costs + 20% = your rate.",
    action: "Use the Service Rate Calculator",
    tip: "Include living expenses, tools, and overhead in your costs.",
    icon: Calculator,
  },
  {
    step: 3,
    title: "Create Service Listings",
    description: "Turn your skills into specific service offerings with clear deliverables.",
    action: "Create listings in the Services Marketplace",
    tip: "Specific services sell better than vague 'I can do anything' listings.",
    icon: ShoppingBag,
  },
  {
    step: 4,
    title: "Build Your Cue Card",
    description: "Your Cue Card is your portable reputation. Share it to build credibility.",
    action: "Create your professional Cue Card",
    tip: "Include testimonials, examples, and your C+20 commitment.",
    icon: Star,
  },
  {
    step: 5,
    title: "Join Initiative Teams",
    description: "The 16 initiatives always need help. Join one that matches your skills.",
    action: "Browse initiatives and apply to teams",
    tip: "Initiative work builds reputation and connections fast.",
    icon: Users,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STEP COLORS BY PATHWAY
// ═══════════════════════════════════════════════════════════════════════════════

const PATHWAY_COLORS = {
  existing: "#22c55e", // green
  idea: "#f59e0b",     // amber
  work: "#3b82f6",     // blue
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function BusinessPathway() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("existing");
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const getSteps = () => {
    switch (activeTab) {
      case "existing": return EXISTING_BUSINESS_STEPS;
      case "idea": return IDEA_COLD_START_STEPS;
      case "work": return WORK_COLD_START_STEPS;
      default: return EXISTING_BUSINESS_STEPS;
    }
  };

  const getTabInfo = () => {
    switch (activeTab) {
      case "existing":
        return {
          title: "Incremental C+20 Adoption",
          subtitle: "Already have a business? Try transparent pricing on a few items first.",
          icon: Building2,
          color: "green",
        };
      case "idea":
        return {
          title: "Cold Start Your Idea",
          subtitle: "Have an idea but no resources? Here's how to make it real.",
          icon: Lightbulb,
          color: "amber",
        };
      case "work":
        return {
          title: "Cold Start Finding Work",
          subtitle: "Looking for work? Build your reputation and find opportunities.",
          icon: Briefcase,
          color: "blue",
        };
      default:
        return { title: "", subtitle: "", icon: Building2, color: "green" };
    }
  };

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepNum)
        ? prev.filter(s => s !== stepNum)
        : [...prev, stepNum]
    );
  };

  const tabInfo = getTabInfo();
  const steps = getSteps();
  const accentColor = PATHWAY_COLORS[activeTab as keyof typeof PATHWAY_COLORS];

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="business-pathway">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            <Sparkles className="w-4 h-4 mr-2" />
            Your Pathway
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Choose Your Starting Point
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everyone's situation is different. Pick the path that matches where you are today.
          </p>
        </div>

        {/* Tab Selection */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCompletedSteps([]); }} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white/5">
            <TabsTrigger
              value="existing"
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-green-500/20"
            >
              <Building2 className="w-5 h-5" />
              <span className="text-xs">Existing Business</span>
            </TabsTrigger>
            <TabsTrigger
              value="idea"
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-amber-500/20"
            >
              <Lightbulb className="w-5 h-5" />
              <span className="text-xs">Have an Idea</span>
            </TabsTrigger>
            <TabsTrigger
              value="work"
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-blue-500/20"
            >
              <Briefcase className="w-5 h-5" />
              <span className="text-xs">Looking for Work</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Header */}
          <Card className={`border-${tabInfo.color}-500/30 bg-${tabInfo.color}-500/5`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-${tabInfo.color}-500/20 flex items-center justify-center`}>
                  <tabInfo.icon className={`w-6 h-6 text-${tabInfo.color}-400`} />
                </div>
                <div>
                  <CardTitle>{tabInfo.title}</CardTitle>
                  <CardDescription>{tabInfo.subtitle}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Progress Indicator */}
          <ProgressIndicator
            steps={steps.map(s => s.title)}
            currentStep={Math.max(0, ...completedSteps)}
            completedSteps={completedSteps}
            accentColor={accentColor}
          />

          {/* Steps as ExpandableBlocks */}
          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.step);

              return (
                <ExpandableBlock
                  key={step.step}
                  title={`Step ${step.step}: ${step.title}`}
                  subtitle={step.description}
                  preview={step.action}
                  accentColor={accentColor}
                  defaultExpanded={step.step === 1}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}
                           style={{ backgroundColor: `${accentColor}20` }}>
                        <Icon className="w-5 h-5" style={{ color: accentColor }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1" style={{ color: accentColor }}>Action:</p>
                        <p className="text-sm text-muted-foreground">{step.action}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border" style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      borderColor: 'rgba(245, 158, 11, 0.2)'
                    }}>
                      <p className="text-sm font-medium text-amber-500">💡 Tip:</p>
                      <p className="text-sm text-muted-foreground">{step.tip}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={isCompleted ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepComplete(step.step);
                        }}
                        className={isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          "Mark as Complete"
                        )}
                      </Button>

                      {/* @ts-ignore */}
                      {step.link && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            /* @ts-ignore */
                            navigate(step.link);
                          }}
                        >
                          Go to Tool <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </ExpandableBlock>
              );
            })}
          </div>
        </Tabs>

        {/* Bottom CTA */}
        <Card className="mt-8 border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Ready to Start?</h3>
                <p className="text-sm text-muted-foreground">
                  $5/year membership. Creator/Worker keeps 83.3% forever.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/help-each-other")}
                >
                  Learn More
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/RedCarpet")}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Distribution Visual */}
        <div className="mt-8">
          <DataVizBar
            title="How Revenue is Split"
            subtitle="On every transaction — locked forever"
            data={[
              { label: 'Creator keeps', value: 83.3, color: '#22c55e', icon: '💰' },
              { label: 'Platform (C+20%)', value: 16.7, color: '#f97316', icon: '🏛️' }
            ]}
            maxValue={100}
            showPercentages={true}
            height={24}
          />
        </div>

        {/* Key Numbers */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-green-400">83.3%</div>
            <div className="text-xs text-muted-foreground">Creator Keeps</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-amber-400">$5/yr</div>
            <div className="text-xs text-muted-foreground">Membership</div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">C+20%</div>
            <div className="text-xs text-muted-foreground">Transparent Pricing</div>
          </div>
        </div>

        {/* Philosophy Quote */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground italic text-sm">
            "Help each other help ourselves."
          </p>
          <p className="text-muted-foreground/70 text-xs mt-1">— The Golden Key</p>
        </div>
    </PortalPageLayout>
  );
}
