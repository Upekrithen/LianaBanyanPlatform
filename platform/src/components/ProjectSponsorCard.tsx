/**
 * ProjectSponsorCard — K154 Task 2, Step 4
 * Shows active sponsorships (escrowed), completed (released),
 * total Credits committed, and available Credit balance.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HandCoins, Lock, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useMySponsorships, type BountySponsorship } from "@/hooks/useBountySponsorship";

function statusBadge(status: BountySponsorship["status"]) {
  const map: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    pledged: { label: "Pledged", className: "bg-blue-500/10 text-blue-600 border-blue-500/30", icon: HandCoins },
    escrowed: { label: "In Escrow", className: "bg-amber-500/10 text-amber-600 border-amber-500/30", icon: Lock },
    released: { label: "Released", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: CheckCircle },
    refunded: { label: "Refunded", className: "bg-slate-500/10 text-slate-600 border-slate-500/30", icon: XCircle },
    disputed: { label: "Disputed", className: "bg-red-500/10 text-red-600 border-red-500/30", icon: AlertTriangle },
  };
  const m = map[status] || map.pledged;
  const Icon = m.icon;
  return (
    <Badge variant="outline" className={m.className}>
      <Icon className="w-3 h-3 mr-1" />
      {m.label}
    </Badge>
  );
}

export function ProjectSponsorCard() {
  const { data: sponsorships, isLoading } = useMySponsorships();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const items = sponsorships || [];
  const escrowed = items.filter((s) => s.status === "escrowed");
  const released = items.filter((s) => s.status === "released");
  const totalCommitted = items.reduce((sum, s) => sum + (s.amount_credits || 0), 0);
  const escrowedTotal = escrowed.reduce((sum, s) => sum + (s.amount_credits || 0), 0);
  const releasedTotal = released.reduce((sum, s) => sum + (s.amount_credits || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HandCoins className="h-5 w-5 text-primary" />
          Project Sponsorships
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-bold text-amber-600">{escrowedTotal.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">In Escrow</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-bold text-emerald-600">{releasedTotal.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Released</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-2xl font-bold">{totalCommitted.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Total Credits</p>
          </div>
        </div>

        {/* Active sponsorships */}
        {escrowed.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Active (In Escrow)</h4>
            {escrowed.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium capitalize">{s.bounty_type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{s.amount_credits} Credits</span>
                  {statusBadge(s.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent completed */}
        {released.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
            {released.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium capitalize">{s.bounty_type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.completed_at
                      ? new Date(s.completed_at).toLocaleDateString()
                      : new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{s.amount_credits} Credits</span>
                  {statusBadge(s.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No sponsorships yet. Back a bounty or project to see your sponsorship history here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
