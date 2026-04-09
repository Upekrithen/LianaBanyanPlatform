import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Palette, Star, Clock, Shield, CheckCircle2, AlertCircle, DollarSign, CreditCard as CreditCardIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useOpenBounties, RUSH_TIERS, type BrandBounty } from '@/hooks/useBrandBounties';
import { useMyDesignerProfile, useRegisterAsDesigner, useDesignerDirectory, xpStars, isTryoutMode, type DesignerProfile, PRICING_TIERS } from '@/hooks/useDesignerProfile';
import { useClaimBounty } from '@/hooks/useBrandBounties';
import { toast } from 'sonner';

function TierBadge({ tier }: { tier: number }) {
  const info = RUSH_TIERS.find((r) => r.tier === tier);
  if (!info) return null;
  const colors: Record<number, string> = {
    1: 'bg-red-600 text-white',
    2: 'bg-orange-500 text-white',
    3: 'bg-yellow-500 text-black',
    4: 'bg-blue-500 text-white',
    5: 'bg-green-500 text-white',
    6: 'bg-gray-500 text-white',
  };
  return (
    <Badge className={`${colors[tier] || 'bg-gray-500 text-white'} text-[10px]`}>
      T{tier} {info.label}
    </Badge>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= count ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
      ))}
    </span>
  );
}

function BountyCard({ bounty, onClaim, claiming }: { bounty: BrandBounty; onClaim: () => void; claiming: boolean }) {
  const typeLabels: Record<string, string> = {
    logo: 'Logo',
    domain_email: 'Domain + Email',
    designed_card: 'Designed Card',
    other: 'Custom',
  };

  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <TierBadge tier={bounty.rush_tier} />
          <span className="text-white font-medium text-sm">{typeLabels[bounty.bounty_type] || bounty.bounty_type}</span>
        </div>
        <span className="text-amber-400 font-bold text-sm">{bounty.price_marks} Marks</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <Clock className="w-3 h-3" />
          Due: {new Date(bounty.deadline).toLocaleDateString()}
          {bounty.paid_in_credits ? (
            <Badge variant="outline" className="border-emerald-600/50 text-emerald-400 text-[10px] gap-1">
              <CreditCardIcon className="w-2.5 h-2.5" /> Credits (priority)
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-600/50 text-amber-400 text-[10px]">Marks</Badge>
          )}
        </div>
        <Button size="sm" onClick={onClaim} disabled={claiming} className="bg-emerald-600 hover:bg-emerald-500 text-xs h-7">
          {claiming ? '...' : 'Claim'}
        </Button>
      </div>
    </div>
  );
}

