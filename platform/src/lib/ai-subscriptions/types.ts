/**
 * BP073 SEG-α3 · α-W3 — AiSubscription + MyModelBinding types
 * Member-sovereign, local-only. Privacy doorpost: never phone-home.
 */

export type SubscriptionState =
  | 'ACTIVE'
  | 'EXPENDED'
  | 'DEMOTED_FREE'
  | 'AVAILABLE'
  | 'EXPIRED';

export interface TesterBadge {
  memberId: string;
  proofId: string;
  proofUrl: string;
}

export interface AiSubscription {
  id: string;                      // UUID
  provider: string;                // e.g. "Anthropic", "OpenAI", "Google", "Ollama"
  accountName: string;             // member's display name for this account
  modelId: string;                 // e.g. "claude-4.6-sonnet", "gpt-5.3", "gemma4:12b"
  state: SubscriptionState;
  periodStart: string;             // ISO date
  periodEnd: string;               // ISO date
  creditAllowance: number;         // in provider units (tokens, credits, etc.)
  creditsSpent: number;
  currentAssignment: string;       // which use-case this subscription is currently assigned to
  mySubscription: boolean;         // true = this account belongs to the member
  speedScore?: number;
  costPerMTokens?: number;         // null = not yet receipt-grounded; labeled (est.) in UI
  costIsEstimate: boolean;         // true = label (est.) in UI, never fabricate
  accuracyScore?: number;
  benchmarkScore?: number;         // Banyan Metric
  testerBadges: TesterBadge[];
  receiptAttachments: string[];    // paths to attached receipts (PDF/screenshot/manual $)
  createdAt: string;               // ISO timestamp
  updatedAt: string;               // ISO timestamp
}

export interface MyModelBinding {
  subscriptionId: string;          // FK to AiSubscription.id
  modelId: string;
  boundAt: string;                 // ISO timestamp
  boundBy: string;                 // "member" | "auto" (auto only on expiry rollover)
}

export interface AiSubscriptionStore {
  subscriptions: AiSubscription[];
  bindings: MyModelBinding[];
  lastUpdated: string;             // ISO timestamp
  schemaVersion: '1.0.0';
}

export interface ExpendedAlert {
  subscriptionId: string;
  provider: string;
  accountName: string;
  candidateAlternatives: AiSubscription[];
}
