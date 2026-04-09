import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Map as MapIcon, Star, DollarSign, Clock, Rocket, ChevronRight, Utensils, Coffee, Truck, Users, ShoppingBag, Wrench, Paintbrush, Coins, Sprout, RotateCcw, ChevronDown, ChevronUp, Scroll, QrCode, Eye, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { BeaconDropButton } from '@/components/BeaconDropButton';
import { LocalDirectory } from '@/components/LocalDirectory';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORY_MAP: Record<string, string> = {
  'breakfast-runner': 'breakfast',
  'lunch-runner': 'lunch',
  'taco-truck': 'food_truck',
  'catering': 'catering',
  'grocery': 'grocery',
  'service': 'service',
  'designer': 'design',
  'seeder-presenter': 'seeder',
};

function useDemandSignals() {
  const [signals, setSignals] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('earmarked_credits' as any)
          .select('category, amount')
          .gt('amount', 0) as { data: { category: string; amount: number }[] | null; error: any };

        if (error || !data) return;
        const map = new Map<string, number>();
        for (const row of data) {
          map.set(row.category, (map.get(row.category) || 0) + row.amount);
        }
        setSignals(map);
      } catch {
        // Table doesn't exist yet — that's fine, show nothing
      }
    })();
  }, []);

  return signals;
}

interface TreasureMapCard {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Coffee;
  iconColor: string;
  borderColor: string;
  bgGradient: string;
  startupCost: string;
  monthlyEstimate: string;
  timeToFirst: string;
  levels: { name: string; description: string }[];
  innovations: string;
  description: string;
  // Card back
  whoThisIsFor: string;
  whatYouNeed: string[];
  monthlyPotential: string;
  miniBusinessPlan: string[];
  pitchPreview: {
    businessType: string;
    tagline: string;
    sampleMetric: string;
    sampleRevenue: string;
  };
}

