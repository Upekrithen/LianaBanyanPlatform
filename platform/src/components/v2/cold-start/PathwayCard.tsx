import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColdStartPathway } from "./types";

type PathwayCardProps = {
  pathway: ColdStartPathway;
};

export function PathwayCard({ pathway }: PathwayCardProps) {
  const Icon = pathway.icon;

  return (
    <Card id={`pathway-${pathway.id}`} className="flex h-full flex-col">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="text-[11px]">
            {pathway.bestFor}
          </Badge>
        </div>
        <CardTitle className="text-xl">{pathway.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{pathway.purpose}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {pathway.capabilities.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto flex-col items-start gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">You can expand later.</p>
        <Button asChild className="w-full">
          <a href={pathway.setupHref}>Start with {pathway.name}</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

