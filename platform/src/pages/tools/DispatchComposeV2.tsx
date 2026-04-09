import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, List } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StickyMobileCTA } from "@/components/v2/StickyMobileCTA";
import { ProofStrip } from "@/components/v2/ProofStrip";
import { AsYouWishConfirmation } from "@/components/v2/dispatch/AsYouWishConfirmation";
import { CanonicalComposer } from "@/components/v2/dispatch/CanonicalComposer";
import { ChannelVariationsPanel } from "@/components/v2/dispatch/ChannelVariationsPanel";
import { DispatchAccessGate } from "@/components/v2/dispatch/DispatchAccessGate";
import { IntentField } from "@/components/v2/dispatch/IntentField";
import { MoneyPennySuggestionChip } from "@/components/v2/dispatch/MoneyPennySuggestionChip";
import { QueueSidebar } from "@/components/v2/dispatch/QueueSidebar";
import { WorkflowBar } from "@/components/v2/dispatch/WorkflowBar";
import { DispatchChannel, DispatchScope, DispatchWorkflowState, QueueDispatchItem } from "@/components/v2/dispatch/types";
import { useAuth } from "@/contexts/AuthContext";
import { useMyGuilds } from "@/hooks/useGuilds";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DISPATCH_CHANNELS: DispatchChannel[] = [
  { id: "email_broadcast", name: "Email broadcast", maxChars: 1200, ctaStyle: "standard" },
  { id: "sms_broadcast", name: "SMS broadcast", maxChars: 240, ctaStyle: "short" },
  { id: "in_app_notification", name: "In-app notification", maxChars: 180, ctaStyle: "short" },
  { id: "oob_auto_post", name: "OOB Auto-Post", maxChars: 280, ctaStyle: "short" },
  { id: "beacon", name: "Beacon", maxChars: 280, ctaStyle: "short" },
  { id: "treasure_map_nudge", name: "Treasure Map nudge", maxChars: 220, ctaStyle: "short" },
  { id: "crew_call_feed", name: "Crew Call feed", maxChars: 320, ctaStyle: "standard" },
  { id: "guild_channel", name: "Guild channel", maxChars: 400, ctaStyle: "standard" },
  { id: "tribe_channel", name: "Tribe channel", maxChars: 400, ctaStyle: "standard" },
  { id: "family_table", name: "Family Table", maxChars: 300, ctaStyle: "standard" },
  { id: "helm_broadcast", name: "Helm broadcast", maxChars: 500, ctaStyle: "standard" },
];

function nextWorkflowState(intent: string, canonicalMessage: string, scheduledFor: string, dispatched: boolean): DispatchWorkflowState {
  if (dispatched) return "Dispatched";
  if (scheduledFor) return "Scheduled";
  if (intent.trim() && canonicalMessage.trim()) return "Review";
  return "Draft";
}

