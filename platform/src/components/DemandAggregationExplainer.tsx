/**
 * DEMAND AGGREGATION EXPLAINER
 * ============================
 * Educational dialog explaining how the food ecosystem's
 * demand aggregation system works.
 *
 * Used in:
 * - Let's Make Dinner page
 * - Family Table page
 * - Aggregation Dashboard
 * - First-time meal ordering
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  PlayCircle,
  ShoppingCart,
  Users,
  Truck,
  DollarSign,
  ChefHat,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award
} from 'lucide-react';

interface DemandAggregationExplainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnderstood?: () => void;
  /** Which section to auto-expand (optional) */
  autoExpandSection?: 'flow' | 'discounts' | 'taste-tester' | 'icing';
}

export function DemandAggregationExplainer({
  open,
  onOpenChange,
  onUnderstood,
  autoExpandSection
}: DemandAggregationExplainerProps) {
  const [videoWatched, setVideoWatched] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            How Demand Aggregation Works
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Section */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <PlayCircle className="w-16 h-16 mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Video: The Food Ecosystem — From Order to Delivery
              </p>
              <Button
                variant="outline"
                onClick={() => setVideoWatched(true)}
              >
                {videoWatched ? 'Video Watched ✓' : 'Play Video'}
              </Button>
            </div>
          </div>

          {/* Quick Visual Flow */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-3">The Flow at a Glance</h3>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                <ChefHat className="w-4 h-4" />
                Order Meal
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4" />
                Ingredients Aggregate
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                Neighbors Join
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                <Truck className="w-4 h-4" />
                Delivery Job Created
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                Everyone Saves
              </div>
            </div>
          </div>

          {/* Accordion Explanation */}
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={autoExpandSection}
          >
            <AccordionItem value="flow">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Step-by-Step: From Meal to Groceries
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <p className="font-medium">You Order a Meal</p>
                      <p className="text-sm text-muted-foreground">
                        Order dinner from a local chef on Let's Make Dinner. System automatically extracts the ingredient list.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <p className="font-medium">Ingredients Join a Collection Window</p>
                      <p className="text-sm text-muted-foreground">
                        Your ingredient needs are added to a 4-hour aggregation window for your ZIP code. Others ordering nearby are combined.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <p className="font-medium">Threshold Met = Job Posted</p>
                      <p className="text-sm text-muted-foreground">
                        When 2+ households join and total value hits $25, a delivery job is created automatically.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
                    <div>
                      <p className="font-medium">Confirm or Opt Out</p>
                      <p className="text-sm text-muted-foreground">
                        You'll be notified: confirm your delivery address to join, or click "Self-Fulfill" to shop yourself.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">5</span>
                    <div>
                      <p className="font-medium">Worker Shops & Delivers</p>
                      <p className="text-sm text-muted-foreground">
                        A worker claims the job, shops the combined list at the best store, and delivers to all households.
                      </p>
                    </div>
                  </li>
                </ol>
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-900">
                  <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <strong>Cold start solved!</strong> One meal order creates downstream grocery demand. No critical mass needed.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="discounts">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Volume Discounts
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p>
                  The more households join an aggregation window, the better the discount for everyone.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="border rounded p-3 text-center">
                    <div className="text-2xl font-bold text-primary">5%</div>
                    <div className="text-xs text-muted-foreground">5+ orders</div>
                  </div>
                  <div className="border rounded p-3 text-center">
                    <div className="text-2xl font-bold text-primary">10%</div>
                    <div className="text-xs text-muted-foreground">10+ orders</div>
                  </div>
                  <div className="border rounded p-3 text-center">
                    <div className="text-2xl font-bold text-primary">15%</div>
                    <div className="text-xs text-muted-foreground">20+ orders</div>
                  </div>
                  <div className="border rounded p-3 text-center bg-primary/10">
                    <div className="text-2xl font-bold text-primary">20%</div>
                    <div className="text-xs text-muted-foreground">40+ orders</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Packed lunches and baked goods use bulk increments (5, 10, 20, 40) for even better pricing.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="taste-tester">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Taste Tester Rewards
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p>
                  Be among the <strong>first 5,000</strong> to order a new or experimental recipe and earn rewards!
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">First 100 orders</span>
                    <span className="text-sm font-medium text-primary">5 Marks + 10 Reputation</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Orders 101-500</span>
                    <span className="text-sm font-medium text-primary">3 Marks + 5 Reputation</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Orders 501-2,000</span>
                    <span className="text-sm font-medium text-primary">2 Marks + 3 Reputation</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Orders 2,001-5,000</span>
                    <span className="text-sm font-medium text-primary">1 Mark + 1 Reputation</span>
                  </div>
                </div>
                <div className="border-l-4 border-primary pl-4 py-2">
                  <p className="font-medium">Master Taster Status</p>
                  <p className="text-sm text-muted-foreground">
                    When 10+ recipes you tested all reach 5,000 orders, you become a <strong>Master Taster</strong>.
                    All your accumulated Marks convert to Credits!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="icing">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  The Icing Pool (Maker Bonus)
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p>
                  When a recipe reaches <strong>5,000+ orders</strong>, it becomes "vetted" and the maker starts earning Icing.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium mb-2">How Icing Works:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Icing = 20% of LB's 16.7% margin on <strong>volume increases</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>Distributed monthly to makers proportionally based on their recipe's volume growth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                      <span>This is a <strong>bonus on top of the 83.3%</strong> you already earn per meal</span>
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  Create something people love, keep earning as it grows. The community rewards success.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="opt-out">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  What if I Want to Shop Myself?
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <p>
                  No pressure! You can always opt out of aggregation.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>Click "Self-Fulfill" on any aggregation window you're part of</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>Your items are removed from the combined list</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>You get your own shopping list to complete on your timeline</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  Self-fulfilling still contributes to community data (what people need, when they need it) —
                  just without the delivery portion.
                </p>
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
                onUnderstood?.();
                onOpenChange(false);
              }}
              disabled={!videoWatched && !!onUnderstood}
            >
              {videoWatched || !onUnderstood ? 'Got It!' : 'Watch Video First'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Compact inline explainer for embedding in other components
 */
export function AggregationMiniExplainer({ className }: { className?: string }) {
  return (
    <div className={`bg-muted/30 p-4 rounded-lg text-sm space-y-2 ${className}`}>
      <p className="font-medium flex items-center gap-2">
        <ShoppingCart className="w-4 h-4 text-primary" />
        How This Works
      </p>
      <ol className="space-y-1 text-muted-foreground ml-6 list-decimal">
        <li>Your ingredient needs auto-join a collection window</li>
        <li>When 2+ households join ($25+ value), delivery job posts</li>
        <li>Confirm address to join, or opt out to shop yourself</li>
        <li>More participants = bigger discounts (up to 20%)</li>
      </ol>
    </div>
  );
}
