import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CareUnitSelectorProps {
  initiativeId?: string;
  initiativeName?: string;
  onSelect: (type: 'blanket' | 'directed', amount: number) => void;
}

export const CareUnitSelector: React.FC<CareUnitSelectorProps> = ({
  initiativeId,
  initiativeName,
  onSelect
}) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'blanket' | 'directed' | null>(null);
  const [amount, setAmount] = useState<number>(50);

  const handleConfirm = () => {
    if (!selectedType) return;
    
    toast({
      title: "Care Unit Pledged",
      description: `You have pledged ${amount} Credits as a ${selectedType === 'blanket' ? 'Blanket' : 'Directed'} Care Unit.`,
    });
    
    onSelect(selectedType, amount);
  };

  return (
    <Card className="w-full border-2 border-emerald-500/30">
      <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-emerald-500" />
          Fund a Care Unit
        </CardTitle>
        <CardDescription>
          {initiativeName 
            ? `Support the Cold Start progression for ${initiativeName}`
            : "Support the Cold Start progression of local initiatives"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blanket Donation */}
          <div 
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedType === 'blanket' 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                : 'border-slate-200 hover:border-emerald-300 dark:border-slate-800'
            }`}
            onClick={() => setSelectedType('blanket')}
          >
            <div className="flex justify-between items-start mb-2">
              <Shield className={`h-6 w-6 ${selectedType === 'blanket' ? 'text-emerald-600' : 'text-slate-400'}`} />
              {selectedType === 'blanket' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            </div>
            <h4 className="font-bold text-lg mb-1">Blanket Care Unit</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Funds are pooled and directed by the AI Advisory System to the initiatives closest to reaching their next tier (Spark +' Ember +' Wildfire). Maximum impact where it's needed most.
            </p>
          </div>

          {/* Directed Donation */}
          <div 
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedType === 'directed' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-slate-200 hover:border-blue-300 dark:border-slate-800'
            }`}
            onClick={() => setSelectedType('directed')}
          >
            <div className="flex justify-between items-start mb-2">
              <Target className={`h-6 w-6 ${selectedType === 'directed' ? 'text-blue-600' : 'text-slate-400'}`} />
              {selectedType === 'directed' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
            </div>
            <h4 className="font-bold text-lg mb-1">Directed Care Unit</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You choose the exact initiative and city. Funds are locked to that specific geographic area to help them reach their Cold Start thresholds.
            </p>
          </div>
        </div>

        {selectedType && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-semibold mb-3">Select Pledge Amount (Credits)</h4>
            <div className="flex gap-3 flex-wrap">
              {[10, 50, 100, 500].map((val) => (
                <Button
                  key={val}
                  type="button"
                  variant={amount === val ? "default" : "outline"}
                  onClick={() => setAmount(val)}
                  className={amount === val ? (selectedType === 'blanket' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700') : ''}
                >
                  {val} Credits
                </Button>
              ))}
            </div>
          </div>
        )}

      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t p-4 flex justify-between items-center">
        <div className="text-sm text-slate-500">
          1 Credit = $1.00 USD
        </div>
        <Button 
          onClick={handleConfirm} 
          disabled={!selectedType}
          className={selectedType === 'blanket' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}
        >
          Confirm Pledge <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
