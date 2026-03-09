/**
 * CANAL RENDERER
 * ==============
 * Renders canal water channels as translucent blue planes between hex columns,
 * gondola models moving along canal routes, and venue entrance fee badges.
 *
 * Part of the Vienna-style Canal Quarter in Verdana — The Port City.
 *
 * Visual layers:
 *   - Canal water planes (translucent blue, subtle shimmer animation)
 *   - Gondola models (simple low-poly boats on canal routes)
 *   - "All-Access Pass Active" floating indicator when pass is in effect
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { hexToWorld, HEIGHT_SCALE } from "@/lib/hexIsleWorldData";
import {
  generateCanalDistrict,
  type CanalChannel,
  type GondolaDock,
  type GondolaRoute,
} from "@/lib/hexCanalDistrict";

// ─── Constants ──────────────────────────────────────────────────────────────

const WATER_COLOR = new THREE.Color("#3b82a0");
const WATER_OPACITY = 0.55;
const WATER_HEIGHT = 0.35 * HEIGHT_SCALE; // Just above canal hex terrain
const HEX_SIZE = 0.87; // Match hex radius from HexTerrainRenderer

const GONDOLA_COLOR = "#4a2c1a"; // Dark wood brown
const GONDOLA_LENGTH = 0.8;
const GONDOLA_WIDTH = 0.25;

// ─── Canal Water Planes ─────────────────────────────────────────────────────

interface CanalWaterProps {
  channels: CanalChannel[];
  islandOffset: { x: number; z: number };
}

function CanalWater({ channels, islandOffset }: CanalWaterProps) {
  const waterRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Shimmer animation — subtle color shift on the water surface
  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const t = clock.getElapsedTime();
    const shimmer = Math.sin(t * 0.8) * 0.04;
    materialRef.current.opacity = WATER_OPACITY + shimmer;
  });

  // Collect all unique canal hex world positions
  const waterPlanes = useMemo(() => {
    const seen = new Set<string>();
    const positions: Array<{ x: number; z: number }> = [];

    for (const channel of channels) {
      for (const hex of channel.hexes) {
        const key = `${hex.q},${hex.r}`;
        if (!seen.has(key)) {
          seen.add(key);
          const { x, z } = hexToWorld(hex.q, hex.r);
          positions.push({
            x: x + islandOffset.x,
            z: z + islandOffset.z,
          });
        }
      }
    }
    return positions;
  }, [channels, islandOffset]);

  return (
    <group ref={waterRef}>
      {waterPlanes.map((pos, i) => (
        <mesh
          key={`canal-water-${i}`}
          position={[pos.x, WATER_HEIGHT, pos.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[HEX_SIZE, 6]} />
          <meshStandardMaterial
            ref={i === 0 ? materialRef : undefined}
            color={WATER_COLOR}
            transparent
            opacity={WATER_OPACITY}
            side={THREE.DoubleSide}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Gondola Model ──────────────────────────────────────────────────────────

interface GondolaProps {
  route: GondolaRoute;
  islandOffset: { x: number; z: number };
  speed?: number;
}

function Gondola({ route, islandOffset, speed = 0.3 }: GondolaProps) {
  const gondolaRef = useRef<THREE.Group>(null);

  // World positions for the route path
  const pathPoints = useMemo(() => {
    return route.hexPath.map(hex => {
      const { x, z } = hexToWorld(hex.q, hex.r);
      return new THREE.Vector3(
        x + islandOffset.x,
        WATER_HEIGHT + 0.1,
        z + islandOffset.z,
      );
    });
  }, [route, islandOffset]);

  // Animate along the path (ping-pong)
  useFrame(({ clock }) => {
    if (!gondolaRef.current || pathPoints.length < 2) return;

    const t = clock.getElapsedTime() * speed;
    const totalSegments = pathPoints.length - 1;
    const loopTime = totalSegments * 2; // back and forth
    const phase = t % loopTime;

    let segProgress: number;
    if (phase < totalSegments) {
      segProgress = phase; // forward
    } else {
      segProgress = loopTime - phase; // backward
    }

    const segIndex = Math.min(Math.floor(segProgress), totalSegments - 1);
    const segFrac = segProgress - segIndex;

    const from = pathPoints[segIndex];
    const to = pathPoints[Math.min(segIndex + 1, pathPoints.length - 1)];

    gondolaRef.current.position.lerpVectors(from, to, segFrac);

    // Face direction of travel
    const dir = new THREE.Vector3().subVectors(to, from).normalize();
    if (dir.lengthSq() > 0.001) {
      const angle = Math.atan2(dir.x, dir.z);
      gondolaRef.current.rotation.y = angle;
    }
  });

  return (
    <group ref={gondolaRef}>
      {/* Hull */}
      <mesh>
        <boxGeometry args={[GONDOLA_WIDTH, 0.08, GONDOLA_LENGTH]} />
        <meshStandardMaterial color={GONDOLA_COLOR} roughness={0.7} />
      </mesh>
      {/* Prow (front point) */}
      <mesh position={[0, 0.06, GONDOLA_LENGTH * 0.45]}>
        <coneGeometry args={[0.06, 0.15, 4]} />
        <meshStandardMaterial color="#2c1810" roughness={0.6} />
      </mesh>
      {/* Pole (gondolier) */}
      <mesh position={[0, 0.2, -GONDOLA_LENGTH * 0.3]}>
        <cylinderGeometry args={[0.015, 0.015, 0.35]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Dock Markers ───────────────────────────────────────────────────────────

interface DockMarkersProps {
  docks: GondolaDock[];
  islandOffset: { x: number; z: number };
}

function DockMarkers({ docks, islandOffset }: DockMarkersProps) {
  return (
    <group>
      {docks.map(dock => {
        const { x, z } = hexToWorld(dock.hexPosition.q, dock.hexPosition.r);
        return (
          <group
            key={dock.id}
            position={[
              x + islandOffset.x,
              1.5 * HEIGHT_SCALE,
              z + islandOffset.z,
            ]}
          >
            {/* Dock post */}
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, 0.6]} />
              <meshStandardMaterial color="#8B7355" roughness={0.8} />
            </mesh>
            {/* Lantern on top */}
            <mesh position={[0, 0.35, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial
                color="#4a90d9"
                emissive="#4a90d9"
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface CanalRendererProps {
  islandOffset: { x: number; z: number };
}

export function CanalRenderer({ islandOffset }: CanalRendererProps) {
  const district = useMemo(() => generateCanalDistrict(), []);

  return (
    <group>
      {/* Canal water surface planes */}
      <CanalWater
        channels={district.network.channels}
        islandOffset={islandOffset}
      />

      {/* Gondola boats on routes */}
      {district.network.routes.map((route, i) => (
        <Gondola
          key={`gondola-${i}`}
          route={route}
          islandOffset={islandOffset}
          speed={0.2 + i * 0.05}
        />
      ))}

      {/* Dock marker posts with lanterns */}
      <DockMarkers
        docks={district.network.docks}
        islandOffset={islandOffset}
      />
    </group>
  );
}

export default CanalRenderer;
