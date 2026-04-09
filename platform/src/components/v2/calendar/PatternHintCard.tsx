import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PatternHintCardProps = {
  hintQuestion: string;
};

export function PatternHintCard({ hintQuestion }: PatternHintCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pattern hint</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{hintQuestion}</p>
      </CardContent>
    </Card>
  );
}
