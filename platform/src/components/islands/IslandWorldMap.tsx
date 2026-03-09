import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Star, Anchor, Crown, Sparkles, Image as ImageIcon, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { IslandImageLightbox } from "./IslandImageLightbox";
// import { useGenerateIslandImages } from "@/hooks/useGenerateIslandImages";
const useGenerateIslandImages = () => ({ generateAllIslandImages: () => {}, isGenerating: false });

// Mock icons
const harvestIslandIcon = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&q=80";
const navigateIslandIcon = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=100&q=80";
const engineerIslandIcon = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&q=80";
const battleIslandIcon = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=100&q=80";
const seekIslandIcon = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&q=80";
const magicIslandIcon = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&q=80";
const trainIslandIcon = "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=100&q=80";
const treasureIslandIcon = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=100&q=80";
const larkSymbol = "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=100&q=80";

interface Island {
  id: string;
  name: string;
  type: string;
  level_requirement: number;
  member_count: number;
  is_locked: boolean;
  theme_color: string;
}

const ISLAND_POSITIONS = {
  // Main 7 islands arranged in SMW style - archipelago layout
  harvest: { x: 15, y: 70, connections: ["navigate", "engineer"] },
  navigate: { x: 30, y: 55, connections: ["engineer", "battle"] },
  engineer: { x: 45, y: 65, connections: ["battle", "seek"] }, // Central hub
  battle: { x: 60, y: 50, connections: ["seek", "magic"] },
  seek: { x: 50, y: 75, connections: ["magic", "train"] },
  magic: { x: 70, y: 65, connections: ["train"] },
  train: { x: 75, y: 45, connections: ["treasure"] },
  // Treasure Island - sun in the distance
  treasure: { x: 85, y: 30, isTreasure: true },
};

const CLOUD_POSITIONS = [
  { x: 10, y: 20, size: 60 },
  { x: 40, y: 15, size: 80 },
  { x: 65, y: 25, size: 70 },
  { x: 85, y: 50, size: 65 },
  { x: 25, y: 85, size: 55 },
];

