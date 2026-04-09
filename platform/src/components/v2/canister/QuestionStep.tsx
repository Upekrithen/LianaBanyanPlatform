import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuestionStepProps = {
  stepLabel: string;
  question: string;
  children: ReactNode;
};

export function QuestionStep({ stepLabel, question, children }: QuestionStepProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stepLabel}</p>
        <CardTitle className="text-xl">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
