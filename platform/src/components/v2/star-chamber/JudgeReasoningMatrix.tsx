import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActiveCaseDetails } from "./ActiveCaseWorkspace";

const JUDGES = ["Oracle", "Morpheus", "Red Queen", "Dredd"] as const;

function normalize(value: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ").slice(0, 120);
}

function convergenceLabel(values: string[]) {
  const unique = new Set(values.filter((value) => value.length > 0));
  if (unique.size <= 1 && unique.size > 0) return "Converged";
  if (unique.size <= 2) return "Near convergence";
  return "Divergence";
}

type JudgeReasoningMatrixProps = {
  item: ActiveCaseDetails | null;
};

export function JudgeReasoningMatrix({ item }: JudgeReasoningMatrixProps) {
  if (!item) return null;

  const rows = [
    {
      question: "What is the core issue?",
      Oracle: item.oracle,
      Morpheus: item.morpheus,
      "Red Queen": item.redQueen,
      Dredd: item.dredd,
    },
    {
      question: "What evidence carries the highest weight?",
      Oracle: item.oracle,
      Morpheus: item.morpheus,
      "Red Queen": item.redQueen,
      Dredd: item.dredd,
    },
    {
      question: "What action is proportional?",
      Oracle: item.recommendedAction ?? item.oracle,
      Morpheus: item.recommendedAction ?? item.morpheus,
      "Red Queen": item.recommendedAction ?? item.redQueen,
      Dredd: item.dredd ?? item.finalAction,
    },
  ];

  return (
    <Card id="judge-reasoning-matrix">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Judge reasoning matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border p-2 text-left">Question</th>
                {JUDGES.map((judge) => (
                  <th key={judge} className="border p-2 text-left">{judge}</th>
                ))}
                <th className="border p-2 text-left">Signal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const normalizedValues = JUDGES.map((judge) => normalize(row[judge]));
                const label = convergenceLabel(normalizedValues);
                const tone =
                  label === "Converged"
                    ? "bg-emerald-700 text-white"
                    : label === "Near convergence"
                    ? "bg-amber-700 text-white"
                    : "bg-slate-700 text-white";
                return (
                  <tr key={row.question}>
                    <td className="border p-2 align-top font-medium">{row.question}</td>
                    {JUDGES.map((judge) => (
                      <td key={`${row.question}-${judge}`} className="border p-2 align-top text-muted-foreground">
                        {row[judge] ?? "Pending"}
                      </td>
                    ))}
                    <td className="border p-2 align-top">
                      <Badge className={tone}>{label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
