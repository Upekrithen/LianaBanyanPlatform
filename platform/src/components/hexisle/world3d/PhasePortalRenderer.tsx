/**
 * PHASE PORTAL RENDERER
 * =====================
 * Renders Phase MimicTrunk portals in the HexIsle 3D world.
 *
 * Visual elements:
 *   - Glowing portal rings above Guild Towers and Keeps
 *   - Color-coded by connection status (green=active, amber=suspended, etc.)
 *   - Pulsing animation based on validation state
 *   - Floating labels showing Phase name and status
 *   - Particle effect for active portals
 *
 * Innovation #1511: HexIsle Phase MimicTrunk Bridge
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  type PhasePortal,
  type PhaseOverlay,
  PHASE_STATUS_COLORS,
  PHASE_STATUS_LABELS,
  getPortalWorldPosition,
  getPortalGlowIntensity,
  getPortalPulseSpeed,
} from '@/lib/hexIslePhaseBridge';
import { type PhaseConnectionStatus } from '@/lib/discourse/phaseMimicTrunks';
import { ISLANDS } from '@/lib/hexIsleWorldData';

// ─── Portal Ring ──────────────────────────────────────────────────────────────

function PortalRing({
  position,
  color,
  intensity,
  pulseSpeed,
  isActive,
  portalName,
  status,
}: {
  position: [number, number, number];
  color: string;
  intensity: number;
  pulseSpeed: number;
  isActive: boolean;
  portalName: string;
  status?: PhaseConnectionStatus;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;

    // Rotation
    ringRef.current.rotation.y = clock.elapsedTime * 0.3;

    // Pulse scale
    if (pulseSpeed > 0) {
      const pulse = 1 + Math.sin(clock.elapsedTime * (Math.PI * 2 / pulseSpeed)) * 0.1;
      ringRef.current.scale.setScalar(pulse);
    }

    // Glow intensity pulse
    if (glowRef.current && pulseSpeed > 0) {
      const glowPulse = intensity * (0.8 + Math.sin(clock.elapsedTime * (Math.PI * 2 / pulseSpeed)) * 0.2);
      glowRef.current.intensity = glowPulse * 3;
    }
  });

  const portalColor = new THREE.Color(color);

  return (
    <group position={position}>
      {/* Ring geometry */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.05, 16, 32]} />
        <meshStandardMaterial
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={intensity * 2}
          transparent
          opacity={0.7 + intensity * 0.3}
        />
      </mesh>

      {/* Inner disc (translucent) */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 32]} />
          <meshStandardMaterial
            color={portalColor}
            emissive={portalColor}
            emissiveIntensity={intensity}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Point light glow */}
      <pointLight
        ref={glowRef}
        color={color}
        intensity={intensity * 3}
        distance={4}
        decay={2}
      />

      {/* Label */}
      <Html
        position={[0, 1.2, 0]}
        center
        distanceFactor={15}
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-center whitespace-nowrap">
          <div
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${color}30`,
              color: color,
              border: `1px solid ${color}50`,
            }}
          >
            {portalName}
          </div>
          {status && (
            <div className="text-[10px] mt-1 opacity-70" style={{ color }}>
              {PHASE_STATUS_LABELS[status].split(' — ')[0]}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ─── Phase Keep Indicator ─────────────────────────────────────────────────────

function PhaseKeepIndicator({
  position,
  color,
  keepName,
  ownerName,
}: {
  position: [number, number, number];
  color: string;
  keepName: string;
  ownerName: string;
}) {
  const beaconRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!beaconRef.current) return;
    beaconRef.current.rotation.y = clock.elapsedTime * 0.5;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.15;
    beaconRef.current.scale.setScalar(pulse);
  });

  const beaconColor = new THREE.Color(color);

  return (
    <group position={position}>
      {/* Diamond-shaped beacon */}
      <mesh ref={beaconRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={beaconColor}
          emissive={beaconColor}
          emissiveIntensity={1.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[0, 0.8, 0]}
        center
        distanceFactor={15}
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-center whitespace-nowrap">
          <div className="text-[10px] font-medium text-amber-400 bg-slate-900/80 px-2 py-0.5 rounded">
            {keepName}
          </div>
          <div className="text-[8px] text-white/50">{ownerName}</div>
        </div>
      </Html>
    </group>
  );
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

interface PhasePortalRendererProps {
  overlay: PhaseOverlay;
  islandId: number;
}

export function PhasePortalRenderer({ overlay, islandId }: PhasePortalRendererProps) {
  const island = ISLANDS.find(i => i.id === islandId);
  if (!island) return null;

  const islandPos = island.worldPosition;

  return (
    <group>
      {/* Phase Portals */}
      {overlay.portals
        .filter(p => p.islandId === islandId)
        .map(portal => {
          const worldPos = getPortalWorldPosition(portal, islandPos);
          const intensity = getPortalGlowIntensity(portal);

          // Get connection status from linked trunk
          let status: PhaseConnectionStatus | undefined;
          if (portal.linkedTrunkId && overlay.currentPhase?.id === portal.linkedTrunkId) {
            status = overlay.currentPhase.connectionStatus;
          }

          const pulseSpeed = status ? getPortalPulseSpeed(status) : (portal.isActive ? 3.0 : 0);

          return (
            <PortalRing
              key={portal.id}
              position={[worldPos.x, worldPos.y + 2, worldPos.z]}
              color={portal.glowColor}
              intensity={intensity}
              pulseSpeed={pulseSpeed}
              isActive={portal.isActive}
              portalName={portal.name}
              status={status}
            />
          );
        })}

      {/* Phase Keeps */}
      {overlay.phaseKeeps
        .filter(pk => pk.islandId === islandId)
        .map(phaseKeep => {
          const centerHex = phaseKeep.hexPositions[0];
          if (!centerHex) return null;

          const localPos = {
            x: islandPos.x + centerHex.q * 1.2,
            z: islandPos.z + centerHex.r * 1.2,
          };

          return (
            <PhaseKeepIndicator
              key={phaseKeep.keepId}
              position={[localPos.x, 10, localPos.z]}
              color={PHASE_STATUS_COLORS[phaseKeep.connectionStatus]}
              keepName={phaseKeep.keepName}
              ownerName={phaseKeep.ownerName}
            />
          );
        })}

      {/* Phase Active Indicator (if player is in a Phase) */}
      {overlay.isInPhase && overlay.currentPhase && (
        <Html
          position={[islandPos.x, 25, islandPos.z]}
          center
          distanceFactor={30}
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex items-center gap-2 bg-slate-900/90 border border-green-500/50 rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">
              In Phase: {overlay.currentPhase.name}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default PhasePortalRenderer;