export const IslandWorldMap = () => {
  const navigate = useNavigate();
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    name: string;
    description?: string;
  } | null>(null);
  const { generateAllIslandImages, isGenerating } = useGenerateIslandImages();

  const { data: islands, isLoading } = useQuery({
    queryKey: ["world-map-islands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_islands")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });

  // Lore key normalization and helpers
  const normalizeToLoreKey = (raw: string) => {
    const name = (raw || "").toLowerCase();
    if (name.includes("harvest") || name.includes("starter")) return "harvest";
    if (name.includes("navigate") || name.includes("hexisle") || name.includes("hex")) return "navigate";
    if (name.includes("engineer") || name.includes("forest")) return "engineer";
    if (name.includes("battle") || name.includes("mountain")) return "battle";
    if (name.includes("seek") || name.includes("sky")) return "seek";
    if (name.includes("magic") || name.includes("crystal")) return "magic";
    if (name.includes("train") || name.includes("tech")) return "train";
    if (name.includes("treasure")) return "treasure";
    return name;
  };

  const getDisplayName = (raw?: string) => {
    const key = normalizeToLoreKey(raw || "");
    const map: Record<string, string> = {
      harvest: "Harvest",
      navigate: "Navigate",
      engineer: "Engineer",
      battle: "Battle",
      seek: "Seek",
      magic: "Magic",
      train: "Train",
      treasure: "Treasure",
    };
    return map[key] || (raw || "Island");
  };

  // Derive the array used for display and ensure Treasure is present
  const displayIslands = useMemo(() => {
    const arr = (islands || []).slice();
    const hasTreasure = arr.some((i: any) => normalizeToLoreKey(i.island_name || "") === "treasure");
    if (!hasTreasure) {
      arr.push({
        id: "treasure-virtual",
        island_name: "Treasure",
        description: "A radiant island glimpsed like a sun on the horizon.",
        island_map_data: null,
        theme_config: { color_palette: ["#f59e0b", "#f97316"] },
      } as any);
    }
    return arr as any[];
  }, [islands]);

  // Image mapping based on normalized lore key
  const getIslandImage = (islandName: string) => {
    const key = normalizeToLoreKey(islandName);
    if (key === "harvest") return harvestIslandIcon;
    if (key === "navigate") return navigateIslandIcon;
    if (key === "engineer") return engineerIslandIcon;
    if (key === "battle") return battleIslandIcon;
    if (key === "seek") return seekIslandIcon;
    if (key === "magic") return magicIslandIcon;
    if (key === "train") return trainIslandIcon;
    if (key === "treasure") return treasureIslandIcon;
    return null;
  };

  const getIslandStyle = (island: typeof islands[0]) => {
    const type = normalizeToLoreKey(island?.island_name || "");
    const themeConfig = (island as any)?.theme_config as { color_palette?: string[] } | null;
    const primaryColor = themeConfig?.color_palette?.[0] || "#8b5cf6";
    
    // Icon mapping based on island type
    const iconMap: Record<string, any> = {
      harvest: Anchor,
      navigate: Sparkles,
      engineer: Crown,
      battle: Crown,
      seek: Sparkles,
      magic: Star,
      train: Sparkles,
      treasure: Star,
    };
    
    return { 
      color: primaryColor, 
      icon: iconMap[type] || Crown,
      gradient: themeConfig?.color_palette || [primaryColor, primaryColor]
    };
  };

  const getIslandPosition = (index: number, islandName: string): { x: number; y: number; connections?: string[]; isTreasure?: boolean } => {
    const nameKey = normalizeToLoreKey(islandName);
    // Try to match by normalized lore key
    if ((ISLAND_POSITIONS as any)[nameKey]) {
      return (ISLAND_POSITIONS as any)[nameKey];
    }
    // Fallback positions based on index
    const positions = Object.values(ISLAND_POSITIONS);
    return positions[index] || { x: 50, y: 50 };
  };

  const renderPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const startX = from.x;
    const startY = from.y;
    const endX = to.x;
    const endY = to.y;

    // Create curved path
    const midX = (startX + endX) / 2;
    const midY = Math.min(startY, endY) - 5;

    return (
      <motion.path
        d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
        stroke="rgba(139, 92, 182, 0.3)"
        strokeWidth="0.5"
        fill="none"
        strokeDasharray="2,2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-sky-300 via-blue-200 to-blue-400">
        <p className="text-2xl font-bold text-white">Loading World Map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-amber-50 via-blue-100 to-teal-100">
      {/* Tapestry texture overlay - Mario World meets ancient map style */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(139, 92, 182, 0.05) 2px,
            rgba(139, 92, 182, 0.05) 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(139, 92, 182, 0.05) 2px,
            rgba(139, 92, 182, 0.05) 4px
          )
        `,
        backgroundSize: "20px 20px"
      }} />
      
      {/* Aged paper texture */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
                         radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%)`
      }} />

      {/* Clouds */}
      {CLOUD_POSITIONS.map((cloud, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/60 rounded-full blur-sm"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
          }}
          animate={{
            x: [0, 20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* SVG for paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {displayIslands?.map((island: any, index: number) => {
          const pos = getIslandPosition(index, island.island_name || `Island ${index + 1}`);
          // Draw connections
          return pos.connections?.map((connName) => {
            const connIsland = displayIslands.find((i: any) => 
              normalizeToLoreKey(i.island_name || "") === connName.toLowerCase()
            );
            if (!connIsland) return null;
            const connIndex = displayIslands.indexOf(connIsland);
            const connPos = getIslandPosition(connIndex, connIsland.island_name || `Island ${connIndex + 1}`);
            return (
              <g key={`${island.id}-${connName}`}>
                {renderPath(pos, connPos)}
              </g>
            );
          });
        })}
      </svg>

      {/* Islands */}
      {displayIslands?.map((island: any, index: number) => {
        const pos = getIslandPosition(index, island.island_name || `Island ${index + 1}`);
        const style = getIslandStyle(island);
        const Icon = style.icon;
        const isTreasure = pos.isTreasure;
        const isHovered = hoveredIsland === island.id;

        return (
          <motion.div
            key={island.id}
            className="absolute cursor-pointer"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.1, z: 10 }}
            onHoverStart={() => setHoveredIsland(island.id)}
            onHoverEnd={() => setHoveredIsland(null)}
          >
            {/* Island cropped image icon */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="cursor-pointer"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                onClick={() => {
                  const loreKey = normalizeToLoreKey(island.island_name || "");
                  
                  // Special routing for Harvest Island - has its own dedicated page
                  if (loreKey === "harvest") {
                    navigate("/harvest-island");
                    return;
                  }
                  
                  const generatedImage = getIslandImage(island.island_name || "");
                  const mapData = island.island_map_data as { thumbnail_image?: string; full_image?: string } | null;
                  const imageUrl = generatedImage || mapData?.full_image;
                  
                  if (imageUrl) {
                    setLightboxImage({
                      url: imageUrl,
                      name: getDisplayName(island.island_name),
                      description: island.description || undefined,
                    });
                  } else {
                    navigate(`/island/${island.id}`);
                  }
                }}
              >
                {(() => {
                  const generatedImage = getIslandImage(island.island_name || "");
                  const mapData = island.island_map_data as { thumbnail_image?: string } | null;
                  const imageUrl = generatedImage || mapData?.thumbnail_image;
                  
                  const sizeStyle = (() => {
                    const nameKey = (island.island_name || "").toLowerCase();
                    if (nameKey.includes("harvest") || nameKey.includes("navigate") || nameKey.includes("engineer")) {
                      return { width: "140px", height: "auto" };
                    }
                    if (nameKey.includes("battle") || nameKey.includes("seek")) {
                      return { width: "150px", height: "auto" };
                    }
                    return { width: "160px", height: "auto" };
                  })();
                  
                  if (imageUrl) {
                    return (
                      <img 
                        src={imageUrl} 
                        alt={island.island_name || "Island"}
                        className="rounded-lg shadow-2xl hover:shadow-3xl transition-shadow"
                        style={sizeStyle}
                      />
                    );
                  } else {
                    return <Icon className="w-16 h-16 text-white" />;
                  }
                })()}
              </motion.div>
            </div>

            {/* Island name tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: isHovered ? 1 : 0, 
                y: isHovered ? 0 : 10 
              }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <Card className="px-3 py-1.5 bg-white/95 shadow-lg">
                <p className="font-bold text-sm">{getDisplayName(island.island_name)}</p>
                {island.description && (
                  <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {island.description}
                  </p>
                )}
              </Card>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Map title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center">
        <motion.h1 
          className="text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          🌴 Liana Banyan Archipelago 🌴
        </motion.h1>
        <motion.p
          className="text-white/90 text-lg mt-2 drop-shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Click an island to explore
        </motion.p>
      </div>

      {/* 3D View Toggle */}
      <Card className="absolute top-8 right-8 p-3 bg-white/95">
        <Button
          onClick={() => navigate("/hexisle/world-3d")}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Compass className="h-4 w-4" />
          Switch to 3D View
        </Button>
      </Card>

      {/* Legend */}
      <Card className="absolute bottom-8 left-8 p-4 bg-white/95">
        <h3 className="font-bold mb-2">Legend</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
            <span>Regular Island</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 border-2 border-yellow-400 flex items-center justify-center">
              <Star className="w-2 h-2 text-white fill-white" />
            </div>
            <span>Treasure Island</span>
          </div>
        </div>
      </Card>

      {/* Generate Images Button */}
      <Card className="absolute bottom-8 right-8 p-4 bg-white/95">
        <Button 
          onClick={generateAllIslandImages}
          disabled={isGenerating}
          className="gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Generate Island Images"}
        </Button>
      </Card>

      {/* Image Lightbox */}
      {lightboxImage && (
        <IslandImageLightbox
          isOpen={true}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage.url}
          islandName={lightboxImage.name}
          description={lightboxImage.description}
        />
      )}
    </div>
  );
};