function DesignerProfileCard({ profile }: { profile: DesignerProfile }) {
  const stars = xpStars(profile);
  const tryout = isTryoutMode(profile);
  const pricingLabel = PRICING_TIERS.find((p) => p.id === profile.pricing_tier)?.label || profile.pricing_tier;

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold">Your Profile</h4>
          {tryout ? (
            <Badge className="bg-amber-600 text-white text-[10px]">Tryout Mode</Badge>
          ) : (
            <StarRating count={stars} />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-white/40">Services</span>
            <p className="text-white">{profile.services.join(', ') || 'None set'}</p>
          </div>
          <div>
            <span className="text-white/40">Tiers</span>
            <p className="text-white">{profile.tier_availability.map((t) => `T${t}`).join(', ')}</p>
          </div>
          <div>
            <span className="text-white/40">Pricing</span>
            <p className="text-white">{pricingLabel}</p>
          </div>
          <div>
            <span className="text-white/40">Weekly Cap</span>
            <p className="text-white">{profile.weekly_capacity}</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-white/50">
          <span>{profile.completed_bounties} completed</span>
          <span>{profile.on_time_rate}% on-time</span>
          <span>{profile.avg_quality.toFixed(1)} avg quality</span>
        </div>
      </CardContent>
    </Card>
  );
}

function RegisterForm() {
  const register = useRegisterAsDesigner();
  const [services, setServices] = useState<string[]>([]);
  const [tiers, setTiers] = useState<number[]>([4, 5, 6]);
  const [pricing, setPricing] = useState('retail');

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleTier = (t: number) =>
    setTiers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const handleRegister = async () => {
    if (services.length === 0) { toast.error('Select at least one service'); return; }
    if (tiers.length === 0) { toast.error('Select at least one tier'); return; }
    try {
      await register.mutateAsync({ services, tier_availability: tiers, pricing_tier: pricing });
      toast.success('Registered as a designer!');
    } catch { toast.error('Registration failed'); }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader><CardTitle className="text-lg">Register as a Designer</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-white/60 text-sm mb-2">What do you do?</p>
          <div className="flex flex-wrap gap-2">
            {['logo', 'domain_email', 'designed_card'].map((s) => (
              <button key={s} onClick={() => toggleService(s)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  services.includes(s) ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/10 text-white/50'
                }`}>
                {s === 'logo' ? 'Logo Design' : s === 'domain_email' ? 'Domain + Email' : 'Card Design'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/60 text-sm mb-2">Which rush tiers?</p>
          <div className="flex flex-wrap gap-2">
            {RUSH_TIERS.map((rt) => (
              <button key={rt.tier} onClick={() => toggleTier(rt.tier)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  tiers.includes(rt.tier) ? `${rt.color} border-white/30 text-white` : 'border-white/10 text-white/50'
                }`}>
                T{rt.tier} {rt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/60 text-sm mb-2">Your pricing tier</p>
          <div className="flex flex-wrap gap-2">
            {PRICING_TIERS.map((pt) => (
              <button key={pt.id} onClick={() => setPricing(pt.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  pricing === pt.id ? 'bg-amber-700 border-amber-600 text-white' : 'border-white/10 text-white/50'
                }`}>
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-900/20 border border-amber-700/30">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-200/70 text-xs">
            Your first 2 completed bounties are "tryout" mode. After 2 approved deliveries, your XP rating starts counting.
          </p>
        </div>

        <Button onClick={handleRegister} disabled={register.isPending} className="w-full bg-violet-600 hover:bg-violet-500">
          {register.isPending ? 'Registering...' : 'Register'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DesignCrewPage() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useMyDesignerProfile();
  const { data: bounties = [], isLoading: bountiesLoading } = useOpenBounties();
  const claimBounty = useClaimBounty();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (bountyId: string) => {
    setClaimingId(bountyId);
    try {
      await claimBounty.mutateAsync(bountyId);
      toast.success('Bounty claimed! Deliver on time.');
    } catch {
      toast.error('Could not claim this bounty');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="design-crew">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="text-center mb-8">
        <Palette className="w-12 h-12 mx-auto mb-3 text-violet-400" />
        <h1 className="text-3xl font-bold mb-2" data-xray-id="design-crew-title">Design Crew</h1>
        <p className="text-slate-400">Cooperative designer marketplace — claim bounties, deliver quality, earn Marks</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="md:col-span-1 space-y-4">
          {profileLoading ? (
            <div className="animate-pulse text-white/30 text-sm p-4">Loading profile...</div>
          ) : profile ? (
            <DesignerProfileCard profile={profile} />
          ) : user ? (
            <RegisterForm />
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 text-center">
                <Shield className="w-8 h-8 text-white/30 mx-auto mb-2" />
                <p className="text-white/50 text-sm">Sign in to register as a designer</p>
                <Link to="/auth"><Button variant="outline" className="mt-3" size="sm">Sign In</Button></Link>
              </CardContent>
            </Card>
          )}

          {profile && !isTryoutMode(profile) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-emerald-200/70 text-xs">Tryout completed — your XP counts!</p>
            </div>
          )}
        </div>

        {/* Right: Open Bounties */}
        <div className="md:col-span-2">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            Available Bounties
            <Badge variant="outline" className="border-white/20 text-white/50 text-xs">{bounties.length}</Badge>
          </h2>

          {bountiesLoading ? (
            <div className="animate-pulse text-white/30 text-sm py-8 text-center">Loading bounties...</div>
          ) : bounties.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-lg">
              <Palette className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">No open bounties right now</p>
              <p className="text-white/25 text-xs mt-1">New members post brand bounties after signing up</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bounties.map((b) => (
                <BountyCard
                  key={b.id}
                  bounty={b}
                  onClaim={() => handleClaim(b.id)}
                  claiming={claimingId === b.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalPageLayout>
  );
}
