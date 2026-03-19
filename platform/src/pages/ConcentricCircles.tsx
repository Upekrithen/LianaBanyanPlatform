import { useState, useMemo } from "react";
import { Crosshair, Users, CheckCircle2, XCircle, Clock, Bug, HelpCircle, Lightbulb, Heart, Lock, Unlock, ChevronRight, BarChart3, MessageSquare, Wrench, Zap, Timer } from "lucide-react";
import {
  getRings,
  getFeedbackForRing,
  getAllFeedback,
  getExpansionTimeline,
  getStats,
  getFeedbackCounts,
  canActivateRing,
  TESTING_GOALS,
  ACTIVATION_THRESHOLD,
  type Ring,
  type FeedbackItem,
  type RingMember,
} from "@/lib/concentricCircleService";

// ============================================================================
// Sub-components
// ============================================================================

function StatsBar() {
  const stats = getStats();
  const items = [
    { label: "Testers Activated", value: stats.totalTestersActivated, icon: Users },
    { label: "Feedback Items", value: stats.feedbackItemsReceived, icon: MessageSquare },
    { label: "Bugs Fixed", value: stats.bugsFixed, icon: Wrench },
    { label: "Features Requested", value: stats.featuresRequested, icon: Lightbulb },
    { label: "Avg Testing Time", value: `${stats.avgTestingMinutes}m`, icon: Timer },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {items.map((item) => (
        <div key={item.label} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 text-center">
          <item.icon className="h-5 w-5 mx-auto mb-1 text-slate-400" />
          <div className="text-2xl font-bold text-white">{item.value}</div>
          <div className="text-xs text-slate-400">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// Concentric rings CSS visualization
function RingsVisualization({
  rings,
  selectedRingId,
  onSelectRing,
}: {
  rings: Ring[];
  selectedRingId: number | null;
  onSelectRing: (id: number) => void;
}) {
  // Ring sizes (outermost to innermost for rendering order)
  const ringsSorted = [...rings].sort((a, b) => b.id - a.id);

  const sizeMap: Record<number, number> = { 1: 120, 2: 200, 3: 280, 4: 360, 5: 440 };

  const colorMap: Record<string, { ring: string; glow: string; text: string }> = {
    amber: { ring: "border-amber-500", glow: "shadow-amber-500/40", text: "text-amber-400" },
    blue: { ring: "border-blue-500", glow: "shadow-blue-500/40", text: "text-blue-400" },
    green: { ring: "border-green-500", glow: "shadow-green-500/40", text: "text-green-400" },
    purple: { ring: "border-purple-500", glow: "shadow-purple-500/40", text: "text-purple-400" },
  };

  return (
    <div className="relative flex items-center justify-center" style={{ height: 480, width: "100%" }}>
      {ringsSorted.map((ring) => {
        const size = sizeMap[ring.id];
        const colors = colorMap[ring.color] || colorMap.amber;
        const isActive = ring.status === "active";
        const isReady = ring.status === "ready";
        const isSelected = selectedRingId === ring.id;
        const isLocked = ring.status === "locked";

        return (
          <button
            key={ring.id}
            onClick={() => onSelectRing(ring.id)}
            className={`absolute rounded-full border-2 transition-all duration-300 flex items-center justify-center cursor-pointer
              ${isLocked ? "border-slate-600/50 bg-slate-800/20" : `${colors.ring} ${ring.bgColor}`}
              ${isActive ? `shadow-lg ${colors.glow} animate-pulse` : ""}
              ${isReady ? "border-dashed opacity-80" : ""}
              ${isSelected ? "ring-2 ring-white/50 ring-offset-2 ring-offset-slate-950" : ""}
              hover:scale-[1.02]
            `}
            style={{ width: size, height: size }}
            title={`${ring.name} — ${ring.status}`}
          >
            {/* Only show label for current ring layer (not overlapping inner labels) */}
            <span
              className={`absolute text-xs font-semibold ${isLocked ? "text-slate-500" : colors.text}`}
              style={{ top: 8 }}
            >
              {ring.name}
            </span>
            <span
              className={`absolute text-[10px] ${isLocked ? "text-slate-600" : "text-slate-300"}`}
              style={{ top: 26 }}
            >
              {ring.members.length > 0 ? `${ring.members.length} members` : `~${ring.projectedSize} projected`}
            </span>
            {/* Status indicator at bottom */}
            <span
              className={`absolute text-[10px] font-medium ${
                isActive ? "text-emerald-400" : isReady ? "text-yellow-400" : "text-slate-600"
              }`}
              style={{ bottom: 8 }}
            >
              {isActive && <span className="inline-flex items-center gap-1"><Unlock className="h-3 w-3" /> Active</span>}
              {isReady && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Ready</span>}
              {isLocked && <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Locked</span>}
            </span>
            {/* Feedback percent at bottom-center */}
            {ring.feedbackCompletionPercent > 0 && (
              <span className="absolute text-[10px] text-white/70" style={{ bottom: 24 }}>
                {ring.feedbackCompletionPercent}% feedback
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MemberTable({ members }: { members: RingMember[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-slate-700 text-slate-400">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Cue Card Sent</th>
            <th className="py-2 pr-4">Signed Up</th>
            <th className="py-2 pr-4">Testing Goals</th>
            <th className="py-2">Feedback Given</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-slate-800/50">
              <td className="py-2 pr-4 text-white font-medium">{m.name}</td>
              <td className="py-2 pr-4">
                {m.cueCardSent ? (
                  <span className="text-emerald-400 inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {m.cueCardSentDate}</span>
                ) : (
                  <span className="text-slate-500 inline-flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Not sent</span>
                )}
              </td>
              <td className="py-2 pr-4">
                {m.signedUp ? (
                  <span className="text-emerald-400 inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {m.signedUpDate}</span>
                ) : (
                  <span className="text-slate-500 inline-flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> No</span>
                )}
              </td>
              <td className="py-2 pr-4">
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-700 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(m.testingGoalsCompleted / m.testingGoalsTotal) * 100}%` }}
                    />
                  </div>
                  <span className="text-slate-300 text-xs">{m.testingGoalsCompleted}/{m.testingGoalsTotal}</span>
                </div>
              </td>
              <td className="py-2">
                {m.feedbackGiven ? (
                  <span className="text-emerald-400 inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {m.feedbackCount} items</span>
                ) : (
                  <span className="text-slate-500">None yet</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TestingGoalsTracker({ ring }: { ring: Ring }) {
  const members = ring.members;
  const totalMembers = members.length || ring.projectedSize;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-300 mb-2">Testing Goals Checklist</h4>
      {TESTING_GOALS.map((goal) => {
        const completed = members.filter(
          (m) => m.testingGoalsCompleted >= TESTING_GOALS.indexOf(goal) + 1
        ).length;
        const pct = totalMembers > 0 ? Math.round((completed / totalMembers) * 100) : 0;

        return (
          <div key={goal.id} className="flex items-start gap-3">
            <div className={`mt-0.5 ${completed === totalMembers ? "text-emerald-400" : "text-slate-500"}`}>
              {completed === totalMembers ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-4 w-4 rounded border border-slate-600" />}
            </div>
            <div className="flex-1">
              <div className="text-sm text-white">{goal.label}</div>
              <div className="text-xs text-slate-400">{completed}/{totalMembers} members ({pct}%)</div>
            </div>
          </div>
        );
      })}
      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <div className="text-sm font-medium text-slate-200">
          Ring {ring.id}: {members.filter((m) => m.signedUp).length}/{totalMembers} members, {ring.feedbackCompletionPercent}% goals complete
        </div>
      </div>
    </div>
  );
}

function RingDetailPanel({
  ring,
  feedback,
}: {
  ring: Ring;
  feedback: FeedbackItem[];
}) {
  const counts = getFeedbackCounts(ring.id);
  const canActivate = canActivateRing(ring.id);

  const colorBorder: Record<string, string> = {
    amber: "border-amber-500/30",
    blue: "border-blue-500/30",
    green: "border-green-500/30",
    purple: "border-purple-500/30",
  };

  return (
    <div className={`bg-slate-800/40 border ${colorBorder[ring.color] || "border-slate-700"} rounded-xl p-6 space-y-6`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Ring {ring.id}: {ring.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{ring.description}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          ring.status === "active" ? "bg-emerald-500/20 text-emerald-400" :
          ring.status === "ready" ? "bg-yellow-500/20 text-yellow-400" :
          "bg-slate-700 text-slate-400"
        }`}>
          {ring.status === "active" ? "Active" : ring.status === "ready" ? "Ready" : "Locked"}
        </div>
      </div>

      {/* Send List & Activation */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/50">
          <span className="text-slate-400">Send List:</span>{" "}
          <span className="text-white font-medium">{ring.sendListName}</span>
        </div>
        {ring.activatedDate && (
          <div className="bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/50">
            <span className="text-slate-400">Activated:</span>{" "}
            <span className="text-white font-medium">{new Date(ring.activatedDate).toLocaleDateString()}</span>
          </div>
        )}
        <div className="bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/50">
          <span className="text-slate-400">Feedback:</span>{" "}
          <span className="text-white font-medium">{ring.feedbackCompletionPercent}%</span>
          <span className="text-slate-500 text-xs ml-1">(need {ACTIVATION_THRESHOLD}% to unlock next)</span>
        </div>
      </div>

      {/* Activation Button */}
      {ring.status === "locked" && (
        <div>
          <button
            disabled={!canActivate}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              canActivate
                ? "bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {canActivate ? (
              <span className="inline-flex items-center gap-2"><Unlock className="h-4 w-4" /> Activate Ring {ring.id}</span>
            ) : (
              <span className="inline-flex items-center gap-2"><Lock className="h-4 w-4" /> Ring {ring.id - 1} must reach {ACTIVATION_THRESHOLD}% feedback first</span>
            )}
          </button>
        </div>
      )}

      {/* Members Table */}
      {ring.members.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Members</h4>
          <MemberTable members={ring.members} />
        </div>
      )}

      {/* Testing Goals */}
      {ring.status === "active" && <TestingGoalsTracker ring={ring} />}

      {/* Feedback Summary */}
      {feedback.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-300">Feedback Summary</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <Bug className="h-4 w-4 mx-auto mb-1 text-red-400" />
              <div className="text-lg font-bold text-red-400">{counts.bugs}</div>
              <div className="text-xs text-slate-400">Bugs</div>
              <div className="text-[10px] text-slate-500 mt-1">
                {counts.bugsBySeverity.critical}C / {counts.bugsBySeverity.major}M / {counts.bugsBySeverity.minor}m / {counts.bugsBySeverity.cosmetic}c
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
              <HelpCircle className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
              <div className="text-lg font-bold text-yellow-400">{counts.uxConfusion}</div>
              <div className="text-xs text-slate-400">UX Confusion</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <Lightbulb className="h-4 w-4 mx-auto mb-1 text-blue-400" />
              <div className="text-lg font-bold text-blue-400">{counts.featureRequests}</div>
              <div className="text-xs text-slate-400">Feature Requests</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
              <Heart className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
              <div className="text-lg font-bold text-emerald-400">{counts.praise}</div>
              <div className="text-xs text-slate-400">Praise</div>
            </div>
          </div>

          {/* Feedback Items */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
            {feedback.map((item) => {
              const catIcon: Record<string, { icon: typeof Bug; color: string }> = {
                bug: { icon: Bug, color: "text-red-400" },
                ux_confusion: { icon: HelpCircle, color: "text-yellow-400" },
                feature_request: { icon: Lightbulb, color: "text-blue-400" },
                praise: { icon: Heart, color: "text-emerald-400" },
              };
              const cat = catIcon[item.category] || catIcon.bug;
              const CatIcon = cat.icon;

              return (
                <div key={item.id} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CatIcon className={`h-4 w-4 mt-0.5 shrink-0 ${cat.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{item.title}</span>
                        {item.severity && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            item.severity === "critical" ? "bg-red-500/20 text-red-300" :
                            item.severity === "major" ? "bg-orange-500/20 text-orange-300" :
                            item.severity === "minor" ? "bg-yellow-500/20 text-yellow-300" :
                            "bg-slate-600/30 text-slate-400"
                          }`}>
                            {item.severity}
                          </span>
                        )}
                        {item.resolved && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">fixed</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {item.memberName} &middot; {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ExpansionTimeline() {
  const events = getExpansionTimeline();

  const typeColors: Record<string, string> = {
    activated: "bg-emerald-500",
    threshold_reached: "bg-amber-500",
    projected: "bg-slate-600",
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Zap className="h-5 w-5 text-amber-400" />
        Expansion Timeline
      </h3>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-700" />
        {events.map((event, idx) => (
          <div key={idx} className="relative flex items-start gap-4 pb-4">
            <div className={`absolute left-0 top-1.5 w-[7px] h-[7px] rounded-full ${typeColors[event.type]}`} />
            <div className="ml-4">
              <div className="text-sm text-white font-medium">{event.description}</div>
              <div className="text-xs text-slate-500">
                {event.type === "projected" ? `Est. ${event.date}` : event.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedbackComparison() {
  const rings = getRings();
  const activeRings = rings.filter((r) => r.status === "active");

  if (activeRings.length < 2) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Ring-over-Ring Comparison
        </h3>
        <p className="text-sm text-slate-400">
          Comparison data will appear once Ring 2 is activated. Ring 1 is setting the baseline.
        </p>
        <div className="mt-3 text-sm text-slate-300">
          Ring 1 has found{" "}
          <span className="text-red-400 font-medium">
            {getAllFeedback().filter((f) => f.category === "bug").length} bugs
          </span>{" "}
          so far — the closest testers catch the worst ones first.
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================================
// Main Page
// ============================================================================

export default function ConcentricCircles() {
  const [selectedRingId, setSelectedRingId] = useState<number | null>(1);

  const rings = useMemo(() => getRings(), []);
  const selectedRing = rings.find((r) => r.id === selectedRingId) || null;
  const selectedFeedback = selectedRingId ? getFeedbackForRing(selectedRingId) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Crosshair className="h-7 w-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Concentric Circle Testing</h1>
              <p className="text-slate-400 text-sm">Start close. Listen hard. Expand when ready.</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <StatsBar />

        {/* Rings Visualization */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-8">
          <div className="text-center mb-4">
            <p className="text-xs text-slate-400">Click a ring to view details. Active rings glow.</p>
          </div>
          <RingsVisualization
            rings={rings}
            selectedRingId={selectedRingId}
            onSelectRing={setSelectedRingId}
          />
        </div>

        {/* Ring Detail Panel */}
        {selectedRing && (
          <div className="mb-8">
            <RingDetailPanel ring={selectedRing} feedback={selectedFeedback} />
          </div>
        )}

        {/* Bottom Row: Timeline + Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <ExpansionTimeline />
          </div>
          <FeedbackComparison />
        </div>

        {/* Ring Legend */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <div className="flex flex-wrap gap-6 justify-center text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" /> Active (glowing)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-dashed border-amber-400" /> Ready (previous ring near threshold)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-600" /> Locked (awaiting activation)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" /> Activation at {ACTIVATION_THRESHOLD}% feedback from previous ring
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
