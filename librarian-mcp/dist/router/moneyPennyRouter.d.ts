/**
 * MoneyPenny Smart Router -- the intelligence layer of the Librarian.
 * Converts a natural-language task description into a compact, budget-capped
 * context package that orients an AI agent in 1 tool call instead of 5-6.
 */
import type { SchemaIndex, FunctionIndex, PageIndex, ContextIndex, DomainIndex, ConceptsIndex, DropzoneIndex, TranscriptIndex, SystemOverview, ArchitecturalRule, BriefingPackage, ChecklistResult, DebriefResult } from "../types.js";
export declare function extractKeywords(task: string): string[];
interface ScoredDomain {
    name: string;
    score: number;
}
export declare function scoreDomains(keywords: string[], domains: DomainIndex): ScoredDomain[];
export declare function buildBriefing(task: string, overview: SystemOverview | null, schemas: SchemaIndex | null, functions: FunctionIndex | null, pages: PageIndex | null, concepts: ConceptsIndex | null, domains: DomainIndex | null, context: ContextIndex | null, dropzones: DropzoneIndex | null, transcripts: TranscriptIndex | null, rules: ArchitecturalRule[]): BriefingPackage;
export declare function buildChecklist(task: string, schemas: SchemaIndex | null, functions: FunctionIndex | null, context: ContextIndex | null, concepts: ConceptsIndex | null, domains: DomainIndex | null, dropzones: DropzoneIndex | null, rules: ArchitecturalRule[]): ChecklistResult;
export declare function buildDebrief(sessionId: string, summary: string, filesChanged: string[], migrationsCreated: string[], functionsCreated: string[], pagesCreated: string[], pendingWork: string[], indexDir: string, overview: SystemOverview | null, rules: ArchitecturalRule[]): DebriefResult;
export {};
