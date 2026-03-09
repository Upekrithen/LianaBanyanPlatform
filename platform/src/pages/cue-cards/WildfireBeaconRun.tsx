import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Flame, Play, Pause, Ghost, Map, Crosshair, ArrowRight, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WildfireBeaconRun() {
  const [isTourActive, setIsTourActive] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(0);
  const { toast } = useToast();

  const tourLocations = [
    { name: "The Merchant's Mile (Harvest Island)", desc: "Where businesses launch at Cost+20%." },
    { name: "The Hall of Records", desc: "The immutable ledger of IP ownership." },
    { name: "The Salt Mines", desc: "Where builders claim bounties and find work." },
    { name: "The Family Table", desc: "Local food ecosystems and community hubs." }
  ];

  // Handle the Ghost World pause logic
  // Removed the 30-second forced return timer. The Half-Life is about session decay, not a forced timer.
  const handlePause = () => {
    setIsTourActive(false);
    toast({
      title: "Ghost World Active",
      description: "You have paused the tour. Drop a beacon to save this location, but remember: non-members lose half their progress when they leave.",
    });
  };

  const handleDropBeacon = () => {
    toast({
      title: "Beacon Dropped!",
      description: "You can now send this as a Cue Card Treasure Map to others.",
      variant: "default",
    });
  };

  const handleNextLocation = () => {
    setCurrentLocation((prev) => (prev + 1) % tourLocations.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 relative overflow-hidden">
      
      {/* Tour Overlay UI */}
      <div className="absolute top-6 left-0 right-0 flex justify-center z-50">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="font-bold text-slate-200">WildFire Tour</span>
          </div>
          
          <div className="h-4 w-px bg-slate-700" />
          
          <div className="text-sm text-slate-400">
            Location {currentLocation + 1} of {tourLocations.length}: <strong className="text-slate-200">{tourLocations[currentLocation].name}</strong>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {isTourActive ? (
            <Button size="sm" variant="secondary" onClick={handlePause} className="bg-slate-800 hover:bg-slate-700 text-white border-none">
              <Pause className="w-4 h-4 mr-2" /> Pause & Interact
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Badge variant="destructive" className="bg-purple-500/20 text-purple-400 border-purple-500/50 animate-pulse">
                Half-Life Decay Active
              </Badge>
              <Button size="sm" onClick={() => setIsTourActive(true)} className="bg-orange-600 hover:bg-orange-500">
                <Play className="w-4 h-4 mr-2" /> Resume Tour
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-24 space-y-8">
        
        {/* The "Viewport" of the Tour */}
        <Card className={`border-2 transition-all duration-500 ${isTourActive ? 'border-slate-800 bg-slate-900' : 'border-purple-500/50 bg-purple-950/20 shadow-[0_0_50px_rgba(168,85,247,0.15)]'}`}>
          <CardContent className="p-12 min-h-[400px] flex flex-col items-center justify-center text-center space-y-6">
            
            {!isTourActive && (
              <Badge className="absolute top-4 left-4 bg-purple-500/20 text-purple-300 border-purple-500/50">
                <Ghost className="w-3 h-3 mr-1" /> Ghost World Active
              </Badge>
            )}

            <h2 className="text-4xl font-bold text-white">{tourLocations[currentLocation].name}</h2>
            <p className="text-xl text-slate-400 max-w-2xl">{tourLocations[currentLocation].desc}</p>

            {isTourActive ? (
              <div className="mt-8 animate-pulse text-slate-500 flex items-center gap-2">
                <Play className="w-5 h-5" /> Auto-playing next location soon...
                <Button variant="ghost" size="sm" onClick={handleNextLocation} className="ml-4">Skip <ArrowRight className="w-4 h-4 ml-1"/></Button>
              </div>
            ) : (
              <div className="mt-8 grid md:grid-cols-3 gap-4 w-full max-w-3xl animate-in fade-in zoom-in duration-300">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-slate-700 hover:border-purple-500 hover:bg-purple-500/10">
                  <Ghost className="w-6 h-6 text-purple-400" />
                  <span>Use Ghost Credits</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-slate-700 hover:border-orange-500 hover:bg-orange-500/10" onClick={handleDropBeacon}>
                  <Crosshair className="w-6 h-6 text-orange-400" />
                  <span>Drop Beacon</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 border-slate-700 hover:border-blue-500 hover:bg-blue-500/10">
                  <Map className="w-6 h-6 text-blue-400" />
                  <span>Create Treasure Map</span>
                </Button>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Explanation Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-300">
                <Ghost className="w-5 h-5 text-purple-400" />
                The Half-Life System
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400 space-y-2">
              <p>When you pause the tour, you enter <strong>Ghost World</strong>. You can interact with the real platform using "Ghost Credits" to see how it works.</p>
              <p><strong>The Catch:</strong> Non-members are subject to Half-Life decay. When your session ends, you lose half of what you collected (like Crow Feathers). Members keep 100% of their progress permanently.</p>
              <div className="bg-slate-950 p-3 rounded border border-slate-800 mt-4 flex items-center justify-between">
                <span>Want to bypass the Half-Life?</span>
                <Button size="sm" variant="outline" className="border-emerald-500/50 text-emerald-400">
                  <Save className="w-4 h-4 mr-2" /> Become a Member
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-300">
                <Crosshair className="w-5 h-5 text-orange-400" />
                Dropping Beacons
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-400 space-y-2">
              <p>While paused, you can "Drop a Beacon" on anything you find interesting. This paints the item so you can return to it later.</p>
              <p>You can also turn your Beacons into a <strong>Free Ghost World Beacon Run Game</strong> (a Treasure Map) and send it as a Cue Card to your social media. If someone signs up through your map, you earn rewards.</p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
