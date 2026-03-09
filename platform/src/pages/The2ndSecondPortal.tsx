import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Box, Upload, CheckCircle2, Factory, FileDown, Camera, Award, ShieldCheck, Rocket, Network, Clock, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function The2ndSecondPortal() {
  const { toast } = useToast();
  const [isJoined, setIsJoined] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleJoinGuild = () => {
    setIsJoined(true);
    toast({
      title: "Welcome to the Prototyper Guild!",
      description: "You now have access to the Master STL Vault.",
    });
  };

  const handleUploadReport = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Test Report Submitted",
        description: "Your data has entered Quorum Aggregation. You will receive Marks once verified!",
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-zinc-800 rounded-full text-zinc-100">
          <Factory className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">The 2nd Second</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The Distributed Factory. Download STLs, print prototypes, and earn IP-backed Platform Value.
          </p>
        </div>
      </div>

      {/* The Template Callout */}
      <Card className="mb-12 border-2 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Rocket className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">You Can Do This Too: The HexIsle Template</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Everything we are doing with HexIsle is just the first real-life example. You can launch your own product line here using this exact same engine. When you launch, you choose your Level of Engagement:
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-slate-900 p-3 rounded border">
                  <span className="font-bold text-blue-600">Level A (Open)</span>
                  <p className="text-slate-500 mt-1">Like HexIsle. Free STLs, IP sold/included, maximum community backing and volume.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded border">
                  <span className="font-bold text-purple-600">Level B (Hybrid)</span>
                  <p className="text-slate-500 mt-1">Keep more control, share specific components. Balanced creator percentage.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded border">
                  <span className="font-bold text-slate-600">Level C (Closed)</span>
                  <p className="text-slate-500 mt-1">Maximum control, traditional IP protection. Lower community multiplier.</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4 italic">
                Not sure which to choose? Use the <strong>Contingency Operators (Simulator)</strong> to test your idea with Real People who earn Marks for giving you real feedback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isJoined ? (
        <Card className="border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 max-w-3xl mx-auto">
          <CardHeader className="text-center pb-2">
            <Printer className="h-16 w-16 mx-auto text-zinc-400 mb-4" />
            <CardTitle className="text-3xl">Join the Prototyper Guild</CardTitle>
            <CardDescription className="text-base mt-2">
              Have an FDM or SLA 3D printer? Turn your idle machine time into IP-backed Platform Value.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white dark:bg-zinc-950 rounded-lg shadow-sm border">
                <FileDown className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <h4 className="font-bold">1. Get Free STLs</h4>
                <p className="text-xs text-slate-500 mt-1">Access 1,200+ CAD files, starting with the 24 HexIsle core components.</p>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-950 rounded-lg shadow-sm border">
                <Printer className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                <h4 className="font-bold">2. Print & Test</h4>
                <p className="text-xs text-slate-500 mt-1">Print the files for personal use. Test tolerances, compliant mechanisms, and IIFIS boots.</p>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-950 rounded-lg shadow-sm border">
                <Award className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                <h4 className="font-bold">3. Earn Marks</h4>
                <p className="text-xs text-slate-500 mt-1">Upload photos and specs to earn Marks backed by the Liana Banyan patent portfolio.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white px-8" onClick={handleJoinGuild}>
              Register My Printer
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Tabs defaultValue="vault" className="w-full">
          <TabsList className="grid grid-cols-3 w-[600px] mb-8">
            <TabsTrigger value="vault">The STL Vault</TabsTrigger>
            <TabsTrigger value="report">Test & Report</TabsTrigger>
            <TabsTrigger value="noids" className="text-amber-600 data-[state=active]:text-amber-700">Role Bounties (NOIDS)</TabsTrigger>
          </TabsList>

          <TabsContent value="vault" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">HexIsle Core Components</h2>
                <p className="text-sm text-slate-500">We don't know the exact print times or material costs yet. We need Proteus Test-Pilots to find out.</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <ShieldCheck className="h-3 w-3 mr-1" /> Free for Personal Use
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Peasant Character Base", type: "FDM/SLA", time: "TBD", size: "12mb", needsPilot: true },
                { name: "Water Table Hex Tile", type: "FDM", time: "TBD", size: "24mb", needsPilot: true },
                { name: "Compliant Hit Point Ratchet", type: "SLA", time: "TBD", size: "8mb", needsPilot: true },
                { name: "Treasury Coin Set (1-5 holes)", type: "FDM/SLA", time: "TBD", size: "15mb", needsPilot: true },
                { name: "Lava IIFIS Boots", type: "SLA", time: "TBD", size: "10mb", needsPilot: true },
                { name: "Merchant Fitted Coffer", type: "FDM", time: "TBD", size: "35mb", needsPilot: true },
              ].map((file, i) => (
                <Card key={i} className="overflow-hidden group hover:border-zinc-400 transition-colors relative">
                  {file.needsPilot && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm">
                        <Flame className="h-3 w-3 mr-1" /> TrailBlazer Needed
                      </Badge>
                    </div>
                  )}
                  <div className="h-40 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border-b">
                    <Box className="h-16 w-16 text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1">{file.name}</h3>
                    <div className="flex gap-2 text-xs text-slate-500 mb-4">
                      <Badge variant="secondary">{file.type}</Badge>
                      <span className="text-amber-600 font-medium">⏱️ {file.time}</span>
                      <span>📦 {file.size}</span>
                    </div>
                    <Button variant="outline" className="w-full gap-2">
                      <FileDown className="h-4 w-4" /> Download STL
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="report">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Submit Prototyping Report</CardTitle>
                <CardDescription>
                  Upload your print results to help us refine the CAD files. Your data will enter <strong>Quorum Aggregation</strong> with other Test-Pilots to establish the official print specs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Which part did you print?</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Compliant Hit Point Ratchet</option>
                    <option>Peasant Character Base</option>
                    <option>Water Table Hex Tile</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Printer Model</label>
                    <Input placeholder="e.g., Bambu X1C" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Material Used</label>
                    <Input placeholder="e.g., PLA Basic" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Actual Print Time</label>
                    <Input placeholder="e.g., 42 mins" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tolerance & Fit Notes</label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Did the IIFIS boots snap in correctly? Did the compliant mechanism ratchet smoothly?"
                  />
                </div>

                <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center">
                  <Camera className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
                  <p className="text-sm font-medium">Upload Print Photos</p>
                  <p className="text-xs text-zinc-500 mt-1">Drag & drop or click to select</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleUploadReport}
                  disabled={isUploading}
                >
                  {isUploading ? "Submitting to Quorum..." : "Submit Report & Claim Marks"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="noids">
            <Card className="border-2 border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                  <Network className="h-6 w-6" />
                  Professional Testers (NOIDS)
                </CardTitle>
                <CardDescription>
                  Network Operators In Distributed Systems. Become a dedicated R&D Test-Pilot for new projects. 
                  Commit your time, lock your reputation as collateral, and earn massive time-based bonuses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm border-l-4 border-l-amber-500">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-amber-500" />
                    Interoperability: Roles vs. Stewardship
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Role Bounties are part of the broader <strong>Stewardship System</strong>. While Stewards (Captains, Commodores) take on long-term scope, authority, and responsibility for an entire local initiative, NOIDS take on highly focused, task-based roles with specific durations and deliverables. Both require locking collateral to guarantee performance.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-lg">Project: HexIsle Water Table Stress Test</h4>
                      <p className="text-sm text-slate-500">Requested by: @Founder</p>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      Requires 50 Rep Collateral
                    </Badge>
                  </div>
                  
                  <p className="text-sm mb-4">
                    Need 9 Professional Testers to print the Water Table Hex Tile in PETG and test water retention for 48 hours. 
                    Must provide video evidence of the seal.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800 text-center">
                      <Clock className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                      <div className="text-xs text-slate-500">Done in 1 Hour</div>
                      <div className="font-bold text-emerald-600">500 Marks</div>
                    </div>
                    <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800 text-center">
                      <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                      <div className="text-xs text-slate-500">Done in 1 Day</div>
                      <div className="font-bold text-blue-600">100 Marks</div>
                    </div>
                    <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800 text-center">
                      <Clock className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                      <div className="text-xs text-slate-500">Done in 3 Days</div>
                      <div className="font-bold text-amber-600">50 Marks</div>
                    </div>
                    <div className="p-3 border rounded bg-slate-50 dark:bg-slate-800 text-center">
                      <Clock className="h-5 w-5 mx-auto text-slate-500 mb-1" />
                      <div className="text-xs text-slate-500">Done in 1 Week</div>
                      <div className="font-bold text-slate-600">20 Marks</div>
                    </div>
                  </div>

                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-2">
                    <ShieldAlert className="h-4 w-4" /> Lock 50 Rep & Accept Role Bounty
                  </Button>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      )}
    </div>
  );
}