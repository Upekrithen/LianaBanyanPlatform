import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Mail, CheckSquare, Megaphone, Scan, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function MoneyPennyWidget() {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Bot className="h-24 w-24" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Bot className="h-6 w-6 text-primary" />
          MoneyPenny Briefing
        </CardTitle>
        <CardDescription>Your virtual administrative assistant report for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Mail className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Invitations</p>
                <p className="text-xs text-muted-foreground">3 opened, 1 converted</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-green-500/10 p-2 rounded-full">
                <Scan className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Cue Cards (ATTI)</p>
                <p className="text-xs text-muted-foreground">57 scans, 23 signups (today)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-purple-500/10 p-2 rounded-full">
                <Megaphone className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Publications</p>
                <p className="text-xs text-muted-foreground">2 new responses (1 interested)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-amber-500/10 p-2 rounded-full">
                <CheckSquare className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Tasks</p>
                <p className="text-xs text-muted-foreground">8 due today, 45 this week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3 border-t border-border/50">
          <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/moneypenny")}>
            View Full Briefing <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
