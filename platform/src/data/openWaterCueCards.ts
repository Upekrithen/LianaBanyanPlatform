/**
 * OPEN WATER CUE CARDS
 * =====================
 * Three cue cards for Open Water (K408 / B097).
 * Source: AA Formal #2240 — "Member-Facing Framings"
 *
 * Used in:
 *   - CueCardLanding (slug-routed display)
 *   - CueCardDeck (viral deck listing)
 *   - Open Water pages (BriefDirectory hero, PublishBrief intro)
 */

export interface OpenWaterCueCard {
  id: string;
  title: string;
  tagline: string;
  bodyText: string;
  level0Variant: string;
  displayContexts: string[];
}

export const OPEN_WATER_CUE_CARDS: Record<string, OpenWaterCueCard> = {
  "we-need-what-youre-good-at": {
    id: "we-need-what-youre-good-at",
    title: "We Need What You\u2019re Good At",
    tagline: "The opening invitation to every potential Patron on Open Water.",
    bodyText:
      "Whatever you are good at \u2014 we need it. Not credentials. Not prestige. Not scale-for-its-own-sake. Just lived competence at a specific thing one step beyond someone else who needs it. The first level of Patronship is someone who started to help someone who hasn\u2019t. Billions of people qualify. That is the floor, and the floor is accessible to everyone who has ever done anything.",
    level0Variant:
      "What ARE you good at? We don\u2019t know yet. You don\u2019t know yet either. Let\u2019s start finding out.",
    displayContexts: [
      "Open Water landing page hero",
      "Patron registration flow entry point",
      "College of Hard Knocks enrollment page",
    ],
  },

  "you-have-a-play-i-have-a-stage": {
    id: "you-have-a-play-i-have-a-stage",
    title: "You Have a Play, I Have a Stage",
    tagline:
      "The governing metaphor for the Member-Patron-Ripple-Voucher relationship.",
    bodyText:
      "You have a play. We have a stage. Bring the thing you want to do. The cooperative provides the infrastructure to execute it \u2014 Patrons, Ripples, Vouchers, Cold Start systems, the commerce engine, the letters of recommendation, the published guides, the full platform. We, collectively, are providing the stage. Show us what you got. At all levels.",
    level0Variant:
      "You have a play. We have a stage. You haven\u2019t rehearsed yet? That\u2019s fine. Start rehearsing today. One line at a time.",
    displayContexts: [
      "Open Water landing page",
      "Brief publication flow intro",
      "Crown letter previews",
      "Cephas \"What is Liana Banyan\" page",
    ],
  },

  "doing-something-is-what-it-takes-to-start": {
    id: "doing-something-is-what-it-takes-to-start",
    title: "Doing Something is What It Takes to Start",
    tagline:
      "The Level 0 Dinghy anchor. The sod company entrepreneur\u2019s principle, generalized.",
    bodyText:
      "The hardest transition in the cooperative ladder is zero to one. Every other transition is about scaling \u2014 taking something that already works and making it work bigger. Zero to one is about starting \u2014 converting intent into action, idea into execution, \u201cI could do this\u201d into \u201cI did this once.\u201d The specific first action is often incidental. The principle is: do something, because doing something makes the next step visible, while doing nothing keeps the next step hidden. Get a DBA. Make a phone call. Take the first dollar. List the first service. The next step reveals itself once you move.",
    level0Variant:
      "You haven\u2019t started yet. That\u2019s the only thing standing between you and Level 1. Do something. The next step reveals itself once you move.",
    displayContexts: [
      "Level 0 Dinghy brief publication page",
      "\"I have an idea but haven't started\" entry flow",
      "Pudding #187 landing page",
    ],
  },
};

export const OPEN_WATER_CUE_CARD_LIST = Object.values(OPEN_WATER_CUE_CARDS);
