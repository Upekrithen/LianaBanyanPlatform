import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueOption } from "./types";

type IssueCardProps = {
  issue: IssueOption;
  active: boolean;
  onSelect: (issue: IssueOption["key"]) => void;
};

export function IssueCard({ issue, active, onSelect }: IssueCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-shadow ${active ? "border-primary shadow-sm" : "hover:shadow-md"}`}
      onClick={() => onSelect(issue.key)}
      data-xray-id="political-expedition-issue-card"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{issue.label}</CardTitle>
        <CardDescription>Current chapter</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{issue.chapterSnippet}</p>
      </CardContent>
    </Card>
  );
}
