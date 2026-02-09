import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShoppingCart, Clock, TrendingUp, Award, DollarSign } from "lucide-react";

export const ConversionFlowDiagram = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>From Kickstarter Pledge to Equity Shares</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Flow Diagram */}
          <div className="space-y-8">
            {/* Step 1: Kickstarter */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Step 1: Kickstarter Pledge</h3>
                  <p className="text-muted-foreground mb-3">
                    You back a product on Kickstarter and receive a confirmation
                  </p>
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pledge Amount:</span>
                      <span className="font-bold">$500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-600 font-medium">Confirmed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Backer Email:</span>
                      <span className="font-mono text-xs">backer@email.com</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-6 my-4 h-12 border-l-2 border-dashed border-primary/30" />
            </div>

            {/* Step 2: Conversion Window */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Step 2: Choose Time Commitment</h3>
                  <p className="text-muted-foreground mb-3">
                    Select your investment timeline to determine equity/cash split
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      <div className="text-sm font-medium mb-1">Quick Exit</div>
                      <div className="text-xs text-muted-foreground mb-2">30 days</div>
                      <div className="space-y-1 text-xs">
                        <div>Equity: 10%</div>
                        <div>Cash: 90%</div>
                      </div>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                      <div className="text-sm font-medium mb-1">Balanced</div>
                      <div className="text-xs text-muted-foreground mb-2">90 days</div>
                      <div className="space-y-1 text-xs">
                        <div>Equity: 50%</div>
                        <div>Cash: 50%</div>
                      </div>
                    </div>
                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <div className="text-sm font-medium mb-1">Early Bird</div>
                      <div className="text-xs text-muted-foreground mb-2">180 days</div>
                      <div className="space-y-1 text-xs">
                        <div>Equity: 90%</div>
                        <div>Cash: 10%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-6 my-4 h-12 border-l-2 border-dashed border-primary/30" />
            </div>

            {/* Step 3: Conversion */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Step 3: Pledge Conversion</h3>
                  <p className="text-muted-foreground mb-3">
                    Your pledge splits into equity shares and product credits
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Equity Shares</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-bold">$450 (90%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valuation:</span>
                          <span>$10,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ownership:</span>
                          <span className="font-bold text-primary">4.5%</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="h-5 w-5 text-secondary" />
                        <span className="font-semibold">Product Credits</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-bold">$50 (10%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Use:</span>
                          <span>Future products</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expiry:</span>
                          <span>Never</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-6 my-4 h-12 border-l-2 border-dashed border-primary/30" />
            </div>

            {/* Step 4: Growth */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Step 4: Value Growth</h3>
                  <p className="text-muted-foreground mb-3">
                    As the project succeeds, your equity value increases
                  </p>
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Initial Value</div>
                        <div className="font-bold">$450</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Project Grows</div>
                        <div className="font-bold">$10k → $100k</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Your Equity Value</div>
                        <div className="font-bold text-green-600 text-lg">$4,500</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-500/20">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total ROI:</span>
                        <span className="font-bold text-xl text-green-600">9x (900%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medallion Connection */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            Blockchain Medallion Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Each investment is represented by a <strong>Hexagonal Medallion NFT</strong> that serves as:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Proof of Ownership:</strong> Your equity shares are recorded on the blockchain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Intellectual Property Protection:</strong> Timestamps your investment and stake</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Share Certificate:</strong> QR code links to immutable ledger of your ownership</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Voting Power:</strong> Your medallion grants proportional voting rights in project decisions</span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-background rounded border">
            <p className="text-xs text-muted-foreground">
              The medallion must be funded first before other project products can be activated. 
              This ensures proper capitalization and governance structure from the start.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
