import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HexCoords {
  q: number;
  r: number;
  s: number;
}

interface Building {
  id?: string;
  building_type: string;
  position_x: number;
  position_y: number;
  hex_q?: number;
  hex_r?: number;
  hex_s?: number;
}

interface IslandHexGridProps {
  hexPattern: HexCoords[];
  buildings: Building[];
  onPlaceBuilding: (coords: HexCoords) => void;
  onRemoveBuilding: (index: number) => void;
  isPlacingMode: boolean;
}

export const IslandHexGrid = ({
  hexPattern,
  buildings,
  onPlaceBuilding,
  onRemoveBuilding,
  isPlacingMode
}: IslandHexGridProps) => {
  const hexSize = 60;
  const hexHeight = Math.sqrt(3) * hexSize;
  const hexWidth = 2 * hexSize;

  // Convert axial coordinates to pixel position
  const hexToPixel = (q: number, r: number) => {
    const x = hexSize * (3/2 * q);
    const y = hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    return { x, y };
  };

  // Find building at hex coordinates
  const getBuildingAt = (q: number, r: number) => {
    return buildings.findIndex(b => b.hex_q === q && b.hex_r === r);
  };

  // Calculate viewBox to center the hexes
  const calculateViewBox = () => {
    if (hexPattern.length === 0) return "0 0 400 400";

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    hexPattern.forEach(hex => {
      const { x, y } = hexToPixel(hex.q, hex.r);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    const padding = hexSize * 2;
    return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`;
  };

  // Generate hexagon SVG path
  const hexPath = (cx: number, cy: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = cx + hexSize * Math.cos(angle);
      const y = cy + hexSize * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')} Z`;
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg p-8">
        <svg
          viewBox={calculateViewBox()}
          className="w-full h-auto max-h-[600px]"
          style={{ minHeight: "400px" }}
        >
          {hexPattern.map((hex, index) => {
            const { x, y } = hexToPixel(hex.q, hex.r);
            const buildingIndex = getBuildingAt(hex.q, hex.r);
            const hasBuilding = buildingIndex !== -1;

            return (
              <g key={index}>
                <path
                  d={hexPath(x, y)}
                  fill={hasBuilding ? "hsl(var(--primary) / 0.2)" : "hsl(var(--background))"}
                  stroke={isPlacingMode ? "hsl(var(--primary))" : "hsl(var(--border))"}
                  strokeWidth="2"
                  className={isPlacingMode && !hasBuilding ? "cursor-pointer hover:fill-primary/10" : ""}
                  onClick={() => {
                    if (isPlacingMode && !hasBuilding) {
                      onPlaceBuilding(hex);
                    }
                  }}
                />

                {hasBuilding && (
                  <>
                    <path
                      d={hexPath(x, y)}
                      fill="hsl(var(--primary) / 0.6)"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      transform={`scale(0.6) translate(${x * 0.67}, ${y * 0.67})`}
                    />
                    <foreignObject
                      x={x - 12}
                      y={y - 12}
                      width="24"
                      height="24"
                    >
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-6 h-6 p-0"
                        onClick={() => onRemoveBuilding(buildingIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </foreignObject>
                  </>
                )}

                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground select-none"
                  style={{ pointerEvents: "none" }}
                >
                  {hasBuilding ? "🏠" : `${hex.q},${hex.r}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        {isPlacingMode ? (
          <p>Click on an empty hex to place your selected asset</p>
        ) : (
          <p>Select an asset from the palette to start building</p>
        )}
      </div>
    </div>
  );
};
