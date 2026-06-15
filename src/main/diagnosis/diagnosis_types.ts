/**
 * diagnosis_types.ts — The Diagnosis v0.4.0 BP083
 *
 * NYT-column model: persistent questions broadcast to human Members.
 * Bounty paid via Substitution Rails (Fiat/Marks/Barter).
 * REGULATORY HYGIENE (BP051 Saladin's Pattern — NON-NEGOTIABLE):
 *   medical/legal/financial domains MUST show informational-only disclaimer.
 */

export type DiagnosisDomain =
  | 'medical'
  | 'mechanical'
  | 'practical'
  | 'legal'
  | 'financial'
  | 'scientific'
  | 'historical'
  | 'other';

export type DiagnosisStatus = 'open' | 'answered' | 'resolved' | 'expired';

export type SubstitutionRail = 'fiat' | 'marks' | 'barter';

export interface DiagnosisBounty {
  rail: SubstitutionRail;
  amount: number;
  barterDescription?: string;
}

export interface DiagnosisPost {
  id: string;
  question: string;
  domain: DiagnosisDomain;
  context: string;
  priorAttempts: string;
  bounty: DiagnosisBounty;
  visibility: 'lan' | 'constellation' | 'cross-cathedral';
  posterId: string;
  posterName?: string;
  timestamp: number;
  status: DiagnosisStatus;
  answers: DiagnosisAnswer[];
  acceptedAnswerId?: string;
  source?: string; // 'manual' | 'andon_auto_escalation'
}

export interface DiagnosisAnswer {
  id: string;
  diagnosisId: string;
  responderId: string;
  responderName?: string;
  answerText: string;
  sources: string[];
  credentials?: string;
  timestamp: number;
  upvotes: number;
}

export interface DiagnosisCreateInput {
  question: string;
  domain: DiagnosisDomain;
  context: string;
  priorAttempts: string;
  bounty: DiagnosisBounty;
  visibility: DiagnosisPost['visibility'];
  posterName?: string;
  source?: string;
}

// ─── Regulatory disclaimers (NON-NEGOTIABLE BP051) ───────────────────────────

export const DOMAIN_DISCLAIMERS: Record<DiagnosisDomain, string> = {
  medical:
    '⚠️ INFORMATIONAL ONLY — not medical advice. Responses from peers are not from licensed medical professionals unless explicitly disclosed. Consult a licensed healthcare provider for all medical decisions. In an emergency, call 911.',
  legal:
    '⚠️ INFORMATIONAL ONLY — not legal advice. Responses are not from licensed attorneys unless explicitly disclosed. Consult a licensed attorney for all legal matters.',
  financial:
    '⚠️ INFORMATIONAL ONLY — not financial advice. Responses are not from licensed financial advisors unless explicitly disclosed. Consult a licensed financial professional for all financial decisions.',
  mechanical:
    'ℹ️ Information shared by cooperative peers. Verify with a qualified mechanic or engineer before acting on any mechanical advice.',
  practical: '',
  scientific: '',
  historical: '',
  other: '',
};

export const DOMAIN_LABELS: Record<DiagnosisDomain, string> = {
  medical: '🏥 Medical',
  mechanical: '🔧 Mechanical',
  practical: '🛠️ Practical',
  legal: '⚖️ Legal',
  financial: '💰 Financial',
  scientific: '🔬 Scientific',
  historical: '📜 Historical',
  other: '💬 Other',
};
