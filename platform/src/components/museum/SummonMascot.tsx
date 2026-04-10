/**
 * SummonMascot — Inline page-level guest-character call.
 * ======================================================================
 * The core API for calling a guest character from anywhere in the
 * platform. Either pick a mascot by `domain` (recommended — the system
 * looks up the right specialist) or by explicit `mascotId`.
 *
 * Usage:
 *   <SummonMascot
 *     domain="why"
 *     topic="Why Cost+20% is locked forever"
 *     message="The lock is what makes the promise credible..."
 *   />
 *
 *   <SummonMascot
 *     mascotId="pig"
 *     topic="Your share of a $500 sale"
 *     message={<>You keep <strong>$416.67</strong> (83.3%)...</>}
 *   />
 *
 * Appearance rules (B095):
 *   - LRH is the persistent host. Guests are summoned.
 *   - Each SummonMascot renders its guest inline with an LRH intro.
 *   - Dismissable — user clicks away or taps the × to return LRH focus.
 */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { MascotDialogue } from "./MascotDialogue";
import { getMascotByDomain, type MascotDomain } from "@/data/mascots";

interface SummonMascotPropsBase {
  /** Short topic title shown at the top of the guest bubble. */
  topic: string;
  /** The actual explanation body. Can include JSX. */
  message: React.ReactNode;
  /** Optional helper text below the main message. */
  helperMessage?: React.ReactNode;
  /** Hide LRH's intro line (for when the guest is called from non-LRH context). */
  silentIntro?: boolean;
  /** If true, start closed — user must click the LRH intro pill to open. Default false. */
  startClosed?: boolean;
  /** Optional children rendered inside the bubble after the message. */
  children?: React.ReactNode;
  /** Optional className on the outer wrapper. */
  className?: string;
}

interface SummonByDomain extends SummonMascotPropsBase {
  domain: MascotDomain;
  mascotId?: never;
}
interface SummonById extends SummonMascotPropsBase {
  mascotId: string;
  domain?: never;
}

type SummonMascotProps = SummonByDomain | SummonById;

export function SummonMascot(props: SummonMascotProps) {
  const {
    topic,
    message,
    helperMessage,
    silentIntro,
    startClosed = false,
    children,
    className = "",
  } = props;

  // Resolve mascot — either directly by id, or by domain lookup
  const mascotId =
    "mascotId" in props && props.mascotId
      ? props.mascotId
      : getMascotByDomain((props as SummonByDomain).domain).id;

  const [open, setOpen] = useState(!startClosed);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="dialogue"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <MascotDialogue
              mascotId={mascotId}
              topic={topic}
              message={message}
              helperMessage={helperMessage}
              withLRHIntro={!silentIntro}
            >
              {children}
            </MascotDialogue>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-1 -right-1 rounded-full p-1 transition-colors"
              style={{
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(56, 161, 105, 0.4)",
                color: "rgba(250, 245, 235, 0.7)",
              }}
              aria-label="Dismiss"
              title="Dismiss (return to Hen)"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(true)}
            className="text-[11px] italic hover:opacity-100 transition-opacity"
            style={{
              color: "rgba(214, 158, 46, 0.65)",
              textDecoration: "underline dotted",
              textUnderlineOffset: "3px",
            }}
          >
            LRH: Want me to bring in a specialist to explain "{topic}"?
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SummonMascot;
