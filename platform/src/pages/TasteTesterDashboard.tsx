/**
 * Taste Tester Dashboard
 * ======================
 * Track progress towards Master Taster status.
 * 
 * Rewards:
 * - First 100 orders: 5 Marks + 10 Rep
 * - 101-500 orders: 3 Marks + 5 Rep
 * - 501-2000 orders: 2 Marks + 3 Rep
 * - 2001-5000 orders: 1 Mark + 1 Rep
 * 
 * Master Taster: 10+ recipes you tested hit 5K orders
 * Benefit: All Marks convert to Credits!
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Utensils, 
  Award, 
  TrendingUp, 
  Star, 
  Coins,
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { DemandAggregationExplainer } from '@/components/DemandAggregationExplainer';
import {
  TASTE_TESTER_TIERS,
  MASTER_TASTER_THRESHOLD,
  VETTING_THRESHOLD,
  calculateTasteTesterReward,
  getTasteTesterExplanation,
  calculateMasterTasterProgress,
} from '@/lib/tasteTesterService';
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface TasteTestRecord {
  id: string;
  recipe_title: string;
  recipe_photo?: string;
  order_number: number;
  ordered_at: string;
  marks_earned: number;
  reputation_earned: number;
  recipe_total_orders: number;
  recipe_reached_5k: boolean;
}

interface TasteTesterStats {
  total_recipes_tested: number;
  total_marks_earned: number;
  total_reputation_earned: number;
  current_marks_balance: number;
  recipes_reached_5k: number;
  is_master_taster: boolean;
  master_taster_achieved_at?: string;
}

export default function TasteTesterDashboard() {
  const { user } = useAuth();
  const [showExplainer, setShowExplainer] = useState(false);

  // Fetch taste tester stats
  const { data: stats } = useQuery({
    queryKey: ['taste-tester-stats', user?.id],
    queryFn: async () => {
      // In production, query user_taste_tester_stats
      return {
        total_recipes_tested: 15,
        total_marks_earned: 45,
        total_reputation_earned: 85,
        current_marks_balance: 45,
        recipes_reached_5k: 3,
        is_master_taster: false,
      } as TasteTesterStats;
    },
    enabled: !!user,
  });

  // Fetch taste test history
  const { data: history = [] } = useQuery({
    queryKey: ['taste-tester-history', user?.id],
    queryFn: async () => {
      // In production, query taste_tester_records
      return [] as TasteTestRecord[];
    },
    enabled: !!user,
  });

  const masterTasterProgress = stats 
    ? calculateMasterTasterProgress(stats.recipes_reached_5k)
    : { current: 0, required: 10, percentage: 0, remaining: 10 };

  if (!user) {
    return (
      <PortalPageLayout>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your Taste Tester dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="landing-page min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Explainer Dialog */}
        <DemandAggregationExplainer
          open={showExplainer}
          onOpenChange={setShowExplainer}
          autoExpandSection="taste-tester"
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Utensils className="h-8 w-8" />
              Taste Tester Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Be an early adopter of new recipes and earn rewards!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplainer(true)}
              className="gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              How It Works
            </Button>
            {stats?.is_master_taster && (
              <Badge className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-lg px-4 py-2">
                <Trophy className="h-5 w-5 mr-2" />
                Master Taster
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats?.total_recipes_tested || 0}</div>
              <div className="text-sm text-muted-foreground">Recipes Tested</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold flex items-center gap-1">
                <Coins className="h-4 w-4 text-amber-500" />
                {stats?.current_marks_balance || 0}
              </div>
              <div className="text-sm text-muted-foreground">Marks Balance</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold flex items-center gap-1">
                <Star className="h-4 w-4 text-purple-500" />
                {stats?.total_reputation_earned || 0}
              </div>
              <div className="text-sm text-muted-foreground">Reputation</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-emerald-500">
                {stats?.recipes_reached_5k || 0}
              </div>
              <div className="text-sm text-muted-foreground">Hit 5K Orders</div>
            </CardContent>
          </Card>
          <Card className={stats?.is_master_taster ? 'ring-2 ring-amber-500' : ''}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {masterTasterProgress.remaining}
              </div>
              <div className="text-sm text-muted-foreground">To Master Taster</div>
            </CardContent>
          </Card>
        </div>

        {/* Master Taster Progress */}
        <Card className={`${stats?.is_master_taster ? 'bg-gradient-to-r from-amber-500/10 to-rose-500/10 border-amber-500/30' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className={`h-5 w-5 ${stats?.is_master_taster ? 'text-amber-500' : ''}`} />
              Master Taster Progress
            </CardTitle>
            <CardDescription>
              {stats?.is_master_taster 
                ? "Congratulations! You've achieved Master Taster status!"
                : `Test recipes that reach ${VETTING_THRESHOLD.toLocaleString()} orders. ${MASTER_TASTER_THRESHOLD} successes = Master Taster!`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Progress value={masterTasterProgress.percentage} className="flex-1 h-3" />
              <span className="text-lg font-bold">
                {masterTasterProgress.current}/{masterTasterProgress.required}
              </span>
            </div>

            {stats?.is_master_taster ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  All Marks automatically convert to Credits!
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  As a Master Taster, your Marks are now equivalent to Credits. Keep testing to earn more!
                </p>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Master Taster Benefit
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  When you reach Master Taster, all your accumulated Marks ({stats?.current_marks_balance || 0}) 
                  will convert to Credits!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reward Tiers Explanation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Taste Tester Rewards
            </CardTitle>
            <CardDescription>
              The earlier you try a recipe, the more you earn!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {TASTE_TESTER_TIERS.map((tier, idx) => {
                const prevMax = idx === 0 ? 0 : TASTE_TESTER_TIERS[idx - 1].maxOrder;
                return (
                  <div 
                    key={tier.maxOrder} 
                    className={`p-4 rounded-lg border ${
                      idx === 0 ? 'bg-emerald-500/10 border-emerald-500/30' :
                      idx === 1 ? 'bg-blue-500/10 border-blue-500/30' :
                      idx === 2 ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-muted border-muted-foreground/20'
                    }`}
                  >
                    <div className="text-sm text-muted-foreground">
                      Order #{prevMax + 1} - #{tier.maxOrder}
                    </div>
                    <div className="font-bold mt-1">
                      +{tier.marks} Marks, +{tier.reputation} Rep
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {idx === 0 ? 'Early Adopter' :
                       idx === 1 ? 'Pioneer' :
                       idx === 2 ? 'Explorer' : 'Vetter'}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              After 5,000 orders, a recipe is fully vetted. No more Taste Tester rewards, but makers earn Icing!
            </p>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Your Testing History</CardTitle>
            <CardDescription>
              Recipes you've tested and their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Utensils className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium">No recipes tested yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Order new recipes to earn Taste Tester rewards!
                </p>
                <Button>
                  Browse New Recipes
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(record => (
                  <div 
                    key={record.id}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    {record.recipe_photo && (
                      <div 
                        className="w-12 h-12 rounded bg-cover bg-center"
                        style={{ backgroundImage: `url(${record.recipe_photo})` }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{record.recipe_title}</div>
                      <div className="text-sm text-muted-foreground">
                        Order #{record.order_number} • {new Date(record.ordered_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        +{record.marks_earned} Marks, +{record.reputation_earned} Rep
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Recipe at {record.recipe_total_orders.toLocaleString()}/{VETTING_THRESHOLD.toLocaleString()}
                      </div>
                    </div>
                    {record.recipe_reached_5k && (
                      <Badge className="bg-emerald-500">5K!</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
