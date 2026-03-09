/**
 * HEX TERRAIN RENDERER
 * ====================
 * R3F component that renders hex column terrain using InstancedMesh.
 * One InstancedMesh per terrain type = minimal draw calls.
 *
 * Each hex is a CylinderGeometry(radius, radius, 1, 6) scaled per-instance.
 * Like HeroScape tiles but with dramatic height variation.
 */

import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { type HexCell } from "@/lib/hexIsleWorldData";
import {
  generateIslandMeshData,
  applyInstancesToMesh,
  getSharedHexGeometry,
  type TerrainGroup,
} from "@/lib/hexTerrainEngine";

// ─── Props ──────────────────────────────────────────────────────────────────

interface HexTerrainRendererProps {
  cells: HexCell[];
  onClick?: (event: THREE.Event) => void;
}

// ─── Terrain Group Component ────────────────────────────────────────────────

function TerrainGroupMesh({
  group,
  geometry,
  onClick,
}: {
  group: TerrainGroup;
  geometry: THREE.CylinderGeometry;
  onClick?: (event: THREE.Event) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    if (!meshRef.current) return;
    applyInstancesToMesh(meshRef.current, group.instances);
  }, [group.instances]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, group.instances.length]}
      castShadow
      receiveShadow
      onClick={onClick}
    >
      <meshStandardMaterial
        color={group.color}
        roughness={group.roughness}
        metalness={0.05}
        emissive={group.emissive || "#000000"}
        emissiveIntensity={group.emissive ? 0.3 : 0}
        vertexColors
      />
    </instancedMesh>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function HexTerrainRenderer({ cells, onClick }: HexTerrainRendererProps) {
  const geometry = useMemo(() => getSharedHexGeometry(), []);
  const meshData = useMemo(() => generateIslandMeshData(cells), [cells]);

  return (
    <group>
      {meshData.groups.map((group) => (
        <TerrainGroupMesh
          key={group.terrain}
          group={group}
          geometry={geometry}
          onClick={onClick}
        />
      ))}
    </group>
  );
}

export default HexTerrainRenderer;
