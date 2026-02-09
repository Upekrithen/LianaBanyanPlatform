import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle, TrendingUp, Users, Package, DollarSign } from 'lucide-react';

interface PreorderVotingExplainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnderstood: () => void;
}

export function PreorderVotingExplainer({ open, onOpenChange, onUnderstood }: PreorderVotingExplainerProps) {
  const [videoWatched, setVideoWatched] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">How Preordering Works</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Video Section */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <PlayCircle className="w-16 h-16 mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Video: Understanding Volume Production & Pricing
              </p>
              <Button 
                variant="outline" 
                onClick={() => setVideoWatched(true)}
              >
                {videoWatched ? 'Video Watched ✓' : 'Play Video'}
              </Button>
            </div>
          </div>

          {/* Accordion Explanation */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="voting-basics">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  What is "Voting" to Preorder?
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p>
                  Your preorder is actually a <strong>vote</strong> to get this product manufactured at scale. 
                  The more people vote, the larger the production run, and the lower the per-unit cost.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium mb-2">Example:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• 100 units = $50 each</li>
                    <li>• 500 units = $35 each</li>
                    <li>• 2,000 units = $20 each</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="production-levels">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Production Levels & Volume Discounts
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p>
                  Each product has multiple production levels (tiers). As more people vote, 
                  we unlock better pricing at higher volume levels.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border rounded p-3">
                    <div className="font-medium text-sm mb-1">Level 1: Pilot</div>
                    <div className="text-xs text-muted-foreground">5-100 units</div>
                    <div className="text-lg font-bold text-primary mt-2">Highest Price</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="font-medium text-sm mb-1">Level 2: Production</div>
                    <div className="text-xs text-muted-foreground">100-1,000 units</div>
                    <div className="text-lg font-bold text-primary mt-2">30-40% Off</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="font-medium text-sm mb-1">Level 3: Scale</div>
                    <div className="text-xs text-muted-foreground">1,000+ units</div>
                    <div className="text-lg font-bold text-primary mt-2">50-60% Off</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="time-commitment">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Time Commitment & Equity/Cash Split
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p>
                  When you vote, you choose how long you're willing to wait for production. 
                  <strong> Longer commitment = more equity ownership in the project.</strong>
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">1 Week Wait</span>
                    <span className="text-sm font-medium">10% Equity / 90% Cash Value</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">1 Month Wait</span>
                    <span className="text-sm font-medium">30% Equity / 70% Cash Value</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">6 Months Wait</span>
                    <span className="text-sm font-medium">90% Equity / 10% Cash Value</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  If the production goal isn't met by your deadline, your credits automatically revert to your account.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="node-cycles">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  After First Round: Node Cycles
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p>
                  Once a product successfully completes its first production round, subsequent rounds 
                  operate on <strong>Node Cycles</strong> - recurring production runs based on demand.
                </p>
                <ul className="space-y-2 text-sm">
                  <li>• Node Cycles happen automatically when demand reaches threshold</li>
                  <li>• Pricing stabilizes based on proven volume</li>
                  <li>• No more voting needed - just regular preorders</li>
                  <li>• Faster fulfillment for established products</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              I'll Review Later
            </Button>
            <Button 
              className="flex-1"
              onClick={() => {
                onUnderstood();
                onOpenChange(false);
              }}
              disabled={!videoWatched}
            >
              {videoWatched ? 'Got It! Let Me Vote' : 'Watch Video First'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
