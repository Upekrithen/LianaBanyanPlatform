import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Island, Map, Anchor, Compass, Ship, TreePine,
  Users, Shield, Lock, Unlock, Portal, Link2,
  Sprout, Trees, Flower2, Crown, Star, Heart,
  MessageSquare, Settings, Globe, Activity, TrendingUp,
  Award, Flag, Coins, Gem, Sparkles, Waves
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

/**
 * Island Management System
 * From documented vision - core feature for community governance
 * 
 * Islands are self-governing communities within Liana Banyan
 * Each island has its own charter, rules, and portal connections
 */

interface IslandData {
  id: string;
  name: string;
  description: string;
  owner: string;
  created: Date;
  charter: {
    rules: string[];
    values: string[];
    governance: 'democratic' | 'council' | 'owner' | 'consensus';
    membershipType: 'open' | 'application' | 'invite' | 'paid';
    membershipFee?: number;
  };
  stats: {
    members: number;
    activeProjects: number;
    totalCredits: number;
    reputation: number;
    seedsPlanted: number;
    portalConnections: number;
  };
  theme: {
    primaryColor: string;
    icon: string;
    terrain: 'tropical' | 'forest' | 'desert' | 'arctic' | 'mountain' | 'floating';
  };
  portals: Array<{
    id: string;
    connectedIsland: string;
    status: 'active' | 'pending' | 'closed';
    traffic: number;
  }>;
  seeds: Array<{
    id: string;
    type: 'oak' | 'pine' | 'palm' | 'cherry' | 'willow';
    plantedBy: string;
    plantedDate: Date;
    growthStage: number; // 0-100
    fruit: number;
  }>;
  roles: Array<{
    userId: string;
    role: 'owner' | 'enforcer' | 'builder' | 'member';
    joinedDate: Date;
  }>;
  treasury: {
    balance: number;
    monthlyRevenue: number;
    expenses: number;
  };
}

