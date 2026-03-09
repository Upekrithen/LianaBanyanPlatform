import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, BookOpen, ShoppingBag, Hammer, Sprout,
  FlaskConical, GraduationCap, Shield, Music, Palette,
  Scale, Anchor, Users, Coins, Lock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface City {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  features: string[];
  guildHall: string;
  wellType: 'stepwell' | 'drilled' | 'handdug' | 'artesian';
  population: number;
  unlockRequirement?: string;
  isUnlocked: boolean;
}

const TWELVE_CITIES: City[] = [
  {
    id: 'book-of-peace',
    name: 'Book of Peace Tower',
    subtitle: 'Knowledge Citadel',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-600',
    description: 'The central library and knowledge hub, guarded by Sinbad. Daily tasks include courier runs and archive maintenance.',
    features: ['Grand Library', 'Quest Board', 'Knowledge Archives', 'Sinbad\'s Chamber'],
    guildHall: 'Chronicler\'s Guild',
    wellType: 'artesian',
    population: 2500,
    isUnlocked: true,
  },
  {
    id: 'marketplace-hub',
    name: 'Marketplace Hub',
    subtitle: 'Commerce Center',
    icon: <ShoppingBag className="w-6 h-6" />,
    color: 'from-emerald-500 to-green-600',
    description: 'The bustling trade center where merchants gather. Buy, sell, and trade resources and goods.',
    features: ['Grand Bazaar', 'Auction House', 'Trade Routes', 'Merchant Guild'],
    guildHall: 'Merchant\'s Guild',
    wellType: 'stepwell',
    population: 5000,
    isUnlocked: true,
  },
  {
    id: 'forge-of-innovation',
    name: 'Forge of Innovation',
    subtitle: 'Manufacturing District',
    icon: <Hammer className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600',
    description: 'Where ideas become reality. Prototype, manufacture, and patent your inventions.',
    features: ['Prototype Labs', 'Patent Office', 'Manufacturing Floor', '3D Print Hub'],
    guildHall: 'Engineer\'s Guild',
    wellType: 'drilled',
    population: 3000,
    isUnlocked: true,
  },
  {
    id: 'garden-of-growth',
    name: 'Garden of Growth',
    subtitle: 'Agricultural Paradise',
    icon: <Sprout className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-600',
    description: 'Sustainable farming and food production. Home of Let\'s Make Dinner initiatives.',
    features: ['Vertical Farms', 'Chef\'s Pantry', 'Seed Vault', 'Community Kitchen'],
    guildHall: 'Farmer\'s Guild',
    wellType: 'handdug',
    population: 2000,
    isUnlocked: true,
  },
  {
    id: 'academy-heights',
    name: 'Academy Heights',
    subtitle: 'Education District',
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-600',
    description: 'Training grounds for all skill levels. Mentorship, courses, and certifications.',
    features: ['Training Arenas', 'Lecture Halls', 'Certification Center', 'Mentor Matching'],
    guildHall: 'Teacher\'s Guild',
    wellType: 'stepwell',
    population: 3500,
    unlockRequirement: 'Complete 5 quests',
    isUnlocked: false,
  },
  {
    id: 'alchemist-quarter',
    name: 'Alchemist\'s Quarter',
    subtitle: 'Research Labs',
    icon: <FlaskConical className="w-6 h-6" />,
    color: 'from-purple-500 to-violet-600',
    description: 'Research and development hub. Experiment with new technologies and processes.',
    features: ['R&D Labs', 'Testing Grounds', 'Innovation Center', 'Star Chamber'],
    guildHall: 'Alchemist\'s Guild',
    wellType: 'artesian',
    population: 1500,
    unlockRequirement: 'Reach Level 10',
    isUnlocked: false,
  },
  {
    id: 'fortress-walls',
    name: 'The Fortress Walls',
    subtitle: 'Defense & Security',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-slate-500 to-gray-600',
    description: 'Security operations and Rally Group coordination. Protection for all citizens.',
    features: ['Rally Point', 'Security HQ', 'Emergency Services', 'Underground Railroad'],
    guildHall: 'Guardian\'s Guild',
    wellType: 'drilled',
    population: 1000,
    unlockRequirement: 'Join Rally Group',
    isUnlocked: false,
  },
  {
    id: 'concert-hall',
    name: 'The Concert Hall',
    subtitle: 'Arts & Entertainment',
    icon: <Music className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-600',
    description: 'Creative arts district. Music, performance, and entertainment venues.',
    features: ['Main Stage', 'Recording Studios', 'Gallery District', 'Dream Jukebox'],
    guildHall: 'Performer\'s Guild',
    wellType: 'stepwell',
    population: 2000,
    unlockRequirement: 'Create 3 content pieces',
    isUnlocked: false,
  },
  {
    id: 'artisan-row',
    name: 'Artisan Row',
    subtitle: 'Crafts & Design',
    icon: <Palette className="w-6 h-6" />,
    color: 'from-cyan-500 to-teal-600',
    description: 'Design studios and craft workshops. Create visual assets and physical goods.',
    features: ['Design Studios', 'Craft Workshops', 'Material Library', 'Asset Library'],
    guildHall: 'Artisan\'s Guild',
    wellType: 'handdug',
    population: 1800,
    unlockRequirement: 'Upload 5 assets',
    isUnlocked: false,
  },
  {
    id: 'court-of-justice',
    name: 'Court of Justice',
    subtitle: 'Legal & Governance',
    icon: <Scale className="w-6 h-6" />,
    color: 'from-yellow-500 to-amber-600',
    description: 'Legal services, dispute resolution, and governance. Home of the Steward\'s Council.',
    features: ['Courtrooms', 'Legal Library', 'Steward Council', 'Contract Registry'],
    guildHall: 'Steward\'s Guild',
    wellType: 'artesian',
    population: 800,
    unlockRequirement: 'Own a Medallion',
    isUnlocked: false,
  },
  {
    id: 'harbor-district',
    name: 'Harbor District',
    subtitle: 'Trade & Logistics',
    icon: <Anchor className="w-6 h-6" />,
    color: 'from-blue-400 to-sky-600',
    description: 'International trade hub. Import, export, and logistics coordination.',
    features: ['Shipping Docks', 'Customs Office', 'Warehouse District', 'Trade Routes'],
    guildHall: 'Navigator\'s Guild',
    wellType: 'drilled',
    population: 4000,
    unlockRequirement: 'Complete 10 trades',
    isUnlocked: false,
  },
  {
    id: 'assembly-grounds',
    name: 'Assembly Grounds',
    subtitle: 'Community Center',
    icon: <Users className="w-6 h-6" />,
    color: 'from-indigo-500 to-purple-600',
    description: 'Community gathering place. Tribes, events, and collective decision-making.',
    features: ['Town Square', 'Event Pavilion', 'Tribe Halls', 'Voting Chamber'],
    guildHall: 'Community Guild',
    wellType: 'stepwell',
    population: 6000,
    unlockRequirement: 'Join a Tribe',
    isUnlocked: false,
  },
];

