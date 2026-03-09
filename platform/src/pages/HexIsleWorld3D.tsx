/**
 * HEXISLE 3D WORLD PAGE
 * =====================
 * Route: /hexisle/world-3d
 *
 * The immersive 3D archipelago. 7 islands in a south-to-north chain,
 * each built from hexagonal terrain columns (like HeroScape with dramatic
 * elevation). Based on canonical lore by James Ausbin (Creative Director).
 *
 * Geography:
 *   1. Harvest (south) → 2. Navigate → 3. Engineer → 4. Battle (center)
 *   → 5. Seek (caldera ring) / 6. Magic (rises from center) → 7. Train (north)
 *
 * Uses React Three Fiber + drei. Zero external 3D assets — all procedural.
 */

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky, Stars } from "@react-three/drei";
import { WorldNavigationProvider } from "@/contexts/WorldNavigationContext";
import { WorldCameraRig } from "@/components/hexisle/world3d/WorldCameraRig";
import { OceanPlane } from "@/components/hexisle/world3d/OceanPlane";
import { IslandNode } from "@/components/hexisle/world3d/IslandNode";
import { WorldHUD } from "@/components/hexisle/world3d/WorldHUD";
import { ViewPhaseSwitcher } from "@/components/hexisle/ViewPhaseSwitcher";
import { ISLANDS, JOURNEY_PATH } from "@/lib/hexIsleWorldData";
import * as THREE from "three";

// ─── Journey Path Lines ─────────────────────────────────────────────────────

function JourneyPaths() {
  const pathIslands = JOURNEY_PATH.map(id => ISLANDS.find(i => i.id === id)!);

  return (
    <group>
      {pathIslands.slice(0, -1).map((island, i) => {
        const next = pathIslands[i + 1];
        if (!next) return null;

        const start = new THREE.Vector3(island.worldPosition.x, 0.3, island.worldPosition.z);
        const end = new THREE.Vector3(next.worldPosition.x, 0.3, next.worldPosition.z);

        // Create a curved path between islands
        const mid = start.clone().lerp(end, 0.5);
        mid.y = 1; // Slight arc
        mid.x += (Math.random() - 0.5) * 4; // Slight curve

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const points = curve.getPoints(20);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <line key={`path-${island.id}-${next.id}`} geometry={geometry}>
            <lineBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.15}
              linewidth={1}
            />
          </line>
        );
      })}
    </group>
  );
}

// ─── World Scene ────────────────────────────────────────────────────────────

function WorldScene() {
  return (
    <>
      {/* Camera */}
      <WorldCameraRig />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <hemisphereLight
        args={["#87CEEB", "#3a5f3a", 0.3]}
      />

      {/* Sky + Stars */}
      <Sky
        distance={4500}
        sunPosition={[100, 50, 100]}
        inclination={0.55}
        azimuth={0.25}
        rayleigh={0.5}
      />
      <Stars
        radius={200}
        depth={100}
        count={3000}
        factor={3}
        fade
        speed={0.5}
      />

      {/* Ocean */}
      <OceanPlane size={400} />

      {/* Islands */}
      {ISLANDS.map((island) => (
        <IslandNode key={island.id} island={island} />
      ))}

      {/* Journey paths between islands */}
      <JourneyPaths />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={["#8ba4b8", 80, 250]} />
    </>
  );
}

// ─── Loading Fallback ───────────────────────────────────────────────────────

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-900 to-blue-950 z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white/80 rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-white text-lg font-bold">Loading HexIsle</h2>
        <p className="text-white/50 text-sm mt-1">Generating archipelago terrain...</p>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function HexIsleWorld3D() {
  return (
    <WorldNavigationProvider>
      <div className="relative w-full h-screen bg-gradient-to-b from-sky-900 to-blue-950 overflow-hidden">
        {/* 3D Canvas */}
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            shadows
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
            }}
            dpr={[1, 1.5]}
          >
            <WorldScene />
          </Canvas>
        </Suspense>

        {/* 2D HUD Overlay */}
        <WorldHUD />

        {/* View Phase Switcher (Portals / 2D / 3D) */}
        <ViewPhaseSwitcher />
      </div>
    </WorldNavigationProvider>
  );
}
