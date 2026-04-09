import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WeekReflectionPanelProps = {
  summaryLine: string;
  adjustmentSuggestion: string;
};

export function WeekReflectionPanel({ summaryLine, adjustmentSuggestion }: WeekReflectionPanelProps) {
  return (
    <Card className="border-primary/30 bg-gradient-to-b from-primary/10 to-background">
      <CardHeader>
        <CardTitle className="text-lg">Week reflection</CardTitle>
        <CardDescription>{summaryLine}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary" className="mb-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
          Room to adjust
        </Badge>
        <p className="text-sm">{adjustmentSuggestion}</p>
      </CardContent>
    </Card>
  );
}
