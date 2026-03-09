import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Trophy, Timer, Feather, Key, Flame, Plus, GripHorizontal, Settings, Users, Share2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DMKeepSystem() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMap = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Treasure Map Saved!",
        description: "Your custom Ghost World campaign is ready to share.",
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-rose-600 rounded-full text-white">
          <Map className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">The Keep & Treasure Maps</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Ghost World leaderboards, Rolling Persistence, and the DM Campaign Builder.
          </p>
        </div>
      </div>

      <Tabs defaultValue="leaderboards" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8 w-full max-w-2xl">
          <TabsTrigger value="leaderboards">Live Leaderboards</TabsTrigger>
          <TabsTrigger value="persistence">Rolling Persistence</TabsTrigger>
          <TabsTrigger value="builder" className="text-rose-600 data-[state=active]:text-rose-700">DM Map Builder</TabsTrigger>
        </TabsList>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-t-4 border-t-slate-800">
              <CardHeader className="text-center pb-2">
                <Feather className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                <CardTitle>Crow Feathers</CardTitle>
                <CardDescription>Most collected in a single session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Ghost_492", score: 142, isUser: false },
                    { name: "SarahJ", score: 118, isUser: false },
                    { name: "You (Guest)", score: 45, isUser: true },
                  ].map((player, i) => (
                    <div key={i} className={`flex justify-between items-center p-2 rounded ${player.isUser ? 'bg-slate-100 dark:bg-slate-800 font-bold' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-4">{i + 1}.</span>
                        <span>{player.name}</span>
                      </div>
                      <span>{player.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-amber-500">
              <CardHeader className="text-center pb-2">
                <Key className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <CardTitle>Golden Keys</CardTitle>
                <CardDescription>Fastest puzzle completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "MarcusT", score: "4m 12s", isUser: false },
                    { name: "Ghost_881", score: "5m 40s", isUser: false },
                    { name: "ElenaR", score: "6m 15s", isUser: false },
                  ].map((player, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-4">{i + 1}.</span>
                        <span>{player.name}</span>
                      </div>
                      <span>{player.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-orange-500">
              <CardHeader className="text-center pb-2">
                <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <CardTitle>Candles</CardTitle>
                <CardDescription>Longest active exploration streaks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Explorer_99", score: "14 Nodes", isUser: false },
                    { name: "DaveW", score: "12 Nodes", isUser: false },
                    { name: "Ghost_112", score: "9 Nodes", isUser: false },
                  ].map((player, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 w-4">{i + 1}.</span>
                        <span>{player.name}</span>
                      </div>
                      <span>{player.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rolling Persistence Tab */}
        <TabsContent value="persistence" className="space-y-6">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-6 w-6 text-blue-500" />
                Your Half-Life Status
              </CardTitle>
              <CardDescription>
                Non-members lose half their progress when they log off. Earn Rolling Persistence to save your Ghost World state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border">
                <p className="text-sm text-slate-500 mb-2">Current Unlocked Persistence</p>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">3 Days <span className="text-lg font-normal text-slate-500">(72 Hours)</span></h2>
                <p className="text-sm mt-4 text-slate-600">
                  You can log off now. Your progress will be saved exactly as it is for 3 days. 
                  Log back in before the timer expires to reset the clock.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Persistence Tiers</span>
                  <span className="text-rose-500">Goal: 30 Days (Unlocks DM Builder)</span>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 px-1">
                    <span>1 Hr</span>
                    <span className="text-blue-600 font-bold">3 Days</span>
                    <span>7 Days</span>
                    <span>14 Days</span>
                    <span>30 Days</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
                <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2">Want permanent saves?</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Members ($5/year) get infinite persistence, keep 100% of their loot, and instantly unlock the DM Treasure Map Builder.
                </p>
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">Become a Member</Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* DM Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Beacons</CardTitle>
                  <CardDescription>Drag these into your campaign timeline.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { name: "The Hall of Records", type: "Location" },
                    { name: "Tower of Peace", type: "Location" },
                    { name: "Find the Golden Key", type: "Action" },
                    { name: "Read the 9 Laws", type: "Action" },
                  ].map((beacon, i) => (
                    <div key={i} className="p-3 border rounded bg-slate-50 dark:bg-slate-900 flex items-center justify-between cursor-grab active:cursor-grabbing">
                      <div className="flex items-center gap-2">
                        <GripHorizontal className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-sm">{beacon.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{beacon.type}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full border-2 border-rose-200 dark:border-rose-900">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-rose-800 dark:text-rose-400">Campaign Timeline</CardTitle>
                    <CardDescription>Design your custom Game Night.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" /> Campaign Settings
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg relative">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xs">1</div>
                    <div className="ml-4">
                      <h4 className="font-bold">Location: The Hall of Records</h4>
                      <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900 rounded border">
                        <p className="text-sm font-medium mb-1">Custom Trigger (If/Then)</p>
                        <p className="text-xs text-slate-500 font-mono bg-slate-200 dark:bg-slate-800 p-2 rounded">
                          IF user enters phrase: "Speak friend and enter"<br/>
                          THEN reveal: "The first clue is hidden in the 3rd Patent Bag."
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-800"></div>
                  </div>

                  <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg relative">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-xs">2</div>
                    <div className="ml-4">
                      <div className="h-20 flex items-center justify-center text-slate-400 gap-2">
                        <Plus className="h-5 w-5" /> Drop next Beacon here
                      </div>
                    </div>
                  </div>

                </CardContent>
                <CardFooter className="justify-between border-t p-4 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Users className="h-4 w-4" /> Discord Integration Active
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" /> Generate Cue Card
                    </Button>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2" onClick={handleSaveMap} disabled={isSaving}>
                      <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Campaign"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}