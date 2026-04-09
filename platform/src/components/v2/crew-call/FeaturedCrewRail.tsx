import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CrewMemberCardData } from "./CrewCard";

type FeaturedCrewRailProps = {
  items: CrewMemberCardData[];
};

export function FeaturedCrewRail({ items }: FeaturedCrewRailProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3" id="featured-crew-rail">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Featured crew</h2>
        <p className="text-xs text-muted-foreground">Top ADAPT</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <Card key={item.id} className="min-w-[240px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground line-clamp-1">{item.title}</p>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white">ADAPT {Math.round(item.adaptScore ?? 0)}</Badge>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
