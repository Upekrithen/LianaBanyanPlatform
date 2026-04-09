import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type JudgeDescriptor = {
  name: "Oracle" | "Morpheus" | "Red Queen" | "Dredd";
  backend: "Claude" | "Perplexity";
  role: string;
};

type FourJudgeExplainerProps = {
  judges: JudgeDescriptor[];
};

export function FourJudgeExplainer({ judges }: FourJudgeExplainerProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" id="four-judge-explainer">
      {judges.map((judge) => (
        <Card key={judge.name} className="border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{judge.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="outline">{judge.backend} backend</Badge>
            <p className="text-sm text-muted-foreground">{judge.role}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
