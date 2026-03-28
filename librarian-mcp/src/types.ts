export interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  references?: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnDef[];
  primaryKey?: string;
  foreignKeys: string[];
  indexes: string[];
  rlsPolicies: string[];
  originMigration: string;
  alterMigrations: string[];
}

export interface SchemaIndex {
  tables: Record<string, TableSchema>;
  enums: Record<string, string[]>;
  featureFlags: Record<string, { value: string; notes?: string }>;
  migrationCount: number;
  lastMigration: string;
}

export interface EdgeFunctionEntry {
  name: string;
  path: string;
  purpose: string;
  authPattern: "anon" | "authenticated" | "service_role" | "webhook" | "unknown";
  httpMethods: string[];
  tablesUsed: string[];
  externalApis: string[];
  featureFlagDeps: string[];
  sharedImports: string[];
}

export interface FunctionIndex {
  functions: Record<string, EdgeFunctionEntry>;
  count: number;
  sharedModules: string[];
}

export interface PageEntry {
  name: string;
  path: string;
  route: string;
  isLazy: boolean;
  isProtected: boolean;
  isPaidMember: boolean;
  supabaseQueries: string[];
  edgeFunctionCalls: string[];
  featureFlagDeps: string[];
  imports: string[];
}

export interface PageIndex {
  pages: Record<string, PageEntry>;
  routes: Record<string, string>;
  count: number;
}

export interface CephasEntry {
  path: string;
  title: string;
  date?: string;
  section: string;
  tags: string[];
  initiative?: string;
  initiativeNumber?: number;
  recipient?: string;
  letterType?: string;
  description?: string;
  wordCount: number;
}

export interface CephasIndex {
  entries: Record<string, CephasEntry>;
  sections: Record<string, number>;
  count: number;
}

export interface SessionEntry {
  id: string;
  date?: string;
  summary: string;
  filesChanged: string[];
  migrationsCreated: string[];
  functionsCreated: string[];
  pagesCreated: string[];
  pendingWork: string[];
}

export interface ContextIndex {
  sessions: SessionEntry[];
  canonicalNumbers: Record<string, string | number>;
  pendingWork: string[];
  deployState: {
    lastDeploy?: string;
    pendingMigrations: string[];
    buildCommands: Record<string, string>;
  };
  rules: Record<string, string>;
}

export interface BishopChatEntry {
  filename: string;
  path: string;
  sessionId: string;
  date?: string;
  summary: string;
  keyDecisions: string[];
  topicsDiscussed: string[];
  wordCount: number;
}

export interface BishopIndex {
  chats: Record<string, BishopChatEntry>;
  count: number;
  totalWords: number;
}

export interface DomainEntry {
  name: string;
  tables: string[];
  edgeFunctions: string[];
  pages: string[];
  featureFlags: string[];
  cephasSections: string[];
  migrations: string[];
}

export interface DomainIndex {
  domains: Record<string, DomainEntry>;
  count: number;
}

export interface InitiativeEntry {
  name: string;
  number: number;
  crownHolder?: string;
  tables: string[];
  pages: string[];
  letters: string[];
  edgeFunctions: string[];
  status: string;
}

export interface SystemOverview {
  innovationCount: number;
  crownJewelCount: number;
  formalClaimsCount: number;
  provisionalApps: number;
  initiativeCount: number;
  tableCount: number;
  edgeFunctionCount: number;
  pageCount: number;
  cephasPageCount: number;
  migrationCount: number;
  membershipCost: string;
  creatorKeeps: string;
  platformMargin: string;
  conceptCount: number;
  dropzoneCount: number;
  transcriptCount: number;
  componentCount: number;
  bishopChatCount: number;
  lastSession?: string;
  pendingWork: string[];
  timestamp: string;
}

export interface ConceptEntry {
  slug: string;
  title: string;
  section: string;
  category?: string;
  description?: string;
  tags: string[];
  keywords: string[];
  summary: string;
  filePath: string;
  wordCount: number;
  relatedConcepts: string[];
  status?: string;
  ipLedgerEntry?: string;
}

export interface ConceptsIndex {
  concepts: Record<string, ConceptEntry>;
  byKeyword: Record<string, string[]>;
  byCategory: Record<string, string[]>;
  count: number;
  totalWords: number;
}

export interface DropzoneEntry {
  filename: string;
  path: string;
  agent: "KNIGHT" | "BISHOP" | "ROOK" | "PAWN";
  sessionId?: string;
  title: string;
  summary: string;
  tags: string[];
  wordCount: number;
}

export interface DropzoneIndex {
  entries: Record<string, DropzoneEntry>;
  byAgent: Record<string, string[]>;
  count: number;
  totalWords: number;
}

export interface TranscriptEntry {
  id: string;
  path: string;
  messageCount: number;
  userMessages: number;
  assistantMessages: number;
  summary: string;
  topicsDiscussed: string[];
  toolsUsed: string[];
  filesModified: string[];
  estimatedDate?: string;
}

export interface TranscriptIndex {
  transcripts: Record<string, TranscriptEntry>;
  count: number;
  totalMessages: number;
}

export interface ComponentEntry {
  name: string;
  path: string;
  type: "component" | "hook" | "lib";
  exports: string[];
  imports: string[];
  supabaseQueries: string[];
  propsInterface?: string;
  wordCount: number;
}

export interface ComponentIndex {
  components: Record<string, ComponentEntry>;
  hooks: Record<string, ComponentEntry>;
  libs: Record<string, ComponentEntry>;
  count: number;
}

export interface ArchitecturalRule {
  id: string;
  rule: string;
  source: string;
  severity: "critical" | "important" | "guideline";
}

export interface BriefingPackage {
  task: string;
  matchedDomains: {
    name: string;
    tables: string[];
    functions: { name: string; purpose: string }[];
    pages: { name: string; route: string }[];
    featureFlags: string[];
  }[];
  relevantConcepts: { title: string; slug: string; summary: string }[];
  applicableRules: { id: string; rule: string; severity: string }[];
  pastWork: { source: string; id: string; summary: string }[];
  canonicalReminders: Record<string, string | number>;
  wordCount: number;
}

export interface ChecklistResult {
  task: string;
  consistencyStatus: "CONSISTENT" | "VIOLATIONS FOUND";
  violations: { rule: string; issue: string }[];
  warnings: { rule: string; issue: string }[];
  prerequisites: string[];
  relatedSessions: { id: string; summary: string }[];
  reminders: string[];
}

export interface DebriefResult {
  sessionId: string;
  summary: string;
  logged: boolean;
  consistencyCheck: string;
  syncReminders: string[];
  handoffNotes: string[];
}

export interface FullIndex {
  overview: SystemOverview;
  schemas: SchemaIndex;
  functions: FunctionIndex;
  pages: PageIndex;
  cephas: CephasIndex;
  context: ContextIndex;
  bishop: BishopIndex;
  domains: DomainIndex;
  concepts: ConceptsIndex;
}
