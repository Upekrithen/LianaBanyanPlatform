/**
 * OutreachSixDegreesPanel — Amplify + "I know them" Six-Degrees flag controls
 * =============================================================================
 * K537 / B131 — Glass Door Open Outreach
 * Innovation #2262 The Glass Door + A&A #2327 candidate
 *
 * Shown on every Glass Door letter in locked/proposed/scheduled state.
 * Two distinct controls per B.2 architecture:
 *   1. "Amplify" — binary upvote (maps to vote_type='approve' in advisory mode)
 *   2. "I know them" — Six-Degrees flag (six_degrees_flag=true)
 *
 * Member's own state visible to themselves.
 * Aggregate counts visible to all (signed-in or signed-out).
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { OutreachVote } from "@/hooks/useOutreachLetters";
import { Users, TrendingUp, CheckCircle2 } from "lucide-react";

interface Props {
  letterId: string;
  votes: OutreachVote[];
  onAmplify: (voteType: string) => Promise<unknown>;
  onSixDegreesFlag: (flag: boolean) => Promise<unknown>;
}

export function OutreachSixDegreesPanel({ letterId, votes, onAmplify, onSixDegreesFlag }: Props) {
  const { user } = useAuth();

  const myVote = votes.find((v) => v.member_id === user?.id);
  const amplifyCount = votes.filter((v) => v.vote_type === "approve").length;
  const sixDegreesCount = votes.filter((v) => v.six_degrees_flag).length;

  const [amplifying, setAmplifying] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [amplifyDone, setAmplifyDone] = useState(false);
  const [flagDone, setFlagDone] = useState(false);

  const myAmplified = myVote?.vote_type === "approve";
  const mySixDegrees = myVote?.six_degrees_flag === true;

  const handleAmplify = async () => {
    if (!user || amplifying) return;
    setAmplifying(true);
    await onAmplify("approve");
    setAmplifying(false);
    setAmplifyDone(true);
    setTimeout(() => setAmplifyDone(false), 2500);
  };

  const handleSixDegrees = async () => {
    if (!user || flagging) return;
    setFlagging(true);
    await onSixDegreesFlag(!mySixDegrees);
    setFlagging(false);
    setFlagDone(true);
    setTimeout(() => setFlagDone(false), 2500);
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        borderColor: "rgba(212,168,83,0.12)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <h4
        className="text-xs uppercase tracking-wider font-semibold mb-3"
        style={{ color: "#94a3b8" }}
      >
        Member Signals
      </h4>

      <div className="flex items-center gap-3">
        {/* Amplify button */}
        <button
          onClick={handleAmplify}
          disabled={!user || amplifying}
          title={user ? (myAmplified ? "You amplified this letter" : "Amplify this letter") : "Sign in to amplify"}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-40"
          style={{
            background: myAmplified ? "rgba(212,168,83,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${myAmplified ? "rgba(212,168,83,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: myAmplified ? "#d4a853" : "#94a3b8",
          }}
        >
          {amplifyDone ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: "#4ade80" }} />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          <span className="font-medium">{amplifyCount}</span>
          <span className="text-xs opacity-70">
            {amplifying ? "..." : myAmplified ? "Amplified" : "Amplify"}
          </span>
        </button>

        {/* Six-Degrees "I know them" flag */}
        <button
          onClick={handleSixDegrees}
          disabled={!user || flagging}
          title={
            user
              ? mySixDegrees
                ? "You flagged that you know this recipient — click to unflag"
                : "Flag if you personally know this recipient"
              : "Sign in to flag"
          }
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-40"
          style={{
            background: mySixDegrees ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${mySixDegrees ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: mySixDegrees ? "#a78bfa" : "#94a3b8",
          }}
        >
          {flagDone ? (
            <CheckCircle2 className="w-4 h-4" style={{ color: "#4ade80" }} />
          ) : (
            <Users className="w-4 h-4" />
          )}
          <span className="font-medium">{sixDegreesCount}</span>
          <span className="text-xs opacity-70">
            {flagging ? "..." : mySixDegrees ? "I know them ✓" : "I know them"}
          </span>
        </button>
      </div>

      {!user && (
        <p className="text-[11px] text-slate-600 mt-2">
          Sign in to amplify or flag Six-Degrees connections.
        </p>
      )}

      {mySixDegrees && (
        <p className="text-[11px] mt-2" style={{ color: "#a78bfa" }}>
          You'll receive an introduction-invitation email when this letter is formally dispatched.
        </p>
      )}
    </div>
  );
}
