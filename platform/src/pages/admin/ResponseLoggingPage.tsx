/**
 * ResponseLoggingPage — /admin/response-log
 * ============================================
 * Admin UI for logging incoming responses to Crown letters.
 * K409 / B097 — Pitfall 3 response playbook wiring.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useResponseLedger, OPENING_GAMBIT_RECIPIENTS, type EventKind, type ResponseType } from "@/hooks/useResponseLedger";
import { Mail, Send, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

const RESPONSE_TYPES: { value: ResponseType; label: string; emoji: string }[] = [
  { value: "yes", label: "Yes / Interested", emoji: "✅" },
  { value: "curious", label: "Curious / Wants More Info", emoji: "🤔" },
  { value: "no_thanks", label: "No Thanks / Declined", emoji: "❌" },
  { value: "needs_clarification", label: "Needs Clarification", emoji: "❓" },
  { value: "delegation", label: "Delegated to Staff", emoji: "👥" },
  { value: "meeting_scheduled", label: "Meeting Scheduled", emoji: "📅" },
  { value: "other", label: "Other", emoji: "📝" },
];

const EVENT_KINDS: { value: EventKind; label: string }[] = [
  { value: "letter_dispatched", label: "Letter Dispatched" },
  { value: "response_received", label: "Response Received" },
  { value: "followup_sent", label: "Follow-up Sent" },
];

export default function ResponseLoggingPage() {
  const { logEvent, entries, loading } = useResponseLedger();
  const [recipient, setRecipient] = useState("");
  const [eventKind, setEventKind] = useState<EventKind>("response_received");
  const [responseType, setResponseType] = useState<ResponseType>("curious");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipient) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await logEvent({
        recipient_name: recipient,
        event_kind: eventKind,
        response_type: eventKind === "response_received" ? responseType : undefined,
        summary: summary.trim(),
      });
      setFeedback({ ok: true, msg: `Logged ${eventKind.replace(/_/g, " ")} for ${recipient}` });
      setSummary("");
    } catch (err: any) {
      setFeedback({ ok: false, msg: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  const recentEntries = [...entries].reverse().slice(0, 15);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-white">Log Letter Response</h1>
        </div>
        <Link
          to="/admin/response-dashboard"
          className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
        >
          Dashboard <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {/* Recipient */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Recipient</label>
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
          >
            <option value="">Select recipient...</option>
            {OPENING_GAMBIT_RECIPIENTS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Event kind */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Event Type</label>
          <div className="flex gap-2">
            {EVENT_KINDS.map((ek) => (
              <button
                key={ek.value}
                type="button"
                onClick={() => setEventKind(ek.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  eventKind === ek.value
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200"
                }`}
              >
                {ek.label}
              </button>
            ))}
          </div>
        </div>

        {/* Response type (only for response_received) */}
        {eventKind === "response_received" && (
          <div>
            <label className="text-xs text-slate-400 block mb-1">Response Classification</label>
            <div className="grid grid-cols-2 gap-1.5">
              {RESPONSE_TYPES.map((rt) => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => setResponseType(rt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs text-left transition-all ${
                    responseType === rt.value
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {rt.emoji} {rt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Summary (short)</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="Brief description of the response or action..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!recipient || submitting}
          className="w-full py-2.5 rounded-lg text-sm font-medium bg-amber-600 text-white hover:bg-amber-500 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Logging..." : "Log Event"}
        </button>

        {feedback && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
            feedback.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
          }`}>
            {feedback.ok ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {feedback.msg}
          </div>
        )}
      </form>

      {/* Recent activity */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Recent Activity ({entries.length} total)
        </h2>
        {loading ? (
          <div className="text-xs text-slate-500">Loading...</div>
        ) : recentEntries.length === 0 ? (
          <div className="text-xs text-slate-500">No events logged yet.</div>
        ) : (
          <div className="space-y-1.5">
            {recentEntries.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                style={{ background: "rgba(10,22,40,0.8)", border: "1px solid rgba(56,161,105,0.1)" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    e.event_kind === "letter_dispatched" ? "bg-blue-400"
                      : e.event_kind === "response_received" ? "bg-green-400"
                      : "bg-amber-400"
                  }`} />
                  <span className="text-slate-300 truncate">{e.recipient_name}</span>
                  <span className="text-slate-600">&middot;</span>
                  <span className="text-slate-500">{e.event_kind.replace(/_/g, " ")}</span>
                  {e.response_type && (
                    <span className="text-slate-500">({e.response_type.replace(/_/g, " ")})</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 flex-shrink-0 ml-2">
                  {new Date(e.event_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
