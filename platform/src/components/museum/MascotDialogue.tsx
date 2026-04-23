/**
 * MascotDialogue — A mascot character bubble with optional LRH intro.
 * ====================================================================
 * Wraps a `Mascot` with a `MascotBubble` explanation panel. Supports
 * `withLRHIntro` mode that renders LRH's "Let me bring in [X]…" line
 * above the guest bubble — the summoning effect that establishes LRH
 * as the host and the guest as the specialist.
 *
 * This is the presentation component. For a self-contained
 * "summon-in-place" usage, see `SummonMascot.tsx`.
 */
import type { ReactNode } from "react";
import { Mascot } from "./Mascot";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { getMascot } from "@/data/mascots";

interface MascotDialogueProps {
  /** Mascot id from the registry. */
  mascotId: string;
  /** Short topic title, e.g. "Why Cost+20% is locked forever". */
  topic: string;
  /** The actual explanation body. Can include JSX. */
  message: ReactNode;
  /** Optional helper text below the main message. */
  helperMessage?: ReactNode;
  /**
   * If true, render LRH's intro line ("Let me bring in [X]…") above the
   * guest bubble. Uses the mascot's registered `lrhIntro` string.
   * Default true — this is what makes the host/guest pattern work.
   */
  withLRHIntro?: boolean;
  /** Size of the guest mascot image. Default 56. */
  mascotSize?: number;
  /** Children render inside the bubble after the message (for CTAs). */
  children?: ReactNode;
  /** Max width of the bubble. Default 340. */
  maxWidth?: number;
}

export function MascotDialogue({
  mascotId,
  topic,
  message,
  helperMessage,
  withLRHIntro = true,
  mascotSize = 56,
  children,
  maxWidth = 340,
}: MascotDialogueProps) {
  const mascot = getMascot(mascotId);

  return (
    <div className="flex flex-col items-start gap-2" style={{ maxWidth }}>
      {withLRHIntro && mascot.lrhIntro && (
        <div
          className="text-[11px] italic"
          style={{
            color: "rgba(250, 245, 235, 0.55)",
            lineHeight: 1.5,
            paddingLeft: "4px",
          }}
        >
          {/* LRH's handoff line */}
          <span style={{ color: "rgba(214, 158, 46, 0.75)" }}>LRH:</span>{" "}
          {mascot.lrhIntro}
        </div>
      )}

      <div className="flex items-start gap-3">
        {/*
          Guest character portrait (B119 rule): summoned → colored (hover)
          when X-Ray mode is OFF, and thermal (xray) when X-Ray mode is ON.
          The muted default variant is reserved for non-speaking mascots
          in tour contexts where two+ are on screen simultaneously.
        */}
        <Mascot
          id={mascotId}
          size={mascotSize}
          disableHover
          summoned
        />

        {/* Guest's explanation bubble */}
        <MascotBubble
          title={`${mascot.name} — ${topic}`}
          titleColor="#38a169"
          borderColor="rgba(56, 161, 105, 0.45)"
          message={message}
          helperMessage={helperMessage}
          maxWidth={maxWidth - mascotSize - 12}
          showIcon={false}
        >
          {children}
        </MascotBubble>
      </div>

      {mascot.exitLine && (
        <div
          className="text-[10px] italic"
          style={{
            color: "rgba(250, 245, 235, 0.4)",
            paddingLeft: `${mascotSize + 16}px`,
          }}
        >
          {mascot.exitLine}
        </div>
      )}
    </div>
  );
}

export default MascotDialogue;
