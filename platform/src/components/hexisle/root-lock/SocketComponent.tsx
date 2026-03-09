import React, { useState } from 'react';
import { RootType, BiomeType, SocketConfig, ROOT_DICTIONARY } from './RootLockSystem';

interface SocketComponentProps {
  config: SocketConfig;
  onHover?: (socketId: string) => void;
  onHoverOut?: () => void;
  isTargeted?: boolean;
}

export const SocketComponent: React.FC<SocketComponentProps> = ({ 
  config, 
  onHover, 
  onHoverOut,
  isTargeted = false
}) => {
  const [hovered, setHovered] = useState(false);
  const rootConfig = ROOT_DICTIONARY[config.type];

  // Colors based on biome
  const getBiomeColor = () => {
    switch(config.biome) {
      case 'harvest': return '#22c55e'; // Green
      case 'navigate': return '#3b82f6'; // Blue
      case 'engineer': return '#f59e0b'; // Amber
      case 'battle': return '#ef4444'; // Red
      case 'seek': return '#a855f7'; // Purple
      case 'magic': return '#ec4899'; // Pink
      case 'train': return '#eab308'; // Yellow
      default: return '#94a3b8'; // Slate
    }
  };

  const renderHoles = () => {
    const holes = [];
    const color = isTargeted ? '#ffffff' : (hovered ? '#cbd5e1' : '#0f172a');

    if (config.type === 'single') {
      holes.push(
        <mesh key="hole-0" position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    } else {
      for (let i = 0; i < rootConfig.pinCount; i++) {
        const angle = (i / rootConfig.pinCount) * Math.PI * 2;
        const x = Math.cos(angle) * rootConfig.radius;
        const z = Math.sin(angle) * rootConfig.radius;
        
        holes.push(
          <mesh key={`hole-${i}`} position={[x, -0.01, z]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 16]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      }
    }

    return holes;
  };

  return (
    <group 
      position={config.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (onHover) onHover(config.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        if (onHoverOut) onHoverOut();
      }}
    >
      {/* The Socket Base (Hexagon or Circle indicating the spot) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 6]} />
        <meshStandardMaterial 
          color={getBiomeColor()} 
          transparent 
          opacity={isTargeted ? 0.8 : 0.4} 
        />
      </mesh>

      {/* The actual holes that the roots fit into */}
      {renderHoles()}
    </group>
  );
};
