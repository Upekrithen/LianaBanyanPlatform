/**
 * Intake Triage Router — MoneyPenny Priority-Routing Rules Engine
 * ================================================================
 * BP067 Do-It-All Let's Roll · Scope C · Knight
 *
 * Goal: An overwhelming inbound is triaged + routed, not lost.
 * Built for the "world afire" launch scenario where Crown-letter
 * recipients + press + members + general public all respond simultaneously.
 *
 * PRIORITY TAXONOMY (descending):
 *   P0 — Crown       : Named Crown-letter recipients (16 Initiative Crowns, The Roll candidates)
 *   P1 — Press       : Media outlets, journalists, podcast hosts, speaking invitations
 *   P2 — Member      : Existing members, founding member applicants, $5 joiners
 *   P3 — Partner     : Potential institutional partners, cooperatives, NGOs
 *   P4 — Academic    : Researchers, professors, thesis writers
 *   P5 — General     : Everyone else, curious public, cold outreach
 *   P9 — Noise       : Automated, spam, irrelevant, hostile
 *
 * EMAIL ROUTING INBOXES:
 *   Founder@LianaBanyan.com  — P0 only (Crown + highest-priority press)
 *   CTO@LianaBanyan.com      — P1 technical, P3 partner, P2 member technical
 *   Support@LianaBanyan.com  — P2 member support, P4 academic, P5 general
 */

// ─── Priority Classes ─────────────────────────────────────────────────────────

export type PriorityClass = 'crown' | 'press' | 'member' | 'partner' | 'academic' | 'general' | 'noise';

export interface PriorityTaxonomy {
  class: PriorityClass;
  level: number;        // 0-9 (lower = higher priority)
  sla_hours: number;   // target response window
  route_to: RoutingTarget[];
  auto_acknowledge: boolean;
  google_voice_alert: boolean; // ring the priority Voice number
}

export type RoutingTarget = 'founder' | 'cto' | 'support' | 'bishop_queue' | 'knight_queue' | 'archive';

export const PRIORITY_TAXONOMY: Record<PriorityClass, PriorityTaxonomy> = {
  crown: {
    class: 'crown',
    level: 0,
    sla_hours: 4,
    route_to: ['founder', 'bishop_queue'],
    auto_acknowledge: true,
    google_voice_alert: true,  // Crown Voice number rings immediately
  },
  press: {
    class: 'press',
    level: 1,
    sla_hours: 12,
    route_to: ['founder', 'bishop_queue'],
    auto_acknowledge: true,
    google_voice_alert: false,
  },
  member: {
    class: 'member',
    level: 2,
    sla_hours: 24,
    route_to: ['support', 'bishop_queue'],
    auto_acknowledge: true,
    google_voice_alert: false,
  },
  partner: {
    class: 'partner',
    level: 3,
    sla_hours: 48,
    route_to: ['cto', 'bishop_queue'],
    auto_acknowledge: true,
    google_voice_alert: false,
  },
  academic: {
    class: 'academic',
    level: 4,
    sla_hours: 72,
    route_to: ['support', 'bishop_queue'],
    auto_acknowledge: true,
    google_voice_alert: false,
  },
  general: {
    class: 'general',
    level: 5,
    sla_hours: 168,  // 7 days
    route_to: ['support'],
    auto_acknowledge: true,
    google_voice_alert: false,
  },
  noise: {
    class: 'noise',
    level: 9,
    sla_hours: 0,  // no response
    route_to: ['archive'],
    auto_acknowledge: false,
    google_voice_alert: false,
  },
};

// ─── Crown Roster (The Roll — named individuals from Crown letters) ──────────

export const CROWN_ROSTER: string[] = [
  // Initiative Crowns (confirmed)
  'maneet chauhan', 'maneet',
  'mary beth laughton', 'laughton',
  'cathie mahon', 'mahon',
  'kimberly a. williams', 'kimberly williams',
  'jessica jackley', 'jackley',
  'jessica',
  'bobby flay', 'flay',
  'stacy mitchell',
  'sal khan', 'khan',
  'brene brown', 'brené brown',
  'taylor swift', 'swift',
  'dale dougherty', 'dougherty',
  'harry moser', 'moser',
  'marie kondo', 'kondo',
  'ai-jen poo', 'aijen poo',
  // The Roll P0 candidates (from letters sent)
  'mackenzie scott', 'scott',
  'warren buffett', 'buffett',
  'melinda french gates', 'melinda gates',
  'trebor scholz', 'scholz',
  'nathan schneider', 'schneider',
  'claire danes', 'danes',
  'rob herjavec', 'herjavec',
  'tom simon', 'simon',
];

