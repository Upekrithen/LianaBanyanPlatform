import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, ShieldCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BackerPledgeEscrowProps {
  applicationId: string;
  pledgeAmount: number;
  initialStatus?: 'pledged' | 'escrowed' | 'released' | 'forfeited';
}

export const BackerPledgeEscrow: React.FC<BackerPledgeEscrowProps> = ({ 
  applicationId, 
  pledgeAmount,
  initialStatus = 'pledged'
}) => {
  const { toast } = useToast();
  const [status, setStatus] = useState(initialStatus);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFundEscrow = () => {
    setIsProcessing(true);
    // Simulate payment/escrow processing
    setTimeout(() => {
      setStatus('escrowed');
      setIsProcessing(false);
      toast({
        title: "Pledge Escrowed",
        description: `${pledgeAmount} Credits have been locked in the Care Unit escrow.`,
      });
    }, 1500);
  };

  return (
    <Card className="w-full border-2 border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              Captain's Pledge Escrow
            </CardTitle>
            <CardDescription>
              Skin in the game. Collateral for community trust.
            </CardDescription>
          </div>
          <Badge 
            variant={status === 'escrowed' ? "default" : "outline"}
            className={status === 'escrowed' ? "bg-amber-500 hover:bg-amber-600" : ""}
          >
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        
        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900">
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">Pledge Amount</p>
            <h3 className="text-3xl font-bold text-amber-900 dark:text-amber-500">{pledgeAmount} <span className="text-lg font-normal">Credits</span></h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            {status === 'escrowed' ? (
              <ShieldCheck className="h-6 w-6 text-amber-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            )}
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p>
            <strong>Why is this required?</strong> To ensure accountability, Captains must pledge Credits as collateral. This is held in escrow during your 90-day probation period.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li>If you succeed, the pledge remains staked as your ongoing commitment (or can be released).</li>
            <li>If you act maliciously or abandon the post, the pledge is forfeited directly to the local Care Unit to repair the damage.</li>
          </ul>
        </div>

      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t p-4">
        {status === 'pledged' ? (
          <Button 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
            onClick={handleFundEscrow}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : `Fund Escrow (${pledgeAmount} Credits)`}
          </Button>
        ) : (
          <div className="w-full text-center text-sm font-medium text-emerald-600 flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" /> Funds Secured in Escrow
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
