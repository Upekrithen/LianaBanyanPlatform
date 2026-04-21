import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, ShieldAlert, Sparkles, MessageSquare } from "lucide-react";
import { AIAdvisor } from "../../types/stewardship";

interface AIAdvisorCardProps {
  advisor: AIAdvisor;
  initiativeName: string;
}

export const AIAdvisorCard: React.FC<AIAdvisorCardProps> = ({ advisor, initiativeName }) => {
  return (
    <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg bg-gradient-to-br from-background to-secondary/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            {advisor.name}
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10">AI Steward Advisor</Badge>
        </div>
        <CardDescription className="text-sm italic text-muted-foreground">
          Assigned to: {initiativeName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-3 rounded-md border border-border/50">
          <div className="flex gap-2 items-start">
            <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm font-medium italic">"{advisor.catchphrase}"</p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <Sparkles className="h-4 w-4" /> Personality Profile
          </h4>
          <p className="text-sm text-muted-foreground">{advisor.personality}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <ShieldAlert className="h-4 w-4" /> Advisory Functions
          </h4>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            {advisor.advisoryFunctions.map((func, idx) => (
              <li key={idx}>{func}</li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t text-xs text-muted-foreground text-center">
          <p><strong>Core Principle:</strong> AI advises, humans decide, humans are accountable. Always.</p>
        </div>
      </CardContent>
    </Card>
  );
};
