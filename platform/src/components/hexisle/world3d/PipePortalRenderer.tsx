/**
 * PIPE PORTAL RENDERER
 * ====================
 * Renders Mario warp-pipe style 3D cylinders at pipe station locations.
 *
 * Each pipe is color-coded by line (Green/Blue/Red) with a glyph symbol
 * (Circle/Square/Triangle) floating above. Locked pipes show a translucent
 * barrier with the required level indicator.
 *
 * Visual elements per station:
 *   - Cylinder body (CylinderGeometry, colored by line)
 *   - Rim ring (slightly wider, darker shade)
 *   - Glyph symbol (floating Html label above pipe)
 *   - Lock indicator (translucent barrier + level text for locked lines)
 *   - Inner dark void (dark disc inside the pipe opening)
 *   - Soft glow (PointLight matching pipe color)
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { hexToWorld, HEIGHT_SCALE } from "@/lib/hexIsleWorldData";
import {
  generatePipeNetwork,
  PIPE_COLORS,
  GLYPH_SYMBOLS,
  type PipeStation,
  type PipeLine,
  type PipeNetwork,
} from "@/lib/hexPipePortals";

// ─── Constants ──────────────────────────────────────────────────────────────

const PIPE_RADIUS = 0.3;
const PIPE_HEIGHT = 0.8;
const RIM_RADIUS = 0.36;
const RIM_HEIGHT = 0.12;
const PIPE_BASE_Y = 2.5 * HEIGHT_SCALE; // Sits on top of the station hex

// ─── Single Pipe ────────────────────────────────────────────────────────────

interface PipeProps {
  station: PipeStation;
  line: PipeLine | null;
  islandOffset: { x: number; z: number };
  playerLevel: number;
}

function Pipe({ station, line, islandOffset, playerLevel }: PipeProps) {
  const glowRef = useRef<THREE.PointLight>(null);
  const { x, z } = hexToWorld(station.hexPosition.q, station.hexPosition.r);

  const worldX = x + islandOffset.x;
  const worldZ = z + islandOffset.z;
  const colorHex = PIPE_COLORS[station.lineColor];
  const color = new THREE.Color(colorHex);
  const darkerColor = new THREE.Color(colorHex).multiplyScalar(0.6);
  const isLocked = line ? playerLevel < line.unlockLevel : false;
  const glyphSymbol = GLYPH_SYMBOLS[station.glyph];

  // Subtle glow pulse
  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const t = clock.getElapsedTime();
    glowRef.current.intensity = isLocked
      ? 0.1
      : 0.3 + Math.sin(t * 2) * 0.15;
  });

  return (
    <group position={[worldX, PIPE_BASE_Y, worldZ]}>
      {/* Pipe body */}
      <mesh>
        <cylinderGeometry args={[PIPE_RADIUS, PIPE_RADIUS, PIPE_HEIGHT, 16]} />
        <meshStandardMaterial
          color={isLocked ? "#555555" : color}
          roughness={0.4}
          metalness={0.3}
          transparent={isLocked}
          opacity={isLocked ? 0.5 : 1.0}
        />
      </mesh>

      {/* Rim ring (top edge) */}
      <mesh position={[0, PIPE_HEIGHT / 2 - RIM_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[RIM_RADIUS, RIM_RADIUS, RIM_HEIGHT, 16]} />
        <meshStandardMaterial
          color={isLocked ? "#444444" : darkerColor}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Inner void (dark disc) */}
      <mesh
        position={[0, PIPE_HEIGHT / 2 + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[PIPE_RADIUS - 0.03, 16]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={1.0}
          metalness={0}
        />
      </mesh>

      {/* Locked barrier (translucent disc over pipe opening) */}
      {isLocked && (
        <mesh
          position={[0, PIPE_HEIGHT / 2 + 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[PIPE_RADIUS, 16]} />
          <meshStandardMaterial
            color="#ff4444"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        position={[0, PIPE_HEIGHT / 2 + 0.3, 0]}
        color={colorHex}
        intensity={0.3}
        distance={3}
        decay={2}
      />

      {/* Glyph symbol + station name floating label */}
      <group position={[0, PIPE_HEIGHT / 2 + 0.6, 0]}>
        <Html center distanceFactor={20} style={{ pointerEvents: "none" }}>
          <div className="flex flex-col items-center gap-0.5">
            {/* Glyph */}
            <span
              className="text-lg font-bold drop-shadow-md"
              style={{ color: colorHex }}
            >
              {glyphSymbol}
            </span>

            {/* Lock indicator */}
            {isLocked && line && (
              <span className="text-[9px] text-red-400 bg-black/70 px-1 rounded whitespace-nowrap">
                Lv.{line.unlockLevel}
              </span>
            )}
          </div>
        </Html>
      </group>
    </group>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface PipePortalRendererProps {
  islandId: number;
  islandOffset: { x: number; z: number };
  playerLevel?: number;
}

export function PipePortalRenderer({
  islandId,
  islandOffset,
  playerLevel = 0,
}: PipePortalRendererProps) {
  const network = useMemo(() => generatePipeNetwork(islandId), [islandId]);

  if (network.stations.length === 0) return null;

  return (
    <group>
      {network.stations.map(station => {
        const line =
          network.lines.find(l => l.stations.includes(station.id)) ?? null;
        return (
          <Pipe
            key={station.id}
            station={station}
            line={line}
            islandOffset={islandOffset}
            playerLevel={playerLevel}
          />
        );
      })}
    </group>
  );
}

export default PipePortalRenderer;
