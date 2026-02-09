import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ShoppingBag, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface InvestorTrackPromptProps {
  onSelectTrack: (track: 'product_only' | 'investor') => void;
  currentTrack?: 'product_only' | 'investor';
}

export function InvestorTrackPrompt({ onSelectTrack, currentTrack }: InvestorTrackPromptProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (currentTrack) {
    return (
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {currentTrack === 'investor' ? (
              <TrendingUp className="w-5 h-5 text-primary" />
            ) : (
              <ShoppingBag className="w-5 h-5 text-primary" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {currentTrack === 'investor' ? 'Investor Track Active' : 'Product-Only Track'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {currentTrack === 'investor' ? 'Equity Potential' : 'Simple Purchases'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {currentTrack === 'investor' 
                  ? 'You can earn equity in projects you back'
                  : 'You\'ll only see product purchase options'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onSelectTrack(currentTrack === 'investor' ? 'product_only' : 'investor')}
            >
              Switch
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <CardTitle className="text-lg">Choose Your Path</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              How would you like to participate in the marketplace?
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product-Only Track */}
        <div className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-start gap-3 mb-3">
            <ShoppingBag className="w-6 h-6 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Just Want Products</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Simple preorders. Vote for production, get your product when it's ready. No equity, no complexity.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground mb-3">
                <li>✓ Straightforward purchases</li>
                <li>✓ Volume pricing benefits</li>
                <li>✓ Support projects you love</li>
                <li>✗ No equity ownership</li>
              </ul>
            </div>
          </div>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => onSelectTrack('product_only')}
          >
            Choose Product-Only Track
          </Button>
        </div>

        {/* Investor Track */}
        <div className="border-2 border-primary rounded-lg p-4 bg-background">
          <div className="flex items-start gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-primary mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Investor Track</h3>
                <Badge variant="secondary" className="text-xs">Equity Potential</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Back projects with longer commitments to earn equity ownership. Benefit from project success beyond just getting the product.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground mb-3">
                <li>✓ Earn equity in projects</li>
                <li>✓ All product-only benefits</li>
                <li>✓ Share in project profits</li>
                <li>✓ Build investment portfolio</li>
              </ul>
            </div>
          </div>
          <Button 
            className="w-full"
            onClick={() => onSelectTrack('investor')}
          >
            Choose Investor Track
          </Button>
        </div>

        {/* Collapsible Details */}
        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
            Learn more about tracks
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2 text-xs text-muted-foreground">
            <p>
              <strong>You can change your track anytime.</strong> Your choice determines what information 
              and options we show you in the marketplace.
            </p>
            <p>
              Product-Only users see simplified purchase flows. Investor Track users see equity splits, 
              time commitments, and portfolio management tools.
            </p>
            <p>
              Both tracks support the same projects - you're just choosing how you want to participate and 
              what level of detail you want to see.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
