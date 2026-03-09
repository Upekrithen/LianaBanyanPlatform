import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Link2, Users, ShieldCheck, ArrowRightLeft, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function MedallionSwap() {
  const { toast } = useToast();
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      toast({
        title: "Medallion Swap Complete!",
        description: "Your projects are now linked. Buyers get a 5% Chain Voting bonus across both networks.",
      });
    }, 1500);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-600 rounded-full text-white">
          <ArrowRightLeft className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Senior Pics: Medallion Swap</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Cross-pollinate your audience. Swap QR Deck Cards with other creators to link your Chain Voting bonuses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: The Concept */}
        <div className="space-y-6">
          <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="text-purple-800 dark:text-purple-400">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <p>
                Remember trading Senior Pictures in high school? The Medallion Swap is the business equivalent.
              </p>
              <p>
                When you swap your Project's QR Deck Card with another Creator, your networks become linked. 
                If a buyer pre-orders from your project, they get a <strong>5% Chain Voting Bonus</strong> that they can apply to the *other* creator's project.
              </p>
              <div className="p-4 bg-white dark:bg-slate-900 rounded border border-purple-100 dark:border-purple-800 mt-4">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> The Creator Reward
                </h4>
                <p>
                  When cross-pollination happens (a user buys from both of you because of the link), 
                  <strong> both creators receive Joule Pouches</strong> as a reward for growing the ecosystem together.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Active Swaps</CardTitle>
              <CardDescription>Projects currently linked to your Chain Voting network.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Sarah's Artisan Bakery", category: "Food", swaps: 142 },
                { name: "TechFix Local", category: "Services", swaps: 89 },
              ].map((project, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                      <QrCode className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{project.name}</h4>
                      <p className="text-xs text-slate-500">{project.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                      Linked
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{project.swaps} cross-sales</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Find Partners */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Swap Partners</CardTitle>
              <CardDescription>Search for complementary projects to cross-pollinate with.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Search projects, categories, or local areas..." className="pl-10" />
              </div>

              <div className="space-y-4 mt-6">
                {[
                  { name: "Green Thumb Landscaping", category: "Services", location: "Phoenix, AZ", match: "98%" },
                  { name: "Local Coffee Roasters", category: "Food & Bev", location: "Phoenix, AZ", match: "85%" },
                  { name: "Custom Woodworking", category: "Crafts", location: "Austin, TX", match: "72%" },
                ].map((project, i) => (
                  <div key={i} className="p-4 border rounded-lg border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold">{project.name}</h4>
                        <div className="flex gap-2 text-xs text-slate-500 mt-1">
                          <span>{project.category}</span>
                          <span>•</span>
                          <span>{project.location}</span>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        {project.match} Match
                      </Badge>
                    </div>
                    <Button 
                      className="w-full gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700"
                      onClick={handleSwap}
                      disabled={isSwapping}
                    >
                      <Link2 className="h-4 w-4" /> 
                      {isSwapping ? "Proposing Swap..." : "Propose Medallion Swap"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}