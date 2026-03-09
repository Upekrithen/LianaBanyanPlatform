import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, Hammer, Home, Factory, Store, 
  Warehouse, TreePine, Clock, Coins, Package,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Building {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'production' | 'commerce' | 'special';
  icon: React.ReactNode;
  cost: {
    credits: number;
    materials: number;
    time: number; // minutes
  };
  produces?: {
    resource: string;
    amount: number;
    interval: number; // minutes
  };
  unlockRequirement?: string;
  isUnlocked: boolean;
  maxCount: number;
}

interface PlacedBuilding {
  id: string;
  buildingId: string;
  hexX: number;
  hexY: number;
  constructionProgress: number;
  isComplete: boolean;
  lastCollection?: string;
}

const BUILDINGS: Building[] = [
  // Residential
  {
    id: 'cottage',
    name: 'Cottage',
    description: 'Basic housing for 2 workers',
    category: 'residential',
    icon: <Home className="w-5 h-5" />,
    cost: { credits: 100, materials: 20, time: 5 },
    isUnlocked: true,
    maxCount: 10,
  },
  {
    id: 'apartment',
    name: 'Apartment Block',
    description: 'Multi-family housing for 8 workers',
    category: 'residential',
    icon: <Building className="w-5 h-5" />,
    cost: { credits: 500, materials: 100, time: 30 },
    unlockRequirement: 'Build 3 cottages',
    isUnlocked: false,
    maxCount: 5,
  },
  // Production
  {
    id: 'farm',
    name: 'Farm',
    description: 'Produces food over time',
    category: 'production',
    icon: <TreePine className="w-5 h-5" />,
    cost: { credits: 150, materials: 30, time: 10 },
    produces: { resource: 'food', amount: 5, interval: 60 },
    isUnlocked: true,
    maxCount: 5,
  },
  {
    id: 'well',
    name: 'Water Well',
    description: 'Produces water for the community',
    category: 'production',
    icon: <Building className="w-5 h-5" />,
    cost: { credits: 200, materials: 50, time: 15 },
    produces: { resource: 'water', amount: 10, interval: 60 },
    isUnlocked: true,
    maxCount: 3,
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Produces materials from raw resources',
    category: 'production',
    icon: <Factory className="w-5 h-5" />,
    cost: { credits: 300, materials: 75, time: 20 },
    produces: { resource: 'materials', amount: 3, interval: 90 },
    isUnlocked: true,
    maxCount: 3,
  },
  // Commerce
  {
    id: 'market-stall',
    name: 'Market Stall',
    description: 'Trade resources with other players',
    category: 'commerce',
    icon: <Store className="w-5 h-5" />,
    cost: { credits: 250, materials: 40, time: 15 },
    isUnlocked: true,
    maxCount: 5,
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    description: 'Increases resource storage capacity',
    category: 'commerce',
    icon: <Warehouse className="w-5 h-5" />,
    cost: { credits: 400, materials: 100, time: 25 },
    unlockRequirement: 'Reach Level 5',
    isUnlocked: false,
    maxCount: 2,
  },
  // Special
  {
    id: 'guild-hall',
    name: 'Guild Hall',
    description: 'Unlocks guild features and bonuses',
    category: 'special',
    icon: <Building className="w-5 h-5" />,
    cost: { credits: 1000, materials: 200, time: 60 },
    unlockRequirement: 'Join a guild',
    isUnlocked: false,
    maxCount: 1,
  },
];

interface BuildingSystemProps {
  placedBuildings?: PlacedBuilding[];
  onBuild?: (building: Building, hexX: number, hexY: number) => void;
  onCollect?: (placedBuilding: PlacedBuilding) => void;
  playerResources?: { credits: number; materials: number };
}

