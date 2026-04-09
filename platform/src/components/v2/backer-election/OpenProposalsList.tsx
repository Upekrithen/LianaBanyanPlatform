import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ElectionProposal, ProposalCard } from "./ProposalCard";

type OpenProposalsListProps = {
  proposals: ElectionProposal[];
  onReview: (proposalId: string) => void;
};

export function OpenProposalsList({ proposals, onReview }: OpenProposalsListProps) {
  return (
    <Card id="open-proposals-list">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Open proposals</CardTitle>
      </CardHeader>
      <CardContent>
        {proposals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} onReview={onReview} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            No active proposals right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
