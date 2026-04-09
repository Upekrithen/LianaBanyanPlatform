import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldAlert,
  ShieldCheck,
  ShieldBan,
  Star,
  Archive,
  Ban,
  MessageSquare,
  CheckCircle,
  Bot,
  Loader2,
  Users,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface GatekeeperContact {
  id: string;
  created_at: string;
  sender_name: string | null;
  sender_email: string | null;
  sender_phone: string | null;
  sender_organization: string | null;
  sender_title: string | null;
  subject: string | null;
  message_body: string;
  source: string;
  tier: number;
  relevance_score: number | null;
  claude_summary: string | null;
  claude_category: string | null;
  is_public_figure: boolean;
  public_figure_context: string | null;
  status: string;
  reviewed_at: string | null;
  responded_at: string | null;
  founder_notes: string | null;
  sms_sent: boolean;
}

const TIER_CONFIG: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  1: { label: "VIP", color: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400", icon: <Star className="w-3 h-3" /> },
  2: { label: "Flagged", color: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400", icon: <ShieldAlert className="w-3 h-3" /> },
  3: { label: "Standard", color: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400", icon: <ShieldCheck className="w-3 h-3" /> },
  4: { label: "Blocked", color: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400", icon: <ShieldBan className="w-3 h-3" /> },
};

const CATEGORY_LABELS: Record<string, string> = {
  partnership: "Partnership",
  press: "Press",
  member_issue: "Member Issue",
  collaboration: "Collaboration",
  investment_inquiry: "Funding Inquiry",
  spam: "Spam",
  other: "Other",
};

function ContactCard({
  contact,
  onAction,
}: {
  contact: GatekeeperContact;
  onAction: (id: string, action: string, notes?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(contact.founder_notes || "");
  const tier = TIER_CONFIG[contact.tier] || TIER_CONFIG[3];

  return (
    <Card className={`${contact.status === "archived" ? "opacity-60" : ""}`}>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm truncate">
                {contact.sender_name || "Unknown"}
              </span>
              <Badge variant="outline" className={`text-[10px] ${tier.color}`}>
                {tier.icon}
                <span className="ml-1">{tier.label}</span>
              </Badge>
              {contact.is_public_figure && (
                <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400">
                  Public Figure
                </Badge>
              )}
              {contact.sms_sent && (
                <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-300">
                  SMS Sent
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {contact.sender_email}
              {contact.sender_organization && ` · ${contact.sender_organization}`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground">
              {new Date(contact.created_at).toLocaleDateString()}
            </p>
            {contact.relevance_score != null && (
              <p className="text-[10px] font-mono text-muted-foreground">
                Score: {contact.relevance_score}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium">{contact.subject}</p>
          {contact.claude_summary && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Bot className="w-3 h-3 shrink-0" />
              {contact.claude_summary}
            </p>
          )}
          {contact.claude_category && (
            <Badge variant="secondary" className="text-[10px] mt-1">
              {CATEGORY_LABELS[contact.claude_category] || contact.claude_category}
            </Badge>
          )}
        </div>

        {expanded && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded text-muted-foreground">
              {contact.message_body}
            </p>
            {contact.public_figure_context && (
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Context: {contact.public_figure_context}
              </p>
            )}
            <div className="space-y-2">
              <Textarea
                placeholder="Founder notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(contact.id, "responded", notes)}
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Responded
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(contact.id, "archived", notes)}
              >
                <Archive className="w-3 h-3 mr-1" />
                Archive
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={() => onAction(contact.id, "blocked", notes)}
              >
                <Ban className="w-3 h-3 mr-1" />
                Block
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-amber-600"
                onClick={() => onAction(contact.id, "whitelist", notes)}
              >
                <Star className="w-3 h-3 mr-1" />
                Whitelist
              </Button>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Collapse" : "Expand"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function GatekeeperInbox() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("priority");

  const { data: contacts, isLoading, refetch } = useQuery({
    queryKey: ["gatekeeper-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gatekeeper_contacts" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as GatekeeperContact[];
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      id,
      action,
      notes,
    }: {
      id: string;
      action: string;
      notes?: string;
    }) => {
      if (action === "whitelist") {
        const contact = contacts?.find((c) => c.id === id);
        if (contact?.sender_name) {
          await supabase.from("gatekeeper_lists" as never).insert({
            list_type: "whitelist",
            value: contact.sender_name.toLowerCase(),
            label: `Added by Founder: ${contact.sender_name}`,
          } as never);
        }
        action = "reviewed";
      }

      if (action === "blocked") {
        const contact = contacts?.find((c) => c.id === id);
        if (contact?.sender_email) {
          await supabase.from("gatekeeper_lists" as never).insert({
            list_type: "blacklist",
            value: contact.sender_email.toLowerCase(),
            label: `Blocked by Founder`,
          } as never);
        }
      }

      const updatePayload: Record<string, unknown> = {
        status: action,
        reviewed_at: new Date().toISOString(),
      };
      if (action === "responded") {
        updatePayload.responded_at = new Date().toISOString();
      }
      if (notes) {
        updatePayload.founder_notes = notes;
      }

      const { error } = await supabase
        .from("gatekeeper_contacts" as never)
        .update(updatePayload as never)
        .eq("id" as never, id as never);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatekeeper-contacts"] });
      toast.success("Contact updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleAction = (id: string, action: string, notes?: string) => {
    actionMutation.mutate({ id, action, notes });
  };

  const priority = contacts?.filter((c) => c.tier <= 2 && c.status === "pending") || [];
  const relevant = contacts?.filter((c) => c.tier === 3 && c.status === "pending") || [];
  const blocked = contacts?.filter((c) => c.tier === 4 || c.status === "blocked") || [];
  const reviewed = contacts?.filter((c) => ["reviewed", "responded", "archived"].includes(c.status)) || [];

  const counts = {
    priority: priority.length,
    relevant: relevant.length,
    blocked: blocked.length,
    reviewed: reviewed.length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Gatekeeper Inbox
        </h2>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="priority" className="text-xs gap-1">
            <ShieldAlert className="w-3 h-3" />
            Priority {counts.priority > 0 && `(${counts.priority})`}
          </TabsTrigger>
          <TabsTrigger value="relevant" className="text-xs gap-1">
            <Users className="w-3 h-3" />
            Relevant {counts.relevant > 0 && `(${counts.relevant})`}
          </TabsTrigger>
          <TabsTrigger value="blocked" className="text-xs gap-1">
            <ShieldBan className="w-3 h-3" />
            Blocked {counts.blocked > 0 && `(${counts.blocked})`}
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="text-xs gap-1">
            <CheckCircle className="w-3 h-3" />
            Reviewed {counts.reviewed > 0 && `(${counts.reviewed})`}
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="priority" className="space-y-3 mt-4">
              {priority.length === 0 ? (
                <EmptyState icon={<ShieldAlert />} text="No priority contacts pending" />
              ) : (
                priority.map((c) => (
                  <ContactCard key={c.id} contact={c} onAction={handleAction} />
                ))
              )}
            </TabsContent>

            <TabsContent value="relevant" className="space-y-3 mt-4">
              {relevant.length === 0 ? (
                <EmptyState icon={<Users />} text="No relevant contacts pending" />
              ) : (
                relevant.map((c) => (
                  <ContactCard key={c.id} contact={c} onAction={handleAction} />
                ))
              )}
            </TabsContent>

            <TabsContent value="blocked" className="space-y-3 mt-4">
              {blocked.length === 0 ? (
                <EmptyState icon={<ShieldBan />} text="No blocked contacts" />
              ) : (
                blocked.map((c) => (
                  <ContactCard key={c.id} contact={c} onAction={handleAction} />
                ))
              )}
            </TabsContent>

            <TabsContent value="reviewed" className="space-y-3 mt-4">
              {reviewed.length === 0 ? (
                <EmptyState icon={<CheckCircle />} text="No reviewed contacts yet" />
              ) : (
                reviewed.map((c) => (
                  <ContactCard key={c.id} contact={c} onAction={handleAction} />
                ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
        <div className="w-8 h-8 mx-auto mb-2 opacity-40">{icon}</div>
        <p className="text-sm">{text}</p>
      </CardContent>
    </Card>
  );
}

export default GatekeeperInbox;
