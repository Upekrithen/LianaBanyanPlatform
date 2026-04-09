/**
 * X-Ray Annotation Registry — data for Museum home screen annotations.
 * Each entry maps to an interactive element on the home screen.
 * When X-Ray Goggles are ON, each annotation spawns an XRayPanel
 * with a connecting line to the target element.
 */
import type { XRayAnnotation } from "./XRayPanel";

export const MUSEUM_HOME_ANNOTATIONS: XRayAnnotation[] = [
  {
    id: "cephas-fab",
    title: "Cephas Library",
    explanation:
      "This is Cephas — 455+ publications at three reading depths. " +
      "Skim the stones (1-line summaries), wade through articles, or dive into full papers. " +
      "It's the basement of the Museum — always accessible from any page.",
    character: "profcat",
    targetSelector: "[aria-label='Open Cephas Library']",
    initialOffset: { x: 70, y: -160 },
  },
  {
    id: "heoho-card",
    title: "The Deck Card",
    explanation:
      "This is a Deck Card — the first one. Every member gets a deck of shareable cards. " +
      "Find more throughout the platform. Flip it, explore the doors, watch the fable. " +
      "The card IS the experience.",
    character: "lrh",
    targetSelector: ".max-w-sm",
    initialOffset: { x: -300, y: -40 },
  },
  {
    id: "frame-locks",
    title: "Frame Locks",
    explanation:
      "Hidden keyholes in every corner. Collect Golden Keys to unlock them. " +
      "Each lock is shaped by a currency type — Circle (Credit), Square (Mark), Triangle (Joule). " +
      "They're scattered throughout the platform. Start with 'Speak Friend' in the O.",
    character: "lrh",
    targetSelector: "[title='Frame Lock — Level 1']",
    initialOffset: { x: 50, y: 60 },
  },
  {
    id: "lrh-guide",
    title: "Your Guide",
    explanation:
      "That's me — the Little Red Hen. I change based on context. " +
      "Default: glasses down. Hover: binoculars up. X-Ray mode: thermal vision. " +
      "Click me on any page for context-aware help. I know where you are.",
    character: "lrh",
    targetSelector: "[aria-label='Toggle X-Ray Goggles']",
    initialOffset: { x: -300, y: -160 },
  },
];
