/**
 * LOCAL COLD START DASHBOARD
 * ==========================
 * Milestone 2: The Cold Start & Stewardship System
 * 
 * Shows localized progress bars for initiatives in a specific city.
 * Displays: "Phoenix needs 50 families and 1 Duke to reach EMBER"
 * 
 * Tier Progression: SPARK → EMBER → FLAME → FIRE → BLAZE → INFERNO → WILDFIRE
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Flame, MapPin, Users, Crown, ArrowRight, 
  Sparkles, TrendingUp, Search, ChevronRight, Anchor, Ship
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

// Tier colors and icons
const TIER_CONFIG: Record<string, { color: string; bgColor: string; icon: React.ReactNode; description: string }> = {
  SPARK: { 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-500/20', 
    icon: <Sparkles className="w-4 h-4" />,
    description: 'Gathering interest'
  },
  EMBER: { 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-500/20', 
    icon: <Flame className="w-4 h-4" />,
    description: 'Ready to launch'
  },
  FLAME: { 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-500/30', 
    icon: <Flame className="w-4 h-4" />,
    description: 'Growing momentum'
  },
  FIRE: { 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/30', 
    icon: <Flame className="w-4 h-4" />,
    description: 'Sustainable operations'
  },
  BLAZE: { 
    color: 'text-red-600', 
    bgColor: 'bg-red-600/30', 
    icon: <Flame className="w-4 h-4" />,
    description: 'Expanding reach'
  },
  INFERNO: { 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-500/30', 
    icon: <Flame className="w-4 h-4" />,
    description: 'Regional impact'
  },
  WILDFIRE: { 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-400/30', 
    icon: <Flame className="w-4 h-4 animate-pulse" />,
    description: 'Full deployment'
  },
};

interface CityProgress {
  initiative_id: string;
  city: string;
  state: string;
  interested_families: number;
  committed_families: number;
  total_pledged: number;
  active_captains: number;
  current_tier: string;
  next_tier: string;
  families_to_next_tier: number;
  captains_to_next_tier: number;
}

interface InitiativeInfo {
  id: string;
  name: string;
  description: string;
  crown?: string;
}

const INITIATIVES: InitiativeInfo[] = [
  { id: 'lets_make_dinner', name: "Let's Make Dinner", description: 'Neighbors feeding neighbors', crown: 'Maneet Chauhan' },
  { id: 'lets_get_groceries', name: "Let's Get Groceries", description: 'Volume purchasing power' },
  { id: 'lets_go_shopping', name: "Let's Go Shopping", description: 'Cooperative buying power', crown: 'Mary Beth Laughton' },
  { id: 'household_concierge', name: 'Household Concierge', description: 'Shared Butler for your household' },
  { id: 'family_table', name: 'The Family Table', description: 'Intergenerational connection' },
  { id: 'health_accords', name: 'Tatiana Schlossburg Health Accords', description: 'Affordable prescriptions' },
  { id: 'msa', name: 'MSA', description: 'Medical savings accounts' },
  { id: 'defense_klaus', name: 'Defense Klaus', description: 'Personal safety ("For Someone You Love")' },
  { id: 'rally_group', name: 'Rally Group', description: 'Crisis response everywhere', crown: 'Kimberly A. Williams' },
  { id: 'vsl', name: 'VSL', description: 'Voucher Short Loans', crown: 'Cathie Mahon' },
  { id: 'lets_make_bread', name: "Let's Make Bread", description: 'Business incubator' },
  { id: 'harper_guild', name: 'Harper Guild', description: 'Ethics checking and truth-telling' },
  { id: 'jukebox', name: 'JukeBox', description: 'Music licensing / One Take Wonders' },
  { id: 'didasko', name: 'Didasko', description: 'BOUNTY K-12 curriculum' },
  { id: 'brass_tacks', name: 'Brass Tacks', description: 'Manufacturing cooperative' },
  { id: 'power_to_the_people', name: 'Power to the People', description: 'Political expedition and civic engagement' },
];

interface LocalColdStartDashboardProps {
  initialCity?: string;
  initialState?: string;
  showSearch?: boolean;
  initiativeFilter?: string[];
}

export const LocalColdStartDashboard: React.FC<LocalColdStartDashboardProps> = ({
  initialCity = '',
  initialState = '',
  showSearch = true,
  initiativeFilter
}) => {
  const navigate = useNavigate();
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [searchCity, setSearchCity] = useState(initialCity);
  const [searchState, setSearchState] = useState(initialState);
  const [progress, setProgress] = useState<CityProgress[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProgress = async (cityName: string, stateName: string) => {
    if (!cityName || !stateName) return;
    
    setLoading(true);
    try {
      const initiatives = initiativeFilter || INITIATIVES.map(i => i.id);
      const results: CityProgress[] = [];

      for (const initiativeId of initiatives) {
        const { data, error } = await supabase
          .rpc('get_city_cold_start_progress', {
            p_initiative_id: initiativeId,
            p_city: cityName,
            p_state: stateName
          });

        if (data && data.length > 0) {
          results.push(data[0]);
        } else {
          // Return default SPARK state if no data
          results.push({
            initiative_id: initiativeId,
            city: cityName,
            state: stateName,
            interested_families: 0,
            committed_families: 0,
            total_pledged: 0,
            active_captains: 0,
            current_tier: 'SPARK',
            next_tier: 'EMBER',
            families_to_next_tier: 50,
            captains_to_next_tier: 1
          });
        }
      }

      setProgress(results);
    } catch (error) {
      console.error('Error fetching cold start progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (city && state) {
      fetchProgress(city, state);
    }
  }, [city, state]);

  const handleSearch = () => {
    setCity(searchCity);
    setState(searchState);
  };

  const getInitiativeInfo = (id: string): InitiativeInfo => {
    return INITIATIVES.find(i => i.id === id) || { id, name: id, description: '' };
  };

  const calculateProgressPercent = (current: number, target: number): number => {
    if (target === 0) return 100;
    return Math.min(100, Math.round((current / target) * 100));
  };

  return (
    <div className="space-y-6">
      {showSearch && (
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Find Your City's Progress
            </CardTitle>
            <CardDescription>
              See which initiatives are ready to launch in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Input
                placeholder="City (e.g., Phoenix)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="flex-1 min-w-[150px]"
              />
              <Input
                placeholder="State (e.g., AZ)"
                value={searchState}
                onChange={(e) => setSearchState(e.target.value.toUpperCase())}
                className="w-24"
                maxLength={2}
              />
              <Button onClick={handleSearch} disabled={!searchCity || !searchState}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {city && state && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              {city}, {state}
            </h2>
            <Badge variant="outline" className="text-sm">
              {progress.filter(p => p.current_tier !== 'SPARK').length} initiatives active
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 bg-muted/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.map((p) => {
                const info = getInitiativeInfo(p.initiative_id);
                const tierConfig = TIER_CONFIG[p.current_tier] || TIER_CONFIG.SPARK;
                const nextTierConfig = TIER_CONFIG[p.next_tier] || TIER_CONFIG.EMBER;
                const familyProgress = calculateProgressPercent(
                  p.interested_families, 
                  p.interested_families + p.families_to_next_tier
                );

                return (
                  <Card 
                    key={p.initiative_id} 
                    className={`border-2 transition-all hover:shadow-lg ${tierConfig.bgColor} border-transparent hover:border-primary/30`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {info.name}
                            {info.crown && (
                              <Crown className="w-4 h-4 text-yellow-500" title={`Crown: ${info.crown}`} />
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {info.description}
                          </CardDescription>
                        </div>
                        <Badge className={`${tierConfig.color} ${tierConfig.bgColor} flex items-center gap-1`}>
                          {tierConfig.icon}
                          {p.current_tier}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress to next tier */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress to {p.next_tier}</span>
                          <span className="font-medium">{familyProgress}%</span>
                        </div>
                        <Progress value={familyProgress} className="h-2" />
                      </div>

                      {/* What's needed */}
                      <div className="bg-background/50 rounded-lg p-3 space-y-2">
                        <p className="text-sm font-medium">
                          {city} needs:
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-primary" />
                            <span>
                              {p.families_to_next_tier > 0 
                                ? `${p.families_to_next_tier} more families` 
                                : <span className="text-green-500">✓ Families met</span>
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Anchor className="w-3 h-3 text-blue-500" />
                            <span>
                              {p.captains_to_next_tier > 0 
                                ? `${p.captains_to_next_tier} Captain${p.captains_to_next_tier > 1 ? 's' : ''}` 
                                : <span className="text-green-500">✓ Captain assigned</span>
                              }
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          to reach <span className={nextTierConfig.color}>{p.next_tier}</span>
                        </p>
                      </div>

                      {/* Current stats */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-muted/30 rounded p-2">
                          <div className="font-bold text-lg">{p.interested_families}</div>
                          <div className="text-muted-foreground">Interested</div>
                        </div>
                        <div className="bg-muted/30 rounded p-2">
                          <div className="font-bold text-lg">{p.committed_families}</div>
                          <div className="text-muted-foreground">Committed</div>
                        </div>
                        <div className="bg-muted/30 rounded p-2">
                          <div className="font-bold text-lg">{p.active_captains}</div>
                          <div className="text-muted-foreground">Captain{p.active_captains !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/cold-start/${p.initiative_id}?city=${city}&state=${state}`)}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        I'm Interested
                      </Button>
                      {p.captains_to_next_tier > 0 && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/become-captain/${p.initiative_id}?city=${city}&state=${state}`)}
                        >
                          <Anchor className="w-3 h-3 mr-1" />
                          Become Captain
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!city && !state && showSearch && (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Enter your city and state to see local initiative progress</p>
        </div>
      )}
    </div>
  );
};

export default LocalColdStartDashboard;
