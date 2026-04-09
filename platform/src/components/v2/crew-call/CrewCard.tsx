import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AdaptArcVisualization } from "./AdaptArcVisualization";

export type CrewMemberCardData = {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  adaptScore: number | null;
  radiusMiles: number | null;
  availability: "available" | "booked";
  rateLabel: string;
  isFeatured: boolean;
};

type CrewCardProps = {
  crew: CrewMemberCardData;
  onBook: (crew: CrewMemberCardData) => void;
};

export function CrewCard({ crew, onBook }: CrewCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {crew.name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("")}
          </div>
          <div className="min-w-0">
            <CardTitle className="line-clamp-1 text-base">{crew.name}</CardTitle>
            <p className="line-clamp-1 text-sm text-muted-foreground">{crew.title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{crew.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{crew.category}</Badge>
          <Badge variant="outline">
            {crew.radiusMiles ? `Within ${crew.radiusMiles} mi` : "Radius not listed"}
          </Badge>
          <Badge
            className={
              crew.availability === "available"
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white"
            }
          >
            {crew.availability === "available" ? "Available" : "Booked"}
          </Badge>
        </div>
        {crew.adaptScore !== null ? <AdaptArcVisualization score={crew.adaptScore} /> : null}
        <p className="text-sm font-medium">{crew.rateLabel}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onBook(crew)}>
          Book this crew
        </Button>
      </CardFooter>
    </Card>
  );
}
