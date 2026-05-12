import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { FlipSection } from '@/components/FlipSection';
import {
  Ban, TrendingUp, Shield, Users,
  Crown, Lightbulb, DollarSign, Check, X,
  Sprout, TreePine, Mountain, ArrowLeft, ArrowRight,
  Mail, Briefcase, Vote, UtensilsCrossed, ShoppingCart,
  Music, Home, BookOpen, Globe, Heart, Scale,
  Megaphone, Flame, Landmark
} from 'lucide-react';

const GROWTH_STAGES = [
  {
    id: 'seed',
    name: 'Seed',
    subtitle: 'First 10',
    icon: Sprout,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/20',
    detail: {
      title: 'The Founders',
      description: 'The first 10 people who build the platform itself. They write the code, test every feature, set every standard. Highest risk — no users, no revenue, no guarantee. Just conviction.',
      highlights: [
        'Build the cooperative infrastructure from scratch',
        'Test and validate every economic mechanism',
        'Establish the DNA Lock — constitutional parameters no one can change',
      ],
      action: { label: 'Meet the Team', route: '/crew' },
    },
  },
  {
    id: 'sapling',
    name: 'Sapling',
    subtitle: 'The 300',
    icon: TreePine,
    iconColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/20',
    detail: {
      title: 'The First Wave',
      description: '300 members who validate the model. They stress-test the economics, prove cooperative commerce works, and fund the first real operations. Their $5/month creates the runway.',
      highlights: [
        '30 Pledged — initiative leaders and blessing givers',
        '57 Committed — industry partners and amplifiers',
        '213 Covenant — operations, supply chain, tech, legal, community',
      ],
      action: { label: 'Join The 300', route: '/the-300' },
    },
  },
  {
    id: 'tree',
    name: 'Tree',
    subtitle: '3,000',
    icon: TreePine,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    detail: {
      title: 'Self-Sustaining',
      description: 'At 3,000 members, every initiative can run. Production levels activate, the multiplier system kicks in, and the platform becomes self-sustaining. No external capital needed — members fund members.',
      highlights: [
        'All 16 charitable initiatives fully operational',
        'Production level economics active across all services',
        'C+20 pricing creates real savings for every member',
      ],
      action: { label: 'See Initiatives', route: '/mission-one' },
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    subtitle: '30,000+',
    icon: Mountain,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
    detail: {
      title: 'The Ecosystem',
      description: 'At 30,000+ members, the cooperative generates enough surplus to fund new initiatives, expand internationally, and create real economic alternatives — all without a single dollar of outside capital.',
      highlights: [
        'Surplus funds new initiatives without fundraising',
        'International expansion begins (Lagos, not just Louisville)',
        'WE is US — the members own 100% of this, forever',
      ],
      action: { label: 'Watch Us Build', route: '/fly-on-the-wall' },
    },
  },
];

const EXECUTIVE_CROWNS = [
  { name: 'Michael Seibel', role: 'CEO', org: 'Y Combinator', status: 'Crown Offered' },
  { name: 'Tom Simon', role: 'CFO', org: 'FBI Forensic Accountant (26 yr)', status: 'Crown Offered' },
  { name: 'MacKenzie Scott', role: 'Board Chair', org: 'Philanthropist', status: 'Crown Offered' },
  { name: 'Craig Newmark', role: 'Infrastructure Chancellor', org: 'Craigslist Founder', status: 'Crown Offered' },
  { name: 'Seeking', role: 'CTO', org: 'Chief Technology Officer', status: 'Crown Available' },
  { name: 'Seeking', role: 'CMO', org: 'Chief Marketing Officer', status: 'Crown Available' },
];

const INITIATIVE_CROWNS = [
  { initiative: 'Let\'s Make Dinner', crown: 'Maneet Chauhan', role: 'Grand Chef Mentor', icon: UtensilsCrossed },
  { initiative: 'Let\'s Go Shopping', crown: 'Mary Beth Laughton', role: 'Merchant Mentor', icon: ShoppingCart },
  { initiative: 'Let\'s Get Groceries', crown: 'Jos\u00e9 Andr\u00e9s', role: 'Provisioner Mentor', icon: ShoppingCart },
  { initiative: 'LifeLine Medications', crown: 'Alex Oshmyansky', role: 'Apothecary Mentor', icon: Heart },
  { initiative: 'MSA / VSL', crown: 'Cathie Mahon', role: 'Lender Mentor', icon: DollarSign },
  { initiative: 'Defense Klaus', crown: 'Ruth Glenn', role: 'First Shield Mentor', icon: Shield },
  { initiative: 'Rally Group', crown: 'Kimberly Williams', role: 'Responder General', icon: Flame },
  { initiative: 'Let\'s Make Bread', crown: 'Dale Dougherty', role: 'Industry Chancellor', icon: Briefcase },
  { initiative: 'JukeBox', crown: 'Taylor Swift', role: 'Maestro Mentor', icon: Music },
  { initiative: 'Home Logistics', crown: 'Robert Kaiser', role: 'Steward Mentor', icon: Home },
  { initiative: 'International', crown: 'Jessica Jackley', role: 'Commerce Secretary', icon: Globe },
  { initiative: 'Harper Guild', crown: 'Jos\u00e9 Andr\u00e9s', role: 'Harper Prime Mentor', icon: Scale },
  { initiative: 'Didasko Academy', crown: 'Sal Khan', role: 'Chancellor', icon: BookOpen },
];

const POLITICAL_EXPEDITION_CROWNS = [
  { name: 'Alexandria Ocasio-Cortez', role: 'Door-Opening Crown (Left)', type: 'Council Seat' },
  { name: 'Arnold Schwarzenegger', role: 'Door-Opening Crown (Right)', type: 'Council Seat' },
  { name: 'Keanu Reeves', role: 'Builder Crown (Culture)', type: 'Steering Committee' },
  { name: 'Sandra Bullock', role: 'Builder Crown (Action)', type: 'Steering Committee' },
];

export default function WhyNoVC() {
  const navigate = useNavigate();
  const [flippedStage, setFlippedStage] = useState<string | null>(null);

  const projections = [
    { year: 'Year 1', members: '300', revenue: '$45K', ownership: '100%', vcOwnership: '60%' },
    { year: 'Year 2', members: '3,000', revenue: '$450K', ownership: '100%', vcOwnership: '45%' },
    { year: 'Year 3', members: '30,000', revenue: '$4.5M', ownership: '100%', vcOwnership: '30%' },
    { year: 'Year 5', members: '300,000', revenue: '$45M', ownership: '100%', vcOwnership: '15%' },
    { year: 'Year 10', members: '3,000,000', revenue: '$450M', ownership: '100%', vcOwnership: '5%' },
  ];

  return (
    <PortalPageLayout backButton xrayId="why-no-vc-page">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/20 mb-4">
          <Ban className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Why No V.C.?</h1>
        <p className="text-xl text-muted-foreground">
          We're funded by patents and grit, not promises to investors.
        </p>
      </div>

      <Card className="mb-8 bg-destructive/5 border-destructive/30">
        <CardContent className="py-6">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
            V.C. Money Comes With Strings
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <X className="h-8 w-8 mx-auto text-destructive mb-2" />
              <h3 className="font-semibold text-destructive">Growth at All Costs</h3>
              <p className="text-sm text-muted-foreground mt-1">VCs demand 10x returns, forcing unsustainable growth</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <X className="h-8 w-8 mx-auto text-destructive mb-2" />
              <h3 className="font-semibold text-destructive">Exit Pressure</h3>
              <p className="text-sm text-muted-foreground mt-1">They need to sell you to the highest bidder in 5-7 years</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <X className="h-8 w-8 mx-auto text-destructive mb-2" />
              <h3 className="font-semibold text-destructive">Dilution</h3>
              <p className="text-sm text-muted-foreground mt-1">Each round takes more ownership from founders and members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-green-500/5 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Shield className="h-5 w-5" />
            Our Alternative: Patent-Backed Bootstrap with Community Funding Each Other
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <Crown className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-semibold text-foreground">Patent Portfolio</h3>
              <p className="text-sm text-muted-foreground">
                <strong className="text-primary">{{provisionalApps}} provisional applications</strong> with {{innovationCount}} documented innovations.
                This is our "runway."
              </p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
              <h3 className="font-semibold text-foreground">$1K to Start</h3>
              <p className="text-sm text-muted-foreground">
                We literally started with $1,000. No massive burn rate.
                No pressure to "grow or die."
              </p>
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">
              Our <strong className="text-primary">127 Crown Jewel patents</strong> out of {{innovationCount}} documented innovations
              have an independent valuation of <strong className="text-green-600 dark:text-green-400">$116 Million</strong> — but
              we only claim <strong className="text-primary">$630,000</strong>.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Because I'm good enough, I'm smart enough, and doggone it, people like me.
            </p>
            <p className="text-sm text-muted-foreground">
              Also, that's <strong className="text-foreground">Cost+20%</strong> — and we eat the food we serve.
              The point is that <strong className="text-green-600 dark:text-green-400">YOU</strong> get the value.
              Because 80% is given to and used for the Members of Liana Banyan.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Organic Growth Projections
          </CardTitle>
          <CardDescription>Our path vs. the VC treadmill</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground">Timeline</th>
                  <th className="text-right py-3 px-2 text-muted-foreground">Members</th>
                  <th className="text-right py-3 px-2 text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-2 text-green-600 dark:text-green-400">Our Ownership</th>
                  <th className="text-right py-3 px-2 text-destructive">If We'd Taken VC</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((row) => (
                  <tr key={row.year} className="border-b border-border">
                    <td className="py-3 px-2 text-foreground font-medium">{row.year}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{row.members}</td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{row.revenue}</td>
                    <td className="py-3 px-2 text-right text-green-600 dark:text-green-400 font-bold">{row.ownership}</td>
                    <td className="py-3 px-2 text-right text-destructive">{row.vcOwnership}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <p className="text-sm text-primary">
              <strong>The Math:</strong> At Year 10, if we're worth $500M with VC money, we'd own ~$25M.
              Growing organically, even at half that valuation ($250M), WE — the members — own <strong>all of it</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Organic Growth Path — Flip Cards */}
      <Card className="mb-8 bg-primary/5 border-primary/30">
        <CardHeader>
          <CardTitle className="text-primary">The Organic Growth Path</CardTitle>
          <CardDescription>Click any stage to see how it works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            {GROWTH_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isFlipped = flippedStage === stage.id;
              return (
                <FlipSection
                  key={stage.id}
                  isFlipped={isFlipped}
                  className="min-h-[280px]"
                  front={
                    <div
                      className="text-center p-4 rounded-xl border border-border/50 bg-card cursor-pointer hover:border-primary/50 transition-colors h-full flex flex-col items-center justify-center"
                      onClick={() => setFlippedStage(stage.id)}
                    >
                      <div className={`w-14 h-14 mx-auto rounded-full ${stage.bgColor} flex items-center justify-center mb-3`}>
                        <Icon className={`h-7 w-7 ${stage.iconColor}`} />
                      </div>
                      <p className="text-base font-semibold text-foreground">{stage.name}</p>
                      <p className="text-sm text-muted-foreground">{stage.subtitle}</p>
                      {idx < GROWTH_STAGES.length - 1 && (
                        <div className="mt-3">
                          <ArrowRight className="h-4 w-4 text-muted-foreground/50 mx-auto" />
                        </div>
                      )}
                      <p className="text-xs text-primary/60 mt-3">tap to learn more</p>
                    </div>
                  }
                  back={
                    <div className="p-4 rounded-xl border border-primary/30 bg-card h-full flex flex-col">
                      <h3 className="text-base font-bold text-primary mb-1">{stage.detail.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{stage.detail.description}</p>
                      <ul className="space-y-1.5 mb-4 flex-1">
                        {stage.detail.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <Check className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 mt-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => setFlippedStage(null)}
                        >
                          <ArrowLeft className="h-3 w-3 mr-1" /> Back
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs flex-1"
                          onClick={() => navigate(stage.detail.action.route)}
                        >
                          {stage.detail.action.label}
                        </Button>
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Each stage funds the next. No outside money needed.
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8 bg-purple-500/5 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Users className="h-5 w-5" />
            What This Means For YOU
          </CardTitle>
          <CardDescription>Why being an early adopter matters more without VC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">No Pivot Whiplash</p>
                <p className="text-sm text-muted-foreground">VC-backed startups constantly pivot to chase metrics. We're building for the long haul.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">You're the Asset, Not the Product</p>
                <p className="text-sm text-muted-foreground">VC-backed companies sell your data. We don't need to — we're not trying to hit arbitrary growth targets.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-500/10 rounded-lg">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Your Early Contribution Matters Forever</p>
                <p className="text-sm text-muted-foreground">Ghost Attribution (#1126) means your contributions are remembered even if you leave. Your early support = permanent credit.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-primary">The 300 Are Getting Joules</p>
                <p className="text-sm text-muted-foreground">
                  Our first 300 members earn participation Joules — platform service credits
                  backed by our patent portfolio. Joules provide locked-rate service access
                  and governance participation across the 16 patent pedestals.
                  No VC means no dilution of YOUR contribution.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Joules Tier System */}
      <Card className="mb-8 bg-emerald-500/5 border-emerald-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Lightbulb className="h-5 w-5" />
            How Joules Work: 6-Tier Bootstrap System
          </CardTitle>
          <CardDescription>
            Joules are non-transferable platform service credits that provide locked-rate
            service access and governance participation. Joules are issued whenever a member's
            prepaid rate exceeds the current service price — the differential becomes Joules
            automatically (the "forever stamp" mechanic). Marks can be backed by either Credits
            or Joules. The Bootstrap purchasing window (buy Joules alongside Credits at tiered
            multiplier rates) closes at 1,000,000 members — but organic Joule issuance continues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-muted-foreground">Tier</th>
                  <th className="text-left py-2 px-2 text-muted-foreground">Stage</th>
                  <th className="text-right py-2 px-2 text-muted-foreground">Members</th>
                  <th className="text-right py-2 px-2 text-emerald-600 dark:text-emerald-400">Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { tier: 1, stage: 'Seed', range: '1 – 10', mult: '5x', color: 'text-red-400' },
                  { tier: 2, stage: 'Sapling', range: '11 – 300', mult: '3x', color: 'text-orange-400' },
                  { tier: 3, stage: 'Tree', range: '301 – 3,000', mult: '2x', color: 'text-yellow-400' },
                  { tier: 4, stage: 'Forest', range: '3,001 – 10,000', mult: '1.5x', color: 'text-emerald-400' },
                  { tier: 5, stage: 'Grove', range: '10,001 – 100,000', mult: '1x', color: 'text-green-400' },
                  { tier: 6, stage: 'Canopy', range: '100,001 – 1,000,000', mult: '0.5x', color: 'text-blue-400' },
                ].map((t) => (
                  <tr key={t.tier} className="border-b border-border/50">
                    <td className="py-2 px-2 text-muted-foreground">{t.tier}</td>
                    <td className="py-2 px-2 font-medium text-foreground">{t.stage}</td>
                    <td className="py-2 px-2 text-right text-muted-foreground">{t.range}</td>
                    <td className={`py-2 px-2 text-right font-bold ${t.color}`}>{t.mult}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-foreground mb-1">Patent Portfolio Allocation</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Member Joules (pedestal governance)</span><span className="font-bold text-emerald-600 dark:text-emerald-400">60%</span></div>
                <div className="flex justify-between"><span>Founder retains</span><span className="font-bold">20%</span></div>
                <div className="flex justify-between"><span>Sponsors (patronage allocation)</span><span className="font-bold">10%</span></div>
                <div className="flex justify-between"><span>Patent licensing fund</span><span className="font-bold">10%</span></div>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-foreground mb-1">Pedestal Governance</p>
              <p className="text-xs text-muted-foreground">
                Members direct their Joules to vote on which of the 16 patent pedestals
                get prioritized — license, develop, or defend. Your Joules are both
                locked-rate service access and a governance voice over IP strategy.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs font-semibold text-foreground mb-1">Marks Backing</p>
              <p className="text-xs text-muted-foreground">
                Marks (the service-credit differential earned by creators) can be backed
                by either Credits or Joules. Backing with Joules gives your Marks offers
                stronger collateral in TradeMatch, letting you make bigger or more offers
                for work, services, and contracts.
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs font-semibold text-foreground mb-1">After the Bootstrap</p>
              <p className="text-xs text-muted-foreground">
                At 1,000,000 members, the Bootstrap purchasing window closes — no more buying
                Joules alongside Credits. But Joules continue to be issued organically whenever
                a prepaid rate exceeds the current price. The forever-stamp mechanic is permanent.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Not securities.</strong> Joules fail all four Howey Test prongs —
              earned through participation (not purchased), individually tracked (not pooled),
              provide service access (not profit expectation), and require active use (not passive income).
              Non-transferable, non-redeemable, closed-loop. Like forever stamps backed by patents.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How You Actually Earn */}
      <Card className="mb-8 bg-green-500/5 border-green-500/30">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="text-lg font-bold text-foreground">How You Actually Make Money</h3>
              <p className="text-sm text-muted-foreground">We help you help yourself — for real.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            The Brewster Bonus rewards members who actively participate. Back Marks, deploy them
            into projects, and when you clear your Mark Pouch, you earn a tiered bonus in Credits.
            It works like Costco rebates — funded by real bulk-purchasing savings, not new member fees.
          </p>
          <Button
            variant="outline"
            className="text-green-600 dark:text-green-400 border-green-500/30"
            onClick={() => navigate('/learn/brewster-bonus')}
          >
            See How It Works
          </Button>
        </CardContent>
      </Card>

      {/* Crown Letters & Leadership */}
      <Card className="mb-8 bg-amber-500/5 border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Crown className="h-5 w-5" />
            Crown Letters: Who We're Asking to Lead
          </CardTitle>
          <CardDescription>
            Every position has a Crown Letter — a personal invitation to lead an initiative.
            One Crown, one offer. No committees. Real people, real accountability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Executive Positions */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-amber-500" />
              Liana Banyan Leadership
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {EXECUTIVE_CROWNS.map((exec) => (
                <div key={exec.role} className="p-3 bg-amber-500/10 rounded-lg text-center">
                  <Crown className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-sm font-semibold text-foreground">{exec.name}</p>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{exec.role}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{exec.org}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Political Expedition */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-blue-500" />
              Political Expedition — 4 Crown Letters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {POLITICAL_EXPEDITION_CROWNS.map((pe) => (
                <div key={pe.name} className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <Vote className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                  <p className="text-sm font-semibold text-foreground">{pe.name}</p>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{pe.role}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pe.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Initiative Crowns */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-500" />
              Initiative Crown Candidates — {INITIATIVE_CROWNS.length} Letters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {INITIATIVE_CROWNS.map((ic) => {
                const IcIcon = ic.icon;
                return (
                  <div key={ic.initiative} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <IcIcon className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ic.initiative}</p>
                      <p className="text-xs text-muted-foreground">{ic.crown} — {ic.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong className="text-foreground">{4 + POLITICAL_EXPEDITION_CROWNS.length + INITIATIVE_CROWNS.length} Crown Letters</strong> written
              {' '}— requesting leaders for every initiative plus executive positions.
              Plus letters to backers, media, academics, and blessing givers.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <p className="text-muted-foreground">We're betting on ourselves. And we're betting on you.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/the-300')}>Join The 300</Button>
          <Button variant="outline" onClick={() => navigate('/fly-on-the-wall')}>Watch Us Build</Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}
