import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCanonicalStats } from '@/hooks/useCanonicalStats';
import { supabase } from '@/integrations/supabase/client';
import RedCarpetWelcome from '@/components/onboarding/RedCarpetWelcome';
import { Check, ChevronRight, Map, Star, Sparkles, Flame } from 'lucide-react';
import { ONBOARDING_QUICK_RUN } from '@/data/wildfireRuns';
import { useWildfireRun } from '@/contexts/WildfireRunContext';
import { detectPortal, type PortalType } from '@/utils/portalDetector';

const INTEREST_CARDS: ReadonlyArray<{
  id: string; emoji: string; label: string; tags: string[];
  portals: PortalType[];
}> = [
  { id: 'food', emoji: '🍽️', label: 'I want affordable food', tags: ['food', 'mission_one'], portals: ['marketplace', 'nonprofit'] },
  { id: 'housing', emoji: '🏠', label: 'I need housing help', tags: ['housing', 'mission_two'], portals: ['marketplace', 'nonprofit'] },
  { id: 'transport', emoji: '🚗', label: 'I need transportation', tags: ['transport', 'mission_three'], portals: ['marketplace', 'nonprofit'] },
  { id: 'maker', emoji: '🎨', label: 'I make things (crafts, art, food)', tags: ['maker', 'forge', 'arena'], portals: ['marketplace', 'dss', 'network'] },
  { id: 'business', emoji: '💼', label: 'I run a small business', tags: ['business', 'lmb', 'storefront'], portals: ['marketplace', 'business', 'network'] },
  { id: 'hr', emoji: '📋', label: 'I need to hire or find work', tags: ['business', 'hr'], portals: ['business'] },
  { id: 'funding', emoji: '🏦', label: 'I need funding or financial services', tags: ['housing', 'funding'], portals: ['nonprofit'] },
  { id: 'supply', emoji: '🔗', label: 'I manage supply chains or contracts', tags: ['business', 'network'], portals: ['network'] },
  { id: 'prototype', emoji: '🖨️', label: 'I prototype or manufacture products', tags: ['maker', 'forge', 'manufacturing'], portals: ['dss'] },
  { id: 'gaming', emoji: '🏝️', label: 'I love strategy games and world-building', tags: ['gaming', 'hexisle'], portals: ['hexisle'] },
  { id: 'volunteer', emoji: '🤝', label: 'I want to help my community', tags: ['volunteer', 'rally', 'crew'], portals: ['marketplace', 'nonprofit'] },
  { id: 'explore', emoji: '🔍', label: "I'm just exploring", tags: ['explore'], portals: ['marketplace', 'business', 'nonprofit', 'network', 'dss', 'hexisle', 'upekrithen'] },
];

const ATTRIBUTION_OPTIONS = [
  { id: 'friend', label: 'Friend or Family' },
  { id: 'qr', label: 'QR Code' },
  { id: 'social', label: 'Social Media' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'news', label: 'News or Article' },
  { id: 'found_it', label: 'Just Found It' },
] as const;

interface MapRecommendation {
  id: string;
  name: string;
  description: string;
  primary: boolean;
}

const TAG_MAP_RECOMMENDATIONS: Record<string, { primary: MapRecommendation; secondaries: MapRecommendation[] }> = {
  food: {
    primary: { id: 'breakfast-runner', name: 'Breakfast Runner', description: 'Start your day by feeding your community', primary: true },
    secondaries: [{ id: 'lets-get-groceries', name: "Let's Get Groceries", description: 'Affordable grocery access for everyone', primary: false }],
  },
  maker: {
    primary: { id: 'maker-economy', name: 'Maker Economy', description: 'Turn your craft into cooperative income', primary: true },
    secondaries: [{ id: 'design-arena', name: 'Design Arena', description: 'Compete and collaborate with other makers', primary: false }],
  },
  business: {
    primary: { id: 'lets-make-bread', name: "Let's Make Bread", description: 'Build a cooperative business from scratch', primary: true },
    secondaries: [{ id: 'storefront-builder', name: 'Storefront Builder', description: 'Launch your first free storefront', primary: false }],
  },
  housing: {
    primary: { id: 'mission-two', name: 'Mission TWO', description: 'Cooperative housing solutions', primary: true },
    secondaries: [{ id: 'neighborhood-node', name: 'Neighborhood Node', description: 'Build local housing resilience', primary: false }],
  },
  transport: {
    primary: { id: 'rally-group-transport', name: 'Rally Group Transport', description: 'Community-owned vehicle sharing', primary: true },
    secondaries: [{ id: 'local-wheels', name: 'Local Wheels', description: 'Find local transportation solutions', primary: false }],
  },
  volunteer: {
    primary: { id: 'rally-group', name: 'Rally Group', description: 'Organize and mobilize your community', primary: true },
    secondaries: [{ id: 'crew-call', name: 'Crew Call', description: 'Answer the call when help is needed', primary: false }],
  },
  explore: {
    primary: { id: 'platform-explorer', name: 'Platform Explorer', description: 'Discover all the tools at your disposal', primary: true },
    secondaries: [{ id: 'breakfast-runner', name: 'Breakfast Runner', description: 'Start your day by feeding your community', primary: false }],
  },
};

