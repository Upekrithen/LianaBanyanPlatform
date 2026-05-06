/**
 * Sawtooth60DirectionalCurrentgapcloseEngine — MISS-015
 * ======================================================
 * Sawtooth-pattern channels at 36 mm depth create directional water flow.
 * 60-tooth sawtooth geometry at ChannelLock base enforces preferred current
 * direction; reversed Hexel placement creates opposing current.
 *
 * Depends on: MISS-002 Ouralis (OuralisTidalMechanismEngine interface)
 * Wave 2 / Old One: urZah / Bushel 29 / BP025
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  useSawtooth60DirectionalCurrentgapclose,
  type CurrentDirection,
  type OuralisTidalMechanismEngineInterface,
} from '@/hooks/useSawtooth60DirectionalCurrentgapclose';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Sawtooth60DirectionalCurrentgapcloseEngineProps {
  position?: [number, number, number];
  ouralis?: OuralisTidalMechanismEngineInterface;
  showHUD?: boolean;
  initialDirection?: CurrentDirection;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Renders the 60-tooth sawtooth ring geometry around the ChannelLock base. */
function SawtoothRing({ toothCount, direction, flow }: {
  toothCount: number;
  direction: CurrentDirection;
  flow: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Ring spins at a rate proportional to flow; reverses with current direction
    const speed = direction === 'forward' ? flow : direction === 'reverse' ? -flow : 0;
    groupRef.current.rotation.y = t * speed * 1.2;
  });

  const toothMeshes = useMemo(() => {
    const radius = 0.55;
    const teeth = [];
    for (let i = 0; i < toothCount; i++) {
      const angle = (i / toothCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Acute face angle = preferred direction (30° tilt)
      const tilt = (Math.PI / 6) * (direction === 'reverse' ? -1 : 1);
      teeth.push(
        <mesh key={i} position={[x, 0, z]} rotation={[tilt, angle + Math.PI / 2, 0]}>
          <boxGeometry args={[0.012, 0.04, 0.025]} />
          <meshStandardMaterial
            color={direction === 'forward' ? '#38bdf8' : direction === 'reverse' ? '#f87171' : '#94a3b8'}
            emissive={direction === 'neutral' ? '#000' : direction === 'forward' ? '#0ea5e9' : '#ef4444'}
            emissiveIntensity={flow * 0.4}
          />
        </mesh>
      );
    }
    return teeth;
  }, [toothCount, direction]);

  return <group ref={groupRef}>{toothMeshes}</group>;
}