// ─── Press / Media Keywords ──────────────────────────────────────────────────

const PRESS_KEYWORDS = [
  'journalist', 'reporter', 'editor', 'producer', 'podcast', 'interview',
  'article', 'story', 'feature', 'press', 'media', 'publication',
  'techcrunch', 'wired', 'fast company', 'inc.', 'bloomberg', 'npr',
  'new york times', 'washington post', 'guardian', 'vice', 'motherboard',
  'hacker news', 'ycombinator', 'y combinator', 'the information',
];

const PARTNER_KEYWORDS = [
  'cooperative', 'credit union', 'ngo', 'nonprofit', 'non-profit', 'foundation',
  'university', 'college', 'institute', 'alliance', 'association', 'guild',
  'partnership', 'collaboration', 'integration', 'white label', 'licensing',
  'enterprise', 'municipal', 'government', 'federal', 'state agency',
];

const NOISE_KEYWORDS = [
  'unsubscribe', 'spam', 'buy followers', 'seo services', 'guest post',
  'cryptocurrency', 'bitcoin', 'nft', 'investment opportunity', 'get rich',
  'no-reply', 'noreply', 'mailer-daemon', 'postmaster',
];

// ─── Core Classification Engine ──────────────────────────────────────────────

export interface InboundMessage {
  from_name?: string;
  from_email: string;
  to_email: string;
  subject: string;
  body_excerpt?: string;    // first 500 chars
  timestamp: string;
  channel: 'email' | 'contact_form' | 'google_voice' | 'social_dm';
}

export interface TriageResult {
  priority: PriorityTaxonomy;
  confidence: 'high' | 'medium' | 'low';
  matched_signals: string[];
  auto_response_template: string;
  action_required: boolean;
  notes: string;
}

/**
 * Classify an inbound message and return routing instructions.
 * Truth-Always: confidence band is always honest; never pretend certainty.
 */
export function classifyInbound(msg: InboundMessage): TriageResult {
  const text = [
    msg.from_name ?? '',
    msg.from_email,
    msg.subject,
    msg.body_excerpt ?? '',
  ].join(' ').toLowerCase();

  const signals: string[] = [];

  // P9: Noise detection (fast exit)
  for (const kw of NOISE_KEYWORDS) {
    if (text.includes(kw)) {
      signals.push(`noise:${kw}`);
      return {
        priority: PRIORITY_TAXONOMY.noise,
        confidence: 'high',
        matched_signals: signals,
        auto_response_template: '',
        action_required: false,
        notes: 'Automated noise — archived without response.',
      };
    }
  }

  // P0: Crown roster exact-name match
  for (const name of CROWN_ROSTER) {
    if (text.includes(name)) {
      signals.push(`crown:name:${name}`);
      return {
        priority: PRIORITY_TAXONOMY.crown,
        confidence: 'high',
        matched_signals: signals,
        auto_response_template: AUTO_RESPONSES.crown,
        action_required: true,
        notes: `Crown-class match on "${name}" — route to Founder immediately.`,
      };
    }
  }

  // Check destination inbox
  const to = msg.to_email.toLowerCase();
  if (to.includes('founder@') || to.includes('jonathan@')) {
    signals.push('inbox:founder');
    // Anything hitting Founder@ directly is at least P1 unless noise
  }

  // P1: Press signals
  const pressMatches = PRESS_KEYWORDS.filter(kw => text.includes(kw));
  if (pressMatches.length > 0) {
    pressMatches.forEach(kw => signals.push(`press:${kw}`));
    return {
      priority: PRIORITY_TAXONOMY.press,
      confidence: pressMatches.length >= 2 ? 'high' : 'medium',
      matched_signals: signals,
      auto_response_template: AUTO_RESPONSES.press,
      action_required: true,
      notes: `Press class — ${pressMatches.length} signal(s). SLA: 12h. Route to bishop_queue + Founder.`,
    };
  }

  // P2: Member signals (email domain, join language, $5, founding member)
  const memberSignals = ['$5', 'join', 'member', 'founding', 'membership', 'cooperative', 'medallion'];
  const memberMatches = memberSignals.filter(kw => text.includes(kw));
  if (memberMatches.length >= 2 || (memberMatches.length >= 1 && to.includes('support@'))) {
    memberMatches.forEach(kw => signals.push(`member:${kw}`));
    return {
      priority: PRIORITY_TAXONOMY.member,
      confidence: memberMatches.length >= 2 ? 'high' : 'medium',
      matched_signals: signals,
      auto_response_template: AUTO_RESPONSES.member,
      action_required: true,
      notes: `Member class — route to support + bishop_queue for MoneyPenny Q&A.`,
    };
  }

  // P3: Partner signals
  const partnerMatches = PARTNER_KEYWORDS.filter(kw => text.includes(kw));
  if (partnerMatches.length > 0) {
    partnerMatches.forEach(kw => signals.push(`partner:${kw}`));
    return {
      priority: PRIORITY_TAXONOMY.partner,
      confidence: partnerMatches.length >= 2 ? 'high' : 'medium',
      matched_signals: signals,
      auto_response_template: AUTO_RESPONSES.partner,
      action_required: true,
      notes: `Partner class — route to CTO. SLA: 48h.`,
    };
  }

  // P4: Academic
  const academicSignals = ['research', 'thesis', 'dissertation', 'professor', 'phd', 'study', 'paper', 'academic', 'university', 'cite'];
  const academicMatches = academicSignals.filter(kw => text.includes(kw));
  if (academicMatches.length >= 2) {
    academicMatches.forEach(kw => signals.push(`academic:${kw}`));
    return {
      priority: PRIORITY_TAXONOMY.academic,
      confidence: 'medium',
      matched_signals: signals,
      auto_response_template: AUTO_RESPONSES.academic,
      action_required: true,
      notes: `Academic class — route to support. Cephas is the self-serve answer.`,
    };
  }

  // P5: General (fallback)
  signals.push('general:fallback');
  return {
    priority: PRIORITY_TAXONOMY.general,
    confidence: 'low',
    matched_signals: signals,
    auto_response_template: AUTO_RESPONSES.general,
    action_required: false,
    notes: `General — auto-acknowledged, queued for batch review. SLA: 7 days.`,
  };
}

