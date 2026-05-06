/**
 * Sawtooth60DirectionalCurrentEngine — STUB-001 (stub → full implementation)
 * ===========================================================================
 * Directional-current simulation wired to the CanalRenderer.
 * Implements: sawtooth geometry shader + current-force vector per Hexel edge.
 *
 * Depends on: MISS-002 (Ouralis) + MISS-015 (Sawtooth60 gapclose)
 * Wave 2 / Old One: urZah / Bushel 29 / BP025
 *
 * Architecture:
 *   - useSawtooth60DirectionalCurrent hook drives all state
 *   - ShaderCanvas renders the sawtooth geometry pattern on a 2D plane
 *   - EdgeVectorOverlay renders per-Hexel-edge force arrows (3D)
 *   - CurrentPhaseIndicator shows the four-phase lifecycle
 */

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  useSawtooth60DirectionalCurrent,
  type SawtoothShaderParams,
  type HexelEdgeVector,
  type CurrentPhase,
} from '@/hooks/useSawtooth60DirectionalCurrent';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Sawtooth60DirectionalCurrentEngineProps {
  position?: [number, number, number];
  ouralisSync?: boolean;
  miss015Sync?: boolean;
  showHUD?: boolean;
  reversed?: boolean;
  shaderOverride?: Partial<SawtoothShaderParams>;
}

// ─── Sawtooth Geometry Shader (procedural geometry) ──────────────────────────

/**
 * SawtoothGeometryPlane
 * Generates a BufferGeometry that traces 60 sawtooth teeth in a circle
 * at channel depth.  Animates the "wave" sweeping around to simulate
 * directional current.
 */
