import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type RootType = 'single' | 'twin' | 'tri' | 'quad' | 'ring';
export type BiomeType = 'crafters_cove' | 'merchants_mile' | 'scholars_spire' | 'builders_basin' | 'healers_haven' | 'rangers_rest' | 'council_keep';

interface RootLockProps {
  position: [number, number, number];
  rootType: RootType;
  biomeCompatibility: BiomeType[];
  color?: string;
}

/**
 * RootLockPiece: A game piece that requires a matching socket to stand upright.
 * "If it fits, it sits."
 */
export const RootLockPiece: React.FC<RootLockProps> = ({ 
  position, 
  rootType, 
  biomeCompatibility,
  color = "#4ade80" 
}) => {
  const pieceRef = useRef<any>(null);
  const [isValid, setIsValid] = useState(false);

  // Define the root geometry based on type
  const getRootGeometry = () => {
    switch (rootType) {
      case 'single': return <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />;
      case 'twin': return <boxGeometry args={[0.6, 0.5, 0.2]} />;
      case 'tri': return <cylinderGeometry args={[0.4, 0.4, 0.5, 3]} />;
      case 'quad': return <boxGeometry args={[0.5, 0.5, 0.5]} />;
      case 'ring': return <torusGeometry args={[0.3, 0.1, 16, 32]} />;
      default: return <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />;
    }
  };

  return (
    <RigidBody 
      ref={pieceRef}
      position={position}
      colliders="hull"
      // If it's not in a valid socket, its center of mass makes it fall over
      centerOfMass={isValid ? [0, 0, 0] : [0, 1, 0]} 
      onCollisionEnter={(e) => {
        // In a full implementation, we'd check if the collided object is a matching socket
        // For this conceptual component, we'll mock the validation
        if (e.other.rigidBodyObject?.name === `socket-${rootType}`) {
          setIsValid(true);
        }
      }}
      onCollisionExit={(e) => {
        if (e.other.rigidBodyObject?.name === `socket-${rootType}`) {
          setIsValid(false);
        }
      }}
    >
      <group>
        {/* The main body of the piece */}
        <mesh position={[0, 0.75, 0]}>
          <capsuleGeometry args={[0.3, 0.4, 1, 16]} />
          <meshStandardMaterial color={isValid ? color : "#ef4444"} />
        </mesh>

        {/* The extended Root (downward) */}
        <mesh position={[0, 0, 0]}>
          {getRootGeometry()}
          <meshStandardMaterial color="#8b5cf6" wireframe={!isValid} />
        </mesh>

        {/* UI Feedback */}
        <Html position={[0, 2, 0]} center>
          <div className={`px-2 py-1 rounded text-xs font-bold text-white transition-opacity ${isValid ? 'bg-green-500 opacity-100' : 'bg-red-500 opacity-0'}`}>
            Root Locked
          </div>
        </Html>
      </group>
    </RigidBody>
  );
};

interface TerrainSocketProps {
  position: [number, number, number];
  socketType: RootType;
  biome: BiomeType;
}

/**
 * RootLockTerrain: The terrain that contains the sockets (Root Holes).
 */
export const RootLockTerrain: React.FC<TerrainSocketProps> = ({ position, socketType, biome }) => {
  return (
    <RigidBody type="fixed" position={position} name={`socket-${socketType}`}>
      <group>
        {/* The Hexel Surface */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[1, 1, 0.5, 6]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>

        {/* The Socket Hole (Visual representation) */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.3, 16]} />
          <meshBasicMaterial color="#374151" />
        </mesh>

        {/* Collider that acts as the socket walls */}
        <CuboidCollider args={[1, 0.5, 1]} position={[0, -0.25, 0]} sensor />
      </group>
    </RigidBody>
  );
};
