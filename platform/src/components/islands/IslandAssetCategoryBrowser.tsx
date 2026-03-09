import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Trees, Sparkles, Box } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  file_type: string | null;
  category: string | null;
  description: string | null;
  tags: string[] | null;
}

interface IslandAssetCategoryBrowserProps {
  assets: Asset[];
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset) => void;
}

const CATEGORY_CONFIG = {
  buildings: {
    icon: Building2,
    label: "Buildings",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300"
  },
  nature: {
    icon: Trees,
    label: "Nature",
    color: "bg-green-500/10 text-green-700 dark:text-green-300"
  },
  decorations: {
    icon: Sparkles,
    label: "Decorations",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-300"
  },
  interactive: {
    icon: Box,
    label: "Interactive",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-300"
  }
};

export const IslandAssetCategoryBrowser = ({
  assets,
  selectedAsset,
  onSelectAsset
}: IslandAssetCategoryBrowserProps) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categorizedAssets = assets.reduce((acc, asset) => {
    const category = asset.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(asset);
    return acc;
  }, {} as Record<string, Asset[]>);

  const allCategories = ["all", ...Object.keys(CATEGORY_CONFIG)];

  const getFilteredAssets = () => {
    if (activeCategory === "all") return assets;
    return categorizedAssets[activeCategory] || [];
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">Asset Browser</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid grid-cols-2 gap-2 h-auto">
            {allCategories.map((category) => {
              const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
              const Icon = config?.icon;

              return (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="flex items-center gap-2"
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  {config?.label || "All"}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeCategory} className="space-y-2 mt-4">
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
              {getFilteredAssets().map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                const categoryConfig = CATEGORY_CONFIG[asset.category as keyof typeof CATEGORY_CONFIG];

                return (
                  <div
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-accent flex items-center justify-center text-2xl">
                        {asset.file_type === "f3d" ? "🔧" : "🏠"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{asset.name}</p>
                        {categoryConfig && (
                          <Badge
                            variant="secondary"
                            className={`text-xs mt-1 ${categoryConfig.color}`}
                          >
                            {categoryConfig.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {getFilteredAssets().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No assets in this category</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
