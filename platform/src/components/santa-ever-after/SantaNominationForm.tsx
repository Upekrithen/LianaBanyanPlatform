import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Gift, ShieldAlert, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SantaNominationForm: React.FC = () => {
  const { toast } = useToast();
  const [path, setPath] = useState<'self' | 'nominate'>('nominate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: path === 'self' ? "Request Submitted" : "Nomination Submitted",
        description: path === 'self' 
          ? "Your request has been sent to a Trusted Node for verification."
          : "Your nomination is secure. A Jesper will review it shortly.",
      });
    }, 1500);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-2 border-red-900/20">
      <CardHeader className="bg-red-900/5 pb-6 border-b border-red-900/10">
        <CardTitle className="text-2xl flex items-center gap-2 text-red-800 dark:text-red-500">
          <Gift className="h-6 w-6" />
          Santa Ever After
        </CardTitle>
        <CardDescription>
          Volume pricing for all holidays and events. 
          <strong> The Golden Rule:</strong> If you pay, you can't deliver. If you deliver, you can't pay.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-6">
          <Label className="text-base font-semibold mb-3 block">Choose Your Path</Label>
          <RadioGroup defaultValue="nominate" onValueChange={(v) => setPath(v as 'self' | 'nominate')} className="flex gap-4">
            <div className={`flex items-center space-x-2 border p-4 rounded-lg flex-1 cursor-pointer transition-colors ${path === 'nominate' ? 'border-red-500 bg-red-500/5' : 'hover:bg-muted'}`} onClick={() => setPath('nominate')}>
              <RadioGroupItem value="nominate" id="r1" />
              <Label htmlFor="r1" className="cursor-pointer">
                <span className="block font-bold">Nominate Someone</span>
                <span className="text-xs text-muted-foreground font-normal">I want to fund a gift for another family.</span>
              </Label>
            </div>
            <div className={`flex items-center space-x-2 border p-4 rounded-lg flex-1 cursor-pointer transition-colors ${path === 'self' ? 'border-red-500 bg-red-500/5' : 'hover:bg-muted'}`} onClick={() => setPath('self')}>
              <RadioGroupItem value="self" id="r2" />
              <Label htmlFor="r2" className="cursor-pointer">
                <span className="block font-bold">Self-Request</span>
                <span className="text-xs text-muted-foreground font-normal">My family needs help this season.</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {path === 'nominate' ? (
            <>
              <div className="space-y-2">
                <Label>Who are you nominating?</Label>
                <Input required placeholder="e.g., The Martinez Family" />
              </div>
              
              <div className="space-y-2">
                <Label>Your Relationship to Them</Label>
                <Input required placeholder="e.g., Neighbor for 3 years" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>The "Why They Deserve This" Card</Label>
                  <span className="text-xs text-muted-foreground">Required for Jesper Verification</span>
                </div>
                <Textarea 
                  required 
                  className="min-h-[120px]"
                  placeholder="Tell us their story. Why do they need a little magic right now? (This will be read by the assigned Jesper to verify legitimacy)." 
                />
              </div>

              <div className="space-y-2">
                <Label>Suggested Gift Ideas</Label>
                <Input placeholder="e.g., Art supplies for the 8yo, chemistry set for the 11yo" />
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border/50 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Secure Delivery Routing
                </h4>
                <p className="text-xs text-muted-foreground">
                  To prevent fraud, you cannot deliver this gift yourself. Please provide their address below. 
                  <strong> It will ONLY be shown to the assigned Jesper.</strong>
                </p>
                <Input required placeholder="Full Delivery Address" />
                <Input placeholder="Best Delivery Time (e.g., Weekday evenings)" />
              </div>
            </>
          ) : (
            <>
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-amber-700 dark:text-amber-500 mb-2">
                  <ShieldAlert className="h-4 w-4" /> Trusted Node Verification Required
                </h4>
                <p className="text-xs text-amber-700/80 dark:text-amber-500/80">
                  Self-requests must be vouched for by a Trusted Node (school, church, social worker, or Rally Group member). 
                  Your request will appear anonymized to donors (e.g., "Family #47, Phoenix AZ").
                </p>
              </div>

              <div className="space-y-2">
                <Label>Family Details (Anonymized for Donors)</Label>
                <Input required placeholder="e.g., 2 kids ages 8 & 11" />
              </div>

              <div className="space-y-2">
                <Label>Trusted Node Contact</Label>
                <Input required placeholder="Email or phone of the person vouching for you" />
              </div>

              <div className="space-y-2">
                <Label>Pre-Written Thank You Card</Label>
                <Textarea 
                  required 
                  className="min-h-[100px]"
                  placeholder="Write your thank you card now. If funded, this will be sent to your donor. If not funded, it will not be sent." 
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : path === 'nominate' ? "Fund This Gift ($25)" : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
