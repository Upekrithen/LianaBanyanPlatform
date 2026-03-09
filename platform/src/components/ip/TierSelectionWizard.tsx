import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Scale, Lock, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TierSelectionWizardProps {
  onTierSelect: (tier: "tier_a" | "tier_b" | "tier_c") => void;
}

export function TierSelectionWizard({ onTierSelect }: TierSelectionWizardProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          Choose the tier that best balances your need for control with your desire for maximum IP utilization.
          You can always discuss changes with LB leadership if your needs evolve.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Tier A */}
        <Card className="border-2 hover:border-primary transition-all hover:shadow-lg cursor-pointer group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Tier A: Ethical Guardrails Only</CardTitle>
                  <CardDescription className="mt-1">
                    Maximum scale with anti-shelving protections
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary">Recommended</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Participation Split</div>
                <div className="text-2xl font-bold">49% Creator / 51% LB</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Expected Utilization</div>
                <div className="text-2xl font-bold text-green-600">~95%</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Your Control:</div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Veto power over strategic shelving</li>
                <li>• Approval required for external licensing</li>
                <li>• Reversion clause if dormant for 18 months</li>
                <li>• 2x voting weight on decisions affecting your IP</li>
                <li>• Quarterly commercialization reports</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">LB Freedom:</div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Unlimited internal use across all LB products</li>
                <li>• Can create derivatives and combinations</li>
                <li>• Fast commercialization (no approval delays)</li>
                <li>• Can propose any ethical use case</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <Button
                className="w-full group-hover:shadow-md transition-shadow"
                onClick={() => onTierSelect("tier_a")}
              >
                Select Tier A
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tier B */}
        <Card className="border-2 hover:border-primary transition-all hover:shadow-lg cursor-pointer group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Scale className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Tier B: Category Restrictions</CardTitle>
                  <CardDescription className="mt-1">
                    Pre-select up to 5 prohibited use categories
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">Balanced</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Participation Split</div>
                <div className="text-2xl font-bold">60% Creator / 40% LB</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Expected Utilization</div>
                <div className="text-2xl font-bold text-blue-600">~75%</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Your Control:</div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Choose up to 5 prohibited categories (e.g., politics, adult content)</li>
                <li>• 30-day approval window for new uses</li>
                <li>• Auto-approve if you don't respond</li>
                <li>• "Dibs" system for derivative priority</li>
                <li>• All Tier A protections included</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Example Categories:</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Political Campaigns</Badge>
                <Badge variant="secondary">Adult Content</Badge>
                <Badge variant="secondary">Military/Defense</Badge>
                <Badge variant="secondary">Tobacco</Badge>
                <Badge variant="secondary">Fossil Fuels</Badge>
              </div>
              <p className="text-xs text-muted-foreground">You can customize your own categories</p>
            </div>

            <div className="pt-4 border-t">
              <Button
                className="w-full group-hover:shadow-md transition-shadow"
                variant="outline"
                onClick={() => onTierSelect("tier_b")}
              >
                Select Tier B
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tier C */}
        <Card className="border-2 border-amber-500/20 bg-amber-500/5 opacity-75">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Lock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Tier C: Case-by-Case Approval</CardTitle>
                  <CardDescription className="mt-1">
                    Requires C-suite authorization + 2 approvals
                  </CardDescription>
                </div>
              </div>
              <Badge variant="destructive">Invitation Only</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Participation Split</div>
                <div className="text-2xl font-bold">75% Creator / 25% LB</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Expected Utilization</div>
                <div className="text-2xl font-bold text-amber-600">~40%</div>
              </div>
            </div>

            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertDescription className="text-sm">
                <strong>Invitation Only:</strong> LB extends Tier C offers to select creators with exceptionally rare IP,
                strategic ecosystem value, or significant network effects. This tier is not available for self-selection.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Criteria for Invitation:</div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Nobel Prize-level IP or equivalent rarity</li>
                <li>• Fills critical strategic gap in LB ecosystem</li>
                <li>• Creator brings massive network effects (50k+ followers)</li>
                <li>• Competitive lockout value</li>
                <li>• First-mover advantage in emerging technology</li>
              </ul>
            </div>

            <div className="pt-4 border-t">
              <Button
                className="w-full"
                variant="secondary"
                disabled
              >
                Available by Invitation Only
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
