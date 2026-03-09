/**
 * ISLAND NODE
 * ===========
 * Wrapper for one island in the 3D world.
 * Positions HexTerrainRenderer at the island's world coordinates.
 * Adds floating label, click handler for camera fly-in.
 *
 * When zoomed to island/city level, renders CityStructures labels
 * above named buildings within the island's cities.
 */

import { useRef, useState, useCallback } from "react";
import { Html } from "@react-three/drei";
import { type ThreeEvent } from "@react-three/fiber";
import { HexTerrainRenderer } from "./HexTerrainRenderer";
import { CityStructures } from "./CityStructures";
import { type IslandDef } from "@/lib/hexIsleWorldData";
import { useWorldNavigation } from "@/contexts/WorldNavigationContext";

interface IslandNodeProps {
  island: IslandDef;
}

export function IslandNode({ island }: IslandNodeProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const { flyToIsland, cameraMode, activeIslandId } = useWorldNavigation();

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    flyToIsland(island.id);
  }, [flyToIsland, island.id]);

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => setHovered(false), []);

  // Island 6 (Magic) shares position with Island 5 (Seek).
  // In archipelago view, only show the non-Magic version.
  // Magic is revealed when the player triggers it.
  const isHiddenMagic = island.id === 6 && cameraMode === "archipelago";

  if (isHiddenMagic) return null;

  // Show city structure labels when zoomed in to THIS island
  const isZoomedIn = (cameraMode === "island" || cameraMode === "city") && activeIslandId === island.id;
  const hasCities = island.cities && island.cities.length > 0;

  return (
    <group
      ref={groupRef}
      position={[island.worldPosition.x, 0, island.worldPosition.z]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Hex terrain columns */}
      <HexTerrainRenderer cells={island.cells} />

      {/* City building labels — visible when zoomed in */}
      {isZoomedIn && hasCities && (
        <CityStructures islandId={island.id} />
      )}

      {/* Floating island label */}
      <Html
        position={[0, 8, 0]}
        center
        distanceFactor={50}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          className={`
            px-3 py-1.5 rounded-lg text-center transition-all duration-200
            ${hovered
              ? "bg-white/95 text-slate-900 shadow-lg scale-110"
              : "bg-black/60 text-white/90 shadow-md"
            }
          `}
        >
          <div className="text-sm font-bold whitespace-nowrap">
            {island.id}. {island.name}
          </div>
          <div className="text-[10px] opacity-75 whitespace-nowrap">
            {island.theme}
          </div>
        </div>
      </Html>

      {/* Hover highlight ring */}
      {hovered && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[6, 7, 6]} />
          <meshBasicMaterial
            color={island.colorAccent}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

export default IslandNode;
