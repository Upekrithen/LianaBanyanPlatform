import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sprout, Store, Building, Compass, Package } from "lucide-react";

interface ProjectSeedPlanterProps {
  islandId: string;
  canPlant: boolean;
}

export default function ProjectSeedPlanter({ islandId, canPlant }: ProjectSeedPlanterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [plantLocation, setPlantLocation] = useState({ x: 0, y: 0, district: "main" });

  // Fetch available seeds
  const { data: seeds } = useQuery({
    queryKey: ['island-seeds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('island_seeds')
        .select('*, projects(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch planted seeds on this island
  const { data: plantedSeeds } = useQuery({
    queryKey: ['planted-seeds', islandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planted_seeds')
        .select(`
          *,
          island_seeds(
            seed_name,
            seed_type,
            projects(name)
          )
        `)
        .eq('island_id', islandId);
      
      if (error) throw error;
      return data;
    }
  });

  const plantSeedMutation = useMutation({
    mutationFn: async ({ seedId, location }: { seedId: string; location: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('planted_seeds')
        .insert({
          seed_id: seedId,
          island_id: islandId,
          planted_by: user.id,
          location_on_island: location,
          current_stage: 'seed',
          growth_progress: 0
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planted-seeds', islandId] });
      toast({
        title: "Seed Planted!",
        description: "Your project seed has been planted and will begin growing",
      });
      setSelectedSeed(null);
    },
    onError: (error: any) => {
      toast({
        title: "Planting Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handlePlantSeed = () => {
    if (!selectedSeed) return;
    plantSeedMutation.mutate({
      seedId: selectedSeed,
      location: plantLocation
    });
  };

  const getSeedIcon = (type: string) => {
    switch (type) {
      case 'shop': return <Store className="h-4 w-4" />;
      case 'embassy': return <Building className="h-4 w-4" />;
      case 'side_quest': return <Compass className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getGrowthStageColor = (stage: string) => {
    switch (stage) {
      case 'seed': return 'bg-gray-500';
      case 'sprout': return 'bg-green-500';
      case 'growing': return 'bg-blue-500';
      case 'mature': return 'bg-purple-500';
      case 'flourishing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold">Project Seed Planter</h2>
            <p className="text-sm text-muted-foreground">
              Plant mini project modules as seeds that grow into embassies
            </p>
          </div>
        </div>

        {canPlant ? (
          <div className="space-y-4">
            <div>
              <Label>Select Seed to Plant</Label>
              <Select value={selectedSeed || ""} onValueChange={setSelectedSeed}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project seed" />
                </SelectTrigger>
                <SelectContent>
                  {seeds?.map((seed) => (
                    <SelectItem key={seed.id} value={seed.id}>
                      <div className="flex items-center gap-2">
                        {getSeedIcon(seed.seed_type)}
                        <span>{seed.seed_name}</span>
                        <Badge variant="outline">{seed.seed_type}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>X Position</Label>
                <Input
                  type="number"
                  value={plantLocation.x}
                  onChange={(e) => setPlantLocation(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Y Position</Label>
                <Input
                  type="number"
                  value={plantLocation.y}
                  onChange={(e) => setPlantLocation(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>District</Label>
                <Select
                  value={plantLocation.district}
                  onValueChange={(value) => setPlantLocation(prev => ({ ...prev, district: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Main Square</SelectItem>
                    <SelectItem value="commercial">Commercial District</SelectItem>
                    <SelectItem value="residential">Residential Area</SelectItem>
                    <SelectItem value="industrial">Industrial Zone</SelectItem>
                    <SelectItem value="cultural">Cultural Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handlePlantSeed}
              disabled={!selectedSeed || plantSeedMutation.isPending}
              className="w-full"
            >
              {plantSeedMutation.isPending ? "Planting..." : "Plant Seed"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You don't have permission to plant seeds on this island
          </p>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Planted Seeds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plantedSeeds?.map((planted) => (
            <Card key={planted.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSeedIcon(planted.island_seeds.seed_type)}
                  <div>
                    <h4 className="font-semibold">{planted.island_seeds.seed_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {planted.island_seeds.projects?.name}
                    </p>
                  </div>
                </div>
                <Badge className={getGrowthStageColor(planted.current_stage)}>
                  {planted.current_stage}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${planted.growth_progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Growth: {planted.growth_progress}%</span>
                  <span>{planted.visitor_count} visitors</span>
                </div>
              </div>
            </Card>
          ))}
          {(!plantedSeeds || plantedSeeds.length === 0) && (
            <p className="text-sm text-muted-foreground col-span-2">
              No seeds planted yet
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}