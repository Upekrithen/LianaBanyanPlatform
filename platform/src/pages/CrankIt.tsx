/**
 * CRANK IT — Cold Start Page
 * ==========================
 * The entry point for new users who want to test a business idea.
 * Like a 1978 CJ-7 Jeep — try again as many times as you want.
 * 
 * "I was left on the side of the road 22 times, essentially replacing ¾ of the Jeep.
 *  The radio always worked. I learned most of what I know about cars from taking
 *  that thing apart and rebuilding it because I didn't have money to pay someone else.
 *  That's what Thought Experiment is for your pet project."
 * 
 * First 100 simulations FREE. Then $5 per 100 attempts.
 * Same price as annual membership — by design.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSeamlessOnboard } from '@/components/SeamlessOnboardDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wrench,
  Lightbulb,
  Play,
  ArrowRight,
  Sparkles,
  Calculator,
  Target,
  Zap,
  RefreshCcw,
  Car,
  Key,
  Ghost,
  User,
} from 'lucide-react';

interface UsageStats {
  totalAttempts: number;
  freeRemaining: number;
  paidBatches: number;
}

const FREE_TIER_LIMIT = 100;
const BATCH_SIZE = 100;
const BATCH_PRICE = 5;

export default function CrankIt() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalAttempts: 0,
    freeRemaining: FREE_TIER_LIMIT,
    paidBatches: 0,
  });

  useEffect(() => {
    loadUsageStats();
  }, [user]);

  const loadUsageStats = () => {
    // For members, we'd load from database
    // For ghosts, we load from localStorage
    const ghostAttempts = parseInt(localStorage.getItem('lb_thought_experiment_attempts') || '0');
    const paidBatches = parseInt(localStorage.getItem('lb_thought_experiment_batches') || '0');
    
    const totalAllowed = FREE_TIER_LIMIT + (paidBatches * BATCH_SIZE);
    const used = ghostAttempts;
    const freeRemaining = Math.max(0, FREE_TIER_LIMIT - used);
    
    setUsageStats({
      totalAttempts: used,
      freeRemaining,
      paidBatches,
    });
  };

  const isGhost = !user;
  const hasFreeTierRemaining = usageStats.freeRemaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-500/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Wrench className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Cold Start</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            CRANK IT
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Got a business idea? Test it here. Break it. Rebuild it. Learn everything.
          </p>
        </div>

        {/* The Jeep Story */}
        <Card className="mb-8 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-amber-500" />
              The Jeep Principle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="border-l-4 border-amber-500 pl-4 italic text-muted-foreground">
              "I had a 1978 CJ-7 Jeep I bought for $2K. I was left on the side of the road 22 times, 
              essentially replacing ¾ of the Jeep. The radio always worked. I learned most of what 
              I know about cars from taking that thing apart and rebuilding it because I didn't have 
              money to pay someone else."
            </blockquote>
            <blockquote className="border-l-4 border-amber-500 pl-4 italic text-muted-foreground mt-4">
              "I learned to love stick shift cars, because when the battery died I could start it 
              by rolling down an incline and shifting into gear. <strong>That is a worthwhile lesson 
              that automation does not teach.</strong>"
            </blockquote>
            <p className="mt-4 text-sm">
              <strong>That's what Thought Experiment is for your pet project</strong> — try again, 
              as many times as you want. Break it. Learn from it. Rebuild it. Understand the mechanics 
              deeply enough that when something breaks, you know how to fix it yourself.
            </p>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {isGhost ? <Ghost className="w-5 h-5" /> : <User className="w-5 h-5" />}
                Your Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={isGhost ? "outline" : "default"}>
                  {isGhost ? "Ghost" : "Member"}
                </Badge>
                {isGhost && (
                  <span className="text-xs text-muted-foreground">
                    Results saved in browser only
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Free attempts remaining</span>
                  <span className="font-bold">{usageStats.freeRemaining} / {FREE_TIER_LIMIT}</span>
                </div>
                <Progress 
                  value={(usageStats.freeRemaining / FREE_TIER_LIMIT) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                Total simulations run: <strong>{usageStats.totalAttempts}</strong>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <span className="font-medium">First 100 attempts</span>
                  <Badge className="bg-green-600">FREE</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <span>Each additional 100</span>
                  <span className="font-bold">${BATCH_PRICE}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Same as annual membership. The lowest incubator cost in history — 
                $5 per 100 attempts to find your business's sweet spot.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main CTA */}
        <Card className="mb-8 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <Lightbulb className="w-6 h-6 text-amber-500" />
              Ready to Test Your Idea?
            </CardTitle>
            <CardDescription>
              Select an initiative, adjust assumptions, see projected outcomes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg gap-2"
              onClick={() => navigate('/thought-experiment')}
              disabled={!hasFreeTierRemaining && usageStats.paidBatches === 0}
            >
              <Play className="w-5 h-5" />
              "What If?"
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            {!hasFreeTierRemaining && usageStats.paidBatches === 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                You've used all free attempts. 
                <Button variant="link" className="px-1" onClick={() => navigate('/herald')}>
                  Get 100 more for $5
                </Button>
              </p>
            )}
          </CardContent>
        </Card>

        {/* What You'll Learn */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              What 100 Simulations Teaches You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">Which Assumptions Matter Most</p>
                  <p className="text-sm text-muted-foreground">
                    See which variables have the biggest impact on your bottom line
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Target className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Where Break-Even Lives</p>
                  <p className="text-sm text-muted-foreground">
                    Find the exact order volume and price point where you turn profitable
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <RefreshCcw className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">What You Can Control</p>
                  <p className="text-sm text-muted-foreground">
                    Separate the factors you can change from those you must adapt to
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">When to Pivot vs. Persist</p>
                  <p className="text-sm text-muted-foreground">
                    Know whether to tweak your model or try something completely different
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-center text-sm">
                <Key className="inline w-4 h-4 mr-1" />
                <strong>The radio always worked.</strong> The learning was worth every breakdown.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ghost upsell */}
        {isGhost && (
          <Card className="mt-8 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">Save Your Simulations Forever</h3>
                  <p className="text-sm text-muted-foreground">
                    As a Ghost, your simulations are stored in your browser only. 
                    Join for $5/year to save them permanently and adopt your best ideas.
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
