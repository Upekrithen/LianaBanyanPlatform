import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ElectionProposal } from "./ProposalCard";

type TurnoutLedgerProps = {
  proposals: ElectionProposal[];
};

export function TurnoutLedger({ proposals }: TurnoutLedgerProps) {
  return (
    <Card id="turnout-ledger">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Turnout ledger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <div key={proposal.id} className="rounded-md border p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{proposal.title}</span>
                <span className="text-muted-foreground">{proposal.turnoutCount} participants</span>
              </div>
              <p className="text-xs text-muted-foreground">Turnout: {proposal.turnoutPct.toFixed(0)}%</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Turnout appears here when proposals are active.</p>
        )}
      </CardContent>
    </Card>
  );
}
