import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SubmitDesignCTAProps = {
  onSubmit: () => void;
  onSeeRound: () => void;
};

export function SubmitDesignCTA({ onSubmit, onSeeRound }: SubmitDesignCTAProps) {
  return (
    <Card data-xray-id="design-democracy-submit-cta">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Submit design, then vote with Credits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Submission is free. Voting is Credits-weighted. Winning designs progress into real production.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSubmit}>Submit a design</Button>
          <Button variant="outline" onClick={onSeeRound}>
            See active round
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
