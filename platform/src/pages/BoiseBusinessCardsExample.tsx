/**
 * BOISE BUSINESS CARDS — Worked Example of the Cooperative Economy
 * Route: /worked-example
 * 7-step walkthrough with running ledger sidebar showing how the full cycle works.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CurrencyGlyph, CurrencyAmount } from '@/components/CreditSymbol';
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
  Zap, Shield, Megaphone, Users, Truck, Award, Flame,
  CheckCircle2, Clock, DollarSign
} from 'lucide-react';

interface LedgerState {
  joules: number;
  backedMarks: number;
  creditsEarned: number;
  xp: number;
  escrowedMarks: number;
  fiatInCooperative: number;
  membersInvolved: number;
  stewardTier: string;
}

const INITIAL_LEDGER: LedgerState = {
  joules: 0,
  backedMarks: 0,
  creditsEarned: 0,
  xp: 0,
  escrowedMarks: 0,
  fiatInCooperative: 0,
  membersInvolved: 1,
  stewardTier: '—',
};

const STEPS: Array<{
  number: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  narrative: string;
  systemEvents: string[];
  sarahSees: string[];
  ledger: LedgerState;
  highlight: string;
}> = [
  {
    number: 1,
    title: 'Sarah Buys Joules ($500)',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-blue-400',
    narrative: 'Sarah lives in Boise, Idaho. She\'s been a member for three weeks, signed up through a Cue Card from her friend Marcus. She wants to be a Node Founding Captain for Boise. Her first step: purchase 500 Joules for $500.',
    systemEvents: [
      '$500 moves: Sarah\'s bank → Stripe → Mercury (LB operational account)',
      '500 Joules appear in Sarah\'s account at today\'s Forever Stamp rate',
      '5x pre-mint multiplier: 500 Joules carry 2,500 effective C+20 purchasing power',
      '$500 in fiat is now inside the cooperative — cannot leave without an approved wire transfer',
    ],
    sarahSees: [
      'Joules: 500 (Forever Stamp: locked at pre-mint rate)',
      'Effective purchasing power: 2,500 (5x pre-mint multiplier)',
    ],
    ledger: {
      joules: 500,
      backedMarks: 0,
      creditsEarned: 0,
      xp: 0,
      escrowedMarks: 0,
      fiatInCooperative: 500,
      membersInvolved: 1,
      stewardTier: '—',
    },
    highlight: 'The money entered the cooperative. It stays inside.',
  },
  {
    number: 2,
    title: 'Sarah Backs Her Marks with Joules',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-amber-400',
    narrative: 'Sarah converts 400 of her Joules into 400 Backed Marks. These are spendable ONLY on project sponsorship — not personal essentials. The Immutable Ledger records every step.',
    systemEvents: [
      '400 Joules placed as collateral in cooperative treasury',
      '400 Backed Marks appear in Sarah\'s account',
      'Backed Marks restricted to project sponsorship only',
      'Ledger records: "400 Backed Marks created, collateral: 400 Joules (Sarah Chen)"',
      '100 Joules retained as surplus storage',
    ],
    sarahSees: [
      'Joules: 100 (retained)',
      'Backed Marks: 400 (available for project sponsorship)',
      'Collateral status: 400 Joules held in cooperative treasury',
    ],
    ledger: {
      joules: 100,
      backedMarks: 400,
      creditsEarned: 0,
      xp: 0,
      escrowedMarks: 0,
      fiatInCooperative: 500,
      membersInvolved: 1,
      stewardTier: '—',
    },
    highlight: 'Backed Marks are collateralized — real value behind every Mark.',
  },
  {
    number: 3,
    title: 'Sarah Creates the Campaign as a Steward',
    icon: <Megaphone className="w-6 h-6" />,
    color: 'text-emerald-400',
    narrative: 'Sarah opens a Steward campaign for "Boise Area LB Business Cards — 1,000 units." Printer quote: $0.32/card × 1,000 = $320. Cost+20%: $384 total. She pledges 384 Backed Marks as the Steward — escrowed to this specific campaign.',
    systemEvents: [
      'Printer quote: $0.32/card × 1,000 = $320 production cost',
      'Cost+20% margin: $320 × 1.20 = $384 total campaign cost',
      '384 of Sarah\'s Backed Marks escrowed to this campaign',
      'Campaign appears on Launch Tracker with progress thermometer',
      'Shadow Mark demand signals from Boise-area members begin accumulating',
      '14-day campaign deadline starts',
    ],
    sarahSees: [
      'Campaign: Boise Area LB Business Cards',
      'Status: FUNDED (Steward pledge covers 100%)',
      'Demand signals: 47 Shadow Marks from 23 members',
      'Deadline: 14 days remaining',
      'Your pledge: 384 Backed Marks (escrowed)',
    ],
    ledger: {
      joules: 100,
      backedMarks: 16,
      creditsEarned: 0,
      xp: 0,
      escrowedMarks: 384,
      fiatInCooperative: 500,
      membersInvolved: 1,
      stewardTier: 'Apprentice',
    },
    highlight: 'Escrowed per-project — compartmentalized, not pooled. Skin in the game.',
  },
  {
    number: 4,
    title: 'The Community Responds',
    icon: <Users className="w-6 h-6" />,
    color: 'text-purple-400',
    narrative: 'Over the next 10 days: 23 Boise-area members allocate Shadow Marks. 8 also pledge Credits toward pre-orders. 3 members use Cue Cards to invite friends who sign up. The campaign\'s demand signal crystallizes after 3 consecutive days.',
    systemEvents: [
      '23 Boise-area members allocate Shadow Marks to the campaign',
      '8 members pledge Credits toward pre-orders',
      '3 members use Cue Cards to invite new members',
      'Demand signal crystallizes after 3 consecutive days',
      'Steward Pledge: 384 Marks — 100% funded',
      'Member Pre-Orders: 47 Credits — 12% of production cost',
      '156 Shadow Marks from 23 members',
    ],
    sarahSees: [
      'Status: FUNDED — Ready for production trigger',
      'Steward Pledge: 384 Marks (100%)',
      'Member Pre-Orders: 47 Credits',
      'Shadow Mark Signals: 156 SM from 23 members',
    ],
    ledger: {
      joules: 100,
      backedMarks: 16,
      creditsEarned: 0,
      xp: 0,
      escrowedMarks: 384,
      fiatInCooperative: 547,
      membersInvolved: 24,
      stewardTier: 'Apprentice',
    },
    highlight: '23 members signaled demand. The community decided what gets built.',
  },
  {
    number: 5,
    title: 'Production Triggers',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'text-sky-400',
    narrative: 'All conditions met: Steward pledge (100%), minimum demand (23 members), STAMP verification approved, pre-order threshold met. Moneypenny generates a production report. The Founder approves the wire with one click: $320 to the printer.',
    systemEvents: [
      'Moneypenny generates production report for Founder\'s briefing',
      'Founder approves wire transfer with one click',
      '$320 moves from Mercury → printer\'s account',
      '$64 margin (the 20%) held for distribution',
      'Production begins — 1,000 cards ordered',
    ],
    sarahSees: [
      'Status: IN PRODUCTION',
      'Wire Transfer: $320 approved and sent',
      'Margin held: $64 for distribution',
      'Estimated delivery: 5-7 business days',
    ],
    ledger: {
      joules: 100,
      backedMarks: 16,
      creditsEarned: 0,
      xp: 0,
      escrowedMarks: 384,
      fiatInCooperative: 227,
      membersInvolved: 24,
      stewardTier: 'Apprentice',
    },
    highlight: 'One wire transfer. One approval. No intermediary took a cut.',
  },
  {
    number: 6,
    title: 'Cards Ship, Everyone Gets Paid',
    icon: <Truck className="w-6 h-6" />,
    color: 'text-rose-400',
    narrative: '1,000 cards ship to Sarah. She distributes to the 23 members who signaled demand. The 20% margin ($64) distributes: $12.80 to platform operations, $51.20 to Sarah as Steward compensation (Credits, not cash). Plus XP, SAA increase, and Brand Mark on every card.',
    systemEvents: [
      'Printer ships 1,000 cards to Sarah\'s distribution address',
      'Sarah distributes to 23 demand-signaling members + extras',
      'Platform operational share: $12.80 (20% of margin)',
      'Sarah\'s Steward compensation: $51.20 Credits (80% of margin)',
      'Steward XP: 384 × 4.2 / 5.0 = 322.56 XP awarded',
      'Service Allocation Authority increases',
      'Brand Mark appears on every card: "Distributed by Sarah Chen, Boise Node"',
      'Marcus (referrer) earns Cue Card rewards',
      'Escrowed Marks released back to Sarah',
    ],
    sarahSees: [
      'Steward Tier: Apprentice (1/3 toward Journeyman)',
      'Campaigns Stewarded: 1',
      'XP: 322.56',
      'Joules: 100 | Backed Marks: 400 (384 returned) | Credits: 51.20 (earned)',
    ],
    ledger: {
      joules: 100,
      backedMarks: 400,
      creditsEarned: 51.20,
      xp: 322.56,
      escrowedMarks: 0,
      fiatInCooperative: 227,
      membersInvolved: 24,
      stewardTier: 'Apprentice (1/3)',
    },
    highlight: 'Sarah gets paid. Members get cards. Marks return. The printer gets paid. Nobody skimmed.',
  },
  {
    number: 7,
    title: 'The Pizza Oven Effect',
    icon: <Flame className="w-6 h-6" />,
    color: 'text-orange-400',
    narrative: 'Sarah heated the oven for one pizza. While it\'s hot, she launches Campaign 2: "Boise Welcome Packets — 500 units." Her SAA is higher, 19 of 23 members immediately signal demand, and 4 want to become Stewards themselves. By Campaign 5, the Boise Node is self-sustaining.',
    systemEvents: [
      'Campaign 2 launches while trust infrastructure is warm',
      'Higher SAA qualifies Sarah for larger Backed Marks allocation',
      '19 of 23 Campaign 1 members immediately signal demand',
      '4 members apply to become sub-Stewards',
      'Campaign funds in 3 days (vs. 10 days for Campaign 1)',
      'By Campaign 5: Journeyman Steward, 4 trained sub-Stewards',
      'Boise Node self-sustaining — Founder hasn\'t touched since Campaign 1',
      'Moneypenny reports: 5 campaigns, 4,200 items, 89 members, zero complaints',
    ],
    sarahSees: [
      'Steward Tier: Journeyman',
      'Sub-Stewards trained: 4',
      'Campaigns Stewarded: 5',
      'Node Status: Self-sustaining',
      'Active Members: 89',
    ],
    ledger: {
      joules: 100,
      backedMarks: 400,
      creditsEarned: 256,
      xp: 1612,
      escrowedMarks: 0,
      fiatInCooperative: 227,
      membersInvolved: 89,
      stewardTier: 'Journeyman',
    },
    highlight: 'One pizza heated the oven. Five pizzas came out. That\'s the cooperative advantage.',
  },
];

function LedgerSidebar({ ledger, step }: { ledger: LedgerState; step: number }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Running Ledger — Step {step}/7
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-1 text-xs text-blue-300 mb-1">
            <CurrencyGlyph currency="joule" size={12} /> Joules
          </div>
          <div className="text-lg font-bold text-blue-400">{ledger.joules}</div>
        </div>
        <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-1 text-xs text-red-300 mb-1">
            <CurrencyGlyph currency="mark" size={12} /> Backed Marks
          </div>
          <div className="text-lg font-bold text-red-400">{ledger.backedMarks}</div>
        </div>
        <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-1 text-xs text-amber-300 mb-1">
            <CurrencyGlyph currency="credit" size={12} /> Credits Earned
          </div>
          <div className="text-lg font-bold text-amber-400">{ledger.creditsEarned.toFixed(2)}</div>
        </div>
        <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-1 text-xs text-purple-300 mb-1">
            <Award className="w-3 h-3" /> XP
          </div>
          <div className="text-lg font-bold text-purple-400">{ledger.xp.toFixed(2)}</div>
        </div>
      </div>

      {ledger.escrowedMarks > 0 && (
        <div className="p-2 rounded bg-slate-700/50 border border-slate-600">
          <div className="text-xs text-slate-400">Escrowed Marks</div>
          <div className="text-sm font-bold text-slate-300">{ledger.escrowedMarks} <span className="text-xs font-normal text-slate-500">(locked in campaign)</span></div>
        </div>
      )}

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Fiat in Cooperative</span>
          <span className="text-emerald-400 font-medium">${ledger.fiatInCooperative}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Members Involved</span>
          <span className="text-white font-medium">{ledger.membersInvolved}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Steward Tier</span>
          <span className="text-white font-medium">{ledger.stewardTier}</span>
        </div>
      </div>
    </div>
  );
}

export default function BoiseBusinessCardsExample() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Platform
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">The Boise Business Cards</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            How the cooperative economy actually works — a complete walkthrough from purchase to profit,
            following Sarah Chen as she builds the Boise Node.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all ${
                i === currentStep
                  ? 'bg-white/10 text-white border border-white/20'
                  : i < currentStep
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800/50 text-slate-500 border border-slate-700'
              }`}
            >
              {i < currentStep ? <CheckCircle2 className="w-3 h-3" /> : null}
              {i + 1}
            </button>
          ))}
        </div>

        {/* Main Content: Step + Ledger */}
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Step Content */}
          <div>
            <Card className="bg-slate-800/30 border-slate-700 mb-6">
              <CardContent className="py-6 px-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-lg bg-slate-700/50 ${step.color}`}>
                    {step.icon}
                  </div>
                  <div>
                    <Badge variant="outline" className="text-slate-500 border-slate-600 text-[10px] mb-1">
                      Step {step.number} of 7
                    </Badge>
                    <h2 className="text-xl font-bold">{step.title}</h2>
                  </div>
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">{step.narrative}</p>

                {/* System Events */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    What happens in the system
                  </h3>
                  <div className="space-y-2">
                    {step.systemEvents.map((event, i) => (
                      <div key={i} className="flex gap-2 text-sm text-slate-300">
                        <span className="text-emerald-400 mt-0.5 shrink-0">→</span>
                        <span>{event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sarah Sees */}
                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> What Sarah sees
                  </h3>
                  <div className="font-mono text-xs space-y-1 text-slate-300">
                    {step.sarahSees.map((line, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-slate-600">{'>'}</span> {line}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlight */}
                <div className="mt-6 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-sm text-amber-300 font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 shrink-0" />
                    {step.highlight}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                className="border-slate-700 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-xs text-slate-500">
                {currentStep + 1} / {STEPS.length}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                disabled={currentStep === STEPS.length - 1}
                className="border-slate-700 text-slate-300"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Comparison Table (shown on last step) */}
            {currentStep === STEPS.length - 1 && (
              <Card className="mt-8 bg-slate-800/30 border-slate-700">
                <CardContent className="py-6 px-6">
                  <h3 className="text-lg font-bold mb-4">What Makes This Different</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-2 text-slate-400 font-medium">Traditional</th>
                          <th className="text-left py-2 text-emerald-400 font-medium">Liana Banyan</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        <tr className="border-b border-slate-800">
                          <td className="py-2 pr-4">Sarah orders from Vistaprint, pays full price, gets cards for herself</td>
                          <td className="py-2">Sarah stewards a campaign, funds it with Backed Marks, gets cards for 23 people</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="py-2 pr-4">No one else benefits</td>
                          <td className="py-2">Marcus earns Cue Card rewards. 23 members get cards. Sarah earns XP + SAA.</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="py-2 pr-4">Money leaves the community</td>
                          <td className="py-2">Money stays in the cooperative. Printer gets paid. Everyone else trades in platform currency.</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="py-2 pr-4">Sarah is a customer</td>
                          <td className="py-2">Sarah is a Node Captain building infrastructure</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4">If Sarah stops, nothing changes</td>
                          <td className="py-2">If Sarah stops, 4 trained sub-Stewards continue</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Ledger Sidebar */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card className="bg-slate-800/30 border-slate-700">
              <CardContent className="py-4 px-4">
                <LedgerSidebar ledger={step.ledger} step={step.number} />
              </CardContent>
            </Card>

            {/* Ledger Trail Preview */}
            {currentStep >= 5 && (
              <Card className="mt-4 bg-slate-800/30 border-slate-700">
                <CardContent className="py-3 px-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Immutable Ledger Trail
                  </div>
                  <div className="space-y-1.5 text-[10px] text-slate-400">
                    <div className="flex justify-between"><span>Day 1: Joule Purchase</span><span className="text-blue-400">500 J</span></div>
                    <div className="flex justify-between"><span>Day 1: Mark Creation</span><span className="text-red-400">400 Mk</span></div>
                    <div className="flex justify-between"><span>Day 2: Steward Escrow</span><span className="text-amber-400">384 Mk</span></div>
                    <div className="flex justify-between"><span>Day 3-12: SM Signals</span><span className="text-purple-400">156 SM</span></div>
                    <div className="flex justify-between"><span>Day 12: Production Wire</span><span className="text-emerald-400">$320</span></div>
                    <div className="flex justify-between"><span>Day 16: Margin Split</span><span className="text-amber-400">$64</span></div>
                    <div className="flex justify-between"><span>Day 16: XP Award</span><span className="text-purple-400">322 XP</span></div>
                    <div className="flex justify-between"><span>Day 16: Pledge Release</span><span className="text-emerald-400">384 Mk</span></div>
                  </div>
                  <p className="text-[9px] text-slate-600 mt-2">
                    Money moved ONCE (bank → Mercury → printer). Everything else is ledger entries inside the cooperative.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* SEC Disclosure */}
        <p className="text-center text-[10px] text-slate-600 mt-12 max-w-lg mx-auto">
          This example uses fictional names and a Boise, Idaho setting for illustration.
          Joules, Marks, and Credits are cooperative-internal currencies, not securities.
          No financial return is promised or implied. "Help Each Other, Help Ourselves."
        </p>
      </div>
    </div>
  );
}
