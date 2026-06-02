/**
 * BENEFITS — How You Can Actually Make Money Using Liana Banyan
 * Shows all member benefits organized by path: Get a Job, Build a Business, Plant Seeds
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Store, Sprout, Users, DollarSign, Shield,
  Zap, Gift, Crown, Heart, Globe, BookOpen, Hammer, Music,
  ArrowRight, Check, Sparkles
} from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useNavigate } from 'react-router-dom';

const PATHS = [
  {
    id: 'job',
    title: 'Get a Job',
    icon: Briefcase,
    color: 'amber',
    tagline: 'Work for yourself. Keep what you earn.',
    benefits: [
      { text: 'Keep 83.3% of every transaction', detail: 'The platform takes Cost+20%, constitutionally locked. No surprise fees.' },
      { text: 'Personal storefront — free with membership', detail: 'Your own shop at your own URL. No listing fees. No algorithm tax.' },
      { text: 'Ghost World placement', detail: 'Get discovered by local buyers through community maps and Ghost attribution.' },
      { text: 'TradeMatch contracts', detail: 'Back your offers with Credits or Joules for stronger bids on work contracts.' },
      { text: 'Crew Tables — find collaborators', detail: 'Team up with other members for bigger jobs. Split earnings transparently.' },
      { text: 'Design Arena tools included', detail: 'Professional design tools for your products and marketing — no extra cost.' },
      { text: 'Herald referral income', detail: 'Earn 25 Marks per referral. Six tiers of rewards that never expire.' },
    ],
  },
  {
    id: 'business',
    title: 'Build a Business',
    icon: Store,
    color: 'emerald',
    tagline: 'Launch for $5/year. Scale without extraction.',
    benefits: [
      { text: 'Launch your business for $5/year', detail: 'Full platform access. No ownership surrendered. No outside financiers to answer to.' },
      { text: 'Community buying power', detail: 'Your customers pool purchasing — bulk discounts without bulk corporate extraction.' },
      { text: 'Preorder-funded production', detail: 'Customers fund your production runs. No inventory risk. No debt.' },
      { text: 'Surplus returns as Forever Stamps (Joules)', detail: 'When prices drop below what customers paid, the difference becomes Joules — locked-rate service credits.' },
      { text: 'Brass Tacks manufacturing network', detail: '10,000 micro-factories. Distributed production at cooperative rates.' },
      { text: 'Cross-initiative demand', detail: 'Your products can be featured across all 16 initiatives. One product, 16 channels.' },
      { text: 'Stripe Connect payouts', detail: 'Direct deposits to your bank. Transparent ledger. Subchapter T compliance.' },
      { text: 'Higher rewards for early commitment', detail: 'Bootstrap tier multipliers: Seed (5x), Sapling (3x), Tree (2x) governance weight.' },
    ],
  },
  {
    id: 'seeds',
    title: 'Plant Seeds',
    icon: Sprout,
    color: 'violet',
    tagline: 'Contribute. Earn. Watch it grow.',
    benefits: [
      { text: 'Earn Marks for every contribution', detail: 'Translate, design, test, review — every contribution earns platform Marks.' },
      { text: 'Translation Bounties (58 languages)', detail: 'Help localize the platform. Verified translations earn 300–800 Marks each.' },
      { text: 'Design Bounties', detail: 'Submit better versions of any component via X-Ray Goggles. Earn Credits + Marks.' },
      { text: 'Gleaner\'s Corner (3.3% of every sale)', detail: 'A portion of every transaction funds community projects you can contribute to.' },
      { text: 'Governance voice with Joules', detail: 'Direct your Joules to vote on which of 16 patent pedestals get prioritized.' },
      { text: 'Political tools included', detail: 'Voter guides, community organizing, civic engagement — Initiative #15.' },
      { text: 'Vacation network access', detail: 'Member-to-member home sharing. No platform tax beyond Cost+20%.' },
    ],
  },
];

const UNIVERSAL = [
  { icon: Shield, text: '$5/year — everything included', detail: 'One membership. All 16 initiatives. All tools. All services.' },
  { icon: DollarSign, text: 'Cost+20% locked forever', detail: 'Constitutional DNA Lock. Can never be changed. Ever.' },
  { icon: Crown, text: 'Member-governed platform', detail: 'You vote on how this grows. Joules = governance weight.' },
  { icon: Heart, text: '20% margin funds 16 charitable initiatives', detail: 'Your membership directly funds food, housing, health, education, and more.' },
  { icon: Globe, text: 'Works in 58 languages, 195 countries', detail: 'PPP-adjusted pricing. Same DNA, calibrated for local purchasing power.' },
  { icon: Zap, text: '{{innovationCount}} documented innovations', detail: '{{provisionalApps}} provisional patents. 2,473 formal claims. 99% utility, not design.' },
];

export default function BenefitsPage() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout maxWidth="xl" xrayId="benefits-page">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Gift className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold text-foreground">What's In It For You?</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Three paths. One membership. Every benefit unlocked for $5/year.
        </p>
      </div>

      {/* Three Paths */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {PATHS.map((path) => {
          const Icon = path.icon;
          const borderColor = path.color === 'amber' ? 'border-amber-500/30' :
            path.color === 'emerald' ? 'border-emerald-500/30' : 'border-violet-500/30';
          const bgColor = path.color === 'amber' ? 'bg-amber-500/5' :
            path.color === 'emerald' ? 'bg-emerald-500/5' : 'bg-violet-500/5';
          const textColor = path.color === 'amber' ? 'text-amber-500' :
            path.color === 'emerald' ? 'text-emerald-500' : 'text-violet-500';

          return (
            <Card key={path.id} className={`${borderColor} ${bgColor}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-6 w-6 ${textColor}`} />
                  <h2 className="text-lg font-bold text-foreground">{path.title}</h2>
                </div>
                <p className={`text-sm ${textColor} font-medium mb-4`}>{path.tagline}</p>
                <ul className="space-y-3">
                  {path.benefits.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <Check className={`h-4 w-4 ${textColor} shrink-0 mt-0.5`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.text}</p>
                        <p className="text-xs text-muted-foreground">{b.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Universal Benefits */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-foreground text-center mb-4">
          <Sparkles className="h-5 w-5 text-emerald-500 inline mr-2" />
          Every Member Gets
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {UNIVERSAL.map((u, i) => {
            const Icon = u.icon;
            return (
              <Card key={i} className="bg-card">
                <CardContent className="p-4 flex gap-3">
                  <Icon className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.text}</p>
                    <p className="text-xs text-muted-foreground">{u.detail}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Card className="bg-emerald-500/10 border-emerald-500/30 inline-block">
          <CardContent className="p-6">
            <p className="text-lg font-bold text-foreground mb-2">Ready?</p>
            <p className="text-sm text-muted-foreground mb-4">
              $5/year. All paths. All tools. All 16 initiatives. Cancel anytime.
            </p>
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => navigate('/welcome')}
            >
              Get My Access Key — $5/year <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
