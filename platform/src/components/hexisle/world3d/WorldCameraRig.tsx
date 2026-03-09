/**
 * WORLD CAMERA RIG
 * ================
 * Camera controller with smooth fly-to transitions.
 *
 * Modes:
 *   - Archipelago: orbital at Y=80, viewing full south-to-north chain
 *   - Island: fly-to specific island, orbit closer
 *   - City: zoomed tight on city structures, orbit very close
 *
 * Transitions use useFrame lerp (~1.5s ease-out).
 */

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useWorldNavigation } from "@/contexts/WorldNavigationContext";

// ─── Camera Defaults ────────────────────────────────────────────────────────

const ARCHIPELAGO_POSITION = new THREE.Vector3(8, 80, 60);
const ARCHIPELAGO_TARGET = new THREE.Vector3(8, 0, 20);

const LERP_SPEED = 2.5; // Higher = faster transition

// ─── Component ──────────────────────────────────────────────────────────────

export function WorldCameraRig() {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const { cameraMode, targetPosition, activeIsland, isTransitioning, setTransitioning } =
    useWorldNavigation();

  // Current interpolation targets
  const targetCamPos = useRef(ARCHIPELAGO_POSITION.clone());
  const targetLookAt = useRef(ARCHIPELAGO_TARGET.clone());

  // Update targets when navigation changes
  useEffect(() => {
    if (cameraMode === "archipelago") {
      targetCamPos.current.copy(ARCHIPELAGO_POSITION);
      targetLookAt.current.copy(ARCHIPELAGO_TARGET);
    } else if (targetPosition && activeIsland) {
      targetCamPos.current.set(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z
      );

      // City mode: look at the city center (targetPosition already offset)
      // Island mode: look at island center
      if (cameraMode === "city") {
        targetLookAt.current.set(
          targetPosition.x,
          1,
          targetPosition.z - 8  // Offset back since camera is Z+8
        );
      } else {
        targetLookAt.current.set(
          activeIsland.worldPosition.x,
          2,
          activeIsland.worldPosition.z
        );
      }
    }
  }, [cameraMode, targetPosition, activeIsland]);

  // Smooth camera transition
  useFrame((_, delta) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const speed = LERP_SPEED * delta;

    // Lerp camera position
    camera.position.lerp(targetCamPos.current, speed);

    // Lerp orbit controls target (look-at point)
    controls.target.lerp(targetLookAt.current, speed);
    controls.update();

    // Check if transition is complete
    if (isTransitioning) {
      const posDist = camera.position.distanceTo(targetCamPos.current);
      if (posDist < 0.5) {
        setTransitioning(false);
      }
    }
  });

  // Zoom constraints per mode
  const minDist = cameraMode === "archipelago" ? 30 : cameraMode === "city" ? 3 : 5;
  const maxDist = cameraMode === "archipelago" ? 120 : cameraMode === "city" ? 20 : 40;

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[ARCHIPELAGO_POSITION.x, ARCHIPELAGO_POSITION.y, ARCHIPELAGO_POSITION.z]}
        fov={50}
        near={0.1}
        far={500}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={minDist}
        maxDistance={maxDist}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.2}
        target={[ARCHIPELAGO_TARGET.x, ARCHIPELAGO_TARGET.y, ARCHIPELAGO_TARGET.z]}
      />
    </>
  );
}

export default WorldCameraRig;
