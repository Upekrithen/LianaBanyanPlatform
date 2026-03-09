import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sprout, TreePine, Leaf, Coins, ArrowRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SpeckleGardenProps {
  availableCredits: number;
  lifetimePlanted: number; // Total credits spent/shared over time
}

export const SpeckleGarden: React.FC<SpeckleGardenProps> = ({ availableCredits, lifetimePlanted }) => {
  // Calculate garden level based on lifetime planted
  const getGardenLevel = (planted: number) => {
    if (planted < 100) return { level: 1, title: "Seedling", nextThreshold: 100, icon: <Sprout className="h-8 w-8 text-emerald-400" /> };
    if (planted < 500) return { level: 2, title: "Sapling", nextThreshold: 500, icon: <Leaf className="h-8 w-8 text-emerald-500" /> };
    if (planted < 2500) return { level: 3, title: "Young Banyan", nextThreshold: 2500, icon: <TreePine className="h-8 w-8 text-emerald-600" /> };
    return { level: 4, title: "Deep Roots", nextThreshold: 10000, icon: <TreePine className="h-8 w-8 text-emerald-800" /> };
  };

  const gardenStats = getGardenLevel(lifetimePlanted);
  const progressToNext = Math.min(100, (lifetimePlanted / gardenStats.nextThreshold) * 100);

  return (
    <Card className="w-full border-2 border-emerald-100 dark:border-emerald-900/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 pb-8">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl text-emerald-900 dark:text-emerald-400">
              {gardenStats.icon}
              Your Speckle Garden
            </CardTitle>
            <CardDescription className="mt-2 text-emerald-700/70 dark:text-emerald-400/70 italic font-serif text-base">
              "The mess isn't waste, it's planting."
            </CardDescription>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="bg-white/50 dark:bg-slate-900/50 border-emerald-200">
                  <Info className="h-3 w-3 mr-1" /> How this works
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-4">
                <p className="text-sm">
                  <strong>Credits</strong> are the technical unit of account ($1 = 1 Credit).<br/><br/>
                  <strong>Speckles</strong> are what happens when you spend them. Instead of "losing" money, you are planting seeds in the cooperative economy. Your lifetime planted speckles grow your reputation and garden level.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="-mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Liquid Credits (The Seeds) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                Available Seeds (Credits)
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {availableCredits.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Liquid value ready to be spent or shared.
              </p>
            </div>
          </div>

          {/* Planted Speckles (The Garden) */}
          <div className="bg-emerald-600 p-5 rounded-xl border border-emerald-500 shadow-sm text-white relative z-10">
            <div>
              <p className="text-sm font-medium text-emerald-100 flex items-center gap-2">
                <Sprout className="h-4 w-4 text-emerald-200" />
                Lifetime Planted (Speckles)
              </p>
              <h3 className="text-3xl font-bold mt-1">
                {lifetimePlanted.toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-200 mt-2">
                Total value you've circulated into the community.
              </p>
            </div>
          </div>

        </div>

        {/* Growth Progress */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Level {gardenStats.level}: {gardenStats.title}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {lifetimePlanted.toLocaleString()} / {gardenStats.nextThreshold.toLocaleString()} to next stage
            </p>
          </div>
          <Progress value={progressToNext} className="h-3 bg-emerald-100 dark:bg-emerald-950" />
        </div>

      </CardContent>
    </Card>
  );
};