function getRecommendedMaps(selectedIds: string[]): MapRecommendation[] {
  const selected = INTEREST_CARDS.filter(c => selectedIds.includes(c.id));
  const allTags = selected.flatMap(c => c.tags);
  const tagGroups = [...new Set(allTags.filter(t => TAG_MAP_RECOMMENDATIONS[t]))];
  if (tagGroups.length === 0) tagGroups.push('explore');

  const maps: MapRecommendation[] = [];
  const seen = new Set<string>();

  const firstGroup = TAG_MAP_RECOMMENDATIONS[tagGroups[0]];
  if (firstGroup) {
    maps.push(firstGroup.primary);
    seen.add(firstGroup.primary.id);
  }

  for (const tag of tagGroups) {
    const group = TAG_MAP_RECOMMENDATIONS[tag];
    if (!group) continue;
    for (const sec of group.secondaries) {
      if (!seen.has(sec.id) && maps.length < 3) {
        maps.push(sec);
        seen.add(sec.id);
      }
    }
  }

  return maps;
}

export default function GuidedDiscovery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stats = useCanonicalStats();
  const { startRun } = useWildfireRun();
  const currentPortal = detectPortal();
  const visibleInterests = INTEREST_CARDS.filter(c => c.portals.includes(currentPortal));
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [attribution, setAttribution] = useState<string | null>(null);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);

  const [inviteData, setInviteData] = useState<{
    invitation: any;
    inviterProfile: any;
    roleInfo: any;
    businessName: string | null;
  } | null>(null);
  const [inviteExpired, setInviteExpired] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    const inviteCode = searchParams.get('invite');
    if (!inviteCode) return;

    setInviteLoading(true);
    (async () => {
      const { data: inv } = await supabase
        .from('invitations' as never)
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('status', 'active')
        .maybeSingle() as { data: any };

      if (!inv || (inv.expires_at && new Date(inv.expires_at) < new Date())) {
        setInviteExpired(true);
        setInviteLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('member_profiles' as never)
        .select('display_name, avatar_url')
        .eq('user_id', inv.inviter_id)
        .maybeSingle() as { data: { display_name: string; avatar_url: string | null } | null };

      const { data: roleInfo } = await supabase
        .from('role_initiative_map' as never)
        .select('display_name, beacon_stop_keys, recommended_treasure_map, first_bounty_type, primary_initiatives')
        .eq('role_key', inv.suggested_role || '')
        .maybeSingle() as { data: any };

      let businessName: string | null = null;
      if (inv.inviter_business_id) {
        const { data: biz } = await supabase
          .from('storefronts' as never)
          .select('name')
          .eq('id', inv.inviter_business_id)
          .maybeSingle() as { data: { name: string } | null };
        businessName = biz?.name || null;
      }

      if (roleInfo) {
        setInviteData({
          invitation: inv,
          inviterProfile: profile || { display_name: 'A member', avatar_url: null },
          roleInfo,
          businessName,
        });
      } else {
        setInviteExpired(true);
      }
      setInviteLoading(false);
    })();
  }, [searchParams]);

  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (inviteData) {
    return <RedCarpetWelcome {...inviteData} />;
  }

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const recommendedMaps = getRecommendedMaps(selectedInterests);

  const saveState = () => {
    const allTags = INTEREST_CARDS
      .filter(c => selectedInterests.includes(c.id))
      .flatMap(c => c.tags);
    const effectiveMapId = selectedMapId || (recommendedMaps[0]?.id ?? null);
    localStorage.setItem('lb_discovery_state', JSON.stringify({
      tags: [...new Set(allTags)],
      attribution_source: attribution,
      recommended_maps: recommendedMaps.map(m => m.id),
      selected_interests: selectedInterests,
      selected_map: effectiveMapId,
    }));
  };

  const handleNext = () => {
    if (step < 4) {
      if (step === 2) {
        localStorage.setItem('lb_attribution_source', attribution || 'unknown');
      }
      setStep(step + 1);
    }
  };

  const handleJoin = () => {
    saveState();
    navigate('/join');
  };

  const handleExploreFirst = () => {
    saveState();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col items-center justify-center p-4">
      {inviteExpired && (
        <div className="w-full max-w-2xl mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center text-sm text-amber-700 dark:text-amber-300">
          This invitation has expired or was already used. You can still join!
        </div>
      )}
      {/* Progress indicator */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
          Step {step} of 4
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl">
        {/* Screen 1: What brings you here? */}
        {step === 1 && (
          <div className="space-y-6" data-xray-id="discovery-step-1">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">What brings you here?</h1>
              <p className="text-muted-foreground">Select everything that applies. We'll build your path.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleInterests.map(card => {
                const selected = selectedInterests.includes(card.id);
                return (
                  <Card
                    key={card.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleInterest(card.id)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="text-2xl">{card.emoji}</span>
                      <span className="font-medium flex-1">{card.label}</span>
                      {selected && <Check className="h-5 w-5 text-primary" />}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={handleNext}
                disabled={selectedInterests.length === 0}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 2: How did you hear about us? */}
        {step === 2 && (
          <div className="space-y-6" data-xray-id="discovery-step-2">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">How did you hear about us?</h1>
              <p className="text-muted-foreground">This helps us understand how people find their way here.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ATTRIBUTION_OPTIONS.map(opt => {
                const selected = attribution === opt.id;
                return (
                  <Card
                    key={opt.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setAttribution(opt.id)}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <span className="font-medium flex-1">{opt.label}</span>
                      {selected && <Check className="h-5 w-5 text-primary" />}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button size="lg" onClick={handleNext} disabled={!attribution}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 3: Here's your path */}
        {step === 3 && (
          <div className="space-y-6" data-xray-id="discovery-step-3">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Here's your path</h1>
              <p className="text-muted-foreground">Based on what you told us, we recommend starting here.</p>
            </div>
            <div className="space-y-3">
              {recommendedMaps.map((map, i) => {
                const isSelected = selectedMapId ? selectedMapId === map.id : i === 0;
                return (
                  <Card
                    key={map.id}
                    className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/40'}`}
                    onClick={() => setSelectedMapId(map.id)}
                  >
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className={`rounded-lg p-2.5 mt-0.5 ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Map className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{map.name}</span>
                          {isSelected ? (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" /> Your starting point
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Also recommended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{map.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button size="lg" onClick={handleNext}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Screen 4: Join for $5 a year */}
        {step === 4 && (
          <div className="space-y-6" data-xray-id="discovery-step-4">
            <div className="text-center space-y-3">
              <Sparkles className="h-10 w-10 text-primary mx-auto" />
              <h1 className="text-3xl font-bold tracking-tight">One key unlocks everything.</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                For $5 a year, you get full access to every service — a personal
                storefront (free), design tools, community maps, and a voice in
                how this platform grows.
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    'First Store Free',
                    'Ghost World placement',
                    'Design Arena',
                    'Crew Tables',
                    'Calendar',
                    'Housing listings',
                    'Political tools',
                    'Vacation network',
                  ].map(benefit => (
                    <div key={benefit} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col items-center gap-3">
              <Button size="lg" className="w-full max-w-sm text-lg py-6" onClick={handleJoin}>
                Get My Access Key — $5/year
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full max-w-sm gap-2"
                onClick={() => {
                  saveState();
                  startRun(ONBOARDING_QUICK_RUN);
                  navigate(ONBOARDING_QUICK_RUN.nodes[0].route);
                }}
              >
                <Flame className="h-4 w-4" />
                Take a guided tour first
              </Button>
              <button
                className="text-sm text-muted-foreground hover:text-foreground underline"
                onClick={handleExploreFirst}
              >
                I want to look around on my own
              </button>
            </div>
            <div className="flex justify-start">
              <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