export function IslandManagementSystem() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedIsland, setSelectedIsland] = useState<IslandData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample islands for demonstration
  const [islands] = useState<IslandData[]>([
    {
      id: 'ISLAND-001',
      name: 'HexIsle Builders',
      description: 'Dedicated to the development and innovation of the HexIsle hydraulic gaming system',
      owner: 'Tereno Mróz',
      created: new Date('2024-01-15'),
      charter: {
        rules: [
          'All innovations must be documented',
          'Patent applications require community vote',
          'Manufacturing decisions are consensus-based',
          'Weekly progress updates required'
        ],
        values: ['Innovation', 'Collaboration', 'Transparency', 'Excellence'],
        governance: 'consensus',
        membershipType: 'application',
        membershipFee: 0
      },
      stats: {
        members: 47,
        activeProjects: 3,
        totalCredits: 125000,
        reputation: 95,
        seedsPlanted: 234,
        portalConnections: 5
      },
      theme: {
        primaryColor: '#3B82F6',
        icon: '🏗️',
        terrain: 'mountain'
      },
      portals: [
        { id: 'P-001', connectedIsland: '2ndSecond Network', status: 'active', traffic: 892 },
        { id: 'P-002', connectedIsland: 'Patent Protectors', status: 'active', traffic: 456 }
      ],
      seeds: [
        {
          id: 'SEED-001',
          type: 'oak',
          plantedBy: 'Alice',
          plantedDate: new Date('2024-03-01'),
          growthStage: 75,
          fruit: 12
        },
        {
          id: 'SEED-002',
          type: 'pine',
          plantedBy: 'Bob',
          plantedDate: new Date('2024-04-15'),
          growthStage: 45,
          fruit: 5
        }
      ],
      roles: [
        { userId: 'user-001', role: 'owner', joinedDate: new Date('2024-01-15') },
        { userId: 'user-002', role: 'enforcer', joinedDate: new Date('2024-01-20') },
        { userId: 'user-003', role: 'builder', joinedDate: new Date('2024-02-01') }
      ],
      treasury: {
        balance: 45000,
        monthlyRevenue: 8500,
        expenses: 3200
      }
    },
    {
      id: 'ISLAND-002',
      name: '2ndSecond Network',
      description: 'Decentralized manufacturing and production coordination hub',
      owner: 'Manufacturing Guild',
      created: new Date('2024-02-01'),
      charter: {
        rules: [
          'Quality standards must be maintained',
          'Fair pricing for all members',
          'Environmental sustainability required',
          'Dispute resolution through arbitration'
        ],
        values: ['Quality', 'Fairness', 'Sustainability', 'Innovation'],
        governance: 'council',
        membershipType: 'paid',
        membershipFee: 100
      },
      stats: {
        members: 127,
        activeProjects: 12,
        totalCredits: 450000,
        reputation: 88,
        seedsPlanted: 567,
        portalConnections: 12
      },
      theme: {
        primaryColor: '#10B981',
        icon: '⚙️',
        terrain: 'forest'
      },
      portals: [
        { id: 'P-003', connectedIsland: 'HexIsle Builders', status: 'active', traffic: 892 },
        { id: 'P-004', connectedIsland: 'Supply Chain Central', status: 'active', traffic: 1234 },
        { id: 'P-005', connectedIsland: 'Green Manufacturing', status: 'pending', traffic: 0 }
      ],
      seeds: [
        {
          id: 'SEED-003',
          type: 'palm',
          plantedBy: 'Charlie',
          plantedDate: new Date('2024-02-15'),
          growthStage: 90,
          fruit: 25
        }
      ],
      roles: [
        { userId: 'user-004', role: 'owner', joinedDate: new Date('2024-02-01') },
        { userId: 'user-005', role: 'enforcer', joinedDate: new Date('2024-02-05') }
      ],
      treasury: {
        balance: 125000,
        monthlyRevenue: 22000,
        expenses: 8500
      }
    },
    {
      id: 'ISLAND-003',
      name: "Let's Make Dinner Community",
      description: 'Meal sharing and community kitchen coordination',
      owner: 'Community Kitchen',
      created: new Date('2024-03-15'),
      charter: {
        rules: [
          'Food safety standards mandatory',
          'Share recipes freely',
          'Help neighbors in need',
          'Celebrate diversity in cuisine'
        ],
        values: ['Community', 'Sharing', 'Health', 'Diversity'],
        governance: 'democratic',
        membershipType: 'open'
      },
      stats: {
        members: 89,
        activeProjects: 5,
        totalCredits: 35000,
        reputation: 92,
        seedsPlanted: 123,
        portalConnections: 3
      },
      theme: {
        primaryColor: '#F59E0B',
        icon: '🍽️',
        terrain: 'tropical'
      },
      portals: [
        { id: 'P-006', connectedIsland: 'Local Farmers', status: 'active', traffic: 567 }
      ],
      seeds: [
        {
          id: 'SEED-004',
          type: 'cherry',
          plantedBy: 'Diana',
          plantedDate: new Date('2024-04-01'),
          growthStage: 60,
          fruit: 8
        }
      ],
      roles: [
        { userId: 'user-006', role: 'owner', joinedDate: new Date('2024-03-15') }
      ],
      treasury: {
        balance: 12000,
        monthlyRevenue: 3500,
        expenses: 1200
      }
    }
  ]);

  const handleCreateIsland = () => {
    setShowCreateModal(true);
    toast.success('Island Creation Started', {
      description: 'Design your community and set your charter'
    });
  };

  const handlePlantSeed = (island: IslandData) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#84cc16', '#22c55e']
    });
    
    toast.success('Seed Planted!', {
      description: `Your seed will grow and contribute to ${island.name}'s ecosystem`
    });
  };

  const handleCreatePortal = (fromIsland: IslandData, toIsland: string) => {
    toast.success('Portal Connection Requested', {
      description: `Awaiting approval from ${toIsland}`
    });
  };

  const getTerrainIcon = (terrain: string) => {
    switch(terrain) {
      case 'tropical': return '🏝️';
      case 'forest': return '🌲';
      case 'desert': return '🏜️';
      case 'arctic': return '❄️';
      case 'mountain': return '⛰️';
      case 'floating': return '☁️';
      default: return '🏝️';
    }
  };

  const getSeedIcon = (type: string, stage: number) => {
    if (stage < 25) return '🌱';
    if (stage < 50) return '🌿';
    if (stage < 75) return '🌳';
    return type === 'cherry' ? '🌸' : '🌲';
  };

  // Calculate island health score
  const getIslandHealth = (island: IslandData) => {
    const factors = [
      island.stats.reputation / 100,
      Math.min(island.stats.members / 100, 1),
      Math.min(island.stats.seedsPlanted / 500, 1),
      Math.min(island.stats.portalConnections / 10, 1),
      island.treasury.balance > 0 ? 1 : 0
    ];
    return Math.round((factors.reduce((a, b) => a + b, 0) / factors.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Island className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Island Management System</CardTitle>
                <CardDescription>
                  Self-governing communities within the Liana Banyan ecosystem
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleCreateIsland} className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <Island className="h-4 w-4 mr-2" />
              Create Island
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Island Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Islands</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{islands.length}</div>
            <p className="text-xs text-muted-foreground">Active communities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {islands.reduce((sum, i) => sum + i.stats.members, 0)}
            </div>
            <p className="text-xs text-green-600">+23% this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Seeds Planted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {islands.reduce((sum, i) => sum + i.stats.seedsPlanted, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Growing ecosystem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portal Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {islands.reduce((sum, i) => sum + i.portals.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="islands">Islands</TabsTrigger>
          <TabsTrigger value="portals">Portals</TabsTrigger>
          <TabsTrigger value="seeds">Seeds</TabsTrigger>
          <TabsTrigger value="charter">Charters</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {islands.map(island => {
              const health = getIslandHealth(island);
              return (
                <Card 
                  key={island.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedIsland(island)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{island.theme.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{island.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {getTerrainIcon(island.theme.terrain)} {island.theme.terrain}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        className={cn(
                          health > 80 ? "bg-green-100 text-green-700" :
                          health > 60 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}
                      >
                        {health}% Health
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {island.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-medium">{island.stats.members}</p>
                        <p className="text-muted-foreground">Members</p>
                      </div>
                      <div className="text-center">
                        <Sprout className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-medium">{island.stats.seedsPlanted}</p>
                        <p className="text-muted-foreground">Seeds</p>
                      </div>
                      <div className="text-center">
                        <Portal className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="font-medium">{island.portals.length}</p>
                        <p className="text-muted-foreground">Portals</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlantSeed(island);
                        }}
                      >
                        <Sprout className="h-3 w-3 mr-1" />
                        Plant
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIsland(island);
                        }}
                      >
                        <Ship className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Islands Tab */}
        <TabsContent value="islands" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Island Directory</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search islands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button variant="outline">
                    <Map className="h-4 w-4 mr-2" />
                    View Map
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {islands.filter(island => 
                  island.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  island.description.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(island => (
                  <div key={island.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{island.theme.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-lg">{island.name}</p>
                            <Badge variant="outline">{island.charter.governance}</Badge>
                            <Badge variant="outline">{island.charter.membershipType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {island.description}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{island.stats.members} members</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span>{island.stats.activeProjects} projects</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{island.stats.reputation}/100</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-muted-foreground" />
                              <span>{island.stats.totalCredits.toLocaleString()} credits</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-2">
                          Owner: {island.owner}
                        </p>
                        <Button>
                          Join Island
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portals Tab */}
        <TabsContent value="portals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Portal Network</CardTitle>
                <Button onClick={() => handleCreatePortal(islands[0], 'New Island')}>
                  <Portal className="h-4 w-4 mr-2" />
                  Create Portal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {islands.flatMap(island => 
                  island.portals.map(portal => ({
                    ...portal,
                    fromIsland: island.name,
                    fromIcon: island.theme.icon
                  }))
                ).map((portal, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{portal.fromIcon}</span>
                        <span className="font-medium">{portal.fromIsland}</span>
                      </div>
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{portal.connectedIsland}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{portal.traffic}</p>
                        <p className="text-xs text-muted-foreground">travelers</p>
                      </div>
                      <Badge className={cn(
                        portal.status === 'active' ? "bg-green-100 text-green-700" :
                        portal.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {portal.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Portal className="h-4 w-4" />
            <AlertTitle>Portal Connections</AlertTitle>
            <AlertDescription>
              Portals allow seamless travel and resource sharing between islands. 
              Both islands must approve a portal connection.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Seeds Tab */}
        <TabsContent value="seeds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seed Growth System</CardTitle>
              <CardDescription>Plant seeds to contribute to island ecosystems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {islands.flatMap(island => 
                  island.seeds.map(seed => ({
                    ...seed,
                    islandName: island.name,
                    islandIcon: island.theme.icon
                  }))
                ).map(seed => (
                  <Card key={seed.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getSeedIcon(seed.type, seed.growthStage)}</span>
                          <div>
                            <p className="font-medium capitalize">{seed.type} Tree</p>
                            <p className="text-xs text-muted-foreground">
                              {seed.islandIcon} {seed.islandName}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {seed.fruit} fruit
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Growth Progress</span>
                            <span>{seed.growthStage}%</span>
                          </div>
                          <Progress value={seed.growthStage} />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{seed.plantedBy}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {seed.plantedDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert className="border-green-200 bg-green-50">
            <Sprout className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Growing Together</AlertTitle>
            <AlertDescription className="text-green-700">
              Seeds represent contributions to island communities. As they grow, they produce 
              fruit that can be harvested for credits and reputation.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Charter Tab */}
        <TabsContent value="charter" className="space-y-4">
          {selectedIsland ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedIsland.theme.icon}</span>
                  <CardTitle>{selectedIsland.name} Charter</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Community Rules</h3>
                  <div className="space-y-2">
                    {selectedIsland.charter.rules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm">{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Core Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIsland.charter.values.map((value, index) => (
                      <Badge key={index} variant="secondary">
                        <Heart className="h-3 w-3 mr-1" />
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Governance Model</Label>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedIsland.charter.governance}
                    </p>
                  </div>
                  <div>
                    <Label>Membership Type</Label>
                    <p className="text-sm text-muted-foreground capitalize">
                      {selectedIsland.charter.membershipType}
                      {selectedIsland.charter.membershipFee && 
                        ` ($${selectedIsland.charter.membershipFee})`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Island className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select an island to view its charter</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Governance Tab */}
        <TabsContent value="governance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Island Governance</CardTitle>
              <CardDescription>Decision-making and role management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {islands.map(island => (
                  <div key={island.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{island.theme.icon}</span>
                        <p className="font-medium">{island.name}</p>
                      </div>
                      <Badge>{island.charter.governance}</Badge>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Owner</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Crown className="h-4 w-4 text-yellow-500" />
                          <p className="font-medium">{island.owner}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Enforcers</p>
                        <p className="font-medium">
                          {island.roles.filter(r => r.role === 'enforcer').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Builders</p>
                        <p className="font-medium">
                          {island.roles.filter(r => r.role === 'builder').length}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Treasury Balance</p>
                          <p className="text-lg font-bold">
                            ${island.treasury.balance.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600">
                            +${island.treasury.monthlyRevenue.toLocaleString()}/mo
                          </p>
                          <p className="text-sm text-red-600">
                            -${island.treasury.expenses.toLocaleString()}/mo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
