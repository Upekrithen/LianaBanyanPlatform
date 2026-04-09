import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ElectionProposal } from "./ProposalCard";

type ProposalDetailWorkspaceProps = {
  proposal: ElectionProposal | null;
};

export function ProposalDetailWorkspace({ proposal }: ProposalDetailWorkspaceProps) {
  if (!proposal) return null;

  return (
    <Card id="proposal-detail-workspace">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Proposal detail workspace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium">{proposal.title}</p>
        <p className="text-sm text-muted-foreground">{proposal.description}</p>
      </CardContent>
    </Card>
  );
}
