import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGuidedTour } from "@/hooks/useGuidedTour";
import { TourIntroModal } from "./TourIntroModal";
import { TourStopTooltip } from "./TourStopTooltip";

const INTRO_SHOWN_KEY = "lb_guided_tour_intro_seen_v1";
const REMIND_UNTIL_KEY = "lb_guided_tour_remind_until_v1";
const OPEN_EVENT_NAME = "lb-guided-tour-open";

export function GuidedTourOverlay() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    mode,
    currentStop,
    currentStopIndex,
    stops,
    openIntro,
    start,
    next,
    back,
    skip,
    complete,
    reset,
  } = useGuidedTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // K369: Auto-launch disabled — replaced by LRH Per-Page Greeter.
  // Manual trigger via "lb-guided-tour-open" event still works (MascotMenu → "Take the Grand Tour").
  // useEffect(() => {
  //   if (!user || mode !== "idle") return;
  //   const hasSeenIntro = window.localStorage.getItem(INTRO_SHOWN_KEY) === "1";
  //   const remindUntil = Number(window.localStorage.getItem(REMIND_UNTIL_KEY) ?? 0);
  //   if (hasSeenIntro || Date.now() < remindUntil) return;
  //   openIntro();
  //   window.localStorage.setItem(INTRO_SHOWN_KEY, "1");
  // }, [user, mode, openIntro]);

  useEffect(() => {
    const handler = () => openIntro();
    window.addEventListener(OPEN_EVENT_NAME, handler);
    return () => window.removeEventListener(OPEN_EVENT_NAME, handler);
  }, [openIntro]);

  useEffect(() => {
    if (mode !== "running" || !currentStop) return;
    if (location.pathname !== currentStop.route) {
      navigate(currentStop.route);
    }
  }, [mode, currentStop, location.pathname, navigate]);

  useEffect(() => {
    if (mode !== "running" || !currentStop) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const target = document.querySelector<HTMLElement>(
        `[data-tour-target="${currentStop.targetRef}"]`,
      );
      setTargetRect(target ? target.getBoundingClientRect() : null);
    };

    updateRect();
    const timer = window.setTimeout(updateRect, 350);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [mode, currentStop, location.pathname]);

  const overlayVisible = useMemo(
    () => mode === "intro" || mode === "running",
    [mode],
  );

  if (!user || !overlayVisible) return null;

  return (
    <div data-xray-id="guided-tour-overlay">
      {mode === "intro" ? (
        <TourIntroModal
          onStart={start}
          onSkip={skip}
          onRemindLater={() => {
            window.localStorage.setItem(
              REMIND_UNTIL_KEY,
              String(Date.now() + 1000 * 60 * 60 * 24 * 3),
            );
            reset();
          }}
        />
      ) : null}

      {mode === "running" && currentStop ? (
        <TourStopTooltip
          stop={currentStop}
          currentIndex={currentStopIndex}
          total={stops.length}
          targetRect={targetRect}
          onBack={back}
          onNext={next}
          onSkip={skip}
          onEnd={complete}
        />
      ) : null}
    </div>
  );
}
