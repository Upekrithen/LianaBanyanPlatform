import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hammer, Factory, Wrench, Cog, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BrassTacksPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-zinc-600 rounded-full text-white">
          <Factory className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Brass Tacks</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            The Manufacturing Business. The engine of the 2nd Second Industrial Revolution.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Core Philosophy */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-zinc-200 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/10">
            <CardHeader>
              <Badge variant="outline" className="w-fit bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-900/50 dark:text-zinc-300 mb-2">
                Physical Manufacturing & Maker Economy
              </Badge>
              <CardTitle className="text-2xl text-zinc-900 dark:text-zinc-400">
                Getting Down to Brass Tacks
              </CardTitle>
              <CardDescription className="text-base text-slate-700 dark:text-slate-300 mt-2">
                This is the actual factory. We are decentralizing manufacturing so that anyone with a 3D printer, a CNC machine, or a sewing machine can become a Service Node in the global supply chain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-600 font-bold text-lg">1</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Hammer className="h-5 w-5 text-zinc-500" /> Distributed Factory Nodes
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    Instead of one massive factory in China, we have 10,000 micro-factories in garages across America. You download the STL files, print the parts, and get paid in Marks/Credits backed by tangible IP.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-600 font-bold text-lg">2</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-500" /> Medallion Sponsorships
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    Creators can swap "Senior Pics" (Medallions) to link their projects. If a Node manufactures parts for Project A, and Project A is linked to Project B, the entire supply chain benefits from the cross-pollination of demand.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-600 font-bold text-lg">3</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Cog className="h-5 w-5 text-emerald-500" /> The HexIsle Proof of Concept
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    We are proving this model with HexIsle. By distributing the manufacturing of the game's physical components to the Prototyper Guild, we reduce traditional manufacturing costs by 95%.
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Action Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crown: Manufacturing Mentor</CardTitle>
              <CardDescription>Status: Seeking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                We are actively seeking a Crown for the Brass Tacks initiative. We need an industrial engineer, a supply chain maverick, or a logistics expert who understands how to coordinate thousands of independent nodes into a cohesive manufacturing powerhouse.
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border text-xs">
                <strong>Status:</strong> Open. Evaluating candidates.
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                Nominate a Crown <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join the Factory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-zinc-600 hover:bg-zinc-700 text-white justify-start gap-2" onClick={() => navigate('/the-2nd-second')}>
                <Factory className="h-4 w-4" /> Go to The Maker Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