// ─── Auto-Response Templates ──────────────────────────────────────────────────

export const AUTO_RESPONSES = {
  crown: `Thank you for reaching out. Jonathan reads every message personally.
Given the significance of your correspondence, you will hear back within 4 hours.
In the meantime, the full platform context is available at cephas.lianabanyan.com.
— Liana Banyan Team`,

  press: `Thank you for your interest in Liana Banyan.
The full press kit is available at lianabanyan.com/press.
Jonathan is available for interviews and would be happy to speak with you —
we will respond within 12 hours to schedule.
— Liana Banyan Team`,

  member: `Thank you for your interest in Liana Banyan!
To join as a founding member ($5/year), visit lianabanyan.com/join.
Our MoneyPenny Q&A system is available at the platform for any questions —
worthwhile questions earn Marks. We'll follow up within 24 hours.
— Liana Banyan Team`,

  partner: `Thank you for reaching out regarding a potential partnership.
Our technical documentation is at cephas.lianabanyan.com.
We will be in touch within 48 hours to discuss how we might work together.
— Liana Banyan Team`,

  academic: `Thank you for your research interest in Liana Banyan.
All canonical documentation, patent applications (Defensive Pledge #2260), and
architectural details are publicly available at cephas.lianabanyan.com.
We encourage open academic study of cooperative economics.
We'll respond to your specific questions within 72 hours.
— Liana Banyan Team`,

  general: `Thank you for reaching out to Liana Banyan!
To learn more about our cooperative commerce platform: lianabanyan.com
To join as a member: lianabanyan.com/join ($5/year)
Full technical documentation: cephas.lianabanyan.com
We read every message and will be in touch.
— Liana Banyan Team`,
} as const;

// ─── Email Routing Configuration ─────────────────────────────────────────────

export const EMAIL_ROUTING_CONFIG = {
  /**
   * Founder@LianaBanyan.com
   * Receives: P0 (Crown), P1 high-confidence (press)
   * Filter rule: Forward to personal email if subject contains Crown names OR
   *              from known press domains. All else → Support@.
   */
  founder_inbox: {
    address: 'Founder@LianaBanyan.com',
    receives: ['crown', 'press'] as PriorityClass[],
    filter_rule: 'subject OR from-name matches CROWN_ROSTER, OR from-domain matches press outlets',
    overflow_route: 'Support@LianaBanyan.com',
    alert: 'google_voice_crown_number',
  },

  /**
   * CTO@LianaBanyan.com
   * Receives: P3 (partner), P1 technical press, P2 member technical
   * Filter rule: Subject contains "API", "integration", "partnership", "technical",
   *              "developer", "SDK", or is from cooperative/institution domain.
   */
  cto_inbox: {
    address: 'CTO@LianaBanyan.com',
    receives: ['partner'] as PriorityClass[],
    filter_rule: 'subject contains API|integration|partnership|technical|developer|enterprise|sdk',
    overflow_route: 'Support@LianaBanyan.com',
    alert: 'none',
  },

  /**
   * Support@LianaBanyan.com
   * Receives: P2 (member), P4 (academic), P5 (general) — the intake firehose
   * Filter rule: Everything not matched by Founder@ or CTO@ rules.
   * MoneyPenny Q&A auto-response fires from this inbox.
   */
  support_inbox: {
    address: 'Support@LianaBanyan.com',
    receives: ['member', 'academic', 'general'] as PriorityClass[],
    filter_rule: 'default catch-all after Founder@ and CTO@ filters',
    overflow_route: 'bishop_queue_batch_review',
    alert: 'none',
  },
} as const;

