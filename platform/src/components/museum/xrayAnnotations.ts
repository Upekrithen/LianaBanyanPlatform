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
    dialogue: [
      { speaker: "profcat", text: "455 publications. Three depths. Same knowledge — different lenses depending on how far you want to go." },
      { speaker: "lrh", text: "Skim the stones on the surface. Wade in for the articles. Dive all the way down for the full papers. The library goes wherever you do." },
      { speaker: "profcat", text: "It lives in the basement — which means it's always there, no matter what page you're on. Tap the book icon." },
    ],
    character: "profcat",
    targetSelector: "[aria-label='Open Cephas Library']",
    initialOffset: { x: 60, y: -180 },
  },
  {
    id: "heoho-card",
    title: "The Deck Card",
    explanation:
      "This is a Deck Card — the first one. Every member gets a deck of shareable cards. " +
      "Find more throughout the platform. Flip it, explore the doors, watch the fable. " +
      "The card IS the experience.",
    dialogue: [
      { speaker: "lrh", text: "Every member gets a deck of these. This one's mine — the HEOHO card. Flip it over. There's more on the back." },
      { speaker: "profcat", text: "Cards are collectible, shareable, and linkable. Each one is a door into something. The Frame Locks in the corners? Those unlock as you explore." },
      { speaker: "lrh", text: "The card IS the experience. Not a widget. Not a badge. An actual artifact you carry." },
    ],
    character: "lrh",
    targetSelector: "[data-heoho-card]",
    initialOffset: { x: 320, y: -60 },
  },
  {
    id: "frame-locks",
    title: "Frame Locks",
    explanation:
      "Hidden keyholes in every corner. Collect Golden Keys to unlock them. " +
      "Each lock is shaped by a currency type — Circle (Credit), Square (Mark), Triangle (Joule). " +
      "They're scattered throughout the platform. Start with 'Speak Friend' in the O.",
    dialogue: [
      { speaker: "lrh", text: "See those keyholes in the corners? Those are Frame Locks. Hidden throughout the platform." },
      { speaker: "profcat", text: "Each shape corresponds to a currency: Circle = Credit, Square = Mark, Triangle = Joule. The shape tells you what kind of key fits." },
      { speaker: "lrh", text: "Start with the O. 'Speak Friend and Enter.' That one unlocks for free — it's a hint about what this whole place is." },
    ],
    character: "lrh",
    targetSelector: "[title='Frame Lock — Level 1']",
    initialOffset: { x: -300, y: 80 },
  },
  {
    id: "lrh-guide",
    title: "Your Guide",
    explanation:
      "That's me — the Little Red Hen, in thermal vision X-Ray Mode. " +
      "I appear where you click to explain things. " +
      "Click me on any page for context-aware help.",
    dialogue: [
      { speaker: "lrh", text: "That's me — Little Red Hen. In X-Ray mode I can see everything: the infrastructure, the substrate, the connections you can't normally see." },
      { speaker: "profcat", text: "Click her on any page. She knows what's on that page specifically — not a generic FAQ, actual context." },
      { speaker: "lrh", text: "Tap me again to put the goggles away. The platform will still be here — just without the thermal layer." },
    ],
    character: "lrh",
    targetSelector: "[aria-label='Toggle X-Ray Goggles']",
    initialOffset: { x: -320, y: -200 },
  },
];