const TREASURE_MAPS: TreasureMapCard[] = [
  {
    id: 'breakfast-runner',
    title: 'Breakfast Runner',
    subtitle: 'The Donut Run',
    icon: Coffee,
    iconColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgGradient: 'from-amber-950/40 to-slate-900/60',
    startupCost: '$0',
    monthlyEstimate: '$1,200–$2,400',
    timeToFirst: '1 week',
    innovations: '#1829–#1835',
    description: 'Photograph a donut shop menu, build their storefront page, deliver to one office building. The simplest path to your first dollar.',
    levels: [
      { name: 'Level 1: First Route', description: '1 shop, 1 office building, 5+ orders/day' },
      { name: 'Level 2: Morning Circuit', description: '3 shops, 3 delivery points, subscription pitch' },
      { name: 'Level 3: Breakfast Captain', description: '5+ shops, Multiplier helpers, Coalition forming' },
      { name: 'Level 4: Node Builder', description: '10+ shops, full network, allocation authority from all' },
    ],
    whoThisIsFor: 'Early risers, parents after school drop-off, anyone with free mornings. If you can be out the door by 6:30 AM, this map pays before lunch.',
    whatYouNeed: ['Car or bike + insulated bag', 'Smartphone with data', '2–3 hours before 9 AM', 'Reliable alarm clock'],
    monthlyPotential: '$500–$1,500',
    miniBusinessPlan: [
      'Start with 1 bakery → 5 stops → $8–12 per delivery',
      '5 deliveries × 5 days = $200–300/week',
      'Add 2nd bakery → double routes → $400–600/week',
      'Scale to 3 shops → add subscription tiers → recurring revenue',
    ],
    pitchPreview: {
      businessType: 'Bakery Cue Card',
      tagline: 'Fresh pastries delivered before your customers arrive',
      sampleMetric: '12 pre-orders waiting this week',
      sampleRevenue: 'Est. $480/week new revenue',
    },
  },
  {
    id: 'lunch-runner',
    title: 'Lunch Runner',
    subtitle: 'The Office Feed',
    icon: Utensils,
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgGradient: 'from-emerald-950/40 to-slate-900/60',
    startupCost: '$0',
    monthlyEstimate: '$2,000–$4,000',
    timeToFirst: '1 week',
    innovations: '#1836–#1838',
    description: 'Partner with lunch restaurants. Office workers pre-order by 10 AM, you deliver at noon. Higher ticket, higher volume.',
    levels: [
      { name: 'Level 1: Lunch Pilot', description: '1 restaurant, 10+ pre-orders/day' },
      { name: 'Level 2: Multi-Restaurant', description: '3 restaurants, subscription tiers active' },
      { name: 'Level 3: Catering Bridge', description: 'Add catering service, corporate accounts' },
      { name: 'Level 4: District Feed', description: 'Full lunch district with subscription network' },
    ],
    whoThisIsFor: 'Midday availability, students between classes, remote workers wanting structure. 3 hours around noon is all it takes.',
    whatYouNeed: ['Car + insulated bag', 'Smartphone', '3 hours around noon', 'Knowledge of local offices'],
    monthlyPotential: '$800–$2,000',
    miniBusinessPlan: [
      '1 restaurant → 10 office pre-orders → $10–15 per delivery',
      'Cutoff 10 AM, deliver by noon → tight, efficient loop',
      'Scale to 3 restaurants → subscription tiers → $500+/week',
      'Add catering bridge for corporate accounts → $100+ per order',
    ],
    pitchPreview: {
      businessType: 'Restaurant Cue Card',
      tagline: '10 pre-orders by 10 AM, delivered by noon',
      sampleMetric: '18 office orders waiting this week',
      sampleRevenue: 'Est. $720/week new revenue',
    },
  },
  {
    id: 'taco-truck',
    title: 'Taco Truck Circuit',
    subtitle: 'Skip-the-Line',
    icon: Truck,
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    bgGradient: 'from-orange-950/40 to-slate-900/60',
    startupCost: '$0',
    monthlyEstimate: '$1,500–$3,000',
    timeToFirst: '3 days',
    innovations: '#1839–#1841',
    description: 'Mobile vendors need pre-orders to reduce waste. You give them guaranteed demand. Customers skip the line.',
    levels: [
      { name: 'Level 1: First Truck', description: '1 truck, "Skip the Line" QR cards distributed' },
      { name: 'Level 2: Route Circuit', description: '3 trucks, daily route optimization' },
      { name: 'Level 3: Event Runner', description: 'Food trucks at events, advance ordering' },
      { name: 'Level 4: Fleet Manager', description: 'Coordinate 10+ mobile vendors across city' },
    ],
    whoThisIsFor: 'Foodies who know the truck schedule, neighborhood connectors. If you already chase the best trucks, get paid for it.',
    whatYouNeed: ['Car', 'Smartphone', 'Knowledge of local food truck spots', 'Social media presence helps'],
    monthlyPotential: '$600–$1,500',
    miniBusinessPlan: [
      'Map 3 trucks → pre-order skip-the-line service',
      '15% of order value per pre-order → $2–4 per order',
      'Scale routes → 20+ orders/day across trucks',
      'Add event ordering → bulk pre-orders at festivals',
    ],
    pitchPreview: {
      businessType: 'Truck Cue Card',
      tagline: 'Pre-orders = no wait, your food reaches desks hot',
      sampleMetric: '8 skip-the-line orders daily',
      sampleRevenue: 'Est. $320/week guaranteed demand',
    },
  },
  {
    id: 'catering',
    title: 'Catering Coordinator',
    subtitle: 'Big Orders, Big Margins',
    icon: Users,
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgGradient: 'from-purple-950/40 to-slate-900/60',
    startupCost: '$0',
    monthlyEstimate: '$3,000–$6,000',
    timeToFirst: '2 weeks',
    innovations: '#1842–#1844',
    description: 'Connect restaurants with corporate offices, churches, events. One order = $500+. Fewer deliveries, higher revenue per trip.',
    levels: [
      { name: 'Level 1: First Event', description: '1 catering order, taste test with business' },
      { name: 'Level 2: Regular Accounts', description: '3 recurring corporate clients' },
      { name: 'Level 3: Event Circuit', description: 'Weddings, graduations, community events' },
      { name: 'Level 4: Catering Network', description: 'Full catering coordinator with vendor roster' },
    ],
    whoThisIsFor: 'Organized, former event planners, detail-oriented people. If you can manage a calendar, you can coordinate catering.',
    whatYouNeed: ['Car or van', 'Smartphone', 'Calendar discipline', 'Local business connections'],
    monthlyPotential: '$1,200–$3,000',
    miniBusinessPlan: [
      '1 corporate account → weekly catering → $50–100 per order fee',
      'Scale to 5 accounts → $250–500/week steady',
      'Add events (weddings, graduations) → $200+ per event',
      'Cost+20% pricing — guaranteed, transparent, cooperative',
    ],
    pitchPreview: {
      businessType: 'Business Cue Card',
      tagline: 'Guaranteed weekly volume, Cost+20%, one contact',
      sampleMetric: '3 corporate accounts booked',
      sampleRevenue: 'Est. $1,200/week catering volume',
    },
  },
  {
    id: 'grocery',
    title: 'Grocery Runner',
    subtitle: 'The Pantry Path',
    icon: ShoppingBag,
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    bgGradient: 'from-green-950/40 to-slate-900/60',
    startupCost: '$0',
    monthlyEstimate: '$1,800–$3,500',
    timeToFirst: '1 week',
    innovations: '#1845–#1846',
    description: 'Local produce stands, specialty grocers, farm-to-table. Aggregate neighborhood demand for volume pricing.',
    levels: [
      { name: 'Level 1: Corner Store', description: '1 grocer, neighborhood delivery route' },
      { name: 'Level 2: Farm Stand', description: 'Add farm-direct produce, weekly boxes' },
      { name: 'Level 3: Demand Aggregation', description: '20+ households, volume discounts activated' },
      { name: 'Level 4: Local Food Network', description: 'Full grocery infrastructure with subscriptions' },
    ],
    whoThisIsFor: 'Efficient shoppers, people who already grocery shop for family. Turn your existing routine into a paid service.',
    whatYouNeed: ['Car', 'Insulated bags (hot + cold)', 'Smartphone', '3–4 hours per run'],
    monthlyPotential: '$700–$1,800',
    miniBusinessPlan: [
      '5 households → weekly runs → $15–25 per run',
      'Add subscription tiers → $75–125/week steady',
      'Aggregate demand → volume discounts at 20+ households',
      'Creator keeps 83.3% vs ~70% on Instacart/DoorDash',
    ],
    pitchPreview: {
      businessType: 'Savings Comparison',
      tagline: '83.3% to the store vs ~70% on gig platforms',
      sampleMetric: '5 households subscribed weekly',
      sampleRevenue: 'Est. $375/week delivery fees',
    },
  },
  {
    id: 'service',
    title: 'Service Runner',
    subtitle: 'Beyond Food',
    icon: Wrench,
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgGradient: 'from-blue-950/40 to-slate-900/60',
    startupCost: '$0',
    monthlyEstimate: '$2,000–$5,000',
    timeToFirst: '2 weeks',
    innovations: '#1847',
    description: 'Tutoring, barber shops, home repair, pet services. Same platform, same model — onboard any local business.',
    levels: [
      { name: 'Level 1: First Service', description: '1 service business on LB, booking flow live' },
      { name: 'Level 2: Multi-Service', description: '3+ service businesses, cross-referral active' },
      { name: 'Level 3: Service Hub', description: 'Home services bundle, scheduling coordination' },
      { name: 'Level 4: Community Steward', description: 'Full service network with allocation authority' },
    ],
    whoThisIsFor: 'Handyperson, cleaner, tutor, pet sitter — anyone with a marketable skill or who knows people with skills.',
    whatYouNeed: ['Existing tools/skills', 'Smartphone', 'Willingness to show up', 'Professional attitude'],
    monthlyPotential: '$800–$2,500',
    miniBusinessPlan: [
      'List 1 service → set your rate → first 3 clients',
      'Earn Marks through service delivery → unlock volume pricing',
      'Cross-refer related services → plumber + electrician bundle',
      'Become Steward → 2% management fee on your network',
    ],
    pitchPreview: {
      businessType: 'Service Listing',
      tagline: 'Clean, professional, cooperative pricing — keep 83.3%',
      sampleMetric: '4 bookings this week',
      sampleRevenue: 'Est. $600/week service income',
    },
  },
  {
    id: 'seeder-presenter',
    title: 'Seeder / Presenter',
    subtitle: 'The Bounty Scout',
    icon: Sprout,
    iconColor: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    bgGradient: 'from-teal-950/40 to-slate-900/60',
    startupCost: '$0',
    monthlyEstimate: 'XP + Marks + Steward income',
    timeToFirst: '1 day',
    innovations: '#2001–#2021',
    description: 'Discover businesses online (Seeder), deliver pitch packages in person (Presenter), or do both and earn double. Turn one-off bounties into recurring Steward value via Concentric Circles.',
    levels: [
      { name: 'Level 1: First Seed', description: '1 business seeded, Red Carpet link shared' },
      { name: 'Level 2: Active Seeder', description: '5 seeds, 2+ signed up, Presenter missions claimed' },
      { name: 'Level 3: Seeder Captain', description: '10+ seeds, Steward for 3+ businesses' },
      { name: 'Level 4: Network Builder', description: '25+ seeds, full Concentric Circle' },
    ],
    whoThisIsFor: 'Social people, community connectors, people who love talking about ideas. No inventory, no delivery — just conversations.',
    whatYouNeed: ['Smartphone', 'Enthusiasm', 'Willingness to attend local events', 'An LB Card with QR code'],
    monthlyPotential: 'XP + Marks + Steward income path',
    miniBusinessPlan: [
      '1 event → present LB → earn Seed Marks',
      '5 signups = Steward candidate → 2% recurring on directs',
      'Both Seeder + Presenter roles → double reward stacking',
      'Build Concentric Circle → recurring passive Steward income',
    ],
    pitchPreview: {
      businessType: 'Presentation Deck',
      tagline: 'This is what you\'ll show — your own personal Red Carpet',
      sampleMetric: '5 businesses seeded this month',
      sampleRevenue: '250 Marks earned + Steward pipeline',
    },
  },
  {
    id: 'designer',
    title: 'Become an LB Designer',
    subtitle: 'Creative Services Engine',
    icon: Paintbrush,
    iconColor: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    bgGradient: 'from-pink-950/40 to-slate-900/60',
    startupCost: '$0',
    monthlyEstimate: '$500–$5,000',
    timeToFirst: '1 week',
    innovations: '#1876–#1896',
    description: 'Design Lotería cards, cue cards, logos, business cards, and menu templates. Earn royalties every time a business uses your work. Win Design Battles for bonus payouts + Crow Feathers.',
    levels: [
      { name: 'Level 1: First Submission', description: 'Submit 1 design to the Arena, pass STAMP review' },
      { name: 'Level 2: Template Seller', description: '3+ approved templates in the Emporium, first royalty earned' },
      { name: 'Level 3: Battle Winner', description: 'Win a Design Battle, earn Crow Feather + pot payout' },
      { name: 'Level 4: Design Steward', description: '10+ templates, recurring commissions, Crew Table leader' },
    ],
    whoThisIsFor: 'Graphic designers, artists, crafters, anyone with visual skills. Even Canva users can compete and earn.',
    whatYouNeed: ['Design software (even Canva)', 'Portfolio of 3+ samples', 'Eye for business-friendly design', 'Creative passion'],
    monthlyPotential: '$500–$5,000',
    miniBusinessPlan: [
      '1 contest → win → earn Marks + bounty payout',
      'Get hired for Cue Cards / Deck Cards → $25–100 per card',
      'Build template portfolio → royalty on every use ($2–10)',
      'Join Designer Guild → recurring commissions + Crew Table',
    ],
    pitchPreview: {
      businessType: 'Sample Cue Card',
      tagline: 'This is a card you\'d design for a local business',
      sampleMetric: '3 templates in Emporium',
      sampleRevenue: 'Est. $80/week royalty income',
    },
  },
];

