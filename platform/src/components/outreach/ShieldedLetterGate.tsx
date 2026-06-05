/**
 * ShieldedLetterGate -- BP072 Wave 3 / Scope 3
 * =============================================
 * Shows a "pending Founder ratification" state for letters where
 * shield:true (state = 'shield_pending' or 'draft').
 *
 * The mechanic:
 *   1. Letters are loaded with state = 'shield_pending'
 *      (not 'draft' -- they ARE visible to authenticated members for voting,
 *      but cannot be dispatched until Founder ratifies)
 *   2. This component renders the shield status and vote tallies
 *   3. When Founder ratifies via admin panel, state -> 'approved' -> dispatch fires
 *
 * AI-Gang letter slugs (shield:true, HELD until Founder ratifies):
 *   - scholz, brynjolfsson, newmark, doctorow, ollama
 *
 * Cardboard Boots v016: also shield:true, HELD until Founder ratifies.
 *
 * Founder ratification path:
 *   /staff/outreach-letters-admin -> letter detail -> "Ratify and Dispatch" button
 */
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CheckCircle, Clock } from "lucide-react";
import type { OutreachLetter, OutreachVerdict } from "@/hooks/useOutreachLetters";

interface ShieldedLetterGateProps {
  letter: OutreachLetter;
  verdict: OutreachVerdict | null;
  isFounder?: boolean;
  onRatify?: () => Promise<void>;
}

/** The AI-Gang letter slugs that are shield-gated. */
export const AI_GANG_LETTER_SLUGS = [
  "scholz",
  "brynjolfsson",
  "newmark",
  "doctorow",
  "ollama",
] as const;

/** Cardboard Boots letter slugs that are shield-gated. */
export const CARDBOARD_BOOTS_LETTER_SLUGS = ["cardboard-boots-v016"] as const;

export function isShieldLetter(slug: string): boolean {
  return (
    AI_GANG_LETTER_SLUGS.includes(slug as typeof AI_GANG_LETTER_SLUGS[number]) ||
    CARDBOARD_BOOTS_LETTER_SLUGS.includes(slug as typeof CARDBOARD_BOOTS_LETTER_SLUGS[number])
  );
}

export function ShieldedLetterGate({
  letter,
  verdict,
  isFounder = false,
  onRatify,
}: ShieldedLetterGateProps) {
  const isShielded =
    letter.state === "shield_pending" || letter.state === "draft";

  if (!isShielded) {
    return (
      <div
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
        style={{ background: "rgba(74, 222, 128, 0.08)", border: "1px solid rgba(74,222,128,0.2)" }}
      >
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span style={{ color: "#86efac" }}>Founder ratified -- dispatch path open</span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "rgba(212,168,83,0.04)",
        border: "1px solid rgba(212,168,83,0.15)",
      }}
    >
      {/* Shield status */}
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-full shrink-0"
          style={{ background: "rgba(212,168,83,0.10)" }}
        >
          <Shield className="w-4 h-4" style={{ color: "#d4a853" }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: "#d4a853" }}>
              Shield-gated
            </span>
            {isShieldLetter(letter.slug) && (
              <Badge
                variant="outline"
                className="text-[10px] border-amber-600/30 text-amber-400"
              >
                {AI_GANG_LETTER_SLUGS.includes(letter.slug as any)
                  ? "AI-Gang Letter"
                  : "Cardboard Boots"}
              </Badge>
            )}
          </div>
          <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "#94a3b8" }}>
            This letter awaits Founder ratification before dispatch. Member voting
            is open. When the vote threshold is reached AND the Founder ratifies,
            the letter is dispatched. Neither condition alone is sufficient.
          </p>
        </div>
      </div>

      {/* Vote tally */}
      {verdict && (
        <div
          className="grid grid-cols-3 gap-2 text-center text-[10px] rounded-lg px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div>
            <div className="font-bold text-sm" style={{ color: "#4ade80" }}>
              {verdict.approve_count}
            </div>
            <div style={{ color: "#64748b" }}>Approve</div>
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: "#94a3b8" }}>
              {verdict.total_votes}
            </div>
            <div style={{ color: "#64748b" }}>Total</div>
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: "#f87171" }}>
              {verdict.veto_count}
            </div>
            <div style={{ color: "#64748b" }}>Veto</div>
          </div>
        </div>
      )}

      {/* What the vote threshold means */}
      <div className="text-[10px] leading-relaxed" style={{ color: "#64748b" }}>
        <span style={{ color: "#d4a853" }}>Approval threshold:</span>{" "}
        {letter.vote_threshold_approval_pct}% approve votes required.
        {" "}
        <span style={{ color: "#d4a853" }}>Veto threshold:</span>{" "}
        {letter.vote_threshold_veto_pct}% veto votes blocks dispatch.
      </div>

      {/* Founder ratify button (staff only) */}
      {isFounder && onRatify && (
        <div className="pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 text-[10px] mb-2" style={{ color: "#64748b" }}>
            <Lock className="w-3 h-3" />
            <span>Founder ratification -- this action dispatches the letter when threshold is met</span>
          </div>
          <button
            onClick={onRatify}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: "rgba(212,168,83,0.15)",
              color: "#d4a853",
              border: "1px solid rgba(212,168,83,0.3)",
            }}
          >
            <Clock className="inline w-3.5 h-3.5 mr-1.5" />
            Ratify and Enable Dispatch
          </button>
        </div>
      )}
    </div>
  );
}
