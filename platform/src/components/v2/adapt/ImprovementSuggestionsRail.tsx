import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ImprovementSuggestionsRailProps = {
  suggestions: string[];
};

export function ImprovementSuggestionsRail({ suggestions }: ImprovementSuggestionsRailProps) {
  return (
    <Card data-xray-id="adapt-improvement-suggestions">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Forward-looking suggestions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {suggestions.map((suggestion) => (
          <div key={suggestion} className="rounded-lg border bg-amber-50/60 p-3 text-sm text-slate-700">
            {suggestion}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
