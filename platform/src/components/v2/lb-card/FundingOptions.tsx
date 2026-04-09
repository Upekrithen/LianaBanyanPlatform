import { Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FundingOptionsProps = {
  onAddFunds: () => void;
};

export function FundingOptions({ onAddFunds }: FundingOptionsProps) {
  return (
    <Card data-xray-id="lb-card-funding-options">
      <CardHeader>
        <CardTitle>Funding options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="flex items-center gap-2 font-medium">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              From Bank Account
            </p>
            <p className="text-sm text-muted-foreground">
              Plaid-connected transfer flow (stub). Cash only.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onAddFunds}>
            Add funds
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
