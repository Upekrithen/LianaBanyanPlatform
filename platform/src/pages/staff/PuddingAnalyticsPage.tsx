import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { StaffPageLayout } from "@/components/staff/StaffPageLayout";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PuddingAnalyticsRow = {
  pudding_number: number;
  title: string;
  view_count: number | null;
  pepper_rating_avg: number | null;
  pepper_rating_count: number | null;
  rating_active: boolean | null;
  created_at: string | null;
};

export default function PuddingAnalyticsPage() {
  const analyticsQuery = useQuery({
    queryKey: ["pudding-analytics-table"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_puddings" as never)
        .select("pudding_number, title, view_count, pepper_rating_avg, pepper_rating_count, rating_active, created_at")
        .eq("rating_active", true)
        .order("pepper_rating_avg", { ascending: false, nullsFirst: false })
        .order("pepper_rating_count", { ascending: false })
        .order("view_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PuddingAnalyticsRow[];
    },
    staleTime: 30 * 1000,
  });

  const rows = analyticsQuery.data ?? [];

  const stats = useMemo(() => {
    const activeCount = rows.length;
    const totalViews = rows.reduce((acc, row) => acc + Number(row.view_count ?? 0), 0);
    const weightedSum = rows.reduce(
      (acc, row) => acc + Number(row.pepper_rating_avg ?? 0) * Number(row.pepper_rating_count ?? 0),
      0,
    );
    const totalRatings = rows.reduce((acc, row) => acc + Number(row.pepper_rating_count ?? 0), 0);
    return {
      activeCount,
      totalViews,
      totalRatings,
      weightedAverage: totalRatings > 0 ? weightedSum / totalRatings : 0,
    };
  }, [rows]);

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-pudding-analytics">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <StaffPageHeader
                title={
                  <span className="flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    Pudding Pepper Analytics
                  </span>
                }
                description="Hot to cold leaderboard for rating-active puddings (100+ views)."
              />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="outline">{stats.activeCount} active puddings</Badge>
              <Badge variant="outline">{stats.totalViews.toLocaleString()} views</Badge>
              <Badge variant="outline">{stats.totalRatings.toLocaleString()} ratings</Badge>
              <Badge variant="secondary">Avg 🌶️ {stats.weightedAverage.toFixed(2)}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading pudding analytics...</p>
              ) : rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No puddings have activated ratings yet. Ratings unlock at 100 views.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Raters</TableHead>
                      <TableHead>Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.pudding_number}>
                        <TableCell className="font-medium">#{row.pudding_number}</TableCell>
                        <TableCell>{row.title}</TableCell>
                        <TableCell>{Number(row.view_count ?? 0).toLocaleString()}</TableCell>
                        <TableCell>{renderPeppers(row.pepper_rating_avg)}</TableCell>
                        <TableCell>{Number(row.pepper_rating_count ?? 0).toLocaleString()}</TableCell>
                        <TableCell>{formatDate(row.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}

function renderPeppers(average: number | null) {
  if (average === null || !Number.isFinite(average)) {
    return <span className="text-muted-foreground">No rating</span>;
  }
  const rounded = Math.max(1, Math.min(5, Math.round(average)));
  const peppers = Array.from({ length: rounded }, () => "🌶️").join("");
  return (
    <span className="inline-flex items-center gap-2">
      <span>{peppers}</span>
      <span className="text-xs text-muted-foreground">{average.toFixed(2)}</span>
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
