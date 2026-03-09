/**
 * OCEAN PLANE
 * ===========
 * Animated water surface at sea level.
 * Uses useFrame for gentle wave displacement.
 * Extends the pattern from Island3DPreview.tsx.
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SEA_LEVEL, HEIGHT_SCALE } from "@/lib/hexIsleWorldData";

interface OceanPlaneProps {
  size?: number;
  opacity?: number;
}

export function OceanPlane({ size = 300, opacity = 0.55 }: OceanPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);

  // Create plane geometry with enough segments for wave animation
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(size, size, 64, 64);
  }, [size]);

  // Store original Y positions for wave animation
  const originalPositions = useMemo(() => {
    const pos = geometry.attributes.position;
    return Float32Array.from(pos.array);
  }, [geometry]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const time = clock.getElapsedTime();
    const positions = geometry.attributes.position;

    // Gentle wave displacement
    for (let i = 0; i < positions.count; i++) {
      const x = originalPositions[i * 3];
      const z = originalPositions[i * 3 + 1]; // In the plane, Y is actually Z before rotation
      const wave1 = Math.sin(x * 0.03 + time * 0.5) * 0.15;
      const wave2 = Math.sin(z * 0.04 + time * 0.3) * 0.1;
      const wave3 = Math.sin((x + z) * 0.02 + time * 0.7) * 0.08;
      positions.setZ(i, wave1 + wave2 + wave3);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  const waterY = SEA_LEVEL * HEIGHT_SCALE;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, waterY, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        ref={materialRef}
        color="#0c7db5"
        transparent
        opacity={opacity}
        roughness={0.1}
        metalness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default OceanPlane;
