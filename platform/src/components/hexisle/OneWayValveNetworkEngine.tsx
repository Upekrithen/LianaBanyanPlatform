/**
 * OneWayValveNetworkEngine — MISS-008
 * =====================================
 * Tesla valve-inspired unidirectional flow control at each ChannelLock
 * junction. No moving parts; geometry alone enforces directionality at
 * ~90% efficiency per junction.
 *
 * Depends on: MISS-007 BanyanTree (stub interface — full coupling deferred)
 * Wave 2 / Old One: urZah / Bushel 29 / BP025
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  useOneWayValveNetwork,
  type ValveJunction,
} from '@/hooks/useOneWayValveNetwork';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OneWayValveNetworkEngineProps {
  position?: [number, number, number];
  junctionCount?: number;
  banyanTreeActive?: boolean;
  showHUD?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * TeslaValveCurve — renders a single Tesla-valve-shaped loop around each
 * ChannelLock junction.  The D-loop geometry allows preferred-direction flow
 * to pass through the straight path while opposing flow is forced into the
 * energy-dissipating loop.
 */
function TeslaValveCurve({ junction, index, total }: {
  junction: ValveJunction;
  index: number;
  total: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const angle = (index / total) * Math.PI * 2;
  const RING_R = 0.75;
  const x = Math.cos(angle) * RING_R;
  const z = Math.sin(angle) * RING_R;

  // Colour by state
  const colour = useMemo(() => {
    if (junction.state === 'open') {
      return junction.flowDirection === 'preferred' ? '#34d399' : '#f87171';
    }
    return '#475569';
  }, [junction.state, junction.flowDirection]);

  const emissive = useMemo(() => {
    if (junction.state === 'open') {
      return junction.flowDirection === 'preferred' ? '#059669' : '#b91c1c';
    }
    return '#000000';
  }, [junction.state, junction.flowDirection]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (junction.state === 'open') {
      const t = clock.getElapsedTime();
      mat.emissiveIntensity = 0.3 + Math.sin(t * 3 + index) * 0.15;
    } else {
      mat.emissiveIntensity = 0.05;
    }
  });

  return (
    <group position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
      {/* Straight-through channel */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.25]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      {/* D-loop bypass */}
      <mesh ref={meshRef} position={[0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.025, 8, 24, Math.PI]} />
        <meshStandardMaterial
          color={colour}
          emissive={emissive}
          emissiveIntensity={0.2}
          roughness={0.4}
        />
      </mesh>
      {/* Pressure indicator dot */}
      <mesh position={[-0.04, 0.07, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial
          color={junction.pressureIn > 0.3 ? '#fde68a' : '#1e293b'}
          emissive={junction.pressureIn > 0.3 ? '#fbbf24' : '#000'}
          emissiveIntensity={junction.pressureIn * 0.8}
        />
      </mesh>
    </group>
  );
}

/** Central manifold — represents the BanyanTree distribution hub. */
function BanyanManifold({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (active) {
      mat.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
    } else {
      mat.emissiveIntensity = 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 6]} />
        <meshStandardMaterial
          color={active ? '#6366f1' : '#334155'}
          emissive={active ? '#4f46e5' : '#000'}
          emissiveIntensity={0.2}
          roughness={0.3}
        />
      </mesh>
      {/* Root-like spokes (Banyan Tree stub visualisation) */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42]}
            rotation={[0, a, 0]}
          >
            <cylinderGeometry args={[0.015, 0.01, 0.4, 4]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color={active ? '#818cf8' : '#475569'}
              roughness={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Main Engine Component ────────────────────────────────────────────────────

export const OneWayValveNetworkEngine: React.FC<OneWayValveNetworkEngineProps> = ({
  position = [0, 0, 0],
  junctionCount = 6,
  banyanTreeActive = false,
  showHUD = true,
}) => {
  const { state, activatePreferred, activateOpposed, reset } =
    useOneWayValveNetwork(junctionCount, banyanTreeActive);

  const flowColour =
    state.preferredDirectionActive ? '#34d399' :
    state.blockedDirectionActive   ? '#f87171' :
    '#94a3b8';

  return (
    <group position={position}>
      {/* BanyanTree manifold stub */}
      <BanyanManifold active={state.banyanTreeInterfaceActive} />

      {/* Tesla valve junctions */}
      {state.junctions.map((j, i) => (
        <TeslaValveCurve key={j.id} junction={j} index={i} total={junctionCount} />
      ))}

      {/* Global flow ring */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.68, 60]} />
        <meshStandardMaterial
          color={flowColour}
          transparent
          opacity={0.25 + state.totalFlow * 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HUD */}
      {showHUD && (
        <Html position={[0, 1.4, 0]} center distanceFactor={6}>
          <div className="bg-slate-900/90 border border-indigo-500/50 rounded-lg p-3 min-w-[190px] text-xs text-white font-mono select-none">
            <div className="text-indigo-400 font-bold text-sm mb-1">MISS-008 · OneWayValve</div>

            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Junctions</span>
              <span>{junctionCount}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Efficiency/jxn</span>
              <span>90%</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Net efficiency</span>
              <span className="text-emerald-400">{state.networkEfficiency.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">Flow</span>
              <span style={{ color: flowColour }}>{(state.totalFlow * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">BanyanTree</span>
              <span className={state.banyanTreeInterfaceActive ? 'text-violet-400' : 'text-slate-600'}>
                {state.banyanTreeInterfaceActive ? 'ACTIVE' : 'stub'}
              </span>
            </div>

            <div className="flex gap-1 flex-wrap">
              <button
                className="bg-emerald-700 hover:bg-emerald-600 px-2 py-0.5 rounded text-[10px]"
                onClick={activatePreferred}
              >▶ Preferred</button>
              <button
                className="bg-rose-700 hover:bg-rose-600 px-2 py-0.5 rounded text-[10px]"
                onClick={activateOpposed}
              >◀ Opposed</button>
              <button
                className="bg-slate-600 hover:bg-slate-500 px-2 py-0.5 rounded text-[10px]"
                onClick={reset}
              >Reset</button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default OneWayValveNetworkEngine;
