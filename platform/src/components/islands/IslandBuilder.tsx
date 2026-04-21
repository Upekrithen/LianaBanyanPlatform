import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Package, Save, Undo, Grid3x3 } from "lucide-react";
import { IslandAssetPalette } from "./IslandAssetPalette";
import { IslandHexGrid } from "./IslandHexGrid";

interface Building {
  id?: string;
  asset_id?: string;
  building_type: string;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation: number;
  scale: number;
  hex_q?: number;
  hex_r?: number;
  hex_s?: number;
}

export const IslandBuilder = () => {
  const { id: islandId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isPlacingMode, setIsPlacingMode] = useState(false);

  const { data: island } = useQuery({
    queryKey: ["island", islandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_islands")
        .select("*")
        .eq("id", islandId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!islandId
  });

  const { data: existingBuildings } = useQuery({
    queryKey: ["island-buildings", islandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("island_buildings" as any)
        .select("*")
        .eq("island_id", islandId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!islandId
  });

  const { data: islandSize } = useQuery({
    queryKey: ["island-size", (island as any)?.island_size],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("island_sizes" as any)
        .select("*")
        .eq("size_name", (island as any)?.island_size || "medium")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!(island as any)?.island_size
  });

  useEffect(() => {
    if (existingBuildings && Array.isArray(existingBuildings)) {
      setBuildings(existingBuildings as any);
    }
  }, [existingBuildings]);

  const saveBuildingsMutation = useMutation({
    mutationFn: async (buildingsToSave: Building[]) => {
      if (!islandId) throw new Error("No island ID");

      // Delete existing buildings
      await supabase
        .from("island_buildings" as any)
        .delete()
        .eq("island_id", islandId);

      // Insert new buildings
      const { error } = await supabase
        .from("island_buildings" as any)
        .insert(
          buildingsToSave.map(b => ({
            island_id: islandId,
            asset_id: b.asset_id,
            building_type: b.building_type,
            position_x: b.position_x,
            position_y: b.position_y,
            position_z: b.position_z,
            rotation: b.rotation,
            scale: b.scale,
            hex_q: b.hex_q,
            hex_r: b.hex_r,
            hex_s: b.hex_s
          }))
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["island-buildings"] });
      toast({ title: "Island saved!", description: "Your layout has been saved." });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handlePlaceBuilding = (hexCoords: { q: number; r: number; s: number }) => {
    if (!selectedAsset) return;

    const newBuilding: Building = {
      asset_id: selectedAsset.id,
      building_type: selectedAsset.asset_type || "decoration",
      position_x: hexCoords.q,
      position_y: hexCoords.r,
      position_z: 0,
      rotation: 0,
      scale: 1.0,
      hex_q: hexCoords.q,
      hex_r: hexCoords.r,
      hex_s: hexCoords.s
    };

    setBuildings([...buildings, newBuilding]);
    setIsPlacingMode(false);
  };

  const handleRemoveBuilding = (index: number) => {
    setBuildings(buildings.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    saveBuildingsMutation.mutate(buildings);
  };

  const handleUndo = () => {
    if (buildings.length > 0) {
      setBuildings(buildings.slice(0, -1));
    }
  };

  if (!island) {
    return <div>Loading island...</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Home className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Island Builder</h1>
            <p className="text-muted-foreground">{island.island_name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUndo} disabled={buildings.length === 0}>
            <Undo className="mr-2 h-4 w-4" />
            Undo
          </Button>
          <Button onClick={handleSave} disabled={saveBuildingsMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Save Island
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                Island Layout ({(islandSize as any)?.hex_count || 0} hexes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IslandHexGrid
                hexPattern={(islandSize as any)?.layout_pattern?.hexes || []}
                buildings={buildings}
                onPlaceBuilding={handlePlaceBuilding}
                onRemoveBuilding={handleRemoveBuilding}
                isPlacingMode={isPlacingMode}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Asset Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IslandAssetPalette
                selectedAsset={selectedAsset}
                onSelectAsset={(asset) => {
                  setSelectedAsset(asset);
                  setIsPlacingMode(true);
                }}
              />
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Building Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buildings:</span>
                <span className="font-semibold">{buildings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Spaces:</span>
                <span className="font-semibold">{(islandSize as any)?.hex_count || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
