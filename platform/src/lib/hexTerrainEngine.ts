/**
 * HEX TERRAIN ENGINE
 * ==================
 * Core engine that converts HexCell[] data into InstancedMesh-ready render data.
 *
 * Like HeroScape but with dramatic elevation — each hex is a cylinder column
 * at a specific height. Terrain type determines material. InstancedMesh groups
 * same-terrain hexes for minimal draw calls.
 *
 * Scale: 1 hex = human with gear. 3 hexes = warhorse nose-to-tail.
 */

import * as THREE from "three";
import {
  type HexCell,
  type TerrainType,
  TERRAIN_COLORS,
  TERRAIN_ROUGHNESS,
  TERRAIN_EMISSIVE,
  HEX_RADIUS,
  HEIGHT_SCALE,
  SEA_LEVEL,
  hexToWorld,
} from "./hexIsleWorldData";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HexInstanceData {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  color: THREE.Color;
}

export interface TerrainGroup {
  terrain: TerrainType;
  color: string;
  roughness: number;
  emissive: string | undefined;
  instances: HexInstanceData[];
}

export interface IslandMeshData {
  groups: TerrainGroup[];
  boundingBox: {
    min: THREE.Vector3;
    max: THREE.Vector3;
  };
  center: THREE.Vector3;
  hexCount: number;
}

// ─── Color Variation ────────────────────────────────────────────────────────

const _tempColor = new THREE.Color();

/**
 * Add slight color variation to each hex for visual interest
 */
function varyColor(baseColor: string, amount: number = 0.05): THREE.Color {
  _tempColor.set(baseColor);
  const hsl = { h: 0, s: 0, l: 0 };
  _tempColor.getHSL(hsl);
  hsl.l += (Math.random() - 0.5) * amount * 2;
  hsl.s += (Math.random() - 0.5) * amount;
  hsl.l = Math.max(0, Math.min(1, hsl.l));
  hsl.s = Math.max(0, Math.min(1, hsl.s));
  return new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
}

// ─── Core Engine ────────────────────────────────────────────────────────────

/**
 * Convert an array of HexCells into grouped InstancedMesh data.
 * Each terrain type becomes one group → one draw call.
 */
export function generateIslandMeshData(cells: HexCell[]): IslandMeshData {
  const groupMap = new Map<TerrainType, HexInstanceData[]>();

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  let sumX = 0, sumZ = 0;

  for (const cell of cells) {
    const { x, z } = hexToWorld(cell.q, cell.r);
    const worldHeight = cell.height * HEIGHT_SCALE;

    // Position: center of the hex column (y = half height above ground)
    const pos = new THREE.Vector3(x, worldHeight / 2, z);

    // Scale: radius stays fixed, height varies
    const scale = new THREE.Vector3(1, Math.max(0.1, worldHeight), 1);

    // Color with slight variation
    const color = varyColor(TERRAIN_COLORS[cell.terrain]);

    // Track bounds
    minX = Math.min(minX, x - HEX_RADIUS);
    maxX = Math.max(maxX, x + HEX_RADIUS);
    minY = Math.min(minY, 0);
    maxY = Math.max(maxY, worldHeight);
    minZ = Math.min(minZ, z - HEX_RADIUS);
    maxZ = Math.max(maxZ, z + HEX_RADIUS);
    sumX += x;
    sumZ += z;

    if (!groupMap.has(cell.terrain)) {
      groupMap.set(cell.terrain, []);
    }
    groupMap.get(cell.terrain)!.push({ position: pos, scale, color });
  }

  const groups: TerrainGroup[] = [];
  for (const [terrain, instances] of groupMap) {
    groups.push({
      terrain,
      color: TERRAIN_COLORS[terrain],
      roughness: TERRAIN_ROUGHNESS[terrain],
      emissive: TERRAIN_EMISSIVE[terrain],
      instances,
    });
  }

  const hexCount = cells.length;
  const center = new THREE.Vector3(
    hexCount > 0 ? sumX / hexCount : 0,
    maxY / 2,
    hexCount > 0 ? sumZ / hexCount : 0
  );

  return {
    groups,
    boundingBox: {
      min: new THREE.Vector3(minX, minY, minZ),
      max: new THREE.Vector3(maxX, maxY, maxZ),
    },
    center,
    hexCount,
  };
}

/**
 * Apply instance data to a THREE.InstancedMesh.
 * Call this in a useEffect after creating the InstancedMesh.
 */
export function applyInstancesToMesh(
  mesh: THREE.InstancedMesh,
  instances: HexInstanceData[]
): void {
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();

  for (let i = 0; i < instances.length; i++) {
    const { position, scale, color } = instances[i];
    matrix.compose(position, quaternion, scale);
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, color);
  }

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

/**
 * Create a simplified version of an island for archipelago (far) view.
 * Reduces hex count by sampling every Nth hex.
 */
export function simplifyIsland(cells: HexCell[], factor: number = 3): HexCell[] {
  return cells.filter((_, i) => i % factor === 0).map(cell => ({
    ...cell,
    height: cell.height * 0.8, // Slightly flatten for readability at distance
  }));
}

/**
 * Get the shared hex column geometry. Created once, reused everywhere.
 */
let _sharedHexGeometry: THREE.CylinderGeometry | null = null;
export function getSharedHexGeometry(): THREE.CylinderGeometry {
  if (!_sharedHexGeometry) {
    // CylinderGeometry(radiusTop, radiusBottom, height, radialSegments)
    // height=1 because we'll scale Y per-instance
    _sharedHexGeometry = new THREE.CylinderGeometry(
      HEX_RADIUS,  // radiusTop
      HEX_RADIUS,  // radiusBottom
      1,           // height (scaled per-instance)
      6            // 6 sides = hexagon
    );
    // Rotate so flat side faces forward (flat-top hexagon)
    _sharedHexGeometry.rotateY(Math.PI / 6);
  }
  return _sharedHexGeometry;
}

/**
 * Extract features from cells for rendering decorations
 */
export function extractFeatures(cells: HexCell[]): Array<{
  q: number;
  r: number;
  worldX: number;
  worldZ: number;
  topY: number;
  feature: string;
}> {
  const features: Array<{
    q: number; r: number;
    worldX: number; worldZ: number;
    topY: number; feature: string;
  }> = [];

  for (const cell of cells) {
    if (!cell.features) continue;
    const { x, z } = hexToWorld(cell.q, cell.r);
    const topY = cell.height * HEIGHT_SCALE;

    for (const feature of cell.features) {
      features.push({
        q: cell.q, r: cell.r,
        worldX: x, worldZ: z,
        topY, feature,
      });
    }
  }

  return features;
}
