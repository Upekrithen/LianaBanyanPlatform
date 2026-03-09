import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShoppingCart, Clock, TrendingUp, Award, DollarSign, ShieldCheck } from "lucide-react";

export const SponsorshipFlowDiagram = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>From Kickstarter Pledge to Platform Membership</CardTitle>
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
                  <h3 className="font-semibold text-lg mb-2">Step 1: Back a Project on Kickstarter</h3>
                  <p className="text-muted-foreground mb-3">
                    You sponsor a product on Kickstarter and receive a confirmation
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

            {/* Step 2: Choose Commitment */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Step 2: Choose Your Commitment Level</h3>
                  <p className="text-muted-foreground mb-3">
                    Select your service commitment period to determine participation/credit split
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      <div className="text-sm font-medium mb-1">Product Focus</div>
                      <div className="text-xs text-muted-foreground mb-2">30 days</div>
                      <div className="space-y-1 text-xs">
                        <div>Participation: 10%</div>
                        <div>Credits: 90%</div>
                      </div>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                      <div className="text-sm font-medium mb-1">Balanced</div>
                      <div className="text-xs text-muted-foreground mb-2">90 days</div>
                      <div className="space-y-1 text-xs">
                        <div>Participation: 50%</div>
                        <div>Credits: 50%</div>
                      </div>
                    </div>
                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <div className="text-sm font-medium mb-1">Founding Member</div>
                      <div className="text-xs text-muted-foreground mb-2">180 days</div>
                      <div className="space-y-1 text-xs">
                        <div>Participation: 90%</div>
                        <div>Credits: 10%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-6 my-4 h-12 border-l-2 border-dashed border-primary/30" />
            </div>

            {/* Step 3: Allocation */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Step 3: Pledge Allocation</h3>
                  <p className="text-muted-foreground mb-3">
                    Your pledge splits into membership participation and product credits
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Membership Participation</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-bold">$450 (90%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Access:</span>
                          <span>Full cooperative services</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Governance:</span>
                          <span className="font-bold text-primary">Full voting</span>
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
                          <span>Products &amp; services</span>
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

            {/* Step 4: Cooperative Membership */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Step 4: Active Membership</h3>
                  <p className="text-muted-foreground mb-3">
                    As a cooperative member, you participate in governance and access services
                  </p>
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Your Role</div>
                        <div className="font-bold">Cooperative Member</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Services</div>
                        <div className="font-bold">16 Initiatives</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Governance</div>
                        <div className="font-bold text-green-600">Active Voice</div>
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
            Hexagonal Medallion &mdash; Your Membership Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Each membership is represented by a <strong>Hexagonal Medallion</strong> that serves as:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">&#8226;</span>
              <span><strong>Membership Verification:</strong> Your cooperative membership is recorded on-chain</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">&#8226;</span>
              <span><strong>Service Access Key:</strong> Unlocks access to cooperative services and platforms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">&#8226;</span>
              <span><strong>Membership Certificate:</strong> QR code links to your participation record on the Transparent Ledger</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">&#8226;</span>
              <span><strong>Governance Token:</strong> Your medallion grants voting rights in cooperative decisions</span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-background rounded border">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              Medallions are non-transferable membership tokens, not financial instruments.
              They represent service access rights within the cooperative.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Keep backward-compatible export
export const ConversionFlowDiagram = SponsorshipFlowDiagram;
