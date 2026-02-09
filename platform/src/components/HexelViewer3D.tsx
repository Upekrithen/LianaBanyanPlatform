import { Suspense, useEffect, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function HexelModel() {
  const obj = useLoader(OBJLoader, "/models/slottedTop_v1.obj");
  
  return (
    <primitive 
      object={obj} 
      scale={0.5}
      rotation={[Math.PI / 6, 0, 0]}
    />
  );
}

export const HexelViewer3D = () => {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Hexel Component: Slotted Top Capstone</CardTitle>
            <CardDescription>
              3D model of the hexagonal capstone piece (36-48mm tower component)
            </CardDescription>
          </div>
          <Badge variant="outline">Interactive 3D Model</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[500px] bg-gradient-to-br from-background to-muted rounded-lg overflow-hidden border">
          <Canvas
            camera={{ position: [5, 5, 5], fov: 50 }}
            shadows
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
              <directionalLight position={[-10, -10, -5]} intensity={0.3} />
              <pointLight position={[0, 5, 0]} intensity={0.5} />
              
              <HexelModel />
              
              <OrbitControls 
                enableZoom={true}
                enablePan={true}
                minDistance={2}
                maxDistance={15}
                autoRotate
                autoRotateSpeed={0.5}
              />
              
              <Environment preset="studio" />
              <gridHelper args={[10, 10]} />
            </Suspense>
          </Canvas>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Controls:</strong> Left-click and drag to rotate • Right-click and drag to pan • Scroll to zoom
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">Capstone Component</Badge>
            <Badge variant="secondary">Hexagonal Tower</Badge>
            <Badge variant="secondary">36-48mm Height</Badge>
            <Badge variant="secondary">3D Printable</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
