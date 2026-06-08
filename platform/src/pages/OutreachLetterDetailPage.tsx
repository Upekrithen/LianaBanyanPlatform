/**
 * OutreachLetterDetailPage — Individual Glass Door letter view
 * ===============================================================
 * K412 / B099 — Innovation #2262 The Glass Door
 *
 * Route: /outreach/:slug
 */

import { useParams, Link } from "react-router-dom";
import { useOutreachLetter } from "@/hooks/useOutreachLetters";
import { OutreachLetterCard } from "@/components/outreach/OutreachLetterCard";
import { OutreachLetterVotePanel } from "@/components/outreach/OutreachLetterVotePanel";
import { OutreachSixDegreesPanel } from "@/components/outreach/OutreachSixDegreesPanel";
import { LetterCreditStakePanel } from "@/components/outreach/LetterCreditStakePanel";
import { ArrowLeft, Shield, ScrollText } from "lucide-react";

export default function OutreachLetterDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { letter, votes, verdict, responses, loading, castVote, flagSixDegrees } = useOutreachLetter(slug || "");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 border-2 rounded-full animate-spin"
            style={{ borderColor: "rgba(212,168,83,0.2)", borderTopColor: "#d4a853" }}
          />
          <span className="text-sm text-slate-500">Loading letter...</span>
        </div>
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Shield className="w-10 h-10 text-slate-600" />
        <p className="text-slate-400">Letter not found.</p>
        <Link to="/outreach" className="text-sm" style={{ color: "#d4a853" }}>
          Back to Glass Door
        </Link>
      </div>
    );
  }

  const canVote = ["proposed", "scheduled"].includes(letter.state);
  const canAmplify = ["locked", "proposed", "scheduled"].includes(letter.state);

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          to="/outreach"
          className="inline-flex items-center gap-1 text-xs mb-4 transition-colors"
          style={{ color: "#d4a853" }}
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Glass Door
        </Link>

        {/* Letter card */}
        <div className="mb-6">
          <OutreachLetterCard
            letter={letter}
            verdict={verdict}
            votes={votes}
            responses={responses}
          />
        </div>

        {/* Six-Degrees + Amplify panel — shown on locked/proposed/scheduled */}
        {canAmplify && (
          <div className="mb-4">
            <OutreachSixDegreesPanel
              letterId={letter.letter_id}
              votes={votes}
              onAmplify={castVote}
              onSixDegreesFlag={flagSixDegrees}
            />
          </div>
        )}

        {/* BP077 Scope 3 — Pedestal Forum link: Decree-Composition additions for this letter */}
        {canAmplify && (
          <div className="mb-4">
            <Link
              to={`/papers/${letter.slug}/pedestal-forum`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#94a3b8",
              }}
            >
              <ScrollText className="w-4 h-4" />
              <span>Pedestal Forum</span>
              <span className="text-xs opacity-60">-- compose a Decree-Composition addition</span>
            </Link>
          </div>
        )}

        {/* Governance voting panel — shown on proposed/scheduled */}
        {canVote && (
          <OutreachLetterVotePanel
            letterId={letter.letter_id}
            votes={votes}
            verdict={verdict}
            onVote={castVote}
          />
        )}

        {/* BP077 Scope 11 — Credit-staking panel (Pedestal 5K/20K mechanism) */}
        {canAmplify && (
          <div className="mt-4">
            <LetterCreditStakePanel
              letterId={letter.letter_id}
              slug={letter.slug}
            />
          </div>
        )}

        {/* Innovation references */}
        {letter.source_innovation_refs && letter.source_innovation_refs.length > 0 && (
          <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">
              Related Innovations
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {letter.source_innovation_refs.map((num) => (
                <span
                  key={num}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: "rgba(212,168,83,0.08)", color: "#d4a853" }}
                >
                  #{num}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* C.6: Brand frame footer */}
        <div className="mt-8 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            <span style={{ color: "#d4a853" }}>Glass Door — Open Outreach</span> ·
            Our outreach is on the record before it arrives. Members vote. Recipients pre-discover.
            Founder dispatches. The strategy is open.
          </p>
          <p className="text-[10px] text-slate-700 mt-1">
            A&A #2262 · #2327 candidate · Liana Banyan Corporation (Wyoming C-Corp) ·
            $5/year membership, identical for all members.
          </p>
        </div>
      </div>
    </div>
  );
}
