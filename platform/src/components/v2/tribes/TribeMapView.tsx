import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type TribeMapPoint = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
};

type TribeMapViewProps = {
  points: TribeMapPoint[];
  onSelect: (tribeId: string) => void;
};

function normalized(points: TribeMapPoint[]) {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat || 1;
  const lngSpan = maxLng - minLng || 1;
  return points.map((point) => ({
    ...point,
    x: ((point.longitude - minLng) / lngSpan) * 90 + 5,
    y: ((maxLat - point.latitude) / latSpan) * 80 + 10,
  }));
}

export function TribeMapView({ points, onSelect }: TribeMapViewProps) {
  if (points.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Map view</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No neighborhood coordinates available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const mapped = normalized(points);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Neighborhood tribe map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[380px] rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          {mapped.map((point) => (
            <button
              key={point.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400 bg-orange-500 px-2 py-1 text-[10px] font-semibold text-white shadow"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={() => onSelect(point.id)}
            >
              {point.name}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
