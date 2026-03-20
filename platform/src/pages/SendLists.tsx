// Send Lists — Two stamps. No accidents. Every message intentional.
// Service layer: src/lib/sendListService.ts
// TODO: Wire to Supabase send_lists, send_list_recipients, send_list_audit tables

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Send,
  Plus,
  Stamp,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  Mail,
  Smartphone,
  Globe,
  Archive,
  Eye,
  Lock,
  Unlock,
} from "lucide-react";
import type {
  SendList,
  SendListRecipient,
  ListType,
  ListStatus,
  DeliveryMethod,
} from "@/lib/sendListService";
import {
  LIST_TYPES,
  LIST_STATUSES,
  SAMPLE_SEND_LISTS,
} from "@/lib/sendListService";
import { PortalPageLayout } from "@/components/PortalPageLayout";

// ─── Status Helpers ──────────────────────────────────────────────────────────

function getStatusProgress(status: ListStatus): number {
  const index = LIST_STATUSES.indexOf(status);
  return ((index + 1) / LIST_STATUSES.length) * 100;
}

function getStatusBadge(status: ListStatus) {
  const variants: Record<ListStatus, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-gray-600 text-gray-100" },
    STAMP_1: { label: "Stamp 1", className: "bg-green-700 text-green-100" },
    REVIEW: { label: "Review", className: "bg-blue-700 text-blue-100" },
    STAMP_2: { label: "Stamp 2", className: "bg-red-700 text-red-100" },
    SENDING: { label: "Sending", className: "bg-yellow-600 text-yellow-100 animate-pulse" },
    SENT: { label: "Sent", className: "bg-emerald-700 text-emerald-100" },
  };
  const v = variants[status];
  return <Badge className={v.className}>{v.label}</Badge>;
}

function getDeliveryIcon(method: DeliveryMethod) {
  switch (method) {
    case "Email": return <Mail className="h-4 w-4 text-blue-400" />;
    case "SMS": return <Smartphone className="h-4 w-4 text-green-400" />;
    case "In-Platform": return <Globe className="h-4 w-4 text-purple-400" />;
  }
}

// ─── Stamp Confirmation Dialog ───────────────────────────────────────────────

interface StampDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stampNumber: 1 | 2;
  recipientCount: number;
  listName: string;
  onConfirm: () => void;
}

