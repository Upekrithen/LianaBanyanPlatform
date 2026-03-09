import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { RootComponent } from './RootComponent';
import { SocketComponent } from './SocketComponent';
import { RootType, SocketConfig, validateRootLock } from './RootLockSystem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const RootLockDemo: React.FC = () => {
  const [selectedRoot, setSelectedRoot] = useState<RootType>('single');
  const [hoveredSocket, setHoveredSocket] = useState<string | null>(null);
  const [placedRoots, setPlantedRoots] = useState<Record<string, RootType>>({});

  // Define a simple board with different biomes and socket types
  const sockets: SocketConfig[] = [
    { id: 's1', type: 'single', biome: 'harvest', position: [-2, 0, -2], isOccupied: !!placedRoots['s1'] },
    { id: 's2', type: 'twin', biome: 'navigate', position: [0, 0, -2], isOccupied: !!placedRoots['s2'] },
    { id: 's3', type: 'tri', biome: 'battle', position: [2, 0, -2], isOccupied: !!placedRoots['s3'] },
    { id: 's4', type: 'quad', biome: 'engineer', position: [-2, 0, 0], isOccupied: !!placedRoots['s4'] },
    { id: 's5', type: 'ring', biome: 'magic', position: [0, 0, 0], isOccupied: !!placedRoots['s5'] },
    { id: 's6', type: 'single', biome: 'neutral', position: [2, 0, 0], isOccupied: !!placedRoots['s6'] },
  ];

  const handleSocketClick = (socket: SocketConfig) => {
    if (validateRootLock(selectedRoot, socket)) {
      setPlantedRoots(prev => ({ ...prev, [socket.id]: selectedRoot }));
    }
  };

  const activeSocket = sockets.find(s => s.id === hoveredSocket);
  const isValidHover = activeSocket ? validateRootLock(selectedRoot, activeSocket) : false;

  return (
    <Card className="w-full border-2 border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
        <CardTitle>Root Lock System: "If it fits, it sits"</CardTitle>
        <CardDescription>
          Physical placement mechanics for HexIsle. Select a root type and try to place it in the corresponding biome socket.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['single', 'twin', 'tri', 'quad', 'ring'] as RootType[]).map(type => (
            <Button 
              key={type}
              variant={selectedRoot === type ? "default" : "outline"}
              onClick={() => setSelectedRoot(type)}
              className="capitalize"
            >
              {type} Root
            </Button>
          ))}
          <Button variant="destructive" onClick={() => setPlantedRoots({})}>
            Reset Board
          </Button>
        </div>

        {/* 3D Canvas */}
        <div className="w-full h-[400px] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-700">
          
          {/* UI Overlay */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            {hoveredSocket && activeSocket && (
              <Badge 
                variant="default" 
                className={`text-sm px-3 py-1 ${isValidHover ? 'bg-emerald-500' : 'bg-red-500'}`}
              >
                {isValidHover ? 'Valid Placement' : 'Does Not Fit'}
              </Badge>
            )}
          </div>

          <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Environment preset="city" />
            
            <Grid infiniteGrid fadeDistance={20} sectionColor="#334155" cellColor="#1e293b" />

            {/* Render Sockets */}
            {sockets.map(socket => (
              <group key={socket.id} onClick={() => handleSocketClick(socket)}>
                <SocketComponent 
                  config={socket} 
                  onHover={setHoveredSocket}
                  onHoverOut={() => setHoveredSocket(null)}
                  isTargeted={hoveredSocket === socket.id}
                />
                
                {/* Render placed roots */}
                {placedRoots[socket.id] && (
                  <RootComponent 
                    type={placedRoots[socket.id]} 
                    position={[socket.position[0], 0, socket.position[2]]} 
                  />
                )}

                {/* Render ghost/preview root when hovering */}
                {hoveredSocket === socket.id && !placedRoots[socket.id] && (
                  <RootComponent 
                    type={selectedRoot} 
                    position={[socket.position[0], 0.5, socket.position[2]]} 
                    isDragging={true}
                    isValidLocation={isValidHover}
                  />
                )}
              </group>
            ))}

            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
          </Canvas>
        </div>

        <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-white">Physical Implementation in HexIsle</h4>
          <p>
            This digital demo represents the exact <strong>physical system design</strong> used in the HexIsle tabletop game. The rules are enforced by physical geometry, not just a rulebook:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>Hexels & The Tereno Platform:</strong> The game board is a hydraulically powered mechanical system of pneumatics that enable physical computing. The terrain is built using "Hexels" (hexagonal tiles) that contain these specific socket configurations.</li>
            <li><strong>Biome Boots:</strong> Character miniatures and buildings have specific "Biome Boots" (the roots). A character with a "Twin" boot can physically only be placed into a "Navigate" or "Seek" Hexel.</li>
            <li><strong>Self-Validating:</strong> "If it fits, it sits." If a player tries to put an industrial building (Quad root) into a farming tile (Single socket), it physically will not fit. The game engine is the plastic itself.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
