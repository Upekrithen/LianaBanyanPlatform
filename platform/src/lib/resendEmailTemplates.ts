/**
 * Resend Transactional Email Templates — BP073 Wave 4 · W4.4
 * ===========================================================
 * All auto-response email templates for MoneyPenny's four channels.
 * Templates are pre-rendered text (not HTML) for maximum deliverability.
 *
 * Template IDs match gatekeeper_templates.tier in the DB.
 * Text templates (no HTML) for broadest client compatibility.
 *
 * FOUNDER: once RESEND_API_KEY is set in Vault, these templates are used
 * automatically by gatekeeper-triage for Tier 2/3 auto-responses.
 * Tier 1 (Crown) responses are intentionally personal — Founder writes those.
 *
 * Template variables: {{name}}, {{subject}}, {{category}}
 * Replaced at send time by gatekeeper-triage / moneypenny-intake.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EmailTemplate {
  id: string;
  tier: 1 | 2 | 3;
  category: string;
  subject_line: string;
  body_text: string;
  from_name: string;
  from_address: string;
  sla_copy: string;
}

// ─── Templates ───────────────────────────────────────────────────────────────

/**
 * Tier 1 — Crown / VIP (P0)
 * Founder responds personally. This template is the "we received it" hold.
 */
export const TEMPLATE_TIER_1_CROWN: EmailTemplate = {
  id: "mp_t1_crown",
  tier: 1,
  category: "crown",
  subject_line: "Re: {{subject}} — Personal response coming",
  body_text: `Dear {{name}},

Thank you for reaching out to Jonathan directly.

Your message has been flagged as highest priority and Jonathan has been personally notified. He will respond within 4 hours.

If this is time-sensitive, you can reach MoneyPenny at support@lianabanyan.com.

Warm regards,
MoneyPenny
Liana Banyan Corporation
lianabanyan.com`,
  from_name: "MoneyPenny at Liana Banyan",
  from_address: "noreply@lianabanyan.com",
  sla_copy: "within 4 hours",
};

/**
 * Tier 2 — Press / Priority (P1)
 * Auto-response for press inquiries, speaking invitations, notable contacts.
 */
export const TEMPLATE_TIER_2_PRESS: EmailTemplate = {
  id: "mp_t2_press",
  tier: 2,
  category: "press",
  subject_line: "Re: {{subject}} — Liana Banyan Media Response",
  body_text: `Dear {{name}},

Thank you for your inquiry. Your message has been flagged as press priority and forwarded to Jonathan directly.

We aim to respond to all media inquiries within 12 hours.

Press kit and background materials:
lianabanyan.com/press

For urgent matters, contact us at press@lianabanyan.com.

Warm regards,
MoneyPenny
Liana Banyan Corporation
lianabanyan.com`,
  from_name: "MoneyPenny at Liana Banyan",
  from_address: "noreply@lianabanyan.com",
  sla_copy: "within 12 hours",
};

/**
 * Tier 2 — Partnership inquiry
 */
export const TEMPLATE_TIER_2_PARTNER: EmailTemplate = {
  id: "mp_t2_partner",
  tier: 2,
  category: "partner",
  subject_line: "Re: {{subject}} — Liana Banyan Partnership Inquiry",
  body_text: `Dear {{name}},

Thank you for your interest in working with Liana Banyan.

Please note that Liana Banyan is a member-owned cooperative platform. We are always open to partnerships that serve our member community and align with our cooperative values.

Your inquiry has been forwarded to our team and we will respond within 12 hours.

To learn more about how Liana Banyan works:
lianabanyan.com/about

Warm regards,
MoneyPenny
Liana Banyan Corporation
lianabanyan.com`,
  from_name: "MoneyPenny at Liana Banyan",
  from_address: "noreply@lianabanyan.com",
  sla_copy: "within 12 hours",
};

/**
 * Tier 3 — Member / Founding member (P2)
 */
