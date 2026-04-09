export interface LRHPageGreeting {
  pageId: string;
  pageName: string;
  explanation: string;
  elements?: string[];
}

export const LRH_PAGE_GREETINGS: Record<string, LRHPageGreeting> = {
  "/welcome": {
    pageId: "welcome-page",
    pageName: "Welcome",
    explanation:
      "This is your starting point. Six pathways, one cooperative. Pick what you want to build and the platform shapes around you.",
    elements: ["welcome-hero", "welcome-pathways", "welcome-how-it-works"],
  },
  "/mission-one": {
    pageId: "mission-one-page",
    pageName: "Mission ONE",
    explanation:
      "Everyone Eats Tonight. Bishop Myriel's principle: set another place at the table. No charity line. Same menu, same dignity.",
    elements: [
      "mission-one-hero",
      "mission-one-bishop-frame",
      "mission-one-how-it-works",
      "mission-one-contribute",
      "mission-one-next-missions",
    ],
  },
  "/gleaners-corner": {
    pageId: "gleaners-corner-page",
    pageName: "Gleaner's Corner",
    explanation:
      "This is where the 3.3% goes. Every transaction feeds this fund. Members decide where it's deployed.",
    elements: [
      "gleaners-corner-hero",
      "gleaners-corner-explanation",
      "gleaners-corner-fund-distribution",
    ],
  },
  "/cold-start": {
    pageId: "cold-start-page",
    pageName: "Cold Start Hub",
    explanation:
      "Six pathways into the cooperative. Food, Manufacturing, Service, Local Business, Guild, Tribe. Pick one. Branch later.",
  },
  "/housing": {
    pageId: "housing-page",
    pageName: "Cooperative Housing",
    explanation:
      "Housing at Cost+20%. Roommate accountability. Rent transparency. Mission TWO of the cooperative.",
  },
  "/political-expedition": {
    pageId: "political-expedition-page",
    pageName: "Political Expedition",
    explanation:
      "Power to the People. Pick an issue. Find your representative. Write a letter to Congress. The templates are live.",
  },
  "/helm": {
    pageId: "helm-page",
    pageName: "Your Helm",
    explanation:
      "This is your personal workspace. One Helm, many Bridges. Everything you build, earn, and track lives here.",
  },
  "/subscribe": {
    pageId: "subscribe-page",
    pageName: "Subscriptions",
    explanation:
      "Fund channels with Credits, Marks, or Joules. Creators keep 83.3%. The platform takes Cost+20%.",
  },
  "/wheels": {
    pageId: "wheels-page",
    pageName: "Local Wheels",
    explanation:
      "Cooperative ridesharing and vehicle sharing. Cost+20% pricing. Driver keeps 83.3%. Safety and payment protection built in.",
  },
  "/marketplace": {
    pageId: "marketplace-page",
    pageName: "Marketplace",
    explanation:
      "Buy and sell within the cooperative. Every price shows the cost breakdown. The creator keeps 83.3%.",
  },
  "/family-table": {
    pageId: "family-table-page",
    pageName: "Family Table",
    explanation:
      "Meal planning meets cooperative economics. Plan meals, share grocery runs, build the table together.",
  },
  "/design-democracy": {
    pageId: "design-democracy-page",
    pageName: "Design Democracy",
    explanation:
      "Community members vote on platform design. Not a suggestion box — actual governance with structured evidence.",
  },
};
