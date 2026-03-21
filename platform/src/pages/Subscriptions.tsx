import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Building2, Users, ShoppingBag, Repeat, Calculator, ChevronDown, ChevronUp, Sparkles, TrendingUp, Shield, Zap, Dog } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Slider } from '@/components/ui/slider';

const TIERS = [
  {
    name: 'Taste',
    frequency: '3× / week',
    discount: '10%',
    minCategories: 3,
    color: 'from-emerald-600 to-emerald-800',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Dip your toes in. Three visits per week, rotating across at least 3 different businesses.',
  },
  {
    name: 'Regular',
    frequency: '5× / week',
    discount: '15%',
    minCategories: 4,
    color: 'from-amber-600 to-amber-800',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Your weekday staple. Five visits, deeper discounts, broader variety.',
  },
  {
    name: 'All-In',
    frequency: '7× / week',
    discount: '20%',
    minCategories: 5,
    color: 'from-violet-600 to-violet-800',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    description: 'Maximum savings. Every day of the week, the deepest discount, the widest selection.',
  },
];

const MEMBER_BENEFITS = [
  { icon: TrendingUp, text: 'Save 10-20% on every order — automatically' },
  { icon: ShoppingBag, text: 'One subscription, many businesses — your choice each week' },
  { icon: Repeat, text: 'Skip, swap, or modify any week — no penalty' },
  { icon: Shield, text: 'LB Card auto-billing — no chasing receipts' },
  { icon: Users, text: 'Support local businesses while saving money' },
  { icon: Sparkles, text: 'Blind Box option: let the coalition surprise you' },
];

const BUSINESS_BENEFITS = [
  { icon: TrendingUp, text: 'Guaranteed weekly demand — your subscribers already committed' },
  { icon: Shield, text: 'Reduced waste — prepare for confirmed orders, not guesses' },
  { icon: Users, text: 'Cross-promotion — subscribers discover you through the coalition' },
  { icon: Zap, text: 'Turn-key setup — one toggle, LB handles billing and scheduling' },
  { icon: Repeat, text: 'Data you can act on — weekly patterns, preferences, growth trends' },
];

