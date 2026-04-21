import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "lucide-react";
import { motion } from "framer-motion";

export const ChainVotingVisualizer: React.FC = () => {
  // Mock data for the visualizer
  const chain = [
    { id: 1, name: "Water Table", bonus: "0%", active: true },
    { id: 2, name: "Peasant", bonus: "5%", active: true },
    { id: 3, name: "Merchant", bonus: "10%", active: true },
    { id: 4, name: "Warhorse", bonus: "15%", active: true },
    { id: 5, name: "Next Item", bonus: "20%", active: false },
  ];

  return (
    <Card className="bg-blue-500/5 border-blue-500/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-400">
          <Link className="w-5 h-5" />
          Your Chain Voting Advantage
        </CardTitle>
        <CardDescription>
          Stacking bonuses for sequential pre-orders. Stacks to 100%, then sustains at 20%.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative py-8">
          {/* The connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 z-0" />
          <div className="absolute top-1/2 left-0 w-[60%] h-1 bg-blue-500 -translate-y-1/2 z-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

          {/* The Nodes */}
          <div className="relative z-10 flex justify-between">
            {chain.map((node, i) => (
              <div key={node.id} className="flex flex-col items-center gap-2">
                <div className={`text-xs font-bold ${node.active ? 'text-blue-400' : 'text-slate-500'}`}>
                  {node.bonus}
                </div>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: node.active ? 1.1 : 1 }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    node.active
                      ? 'bg-blue-950 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  {node.active && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                </motion.div>
                <div className={`text-xs text-center max-w-[60px] ${node.active ? 'text-slate-300' : 'text-slate-600'}`}>
                  {node.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-slate-400">Chain Lifespan: </span>
            <span className="text-emerald-400 font-bold">14 Days Remaining</span>
          </div>
          <div className="text-xs text-slate-500 text-right">
            Extended by:<br/>Water Table ($120)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
