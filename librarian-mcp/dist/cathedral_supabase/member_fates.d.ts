import type { SupabaseClient } from "@supabase/supabase-js";
import { type MemberScribeRow } from "./client.js";
export interface MemberFatesDispatch {
    scribe_id: string;
    scribe_name: string;
    directive: string;
    suggested_observation: string;
    score: number;
    primary_matches: string[];
    adjacent_matches: string[];
}
export interface MemberFatesResult {
    ok: true;
    member_id: string;
    session_id: string | null;
    content_hash: string;
    themes: string[];
    named_entities: string[];
    scores: Record<string, number>;
    dispatches: MemberFatesDispatch[];
    coverage_gaps: string[];
    triple_witness_met: boolean;
    fates_log_id: string | null;
    elapsed_ms: number;
}
export interface MemberFatesError {
    ok: false;
    error: string;
    hint?: string;
}
export interface MemberFatesInput {
    member_id: string;
    session_id?: string;
    content: string;
    dispatch_cap?: number;
    /** If true (default), persist a row to cathedral.fates_log. */
    persist?: boolean;
    /** Test seam: inject a stubbed Supabase client. */
    client?: SupabaseClient;
}
interface ClothoOutput {
    themes: string[];
    entities: string[];
}
/**
 * Member-scoped Clotho. Identical entity regexes to K436's clothoExtract
 * but pulls keyword candidates from the member's own active Scribes
 * instead of the global stitchpunks registry.
 */
export declare function clothoExtractForMember(text: string, scribes: MemberScribeRow[]): ClothoOutput;
export declare function memberFatesRoute(input: MemberFatesInput): Promise<MemberFatesResult | MemberFatesError>;
export {};
