import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TierComparisonTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Tier Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Feature</TableHead>
                <TableHead>Tier A (49%)</TableHead>
                <TableHead>Tier B (60%)</TableHead>
                <TableHead>Tier C (75%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Creator Participation</TableCell>
                <TableCell>49%</TableCell>
                <TableCell>60%</TableCell>
                <TableCell>75%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">LB Participation</TableCell>
                <TableCell>51%</TableCell>
                <TableCell>40%</TableCell>
                <TableCell>25%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Expected Utilization</TableCell>
                <TableCell>~95%</TableCell>
                <TableCell>~75%</TableCell>
                <TableCell>~40%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Veto Power</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Shelving, licensing</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">5 category blocks</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">All uses</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Anti-Shelving Protection</TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Reversion Clause</TableCell>
                <TableCell>18 months dormancy</TableCell>
                <TableCell>18 months dormancy</TableCell>
                <TableCell>12 months dormancy</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Unlimited LB Internal Use</TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
                <TableCell>
                  <X className="h-4 w-4 text-red-600" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Derivative Works</TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
                <TableCell>Requires approval</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Approval Timeline</TableCell>
                <TableCell>None needed</TableCell>
                <TableCell>30-day auto-approve</TableCell>
                <TableCell>14-day response</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Frivolous Block Protection</TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
                <TableCell>
                  <Check className="h-4 w-4 text-green-600" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Availability</TableCell>
                <TableCell>All creators</TableCell>
                <TableCell>All creators</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">Invitation only</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Best For</TableCell>
                <TableCell className="text-sm">
                  General-purpose tech, maximizing scale
                </TableCell>
                <TableCell className="text-sm">
                  Value-aligned control, predictable restrictions
                </TableCell>
                <TableCell className="text-sm">
                  Exceptional IP, high-profile creators
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Economic Modeling */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-3">Economic Reality Check</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Assuming $1M potential IP value across all use cases:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Tier A</div>
              <div className="text-2xl font-bold text-green-600">$465,500</div>
              <div className="text-xs text-muted-foreground">49% × 95% utilization</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Tier B</div>
              <div className="text-2xl font-bold text-blue-600">$450,000</div>
              <div className="text-xs text-muted-foreground">60% × 75% utilization</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Tier C</div>
              <div className="text-2xl font-bold text-amber-600">$300,000</div>
              <div className="text-xs text-muted-foreground">75% × 40% utilization</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Note: Higher utilization often means more absolute dollars despite lower participation percentage
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
