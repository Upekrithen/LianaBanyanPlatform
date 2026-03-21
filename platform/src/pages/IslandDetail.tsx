import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Home, Briefcase, Download, Image as ImageIcon, Box } from "lucide-react";
import { IslandMarketplaceListings } from "@/components/islands/IslandMarketplaceListings";
import { CreateIslandListing } from "@/components/islands/CreateIslandListing";
import { IslandPricingCard } from "@/components/islands/IslandPricingCard";
import { IslandAssignmentDialog } from "@/components/islands/IslandAssignmentDialog";
import { Island3DPreview } from "@/components/islands/Island3DPreview";
// import { useIslandExport } from "@/hooks/useIslandExport";
const useIslandExport = () => ({
  isExporting: false,
  // INFRASTRUCTURE NOTE: This needs real screenshot export using html2canvas or similar
  exportIslandScreenshot: (id: string) => {},
  // INFRASTRUCTURE NOTE: This needs real 3D model export (GLTF/OBJ) via Three.js exporter
  exportIslandAs3DModel: (id: string, format: string) => {}
});
import { useState } from "react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// Import island images (mocking with placeholders if missing)
// We will use a fallback system if the asset doesn't exist
// Import island images (mocking with placeholders if missing)
// We will use a fallback system if the asset doesn't exist
const getIslandImage = (islandName: string) => {
  const name = islandName.toLowerCase();
  // We'll use a placeholder service instead of local assets to avoid build errors
  // if the images aren't present in the assets folder
  if (name.includes("harvest") || name.includes("starter")) return "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";
  if (name.includes("navigate") || name.includes("forest")) return "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80";
  if (name.includes("engineer") || name.includes("hexisle")) return "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80";
  if (name.includes("battle") || name.includes("mountain")) return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80";
  if (name.includes("seek") || name.includes("tech")) return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80";
  if (name.includes("magic") || name.includes("crystal")) return "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80";
  if (name.includes("sky") || name.includes("treasure")) return "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80";
  return "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80";
};

const IslandDetail = () => {
  const { id } = useParams();
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const { isExporting, exportIslandScreenshot, exportIslandAs3DModel } = useIslandExport();

  const { data: island, isLoading } = useQuery({
    queryKey: ["island", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_islands")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch latest exposure metrics for pricing
  const { data: metrics } = useQuery({
    queryKey: ["island-metrics", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("island_exposure_metrics")
        .select("*")
        .eq("island_id", id)
        .order("metric_date", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <PortalPageLayout>
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!island) {
    return (
      <div className="container mx-auto p-8">
        <Card className="p-8">
          <h1 className="text-2xl font-bold">Island not found</h1>
        </Card>
      </div>
    );
  }

  const mapData = island.island_map_data as { full_image?: string, buildings?: any[] } | null;
  const themeConfig = island.theme_config as { color_palette?: string[] } | null;
  const generatedImage = getIslandImage(island.island_name || "");
  const displayImage = mapData?.full_image || generatedImage;

  // Prepare 3D preview data
  const island3DData = {
    buildings: mapData?.buildings || [],
    terrain: {
      shape: 'hexagon' as const,
      size: 10,
    }
  };

  const handleExportScreenshot = () => {
    if (id) {
      exportIslandScreenshot(id);
    }
  };

  const handleExport3D = (format: 'obj' | 'gltf') => {
    if (id) {
      exportIslandAs3DModel(id, format);
    }
  };

  return (
    <div className="container mx-auto p-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-4">
        <Link to="/world-map">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to World Map
          </Button>
        </Link>
        <Link to={`/island/${id}/builder`}>
          <Button variant="default" size="sm" className="gap-2">
            <Home className="w-4 h-4" />
            Build Your Island
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setAssignmentDialogOpen(true)}>
          <Briefcase className="w-4 h-4" />
          Commission Designer
        </Button>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {/* Island Visual Tabs - 2D Image vs 3D Preview */}
          <Tabs defaultValue="2d" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="2d" className="gap-2">
                  <ImageIcon className="w-4 h-4" />
                  2D View
                </TabsTrigger>
                <TabsTrigger value="3d" className="gap-2">
                  <Box className="w-4 h-4" />
                  3D Preview
                </TabsTrigger>
              </TabsList>
              
              {/* Export Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportScreenshot}
                  disabled={isExporting}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? "Exporting..." : "Screenshot"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport3D('gltf')}
                  disabled={isExporting}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  3D Model
                </Button>
              </div>
            </div>

            <TabsContent value="2d" className="w-full">
              {displayImage && (
                <div className="w-full aspect-video overflow-hidden rounded-lg border bg-muted/50">
                  <img
                    src={displayImage}
                    alt={island.island_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="3d" className="w-full">
              <div className="w-full aspect-video rounded-lg border bg-gradient-to-b from-sky-200 to-blue-300 overflow-hidden">
                <Island3DPreview islandData={island3DData} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Island Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">{island.island_name}</h1>
            {island.description && (
              <p className="text-lg text-muted-foreground">{island.description}</p>
            )}
          </div>

          {/* Island Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Ownership</div>
              <div className="text-lg font-semibold capitalize">{island.ownership_type}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Visibility</div>
              <div className="text-lg font-semibold capitalize">{island.visibility}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Projects</div>
              <div className="text-lg font-semibold">{island.total_projects || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Visitors</div>
              <div className="text-lg font-semibold">{island.total_visitors || 0}</div>
            </Card>
          </div>

          {/* Color Palette */}
          {themeConfig?.color_palette && themeConfig.color_palette.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Theme Colors</h3>
              <div className="flex gap-2">
                {themeConfig.color_palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-lg border-2 border-white shadow-md"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Business Listings - Rent/Buy Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pricing Card - 1 column */}
            <div>
              <IslandPricingCard 
                islandId={island.id} 
                monthlyVisitors={metrics?.monthly_visitors || 0} 
              />
            </div>

            {/* Marketplace - 2 columns */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Island Marketplace</h3>
                    <p className="text-muted-foreground">
                      Virtual real estate with real value - rent or buy space for your business
                    </p>
                  </div>
                </div>
                
                <CreateIslandListing islandId={island.id} />
                
                <div className="mt-6">
                  <IslandMarketplaceListings islandId={island.id} />
                </div>
              </Card>
            </div>
          </div>

          {/* Coming Soon Section */}
          <Card className="p-6 bg-muted">
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              More island features, projects, and interactive elements will be added here.
            </p>
          </Card>
        </div>
      </Card>

      <IslandAssignmentDialog
        islandId={island.id}
        islandName={island.island_name || "Island"}
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
      />
    </PortalPageLayout>
  );
};

export default IslandDetail;
