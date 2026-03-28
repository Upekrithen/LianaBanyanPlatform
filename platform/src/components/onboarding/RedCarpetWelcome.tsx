import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, Sparkles, Map, Star, Users, Quote } from 'lucide-react';

interface RedCarpetWelcomeProps {
  invitation: {
    id: string;
    inviter_id: string;
    suggested_role: string;
    initiative_connection: string;
    personal_message: string | null;
    inviter_business_id: string | null;
  };
  inviterProfile: {
    display_name: string;
    avatar_url: string | null;
  };
  roleInfo: {
    display_name: string;
    beacon_stop_keys: string[];
    recommended_treasure_map: string;
    first_bounty_type: string;
    primary_initiatives: string[];
  };
  businessName?: string | null;
}

const BEACON_FRIENDLY: Record<string, { name: string; desc: string; icon: string }> = {
  rally_group: { name: 'Rally Group', desc: 'Organize and mobilize your community', icon: '🤝' },
  local_wheels: { name: 'Local Wheels', desc: 'Community transportation solutions', icon: '🚗' },
  commerce_engine: { name: 'Commerce Engine', desc: 'Buy, sell, and trade cooperatively', icon: '💰' },
  crew_calls: { name: 'Crew Calls', desc: 'Answer the call when help is needed', icon: '📞' },
  lemon_lot: { name: 'Lemon Lot', desc: 'Vehicle marketplace for the community', icon: '🚙' },
  calendar: { name: 'Calendar', desc: 'Stay organized with shared scheduling', icon: '📅' },
  treasure_map: { name: 'Treasure Maps', desc: 'Guided learning paths for every skill', icon: '🗺️' },
  notifications: { name: 'Notifications', desc: 'Stay connected with real-time updates', icon: '🔔' },
  design_arena: { name: 'Design Arena', desc: 'Compete and create with other designers', icon: '🎨' },
  emporium: { name: 'Design Emporium', desc: 'Browse and commission design work', icon: '🏪' },
  crew_tables: { name: 'Crew Tables', desc: 'Collaborate around shared projects', icon: '👥' },
  ghost_world: { name: 'Ghost World', desc: 'Explore the cooperative map', icon: '👻' },
  mission_one: { name: 'Mission ONE', desc: 'Food security for your community', icon: '🍽️' },
  stocked_local_larder: { name: 'Stocked Local Larder', desc: 'Local food sourcing network', icon: '🥬' },
  housing: { name: 'Housing', desc: 'Cooperative housing solutions', icon: '🏠' },
  subscriptions: { name: 'Subscriptions', desc: 'Subscribe to services you love', icon: '🔄' },
  beacon: { name: 'Beacon', desc: 'Two-Bite Teaching — learn as you go', icon: '🔦' },
  safety_ledger: { name: 'Safety Ledger', desc: 'Vehicle safety tracking', icon: '🛡️' },
  didasko: { name: 'Didasko', desc: 'Academic learning and teaching', icon: '📚' },
  jukebox: { name: 'JukeBox', desc: 'Music creation and sharing', icon: '🎵' },
};

export default function RedCarpetWelcome({ invitation, inviterProfile, roleInfo, businessName }: RedCarpetWelcomeProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const beaconStops = roleInfo.beacon_stop_keys.slice(0, 4);

  const handleJoin = async () => {
    navigate('/join');
    localStorage.setItem('lb_red_carpet_invitation_id', invitation.id);
    localStorage.setItem('lb_red_carpet_role', invitation.suggested_role);
    localStorage.setItem('lb_red_carpet_map', roleInfo.recommended_treasure_map || '');
    localStorage.setItem('lb_red_carpet_initiatives', JSON.stringify(roleInfo.primary_initiatives));
  };

  const handleExploreFirst = () => {
    localStorage.setItem('lb_red_carpet_invitation_id', invitation.id);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-muted/30 flex flex-col items-center justify-center p-4">
      {/* Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
          Step {step} of 3
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map(s => (
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
        {/* Step 1: Personal Welcome */}
        {step === 1 && (
          <div className="space-y-6" data-xray-id="red-carpet-step-1">
            <div className="text-center space-y-4">
              <Sparkles className="h-10 w-10 text-primary mx-auto" />
              <h1 className="text-3xl font-bold tracking-tight">Welcome to Liana Banyan</h1>

              <Card className="bg-card/80 backdrop-blur">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3 justify-center">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {inviterProfile.display_name?.[0]?.toUpperCase() || 'M'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold">You were invited by {inviterProfile.display_name}</p>
                      {businessName && (
                        <p className="text-sm text-muted-foreground">from {businessName}</p>
                      )}
                    </div>
                  </div>

                  {invitation.personal_message && (
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Quote className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm italic">"{invitation.personal_message}"</p>
                    </div>
                  )}

                  <p className="text-muted-foreground">
                    {inviterProfile.display_name} thinks you'd be great as a{' '}
                    <span className="font-semibold text-foreground">{roleInfo.display_name}</span>.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-center">
              <Button size="lg" onClick={() => setStep(2)}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Your Path (Tailored Beacon Run) */}
        {step === 2 && (
          <div className="space-y-6" data-xray-id="red-carpet-step-2">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Your Path</h1>
              <p className="text-muted-foreground">These are your first stops. There's much more to explore.</p>
            </div>
            <div className="grid gap-3">
              {beaconStops.map((key, i) => {
                const info = BEACON_FRIENDLY[key] || { name: key.replace(/_/g, ' '), desc: '', icon: '🔷' };
                return (
                  <Card key={key} className={i === 0 ? 'ring-2 ring-primary' : ''}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="text-2xl">{info.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{info.name}</span>
                          {i === 0 && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" /> Start Here
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{info.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button size="lg" onClick={() => setStep(3)}>
                Start Your Journey <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Join */}
        {step === 3 && (
          <div className="space-y-6" data-xray-id="red-carpet-step-3">
            <div className="text-center space-y-3">
              <Sparkles className="h-10 w-10 text-primary mx-auto" />
              <h1 className="text-3xl font-bold tracking-tight">Join for $5 a year</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                One key unlocks everything. Your personalized path is ready —
                just grab your Access Key and start.
              </p>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    'Personalized onboarding path',
                    'Free storefront',
                    'Design Arena access',
                    'Community calendar',
                    'Treasure Maps',
                    'Housing listings',
                    'Political tools',
                    'Crew collaboration',
                  ].map(benefit => (
                    <div key={benefit} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-green-500 shrink-0" />
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
              <button
                className="text-sm text-muted-foreground hover:text-foreground underline"
                onClick={handleExploreFirst}
              >
                I want to look around first
              </button>
            </div>
            <div className="flex justify-start">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
