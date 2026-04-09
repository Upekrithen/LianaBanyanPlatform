import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useBuilderMode } from "./BuilderModeContext";
import { LRH_PAGE_GREETINGS } from "@/data/lrhPageGreetings";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, X, ChevronRight, Sparkles } from "lucide-react";

const GREETED_KEY = "lrh-greeted-pages";
const FEEDBACK_KEY = "lrh-page-feedback";
const SESSION_KEY = "lrh-session-id";
const AUTO_DISMISS_MS = 8000;

function getSessionId(): string {
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
    window.localStorage.removeItem(GREETED_KEY);
  }
  return id;
}

function getGreetedPages(): Set<string> {
  try {
    const raw = window.localStorage.getItem(GREETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markGreeted(path: string) {
  const pages = getGreetedPages();
  pages.add(path);
  window.localStorage.setItem(GREETED_KEY, JSON.stringify([...pages]));
}

function storeFeedback(pageId: string, helpful: boolean) {
  try {
    const raw = window.localStorage.getItem(FEEDBACK_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[pageId] = { helpful, ts: Date.now() };
    window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

type GreeterPhase = "hidden" | "greeting" | "walkthrough" | "feedback" | "done";

export function LRHPageGreeter() {
  const location = useLocation();
  const { isBuilderModeActive, toggleBuilderMode } = useBuilderMode();
  const [phase, setPhase] = useState<GreeterPhase>("hidden");
  const [walkIndex, setWalkIndex] = useState(0);
  const [manualOpen, setManualOpen] = useState(false);
  const dismissTimer = useRef<number | null>(null);

  const greeting = LRH_PAGE_GREETINGS[location.pathname];

  getSessionId();

  const dismiss = useCallback(() => {
    setPhase("hidden");
    setManualOpen(false);
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!greeting) {
      setPhase("hidden");
      return;
    }

    const greeted = getGreetedPages();
    if (greeted.has(location.pathname) && !manualOpen) {
      setPhase("hidden");
      return;
    }

    markGreeted(location.pathname);
    setPhase("greeting");
    setWalkIndex(0);
    setManualOpen(false);

    dismissTimer.current = window.setTimeout(() => {
      setPhase((p) => (p === "greeting" ? "hidden" : p));
    }, AUTO_DISMISS_MS);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [location.pathname, greeting, manualOpen]);

  const startWalkthrough = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    if (!isBuilderModeActive) toggleBuilderMode();
    setWalkIndex(0);
    setPhase("walkthrough");

    const elements = greeting?.elements;
    if (elements?.[0]) {
      const el = document.querySelector(`[data-xray-id="${elements[0]}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [greeting, isBuilderModeActive, toggleBuilderMode]);

  const nextElement = useCallback(() => {
    const elements = greeting?.elements;
    if (!elements) return;
    const next = walkIndex + 1;
    if (next >= elements.length) {
      setPhase("feedback");
      return;
    }
    setWalkIndex(next);
    const el = document.querySelector(`[data-xray-id="${elements[next]}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [greeting, walkIndex]);

  const handleFeedback = useCallback(
    (helpful: boolean) => {
      if (greeting) storeFeedback(greeting.pageId, helpful);
      setPhase("done");
      setTimeout(dismiss, 4000);
    },
    [greeting, dismiss],
  );

  const handleMascotClick = useCallback(() => {
    if (phase !== "hidden" || !greeting) return;
    setManualOpen(true);
  }, [phase, greeting]);

  useEffect(() => {
    const handler = () => handleMascotClick();
    window.addEventListener("lrh-greeter-open", handler);
    return () => window.removeEventListener("lrh-greeter-open", handler);
  }, [handleMascotClick]);

  if (!greeting || phase === "hidden") return null;

  const elements = greeting.elements ?? [];
  const currentElementId = elements[walkIndex];

  return (
    <div className="fixed bottom-24 right-6 z-[99] max-w-xs animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-zinc-900 border border-cyan-400/40 rounded-xl p-4 shadow-2xl shadow-cyan-500/10">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Greeting phase */}
        {phase === "greeting" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <p className="text-cyan-300 font-semibold text-sm">{greeting.pageName}</p>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">{greeting.explanation}</p>
            <div className="flex gap-2">
              {elements.length > 0 && (
                <Button
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-7"
                  onClick={startWalkthrough}
                >
                  Let me show you around
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-200 text-xs h-7"
                onClick={dismiss}
              >
                I'm good
              </Button>
            </div>
          </div>
        )}

        {/* Walkthrough phase */}
        {phase === "walkthrough" && currentElementId && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-cyan-300 font-semibold text-xs">
                {greeting.pageName}
              </p>
              <span className="text-zinc-500 text-[10px]">
                {walkIndex + 1} / {elements.length}
              </span>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">
              <span className="text-cyan-400 font-mono text-[10px]">{currentElementId}</span>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs h-7 gap-1"
                onClick={nextElement}
              >
                {walkIndex + 1 < elements.length ? (
                  <>Next <ChevronRight className="h-3 w-3" /></>
                ) : (
                  "Finish"
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-200 text-xs h-7"
                onClick={() => setPhase("feedback")}
              >
                Skip
              </Button>
            </div>
          </div>
        )}

        {/* Feedback phase */}
        {phase === "feedback" && (
          <div className="space-y-3">
            <p className="text-zinc-300 text-xs leading-relaxed">
              That's everything on this page! Navigate anywhere and I'll introduce you there too.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 text-xs">Was this helpful?</span>
              <button
                onClick={() => handleFeedback(true)}
                className="text-zinc-400 hover:text-green-400 transition-colors"
                aria-label="Helpful"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="text-zinc-400 hover:text-red-400 transition-colors"
                aria-label="Not helpful"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
              <button
                onClick={dismiss}
                className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Done phase — learning quote */}
        {phase === "done" && (
          <p className="text-zinc-500 text-xs italic leading-relaxed">
            "I'm learning too. Every session your feedback helps me get a little better at explaining this place."
          </p>
        )}
      </div>
    </div>
  );
}
