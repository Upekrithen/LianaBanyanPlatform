import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MatchSuggestion = {
  label: string;
  detail: string;
};

type MatchSuggestionsPanelProps = {
  suggestions: MatchSuggestion[];
};

export function MatchSuggestionsPanel({ suggestions }: MatchSuggestionsPanelProps) {
  return (
    <Card data-xray-id="wheels-match-suggestions-panel">
      <CardHeader>
        <CardTitle>Match Suggestions</CardTitle>
        <CardDescription>Suggested route clusters based on active postings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Suggestions appear once route volume increases.</p>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion.label} className="flex items-center justify-between rounded-md border p-2.5">
              <p className="text-sm font-medium">{suggestion.label}</p>
              <Badge variant="outline">{suggestion.detail}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