function SawtoothGeometryPlane({
  params,
  phase,
  flow,
}: {
  params: SawtoothShaderParams;
  phase: CurrentPhase;
  flow: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !materialRef.current) return;
    const t = clock.getElapsedTime() * params.animationSpeed;
    // Rotate the tooth ring to simulate sweeping current
    groupRef.current.rotation.y = t * flow * 0.8;
    // Emissive intensity tracks phase
    const baseEmissive = phase === 'peak' ? 0.5 : phase === 'idle' ? 0 : 0.25;
    materialRef.current.emissiveIntensity = baseEmissive + Math.sin(t * 4) * 0.08 * flow;
    materialRef.current.opacity = 0.7 + flow * 0.2;
  });

  const { toothGeometries } = useMemo(() => {
    const tCount = params.toothCount;
    const radius = 0.62;
    const toothH = params.toothHeight * 0.12;
    const geoms: Array<{ x: number; y: number; z: number; ry: number; rz: number }> = [];

    for (let i = 0; i < tCount; i++) {
      const angle = (i / tCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Acute face creates the preferred-direction ramp
      const rz = ((params.toothAngle * Math.PI) / 180) * (i % 2 === 0 ? 1 : -0.3);
      geoms.push({ x, y: toothH * 0.5, z, ry: angle, rz });
    }
    return { toothGeometries: geoms };
  }, [params]);

  const TOOTH_W = 0.012;
  const TOOTH_H = params.toothHeight * 0.12;

  return (
    <group ref={groupRef}>
      {toothGeometries.map((g, i) => (
        <mesh key={i} position={[g.x, g.y, g.z]} rotation={[0, g.ry + Math.PI / 2, g.rz]}>
          <boxGeometry args={[TOOTH_W, TOOTH_H, TOOTH_W * 1.8]} />
          <meshStandardMaterial
            ref={i === 0 ? materialRef : undefined}
            color={phase === 'idle' ? '#64748b' : '#38bdf8'}
            emissive={phase === 'idle' ? '#000' : '#0369a1'}
            emissiveIntensity={0.3}
            transparent
            opacity={0.85}
            roughness={0.35}
          />
        </mesh>
      ))}
      {/* Channel depth ring */}
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.56, 0.7, 60]} />
        <meshStandardMaterial
          color={flow > 0.1 ? '#7dd3fc' : '#334155'}
          transparent
          opacity={0.3 + flow * 0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Per-Hexel-Edge Force Vectors ─────────────────────────────────────────────

function EdgeVectorOverlay({ edges }: { edges: HexelEdgeVector[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, idx) => {
      // Pulse each arrow out of phase for a "sweeping" current effect
      const pulse = 0.6 + Math.sin(t * 2.5 + idx * 1.05) * 0.4;
      child.scale.setScalar(pulse);
    });
  });

  const ARROW_R = 1.05;

  return (
    <group ref={groupRef}>
      {edges.map(ev => {
        if (ev.force < 0.02) return null;
        const x = Math.cos(ev.angle) * ARROW_R;
        const z = Math.sin(ev.angle) * ARROW_R;
        const colour = ev.isPreferred ? '#34d399' : '#fb923c';
        return (
          <group
            key={ev.edgeIndex}
            position={[x, 0.08, z]}
            rotation={[0, -ev.angle + Math.PI / 2, 0]}
          >
            {/* Shaft */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, ev.force * 0.35, 6]} />
              <meshStandardMaterial color={colour} transparent opacity={0.75 * ev.force + 0.1} />
            </mesh>
            {/* Head */}
            <mesh
              position={[ev.force * 0.19, 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <coneGeometry args={[0.04, 0.08, 6]} />
              <meshStandardMaterial color={colour} transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Phase Indicator Arc ──────────────────────────────────────────────────────

const PHASE_COLORS: Record<CurrentPhase, string> = {
  idle: '#475569',
  ramp_up: '#fbbf24',
  peak: '#34d399',
  ramp_down: '#f87171',
};

function PhaseArc({ phase, flow }: { phase: CurrentPhase; flow: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.color.set(PHASE_COLORS[phase]);
    mat.opacity = 0.15 + flow * 0.5;
  });

  return (
    <mesh ref={meshRef} position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.12, 1.22, 60]} />
      <meshStandardMaterial
        color={PHASE_COLORS[phase]}
        transparent
        opacity={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ─── Main Engine Component ────────────────────────────────────────────────────

export const Sawtooth60DirectionalCurrentEngine: React.FC<
  Sawtooth60DirectionalCurrentEngineProps
> = ({
  position = [0, 0, 0],
  ouralisSync = false,
  miss015Sync = false,
  showHUD = true,
  reversed = false,
  shaderOverride,
}) => {
  const { state, start, stop, setReversed, updateShader } =
    useSawtooth60DirectionalCurrent({ ouralisSync, miss015Sync, reversed, shaderOverride });

  const handleToggle = useCallback(() => {
    state.phase === 'idle' ? start() : stop();
  }, [state.phase, start, stop]);

  const phaseLabel: Record<CurrentPhase, string> = {
    idle: '⏸ Idle',
    ramp_up: '↑ Ramp Up',
    peak: '⚡ Peak',
    ramp_down: '↓ Ramp Down',
  };

  return (
    <group position={position}>
      {/* Sawtooth geometry shader plane */}
      <SawtoothGeometryPlane
        params={state.shaderParams}
        phase={state.phase}
        flow={state.globalFlow}
      />

      {/* Per-Hexel-edge force vectors */}
      <EdgeVectorOverlay edges={state.edgeVectors} />

      {/* Phase arc indicator */}
      <PhaseArc phase={state.phase} flow={state.globalFlow} />

      {/* ChannelLock base */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} />
      </mesh>

      {/* HUD */}
      {showHUD && (
        <Html position={[0, 1.6, 0]} center distanceFactor={6}>
          <div className="bg-slate-900/90 border border-emerald-500/50 rounded-lg p-3 min-w-[200px] text-xs text-white font-mono select-none">
            <div className="text-emerald-400 font-bold text-sm mb-1">STUB-001 · Sawtooth60 Full</div>

            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Phase</span>
              <span style={{ color: PHASE_COLORS[state.phase] }}>{phaseLabel[state.phase]}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Global flow</span>
              <span className="text-emerald-300">{(state.globalFlow * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Teeth</span>
              <span>{state.shaderParams.toothCount}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Channel depth</span>
              <span>{state.shaderParams.channelDepth}mm</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Reversed</span>
              <span className={state.reversedPlacement ? 'text-amber-400' : 'text-slate-500'}>
                {state.reversedPlacement ? 'YES' : 'no'}
              </span>
            </div>
            <div className="border-t border-slate-700 pt-1 mb-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Ouralis sync</span>
                <span className={state.ouralisSync ? 'text-purple-400' : 'text-slate-600'}>
                  {state.ouralisSync ? 'ON' : 'off'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MISS-015 sync</span>
                <span className={state.miss015Sync ? 'text-sky-400' : 'text-slate-600'}>
                  {state.miss015Sync ? 'ON' : 'off'}
                </span>
              </div>
            </div>

            <div className="flex gap-1">
              <button
                className={`px-3 py-1 rounded text-[11px] font-semibold ${
                  state.phase === 'idle'
                    ? 'bg-emerald-700 hover:bg-emerald-600'
                    : 'bg-rose-700 hover:bg-rose-600'
                }`}
                onClick={handleToggle}
              >
                {state.phase === 'idle' ? '▶ Start' : '⏹ Stop'}
              </button>
              <button
                className="bg-amber-700 hover:bg-amber-600 px-2 py-1 rounded text-[11px]"
                onClick={() => setReversed(!state.reversedPlacement)}
              >
                Flip
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default Sawtooth60DirectionalCurrentEngine;