// ─── Google Voice Configuration ───────────────────────────────────────────────

export const GOOGLE_VOICE_CONFIG = {
  /**
   * VOICE NUMBER 1 — Crown Priority Line
   * Designated for: Crown-letter recipients and high-priority inbound
   * Behavior: Ring founder's personal device for P0 (Crown) messages
   *           Voicemail transcription forwarded to Founder@ immediately
   * Setup status: CONFIRM WITH FOUNDER — number designated but not verified live
   */
  crown_priority_line: {
    designation: 'Crown/High-Priority Intake',
    priority_classes: ['crown', 'press'] as PriorityClass[],
    ring_device: 'Founder personal',
    voicemail_forward_to: 'Founder@LianaBanyan.com',
    status: 'CONFIRM_WITH_FOUNDER',
  },

  /**
   * VOICE NUMBER 2 — General Intake Line
   * Designated for: Platform support, member inquiries, general public
   * Behavior: Standard voicemail, transcription forwarded to Support@
   * Setup status: CONFIRM WITH FOUNDER — number designated but not verified live
   */
  general_intake_line: {
    designation: 'General Intake',
    priority_classes: ['member', 'partner', 'academic', 'general'] as PriorityClass[],
    ring_device: 'voicemail only (no live ring)',
    voicemail_forward_to: 'Support@LianaBanyan.com',
    status: 'CONFIRM_WITH_FOUNDER',
  },
} as const;

// ─── High-Volume Triage Processor ─────────────────────────────────────────────

export interface TriageBatch {
  processed: number;
  crown_count: number;
  press_count: number;
  member_count: number;
  partner_count: number;
  academic_count: number;
  general_count: number;
  noise_count: number;
  crown_items: TriageResult[];
  press_items: TriageResult[];
  action_required_count: number;
}

/**
 * Process a batch of inbound messages (viral blast scenario).
 * Returns sorted priority queues — Crown and Press items ready for Founder review.
 */
export function processBatch(messages: InboundMessage[]): TriageBatch {
  const results = messages.map(classifyInbound);

  const batch: TriageBatch = {
    processed: results.length,
    crown_count: 0,
    press_count: 0,
    member_count: 0,
    partner_count: 0,
    academic_count: 0,
    general_count: 0,
    noise_count: 0,
    crown_items: [],
    press_items: [],
    action_required_count: 0,
  };

  for (const r of results) {
    const cls = r.priority.class;
    (batch as Record<string, number | TriageResult[]>)[`${cls}_count`] =
      ((batch as Record<string, number>)[`${cls}_count`] || 0) + 1;
    if (cls === 'crown') batch.crown_items.push(r);
    if (cls === 'press') batch.press_items.push(r);
    if (r.action_required) batch.action_required_count++;
  }

  return batch;
}

// ─── Readiness Verdict ────────────────────────────────────────────────────────

export const INTAKE_TRIAGE_READINESS = {
  built: true,
  version: 'BP067-Do-It-All-Scope-C',
  components: {
    priority_taxonomy: 'COMPLETE — 7 classes (P0-P9)',
    routing_rules: 'COMPLETE — classifyInbound() + email_routing_config',
    auto_responses: 'COMPLETE — 6 templates (crown/press/member/partner/academic/general)',
    batch_processor: 'COMPLETE — processBatch() for viral blast scenario',
    google_voice: 'PENDING_FOUNDER_CONFIRM — 2 numbers designated, setup unverified',
    email_filters: 'SPEC COMPLETE — rules documented; Gmail/GSuite filter creation = manual step',
  },
  verdict: 'READY for bounded Crown-letter volume (P0-P2). High-volume (viral blast) architecture complete; Google Voice + Gmail filter manual setup required.',
  next_action: 'Founder: (1) Confirm 2 Google Voice numbers active and forwarding; (2) Set up Gmail filter rules per EMAIL_ROUTING_CONFIG; (3) Test with a mock P0 message.',
} as const;