export function BuildingSystem({
  placedBuildings = [],
  onBuild,
  onCollect,
  playerResources = { credits: 500, materials: 50 },
}: BuildingSystemProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const canAfford = (building: Building) => {
    return (
      playerResources.credits >= building.cost.credits &&
      playerResources.materials >= building.cost.materials
    );
  };

  const getBuildingCount = (buildingId: string) => {
    return placedBuildings.filter(pb => pb.buildingId === buildingId).length;
  };

  const handleBuild = (building: Building) => {
    if (!canAfford(building)) {
      toast.error('Insufficient resources');
      return;
    }

    const count = getBuildingCount(building.id);
    if (count >= building.maxCount) {
      toast.error(`Maximum ${building.maxCount} ${building.name}(s) allowed`);
      return;
    }

    // In real implementation, would select hex from map
    toast.success(`Started building ${building.name}. Time: ${building.cost.time} minutes`);
    
    if (onBuild) {
      onBuild(building, 0, 0); // Would use actual hex coords
    }
  };

  const filteredBuildings = BUILDINGS.filter(b => 
    selectedCategory === 'all' || b.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Resources Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Resources</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <Coins className="w-4 h-4 text-yellow-500" />
                {playerResources.credits}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4 text-gray-500" />
                {playerResources.materials}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Categories */}
      <Tabs defaultValue="all" onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="residential">🏠 Housing</TabsTrigger>
          <TabsTrigger value="production">🏭 Production</TabsTrigger>
          <TabsTrigger value="commerce">🏪 Commerce</TabsTrigger>
          <TabsTrigger value="special">⭐ Special</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredBuildings.map(building => {
              const count = getBuildingCount(building.id);
              const affordable = canAfford(building);
              const atMax = count >= building.maxCount;

              return (
                <Card 
                  key={building.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    !building.isUnlocked ? 'opacity-50' : ''
                  } ${selectedBuilding?.id === building.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => building.isUnlocked && setSelectedBuilding(building)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {building.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{building.name}</h4>
                          <Badge variant={building.isUnlocked ? 'outline' : 'secondary'}>
                            {count}/{building.maxCount}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {building.description}
                        </p>
                        
                        {/* Cost */}
                        <div className="flex gap-3 mt-2 text-sm">
                          <span className={`flex items-center gap-1 ${
                            playerResources.credits >= building.cost.credits 
                              ? 'text-green-500' : 'text-red-500'
                          }`}>
                            <Coins className="w-3 h-3" />
                            {building.cost.credits}
                          </span>
                          <span className={`flex items-center gap-1 ${
                            playerResources.materials >= building.cost.materials 
                              ? 'text-green-500' : 'text-red-500'
                          }`}>
                            <Package className="w-3 h-3" />
                            {building.cost.materials}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {building.cost.time}m
                          </span>
                        </div>

                        {/* Production */}
                        {building.produces && (
                          <div className="mt-2 text-sm text-blue-500">
                            Produces: {building.produces.amount} {building.produces.resource}/hr
                          </div>
                        )}

                        {!building.isUnlocked && (
                          <div className="mt-2 text-sm text-orange-500">
                            🔒 {building.unlockRequirement}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Build Action */}
      {selectedBuilding && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="w-5 h-5" />
              Build {selectedBuilding.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedBuilding.description}</p>
              
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Credits Required</span>
                  <span className={canAfford(selectedBuilding) ? 'text-green-500' : 'text-red-500'}>
                    {selectedBuilding.cost.credits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Materials Required</span>
                  <span className={playerResources.materials >= selectedBuilding.cost.materials ? 'text-green-500' : 'text-red-500'}>
                    {selectedBuilding.cost.materials}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Build Time</span>
                  <span>{selectedBuilding.cost.time} minutes</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleBuild(selectedBuilding)}
                disabled={!canAfford(selectedBuilding) || getBuildingCount(selectedBuilding.id) >= selectedBuilding.maxCount}
              >
                {canAfford(selectedBuilding) ? (
                  <>
                    <Hammer className="w-4 h-4 mr-2" />
                    Start Construction
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Insufficient Resources
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Placed Buildings */}
      {placedBuildings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Buildings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {placedBuildings.map(pb => {
                const building = BUILDINGS.find(b => b.id === pb.buildingId);
                if (!building) return null;

                return (
                  <div 
                    key={pb.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {building.icon}
                      <div>
                        <p className="font-medium">{building.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Hex ({pb.hexX}, {pb.hexY})
                        </p>
                      </div>
                    </div>
                    
                    {pb.isComplete ? (
                      building.produces ? (
                        <Button size="sm" onClick={() => onCollect?.(pb)}>
                          Collect
                        </Button>
                      ) : (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Active
                        </Badge>
                      )
                    ) : (
                      <div className="w-32">
                        <Progress value={pb.constructionProgress} />
                        <p className="text-xs text-center mt-1">
                          {pb.constructionProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}










