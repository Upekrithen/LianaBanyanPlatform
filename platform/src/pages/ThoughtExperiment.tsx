/**
 * THOUGHT EXPERIMENT — "What If" Page
 * ====================================
 * Main simulation page where users run business "what-if" scenarios.
 * 
 * Flow:
 * 1. CRANK IT (cold start) → "What If?" button → Here
 * 2. Ghost World → "Test a Business Idea" card → BusinessSimulator modal
 * 3. Dashboard → Portfolio → Saved simulations
 * 
 * Pricing:
 * - First 100 FREE (Ghosts and Members)
 * - $5 per 100 additional (same as membership — by design)
 * 
 * Member: Results auto-save to portfolio (persists forever)
 * Ghost: Results in localStorage (does NOT persist across devices)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeamlessOnboard } from '@/components/SeamlessOnboardDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Lightbulb,
  ArrowLeft,
  Save,
  FolderOpen,
  AlertCircle,
  Ghost,
  User,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { BusinessSimulator } from '@/components/BusinessSimulator';
import { SimulationPortfolio } from '@/components/SimulationPortfolio';
import { useToast } from '@/hooks/use-toast';
import type { BusinessScenario, BusinessProjections } from '@/lib/businessSimulationService';

const FREE_TIER_LIMIT = 100;

interface SavedSimulation {
  scenario: BusinessScenario;
  projections: BusinessProjections;
  savedAt: string;
}

export default function ThoughtExperiment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('simulate');
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const isGhost = !user;

  useEffect(() => {
    loadAttemptCount();
    loadSavedSimulations();
  }, [user]);

  const loadAttemptCount = () => {
    const count = parseInt(localStorage.getItem('lb_thought_experiment_attempts') || '0');
    setAttemptCount(count);
  };

  const loadSavedSimulations = () => {
    // Ghosts: localStorage
    // Members: would load from Supabase (thought_experiments table)
    const ghostSimulations = JSON.parse(localStorage.getItem('lb_ghost_simulations') || '[]');
    setSavedSimulations(ghostSimulations.map((s: any) => ({
      scenario: s,
      projections: s.projections,
      savedAt: s.savedAt || new Date().toISOString(),
    })));
  };

  const incrementAttemptCount = () => {
    const newCount = attemptCount + 1;
    setAttemptCount(newCount);
    localStorage.setItem('lb_thought_experiment_attempts', newCount.toString());
    
    // Check if approaching limit
    if (newCount === FREE_TIER_LIMIT - 10) {
      toast({
        title: "10 free attempts remaining",
        description: "After that, it's $5 per 100 — same as membership.",
      });
    }
    
    if (newCount >= FREE_TIER_LIMIT) {
      const paidBatches = parseInt(localStorage.getItem('lb_thought_experiment_batches') || '0');
      const paidAttempts = paidBatches * 100;
      if (newCount >= FREE_TIER_LIMIT + paidAttempts) {
        setShowUpgradePrompt(true);
      }
    }
  };

  const handleSimulationComplete = (scenario: BusinessScenario, projections: BusinessProjections) => {
    incrementAttemptCount();
    
    // Save to localStorage for Ghosts
    const newSim: SavedSimulation = {
      scenario: { ...scenario, projections },
      projections,
      savedAt: new Date().toISOString(),
    };
    
    const updated = [...savedSimulations, newSim];
    setSavedSimulations(updated);
    
    // Persist to localStorage
    const forStorage = updated.map(s => ({
      ...s.scenario,
      projections: s.projections,
      savedAt: s.savedAt,
    }));
    localStorage.setItem('lb_ghost_simulations', JSON.stringify(forStorage));
    
    toast({
      title: "Simulation complete!",
      description: `Net score: ${(projections.netScore * 100).toFixed(0)}%${isGhost ? ' — Saved to browser' : ''}`,
    });
  };

  const handleAdopt = (scenario: BusinessScenario) => {
    if (isGhost) {
      toast({
        title: "Join to adopt your idea",
        description: "Members can turn simulations into real businesses",
      });
      openOnboard({ reason: "save your simulations", actionLabel: "Join", membershipIncluded: true });
    } else {
      // Navigate to initiative enrollment with pre-filled data
      navigate(`/initiatives/${scenario.initiativeId}`, { 
        state: { adoptedScenario: scenario } 
      });
    }
  };

  const freeRemaining = Math.max(0, FREE_TIER_LIMIT - attemptCount);
  const canSimulate = freeRemaining > 0 || parseInt(localStorage.getItem('lb_thought_experiment_batches') || '0') > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/crank-it')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Crank It
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <Lightbulb className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Thought Experiment
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            "What If?"
          </h1>
          <p className="text-muted-foreground">
            Test your business idea with platform economics • Creator/Worker keeps 83.3%
          </p>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-4">
            <Badge variant={isGhost ? "outline" : "default"} className="gap-1">
              {isGhost ? <Ghost className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {isGhost ? "Ghost" : "Member"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Free attempts: <strong>{freeRemaining}</strong> / {FREE_TIER_LIMIT}
            </span>
            <span className="text-sm text-muted-foreground">
              Total run: <strong>{attemptCount}</strong>
            </span>
          </div>
          
          {isGhost && (
            <Button variant="outline" size="sm" onClick={() => openOnboard({ reason: "save your simulations", actionLabel: "Join", membershipIncluded: true })} className="gap-1">
              <Sparkles className="w-3 h-3" />
              Join to save permanently
            </Button>
          )}
        </div>

        {/* Upgrade Prompt */}
        {showUpgradePrompt && (
          <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>You've used all your free attempts. Get 100 more for $5.</span>
              <Button size="sm" onClick={() => navigate('/herald')}>
                Unlock More
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="simulate" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Simulate
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              Portfolio ({savedSimulations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulate">
            {canSimulate ? (
              <BusinessSimulator
                isGhostMode={isGhost}
                onSimulationComplete={handleSimulationComplete}
                onAdopt={handleAdopt}
              />
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Free Tier Exhausted</h3>
                  <p className="text-muted-foreground mb-6">
                    You've run {attemptCount} simulations. Get 100 more for $5.
                  </p>
                  <Button onClick={() => navigate('/herald')}>
                    Unlock 100 More Attempts
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            <SimulationPortfolio
              simulations={savedSimulations}
              isGhostMode={isGhost}
              onViewDetails={(sim) => {
                // Could open a modal with full details
                toast({
                  title: sim.scenario.name || sim.scenario.initiativeName,
                  description: `Net score: ${(sim.projections.netScore * 100).toFixed(0)}% | Monthly revenue: $${sim.projections.monthlyProfit.toFixed(0)}`,
                });
              }}
              onAdopt={(sim) => handleAdopt(sim.scenario)}
            />
          </TabsContent>
        </Tabs>

        {/* Ghost Upsell Footer */}
        {isGhost && (
          <Card className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Save className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold">Your simulations are stored locally</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear your browser and they're gone. Join for $5/year to save permanently, 
                    adopt your best ideas, and start your business.
                  </p>
                </div>
                <Button onClick={() => openOnboard({ reason: "save your simulations", actionLabel: "Join", membershipIncluded: true })}>
                  Join for $5/year
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
