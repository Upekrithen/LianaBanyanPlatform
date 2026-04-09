import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HousingFundPoint = {
  label: string;
  fundValue: number;
  subsidyCount: number;
};

type HousingFundGraphProps = {
  points: HousingFundPoint[];
};

export function HousingFundGraph({ points }: HousingFundGraphProps) {
  return (
    <Card data-xray-id="housing-fund-graph">
      <CardHeader>
        <CardTitle>Housing Fund Story Arc</CardTitle>
        <CardDescription>Growth path and subsidy outcomes in one narrative chart.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="fundValue" stroke="#16a34a" fill="#86efac" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-2">
          <p className="rounded-md border bg-muted/20 p-2">This month enabled two subsidies for members moving from pending to active occupancy.</p>
          <p className="rounded-md border bg-muted/20 p-2">Cooperative fund growth unlocks next property acquisition while preserving Cost + 20% operating discipline.</p>
        </div>
      </CardContent>
    </Card>
  );
}
