import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Lock, Printer, ExternalLink, Sparkles, Hexagon, Droplets, Cog } from "lucide-react";
import { ChainVotingVisualizer } from './ChainVotingVisualizer';
import { TransparentLedger } from './TransparentLedger';
import { useToast } from "@/hooks/use-toast";

export const HexIsleShowcase: React.FC = () => {
  const [pledgeId, setPledgeId] = useState('');
  const { toast } = useToast();

  // Level 1 is active — we're in the SLA prototyping phase (honest, not fiction)
  const levels = [
    { level: 1, price: 100, desc: "SLA Prototyping", active: true },
    { level: 2, price: 85, desc: "FDM Short Run", active: false },
    { level: 3, price: 70, desc: "SLS Printing", active: false },
    { level: 4, price: 60, desc: "Desktop Injection", active: false },
    { level: 5, price: 50, desc: "Factory Tooling", active: false },
    { level: 6, price: 40, desc: "Mass Production (Cost+20%)", active: false },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">HexIsle: The Tereno Water Table</h1>
        <p className="text-xl text-muted-foreground">
          A physical, tactile strategy game. No batteries. No arguments. Just "If It Fits, It Sits."
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: The Product & The Maker Pivot */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-primary/20 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-cyan-100 to-blue-200 dark:from-cyan-900 dark:to-blue-950 flex items-center justify-center relative overflow-hidden">
              {/* Styled placeholder — hex pattern representing the Tereno platform */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-8 gap-1 p-4">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <Hexagon key={i} className="h-8 w-8 text-cyan-600" />
                  ))}
                </div>
              </div>
              <div className="relative text-center z-10">
                <div className="inline-flex gap-3 mb-3">
                  <Hexagon className="h-10 w-10 text-cyan-600" />
                  <Droplets className="h-10 w-10 text-blue-500" />
                  <Cog className="h-10 w-10 text-amber-600" />
                </div>
                <p className="font-bold text-lg text-cyan-800 dark:text-cyan-200">The Tereno Water Table</p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Hydraulic-Powered Physical Computing — No Batteries Required</p>
              </div>
              <Badge className="absolute top-4 right-4 bg-primary/80">Innovation #3</Badge>
            </div>
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-4">The Manufacturing Volume Discount</h3>
              <p className="text-muted-foreground mb-6">
                We don't guess demand. We prove it. As more people back the project, we unlock cheaper manufacturing methods. 
                If you back early at a higher price, and we reach a lower price tier, <strong>you get the difference back as Platform Service Vouchers (Joules).</strong>
              </p>

              {/* Chain Voting Advantage Explainer */}
              <div className="mb-6 space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> The Chain Voting Advantage
                  </h4>
                  <p className="text-sm text-blue-200/80">
                    Pre-order multiple items in a product line (like Character A, then B, then C) and earn a stacking 5% Joule bonus for each subsequent item. It stacks up to 100%, then sustains at 20%. This bonus even cross-applies to other creators' projects if they've swapped Medallions (Senior Pics) with this project! Both creators receive the bonus amount in Joule Pouches as a reward for cross-pollinating the community.
                  </p>
                </div>
                <ChainVotingVisualizer />
              </div>

              {/* The 6 Levels */}
              <div className="space-y-3">
                {levels.map((lvl) => (
                  <div 
                    key={lvl.level} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      lvl.active ? 'bg-primary/10 border-primary' : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-mono font-bold ${lvl.active ? 'text-primary' : 'text-muted-foreground'}`}>
                        Lvl {lvl.level}
                      </span>
                      <span className={lvl.active ? 'font-semibold' : ''}>{lvl.desc}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">${lvl.price}</span>
                      {lvl.active && <Badge>Current Level</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* The Maker Pivot */}
          <Card className="border-2 border-orange-500/20 bg-orange-500/5">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-orange-500/10 p-4 rounded-full">
                <Printer className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-orange-800 dark:text-orange-400 mb-2">Have a 3D Printer?</h3>
                <p className="text-sm text-orange-900/80 dark:text-orange-200/80 mb-4">
                  Don't want to buy the physical box? You can print it yourself. Join a Prototyper Guild on <strong>the2ndSecond</strong>, share a Cue Card, and get the STLs for free. This connects you to your Tribe at the Family Table.
                </p>
                <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-500/10" onClick={() => window.open('https://the2ndsecond.com', '_blank', 'noopener,noreferrer')}>
                  Go to Maker Portal <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: The Crowdfunding Passthrough */}
        <div className="space-y-6">
          <Card className="border-2 border-green-600/20 shadow-lg">
            <CardHeader className="bg-green-600/5 border-b border-green-600/10">
              <CardTitle className="text-xl">Pre-Order Now</CardTitle>
              <CardDescription>Secure your set and earn Joules.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We use Kickstarter to process payments securely and handle compliance. 
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => window.open('https://kickstarter.com', '_blank')}>
                  Back on Kickstarter <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Then</span>
                </div>
              </div>

              <TransparentLedger />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Claim Your Service Vouchers</Label>
                  <p className="text-xs text-muted-foreground">
                    Enter your Kickstarter Backer Number here. When the campaign ends, your price difference will be credited to your Liana Banyan account as Joules (Platform Service Vouchers).
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Backer #"
                      value={pledgeId}
                      onChange={(e) => setPledgeId(e.target.value)}
                    />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!pledgeId.trim()) {
                          toast({ title: 'Enter your Backer #', description: 'Paste your Kickstarter Backer Number to claim your Joule vouchers.', variant: 'destructive' });
                          return;
                        }
                        toast({ title: 'Backer Number Saved', description: `Backer #${pledgeId} recorded. Joule vouchers will be credited when the campaign closes.` });
                        setPledgeId('');
                      }}
                    >
                      Claim
                    </Button>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-none">
            <CardContent className="p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Why do we do this?</strong> By backing this project, you are helping us reach the volume needed for Cost+20% manufacturing. The Joules you earn are vouchers you can use to hire artists, buy other games, or launch your own project on this platform. They are not an investment or security, but stored potential for your own ideas.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Distributed Node Scheduled Runs:</strong> Pre-orders are allocated to local manufacturing nodes to provide 6 months of guaranteed, stable revenue. You can view these allocations on the Transparent Ledger for this project.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>You can do this yourself.</strong> The founder owns all the IP and can sell or give it away. You can launch your own project on Kickstarter — but you <em>should</em> do it here, where the community, the 1/3 split, and the Chain Voting Advantage are already built in.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};
