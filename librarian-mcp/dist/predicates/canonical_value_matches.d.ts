export interface StaleFindings {
    key: string;
    expected: string;
    found: string;
    line_number: number;
    context: string;
}
export interface UnverifiedClaim {
    key: string;
    context: string;
}
export interface PredicateResult {
    passed: boolean;
    document_path: string;
    stale_findings: StaleFindings[];
    unverified_claims: UnverifiedClaim[];
    values_checked: number;
    values_confirmed: number;
}
export interface CanonicalValues {
    [section: string]: Record<string, string | number | boolean>;
}
export declare function loadCanonicalValues(): CanonicalValues;
export declare function loadCanonicalFlat(): Record<string, string | number>;
export declare function canonicalValueMatches(documentPath: string, expectedValues?: Partial<Record<string, string | number>>): Promise<PredicateResult>;
