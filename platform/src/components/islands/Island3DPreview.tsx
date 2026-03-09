import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';

interface Island3DPreviewProps {
  islandData: {
    buildings: Array<{
      x: number;
      y: number;
      type: string;
      size?: number;
    }>;
    terrain?: {
      shape: 'hexagon' | 'circle' | 'square';
      size: number;
    };
  };
}

function IslandTerrain({ shape, size }: { shape: string; size: number }) {
  const geometry = shape === 'hexagon' 
    ? new THREE.CylinderGeometry(size, size, 2, 6)
    : new THREE.CylinderGeometry(size, size, 2, 32);

  return (
    <mesh geometry={geometry} position={[0, -1, 0]}>
      <meshStandardMaterial color="#4ade80" roughness={0.8} />
    </mesh>
  );
}

function Building({ x, y, type, size = 1 }: { x: number; y: number; type: string; size?: number }) {
  const colors = {
    house: '#8b5cf6',
    tower: '#3b82f6',
    workshop: '#f59e0b',
    default: '#6b7280',
  };

  const color = colors[type as keyof typeof colors] || colors.default;
  const height = type === 'tower' ? 4 : type === 'house' ? 2 : 3;

  return (
    <mesh position={[x, height / 2, y]}>
      <boxGeometry args={[size, height, size]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

export function Island3DPreview({ islandData }: Island3DPreviewProps) {
  const terrain = islandData.terrain || { shape: 'hexagon', size: 10 };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-b from-sky-300 to-blue-200">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[15, 12, 15]} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={50}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />
          
          {/* Environment */}
          <Environment preset="sunset" />
          
          {/* Island Terrain */}
          <IslandTerrain shape={terrain.shape} size={terrain.size} />
          
          {/* Buildings */}
          {islandData.buildings.map((building, index) => (
            <Building
              key={index}
              x={building.x}
              y={building.y}
              type={building.type}
              size={building.size}
            />
          ))}
          
          {/* Water plane */}
          <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial 
              color="#0ea5e9" 
              transparent 
              opacity={0.6}
              roughness={0.1}
            />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
}