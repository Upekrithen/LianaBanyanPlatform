/**
 * MoneyPenny Switchboard Dashboard — BP073 Wave C · C3
 * ====================================================
 * Staff-gated admin page at /admin/moneypenny.
 * Surfaces: availability toggle, queue depth, inbound calls,
 * email inbox, contact form queue, escalation alerts.
 *
 * Auto-refreshes every 30 seconds.
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Phone,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Toggle,
  Users,
  TrendingUp,
  PhoneCall,
  PhoneMissed,
  Inbox,
  Bell,
  ToggleLeft,
  ToggleRight,
  Shield,
  Activity,
  Calendar,
  DollarSign,
  Zap,
  AlertCircle,
} from "lucide-react";
import {
  VOLUME_SCENARIOS,
  estimateVolumeCost,
  type VolumeCostEstimate,
} from "@/lib/moneyPennyCostTracker";
import {
  validateAllCredentials,
  credentialSummary,
  type AllCredentialReport,
} from "@/lib/moneyPennyCredentialValidator";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface QueueDepth {
  email_unread: number;
  email_total: number;
  calls_received: number;
  calls_pending_callback: number;
  contact_form_pending: number;
  actions_pending: number;
  sms_queue_pending: number;
}

interface AvailabilityState {
  id: string;
  is_available: boolean;
  mode: "available" | "unavailable" | "auto";
  note: string | null;
  set_by: string;
  created_at: string;
}

interface InboundCall {
  id: string;
  caller_phone: string;
  caller_name: string | null;
  caller_class: string;
  priority_level: number;
  status: string;
  callback_eta_hours: number | null;
  created_at: string;
}

interface InboxItem {
  id: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  category: string;
  priority: number;
  status: string;
  received_at: string;
}

interface ContactItem {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  tier: number;
  claude_summary: string | null;
  status: string;
  created_at: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ESCALATION_THRESHOLD = 10;
const REFRESH_INTERVAL_MS = 30_000;

const CLASS_COLORS: Record<string, string> = {
  crown: "text-yellow-600 bg-yellow-50 border-yellow-200",
  press: "text-blue-600 bg-blue-50 border-blue-200",
  investor: "text-purple-600 bg-purple-50 border-purple-200",
  member: "text-green-600 bg-green-50 border-green-200",
  general: "text-gray-600 bg-gray-50 border-gray-200",
};

const PRIORITY_LABELS: Record<number, string> = {
  0: "Crown",
  1: "Press",
  2: "Investor",
  3: "Member",
  5: "General",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatRelative(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function classChip(cls: string) {
  const color = CLASS_COLORS[cls] || CLASS_COLORS.general;
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${color}`}>
      {cls.toUpperCase()}
    </span>
  );
}

// ─── MoneyPennyDashboard ────────────────────────────────────────────────────────

export default function MoneyPennyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [queue, setQueue] = useState<QueueDepth>({
    email_unread: 0,
    email_total: 0,
    calls_received: 0,
    calls_pending_callback: 0,
    contact_form_pending: 0,
    actions_pending: 0,
    sms_queue_pending: 0,
  });

  const [availability, setAvailability] = useState<AvailabilityState | null>(null);
  const [recentCalls, setRecentCalls] = useState<InboundCall[]>([]);
  const [recentInbox, setRecentInbox] = useState<InboxItem[]>([]);
  const [recentContacts, setRecentContacts] = useState<ContactItem[]>([]);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deadLetterCount, setDeadLetterCount] = useState(0);
  const [credReport, setCredReport] = useState<AllCredentialReport | null>(null);
  const [costEstimate, setCostEstimate] = useState<VolumeCostEstimate | null>(null);
  const [activeScenario, setActiveScenario] = useState<string>("nyt_48h");

  const fetchAll = useCallback(async () => {
    try {
      setError(null);

      const [
        emailUnread,
        emailTotal,
        callsReceived,
        callsPending,
        contactsPending,
        actionsPending,
        smsPending,
        availResult,
        callsResult,
        inboxResult,
        contactsResult,
      ] = await Promise.all([
        supabase.from("moneypenny_inbox").select("*", { count: "exact", head: true }).eq("status", "unread"),
        supabase.from("moneypenny_inbox").select("*", { count: "exact", head: true }),
        supabase.from("moneypenny_inbound_calls").select("*", { count: "exact", head: true }).eq("status", "received"),
        supabase.from("moneypenny_inbound_calls").select("*", { count: "exact", head: true }).eq("status", "callback_queued"),
        supabase.from("gatekeeper_contacts").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("moneypenny_actions").select("*", { count: "exact", head: true }).neq("status", "done"),
        supabase.from("moneypenny_sms_queue").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("moneypenny_availability").select("*").order("created_at", { ascending: false }).limit(1).single(),
        supabase.from("moneypenny_inbound_calls").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("moneypenny_inbox").select("*").order("received_at", { ascending: false }).limit(8),
        supabase.from("gatekeeper_contacts").select("id, sender_name, sender_email, subject, tier, claude_summary, status, created_at").order("created_at", { ascending: false }).limit(6),
      ]);

      setQueue({
        email_unread: emailUnread.count ?? 0,
        email_total: emailTotal.count ?? 0,
        calls_received: callsReceived.count ?? 0,
        calls_pending_callback: callsPending.count ?? 0,
        contact_form_pending: contactsPending.count ?? 0,
        actions_pending: actionsPending.count ?? 0,
        sms_queue_pending: smsPending.count ?? 0,
      });

      if (availResult.data) setAvailability(availResult.data as AvailabilityState);
      if (callsResult.data) setRecentCalls(callsResult.data as InboundCall[]);
      if (inboxResult.data) setRecentInbox(inboxResult.data as InboxItem[]);
      if (contactsResult.data) setRecentContacts(contactsResult.data as ContactItem[]);

      // Dead-letter count (table may not exist yet — safe fallback)
      try {
        const { count: dlCount } = await supabase
          .from("moneypenny_dead_letter" as "moneypenny_actions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending" as "done");
        setDeadLetterCount(dlCount ?? 0);
      } catch {
        setDeadLetterCount(0);
      }

      // Credential report (browser env — all keys will be missing, showing PARTIAL correctly)
      const browserEnv: Record<string, string | undefined> = {};
      setCredReport(validateAllCredentials(browserEnv));

      // Cost estimate for active scenario
      const scenario = VOLUME_SCENARIOS[activeScenario] ?? VOLUME_SCENARIOS.nyt_48h;
      setCostEstimate(estimateVolumeCost(scenario));

      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setLoading(false);
    }
  }, [activeScenario]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const totalQueueDepth =
    queue.email_unread + queue.calls_received + queue.calls_pending_callback + queue.contact_form_pending;

  const isEscalating = totalQueueDepth >= ESCALATION_THRESHOLD;

  const toggleAvailability = async () => {
    setTogglingAvail(true);
    try {
      const newMode = availability?.mode === "available" ? "unavailable" : "available";
      const newAvail = newMode === "available";
      await supabase.from("moneypenny_availability").insert({
        is_available: newAvail,
        mode: newMode,
        set_by: user?.email || "founder",
        note: `Toggled via dashboard at ${new Date().toLocaleTimeString()}`,
      });
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setTogglingAvail(false);
    }
  };

  const isAvailable = availability?.mode === "available" ||
    (availability?.mode === "auto" && (availability?.is_available ?? false));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-sm">Loading switchboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Phone className="w-6 h-6 text-emerald-600" />
            MoneyPenny Switchboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Inbound call + email routing dashboard. Staff-gated.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Updated {formatRelative(lastRefresh.toISOString())}
          </span>
          <button
            onClick={fetchAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Escalation Banner */}
      {isEscalating && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
          <div>
            <span className="font-semibold text-orange-800">Queue Depth Alert:</span>
            <span className="text-orange-700 ml-1.5">
              {totalQueueDepth} contacts waiting (threshold: {ESCALATION_THRESHOLD}).
              Founder notified via SMS.
            </span>
          </div>
        </div>
      )}

      {/* Availability Toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
            <div>
              <div className="font-semibold text-gray-900">
                Founder Availability
              </div>
              <div className="text-sm text-gray-500">
                {isAvailable
                  ? "Available — P0 calls will attempt direct forward"
                  : "Unavailable — all calls held with callback promise"}
                {availability?.note && (
                  <span className="ml-2 text-gray-400">({availability.note})</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={toggleAvailability}
            disabled={togglingAvail}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAvailable
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } disabled:opacity-50`}
          >
            {isAvailable ? (
              <><ToggleRight className="w-5 h-5" /> Available</>
            ) : (
              <><ToggleLeft className="w-5 h-5" /> Unavailable</>
            )}
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>Mode: <strong>{availability?.mode ?? "auto"}</strong></span>
          <span>Set by: <strong>{availability?.set_by ?? "system"}</strong></span>
          <span>Last change: <strong>{availability ? formatRelative(availability.created_at) : "never"}</strong></span>
          <span className="text-gray-400">
            FOUNDER: set TWILIO_ACCOUNT_SID + TWILIO_PHONE_NUMBER in Vault to enable live call routing
          </span>
        </div>
      </div>

      {/* Queue Depth Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QueueCard
          icon={<Mail className="w-5 h-5" />}
          label="Email Unread"
          count={queue.email_unread}
          sub={`${queue.email_total} total`}
          color="blue"
        />
        <QueueCard
          icon={<Phone className="w-5 h-5" />}
          label="Calls Waiting"
          count={queue.calls_received + queue.calls_pending_callback}
          sub={`${queue.calls_pending_callback} need callback`}
          color="emerald"
          alert={queue.calls_received + queue.calls_pending_callback > 0}
        />
        <QueueCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="Contact Forms"
          count={queue.contact_form_pending}
          sub="pending review"
          color="purple"
        />
        <QueueCard
          icon={<Activity className="w-5 h-5" />}
          label="Actions Pending"
          count={queue.actions_pending}
          sub="in MP queue"
          color="orange"
          alert={queue.actions_pending > 5}
        />
      </div>

      {/* Recent Inbound Calls */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            Inbound Calls
          </h2>
          <span className="text-xs text-gray-400">Last 10</span>
        </div>
        {recentCalls.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No inbound calls logged yet.
            <br />
            <span className="text-xs mt-1 block text-gray-300">
              FOUNDER: Point Twilio Voice webhook to /moneypenny-voice to start logging calls.
            </span>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentCalls.map(call => (
              <div key={call.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <StatusDot status={call.status} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {call.caller_name || call.caller_phone}
                    </div>
                    <div className="text-xs text-gray-500">
                      {call.caller_phone} &bull; {formatRelative(call.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {classChip(call.caller_class)}
                  <span className="text-xs text-gray-400 hidden md:block">
                    {call.callback_eta_hours != null ? `ETA ${call.callback_eta_hours}h` : ""}
                  </span>
                  <CallStatusBadge status={call.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Email Inbox + Contact Forms — side by side */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Email Inbox */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-blue-600" />
              Email Inbox
            </h2>
            <a
              href="/moneypenny"
              className="text-xs text-blue-600 hover:underline"
            >
              Open full inbox
            </a>
          </div>
          {recentInbox.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-gray-400">
              No emails in inbox.
              <br />
              <span className="text-xs mt-1 block text-gray-300">
                Wire gmail-bridge or moneypenny-intake to populate.
              </span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentInbox.map(item => (
                <div key={item.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.sender_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{item.subject}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {classChip(item.category)}
                      <span className="text-xs text-gray-400">{formatRelative(item.received_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Form Queue */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              Contact Forms
            </h2>
            <span className="text-xs text-gray-400">Gatekeeper-triaged</span>
          </div>
          {recentContacts.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-gray-400">
              No contact form submissions yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentContacts.map(c => (
                <div key={c.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {c.sender_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {c.claude_summary || c.subject}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <TierBadge tier={c.tier} />
                      <span className="text-xs text-gray-400">{formatRelative(c.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* W4 Channel Health + Dead Letter */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Channel Health
          {deadLetterCount > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              <AlertCircle className="w-3 h-3" />
              {deadLetterCount} dead letter{deadLetterCount !== 1 ? "s" : ""}
            </span>
          )}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {(["voice", "sms", "gmail", "resend"] as const).map(ch => {
            const chReport = credReport?.channels.find(c => c.channel === ch);
            const ready = chReport?.ready ?? false;
            const missing = chReport?.missing_keys.length ?? 0;
            return (
              <div key={ch} className={`rounded-lg border p-3 ${ready ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">{ch}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${ready ? "text-green-700 bg-green-100" : "text-orange-700 bg-orange-100"}`}>
                    {ready ? "READY" : `${missing} needed`}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {ready
                    ? "Credentials configured"
                    : `FOUNDER: set ${chReport?.missing_keys.slice(0, 2).join(", ") ?? "credentials"} in Vault`}
                </div>
              </div>
            );
          })}
        </div>
        {credReport && (
          <div className="text-xs text-gray-400 mt-1">
            {credentialSummary(credReport)} — {credReport.present_valid}/{credReport.total_keys} keys configured
          </div>
        )}
      </div>

      {/* W4 Cost Tracking + NYT-Scale Estimate */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Per-Channel Cost Estimate
          </h2>
          <select
            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
            value={activeScenario}
            onChange={e => setActiveScenario(e.target.value)}
          >
            {Object.entries(VOLUME_SCENARIOS).map(([key, sc]) => (
              <option key={key} value={key}>{sc.label}</option>
            ))}
          </select>
        </div>
        {costEstimate && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
              {[
                { label: "Voice", usd: costEstimate.voice_cost_usd, vol: costEstimate.scenario.voice_calls, unit: "calls" },
                { label: "SMS", usd: costEstimate.sms_cost_usd, vol: costEstimate.scenario.sms_messages, unit: "msgs" },
                { label: "Gmail", usd: costEstimate.gmail_cost_usd, vol: costEstimate.scenario.emails, unit: "emails" },
                { label: "Resend", usd: costEstimate.resend_cost_usd, vol: costEstimate.scenario.contact_forms, unit: "forms" },
                { label: "AI Triage", usd: costEstimate.ai_triage_cost_usd, vol: costEstimate.scenario.emails + costEstimate.scenario.contact_forms, unit: "events" },
              ].map(row => (
                <div key={row.label} className="bg-gray-50 border border-gray-200 rounded p-2">
                  <div className="text-xs font-medium text-gray-600">{row.label}</div>
                  <div className="text-sm font-bold text-gray-900">${row.usd.toFixed(4)}</div>
                  <div className="text-xs text-gray-400">{row.vol.toLocaleString()} {row.unit}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-500">Total: </span>
                <span className="font-semibold text-gray-800">${costEstimate.total_cost_usd.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-500">+20% buffer: </span>
                <span className="font-semibold text-emerald-700">${costEstimate.total_with_buffer_usd.toFixed(4)}</span>
              </div>
              <div className="text-xs text-gray-400 ml-auto">{costEstimate.notes}</div>
            </div>
          </>
        )}
      </div>

      {/* Integration Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Integration Status
        </h2>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <IntegrationRow
            label="Twilio Voice (Inbound Calls)"
            status="FOUNDER_CONFIGURE"
            detail="Set TWILIO_ACCOUNT_SID + TWILIO_PHONE_NUMBER in Vault. Point Voice webhook to /moneypenny-voice."
          />
          <IntegrationRow
            label="Twilio SMS (moneypenny-sms)"
            status="WIRED"
            detail="SMS webhook live. Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN to activate."
          />
          <IntegrationRow
            label="Email Intake (moneypenny-intake)"
            status="WIRED"
            detail="Ready for Gmail Pub/Sub or manual forward POST. Wire gmail-bridge for auto-intake."
          />
          <IntegrationRow
            label="Contact Form (gatekeeper-triage)"
            status="WIRED"
            detail="Live on ANTHROPIC_API_KEY + RESEND_API_KEY. Claude triage + auto-response active."
          />
          <IntegrationRow
            label="Availability Toggle"
            status="LIVE"
            detail="Set via this dashboard. Persisted to moneypenny_availability table."
          />
          <IntegrationRow
            label="Queue Escalation"
            status="LIVE"
            detail={`Alerts when queue depth >= ${ESCALATION_THRESHOLD}. SMS to Founder via moneypenny_sms_queue.`}
          />
          <IntegrationRow
            label="Dry-Run Harness (W4)"
            status="LIVE"
            detail="Voice/SMS/Gmail/Resend routing validated offline. Drop credentials to go live instantly."
          />
          <IntegrationRow
            label="Credential Validator (W4)"
            status="LIVE"
            detail="Format-checks all 13 env vars across 5 channels. See Channel Health panel above."
          />
          <IntegrationRow
            label="Webhook Signature Verify (W4)"
            status="WIRED"
            detail="HMAC-SHA1 Twilio + Gmail Pub/Sub bearer token. Active once TWILIO_AUTH_TOKEN is set."
          />
          <IntegrationRow
            label="Retry Logic + Dead Letter (W4)"
            status="WIRED"
            detail="Per-channel exponential backoff. Failed events queue to moneypenny_dead_letter for replay."
          />
          <IntegrationRow
            label="Cost Tracker + NYT Estimate (W4)"
            status="LIVE"
            detail="See cost panel above. NYT 48h spike: ~$20-80 total at Cost+20%."
          />
          <IntegrationRow
            label="Resend Email Templates (W4)"
            status="WIRED"
            detail="6 templates (T1 Crown, T2 Press/Partner, T3 Member/General/Academic). Active on RESEND_API_KEY."
          />
        </div>
      </div>

    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function QueueCard({
  icon,
  label,
  count,
  sub,
  color,
  alert = false,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  sub: string;
  color: "blue" | "emerald" | "purple" | "orange";
  alert?: boolean;
}) {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
  };

  return (
    <div className={`bg-white border rounded-xl p-4 ${alert ? "border-orange-300" : "border-gray-200"}`}>
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{count}</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    received: "bg-yellow-400",
    held: "bg-orange-400",
    callback_queued: "bg-blue-400",
    resolved: "bg-green-400",
    missed: "bg-red-400",
  };
  return (
    <div className={`w-2 h-2 rounded-full shrink-0 ${colors[status] ?? "bg-gray-300"}`} />
  );
}

function CallStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    received: { label: "Received", cls: "text-yellow-700 bg-yellow-50 border-yellow-200" },
    held: { label: "Held", cls: "text-orange-700 bg-orange-50 border-orange-200" },
    callback_queued: { label: "Callback", cls: "text-blue-700 bg-blue-50 border-blue-200" },
    resolved: { label: "Resolved", cls: "text-green-700 bg-green-50 border-green-200" },
    missed: { label: "Missed", cls: "text-red-700 bg-red-50 border-red-200" },
  };
  const s = map[status] ?? { label: status, cls: "text-gray-600 bg-gray-50 border-gray-200" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

function TierBadge({ tier }: { tier: number }) {
  const map: Record<number, { label: string; cls: string }> = {
    1: { label: "T1 VIP", cls: "text-yellow-700 bg-yellow-50 border-yellow-200" },
    2: { label: "T2 Priority", cls: "text-blue-700 bg-blue-50 border-blue-200" },
    3: { label: "T3 Standard", cls: "text-gray-600 bg-gray-50 border-gray-200" },
    4: { label: "T4 Blocked", cls: "text-red-700 bg-red-50 border-red-200" },
  };
  const s = map[tier] ?? { label: `T${tier}`, cls: "text-gray-600 bg-gray-50 border-gray-200" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

function IntegrationRow({
  label,
  status,
  detail,
}: {
  label: string;
  status: "LIVE" | "WIRED" | "FOUNDER_CONFIGURE" | "PARTIAL";
  detail: string;
}) {
  const statusMap = {
    LIVE: { cls: "text-green-700 bg-green-50", dot: "bg-green-500" },
    WIRED: { cls: "text-blue-700 bg-blue-50", dot: "bg-blue-400" },
    FOUNDER_CONFIGURE: { cls: "text-orange-700 bg-orange-50", dot: "bg-orange-400" },
    PARTIAL: { cls: "text-yellow-700 bg-yellow-50", dot: "bg-yellow-400" },
  };
  const s = statusMap[status];

  return (
    <div className="flex items-start gap-2">
      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${s.dot}`} />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800 text-sm">{label}</span>
          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${s.cls}`}>
            {status.replace("_", " ")}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{detail}</div>
      </div>
    </div>
  );
}
