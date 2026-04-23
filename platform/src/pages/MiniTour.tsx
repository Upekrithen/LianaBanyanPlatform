/**
 * MiniTour — Route page for /mini-tour.
 * ======================================
 * Wraps MiniWildfireTour with the 7-step placeholder narration.
 * Prose is scaffolding — Founder rewrites the actual copy.
 *
 * K454 / B119
 */

// [FOUNDER REWRITE] — All step messages below are placeholder scaffolding.
// Replace each `message` (and optionally `topic`) with final Founder copy
// before shipping to production. Structure and mascot assignments are final.

import { useState } from "react";
import { MiniWildfireTour, type TourStep } from "@/components/tour/MiniWildfireTour";
import { XRayProvider } from "@/components/museum/XRayContext";
import { useXRay } from "@/components/museum/XRayContext";

// Inner component — must be inside XRayProvider to use useXRay
function MiniTourInner() {
  const [completed, setCompleted] = useState(false);
  const { xrayOn, toggleXray } = useXRay();

  const STEPS: TourStep[] = [
    {
      speakerId: "lrh",
      topic: "Welcome",
      message:
        "Welcome to the 90-second tour of all the things you didn't see in the 90-second tour.",
    },
    {
      speakerId: "owl",
      topic: "Why the rules exist",
      message:
        "Every rule on this platform has a reason. Let me show you one: why Cost+20% is locked.",
    },
    {
      speakerId: "pig",
      topic: "The math behind your share",
      message:
        "And here's what that math actually costs you when you buy a print from another member — and what they earn.",
    },
    {
      speakerId: "goat",
      topic: "Where this goes",
      message:
        "Three years from now, this platform looks different — but in a direction you can see coming.",
    },
    {
      speakerId: "bird",
      topic: "How we got here",
      message:
        "Some of it already happened. Let me show you the archive of how we got here.",
    },
    {
      speakerId: "lrh",
      topic: "Five corners",
      message:
        "That's five corners of Liana Banyan. There are more. When you're ready, each corner is behind its own door.",
    },
    {
      speakerId: "lrh",
      topic: "What's next",
      message:
        "You can close this tour, or take the full 252-item curated walk. Or just start browsing.",
    },
  ];

  const ALL_MASCOTS = ["lrh", "owl", "pig", "goat", "bird"];

  if (completed) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 p-8 text-center"
        style={{ color: "rgba(250, 245, 235, 0.7)" }}
      >
        <div className="text-4xl">✓</div>
        <div className="text-lg font-medium" style={{ color: "rgba(250, 245, 235, 0.9)" }}>
          Tour complete.
        </div>
        <p className="text-sm max-w-xs" style={{ color: "rgba(250, 245, 235, 0.5)" }}>
          You've seen five corners of Liana Banyan. Start exploring when you're ready.
        </p>
        <button
          onClick={() => setCompleted(false)}
          className="mt-2 px-4 py-2 rounded-lg text-sm"
          style={{
            background: "rgba(56, 161, 105, 0.15)",
            color: "#68d391",
            border: "1px solid rgba(56, 161, 105, 0.3)",
            cursor: "pointer",
          }}
        >
          Replay tour
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* X-Ray toggle — for mid-tour demo / verification */}
      <div className="flex justify-end">
        <button
          onClick={toggleXray}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
          style={{
            background: xrayOn
              ? "rgba(34, 211, 238, 0.15)"
              : "rgba(250, 245, 235, 0.07)",
            color: xrayOn ? "#67e8f9" : "rgba(250, 245, 235, 0.5)",
            border: `1px solid ${xrayOn ? "rgba(34, 211, 238, 0.3)" : "rgba(250, 245, 235, 0.1)"}`,
            cursor: "pointer",
          }}
        >
          {xrayOn ? "🔬 X-Ray ON" : "🔬 X-Ray"}
        </button>
      </div>

      <MiniWildfireTour
        steps={STEPS}
        allMascots={ALL_MASCOTS}
        onComplete={() => setCompleted(true)}
        mascotSize={80}
        layout="horizontal"
      />
    </div>
  );
}

export default function MiniTour() {
  return (
    <XRayProvider>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          background: "linear-gradient(135deg, #0a101e 0%, #0f1a2e 60%, #0a1020 100%)",
        }}
      >
        <div className="w-full max-w-2xl">
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: "rgba(250, 245, 235, 0.85)" }}
          >
            Mini Wildfire Tour
          </h1>
          <p
            className="text-sm mb-6"
            style={{ color: "rgba(250, 245, 235, 0.4)" }}
          >
            A quick tour of everything the 90-second tour didn't cover.
          </p>
          <MiniTourInner />
        </div>
      </div>
    </XRayProvider>
  );
}
