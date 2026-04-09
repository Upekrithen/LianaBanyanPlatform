import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FleetDriver } from "./types";
import { AdaptPin } from "./AdaptPin";

type ActiveDriverMapProps = {
  drivers: FleetDriver[];
};

const PIN_POSITIONS = [
  "left-[8%] top-[18%]",
  "left-[42%] top-[12%]",
  "right-[10%] top-[20%]",
  "left-[16%] top-[56%]",
  "left-[44%] top-[48%]",
  "right-[14%] top-[58%]",
];

export function ActiveDriverMap({ drivers }: ActiveDriverMapProps) {
  return (
    <Card data-xray-id="wheels-active-driver-map">
      <CardHeader>
        <CardTitle>Active Driver Map</CardTitle>
        <CardDescription>Driver visibility with ADAPT pins only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative h-64 overflow-hidden rounded-lg border bg-gradient-to-br from-sky-100 to-emerald-100 p-3 dark:from-sky-950/30 dark:to-emerald-950/30">
          {drivers.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No active drivers shown yet.
            </div>
          ) : (
            drivers.slice(0, PIN_POSITIONS.length).map((driver, index) => (
              <div key={driver.id} className={`absolute ${PIN_POSITIONS[index]}`}>
                <AdaptPin label={driver.label} adaptLabel={driver.adaptLabel} />
              </div>
            ))
          )}
        </div>
        {drivers.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
            {drivers.slice(0, 6).map((driver) => (
              <div key={driver.id} className="rounded-md border bg-muted/30 px-2 py-1.5">
                <p className="font-medium">{driver.label}</p>
                <p className="text-muted-foreground">
                  {driver.area} - {driver.completionPct.toFixed(0)}% earn-down complete
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
