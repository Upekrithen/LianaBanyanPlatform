import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

type PipelineCardProps = {
  preview: string;
  recommendation: string;
  compact?: boolean;
};

export function PipelineCard({ preview, recommendation, compact = false }: PipelineCardProps) {
  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <CardTitle className={compact ? "text-base" : "text-lg"}>Pipeline</CardTitle>
        <CardDescription>{preview}</CardDescription>
      </CardHeader>
      <CardContent className={compact ? "pt-0" : undefined}>
        <p className="text-sm text-muted-foreground">{recommendation}</p>
        <Button asChild size="sm" variant="outline" className="mt-3">
          <a href="#captain-deeper-layers">
            Review pipeline
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
