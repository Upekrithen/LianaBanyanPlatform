import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck, Link as LinkIcon, Rocket, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { StaffPageLayout } from "@/components/staff/StaffPageLayout";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FounderContact = {
  id: string;
  contact_name: string;
  contact_handle: string | null;
  contact_email: string | null;
  relationship_stage: string;
  next_action_summary: string | null;
  red_carpet_entry_id: string | null;
  treasure_map_ids: string[] | null;
  applicable_commission_template_ids: string[] | null;
  notes: string | null;
  google_calendar_event_id: string | null;
  next_scheduled_at: string | null;
};

type Template = {
  id: string;
  title: string;
  commission_type: string;
  domain_scope: string;
  authority_description: string;
  duration_default: string | null;
};

type IssuedCommission = {
  id: string;
  status: "offered" | "accepted" | "declined" | "active" | "completed" | "withdrawn";
  recipient_name: string;
  recipient_email: string | null;
  granted_at: string;
  accepted_at: string | null;
  template_id: string | null;
};

type RedCarpetEntry = {
  id: string;
  recipient_name: string;
  initiative: string | null;
};

type TreasureMapEntry = {
  id: string;
  title: string | null;
  slug: string | null;
  name: string | null;
};

export default function FounderContactDashboard() {
  const queryClient = useQueryClient();
  const [issueForm, setIssueForm] = useState({
    templateId: "",
    recipientName: "",
    recipientEmail: "",
    conversationId: "",
    notes: "",
  });

  const todayCallsQuery = useQuery({
    queryKey: ["founder-contact-today-calls"],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const { data, error } = await supabase
        .from("founder_contacts" as never)
        .select(
          "id, contact_name, contact_handle, contact_email, relationship_stage, next_action_summary, red_carpet_entry_id, treasure_map_ids, applicable_commission_template_ids, notes, google_calendar_event_id, next_scheduled_at",
        )
        .gte("next_scheduled_at", start.toISOString())
        .lte("next_scheduled_at", end.toISOString())
        .order("next_scheduled_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FounderContact[];
    },
  });

  const templatesQuery = useQuery({
    queryKey: ["whatif-commission-templates-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatif_commission_templates" as never)
        .select("id, title, commission_type, domain_scope, authority_description, duration_default")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Template[];
    },
  });

  const issuedQuery = useQuery({
    queryKey: ["whatif-commissions-issued"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatif_commissions_issued" as never)
        .select("id, status, recipient_name, recipient_email, granted_at, accepted_at, template_id")
        .order("granted_at", { ascending: false })
        .limit(40);
      if (error) throw error;
      return (data ?? []) as IssuedCommission[];
    },
  });

  const redCarpetIds = useMemo(
    () =>
      Array.from(
        new Set((todayCallsQuery.data ?? []).map((row) => row.red_carpet_entry_id).filter(Boolean)),
      ) as string[],
    [todayCallsQuery.data],
  );
  const treasureMapIds = useMemo(() => {
    const ids = new Set<string>();
    for (const row of todayCallsQuery.data ?? []) {
      for (const id of row.treasure_map_ids ?? []) {
        ids.add(id);
      }
    }
    return [...ids];
  }, [todayCallsQuery.data]);

  const redCarpetQuery = useQuery({
    queryKey: ["founder-red-carpet-entries", redCarpetIds],
    queryFn: async () => {
      if (!redCarpetIds.length) return [] as RedCarpetEntry[];
      const { data, error } = await supabase
        .from("red_carpet_recipients" as never)
        .select("id, recipient_name, initiative")
        .in("id", redCarpetIds);
      if (error) throw error;
      return (data ?? []) as RedCarpetEntry[];
    },
    enabled: redCarpetIds.length > 0,
  });

  const treasureMapQuery = useQuery({
    queryKey: ["founder-treasure-maps", treasureMapIds],
    queryFn: async () => {
      if (!treasureMapIds.length) return [] as TreasureMapEntry[];
      const { data, error } = await supabase
        .from("treasure_maps" as never)
        .select("id, title, slug, name")
        .in("id", treasureMapIds);
      if (error) throw error;
      return (data ?? []) as TreasureMapEntry[];
    },
    enabled: treasureMapIds.length > 0,
  });

  const issueMutation = useMutation({
    mutationFn: async () => {
      if (!issueForm.templateId || !issueForm.recipientName.trim()) {
        throw new Error("Template and recipient name are required.");
      }
      const payload = {
        template_id: issueForm.templateId,
        recipient_name: issueForm.recipientName.trim(),
        recipient_email: issueForm.recipientEmail.trim() || null,
        granted_in_conversation_id: issueForm.conversationId || null,
        notes: issueForm.notes.trim() || null,
      };
      const { error } = await supabase
        .from("whatif_commissions_issued" as never)
        .insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Commission issued as offered.");
      setIssueForm({ templateId: "", recipientName: "", recipientEmail: "", conversationId: "", notes: "" });
      void queryClient.invalidateQueries({ queryKey: ["whatif-commissions-issued"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to issue commission."),
  });

  const markAcceptedMutation = useMutation({
    mutationFn: async (commissionId: string) => {
      const { error } = await supabase
        .from("whatif_commissions_issued" as never)
        .update({ status: "accepted" } as never)
        .eq("id", commissionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Commission marked accepted.");
      void queryClient.invalidateQueries({ queryKey: ["whatif-commissions-issued"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update status."),
  });

  const syncCalendarMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("sync-google-calendar", { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Calendar sync complete: ${data?.matched_contacts ?? 0} contacts matched.`);
      void queryClient.invalidateQueries({ queryKey: ["founder-contact-today-calls"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Calendar sync failed."),
  });

  const connectCalendarMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("google-calendar-oauth-start", { body: {} });
      if (error) throw error;
      const authUrl = data?.authUrl as string | undefined;
      if (!authUrl) throw new Error("No Google auth URL returned.");
      window.open(authUrl, "_blank", "width=520,height=760");
    },
    onSuccess: () => toast.success("Google OAuth window opened."),
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to start OAuth flow."),
  });

  const templateMap = useMemo(
    () => new Map((templatesQuery.data ?? []).map((row) => [row.id, row])),
    [templatesQuery.data],
  );
  const redCarpetMap = useMemo(
    () => new Map((redCarpetQuery.data ?? []).map((row) => [row.id, row])),
    [redCarpetQuery.data],
  );
  const treasureMapMap = useMemo(
    () => new Map((treasureMapQuery.data ?? []).map((row) => [row.id, row])),
    [treasureMapQuery.data],
  );

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-founder-contact-dashboard">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <StaffPageHeader
                title={
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Founder Contact Dashboard
                  </span>
                }
                description="One-screen call prep: contacts, Red Carpet links, Treasure Maps, and What-If Commissions."
                actions={
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => connectCalendarMutation.mutate()}>
                      Connect Google Calendar
                    </Button>
                    <Button onClick={() => syncCalendarMutation.mutate()} disabled={syncCalendarMutation.isPending}>
                      {syncCalendarMutation.isPending ? "Syncing..." : "Sync Calendar Events"}
                    </Button>
                  </div>
                }
              />
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Calls</CardTitle>
              <CardDescription>Sorted by next scheduled time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(todayCallsQuery.data ?? []).map((contact) => (
                <div key={contact.id} className="rounded border p-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{contact.contact_name}</span>
                    {contact.contact_handle && <Badge variant="outline">{contact.contact_handle}</Badge>}
                    <Badge>{contact.relationship_stage.replaceAll("_", " ")}</Badge>
                    <Badge variant="secondary">{formatDateTime(contact.next_scheduled_at)}</Badge>
                  </div>
                  {contact.next_action_summary && <p className="text-sm">{contact.next_action_summary}</p>}

                  <div className="flex flex-wrap gap-2 text-xs">
                    {contact.red_carpet_entry_id && (
                      <a
                        className="inline-flex items-center gap-1 rounded border px-2 py-1 hover:bg-muted"
                        href={`/red-carpet?recipient=${contact.red_carpet_entry_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LinkIcon className="h-3 w-3" />
                        Preview their welcome
                      </a>
                    )}
                    {(contact.treasure_map_ids ?? []).map((mapId) => {
                      const map = treasureMapMap.get(mapId);
                      const label = map?.title || map?.name || mapId.slice(0, 8);
                      return <Badge key={mapId} variant="outline">{label}</Badge>;
                    })}
                    {(contact.applicable_commission_template_ids ?? []).map((templateId) => {
                      const template = templateMap.get(templateId);
                      return (
                        <Badge key={templateId} variant="secondary">
                          {template?.title ?? "Template"}
                        </Badge>
                      );
                    })}
                  </div>

                  {contact.notes && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>}
                  {contact.google_calendar_event_id && (
                    <a
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      href={`https://calendar.google.com/calendar/u/0/r/eventedit/${contact.google_calendar_event_id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <CalendarCheck className="h-3 w-3" />
                      Open calendar event
                    </a>
                  )}
                  {contact.red_carpet_entry_id && redCarpetMap.get(contact.red_carpet_entry_id) && (
                    <p className="text-xs text-muted-foreground">
                      Red Carpet: {redCarpetMap.get(contact.red_carpet_entry_id)?.recipient_name}
                    </p>
                  )}
                </div>
              ))}
              {(todayCallsQuery.data ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground">No calls scheduled for today.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Commission-Ready Templates
                </CardTitle>
                <CardDescription>Issue pre-drafted What-If commissions during live conversations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(templatesQuery.data ?? []).map((template) => (
                  <div key={template.id} className="rounded border p-2 space-y-1">
                    <p className="text-sm font-medium">{template.title}</p>
                    <p className="text-xs text-muted-foreground">{template.domain_scope}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{template.authority_description}</p>
                  </div>
                ))}
                {(templatesQuery.data ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No templates found.</p>
                )}

                <div className="rounded border p-3 space-y-2">
                  <Label>Issue Now</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={issueForm.templateId}
                    onChange={(event) => setIssueForm((prev) => ({ ...prev, templateId: event.target.value }))}
                  >
                    <option value="">Select template</option>
                    {(templatesQuery.data ?? []).map((template) => (
                      <option key={template.id} value={template.id}>{template.title}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Recipient name"
                    value={issueForm.recipientName}
                    onChange={(event) => setIssueForm((prev) => ({ ...prev, recipientName: event.target.value }))}
                  />
                  <Input
                    placeholder="Recipient email (optional)"
                    value={issueForm.recipientEmail}
                    onChange={(event) => setIssueForm((prev) => ({ ...prev, recipientEmail: event.target.value }))}
                  />
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={issueForm.conversationId}
                    onChange={(event) => setIssueForm((prev) => ({ ...prev, conversationId: event.target.value }))}
                  >
                    <option value="">Linked conversation (optional)</option>
                    {(todayCallsQuery.data ?? []).map((contact) => (
                      <option key={contact.id} value={contact.id}>{contact.contact_name}</option>
                    ))}
                  </select>
                  <Textarea
                    rows={2}
                    placeholder="Notes (optional)"
                    value={issueForm.notes}
                    onChange={(event) => setIssueForm((prev) => ({ ...prev, notes: event.target.value }))}
                  />
                  <Button onClick={() => issueMutation.mutate()} disabled={issueMutation.isPending}>
                    {issueMutation.isPending ? "Issuing..." : "Issue Commission"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Commissions</CardTitle>
                <CardDescription>Issued commissions and current status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(issuedQuery.data ?? []).map((item) => {
                  const template = item.template_id ? templateMap.get(item.template_id) : null;
                  return (
                    <div key={item.id} className="rounded border p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{item.recipient_name}</p>
                          <p className="text-xs text-muted-foreground">{template?.title ?? "Template unavailable"}</p>
                        </div>
                        <Badge variant={item.status === "accepted" || item.status === "active" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Granted {formatDateTime(item.granted_at)}
                      </p>
                      {item.status === "offered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => markAcceptedMutation.mutate(item.id)}
                          disabled={markAcceptedMutation.isPending}
                        >
                          Mark Accepted
                        </Button>
                      )}
                    </div>
                  );
                })}
                {(issuedQuery.data ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No issued commissions yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