const WELL_TYPES = {
  stepwell: { name: 'Stepwell', description: 'Community-maintained, shared access', icon: '🏛️' },
  drilled: { name: 'Drilled Well', description: 'Deep industrial capacity', icon: '⚙️' },
  handdug: { name: 'Hand-Dug Well', description: 'Traditional, artisan crafted', icon: '🪣' },
  artesian: { name: 'Artesian Well', description: 'Natural pressure, premium quality', icon: '💎' },
};

interface TwelveCitiesProps {
  onCitySelect?: (city: City) => void;
  currentCityId?: string;
}

export function TwelveCities({ onCitySelect, currentCityId }: TwelveCitiesProps) {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCityClick = (city: City) => {
    if (!city.isUnlocked) return;
    setSelectedCity(city);
    if (onCitySelect) {
      onCitySelect(city);
    }
  };

  const unlockedCount = TWELVE_CITIES.filter(c => c.isUnlocked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">The Twelve Cities</h2>
          <p className="text-muted-foreground">
            {unlockedCount}/12 cities discovered
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <Building2 className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">City Discovery Progress</span>
                <span className="text-sm text-muted-foreground">
                  {unlockedCount}/12
                </span>
              </div>
              <Progress value={(unlockedCount / 12) * 100} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* City Grid */}
      <div className={`grid gap-4 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {TWELVE_CITIES.map(city => {
          const wellInfo = WELL_TYPES[city.wellType];
          const isCurrent = city.id === currentCityId;

          return (
            <Card
              key={city.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                !city.isUnlocked ? 'opacity-50' : ''
              } ${isCurrent ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleCityClick(city)}
            >
              <CardHeader className={`bg-gradient-to-r ${city.color} text-white rounded-t-lg`}>
                <div className="flex items-center gap-3">
                  {city.isUnlocked ? city.icon : <Lock className="w-6 h-6" />}
                  <div>
                    <CardTitle className="text-lg">{city.name}</CardTitle>
                    <p className="text-sm opacity-80">{city.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {city.isUnlocked ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      {city.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {city.features.slice(0, 3).map(feature => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {city.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{city.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        {wellInfo.icon} {wellInfo.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {city.population.toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {city.unlockRequirement}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected City Details */}
      {selectedCity && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedCity.icon}
              {selectedCity.name} - {selectedCity.guildHall}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Available Facilities</h4>
                <ul className="space-y-1">
                  {selectedCity.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">City Actions</h4>
                <div className="space-y-2">
                  <Button className="w-full" size="sm">
                    Enter {selectedCity.name}
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    View Quests
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Coins className="w-4 h-4 mr-2" />
                    Trade Resources
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

