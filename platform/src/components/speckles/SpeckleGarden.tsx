import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Sprout, Leaf, TreeDeciduous } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpeckleGardenProps {
  credits: number; // The actual financial unit
  lifetimePlanted: number; // Total credits spent/shared
}

export const SpeckleGarden: React.FC<SpeckleGardenProps> = ({ credits, lifetimePlanted }) => {
  const [plants, setPlants] = useState<{id: number, type: 'sprout' | 'leaf' | 'tree', x: number, y: number}[]>([]);

  // Generate the visual garden based on lifetime planted
  useEffect(() => {
    const numPlants = Math.min(50, Math.floor(lifetimePlanted / 5)); // 1 plant per 5 credits, max 50
    const newPlants = Array.from({ length: numPlants }).map((_, i) => {
      // Determine plant size based on how long ago it was "planted" (mock logic)
      const type = i < numPlants * 0.2 ? 'tree' : i < numPlants * 0.6 ? 'leaf' : 'sprout';
      return {
        id: i,
        type,
        x: Math.random() * 90 + 5, // 5% to 95%
        y: Math.random() * 80 + 10, // 10% to 90%
      };
    });
    setPlants(newPlants);
  }, [lifetimePlanted]);

  return (
    <Card className="w-full overflow-hidden border-2 border-green-900/20 bg-gradient-to-b from-background to-green-900/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-green-700 dark:text-green-500">
              <Sprout className="h-6 w-6" />
              Your Speckle Garden
            </CardTitle>
            <CardDescription>
              The mess isn't waste. The mess is planting.
            </CardDescription>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="bg-muted p-2 rounded-full hover:bg-muted/80 transition-colors">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p><strong>Credits vs. Speckles</strong></p>
                <p className="text-xs mt-1">
                  "Credits" are the technical financial unit of the Three-Gear Currency system. 
                  "Speckles" are how we visualize them. When you earn credits, you <em>grow</em> Speckles. 
                  When you spend or share them, you <em>plant</em> Speckles, generating value for others.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-900/10 p-4 rounded-xl border border-green-900/20 text-center">
            <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-1">Available to Plant</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-green-700 dark:text-green-500">{credits.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">Speckles</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">(Financial Ledger: {credits.toLocaleString()} Credits)</p>
          </div>
          
          <div className="bg-amber-900/10 p-4 rounded-xl border border-amber-900/20 text-center">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">Lifetime Planted</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-amber-700 dark:text-amber-500">{lifetimePlanted.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">Speckles</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Shared with the community</p>
          </div>
        </div>

        {/* The Visual Garden */}
        <div className="relative h-48 bg-green-950/5 rounded-xl border-2 border-dashed border-green-900/20 overflow-hidden">
          {plants.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Sprout className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Your garden is waiting.</p>
              <p className="text-xs">Share Speckles to start planting!</p>
            </div>
          ) : (
            <AnimatePresence>
              {plants.map((plant) => (
                <motion.div
                  key={plant.id}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20, 
                    delay: plant.id * 0.05 
                  }}
                  className="absolute text-green-600 dark:text-green-500"
                  style={{ left: `${plant.x}%`, bottom: `${plant.y}%` }}
                >
                  {plant.type === 'tree' && <TreeDeciduous className="h-8 w-8" />}
                  {plant.type === 'leaf' && <Leaf className="h-6 w-6" />}
                  {plant.type === 'sprout' && <Sprout className="h-4 w-4" />}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {/* Ground line */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-green-900/20 to-transparent" />
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium italic text-muted-foreground">
            "One True Act of Kindness ALWAYS Sparks Another."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
