/**
 * guildHandshakeProtocol.ts — The Handshake: Formal Protocol Document
 *
 * This is the structured, exportable version of The Handshake —
 * the 30-day mutual exploration protocol used to evaluate fit between
 * the Founder and prospective Guild Founding Partners and Reference Experts.
 *
 * All language is SEC-safe. No references to equity, investment, returns,
 * shares, dividends, or profit. Marks are contribution records — nothing more.
 *
 * Liana Banyan Platform
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HandshakeSection {
  heading: string;
  content: string;
  bullets?: string[];
}

export interface HandshakeDocument {
  title: string;
  version: string;
  effectiveDate: string;
  sections: HandshakeSection[];
}

// ---------------------------------------------------------------------------
// The Handshake Document
// ---------------------------------------------------------------------------

export const HANDSHAKE_DOCUMENT: HandshakeDocument = {
  title: "The Handshake — A 30-Day Mutual Exploration Protocol",
  version: "1.0",
  effectiveDate: "2026-03-09",
  sections: [
    // 1. Purpose & Philosophy
    {
      heading: "Purpose & Philosophy",
      content:
        "This is not a job interview. This is a mutual exploration. " +
        "The Handshake exists because the most important decisions in building " +
        "something meaningful cannot be made in a single conversation. Both " +
        "sides need time — time to ask hard questions, time to see how the " +
        "other thinks under pressure, time to discover whether the fit is " +
        "real or just polite enthusiasm. Thirty days. Eight conversations. " +
        "Enough time to know. Not so much that either side is trapped.",
      bullets: [
        "The Founder is evaluating you. You are evaluating the Founder. Both are valid.",
        "There is no hidden agenda. The platform's patents, plans, and problems are open to you.",
        "Honest skepticism is more valuable than performative agreement.",
        "If the fit is not right, that is a successful outcome — not a failure.",
      ],
    },

    // 2. The Commitment
    {
      heading: "The Commitment",
      content:
        "The Handshake is a structured 30-day period with clear boundaries. " +
        "Neither party should feel overwhelmed, and neither party should feel " +
        "under-informed. The cadence is designed to give enough contact for " +
        "real understanding without consuming your life.",
      bullets: [
        "Duration: 30 calendar days from the first scheduled conversation",
        "Frequency: 2 conversations per week",
        "Length: Up to 3 hours per conversation (shorter is fine)",
        "Total sessions: 8 conversations over 4 weeks",
        "Maximum total time: 24 hours across the entire Handshake",
        "Both parties commit in writing before the first conversation begins",
        "Scheduling is collaborative — find times that work for both sides",
      ],
    },

    // 3. What the Founder Offers
    {
      heading: "What the Founder Offers",
      content:
        "The Founder brings the full weight of the platform to the table. " +
        "This is not a pitch deck behind a velvet rope. You get real access " +
        "to real information so you can make a real decision.",
      bullets: [
        "Full transparency into the platform's current state, challenges, and trajectory",
        "Access to the patent portfolio (1,336 claims across 7 provisional applications)",
        "Access to the innovation log (1,662 canonical innovations)",
        "Marks compensation starting from conversation 1 — your time has value from day one",
        "Guild standing regardless of outcome — you belong here even if the timing is not right",
        "Honest answers to hard questions, including 'I do not know yet'",
        "The Founder's direct time, attention, and engagement in every session",
      ],
    },

    // 4. What You Bring
    {
      heading: "What You Bring",
      content:
        "You are not here to impress anyone. You are here to be yourself, " +
        "bring your expertise, and see if this platform is where you want " +
        "to put your energy. The most valuable thing you can offer is honesty.",
      bullets: [
        "Your professional expertise and honest assessment of the platform's needs",
        "Candid feedback — including criticism — about what you see",
        "Willingness to explore unfamiliar territory alongside the Founder",
        "Questions that challenge assumptions, not just confirm them",
        "Your time and attention during scheduled conversations",
        "A genuine interest in discovering whether this is the right fit",
      ],
    },

    // 5. Marks Compensation
    {
      heading: "Marks Compensation",
      content:
        "Marks are contribution records within the Liana Banyan platform. " +
        "They are earned through participation, effort, and contribution — " +
        "never purchased, never gifted. Marks emerge from differential: " +
        "the difference between what you give and what the platform can " +
        "measure. Your Marks compensation during The Handshake recognizes " +
        "that your time and expertise have value from the very first conversation.",
      bullets: [
        "Marks compensation begins with conversation 1 — not after a probationary period",
        "100 Marks are earned for completing the full Handshake protocol",
        "Marks are contribution records, not securities and not financial instruments",
        "Marks do not represent membership participation in the organization's surplus",
        "Marks cannot be purchased with fiat currency — they are earned through contribution only",
        "All earned Marks are retained regardless of outcome",
        "Marks may be used for platform services as defined in the platform's service catalog",
      ],
    },

    // 6. After 30 Days
    {
      heading: "After 30 Days — Three Possible Outcomes",
      content:
        "When The Handshake concludes, the Founder determines the outcome " +
        "based on mutual fit, demonstrated expertise, and alignment with " +
        "the platform's mission. There are exactly three possible outcomes, " +
        "and all three are respectable conclusions.",
      bullets: [
        "Founding Partner — You join the core team with significant responsibility and Marks allocation",
        "Reference Expert — You maintain Guild standing and earn Marks for occasional expert contributions",
        "No Fit — The timing or alignment was not right. You keep all earned Marks. No hard feelings.",
        "The Founder communicates the decision directly and explains the reasoning",
        "If you disagree with the outcome, that conversation is welcome and expected",
      ],
    },

    // 7. Founding Partner Path
    {
      heading: "The Founding Partner Path",
      content:
        "Becoming a Founding Partner means joining the core team that is " +
        "building Liana Banyan from the ground up. It is not a title — it " +
        "is a commitment to do the work, carry the weight, and shape the " +
        "platform alongside the Founder. Founding Partners are the people " +
        "the Founder trusts to make decisions when he is not in the room.",
      bullets: [
        "Significant monthly Marks allocation reflecting core team contribution levels",
        "Direct collaboration with the Founder on Guild strategy and platform direction",
        "Increasing responsibility as the platform grows — your Guild is yours to lead",
        "Voice in platform-wide decisions through the Areopagus governance system",
        "First access to new innovations, patents, and strategic developments in your domain",
        "The expectation of full commitment — this is not a side project for a Founding Partner",
        "Contribution records maintained transparently and accessible to you at all times",
      ],
    },

    // 8. Reference Expert Path
    {
      heading: "The Reference Expert Path",
      content:
        "Not everyone wants to — or can — go all in. Reference Experts are " +
        "respected professionals who maintain their Guild standing and " +
        "contribute their expertise on an as-needed basis. This is not a " +
        "consolation prize. The platform genuinely needs domain experts who " +
        "can be called upon for specific challenges.",
      bullets: [
        "Retained Guild standing and membership",
        "Marks compensation for each contribution or consultation",
        "Flexible commitment — advisory level, typically 2-4 hours per month",
        "Ability to transition to Founding Partner if circumstances change",
        "Invitation to Guild gatherings, discussions, and strategic sessions",
        "Your expertise valued and credited in platform records",
      ],
    },

    // 9. Mutual Respect
    {
      heading: "Mutual Respect & Early Termination",
      content:
        "The Handshake is built on mutual respect. Either party may end " +
        "the exploration at any time, for any reason, without penalty. " +
        "Earned Marks are always retained. There is no shame in discovering " +
        "that the fit is not right — in fact, discovering that early is a " +
        "sign of integrity, not failure.",
      bullets: [
        "Either the Founder or the candidate may end The Handshake at any time",
        "No penalty for early termination — all earned Marks are retained",
        "A brief closing conversation is requested (but not required) to share feedback",
        "The door remains open — circumstances change, and future Handshakes are always possible",
        "Confidential information shared during The Handshake remains confidential",
        "Professional respect is maintained regardless of outcome",
      ],
    },

    // 10. Legal Notice
    {
      heading: "Legal Notice",
      content:
        "Marks are contribution records within the Liana Banyan cooperative " +
        "platform. They track and recognize member contributions to the " +
        "platform. This document describes a structured exploration process " +
        "and does not constitute an employment contract, a promise of " +
        "financial benefit, or an offering of any security or financial " +
        "instrument.",
      bullets: [
        "Marks are contribution records, not securities",
        "No promise of financial gain, appreciation, or monetary return is made or implied",
        "Marks do not represent membership participation in organizational surplus or revenue",
        "The Handshake is a mutual exploration, not an employment agreement",
        "Participation in The Handshake does not create an employer-employee relationship",
        "All parties are encouraged to seek independent legal counsel before committing",
        "The Liana Banyan platform operates as a cooperative — not a corporation issuing securities",
        "Nothing in this document should be construed as financial advice or a solicitation to contribute funds",
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Helper: Render the document as plain text (for export, email, or display)
// ---------------------------------------------------------------------------

/**
 * Render the Handshake Document as formatted plain text.
 * Useful for generating printable or email-friendly versions.
 */