export default function DispatchComposeV2() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: myGuilds = [] } = useMyGuilds();

  const [intent, setIntent] = useState("");
  const [canonicalMessage, setCanonicalMessage] = useState("");
  const [scope, setScope] = useState<DispatchScope>("all_members");
  const [selectedGuildId, setSelectedGuildId] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [queueItems, setQueueItems] = useState<QueueDispatchItem[]>([]);
  const [queueCollapsed, setQueueCollapsed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    if (!user) return;
    let mounted = true;

    const loadQueue = async () => {
      const { data } = await supabase
        .from("member_scheduled_posts")
        .select("id, status, content, platform, created_at, scheduled_for")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!mounted) return;

      setQueueItems(
        ((data as any[]) || []).map((row) => ({
          id: row.id,
          status: row.status ?? "draft",
          content: row.content ?? "",
          platform: row.platform ?? "channel",
          createdAt: row.created_at ?? new Date().toISOString(),
          scheduledFor: row.scheduled_for ?? null,
        })),
      );
    };

    loadQueue();
    return () => {
      mounted = false;
    };
  }, [user]);

  const workflowState = useMemo(
    () => nextWorkflowState(intent, canonicalMessage, scheduledFor, dispatched),
    [intent, canonicalMessage, scheduledFor, dispatched],
  );

  const recallDateLabel = useMemo(() => {
    const latest = queueItems[0];
    if (!latest) return null;
    return new Date(latest.createdAt).toLocaleDateString();
  }, [queueItems]);

  const readyForConfirmation = intent.trim().length > 0 && canonicalMessage.trim().length > 0;

  const applySuggestion = (variant: "tighten" | "cta" | "tone") => {
    if (!canonicalMessage.trim()) return;
    if (variant === "tighten") {
      setCanonicalMessage((value) => `${value}\n\nKey move: Keep this message focused on one next action.`);
    } else if (variant === "cta") {
      setCanonicalMessage((value) => `${value}\n\nAction: Reply with your next step and timeline.`);
    } else {
      setCanonicalMessage((value) => `${value}\n\nTone note: Stay plainspoken and specific.`);
    }
  };

  const handleDispatchStub = async () => {
    if (!user) return;
    if (!readyForConfirmation) {
      toast.error("Intent and canonical message are required.");
      return;
    }
    if (scope === "guild" && !selectedGuildId) {
      toast.error("Select a guild for guild-scoped dispatch.");
      return;
    }

    setSending(true);
    try {
      const createdAt = new Date().toISOString();
      const records = DISPATCH_CHANNELS.map((channel) => ({
        user_id: user.id,
        content: canonicalMessage,
        adapted_content: canonicalMessage.slice(0, channel.maxChars),
        media_urls: [],
        platform: channel.id,
        scheduled_for: scheduledFor || createdAt,
        status: scheduledFor ? "scheduled" : "pending",
        dispatch_mode: scheduledFor ? "scheduled" : "now",
        dispatch_batch_id: crypto.randomUUID(),
      }));

      const { error } = await supabase.from("member_scheduled_posts").insert(records as any);
      if (error) throw error;

      setDispatched(true);
      setShowConfirm(false);
      toast.success("Dispatch queued through K160 pipeline stub.");
    } catch (error) {
      console.error(error);
      toast.error("Could not queue dispatch.");
    } finally {
      setSending(false);
    }
  };

  const primaryMobileLabel = !intent.trim()
    ? "Start a dispatch"
    : readyForConfirmation
      ? "As You Wish"
      : "Continue";

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="dispatch-compose">
      <div data-tour-target="dispatch-compose" />

      <div className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        {isMobile ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">
                <List className="mr-1.5 h-4 w-4" />
                Queue
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Dispatch Queue</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <QueueSidebar items={queueItems} collapsed={false} onToggleCollapsed={() => undefined} />
              </div>
            </DrawerContent>
          </Drawer>
        ) : null}
      </div>

      <header className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">One story, many megaphones</p>
        <h1 className="text-3xl font-bold">Write the message once, then teach it to every channel.</h1>
        <p className="max-w-4xl text-muted-foreground">
          Starts by asking &quot;What change are you trying to make?&quot; then helps draft in one canonical place. Platform variations happen around the edges.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => document.getElementById("dispatch-intent")?.focus()}>
            Start a dispatch
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/dispatch/queue">View queue</Link>
          </Button>
        </div>
        <ProofStrip items={["11 channels", "One canonical message", "As You Wish confirmation"]} />
      </header>

      <DispatchAccessGate guildScoped={scope === "guild"} guildId={selectedGuildId}>
        <div className="mt-8 grid gap-4 xl:grid-cols-[1fr_320px]">
          <main className="space-y-5">
            <IntentField value={intent} onChange={setIntent} />

            <section className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Dispatch scope</Label>
                <Select value={scope} onValueChange={(value) => setScope(value as DispatchScope)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_members">All members</SelectItem>
                    <SelectItem value="guild">Guild-scoped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Schedule (optional)</Label>
                <Input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(event) => setScheduledFor(event.target.value)}
                />
              </div>
            </section>

            {scope === "guild" ? (
              <section className="space-y-1.5">
                <Label>Guild</Label>
                <Select value={selectedGuildId} onValueChange={setSelectedGuildId}>
                  <SelectTrigger><SelectValue placeholder="Select a guild" /></SelectTrigger>
                  <SelectContent>
                    {myGuilds.map((membership) => (
                      <SelectItem key={membership.guild_id} value={membership.guild_id}>
                        {(membership.guild as any)?.name ?? membership.guild_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </section>
            ) : null}

            <CanonicalComposer value={canonicalMessage} onChange={setCanonicalMessage} disabled={!intent.trim()} />

            <section className="space-y-2">
              <p className="text-sm font-medium">MoneyPenny suggestions</p>
              <div className="flex flex-wrap gap-2">
                <MoneyPennySuggestionChip label="Tighten opening" onApply={() => applySuggestion("tighten")} />
                <MoneyPennySuggestionChip label="Clarify CTA" onApply={() => applySuggestion("cta")} />
                <MoneyPennySuggestionChip label="Tone check" onApply={() => applySuggestion("tone")} />
              </div>
              {recallDateLabel ? (
                <p className="text-xs text-muted-foreground">
                  You said something similar on {recallDateLabel}. Want to reference it?
                </p>
              ) : null}
            </section>

            <ChannelVariationsPanel channels={DISPATCH_CHANNELS} canonicalMessage={canonicalMessage} />
            <WorkflowBar activeState={workflowState} />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button type="button" variant="outline" asChild>
                <Link to="/dispatch/queue">View queue</Link>
              </Button>
              <Button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={!readyForConfirmation || sending}
              >
                As You Wish
              </Button>
            </div>
          </main>

          {isMobile ? null : (
            <QueueSidebar items={queueItems} collapsed={queueCollapsed} onToggleCollapsed={() => setQueueCollapsed((value) => !value)} />
          )}
        </div>
      </DispatchAccessGate>

      <AsYouWishConfirmation
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDispatchStub}
        loading={sending}
        mobileFullscreen={isMobile}
      />

      {isMobile ? (
        <StickyMobileCTA
          primary={{
            label: primaryMobileLabel,
            onClick: () => {
              if (!intent.trim()) {
                document.getElementById("dispatch-intent")?.focus();
                return;
              }
              if (readyForConfirmation) {
                setShowConfirm(true);
                return;
              }
              toast.info("Continue drafting your canonical message.");
            },
          }}
          secondary={{
            label: "View queue",
            href: "/dispatch/queue",
          }}
        />
      ) : null}
    </PortalPageLayout>
  );
}
