import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Activity, PieChart, Calendar, ShieldCheck, ArrowRight, TrendingUp, Clock } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function TransparentLedger() {
  return (
    <PortalPageLayout>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-emerald-600 rounded-full text-white">
          <Activity className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Transparent Ledger</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Real-time financial tracking, 1/3 splits, and your active Chain Voting advantages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Chain Voting Tracker */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                <TrendingUp className="h-6 w-6" />
                Your Chain Voting
              </CardTitle>
              <CardDescription>
                Stacking 5% bonuses for sequential pre-orders within preferred product lines or Medallion-swapped networks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-xl border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                <p className="text-sm text-slate-500 mb-1">Current Active Bonus</p>
                <h2 className="text-5xl font-black text-emerald-600">15%</h2>
                <p className="text-xs text-slate-400 mt-2">Refunded in Joules on next purchase</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Active Chains</h4>

                {/* Chain 1 */}
                <div className="p-3 border rounded-lg bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">HexIsle Product Line</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      15% Active
                    </Badge>
                  </div>
                  <div className="flex gap-1 mb-3">
                    <div className="h-2 flex-1 bg-emerald-500 rounded-l-full"></div>
                    <div className="h-2 flex-1 bg-emerald-500"></div>
                    <div className="h-2 flex-1 bg-emerald-500"></div>
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800 rounded-r-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 4 days left</span>
                    <span>Next: 20%</span>
                  </div>
                </div>

                {/* Chain 2 */}
                <div className="p-3 border rounded-lg bg-white dark:bg-slate-900">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">Sarah's Bakery Network</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      5% Active
                    </Badge>
                  </div>
                  <div className="flex gap-1 mb-3">
                    <div className="h-2 flex-1 bg-blue-500 rounded-l-full"></div>
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-800 rounded-r-full"></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 12 hours left</span>
                    <span>Next: 10%</span>
                  </div>
                </div>

              </div>

            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" asChild>
                <a href="/marketplace">Shop to Keep Chain Alive</a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Project Ledger View */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Project Ledger: HexIsle Water Table</CardTitle>
                  <CardDescription>Immutable financial tracking and node scheduling.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-slate-100 text-slate-800">
                  <ShieldCheck className="h-4 w-4 mr-1" /> Verified on Test-Net
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="splits" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="splits">The 1/3 Funding Split</TabsTrigger>
                  <TabsTrigger value="nodes">Distributed Node Runs</TabsTrigger>
                </TabsList>

                <TabsContent value="splits" className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 text-center">
                      <PieChart className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <h4 className="font-bold text-lg">1/3 Creator</h4>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">$42,500</p>
                      <p className="text-xs text-slate-500 mt-1">Direct to Founder/Creator</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 text-center">
                      <PieChart className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                      <h4 className="font-bold text-lg">1/3 Platform</h4>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">$42,500</p>
                      <p className="text-xs text-slate-500 mt-1">Cost+20% Margin & Ops</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 text-center">
                      <PieChart className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <h4 className="font-bold text-lg">1/3 Bounties</h4>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">$42,500</p>
                      <p className="text-xs text-slate-500 mt-1">Paid to Backers & Builders</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-950 border rounded-lg overflow-hidden">
                    <div className="p-3 bg-slate-100 dark:bg-slate-900 border-b font-bold text-sm flex justify-between">
                      <span>Recent Transactions</span>
                      <a href="#" className="text-blue-600 hover:underline">View Full Ledger</a>
                    </div>
                    <div className="divide-y text-sm">
                      {[
                        { id: "TX-9823", type: "Pre-Order", amount: "$175.00", split: "Distributed", time: "2 mins ago" },
                        { id: "TX-9822", type: "Bounty Payout", amount: "500 Marks", split: "From 1/3 Pool", time: "15 mins ago" },
                        { id: "TX-9821", type: "Pre-Order", amount: "$175.00", split: "Distributed", time: "1 hour ago" },
                      ].map((tx, i) => (
                        <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white">{tx.id}</span>
                            <span className="text-slate-500 ml-2">{tx.type}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold">{tx.amount}</span>
                            <p className="text-xs text-slate-500">{tx.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="nodes" className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900 mb-6">
                    <h4 className="font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5" />
                      6-Month Pre-Sold Revenue
                    </h4>
                    <p className="text-sm text-blue-900/80 dark:text-blue-300/80">
                      Pre-orders are allocated to local manufacturing nodes (Makers in the Salt Mines) to provide maximum stability.
                      Nodes can count on this scheduled run for the next 6 months.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold">Node: Phoenix Alpha (FDM)</h5>
                        <Badge variant="secondary">Active Run</Badge>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Month 1 of 6</span>
                        <span>$2,400 / mo pre-sold</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '16%' }}></div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold">Node: Austin Beta (SLA)</h5>
                        <Badge variant="secondary">Active Run</Badge>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Month 3 of 6</span>
                        <span>$1,800 / mo pre-sold</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
}