function TierCalculator() {
  const [meals, setMeals] = useState(5);
  const [avgPrice, setAvgPrice] = useState(15);

  const walkInMonthly = meals * avgPrice * 4.33;
  const tier = meals <= 3 ? TIERS[0] : meals <= 5 ? TIERS[1] : TIERS[2];
  const discountPct = meals <= 3 ? 10 : meals <= 5 ? 15 : 20;
  const subMonthly = walkInMonthly * (1 - discountPct / 100);
  const savings = walkInMonthly - subMonthly;

  return (
    <Card className="bg-slate-800/60 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-amber-400" />
          Subscription Savings Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Meals / services per week: <span className="text-white font-semibold">{meals}</span></label>
          <Slider value={[meals]} onValueChange={(v) => setMeals(v[0])} min={1} max={10} step={1} className="mt-2" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-2 block">Average price per visit: <span className="text-white font-semibold">${avgPrice}</span></label>
          <Slider value={[avgPrice]} onValueChange={(v) => setAvgPrice(v[0])} min={5} max={50} step={1} className="mt-2" />
        </div>
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Walk-in / mo</p>
            <p className="text-xl font-bold text-slate-300">${walkInMonthly.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Subscription / mo</p>
            <p className="text-xl font-bold text-amber-400">${subMonthly.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">You save / mo</p>
            <p className="text-xl font-bold text-emerald-400">${savings.toFixed(0)}</p>
          </div>
        </div>
        <p className="text-center text-sm text-slate-400">
          You'd be on the <Badge className={tier.badge}>{tier.name}</Badge> tier at <strong className="text-white">{discountPct}% off</strong> everything.
        </p>
      </CardContent>
    </Card>
  );
}

function BuffetProblem() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="bg-gradient-to-br from-red-900/30 to-slate-900 border-red-800/40">
      <CardContent className="pt-6">
        <button onClick={() => setExpanded(!expanded)} className="w-full text-left flex items-center justify-between">
          <h3 className="text-lg font-semibold text-red-300">The All-Day Buffet Problem</h3>
          {expanded ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
        </button>
        {expanded && (
          <div className="mt-4 space-y-3 text-slate-300 text-sm">
            <p>Every food business faces the same impossible calculus:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong className="text-red-300">Prepare for too many</strong> → food waste, thrown-out labor, lost margin</li>
              <li><strong className="text-red-300">Prepare for too few</strong> → missed revenue, bad customer experience, empty shelves</li>
            </ul>
            <p>Subscriptions eliminate the guessing game. Your customers already committed. You know on Monday how many meals Tuesday needs.</p>
            <p className="text-amber-300 font-medium pt-2">Result: less waste, happier customers, predictable revenue.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Subscriptions() {
  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="subscriptions-page">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6" data-xray-id="sub-back">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Hero */}
      <div className="text-center mb-12">
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">Innovation #1826</Badge>
        <h1 className="text-4xl font-bold mb-3" data-xray-id="sub-title">Subscriptions</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          One subscription. Many businesses. Your choice every week. Savings that grow with your commitment.
        </p>
      </div>

      {/* ─── FOR MEMBERS ─── */}
      <section className="mb-16" data-xray-id="sub-members-section">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-7 h-7 text-amber-400" />
          <h2 className="text-2xl font-bold">For Members</h2>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Why Subscribe?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MEMBER_BENEFITS.map((b, i) => (
              <Card key={i} className="bg-slate-800/40 border-slate-700">
                <CardContent className="pt-5 flex gap-3">
                  <b.icon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{b.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tier comparison */}
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Choose Your Tier</h3>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {TIERS.map((tier) => (
            <Card key={tier.name} className={`bg-gradient-to-br ${tier.color} border-0 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/30" />
              <CardHeader className="relative z-10 pb-2">
                <Badge className={tier.badge + ' self-start'}>{tier.name}</Badge>
                <p className="text-3xl font-bold mt-2">{tier.frequency}</p>
                <p className="text-xl font-semibold text-white/90">{tier.discount} off</p>
              </CardHeader>
              <CardContent className="relative z-10 pt-0">
                <p className="text-sm text-white/70 mb-4">{tier.description}</p>
                <ul className="text-xs text-white/60 space-y-1">
                  <li className="flex items-center gap-1"><Check className="w-3 h-3" /> Min {tier.minCategories} business categories</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3" /> Skip / swap any week</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3" /> LB Card auto-billing</li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">1</span>
                <span><strong className="text-white">Pick your cuisines or services</strong> — restaurants, groceries, pet care, repairs — whatever your coalition offers.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">2</span>
                <span><strong className="text-white">Commit to a tier</strong> — Taste, Regular, or All-In. Higher commitment = deeper discount.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">3</span>
                <span><strong className="text-white">LB Card auto-bills monthly</strong> — your credits or marks cover it. No chasing receipts.</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">4</span>
                <span><strong className="text-white">Choose weekly</strong> — each week, pick which businesses to visit. Skip a day? No problem. Swap a cuisine? Go for it.</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Calculator */}
        <TierCalculator />
      </section>

      {/* ─── FOR BUSINESSES ─── */}
      <section className="mb-16" data-xray-id="sub-business-section">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-7 h-7 text-emerald-400" />
          <h2 className="text-2xl font-bold">For Businesses</h2>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Why Offer Subscriptions?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUSINESS_BENEFITS.map((b, i) => (
              <Card key={i} className="bg-slate-800/40 border-slate-700">
                <CardContent className="pt-5 flex gap-3">
                  <b.icon className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{b.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <BuffetProblem />

        <Card className="bg-slate-800/50 border-slate-700 mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-3">Turn-Key Setup</h3>
            <p className="text-sm text-slate-300 mb-4">
              One toggle in your storefront dashboard. That's it. Liana Banyan handles billing, scheduling, skip/modify requests, and analytics. You focus on what you do best.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">Auto-billing</Badge>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">Skip management</Badge>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">Weekly reports</Badge>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-300">Cross-promotion</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── COALITIONS ─── */}
      <section className="mb-16" data-xray-id="sub-coalition-section">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-7 h-7 text-violet-400" />
          <h2 className="text-2xl font-bold">Coalitions</h2>
        </div>

        <Card className="bg-gradient-to-br from-violet-900/30 to-slate-900 border-violet-800/40 mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-violet-200 mb-3">What is a Coalition?</h3>
            <p className="text-sm text-slate-300 mb-4">
              A coalition is a voluntary alliance of <strong className="text-white">10+ local businesses</strong> that share a subscriber pool. Members subscribe once and can choose from any coalition business each week. Think of it as a neighborhood loyalty card that works everywhere.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-violet-300">10+</p>
                <p className="text-xs text-slate-500">Businesses minimum</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-300">200+</p>
                <p className="text-xs text-slate-500">Subscribers to activate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-300">∞</p>
                <p className="text-xs text-slate-500">Categories welcome</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base">How to Form a Coalition</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-2">
              <p>Coalitions form through <strong className="text-white">BandWagon</strong> — Liana Banyan's demand-aggregation system.</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Businesses register interest on BandWagon</li>
                <li>Once 10 businesses in an area sign up, the coalition forms</li>
                <li>Members subscribe and hit the 200 threshold</li>
                <li>Coalition activates — subscriptions go live</li>
              </ol>
              <Link to="/bandwagon" className="inline-block mt-2 text-amber-400 hover:text-amber-300 text-sm font-medium">
                → Visit BandWagon
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-base">Active Coalitions Near You</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-slate-500 text-sm">No active coalitions in your area yet.</p>
              <p className="text-slate-600 text-xs mt-1">Be the first to start one!</p>
              <Button variant="outline" size="sm" className="mt-4 border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
                Browse Forming Coalitions
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── CHEWY COMPARISON ─── */}
      <section className="mb-12" data-xray-id="sub-chewy-callout">
        <Card className="bg-gradient-to-r from-amber-900/30 via-slate-900 to-amber-900/30 border-amber-700/40">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-6">
            <Dog className="w-12 h-12 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-200 mb-1">Think Chewy's Autoship — for Everything Local</h3>
              <p className="text-sm text-slate-300">
                Predictable. Flexible. Cheaper than walk-in pricing. Except instead of one company shipping you dog food, it's ten local businesses delivering meals, groceries, repairs, and services — all coordinated through one subscription you control.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <div className="text-center pb-8">
        <p className="text-slate-500 text-sm mb-4">Subscriptions launch when your local coalition reaches critical mass.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/bandwagon">
            <Button className="bg-amber-600 hover:bg-amber-700">Start or Join a Coalition</Button>
          </Link>
          <Link to="/main-square">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">Browse Main Square</Button>
          </Link>
        </div>
      </div>
    </PortalPageLayout>
  );
}
