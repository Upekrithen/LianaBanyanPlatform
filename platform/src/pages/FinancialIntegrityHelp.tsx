/**
 * FINANCIAL INTEGRITY HELP PAGE — K504 Phase E.2
 * ================================================
 * Member-education page at /help/financial-integrity
 *
 * GUARDRAIL: Does NOT expose specific flag thresholds (aids evasion).
 * Describes what AML is and that monitoring exists; high-level only.
 */

import React, { useState } from 'react';

const FAQ = [
  {
    q: 'What is anti-money-laundering (AML) monitoring?',
    a: 'Money laundering is the process of making illegally obtained funds appear legitimate by routing them through financial transactions. Anti-money-laundering (AML) monitoring means looking for patterns in financial activity that may indicate this kind of misuse. Most AML flags are legitimate — the monitoring exists to protect the cooperative, not to surveil members for normal activity.',
  },
  {
    q: 'Why does Liana Banyan monitor transactions?',
    a: 'The Liana Banyan platform handles real economic value — Credits, Marks, and Joules. To protect the cooperative\'s integrity and its members, we monitor for patterns that could indicate the platform is being used as a vehicle for financial crime. This is standard practice for any platform that handles financial value, and it is part of our commitment to operating with a good name (#41 keystone: "a good name is rather to be chosen than great riches").',
  },
  {
    q: 'What kinds of patterns does monitoring look for?',
    a: 'We look for patterns like: unusually high transaction volume in a short window, a large share of transactions going to a single counterparty, or coordinated ring-like routing patterns. We do not disclose specific thresholds because doing so would make it easy for bad actors to work around them. The vast majority of members will never trigger any flag.',
  },
  {
    q: 'What happens if my account is flagged?',
    a: 'Your account is reviewed internally by a trained, high-Rep community curator. Most flags are cleared as legitimate within a short period. You will not be notified unless the review results in an escalated status — and even then, the notification is informational, not punitive. Your account is NOT automatically suspended because of a flag. Suspension requires a separate curator decision with member notification.',
  },
  {
    q: 'Who reviews the flags?',
    a: 'High-Rep members who have voluntarily taken on the AML-review curator role. Curators sign a confidentiality agreement and complete training before accessing any flag data. Curator activity is logged to an immutable audit log and is itself reviewable by LB Corporation leadership.',
  },
  {
    q: 'Could my results be reported to a government agency?',
    a: 'Possibly, if a flag is determined to warrant escalation under applicable law. Whether and when LB Corporation is required to file Suspicious Activity Reports (SARs) depends on our regulatory classification, which is being determined by legal counsel. Until that determination is made, no automatic reports are filed. If a SAR is ever warranted, it requires manual review by counsel before filing.',
  },
  {
    q: 'What if I\'m a high-volume Credits user?',
    a: 'Members who use the platform at high volume may be asked to provide source-of-funds documentation as part of an enhanced onboarding or periodic review process. This is a standard practice for platforms that handle financial value, and cooperation helps us keep the platform healthy for everyone.',
  },
  {
    q: 'I received a notification that my account is under review. What do I do?',
    a: 'The notification means your account has been flagged for a review that did not resolve as definitively legitimate at the initial curator level. You don\'t need to do anything immediately — the review continues. If we need information from you, we will contact you directly. You can also reach our compliance team at [compliance@lianabanyan.com].',
  },
];

function FaqItem({ item, defaultOpen = false }: { item: typeof FAQ[0]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '18px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#1e293b',
          fontSize: '15px',
          fontWeight: 500,
          fontFamily: 'inherit',
        }}
      >
        <span>{item.q}</span>
        <span style={{ color: '#94a3b8', flexShrink: 0 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <p style={{ paddingBottom: '18px', color: '#475569', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

export default function FinancialIntegrityHelp() {
  return (
    <div style={{
      background: '#f8fafc',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '48px 24px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '12px',
            color: '#0369a1',
            marginBottom: '16px',
            fontWeight: 500,
          }}>
            Member Education
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', margin: '0 0 12px' }}>
            Financial Integrity & Anti-Money-Laundering
          </h1>
          <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
            How Liana Banyan monitors platform transactions to protect the cooperative's good name, and what it means for you.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Intro */}
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '32px',
        }}>
          <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '6px' }}>The short version</div>
          <p style={{ color: '#78350f', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
            Liana Banyan monitors transaction patterns to detect potential misuse of the platform for financial crime.
            Most members will never trigger a flag. If you are flagged, a trained community curator reviews your account internally.
            No automatic suspensions. No automatic government reports. We are transparent about what we do and why.
          </p>
        </div>

        {/* Why this matters */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '12px' }}>
            Why this matters to the cooperative
          </h2>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7', marginBottom: '12px' }}>
            Liana Banyan's Credit system — where Credits flow one-way (real dollars in, no cash out) — is designed to prevent
            the platform from being used for traditional money laundering at the exit stage. But the platform also needs to
            protect against the <em>layering</em> stage: using internal transactions to obscure the origin of funds.
          </p>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
            Monitoring for these patterns is part of how LB Corporation protects its good name — and the reputation of every
            member who participates in good faith. A cooperative's value depends on trust, and trust depends on integrity.
          </p>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '20px' }}>
            Frequently asked questions
          </h2>
          {FAQ.map((item, i) => (
            <FaqItem key={i} item={item} defaultOpen={i === 0} />
          ))}
        </div>

        {/* Regulatory status note */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '32px',
        }}>
          <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
            Regulatory classification status
          </div>
          <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.6', margin: '0 0 8px' }}>
            Whether LB Corporation qualifies as a "money services business" (MSB) or "money transmitter" under applicable
            federal and state law is currently being determined by legal counsel. Until that determination is made:
          </p>
          <ul style={{ color: '#475569', fontSize: '13px', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
            <li>Our transaction monitoring infrastructure is active and functional</li>
            <li>Internal curator review of flagged accounts is ongoing</li>
            <li>Suspicious Activity Report (SAR) filing to regulatory authorities is <strong>not automatic</strong> and requires counsel review + manual dispatch</li>
          </ul>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '12px 0 0' }}>
            This status will be updated when counsel confirms the regulatory classification. We are committed to transparency about where we are in this process.
          </p>
        </div>

        {/* Contact */}
        <div style={{ textAlign: 'center', paddingTop: '16px', color: '#94a3b8', fontSize: '13px' }}>
          <p>Questions about financial integrity or your account status?</p>
          <p>Contact us at <strong style={{ color: '#475569' }}>compliance@lianabanyan.com</strong></p>
        </div>
      </div>
    </div>
  );
}
