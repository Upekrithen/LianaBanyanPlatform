import { useEffect, useMemo, useReducer } from "react";

export const GUIDED_TOUR_STORAGE_KEY = "lb_guided_tour_state_v1";

export type TourMode = "idle" | "intro" | "running" | "completed" | "skipped";

export type TourStop = {
  id: string;
  route: string;
  targetRef: string;
  title: string;
  body: string;
};

type TourState = {
  mode: TourMode;
  currentStopIndex: number;
  stops: TourStop[];
};

type TourAction =
  | { type: "OPEN_INTRO" }
  | { type: "START" }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SKIP" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

export const TOUR_STOPS: TourStop[] = [
  { id: "welcome", route: "/welcome", targetRef: "welcome", title: "Welcome Gate", body: "Start with orientation and then choose your path: a Guided Tour flyover or the Alcove Hallway deep-learning path." },
  { id: "wallet", route: "/wallet", targetRef: "wallet", title: "Wallet", body: "Review balances and movement across cooperative currencies." },
  { id: "cold-start", route: "/cold-start", targetRef: "cold-start", title: "Cold Start", body: "See practical first steps to build momentum from zero." },
  { id: "captain", route: "/captain/dashboard", targetRef: "captain", title: "Captain Dashboard", body: "Coordinate territory-level action and local operations." },
  { id: "marketplace", route: "/marketplace", targetRef: "marketplace", title: "Marketplace", body: "Explore live cooperative offers and member storefront activity." },
  { id: "cephas", route: "/cephas", targetRef: "cephas", title: "Cephas", body: "Browse operating context, papers, and guiding references." },
  { id: "alcove", route: "/learn", targetRef: "alcove", title: "Alcove Hallway", body: "Move from flyover to mastery across 18 stops with questions, marks, and tier keys." },
  { id: "calendar", route: "/calendar", targetRef: "calendar", title: "Calendar", body: "Track upcoming work windows and coordinated actions." },
  { id: "storefront-builder", route: "/tools/storefront-builder", targetRef: "storefront-builder", title: "Storefront Builder", body: "Set up storefront surfaces in a guided workflow." },
  { id: "cue-card-creator", route: "/cue-cards/create", targetRef: "cue-card-creator", title: "Cue Card Creator", body: "Compose and publish field-ready cue cards quickly." },
  { id: "dispatch-compose", route: "/dispatch/compose", targetRef: "dispatch-compose", title: "Dispatch Compose", body: "Queue coordinated dispatch messages for cooperative operations." },
  { id: "treasure-map-builder", route: "/treasure-maps/builder", targetRef: "treasure-map-builder", title: "Treasure Map Builder", body: "Build guided map flows with practical checkpoints." },
  { id: "beacon-run-creator", route: "/beacons/create", targetRef: "beacon-run-creator", title: "Beacon Run Creator", body: "Create a beacon run and define route-level missions." },
  { id: "canister-configurator", route: "/canister/configurator", targetRef: "canister-configurator", title: "Canister Configurator", body: "Configure canister options for coordinated fulfillment." },
  { id: "family-table", route: "/family-table", targetRef: "family-table", title: "Family Table", body: "Coordinate shared household workflows and planning." },
  { id: "crew-call", route: "/crew-call", targetRef: "crew-call", title: "Crew Call", body: "Find local collaborators and connect around active work." },
  { id: "tribes", route: "/tribes", targetRef: "tribes", title: "Tribes", body: "Join or launch role-based social collaboration groups." },
  { id: "guilds", route: "/guilds", targetRef: "guilds", title: "Guilds", body: "Organize work through guild structures and standards." },
  { id: "star-chamber", route: "/star-chamber", targetRef: "star-chamber", title: "Star Chamber", body: "Access structured decision workflows for key initiatives." },
  { id: "backer-election", route: "/backer-election", targetRef: "backer-election", title: "Backer Election", body: "Review proposals and participate in cooperative voting." },
  { id: "adapt", route: "/adapt", targetRef: "adapt", title: "ADAPT Score", body: "View adaptive scoring and improvement signals." },
  { id: "design-democracy", route: "/design-democracy", targetRef: "design-democracy", title: "Design Democracy", body: "Advance design decisions through visible shared process." },
  { id: "wheels", route: "/wheels", targetRef: "wheels", title: "Local Wheels", body: "Coordinate local mobility actions and route matching." },
  { id: "housing", route: "/housing", targetRef: "housing", title: "Housing", body: "Track contribution-linked housing workflows and standing." },
  { id: "pioneers", route: "/pioneers", targetRef: "pioneers", title: "Pioneers", body: "Explore member stories and active contribution paths." },
  { id: "political-expedition", route: "/political-expedition", targetRef: "political-expedition", title: "Political Expedition", body: "Build civic communication flows from member input." },
  { id: "lb-card", route: "/lb-card", targetRef: "lb-card", title: "LB Card", body: "Manage cash-funded cooperative card workflows." },
  { id: "content-shield", route: "/content-shield", targetRef: "content-shield", title: "Content Shield", body: "Report concerns and track case progress transparently." },
  { id: "subscription-channel", route: "/subscription-channel/demo", targetRef: "subscription-channel", title: "Subscription Channel", body: "Preview channel economics and choose subscription currency." },
  { id: "coalitions", route: "/coalitions", targetRef: "coalitions", title: "Coalitions", body: "Coordinate discounts, promotion, and shared purchasing." },
  { id: "bounty-photography", route: "/bounty-photography", targetRef: "bounty-photography", title: "Bounty Photography", body: "Find local shoots and submit social-link proof." },
];

