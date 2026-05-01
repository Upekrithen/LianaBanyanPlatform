/**
 * KallistraFramingCard — "make more WITH us" competition framing
 * Per BRIDLE v11 Rule 6 + Stance on Competition canon (BP009).
 * Template: "I'm not here to compete with you, I'm inviting you into something bigger."
 * Named for the canonical empirical example: Founder's letter to Kallistra (HexIsle terrain).
 * data-xray-id: kallistra-framing-card
 */

import { Card, CardContent } from "@/components/ui/card";
import { Handshake } from "lucide-react";

interface KallistraFramingCardProps {
  recipientContext?: string;
}

export function KallistraFramingCard({ recipientContext }: KallistraFramingCardProps) {
  return (
    <Card
      className="border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30"
      data-xray-id="kallistra-framing-card"
    >
      <CardContent className="py-4 px-4 space-y-2">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Handshake className="w-4 h-4 shrink-0" />
          <p className="text-xs font-semibold uppercase tracking-wide">
            Cooperative Framing — Stance on Competition
          </p>
        </div>
        <blockquote className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-amber-300 dark:border-amber-700 pl-3">
          {recipientContext
            ? `"I'm not here to compete with ${recipientContext}. I'm inviting you into something bigger.`
            : `"I'm not here to compete with you. I'm inviting you into something bigger.`}
          {" "}
          You keep your brand, your customers, your IP.
          You gain substrate access and a cooperative network — without giving up what you've built."
        </blockquote>
        <p className="text-xs text-muted-foreground">
          LB Frame operates on the same principle as the cooperative: make more <em>with</em> others,
          not instead of them. When your recipient installs LB Frame, you both gain — they get
          substrate access, you earn Marks participation allocation for bringing them in.
        </p>
      </CardContent>
    </Card>
  );
}
