import { Link } from 'react-router-dom';
import { ArrowLeft, Map, Star, DollarSign, Clock, Rocket, ChevronRight, Utensils, Coffee, Truck, Users, ShoppingBag, Wrench, Paintbrush } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface TreasureMap {
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
}

const TREASURE_MAPS: TreasureMap[] = [
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
      { name: 'Level 4: Node Builder', description: '10+ shops, full network, passive income from all' },
    ],
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
      { name: 'Level 4: Community Steward', description: 'Full service network with passive income' },
    ],
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
  },
];

export default function TreasureMaps() {
  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="treasure-maps">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center mb-10">
        <Map className="w-14 h-14 mx-auto mb-3 text-amber-400" />
        <h1 className="text-3xl font-bold mb-2" data-xray-id="treasure-maps-title">Treasure Maps</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Seven paths to building a local commerce network. Every map starts with $0 and a camera phone.
          Pick one, follow the levels, and build passive income.
        </p>
      </div>

      {/* Progression callout */}
      <Card className="bg-gradient-to-r from-amber-950/30 to-purple-950/30 border-amber-500/20 mb-8">
        <CardContent className="py-4 px-6">
          <div className="flex items-start gap-3">
            <Rocket className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-300">The Runner → Steward → Node Captain Path</p>
              <p className="text-sm text-slate-400 mt-1">
                Start delivering. Onboard businesses (earn 3% passive from platform's share — forever). Become their Steward (add 2% management fee).
                10 businesses at $3,000/mo each = <span className="text-emerald-400 font-bold">$900/mo passive income</span> before delivery fees.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {TREASURE_MAPS.map(map => {
          const Icon = map.icon;
          return (
            <Card key={map.id} className={`${map.borderColor} border bg-gradient-to-br ${map.bgGradient} overflow-hidden hover:scale-[1.01] transition-transform`}>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${map.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{map.title}</h2>
                      <p className="text-sm text-slate-400">{map.subtitle}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-slate-600 text-slate-500 text-[10px]">{map.innovations}</Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">{map.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <DollarSign className="w-4 h-4 mx-auto text-emerald-400 mb-0.5" />
                    <p className="text-xs text-slate-500">Startup</p>
                    <p className="text-sm font-bold text-emerald-400">{map.startupCost}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <Star className="w-4 h-4 mx-auto text-amber-400 mb-0.5" />
                    <p className="text-xs text-slate-500">Est. Monthly</p>
                    <p className="text-sm font-bold text-amber-400">{map.monthlyEstimate}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                    <Clock className="w-4 h-4 mx-auto text-blue-400 mb-0.5" />
                    <p className="text-xs text-slate-500">First $</p>
                    <p className="text-sm font-bold text-blue-400">{map.timeToFirst}</p>
                  </div>
                </div>

                {/* Levels */}
                <div className="space-y-2 mb-5">
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
                        <p className="text-xs text-slate-500">{level.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link to={map.id === 'designer' ? '/arena' : '/tools/storefront-builder'}>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700">
                    Start This Map <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SEC disclaimer */}
      <p className="text-[10px] text-slate-600 text-center mt-8 max-w-lg mx-auto">
        Revenue estimates are illustrative only based on sample market conditions. Actual results may vary.
        Onboarding credits represent service compensation from the platform's operational share.
        This is not an investment. No guarantee of income.
      </p>
    </PortalPageLayout>
  );
}