function StampConfirmationDialog({ open, onOpenChange, stampNumber, recipientCount, listName, onConfirm }: StampDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const isMatch = inputValue === "As You Wish";
  const isStamp2 = stampNumber === 2;

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm();
      setInputValue("");
      onOpenChange(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setInputValue("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`sm:max-w-md ${isStamp2 ? "border-2 border-red-600" : "border border-green-600"}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stamp className={`h-5 w-5 ${isStamp2 ? "text-red-500" : "text-green-500"}`} />
            Apply STAMP {stampNumber}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {stampNumber === 1 ? (
              <span>
                You are confirming that this list of <strong className="text-white">{recipientCount}</strong> recipients
                in <strong className="text-white">"{listName}"</strong> has been reviewed and is correct.
              </span>
            ) : (
              <span className="text-red-300">
                You are confirming that <strong className="text-white">{recipientCount}</strong> messages
                will be sent <strong className="text-white">NOW</strong>. This cannot be undone.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm text-slate-400">
            Type <span className="font-mono font-bold text-white">"As You Wish"</span> to confirm:
          </p>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type confirmation here..."
            className={`font-mono ${isStamp2 ? "border-red-600/50 focus:border-red-500" : "border-green-600/50 focus:border-green-500"}`}
          />
          {inputValue.length > 0 && !isMatch && (
            <p className="text-xs text-yellow-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Does not match. Type exactly: As You Wish
            </p>
          )}
          {isMatch && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Confirmed.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isMatch}
            onClick={handleConfirm}
            className={isStamp2
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
            }
          >
            <Stamp className="h-4 w-4 mr-2" />
            Apply STAMP {stampNumber}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create List Form ────────────────────────────────────────────────────────

interface CreateFormProps {
  onCancel: () => void;
  onCreate: (name: string, type: ListType, description: string) => void;
}

function CreateListForm({ onCancel, onCreate }: CreateFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ListType | "">("");
  const [description, setDescription] = useState("");

  const canCreate = name.trim().length > 0 && type !== "";

  return (
    <Card className="border-dashed border-2 border-slate-600 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-lg">Create New Send List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">List Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Ring 3 — Close Friends"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">List Type</label>
          <Select value={type} onValueChange={(v) => setType(v as ListType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {LIST_TYPES.map((lt) => (
                <SelectItem key={lt} value={lt}>{lt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this send list for?"
            rows={3}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            disabled={!canCreate}
            onClick={() => onCreate(name, type as ListType, description)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recipient Table ─────────────────────────────────────────────────────────

interface RecipientTableProps {
  recipients: SendListRecipient[];
  editable: boolean;
  onRemove?: (id: string) => void;
}

function RecipientTable({ recipients, editable, onRemove }: RecipientTableProps) {
  return (
    <div className="space-y-2">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left py-2 px-3">Delivery</th>
              <th className="text-left py-2 px-3">Card Type</th>
              <th className="text-left py-2 px-3">Status</th>
              {editable && <th className="text-right py-2 px-3">Action</th>}
            </tr>
          </thead>
          <tbody>
            {recipients.map((r) => (
              <tr key={r.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-2 px-3 font-medium">{r.name}</td>
                <td className="py-2 px-3">
                  <span className="flex items-center gap-1.5">
                    {getDeliveryIcon(r.deliveryMethod)}
                    {r.deliveryMethod}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-400">{r.cardType}</td>
                <td className="py-2 px-3">
                  <Badge variant="outline" className="text-xs capitalize">{r.status}</Badge>
                </td>
                {editable && (
                  <td className="py-2 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove?.(r.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list view */}
      <div className="md:hidden space-y-2">
        {recipients.map((r) => (
          <div key={r.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
            <div className="space-y-1">
              <p className="font-medium text-sm">{r.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {getDeliveryIcon(r.deliveryMethod)}
                <span>{r.deliveryMethod}</span>
                <span className="text-slate-600">|</span>
                <span>{r.cardType}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">{r.status}</Badge>
              {editable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove?.(r.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status Progress Bar ─────────────────────────────────────────────────────

function StatusProgressBar({ status }: { status: ListStatus }) {
  const steps = LIST_STATUSES;
  const currentIndex = steps.indexOf(status);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-500">
        {steps.map((step, i) => (
          <span
            key={step}
            className={
              i <= currentIndex
                ? i === currentIndex
                  ? "text-white font-medium"
                  : "text-emerald-400"
                : ""
            }
          >
            {step.replace("_", " ")}
          </span>
        ))}
      </div>
      <Progress value={getStatusProgress(status)} className="h-2" />
    </div>
  );
}

// ─── Send List Card ──────────────────────────────────────────────────────────

interface SendListCardProps {
  list: SendList;
  onApplyStamp1: (id: string) => void;
  onApplyStamp2: (id: string) => void;
  onExecuteSend: (id: string) => void;
  onRemoveRecipient: (listId: string, recipientId: string) => void;
}

function SendListCard({ list, onApplyStamp1, onApplyStamp2, onExecuteSend, onRemoveRecipient }: SendListCardProps) {
  const [expanded, setExpanded] = useState(false);

  const emailCount = list.recipients.filter((r) => r.deliveryMethod === "Email").length;
  const smsCount = list.recipients.filter((r) => r.deliveryMethod === "SMS").length;
  const platformCount = list.recipients.filter((r) => r.deliveryMethod === "In-Platform").length;

  const isLocked = list.status !== "DRAFT";

  const typeBadgeColor: Record<ListType, string> = {
    "Cue Card": "bg-indigo-700/50 text-indigo-200",
    "Crown Letter": "bg-amber-700/50 text-amber-200",
    "Event Invitation": "bg-teal-700/50 text-teal-200",
    "Announcement": "bg-purple-700/50 text-purple-200",
  };

  return (
    <Card className="bg-slate-900/70 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {list.name}
              {isLocked && <Lock className="h-3.5 w-3.5 text-yellow-500" />}
              {!isLocked && <Unlock className="h-3.5 w-3.5 text-slate-500" />}
            </CardTitle>
            <CardDescription className="text-slate-400">{list.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={typeBadgeColor[list.type]}>{list.type}</Badge>
            {getStatusBadge(list.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {list.recipients.length} recipients
          </span>
          <span className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" /> {emailCount} Email
          </span>
          {smsCount > 0 && (
            <span className="flex items-center gap-1">
              <Smartphone className="h-3.5 w-3.5" /> {smsCount} SMS
            </span>
          )}
          {platformCount > 0 && (
            <span className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> {platformCount} In-Platform
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Created {list.createdAt}
          </span>
        </div>

        {/* Progress bar */}
        <StatusProgressBar status={list.status} />

        {/* Status-specific content */}
        {list.status === "DRAFT" && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
              <Eye className="h-4 w-4 mr-1" />
              {expanded ? "Hide" : "View"} Recipients
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onApplyStamp1(list.id)}
            >
              <Stamp className="h-4 w-4 mr-1" />
              Apply STAMP 1
            </Button>
          </div>
        )}

        {list.status === "STAMP_1" && (
          <div className="space-y-3">
            <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-3">
              <p className="text-sm text-green-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                STAMP 1 applied — List locked with {list.recipients.length} recipients.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Review the recipient list below before applying STAMP 2.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
              <Eye className="h-4 w-4 mr-1" />
              {expanded ? "Hide" : "Review"} Recipients
            </Button>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 ml-2"
              onClick={() => onApplyStamp2(list.id)}
            >
              <Stamp className="h-4 w-4 mr-1" />
              Apply STAMP 2
            </Button>
          </div>
        )}

        {list.status === "REVIEW" && (
          <div className="space-y-3">
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Full review mode — inspect every recipient before final stamp.
              </p>
            </div>
            <RecipientTable recipients={list.recipients} editable={false} />
          </div>
        )}

        {list.status === "STAMP_2" && (
          <div className="space-y-3">
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <p className="text-sm text-red-300 flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Both stamps applied. Ready to send {list.recipients.length} messages.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                This is the final step. Once sent, messages cannot be recalled.
              </p>
            </div>
            <Button
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              onClick={() => onExecuteSend(list.id)}
            >
              <Send className="h-4 w-4 mr-2" />
              Execute Send
            </Button>
          </div>
        )}

        {list.status === "SENDING" && (
          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
            <p className="text-sm text-yellow-300 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending in progress... {list.recipients.length} messages queued.
            </p>
          </div>
        )}

        {list.status === "SENT" && list.deliveryStats && (
          <div className="space-y-3">
            <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-lg p-4">
              <p className="text-sm text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                All messages sent successfully.
              </p>
              {list.sentAt && (
                <p className="text-xs text-slate-400 mt-1">
                  Sent at {new Date(list.sentAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-white">{list.deliveryStats.sent}</p>
                <p className="text-xs text-slate-400">Sent</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-400">{list.deliveryStats.delivered}</p>
                <p className="text-xs text-slate-400">Delivered</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-400">{list.deliveryStats.opened}</p>
                <p className="text-xs text-slate-400">Opened</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
              <Eye className="h-4 w-4 mr-1" />
              {expanded ? "Hide" : "View"} Delivery Report
            </Button>
          </div>
        )}

        {/* Expandable recipient list for DRAFT / STAMP_1 / SENT */}
        {expanded && (list.status === "DRAFT" || list.status === "STAMP_1" || list.status === "SENT") && (
          <div className="pt-2 border-t border-slate-800">
            <RecipientTable
              recipients={list.recipients}
              editable={list.status === "DRAFT"}
              onRemove={(recipientId) => onRemoveRecipient(list.id, recipientId)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SendLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<SendList[]>(SAMPLE_SEND_LISTS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // Stamp dialog state
  const [stampDialog, setStampDialog] = useState<{
    open: boolean;
    stampNumber: 1 | 2;
    listId: string;
  }>({ open: false, stampNumber: 1, listId: "" });

  // Computed stats
  const stats = useMemo(() => {
    const total = lists.length;
    const pendingStamp1 = lists.filter((l) => l.status === "DRAFT").length;
    const pendingStamp2 = lists.filter((l) => l.status === "STAMP_1" || l.status === "REVIEW").length;
    const sentToday = lists.filter((l) => {
      if (!l.sentAt) return false;
      const sentDate = new Date(l.sentAt).toDateString();
      return sentDate === new Date().toDateString();
    }).length;
    return { total, pendingStamp1, pendingStamp2, sentToday };
  }, [lists]);

  // Active (non-sent) and archived (sent) lists
  const activeLists = lists.filter((l) => l.status !== "SENT");
  const sentLists = lists.filter((l) => l.status === "SENT");

  // Handlers
  const handleCreateList = (name: string, type: ListType, description: string) => {
    const newList: SendList = {
      id: `sl-${Date.now()}`,
      userId: user?.id ?? "",
      name,
      type,
      description,
      status: "DRAFT",
      createdAt: new Date().toISOString().split("T")[0],
      recipients: [],
    };
    setLists((prev) => [newList, ...prev]);
    setShowCreateForm(false);
  };

  const handleApplyStamp1 = (listId: string) => {
    setStampDialog({ open: true, stampNumber: 1, listId });
  };

  const handleApplyStamp2 = (listId: string) => {
    setStampDialog({ open: true, stampNumber: 2, listId });
  };

  const handleStampConfirm = () => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id !== stampDialog.listId) return l;
        if (stampDialog.stampNumber === 1) {
          return { ...l, status: "STAMP_1" as ListStatus };
        }
        return { ...l, status: "STAMP_2" as ListStatus };
      })
    );
  };

  const handleExecuteSend = (listId: string) => {
    // Simulate sending: set to SENDING, then SENT after a delay
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, status: "SENDING" as ListStatus } : l))
    );
    setTimeout(() => {
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                status: "SENT" as ListStatus,
                sentAt: new Date().toISOString(),
                deliveryStats: {
                  sent: l.recipients.length,
                  delivered: l.recipients.length,
                  opened: Math.floor(l.recipients.length * 0.6),
                },
                recipients: l.recipients.map((r) => ({
                  ...r,
                  status: Math.random() > 0.3 ? ("opened" as const) : ("delivered" as const),
                })),
              }
            : l
        )
      );
    }, 3000);
  };

  const handleRemoveRecipient = (listId: string, recipientId: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, recipients: l.recipients.filter((r) => r.id !== recipientId) }
          : l
      )
    );
  };

  const currentStampList = lists.find((l) => l.id === stampDialog.listId);

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="send-lists">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Send className="h-8 w-8 text-indigo-400" />
            Send Lists
          </h1>
          <p className="text-slate-400 text-lg">
            Two stamps. No accidents. Every message intentional.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-slate-400">Total Lists</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.pendingStamp1}</p>
              <p className="text-xs text-slate-400">Pending STAMP 1</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.pendingStamp2}</p>
              <p className="text-xs text-slate-400">Pending STAMP 2</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.sentToday}</p>
              <p className="text-xs text-slate-400">Sent Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Create New List */}
        {!showCreateForm ? (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="mb-6 bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Send List
          </Button>
        ) : (
          <div className="mb-6">
            <CreateListForm
              onCancel={() => setShowCreateForm(false)}
              onCreate={handleCreateList}
            />
          </div>
        )}

        {/* Active Send Lists */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-400" />
            Active Send Lists
            {activeLists.length > 0 && (
              <Badge variant="outline" className="ml-2">{activeLists.length}</Badge>
            )}
          </h2>
          {activeLists.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="p-8 text-center text-slate-500">
                <Send className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No active send lists. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            activeLists.map((list) => (
              <SendListCard
                key={list.id}
                list={list}
                onApplyStamp1={handleApplyStamp1}
                onApplyStamp2={handleApplyStamp2}
                onExecuteSend={handleExecuteSend}
                onRemoveRecipient={handleRemoveRecipient}
              />
            ))
          )}
        </div>

        {/* Sent Lists Archive */}
        {sentLists.length > 0 && (
          <Collapsible open={archiveOpen} onOpenChange={setArchiveOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between mb-4">
                <span className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Sent Lists Archive ({sentLists.length})
                </span>
                {archiveOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
              {sentLists.map((list) => (
                <SendListCard
                  key={list.id}
                  list={list}
                  onApplyStamp1={handleApplyStamp1}
                  onApplyStamp2={handleApplyStamp2}
                  onExecuteSend={handleExecuteSend}
                  onRemoveRecipient={handleRemoveRecipient}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Stamp Confirmation Dialogs */}
        {currentStampList && (
          <StampConfirmationDialog
            open={stampDialog.open}
            onOpenChange={(open) => setStampDialog((prev) => ({ ...prev, open }))}
            stampNumber={stampDialog.stampNumber}
            recipientCount={currentStampList.recipients.length}
            listName={currentStampList.name}
            onConfirm={handleStampConfirm}
          />
        )}
    </PortalPageLayout>
  );
}