export function renderHandshakeAsText(doc: HandshakeDocument = HANDSHAKE_DOCUMENT): string {
  const lines: string[] = [];

  lines.push("=".repeat(70));
  lines.push(doc.title.toUpperCase());
  lines.push(`Version ${doc.version} | Effective ${doc.effectiveDate}`);
  lines.push("=".repeat(70));
  lines.push("");

  for (const section of doc.sections) {
    lines.push("-".repeat(70));
    lines.push(section.heading.toUpperCase());
    lines.push("-".repeat(70));
    lines.push("");
    lines.push(section.content);
    lines.push("");

    if (section.bullets && section.bullets.length > 0) {
      for (const bullet of section.bullets) {
        lines.push(`  * ${bullet}`);
      }
      lines.push("");
    }
  }

  lines.push("=".repeat(70));
  lines.push("Liana Banyan Platform — The Handshake Protocol");
  lines.push("\"As You Wish.\"");
  lines.push("=".repeat(70));

  return lines.join("\n");
}

/**
 * Render the Handshake Document as structured HTML.
 * Useful for rendering in the platform UI or generating PDFs.
 */
export function renderHandshakeAsHtml(doc: HandshakeDocument = HANDSHAKE_DOCUMENT): string {
  const sectionHtml = doc.sections
    .map((section) => {
      const bulletList =
        section.bullets && section.bullets.length > 0
          ? `<ul>${section.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`
          : "";
      return `
      <section>
        <h2>${section.heading}</h2>
        <p>${section.content}</p>
        ${bulletList}
      </section>`;
    })
    .join("\n");

  return `
    <article class="handshake-document">
      <header>
        <h1>${doc.title}</h1>
        <p class="meta">Version ${doc.version} | Effective ${doc.effectiveDate}</p>
      </header>
      ${sectionHtml}
      <footer>
        <p>Liana Banyan Platform — The Handshake Protocol</p>
        <p><em>"As You Wish."</em></p>
      </footer>
    </article>
  `.trim();
}
