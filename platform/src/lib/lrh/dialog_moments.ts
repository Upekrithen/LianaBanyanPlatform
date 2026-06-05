/**
 * LRH DIALOG MOMENTS — K502
 * ===========================
 * All six LRH dialogue strings for the LB Test Frame onboarding and demo flow.
 *
 * All strings live here so Founder can rewrite without touching component code.
 * Register: kind, plain-spoken, slight wisdom-of-elders. NOT cute, NOT hype.
 * Per feedback_drafts_as_scaffolding.md: Bishop scaffolds give register direction,
 * not finalized prose. Founder calibrates on rewrite.
 *
 * LRH visual: animal/insect/chess-piece per existing design canon. No human rendering.
 */

export interface LRHMoment {
  id: string;
  surface: string;
  text: string;
  assetKey: string;   // key into lrh asset map at platform/src/assets/lrh/
}

export const LRH_MOMENTS: Record<string, LRHMoment> = {
  /**
   * Moment 1 — First-launch greeting
   * Surface: before Persona Picker (Phase G.2)
   */
  first_launch: {
    id: "lrh_m1_first_launch",
    surface: "first_launch_before_persona_picker",
    text: "Welcome. I'm LRH. I'll show you around. The Test Frame works with whatever AI you already use — pick one, and we'll verify together.",
    assetKey: "lrh_greeting",
  },

  /**
   * Moment 2 — Persona Picker explanation
   * Surface: Phase G.2 dialog
   */
  persona_picker: {
    id: "lrh_m2_persona_picker",
    surface: "persona_picker_dialog",
    text: "Three ways to use this. Casual: just check the Caithedral Effect on your AI. Developer: bring your own API keys, run our benchmarks yourself. Member: the whole cooperative — five dollars a year. Pick what fits today; you can change anytime.",
    assetKey: "lrh_three_paths",
  },

  /**
   * Moment 3 — Pick-Your-AI dialog
   * Surface: Phase B.2
   */
  pick_your_ai: {
    id: "lrh_m3_pick_your_ai",
    surface: "pick_your_ai_dialog",
    text: "Which AI do you use? I'll set us up to talk to it together.",
    assetKey: "lrh_listening",
  },

  /**
   * Moment 4 — Demo first-question intro
   * Surface: Phase C.2 (first question of the 25-question battery)
   */
  demo_start: {
    id: "lrh_m4_demo_start",
    surface: "verification_demo_first_question",
    text: "Twenty-five questions. We'll ask each one twice — once cold, once with LB context. Watch what happens.",
    assetKey: "lrh_at_the_ready",
  },

  /**
   * Moment 5 — Demo results display
   * Surface: Phase C.4 (results after all 25 pairs collected)
   * Note: [X] is interpolated at runtime with the actual improvement count.
   */
  demo_results: {
    id: "lrh_m5_demo_results",
    surface: "verification_results_display",
    text: "Your AI got [X] more questions right with the substrate. That's the Caithedral Effect — measured on your own session, not ours. By their fruits.",
    assetKey: "lrh_presenting_results",
  },

  /**
   * Moment 6 — Membership transformation handoff
   * Surface: Phase G.4 (after $5/yr payment + Furnace verification)
   * Fable hook: the line "there's a Fable I want you to hear when you're ready" seeds
   * the future Helm Welcome Fable moment (K-future). Does NOT require the Fable for K502.
   */
  membership_welcome: {
    id: "lrh_m6_membership_welcome",
    surface: "membership_transformation_post_payment",
    text: "Welcome to the Helm. I'll be around — there's a Fable I want you to hear when you're ready.",
    assetKey: "lrh_welcoming_to_helm",
  },
};

/**
 * Get a dialog moment by key.
 */
export function getLRHMoment(key: keyof typeof LRH_MOMENTS): LRHMoment {
  return LRH_MOMENTS[key];
}

/**
 * Interpolate template variables in a moment's text.
 * Usage: interpolateLRH(getLRHMoment('demo_results'), { X: '18' })
 */
export function interpolateLRH(moment: LRHMoment, vars: Record<string, string>): string {
  return moment.text.replace(/\[(\w+)\]/g, (_, key) => vars[key] ?? `[${key}]`);
}