export const TEMPLATE_TIER_3_MEMBER: EmailTemplate = {
  id: "mp_t3_member",
  tier: 3,
  category: "member",
  subject_line: "Re: {{subject}} — Liana Banyan Support",
  body_text: `Dear {{name}},

Thank you for contacting Liana Banyan.

We have received your message and a member of our team will respond within 48 hours.

Already a member? Log in at lianabanyan.com to access your account and track support requests.

Interested in joining? Founding membership is $5/year for identical access for everyone:
lianabanyan.com/join

Warm regards,
MoneyPenny
Liana Banyan Corporation
lianabanyan.com`,
  from_name: "MoneyPenny at Liana Banyan",
  from_address: "noreply@lianabanyan.com",
  sla_copy: "within 48 hours",
};

/**
 * Tier 3 — General inquiry (P5)
 */
export const TEMPLATE_TIER_3_GENERAL: EmailTemplate = {
  id: "mp_t3_general",
  tier: 3,
  category: "general",
  subject_line: "Re: {{subject}} — Thank you for reaching out",
  body_text: `Dear {{name}},

Thank you for contacting Liana Banyan. We have received your message.

Our team reviews all inquiries and will respond to relevant messages within 48 hours.

To learn more about Liana Banyan and our cooperative platform:
lianabanyan.com

Warm regards,
MoneyPenny
Liana Banyan Corporation
lianabanyan.com`,
  from_name: "MoneyPenny at Liana Banyan",
  from_address: "noreply@lianabanyan.com",
  sla_copy: "within 48 hours",
};

/**
 * Tier 3 — Academic / Research inquiry (P4)
 */
export const TEMPLATE_TIER_3_ACADEMIC: EmailTemplate = {
  id: "mp_t3_academic",
  tier: 3,
  category: "academic",
  subject_line: "Re: {{subject}} — Liana Banyan Research Inquiry",
  body_text: `Dear {{name}},

Thank you for your interest in Liana Banyan from a research perspective.

We welcome academic inquiry and are happy to provide information about our cooperative model and platform economics. Please note that as a member-owned cooperative, our governance documents and financial disclosures are available to all members.

Our team will respond to your inquiry within 48 hours.

Background resources:
lianabanyan.com/about
lianabanyan.com/press

Warm regards,
MoneyPenny
Liana Banyan Corporation
lianabanyan.com`,
  from_name: "MoneyPenny at Liana Banyan",
  from_address: "noreply@lianabanyan.com",
  sla_copy: "within 48 hours",
};

// ─── Template Registry ────────────────────────────────────────────────────────

export const ALL_TEMPLATES: EmailTemplate[] = [
  TEMPLATE_TIER_1_CROWN,
  TEMPLATE_TIER_2_PRESS,
  TEMPLATE_TIER_2_PARTNER,
  TEMPLATE_TIER_3_MEMBER,
  TEMPLATE_TIER_3_GENERAL,
  TEMPLATE_TIER_3_ACADEMIC,
];

/**
 * Resolve the best template for a given tier + category combination.
 * Falls back to the generic tier template if no category match.
 */
export function resolveTemplate(tier: 1 | 2 | 3, category: string): EmailTemplate {
  const exact = ALL_TEMPLATES.find(t => t.tier === tier && t.category === category);
  if (exact) return exact;
  const tierFallback = ALL_TEMPLATES.find(t => t.tier === tier);
  if (tierFallback) return tierFallback;
  return TEMPLATE_TIER_3_GENERAL;
}

/**
 * Render a template by substituting {{variables}}.
 */
export function renderTemplate(
  template: EmailTemplate,
  vars: { name: string; subject?: string; category?: string },
): { subject: string; body: string; from: string } {
  const replace = (text: string) =>
    text
      .replace(/\{\{name\}\}/g, vars.name || "")
      .replace(/\{\{subject\}\}/g, vars.subject || "your inquiry")
      .replace(/\{\{category\}\}/g, vars.category || "inquiry");

  return {
    subject: replace(template.subject_line),
    body: replace(template.body_text),
    from: `${template.from_name} <${template.from_address}>`,
  };
}

/**
 * Build the full Resend API payload for a given contact.
 */
export function buildResendPayload(
  recipientEmail: string,
  recipientName: string,
  tier: 1 | 2 | 3,
  category: string,
  subjectOverride?: string,
): Record<string, unknown> {
  const template = resolveTemplate(tier, category);
  const rendered = renderTemplate(template, {
    name: recipientName,
    subject: subjectOverride,
    category,
  });

  return {
    from: rendered.from,
    to: recipientEmail,
    subject: rendered.subject,
    text: rendered.body,
  };
}
