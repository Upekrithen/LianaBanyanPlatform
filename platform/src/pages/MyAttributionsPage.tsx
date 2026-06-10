import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface PromotionAttribution {
  id: string;
  attributed_amount_cents: number;
  currency_class: "credits" | "marks" | "joules";
  attribution_event: string;
  vesting_unlock_at: string | null;
  claimed_at: string | null;
  created_at: string;
}

export default function MyAttributionsPage() {
  const [attributions, setAttributions] = useState<PromotionAttribution[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAttributions();
  }, []);

  async function loadAttributions() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your Red Carpet credits.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("promotion_attributions")
        .select("*")
        .eq("introducer_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAttributions(data ?? []);
    } catch (err) {
      console.error("Error loading attributions:", err);
      toast({
        title: "Load Error",
        description: "Failed to load your Red Carpet credits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (cents: number, currencyClass: string) => {
    return `${cents} ${currencyClass}`;
  };

  const getStatusBadge = (attribution: PromotionAttribution) => {
    if (attribution.claimed_at) {
      return <Badge variant="default">Claimed</Badge>;
    }

    if (attribution.vesting_unlock_at) {
      const unlockDate = new Date(attribution.vesting_unlock_at);
      const now = new Date();

      if (unlockDate > now) {
        const daysLeft = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return <Badge variant="secondary">Vesting ({daysLeft}d left)</Badge>;
      } else {
        return <Badge variant="outline">Ready to Claim</Badge>;
      }
    }

    return <Badge variant="outline">Pending</Badge>;
  };

  const totalUnclaimed = attributions
    .filter(a => !a.claimed_at && a.vesting_unlock_at && new Date(a.vesting_unlock_at) <= new Date())
    .reduce((sum, a) => sum + a.attributed_amount_cents, 0);

  const totalVesting = attributions
    .filter(a => !a.claimed_at && a.vesting_unlock_at && new Date(a.vesting_unlock_at) > new Date())
    .reduce((sum, a) => sum + a.attributed_amount_cents, 0);

  const totalClaimed = attributions
    .filter(a => a.claimed_at)
    .reduce((sum, a) => sum + a.attributed_amount_cents, 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Red Carpet Credits</h1>
        <p className="text-muted-foreground">
          Track your credits earned from introducing new members to Liana Banyan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready to Claim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnclaimed} credits</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vesting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVesting} credits</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaimed} credits</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attribution History</CardTitle>
          <CardDescription>
            All credits earned from your Red Carpet introductions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : attributions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No attributions yet. Share your Red Carpet link to start earning!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vesting Date</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributions.map((attribution) => (
                  <TableRow key={attribution.id}>
                    <TableCell className="font-medium">
                      {attribution.attribution_event.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(attribution.attributed_amount_cents, attribution.currency_class)}
                    </TableCell>
                    <TableCell>{getStatusBadge(attribution)}</TableCell>
                    <TableCell>
                      {attribution.vesting_unlock_at
                        ? new Date(attribution.vesting_unlock_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {new Date(attribution.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
