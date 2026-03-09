import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Gamepad2, Landmark, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const TestNetExplainer: React.FC = () => {
  return (
    <Card className="w-full border-2 border-primary/20 bg-gradient-to-br from-background to-secondary/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            How Value Works Here
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10">Test-Net By Design</Badge>
        </div>
        <CardDescription className="text-base font-medium text-foreground mt-2">
          We use Platform Service Units (Credits, Marks, and Joules). 
          <strong> They are not investments. They are not securities. They are not crypto.</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
            <h4 className="font-semibold text-lg flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
              <Plane className="h-5 w-5" />
              Like Airline Miles
            </h4>
            <p className="text-sm text-muted-foreground">
              You earn them. You use them for flights. You don't trade them on the stock market. 
              Our Platform Service Units work the same way: they are vouchers for future services within the Liana Banyan ecosystem.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
            <h4 className="font-semibold text-lg flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
              <Gamepad2 className="h-5 w-5" />
              Like Arcade Tokens
            </h4>
            <p className="text-sm text-muted-foreground">
              You buy a token to play a game, or you win tickets to get a prize. The value is held <em>inside the arcade</em>. 
              You cannot "cash out" our units to fiat currency. They are stored potential for your own projects.
            </p>
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-base mb-1">What is "Test-Net By Design"?</h4>
              <p className="text-sm text-muted-foreground mb-2">
                We use blockchain technology solely as an immutable, transparent ledger to track who created what (provenance) and who helped fund it. 
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>We do not use Mainnet Ethereum.</li>
                <li>There is no speculative trading.</li>
                <li>Your "Deck Cards" are collectible records of your participation, like Senior Pictures or a Library Card.</li>
              </ul>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
