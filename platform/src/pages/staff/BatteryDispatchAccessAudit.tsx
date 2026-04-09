import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StaffPageLayout } from "@/components/staff/StaffPageLayout";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { supabase } from "@/integrations/supabase/client";
import { SOURCE_LABELS, type BatteryDispatchSource } from "@/lib/batteryDispatchAccess";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AccessRow = {
  id: string;
  user_id: string;
  access_source: BatteryDispatchSource;
  source_ref_id: string | null;
  status: "active" | "suspended" | "revoked";
  granted_at: string;
  last_active_at: string;
  notes: string | null;
};

type AccessStatusRow = {
  user_id: string;
  has_access: boolean;
  active_sources: BatteryDispatchSource[] | null;
  most_recent_activity: string | null;
  active_grant_count: number;
};

const SOURCES: BatteryDispatchSource[] = [
  "influencer",
  "project",
  "harper",
  "jukebox_artist",
  "crown",
  "captain",
  "staff_override",
];

export default function BatteryDispatchAccessAudit() {
  const queryClient = useQueryClient();
  const [sourceFilter, setSourceFilter] = useState<"all" | BatteryDispatchSource>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "revoked">("active");
  const [overrideUserId, setOverrideUserId] = useState("");
  const [overrideNotes, setOverrideNotes] = useState("");

  const accessQuery = useQuery({
    queryKey: ["battery-dispatch-access-audit", sourceFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("battery_dispatch_access" as never)
        .select("id, user_id, access_source, source_ref_id, status, granted_at, last_active_at, notes")
        .order("last_active_at", { ascending: false })
        .limit(500);

      if (sourceFilter !== "all") {
        query = query.eq("access_source", sourceFilter);
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as AccessRow[];
    },
  });

  const suspendedUsersQuery = useQuery({
    queryKey: ["battery-dispatch-suspended-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("battery_dispatch_access_status" as never)
        .select("user_id, has_access, active_sources, most_recent_activity, active_grant_count")
        .eq("has_access", false)
        .order("most_recent_activity", { ascending: true, nullsFirst: true })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as unknown as AccessStatusRow[];
    },
  });

  const grantOverrideMutation = useMutation({
    mutationFn: async () => {
      const userId = overrideUserId.trim();
      if (!userId) {
        throw new Error("User ID is required.");
      }
      const { error } = await supabase.rpc("upsert_battery_dispatch_grant" as never, {
        p_user_id: userId,
        p_access_source: "staff_override",
        p_source_ref_id: "manual_override",
        p_status: "active",
        p_notes: overrideNotes.trim() || "Manual staff override grant",
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Staff override granted.");
      setOverrideNotes("");
      queryClient.invalidateQueries({ queryKey: ["battery-dispatch-access-audit"] });
      queryClient.invalidateQueries({ queryKey: ["battery-dispatch-suspended-users"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to grant override.");
    },
  });

  const revokeOverrideMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("upsert_battery_dispatch_grant" as never, {
        p_user_id: userId,
        p_access_source: "staff_override",
        p_source_ref_id: "manual_override",
        p_status: "revoked",
        p_notes: "Staff override revoked",
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Staff override revoked.");
      queryClient.invalidateQueries({ queryKey: ["battery-dispatch-access-audit"] });
      queryClient.invalidateQueries({ queryKey: ["battery-dispatch-suspended-users"] });
    },
    onError: () => toast.error("Failed to revoke override."),
  });

  const counts = useMemo(() => {
    const rows = accessQuery.data ?? [];
    return {
      total: rows.length,
      active: rows.filter((row) => row.status === "active").length,
      suspended: rows.filter((row) => row.status === "suspended").length,
      revoked: rows.filter((row) => row.status === "revoked").length,
    };
  }, [accessQuery.data]);

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-battery-dispatch-access-audit">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <StaffPageHeader
                title="Battery Dispatch Access Audit"
                description="Audit all grant paths, monitor suspended users, and manage staff overrides."
              />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">Total: {counts.total}</Badge>
              <Badge variant="default">Active: {counts.active}</Badge>
              <Badge variant="secondary">Suspended: {counts.suspended}</Badge>
              <Badge variant="secondary">Revoked: {counts.revoked}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as "all" | BatteryDispatchSource)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {SOURCE_LABELS[source]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "suspended" | "revoked")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Staff Override Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <Input
                  placeholder="User ID (UUID)"
                  value={overrideUserId}
                  onChange={(event) => setOverrideUserId(event.target.value)}
                />
                <Input
                  placeholder="Override note (optional)"
                  value={overrideNotes}
                  onChange={(event) => setOverrideNotes(event.target.value)}
                />
                <Button
                  onClick={() => grantOverrideMutation.mutate()}
                  disabled={grantOverrideMutation.isPending}
                >
                  {grantOverrideMutation.isPending ? "Granting..." : "Grant override"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Override grants use source <code>staff_override</code> and can be revoked below.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Access Grants</CardTitle>
            </CardHeader>
            <CardContent>
              {accessQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading grants...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(accessQuery.data ?? []).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs">{row.user_id}</TableCell>
                        <TableCell>{SOURCE_LABELS[row.access_source]}</TableCell>
                        <TableCell>
                          <Badge variant={row.status === "active" ? "default" : "secondary"}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(row.last_active_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[280px] truncate">
                          {row.notes ?? "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.access_source === "staff_override" && row.status !== "revoked" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeOverrideMutation.mutate(row.user_id)}
                              disabled={revokeOverrideMutation.isPending}
                            >
                              Revoke override
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Users With Suspended Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suspendedUsersQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading suspended users...</p>
              ) : (suspendedUsersQuery.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No suspended users in current view.</p>
              ) : (
                (suspendedUsersQuery.data ?? []).map((row) => (
                  <div key={row.user_id} className="rounded border p-3 space-y-1">
                    <p className="font-mono text-xs">{row.user_id}</p>
                    <p className="text-xs text-muted-foreground">
                      Most recent activity: {row.most_recent_activity ? new Date(row.most_recent_activity).toLocaleString() : "none"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reactivate by restoring any active path (Influencer publish, Project activity, Harper/Jukebox/Crown/Captain active status, or staff override).
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}