// ─── Bounty Poster Badge ───

const DATA_BOUNTY_TIERS = {
  empty:       { marks: 50, label: 'Be the first to add this!', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  sparse:      { marks: 30, label: 'Help fill this out',        color: 'text-amber-300', bg: 'bg-amber-500/15' },
  growing:     { marks: 15, label: 'Almost there',              color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  established: { marks: 5,  label: 'Confirm what\'s here',      color: 'text-slate-300', bg: 'bg-slate-500/15' },
  full:        { marks: 0,  label: '',                          color: '', bg: '' },
} as const;

type DataFillLevel = keyof typeof DATA_BOUNTY_TIERS;

function useDataFillLevels() {
  const [levels, setLevels] = useState<Map<string, DataFillLevel>>(new Map());

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('local_directory_entries' as any)
          .select('category') as { data: { category: string }[] | null; error: any };

        if (error || !data) return;
        const counts = new Map<string, number>();
        for (const row of data) {
          counts.set(row.category, (counts.get(row.category) || 0) + 1);
        }

        const result = new Map<string, DataFillLevel>();
        for (const [mapId, cat] of Object.entries(CATEGORY_MAP)) {
          const count = counts.get(cat) || 0;
          if (count >= 20) result.set(mapId, 'full');
          else if (count >= 10) result.set(mapId, 'established');
          else if (count >= 5) result.set(mapId, 'growing');
          else if (count >= 1) result.set(mapId, 'sparse');
          else result.set(mapId, 'empty');
        }
        setLevels(result);
      } catch {
        // Table may not exist yet
      }
    })();
  }, []);

  return (mapId: string): DataFillLevel => levels.get(mapId) || 'empty';
}

function useUserMapProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<{ startedMaps: string[]; completedSteps: number; totalSteps: number } | null>(null);

  useEffect(() => {
    if (!user) { setProgress(null); return; }
    (async () => {
      try {
        const { data, error } = await supabase
          .from('craft_treasure_map_progress' as any)
          .select('map_slug, completed_steps, total_steps')
          .eq('user_id', user.id) as { data: { map_slug: string; completed_steps: number; total_steps: number }[] | null; error: any };

        if (error || !data) { setProgress({ startedMaps: [], completedSteps: 0, totalSteps: 0 }); return; }
        setProgress({
          startedMaps: data.map(d => d.map_slug),
          completedSteps: data.reduce((sum, d) => sum + (d.completed_steps || 0), 0),
          totalSteps: data.reduce((sum, d) => sum + (d.total_steps || 0), 0),
        });
      } catch {
        setProgress({ startedMaps: [], completedSteps: 0, totalSteps: 0 });
      }
    })();
  }, [user]);

  return progress;
}

function JourneyProgressSection({ progress, mapCount }: { progress: { startedMaps: string[]; completedSteps: number; totalSteps: number }; mapCount: number }) {
  const pct = progress.totalSteps > 0 ? Math.round((progress.completedSteps / progress.totalSteps) * 100) : 0;

  return (
    <Card className="bg-gradient-to-r from-emerald-950/30 to-cyan-950/30 border-emerald-500/20 mb-8">
      <CardContent className="py-5 px-6">
        <div className="flex items-center gap-3 mb-3">
          <MapIcon className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-emerald-300">Your Journey</h3>
          <Badge variant="outline" className="ml-auto text-xs border-emerald-500/30 text-emerald-400">
            {progress.startedMaps.length} of {mapCount} maps started
          </Badge>
        </div>

        {progress.startedMaps.length > 0 ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.completedSteps} steps completed</span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
            <div className="flex flex-wrap gap-2">
              {progress.startedMaps.map(slug => (
                <Badge key={slug} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> {slug.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Circle className="w-4 h-4 text-slate-500" />
            <span>Pick a map below to start your first path. Every journey starts with $0 and a camera phone.</span>
            <ArrowRight className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BountyBadge({ mapId, getLevel }: { mapId: string; getLevel: (id: string) => DataFillLevel }) {
  const level = getLevel(mapId);
  if (level === 'full') return null;
  const tier = DATA_BOUNTY_TIERS[level];
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${tier.bg} border border-amber-500/20`}
         title={`Bounties available — earn Marks by contributing data`}>
      <Scroll className="w-3 h-3 text-amber-400" />
      <span className={`text-[10px] font-medium ${tier.color}`}>{tier.marks} Marks</span>
    </div>
  );
}

// ─── Flip Card Component ───

function TreasureMapFlipCard({ map, demandSignals, getLevel }: { map: TreasureMapCard; demandSignals: Map<string, number>; getLevel: (id: string) => DataFillLevel }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const navigate = useNavigate();
  const Icon = map.icon;

  const flip = useCallback(() => setIsFlipped(f => !f), []);

  const cat = CATEGORY_MAP[map.id];
  const demandAmt = cat ? demandSignals.get(cat) : undefined;

  return (
    <div className="treasure-map-flip-wrapper" style={{ perspective: '1200px' }}>
      <div
        className="relative w-full transition-transform duration-700 ease-in-out cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '520px',
        }}
        onClick={flip}
      >
        {/* ═══════ FRONT FACE ═══════ */}
        <div
          className={`absolute inset-0 rounded-xl border ${map.borderColor} bg-gradient-to-br ${map.bgGradient} overflow-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col h-full p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center">
                  <Icon className={`w-6 h-6 ${map.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{map.title}</h2>
                  <p className="text-sm text-muted-foreground">{map.subtitle}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline" className="border-slate-600 text-muted-foreground text-[10px]">{map.innovations}</Badge>
                <BountyBadge mapId={map.id} getLevel={getLevel} />
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">{map.description}</p>

            {/* Demand signal */}
            {demandAmt && demandAmt > 0 && (
              <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/30">
                <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300">
                  <strong>${demandAmt.toLocaleString()}</strong> in earmarked Credits waiting for the first {map.title.toLowerCase()} in your area
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <DollarSign className="w-4 h-4 mx-auto text-emerald-400 mb-0.5" />
                <p className="text-xs text-muted-foreground">Startup</p>
                <p className="text-sm font-bold text-emerald-400">{map.startupCost}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <Star className="w-4 h-4 mx-auto text-amber-400 mb-0.5" />
                <p className="text-xs text-muted-foreground">Est. Monthly</p>
                <p className="text-sm font-bold text-amber-400">{map.monthlyEstimate}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <Clock className="w-4 h-4 mx-auto text-blue-400 mb-0.5" />
                <p className="text-xs text-muted-foreground">First $</p>
                <p className="text-sm font-bold text-blue-400">{map.timeToFirst}</p>
              </div>
            </div>

            {/* Levels */}
            <div className="space-y-2 mb-5 flex-1">
              {map.levels.map((level, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    idx === 0 ? 'bg-amber-500/20 text-amber-400' :
                    idx === 1 ? 'bg-blue-500/20 text-blue-400' :
                    idx === 2 ? 'bg-purple-500/20 text-purple-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{level.name}</p>
                    <p className="text-xs text-muted-foreground">{level.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Flip hint */}
            <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-slate-700/40">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400/60" />
              <span className="text-[11px] text-amber-400/60 font-medium">Tap to see your Red Carpet</span>
            </div>
          </div>
        </div>

        {/* ═══════ BACK FACE ═══════ */}
        <div
          className={`absolute inset-0 rounded-xl border ${map.borderColor} bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex flex-col h-full">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4" onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${map.iconColor}`} />
                <h3 className="font-bold text-lg">{map.title}</h3>
              </div>

              {/* Section 1: Is This For You? */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Is This For You?</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{map.whoThisIsFor}</p>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400">WHAT YOU NEED:</p>
                  {map.whatYouNeed.map((item, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 text-xs mt-0.5">•</span>
                      <span className="text-xs text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-950/30 border border-emerald-800/20 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-400">MONTHLY POTENTIAL</p>
                  <p className="text-lg font-bold text-emerald-400">{map.monthlyPotential}</p>
                </div>
              </div>

              {/* Section 2: Mini Business Plan (collapsible) */}
              <div className="space-y-1.5">
                <button
                  className="flex items-center gap-1.5 w-full text-left"
                  onClick={(e) => { e.stopPropagation(); setPlanOpen(o => !o); }}
                >
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Your Mini Business Plan</h4>
                  {planOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
                </button>
                {planOpen && (
                  <div className="space-y-1.5 pl-1 animate-in fade-in duration-200">
                    {map.miniBusinessPlan.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs font-bold text-slate-500 mt-0.5 shrink-0">{i + 1}.</span>
                        <span className="text-xs text-slate-300 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Pitch Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Your Pitch Preview</h4>

                {/* A) Cue Card Preview */}
                <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-semibold text-slate-300">What YOU will carry — {map.pitchPreview.businessType}</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">"{map.pitchPreview.tagline}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-700/50 flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-emerald-400 font-medium">{map.pitchPreview.sampleMetric}</p>
                      <p className="text-[11px] text-amber-400 font-medium">{map.pitchPreview.sampleRevenue}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500">Sample data — customize with real local businesses</p>
                </div>

                {/* B) Local Directory Preview */}
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-3">
                  <LocalDirectory compact maxEntries={3} />
                  <p className="text-[9px] text-slate-500 mt-1.5">Cooperative directory — equal format, no paid placement</p>
                </div>
              </div>
            </div>

            {/* Section 4: Sticky action buttons */}
            <div
              className="flex items-center gap-2 px-5 py-3 border-t border-slate-700/40 bg-slate-950/90 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={flip}>
                <RotateCcw className="w-3.5 h-3.5" /> Back
              </Button>
              <Link to={`/treasure-maps/${map.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  More Details
                </Button>
              </Link>
              <Link to={`/treasure-maps/${map.id}?action=start`} className="flex-1">
                <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-xs gap-1">
                  Get Started <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───

export default function TreasureMaps() {
  const demandSignals = useDemandSignals();
  const getDataFillLevel = useDataFillLevels();
  const userProgress = useUserMapProgress();

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="treasure-maps">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center mb-10">
        <MapIcon className="w-14 h-14 mx-auto mb-3 text-amber-400" />
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-bold" data-xray-id="treasure-maps-title">Treasure Maps</h1>
          <BeaconDropButton compact className="ml-2" />
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Eight paths to building a local commerce network. Every map starts with $0 and a camera phone.
          Pick one, follow the levels, and grow your voice in the cooperative.
        </p>
      </div>

      {/* Personal journey progress */}
      {userProgress && (
        <JourneyProgressSection progress={userProgress} mapCount={TREASURE_MAPS.length} />
      )}

      {/* Progression callout */}
      <Card className="bg-gradient-to-r from-amber-950/30 to-purple-950/30 border-amber-500/20 mb-8">
        <CardContent className="py-4 px-6">
          <div className="flex items-start gap-3">
            <Rocket className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300">The Runner → Steward → Node Captain Path</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start delivering (earn delivery fees). Onboard businesses (earn allocation authority through Backed Marks).
                Become their Steward (add management influence). Your direct earnings grow AND your voice in cooperative governance grows.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map cards — flip deck */}
      <div className="grid md:grid-cols-2 gap-6">
        {TREASURE_MAPS.map(map => (
          <TreasureMapFlipCard key={map.id} map={map} demandSignals={demandSignals} getLevel={getDataFillLevel} />
        ))}
      </div>

      {/* SEC disclaimer */}
      <p className="text-[10px] text-slate-600 text-center mt-8 max-w-lg mx-auto">
        Revenue estimates are illustrative only based on sample market conditions. Actual results may vary.
        Onboarding credits represent service compensation from the platform's operational share.
        This is not a speculative instrument. No guarantee of income.
      </p>
    </PortalPageLayout>
  );
}
