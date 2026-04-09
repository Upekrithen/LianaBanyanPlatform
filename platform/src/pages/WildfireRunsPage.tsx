/**
 * WILDFIRE BEACON RUNS PAGE
 * =========================
 * Browse and start wildfire beacon runs through the platform.
 * Each run is a guided tour through decision points.
 * 
 * Features:
 * - Browse runs by category
 * - See Golden Key requirements
 * - Start runs with different stop modes
 * - Track progress and completion
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpandableBlock, DataVizBar } from "@/components/pudding";
import {
  Flame,
  Key,
  Crown,
  MapPin,
  Clock,
  Play,
  Trophy,
  Sparkles,
  Building2,
  Target,
  Compass,
  Briefcase,
  Heart,
  Shield,
  Palette,
  Scale,
  Ghost,
  ArrowRight,
  Lock,
  Unlock,
  Star,
  Zap,
} from "lucide-react";
import { WildfireRun } from "@/components/WildfireBeaconRun";
import { ALL_WILDFIRE_RUNS, RUNS_BY_CATEGORY, getRunBySlug, LEVEL_1_RUNS, LEVEL_2_RUNS, LEVEL_3_RUNS } from "@/data/wildfireRuns";
import { getSpotlightTour } from "@/data/spotlightTours";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { PathwayProgressCard } from "@/components/PathwayProgressCard";
import { usePathwayProgress } from "@/contexts/PathwayProgressContext";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_CONFIG = {
  'level-1': {
    name: "Level 1 — Starter",
    description: "Entry points for new explorers",
    icon: Compass,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  business: {
    name: "Business Pathways",
    description: "Start or grow your business with C+20",
    icon: Building2,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  initiatives: {
    name: "Initiative Tours",
    description: "Explore the Sweet Sixteen",
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  onboarding: {
    name: "Platform Tours",
    description: "Get oriented with Liana Banyan",
    icon: Compass,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  governance: {
    name: "Governance",
    description: "Understand how we're governed",
    icon: Scale,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  creative: {
    name: "Creative & Learning",
    description: "JukeBox, Didasko, and more",
    icon: Palette,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  custom: {
    name: "Custom Runs",
    description: "Community-created runs",
    icon: Star,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
};

const DIFFICULTY_CONFIG = {
  beginner: { color: "bg-green-500", label: "Beginner" },
  intermediate: { color: "bg-amber-500", label: "Intermediate" },
  advanced: { color: "bg-orange-500", label: "Advanced" },
  expert: { color: "bg-red-500", label: "Expert" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// RUN CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface RunCardProps {
  run: WildfireRun;
  goldenKeys: number;
  isRedCarpetRider: boolean;
  onStart: (run: WildfireRun) => void;
}

function RunCard({ run, goldenKeys, isRedCarpetRider, onStart }: RunCardProps) {
  const navigate = useNavigate();
  const categoryConfig = CATEGORY_CONFIG[run.category];
  const difficultyConfig = DIFFICULTY_CONFIG[run.difficulty];
  const CategoryIcon = categoryConfig.icon;
  
  const canUnlockMagicCarpet = goldenKeys >= run.goldenKeysRequired || isRedCarpetRider;
  const keysProgress = Math.min(100, (goldenKeys / run.goldenKeysRequired) * 100);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:border-orange-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${categoryConfig.bgColor} flex items-center justify-center text-xl`}>
              {run.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{run.name}</CardTitle>
              <CardDescription className="text-sm">{run.description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={`${difficultyConfig.color} text-white`}>
            {difficultyConfig.label}
          </Badge>
          <Badge variant="outline">
            <MapPin className="w-3 h-3 mr-1" />
            {run.totalNodes} stops
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            ~{run.estimatedMinutes} min
          </Badge>
        </div>

        {/* Golden Keys Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Key className="w-4 h-4 text-amber-500" />
              Magic Carpet Unlock
            </span>
            <span className="font-medium">
              {goldenKeys}/{run.goldenKeysRequired} keys
            </span>
          </div>
          <Progress value={keysProgress} className="h-2" />
          {canUnlockMagicCarpet ? (
            <div className="flex items-center gap-1 text-xs text-green-500">
              <Unlock className="w-3 h-3" />
              All stop modes unlocked!
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              Need {run.goldenKeysRequired - goldenKeys} more keys
            </div>
          )}
        </div>

        {/* Category Badge */}
        <div className={`flex items-center gap-2 p-2 rounded-lg ${categoryConfig.bgColor}`}>
          <CategoryIcon className={`w-4 h-4 ${categoryConfig.color}`} />
          <span className="text-sm">{categoryConfig.name}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          className="w-full gap-2 bg-orange-500 hover:bg-orange-600"
          onClick={() => onStart(run)}
        >
          <Flame className="w-4 h-4" />
          Start Wildfire Run
        </Button>
      </CardFooter>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function WildfireRunsPage() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { startRun, isRunning, tourMode, startSpotlightTour } = useWildfireRun();

  // Fetch user's golden keys
  const { data: goldenKeys = 0 } = useQuery({
    queryKey: ["golden-keys", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase
        .from("profiles")
        .select("golden_keys")
        .eq("id", user.id)
        .single();
      return data?.golden_keys ?? 0;
    },
    enabled: !!user,
  });

  // Fetch Red Carpet status
  const { data: isRedCarpetRider = false } = useQuery({
    queryKey: ["red-carpet-status", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("profiles")
        .select("red_carpet_rider")
        .eq("id", user.id)
        .single();
      return data?.red_carpet_rider === true;
    },
    enabled: !!user,
  });

  // If slug provided, load that specific run
  const specificRun = slug ? getRunBySlug(slug) : null;

  // Filter runs by category
  const displayRuns = activeCategory === "all" 
    ? ALL_WILDFIRE_RUNS 
    : RUNS_BY_CATEGORY[activeCategory as keyof typeof RUNS_BY_CATEGORY] || [];

  const handleStartRun = (run: WildfireRun) => {
    const spotlightTour = getSpotlightTour(run.slug);
    if (spotlightTour && tourMode === 'spotlight') {
      startSpotlightTour(spotlightTour.name, spotlightTour.stops);
      if (spotlightTour.stops[0]?.route) {
        navigate(spotlightTour.stops[0].route);
      }
      return;
    }
    startRun(run);
    navigate(run.nodes[0].route);
  };

  // If specific run requested via URL
  if (specificRun) {
    return (
      <PortalPageLayout>
        <div className="space-y-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/wildfire-runs")}
            className="gap-2"
          >
            ← Back to All Runs
          </Button>
          
          <RunCard 
            run={specificRun}
            goldenKeys={goldenKeys}
            isRedCarpetRider={isRedCarpetRider}
            onStart={handleStartRun}
          />

          {/* Node Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Route Preview
              </CardTitle>
              <CardDescription>
                {specificRun.totalNodes} stops on this run
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {specificRun.nodes.map((node, index) => (
                  <div 
                    key={node.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-sm font-bold text-orange-500">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{node.title}</p>
                      <p className="text-sm text-muted-foreground">{node.description}</p>
                    </div>
                    {node.learningLink && (
                      <Badge variant="outline" className="text-xs">
                        <Key className="w-3 h-3 mr-1 text-amber-500" />
                        +{node.goldenKeysReward ?? 5} keys
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PortalPageLayout>
    );
  }

  // Main browse page
  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Wildfire Beacon Runs</h1>
          <p className="text-muted-foreground">
            Guided tours through the platform. Earn Golden Keys. Unlock Magic Carpet rides.
          </p>
        </div>
      </div>

      {/* Pathway Progress Card */}
      <PathwayProgressCard variant="compact" showWildfireRuns={false} />

      {/* User Status */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-xl">{goldenKeys}</span>
                <span className="text-muted-foreground">Golden Keys</span>
              </div>
              {isRedCarpetRider ? (
                <Badge className="bg-red-500/10 text-red-500 border-red-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Red Carpet Rider
                </Badge>
              ) : goldenKeys >= 50 ? (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  <Star className="w-3 h-3 mr-1" />
                  Power User
                </Badge>
              ) : null}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/golden-key")}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Earn More Keys
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progressive Disclosure: How It Works */}
      <ExpandableBlock
        title="🔥 How Wildfire Runs Work"
        subtitle="Auto-guided tours through the platform"
        preview="Click to learn about stop modes, Golden Keys, and Magic Carpet rides..."
        accentColor="#f97316"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Wildfire Beacon Runs automatically navigate you through key platform features.
            Each run has multiple stops (decision points) that you'll visit in sequence.
          </p>
          
          <DataVizBar
            title="Stop Modes"
            subtitle="Different ways to experience runs"
            data={[
              { label: 'Wildfire (5s auto)', value: 40, color: '#f97316', icon: '🔥' },
              { label: 'Tourist (30s pause)', value: 30, color: '#3b82f6', icon: '👁️' },
              { label: 'On-Resume (manual)', value: 30, color: '#8b5cf6', icon: '⏸️' },
            ]}
            maxValue={100}
            showPercentages={false}
            height={20}
          />

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                Golden Keys
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Earn keys by completing Cephas learning modules. 5 keys per stop unlocks Magic Carpet mode.
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Crown className="w-4 h-4 text-red-500" />
                Red Carpet Rider
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Red Carpet members get all stop modes unlocked automatically on every run.
              </p>
            </div>
          </div>
        </div>
      </ExpandableBlock>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="all" className="gap-1">
            <Zap className="w-4 h-4" />
            All Runs
          </TabsTrigger>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = RUNS_BY_CATEGORY[key as keyof typeof RUNS_BY_CATEGORY]?.length || 0;
            if (count === 0) return null;
            return (
              <TabsTrigger key={key} value={key} className="gap-1">
                <Icon className={`w-4 h-4 ${config.color}`} />
                {config.name}
                <Badge variant="outline" className="ml-1 text-xs">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {/* Runs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayRuns.map((run) => (
              <RunCard
                key={run.id}
                run={run}
                goldenKeys={goldenKeys}
                isRedCarpetRider={isRedCarpetRider}
                onStart={handleStartRun}
              />
            ))}
          </div>

          {displayRuns.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Ghost className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No runs in this category yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Bottom CTA */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Ready to explore?</h3>
              <p className="text-sm text-muted-foreground">
                Start with the Quick Platform Tour to get oriented.
              </p>
            </div>
            <Button 
              className="gap-2 bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                const quickTour = getRunBySlug("onboarding-quick");
                if (quickTour) handleStartRun(quickTour);
              }}
            >
              <Flame className="w-4 h-4" />
              Start Quick Tour
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