function createInitialState(): TourState {
  if (typeof window === "undefined") {
    return { mode: "idle", currentStopIndex: 0, stops: TOUR_STOPS };
  }
  try {
    const stored = window.localStorage.getItem(GUIDED_TOUR_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<TourState>;
      if (
        parsed &&
        typeof parsed.mode === "string" &&
        typeof parsed.currentStopIndex === "number"
      ) {
        return {
          mode: parsed.mode as TourMode,
          currentStopIndex: parsed.currentStopIndex,
          stops: TOUR_STOPS,
        };
      }
    }
  } catch {
    // Ignore malformed localStorage payloads.
  }
  return { mode: "idle", currentStopIndex: 0, stops: TOUR_STOPS };
}

export function guidedTourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case "OPEN_INTRO":
      if (state.mode === "running") return state;
      return { ...state, mode: "intro" };
    case "START":
      return { ...state, mode: "running", currentStopIndex: 0 };
    case "NEXT": {
      const nextIndex = state.currentStopIndex + 1;
      if (nextIndex >= state.stops.length) {
        return { ...state, mode: "completed", currentStopIndex: state.stops.length - 1 };
      }
      return { ...state, currentStopIndex: nextIndex };
    }
    case "BACK":
      return { ...state, currentStopIndex: Math.max(0, state.currentStopIndex - 1) };
    case "SKIP":
      return { ...state, mode: "skipped" };
    case "COMPLETE":
      return { ...state, mode: "completed", currentStopIndex: state.stops.length - 1 };
    case "RESET":
      return { ...state, mode: "idle", currentStopIndex: 0 };
    default:
      return state;
  }
}

export function useGuidedTour() {
  const [state, dispatch] = useReducer(guidedTourReducer, undefined, createInitialState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = {
      mode: state.mode,
      currentStopIndex: state.currentStopIndex,
    };
    window.localStorage.setItem(GUIDED_TOUR_STORAGE_KEY, JSON.stringify(payload));
  }, [state.mode, state.currentStopIndex]);

  const currentStop = useMemo(
    () => state.stops[state.currentStopIndex] ?? null,
    [state.stops, state.currentStopIndex],
  );

  return {
    mode: state.mode,
    currentStop,
    currentStopIndex: state.currentStopIndex,
    stops: state.stops,
    openIntro: () => dispatch({ type: "OPEN_INTRO" }),
    start: () => dispatch({ type: "START" }),
    next: () => dispatch({ type: "NEXT" }),
    back: () => dispatch({ type: "BACK" }),
    skip: () => dispatch({ type: "SKIP" }),
    complete: () => dispatch({ type: "COMPLETE" }),
    reset: () => dispatch({ type: "RESET" }),
  };
}
