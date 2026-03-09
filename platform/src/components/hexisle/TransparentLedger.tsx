import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Factory, ShieldCheck, PieChart, Clock } from "lucide-react";

export const TransparentLedger: React.FC = () => {
  const nodeRuns = [
    { id: "NODE-PHX-01", location: "Phoenix, AZ", runSize: 500, timeframe: "Oct-Mar", status: "Scheduled" },
    { id: "NODE-ATX-04", location: "Austin, TX", runSize: 250, timeframe: "Nov-Apr", status: "Allocating" },
    { id: "NODE-PDX-02", location: "Portland, OR", runSize: 1000, timeframe: "Sep-Feb", status: "In Production" },
  ];

  return (
    <Card className="bg-slate-950 border-slate-800">
      <CardHeader className="border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-slate-200">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Transparent Ledger
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Real-time allocation of pre-orders and funding splits.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Immutable Record
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">

        {/* The 1/3 Split */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
            <PieChart className="w-4 h-4 text-blue-400" />
            Funding Allocation (The 1/3 Rule)
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center">
              <div className="text-lg font-bold text-blue-400">33.3%</div>
              <div className="text-xs text-slate-500">Creator</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center">
              <div className="text-lg font-bold text-purple-400">33.3%</div>
              <div className="text-xs text-slate-500">Platform (Gas)</div>
            </div>
            <div className="bg-slate-900 p-3 rounded border border-slate-800 text-center">
              <div className="text-lg font-bold text-amber-400">33.3%</div>
              <div className="text-xs text-slate-500">Bounty Backers</div>
            </div>
          </div>
        </div>

        {/* Distributed Node Scheduled Runs */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
            <Factory className="w-4 h-4 text-orange-400" />
            Distributed Node Scheduled Runs
          </h4>
          <p className="text-xs text-slate-400 mb-2">
            Pre-orders are allocated to local manufacturing nodes to guarantee 6 months of stable revenue.
          </p>
          <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900">
                <TableRow className="border-slate-800 hover:bg-slate-900">
                  <TableHead className="text-slate-400">Node ID</TableHead>
                  <TableHead className="text-slate-400">Location</TableHead>
                  <TableHead className="text-slate-400 text-right">Run Size</TableHead>
                  <TableHead className="text-slate-400">6-Mo Timeframe</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nodeRuns.map((node) => (
                  <TableRow key={node.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-mono text-xs text-slate-300">{node.id}</TableCell>
                    <TableCell className="text-slate-300">{node.location}</TableCell>
                    <TableCell className="text-right text-slate-300">{node.runSize}</TableCell>
                    <TableCell className="text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {node.timeframe}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                        {node.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
