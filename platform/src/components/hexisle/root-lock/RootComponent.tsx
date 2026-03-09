import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RootType, BiomeType, ROOT_DICTIONARY } from './RootLockSystem';
import * as THREE from 'three';

interface RootComponentProps {
  type: RootType;
  position: [number, number, number];
  isDragging?: boolean;
  isValidLocation?: boolean;
}

export const RootComponent: React.FC<RootComponentProps> = ({ 
  type, 
  position, 
  isDragging = false,
  isValidLocation = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const config = ROOT_DICTIONARY[type];

  // Animation for dragging state
  useFrame((state) => {
    if (isDragging && groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 5) * 0.1;
    }
  });

  // Determine color based on state
  const getColor = () => {
    if (!isDragging) return '#8B4513'; // Wood/Root color
    return isValidLocation ? '#4ade80' : '#ef4444'; // Green if fits, Red if doesn't
  };

  const renderPins = () => {
    const pins = [];
    const color = getColor();

    if (type === 'single') {
      pins.push(
        <mesh key="pin-0" position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    } else {
      // Calculate positions for multiple pins in a circle
      for (let i = 0; i < config.pinCount; i++) {
        const angle = (i / config.pinCount) * Math.PI * 2;
        const x = Math.cos(angle) * config.radius;
        const z = Math.sin(angle) * config.radius;
        
        pins.push(
          <mesh key={`pin-${i}`} position={[x, -0.5, z]}>
            <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      }
    }

    return pins;
  };

  return (
    <group ref={groupRef} position={position}>
      {/* The base of the component (the part above ground) */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.5, 0.5, 1.5]} />
        <meshStandardMaterial color="#64748b" transparent opacity={isDragging ? 0.8 : 1} />
      </mesh>
      
      {/* The roots (the part that goes into the socket) */}
      {renderPins()}
    </group>
  );
};