/** Directional flow arrow for each active edge force. */
function FlowArrows({ edgeForces, flow }: {
  edgeForces: Array<{ edgeIndex: number; direction: CurrentDirection; force: number }>;
  flow: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    // Pulse opacity with sawtooth-like pattern
    const t = clock.getElapsedTime();
    const pulse = 0.5 + Math.abs(((t * 2) % 1) - 0.5);
    groupRef.current.children.forEach(child => {
      (child as THREE.Mesh).material &&
        ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color &&
        child.children.forEach(sub => {
          const mat = (sub as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat?.opacity !== undefined) mat.opacity = 0.3 + pulse * 0.7 * flow;
        });
    });
  });

  const RADIUS = 0.9;
  return (
    <group ref={groupRef}>
      {edgeForces.map(ef => {
        if (ef.force < 0.01) return null;
        const angle = (ef.edgeIndex * Math.PI) / 3;
        const x = Math.cos(angle) * RADIUS;
        const z = Math.sin(angle) * RADIUS;
        const isForward = ef.direction === 'forward';
        return (
          <group key={ef.edgeIndex} position={[x, 0.05, z]} rotation={[0, -angle, 0]}>
            {/* Arrow shaft */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, ef.force * 0.3, 6]} />
              <meshStandardMaterial
                color={isForward ? '#7dd3fc' : '#fca5a5'}
                transparent
                opacity={ef.force}
              />
            </mesh>
            {/* Arrow head */}
            <mesh position={[ef.force * 0.16 * (isForward ? 1 : -1), 0, 0]} rotation={[0, 0, isForward ? Math.PI / 2 : -Math.PI / 2]}>
              <coneGeometry args={[0.035, 0.07, 6]} />
              <meshStandardMaterial
                color={isForward ? '#0ea5e9' : '#ef4444'}
                transparent
                opacity={ef.force}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** ChannelLock base hex with channel grooves at 36 mm depth. */
function ChannelLockBase({ flow }: { flow: number }) {
  return (
    <group>
      {/* Outer hex body */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.2, 6]} />
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </mesh>
      {/* Channel groove ring (36 mm depth representation) */}
      <mesh position={[0, -0.05, 0]}>
        <torusGeometry args={[0.5, 0.06, 8, 60]} />
        <meshStandardMaterial
          color={flow > 0.1 ? '#38bdf8' : '#64748b'}
          emissive={flow > 0.1 ? '#0369a1' : '#000'}
          emissiveIntensity={flow * 0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// ─── Main Engine Component ────────────────────────────────────────────────────

export const Sawtooth60DirectionalCurrentgapcloseEngine: React.FC<
  Sawtooth60DirectionalCurrentgapcloseEngineProps
> = ({
  position = [0, 0, 0],
  ouralis,
  showHUD = true,
  initialDirection = 'forward',
}) => {
  const { state, setDirection, toggleReversed, setActive } =
    useSawtooth60DirectionalCurrentgapclose(ouralis);

  // Activate on mount
  React.useEffect(() => {
    setDirection(initialDirection);
    setActive(true);
    return () => setActive(false);
  }, [initialDirection, setActive, setDirection]);

  const directionLabel =
    state.currentDirection === 'forward' ? '▶ Forward' :
    state.currentDirection === 'reverse' ? '◀ Reverse' : '⏸ Neutral';

  return (
    <group position={position}>
      {/* Physical simulation */}
      <ChannelLockBase flow={state.flowVelocity} />
      <SawtoothRing
        toothCount={state.toothCount}
        direction={state.currentDirection}
        flow={state.flowVelocity}
      />
      <FlowArrows edgeForces={state.edgeForces} flow={state.flowVelocity} />

      {/* HUD overlay */}
      {showHUD && (
        <Html position={[0, 1.4, 0]} center distanceFactor={6}>
          <div className="bg-slate-900/90 border border-sky-500/50 rounded-lg p-3 min-w-[180px] text-xs text-white font-mono select-none">
            <div className="text-sky-400 font-bold text-sm mb-1">MISS-015 · Sawtooth60 GC</div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Teeth</span>
              <span>{state.toothCount}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Depth</span>
              <span>{state.channelDepth}mm</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Direction</span>
              <span className={state.currentDirection === 'forward' ? 'text-sky-300' : 'text-rose-300'}>
                {directionLabel}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Flow</span>
              <span>{(state.flowVelocity * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Reversed</span>
              <span className={state.reversed ? 'text-amber-400' : 'text-slate-500'}>
                {state.reversed ? 'YES' : 'no'}
              </span>
            </div>
            {/* Ouralis phase indicator */}
            <div className="border-t border-slate-700 pt-1 mb-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Ouralis phase</span>
                <span className="text-purple-300">{state.ouralisPhase}/11</span>
              </div>
            </div>
            {/* Controls */}
            <div className="flex gap-1 flex-wrap">
              <button
                className="bg-sky-700 hover:bg-sky-600 px-2 py-0.5 rounded text-[10px]"
                onClick={() => setDirection('forward')}
              >Fwd</button>
              <button
                className="bg-rose-700 hover:bg-rose-600 px-2 py-0.5 rounded text-[10px]"
                onClick={() => setDirection('reverse')}
              >Rev</button>
              <button
                className="bg-slate-600 hover:bg-slate-500 px-2 py-0.5 rounded text-[10px]"
                onClick={toggleReversed}
              >Flip</button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Sawtooth60DirectionalCurrentgapcloseEngine;
