import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Map, CreditCard, User, ArrowRight, Flag, Compass, Store, QrCode, Sparkles, PartyPopper, Flame } from 'lucide-react';
import { ONBOARDING_DEEP_RUN } from '@/data/wildfireRuns';
import { useWildfireRun } from '@/contexts/WildfireRunContext';

interface MapProgress {
  map_id: string;
  map_name: string;
  current_phase: number;
}

export default function FirstSteps() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { startRun } = useWildfireRun();
  const [maps, setMaps] = useState<MapProgress[]>([]);
  const [profile, setProfile] = useState<{ display_name: string | null; username: string } | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [beaconOrder, setBeaconOrder] = useState<string[]>([]);
  const [membershipJustActivated, setMembershipJustActivated] = useState(false);
  const [discoverySelectedMap, setDiscoverySelectedMap] = useState<string | null>(null);

  const membershipSuccess = searchParams.get('membership') === 'success';

  useEffect(() => {
    if (membershipSuccess) {
      setMembershipJustActivated(true);
      toast({ title: 'Welcome! Your Access Key is active.', description: 'You now have full cooperative access.' });
      localStorage.removeItem('lb_pending_membership');
    }
  }, [membershipSuccess, toast]);

  useEffect(() => {
    const visits = parseInt(localStorage.getItem('lb_first_steps_visits') || '0', 10) + 1;
    localStorage.setItem('lb_first_steps_visits', String(visits));
    if (visits > 3 && !membershipSuccess) {
      toast({ title: 'Your full dashboard is ready.' });
      navigate('/dashboard', { replace: true });
      return;
    }

    try {
      const raw = localStorage.getItem('lb_discovery_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.selected_map) setDiscoverySelectedMap(parsed.selected_map);
      }
    } catch { /* ignore */ }

    if (!user) return;

    (async () => {
      const { data: profileData } = await supabase
        .from('member_profiles' as never)
        .select('display_name, username, tags')
        .eq('user_id', user.id)
        .maybeSingle() as { data: { display_name: string | null; username: string; tags: string[] } | null };

      if (profileData) {
        setProfile({ display_name: profileData.display_name, username: profileData.username });
        setTags(profileData.tags || []);
      }

      const { data: mapData } = await supabase
        .from('treasure_map_progress' as never)
        .select('map_id, current_phase')
        .eq('user_id', user.id) as { data: { map_id: string; current_phase: number }[] | null };

      if (mapData) {
        setMaps(mapData.map(m => ({
          map_id: m.map_id,
          map_name: m.map_id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          current_phase: m.current_phase,
        })));
      }

      // Check if member arrived via Red Carpet invitation
      const { data: invData } = await supabase
        .from('invitations' as never)
        .select('id, inviter_id')
        .eq('invitee_id', user.id)
        .maybeSingle() as { data: { id: string; inviter_id: string } | null };

      if (invData) {
        const { data: inviterProfile } = await supabase
          .from('member_profiles' as never)
          .select('display_name')
          .eq('user_id', invData.inviter_id)
          .maybeSingle() as { data: { display_name: string } | null };
        setInviterName(inviterProfile?.display_name || null);

        const { data: stops } = await supabase
          .from('invitation_beacon_stops' as never)
          .select('beacon_key, priority_order')
          .eq('invitation_id', invData.id)
          .order('priority_order') as { data: { beacon_key: string; priority_order: number }[] | null };
        if (stops) setBeaconOrder(stops.map(s => s.beacon_key));
      }
    })();
  }, [user, navigate, toast]);

  const memberName = profile?.display_name || 'new member';
  const showStorefront = tags.some(t => ['business', 'maker', 'storefront', 'lmb', 'forge'].includes(t));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-3xl mx-auto px-4 py-12 space-y-8" data-xray-id="first-steps">
        {/* Membership Celebration */}
        {membershipJustActivated && (
          <Card className="border-green-500/40 bg-green-500/5">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-full bg-green-500/10 p-3">
                <PartyPopper className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">Access Key Activated!</p>
                <p className="text-sm text-muted-foreground">
                  Your cooperative membership is live. You have full access to all platform features.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Liana Banyan, {memberName}!
          </h1>
          <p className="text-muted-foreground">Here's what we set up for you.</p>
          {inviterName && (
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Invited by <strong>{inviterName}</strong></span>
            </div>
          )}
        </div>

        {/* Section 1: Your Path */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" /> Your Path
          </h2>
          {maps.length > 0 ? (
            <div className="grid gap-3">
              {maps.map((map, i) => {
                const isDiscoveryPick = discoverySelectedMap === map.map_id;
                return (
                <Card key={map.map_id} className={isDiscoveryPick ? 'ring-2 ring-primary' : ''}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <Map className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{map.map_name}</span>
                        {isDiscoveryPick && (
                          <Badge variant="default" className="text-xs">Your Pick</Badge>
                        )}
                        {!isDiscoveryPick && i === 0 && (
                          <Badge variant="default" className="text-xs">Start Here</Badge>
                        )}
                        {inviterName && i < 3 && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Sparkles className="h-3 w-3" /> Recommended by {inviterName}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Phase {map.current_phase}</p>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/treasure-maps?map=${map.map_id}`)}>
                      Begin <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <span className="text-muted-foreground">No maps assigned yet.</span>
                <Button variant="outline" size="sm" onClick={() => navigate('/treasure-maps')}>
                  Pick a path
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Section 2: Your Member Card */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Your Member Card
          </h2>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {(profile?.display_name || 'M')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold">
                  {profile?.display_name || (
                    <button className="text-primary underline" onClick={() => navigate(`/member/${profile?.username || 'me'}?edit=true`)}>
                      Set your name
                    </button>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Member since {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="hidden sm:flex items-center justify-center w-14 h-14 bg-muted rounded-lg">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
            <div className="px-5 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/member/${profile?.username || 'me'}?edit=true`)}
              >
                <User className="h-3 w-3 mr-1" /> Complete Your Profile
              </Button>
            </div>
          </Card>
        </div>

        {/* Section 3: Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-1"
              onClick={() => {
                startRun(ONBOARDING_DEEP_RUN);
                navigate(ONBOARDING_DEEP_RUN.nodes[0].route);
              }}
            >
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-xs">Deep Dive Tour</span>
            </Button>
            {showStorefront && (
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-1"
                onClick={() => navigate('/tools/storefront-builder')}
              >
                <Store className="h-5 w-5" />
                <span className="text-xs">Place Your Storefront</span>
              </Button>
            )}
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-1"
              onClick={() => navigate('/political-expedition')}
            >
              <Flag className="h-5 w-5" />
              <span className="text-xs">Find Your Reps</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-1"
              onClick={() => navigate('/dashboard')}
            >
              <Compass className="h-5 w-5" />
              <span className="text-xs">Explore the Platform</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
