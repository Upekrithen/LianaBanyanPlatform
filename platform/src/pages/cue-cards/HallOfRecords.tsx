import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Shield, Lock, FileText, ArrowRight } from "lucide-react";
import { LarkWrapper } from '@/components/builder/LarkWrapper';
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function HallOfRecords() {
  const patentPedestals = [
    { id: 1, name: "The Yggdrasil Architecture", status: "Filed", value: "$12M" },
    { id: 2, name: "The Care Unit System", status: "Filed", value: "$8M" },
    { id: 3, name: "The Root Lock System", status: "Drafting", value: "Pending" },
    { id: 4, name: "Speckles Currency Gamification", status: "Filed", value: "$5M" },
    { id: 5, name: "Santa Ever After Protocol", status: "Drafting", value: "Pending" },
    { id: 6, name: "The 3-Gear Currency (Credits/Marks/Joules)", status: "Granted", value: "$45M" },
  ];

  return (
    <PortalPageLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <BookOpen className="w-20 h-20 mx-auto text-amber-500" />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-amber-400">
            The Hall of Records
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            The immutable ledger of our intellectual property. Here lie the 16 Patent Pedestals that protect the cooperative from extraction.
          </p>
        </div>

        {/* The 16 Pedestals */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patentPedestals.map((pedestal) => (
            <LarkWrapper key={pedestal.id} componentId={`pedestal-${pedestal.id}`} bountyCredits={100}>
              <Card className="bg-slate-900 border-amber-500/20 hover:border-amber-500/50 transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-300 text-lg">
                    <Shield className="w-5 h-5" />
                    {pedestal.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Status:</span>
                    <Badge variant="outline" className="text-amber-400 border-amber-500/50">{pedestal.status}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Est. Value:</span>
                    <span className="font-mono text-emerald-400">{pedestal.value}</span>
                  </div>
                  <Button variant="ghost" className="w-full text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 mt-4">
                    View Ledger Entry <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </LarkWrapper>
          ))}
          
          {/* Placeholder for the rest of the 16 */}
          <Card className="bg-slate-900/50 border-slate-800 border-dashed flex flex-col items-center justify-center min-h-[200px] text-slate-500">
            <Lock className="w-8 h-8 mb-2 opacity-50" />
            <p>10 Additional Pedestals</p>
            <p className="text-xs">Awaiting Declassification</p>
          </Card>
        </div>

      </div>
    </PortalPageLayout>
  );
}
