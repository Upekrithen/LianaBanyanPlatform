import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, TrendingUp, Users, Plus, Settings } from "lucide-react";
import { format } from "date-fns";

interface ProductionWaveManagerProps {
  productId: string;
  productionLevelId: string;
}

export const ProductionWaveManager = ({ 
  productId, 
  productionLevelId 
}: ProductionWaveManagerProps) => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newWave, setNewWave] = useState({
    wave_number: 1,
    wave_name: "",
    base_price_multiplier: 1.5, // Wave 1 starts at 1.5x
    max_units_per_node: 15000,
    total_nodes: 1,
    surge_enabled: false,
    surge_threshold: 0.7, // Trigger surge at 70% capacity
    surge_multiplier: 1.5, // Additional 50% on top of base
  });

  // Fetch existing waves
  const { data: waves, isLoading } = useQuery({
    queryKey: ['production-waves', productId, productionLevelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_waves')
        .select('*')
        .eq('product_id', productId)
        .eq('production_level_id', productionLevelId)
        .order('wave_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch nodes
  const { data: nodes } = useQuery({
    queryKey: ['production-nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_nodes')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch premium funds
  const { data: premiumFunds } = useQuery({
    queryKey: ['wave-premium-funds', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wave_premium_funds')
        .select('*')
        .eq('product_id', productId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  // Create wave mutation
  const createWaveMutation = useMutation({
    mutationFn: async () => {
      const totalCapacity = newWave.max_units_per_node * newWave.total_nodes;
      
      // Calculate decreasing price multiplier: Wave 1 = 1.5x, Wave 2 = 1.3x, Wave 3 = 1.2x, Wave 4+ = 1.0x - (0.05 * (wave - 4))
      let calculatedMultiplier = newWave.base_price_multiplier;
      if (newWave.wave_number === 2) calculatedMultiplier = 1.3;
      else if (newWave.wave_number === 3) calculatedMultiplier = 1.2;
      else if (newWave.wave_number >= 4) calculatedMultiplier = Math.max(0.7, 1.0 - (0.05 * (newWave.wave_number - 4)));
      
      const { data, error } = await supabase
        .from('production_waves')
        .insert({
          product_id: productId,
          production_level_id: productionLevelId,
          wave_number: newWave.wave_number,
          wave_name: newWave.wave_name || `Wave ${newWave.wave_number}`,
          max_units_per_node: newWave.max_units_per_node,
          total_wave_capacity: totalCapacity,
          base_price_multiplier: calculatedMultiplier,
          surge_enabled: newWave.surge_enabled,
          surge_threshold: newWave.surge_threshold,
          surge_multiplier: newWave.surge_multiplier,
          status: 'planning',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Wave created successfully");
      queryClient.invalidateQueries({ queryKey: ['production-waves'] });
      setIsCreating(false);
      setNewWave({
        wave_number: (waves?.length || 0) + 2,
        wave_name: "",
        base_price_multiplier: 1.5,
        max_units_per_node: 15000,
        total_nodes: 1,
        surge_enabled: false,
        surge_threshold: 0.7,
        surge_multiplier: 1.5,
      });
    },
    onError: (error) => {
      toast.error("Failed to create wave: " + error.message);
    },
  });

  if (isLoading) {
    return <div>Loading waves...</div>;
  }

  const totalNodes = nodes?.length || 0;
  const activeNodes = nodes?.filter(n => n.is_active).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Production Wave Management</CardTitle>
              <CardDescription>
                Manage wave-based production scheduling and pricing
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Wave
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="waves" className="space-y-4">
        <TabsList>
          <TabsTrigger value="waves">Waves</TabsTrigger>
          <TabsTrigger value="nodes">Nodes</TabsTrigger>
          <TabsTrigger value="funding">Premium Funds</TabsTrigger>
        </TabsList>

        {/* Waves Tab */}
        <TabsContent value="waves" className="space-y-4">
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Wave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Wave Number</Label>
                    <Input
                      type="number"
                      value={newWave.wave_number}
                      onChange={(e) => setNewWave({ ...newWave, wave_number: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Wave Name (Optional)</Label>
                    <Input
                      value={newWave.wave_name}
                      onChange={(e) => setNewWave({ ...newWave, wave_name: e.target.value })}
                      placeholder="e.g., Early Bird"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price Multiplier (Auto-calculated)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newWave.base_price_multiplier}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Wave 1: 1.5x, Wave 2: 1.3x, Wave 3: 1.2x, Wave 4+: decreases 0.05 per wave
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newWave.surge_enabled}
                        onChange={(e) => setNewWave({ ...newWave, surge_enabled: e.target.checked })}
                      />
                      Enable Surge Pricing (Waves 1-3)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Activates when demand exceeds threshold
                    </p>
                  </div>
                  {newWave.surge_enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Surge Threshold (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          max="1"
                          min="0"
                          value={newWave.surge_threshold}
                          onChange={(e) => setNewWave({ ...newWave, surge_threshold: parseFloat(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Trigger surge when this % of capacity is reserved
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Surge Multiplier</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newWave.surge_multiplier}
                          onChange={(e) => setNewWave({ ...newWave, surge_multiplier: parseFloat(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Additional multiplier on top of base (1.5 = +50%)
                        </p>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label>Max Units per Node</Label>
                    <Input
                      type="number"
                      value={newWave.max_units_per_node}
                      onChange={(e) => setNewWave({ ...newWave, max_units_per_node: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Nodes</Label>
                    <Input
                      type="number"
                      value={newWave.total_nodes}
                      onChange={(e) => setNewWave({ ...newWave, total_nodes: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Wave Capacity</Label>
                    <Input
                      value={(newWave.max_units_per_node * newWave.total_nodes).toLocaleString()}
                      disabled
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => createWaveMutation.mutate()}>
                    Create Wave
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {waves?.map((wave) => (
            <Card key={wave.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Wave {wave.wave_number}: {wave.wave_name}</CardTitle>
                    <CardDescription>
                      Capacity: {wave.units_allocated.toLocaleString()} / {wave.total_wave_capacity.toLocaleString()} units
                    </CardDescription>
                  </div>
                  <Badge>{wave.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Price Multiplier</p>
                      <p className="text-2xl font-bold">{wave.base_price_multiplier}x</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">FCFS Slots</p>
                      <p className="text-2xl font-bold">{wave.units_reserved_fcfs}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Max per Node</p>
                      <p className="text-2xl font-bold">{wave.max_units_per_node.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Dormant Capacity Display */}
                {wave.has_dormant_capacity && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          🎯 50K Tier Reached
                        </Badge>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          Reserve Capacity Unlocked
                        </span>
                      </div>
                      {wave.dormant_activated && (
                        <Badge variant="destructive">Currently Active</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Reserve Days Available:</p>
                        <p className="font-bold text-lg">{wave.dormant_days || 0} days</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Purpose:</p>
                        <p className="font-medium">Emergency surge protection</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This reserve capacity is rarely needed but provides additional buffer for exceptional demand spikes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Nodes Tab */}
        <TabsContent value="nodes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Nodes</CardTitle>
              <CardDescription>
                {activeNodes} of {totalNodes} nodes active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {nodes?.map((node) => (
                  <div key={node.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{node.node_name}</p>
                      <p className="text-sm text-muted-foreground">{node.node_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{node.current_wave_allocation.toLocaleString()} / {node.max_capacity_per_wave.toLocaleString()}</p>
                      {node.created_from_premium_funds && (
                        <Badge variant="secondary" className="mt-1">Premium Funded</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Premium Funds Tab */}
        <TabsContent value="funding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Premium Fund Pool</CardTitle>
              <CardDescription>
                Revenue from early wave premiums used to expand production capacity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-2xl font-bold">${premiumFunds?.total_premium_collected.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allocated to Nodes</p>
                  <p className="text-2xl font-bold">${premiumFunds?.allocated_to_nodes.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-primary">${premiumFunds?.available_for_expansion.toLocaleString() || '0'}</p>
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="font-medium">Nodes Funded: {premiumFunds?.nodes_funded_count || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Premium revenue enables expansion of production capacity to handle future waves
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
