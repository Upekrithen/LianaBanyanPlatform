/**
 * Sweet Sixteen initiative display with status (Session 19).
 */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface InitiativeCardProps {
  name: string;
  description?: string;
  status?: "live" | "planned" | "in_development";
}

export function InitiativeCard({ name, description, status = "planned" }: InitiativeCardProps) {
  return (
    <Card className="cephas-initiative-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{name}</span>
          <Badge variant={status === "live" ? "default" : "secondary"}>{status}</Badge>
        </div>
      </CardHeader>
      {description && <CardContent className="pt-0 text-sm text-muted-foreground">{description}</CardContent>}
    </Card>
  );
}
