import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StarCase } from "./CaseRow";

export type ActiveCaseDetails = StarCase & {
  description: string;
  oracle: string | null;
  morpheus: string | null;
  redQueen: string | null;
  dredd: string | null;
  recommendedAction: string | null;
  finalAction: string | null;
  founderOverride: boolean;
  founderOverrideReason: string | null;
  resolvedAt: string | null;
};

type ActiveCaseWorkspaceProps = {
  item: ActiveCaseDetails | null;
};

export function ActiveCaseWorkspace({ item }: ActiveCaseWorkspaceProps) {
  if (!item) return null;

  return (
    <Card id="active-case-workspace">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Active case workspace</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-medium">Case #{item.caseNumber}: {item.title}</p>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  );
}
