import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Home, Trees, Boxes, Sparkles } from "lucide-react";

interface IslandAssetPaletteProps {
  selectedAsset: any;
  onSelectAsset: (asset: any) => void;
}

export const IslandAssetPalette = ({ selectedAsset, onSelectAsset }: IslandAssetPaletteProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  const { data: assets, isLoading } = useQuery({
    queryKey: ["island-assets", category, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("lb_asset_library")
        .select("*")
        .eq("is_public", true);

      if (category !== "all") {
        query = query.eq("category", category);
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query.order("name");
      if (error) throw error;
      return data || [];
    }
  });

  const categories = [
    { value: "all", label: "All", icon: Boxes },
    { value: "buildings", label: "Buildings", icon: Home },
    { value: "nature", label: "Nature", icon: Trees },
    { value: "decorations", label: "Decor", icon: Sparkles }
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="grid grid-cols-2 w-full">
          {categories.slice(0, 2).map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
              <cat.icon className="h-3 w-3 mr-1" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsList className="grid grid-cols-2 w-full mt-2">
          {categories.slice(2).map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
              <cat.icon className="h-3 w-3 mr-1" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              Loading assets...
            </div>
          ) : assets && assets.length > 0 ? (
            assets.map((asset: any) => (
              <button
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  selectedAsset?.id === asset.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                    <Boxes className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.category}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              No assets found. Assets coming soon!
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
