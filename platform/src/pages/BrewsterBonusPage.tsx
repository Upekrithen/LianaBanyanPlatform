/**
 * BREWSTER BONUS LANDING PAGE
 * =============================
 * Alcove #7 in the Hallway — the first stop in Tier 2 (Mechanics).
 *
 * Progressive disclosure:
 *   1. Hero — the one-sentence hook
 *   2. How It Works — 3 steps
 *   3. Tier Ladder — visual breakdown
 *   4. The Key Quote — SEC defense in plain English
 *   5. Parallels — Costco, credit cards, bank bonuses
 *   6. Comprehension Questions — earn Marks
 *   7. CTA — back your first Marks
 *
 * Route: /learn/brewster-bonus
 */

import { useState } from 'react';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Flame, Shield, TrendingDown, Gift, CheckCircle, XCircle,
  ArrowRight, Award, HelpCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { BrewsterBonus } from '@/components/BrewsterBonus';
import { BREWSTER_TIERS } from '@/lib/brewsterBonus';
import { Anvil, CurrencyGlyph } from '@/components/CreditSymbol';

export function BrewsterBonusPage() {
  const [showFAQ, setShowFAQ] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <PortalPageLayout maxWidth="lg" xrayId="brewster-bonus">
      <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <Anvil size={64} className="text-indigo-500" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Make a Name for Yourself.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">
          Put your platform service units where your mouth is.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          {BREWSTER_TIERS.slice(0, 3).map(tier => (
            <span key={tier.id} className="text-3xl">{tier.icon}</span>
          ))}
        </div>
        <h2 className="text-2xl font-semibold text-muted-foreground">The Brewster Bonus</h2>
        <p className="text-base text-muted-foreground max-w-xl mx-auto">
          Back your Marks. Deploy them. Clear your pouch. Get rewarded with Credits
          funded by real volume savings — not speculation.
        </p>
        <Badge variant="outline" className="text-sm px-4 py-1">
          Alcove #7 • Mechanics Tier
        </Badge>
      </div>

      {/* Interactive Demo */}
      <BrewsterBonus
        marksCleared={750}
        totalMarksBacked={1000}
        isFullyClear={false}
        variant="dashboard"
      />

      {/* The Key Quote */}
      <Card className="border-2 border-indigo-500/30 bg-indigo-500/5">
        <CardContent className="py-8 text-center">
          <blockquote className="text-lg font-medium italic max-w-xl mx-auto">
            "This is not a speculative return. It is a loyalty-driven volume
            discount passed back as platform currency."
          </blockquote>
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            <Badge variant="secondary">Fails all 4 Howey prongs</Badge>
            <Badge variant="secondary">Closed-loop Credits</Badge>
            <Badge variant="secondary">Decaying returns</Badge>
            <Badge variant="secondary">Real economic savings</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Parallels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            You Already Know This
          </CardTitle>
          <CardDescription>
            The Brewster Bonus works exactly like programs you already use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ParallelCard
              name="Costco Annual Rebate"
              icon="🏬"
              trigger="Annual spending"
              reward="2% rebate check"
              funded="Membership fees + margins"
            />
            <ParallelCard
              name="Credit Card Cashback"
              icon="💳"
              trigger="Transaction volume"
              reward="1-5% statement credit"
              funded="Interchange fees"
            />
            <ParallelCard
              name="Bank Opening Bonus"
              icon="🏦"
              trigger="Deposit maintenance"
              reward="$200-$500 bonus"
              funded="Net interest margin"
            />
            <ParallelCard
              name="Brewster Bonus"
              icon="🔥"
              trigger="Mark clearance"
              reward="1-10% in Credits"
              funded="Volume discount savings"
              highlight
            />
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            None of these are membership rights. Neither is the Brewster Bonus.
          </p>
        </CardContent>
      </Card>

      {/* Decaying Returns Explainer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-500" />
            Why Returns Decay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Most financial systems compound — the more you have, the faster it grows.
            The Brewster Bonus does the opposite. The more Marks you clear, the
            LOWER your bonus rate. This is by design:
          </p>

          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
            <div className="flex-1">
              <div className="text-sm font-medium">Traditional Compound Growth</div>
              <div className="text-xs text-muted-foreground">
                $100 → $110 → $121 → $133... (accelerating)
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium text-amber-500">Brewster Decay</div>
              <div className="text-xs text-muted-foreground">
                10% → 7% → 5% → 3% → 2% → 1% (decelerating)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-xs font-semibold text-red-600 mb-1">Speculation</div>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• Unbounded growth</li>
                <li>• Rewards accumulation</li>
                <li>• Rich get richer</li>
                <li>• Membership rights risk</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-xs font-semibold text-green-600 mb-1">Brewster Bonus</div>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                <li>• Bounded decay</li>
                <li>• Rewards participation</li>
                <li>• Everyone benefits</li>
                <li>• Loyalty program</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehension Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            Check Your Understanding
          </CardTitle>
          <CardDescription>
            Answer correctly to earn Marks and progress toward your Pattern Key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <QuestionBlock
            id="q1"
            type="Basic"
            reward={2}
            question="Is the Brewster Bonus a speculative return?"
            options={['Yes', 'No']}
            correct="No"
            answer={answers['q1']}
            onAnswer={(a) => setAnswers(prev => ({ ...prev, q1: a }))}
            explanation="It's a loyalty-driven volume discount — structurally identical to Costco rebates and credit card cashback."
          />
          <Separator />
          <QuestionBlock
            id="q2"
            type="Applied"
            reward={5}
            question="What funds the Brewster Bonus?"
            options={[
              'New member fees',
              'Platform reserves',
              'Volume discount savings from projects',
              'Government grants',
            ]}
            correct="Volume discount savings from projects"
            answer={answers['q2']}
            onAnswer={(a) => setAnswers(prev => ({ ...prev, q2: a }))}
            explanation="When projects buy in bulk, the savings vs. retail pricing fund participant rewards. Real economics, not speculation."
          />
          <Separator />
          <QuestionBlock
            id="q3"
            type="Synthesis"
            reward={10}
            question="Why do bonus rates DECAY at higher tiers?"
            options={[
              'To save money',
              'To prevent wealth concentration and reward participation over accumulation',
              'Because large participants don\'t deserve rewards',
              'Random design choice',
            ]}
            correct="To prevent wealth concentration and reward participation over accumulation"
            answer={answers['q3']}
            onAnswer={(a) => setAnswers(prev => ({ ...prev, q3: a }))}
            explanation="Decaying returns are the structural opposite of speculative dynamics. They ensure the system rewards breadth of participation, not depth of capital."
          />
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowFAQ(!showFAQ)}
        >
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Frequently Asked Questions
            </span>
            {showFAQ ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardTitle>
        </CardHeader>
        {showFAQ && (
          <CardContent className="space-y-4">
            <FAQItem
              q="Can I cash out my Brewster Bonus?"
              a="No. Bonuses are paid in closed-loop Credits — platform currency that buys goods and services inside the system. This is a loyalty reward, not a cash payout."
            />
            <FAQItem
              q="What if I don't clear all my Marks?"
              a="You only receive the Brewster Bonus when your Mark Pouch is completely empty — all backed Marks deployed and cleared. Partial clearance earns no bonus."
            />
            <FAQItem
              q="Why does the rate go DOWN as I clear more?"
              a="Decaying rates prevent wealth concentration and ensure the system rewards breadth of participation. A participant clearing 50 Marks gets 10%. One clearing 500,000 gets 1%. Everyone benefits, nobody dominates."
            />
            <FAQItem
              q="Doesn't this sound like speculation?"
              a="No. Speculative instruments involve money, common enterprises, profit expectations, and reliance on others' efforts (the Howey Test). The Brewster Bonus fails ALL FOUR prongs. It's funded by real volume savings, paid in non-transferable currency, requires your own effort, and has no common pool."
            />
            <FAQItem
              q="What's stopping the platform from changing the rates?"
              a="The Brewster Bonus tiers follow the production level framework, which is constitutionally locked. Changes require supermajority vote by The 300."
            />
          </CardContent>
        )}
      </Card>

      {/* CTA */}
      <div className="text-center py-8 space-y-4">
        <h2 className="text-2xl font-bold">Ready to Start?</h2>
        <p className="text-muted-foreground">
          Back your first Marks. Deploy them productively. Clear your pouch.
        </p>
        <div className="flex justify-center gap-3">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Flame className="w-4 h-4 mr-2" />
            Back Marks Now
          </Button>
          <Button variant="outline">
            <ArrowRight className="w-4 h-4 mr-2" />
            Next Alcove: The Radio Contest
          </Button>
        </div>
      </div>
      </div>
    </PortalPageLayout>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ParallelCard({
  name, icon, trigger, reward, funded, highlight,
}: {
  name: string;
  icon: string;
  trigger: string;
  reward: string;
  funded: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${highlight ? 'border-amber-500/50 bg-amber-500/5' : 'bg-card'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="font-medium text-sm">{name}</span>
        {highlight && <Badge variant="secondary" className="text-[10px]">THIS</Badge>}
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-muted-foreground">Trigger</div>
          <div className="font-medium">{trigger}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Reward</div>
          <div className="font-medium">{reward}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Funded By</div>
          <div className="font-medium">{funded}</div>
        </div>
      </div>
    </div>
  );
}

function QuestionBlock({
  id, type, reward, question, options, correct, answer, onAnswer, explanation,
}: {
  id: string;
  type: string;
  reward: number;
  question: string;
  options: string[];
  correct: string;
  answer?: string;
  onAnswer: (answer: string) => void;
  explanation: string;
}) {
  const isAnswered = !!answer;
  const isCorrect = answer === correct;

  const typeColors: Record<string, string> = {
    Basic: 'bg-green-500/20 text-green-600',
    Applied: 'bg-amber-500/20 text-amber-600',
    Synthesis: 'bg-indigo-500/20 text-indigo-600',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge className={typeColors[type] || ''} variant="secondary">
          {type}
        </Badge>
        <span className="text-xs text-muted-foreground">
          +{reward} Marks
        </span>
      </div>
      <p className="font-medium text-sm">{question}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map(option => {
          const isThis = answer === option;
          const isTheCorrect = option === correct;

          return (
            <Button
              key={option}
              variant={isThis ? (isCorrect ? 'default' : 'destructive') : 'outline'}
              size="sm"
              disabled={isAnswered}
              onClick={() => onAnswer(option)}
              className={`justify-start text-left h-auto py-2 ${
                isAnswered && isTheCorrect ? 'border-green-500 bg-green-500/10' : ''
              }`}
            >
              {isAnswered && isTheCorrect && <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />}
              {isAnswered && isThis && !isCorrect && <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />}
              <span className="text-xs">{option}</span>
            </Button>
          );
        })}
      </div>
      {isAnswered && (
        <div className={`p-3 rounded-lg text-xs ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <div className="font-medium mb-1">
            {isCorrect ? `✅ Correct! +${reward} Marks` : '❌ Not quite.'}
          </div>
          <div className="text-muted-foreground">{explanation}</div>
        </div>
      )}
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <div className="font-medium text-sm">{q}</div>
      <div className="text-xs text-muted-foreground mt-1">{a}</div>
    </div>
  );
}

export default BrewsterBonusPage;
