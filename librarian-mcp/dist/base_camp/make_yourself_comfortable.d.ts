import { loadUserChoiceScope, saveUserChoiceScope, DEFAULT_SCOPE, ALL_CATEGORIES, type UserChoiceScope, type IntegrationCategory } from "./user_choice_integration.js";
export type { UserChoiceScope, IntegrationCategory };
export { DEFAULT_SCOPE, ALL_CATEGORIES, loadUserChoiceScope, saveUserChoiceScope };
export type ShadowId = "alpha" | "beta" | "gamma" | "delta" | "epsilon" | "zeta" | "eta" | "theta";
export interface ShadowTask {
    id: ShadowId;
    categories: string[];
    description: string;
}
export declare const SHADOW_TASKS: ShadowTask[];
export interface MakeComfortableOptions {
    /** "default" = default integration set; "minimal" = canonical_values only */
    scope?: "default" | "minimal" | "custom";
    /** Custom scope when scope="custom" */
    customScope?: UserChoiceScope;
    /** Dry-run: report what would be indexed without writing */
    dryRun?: boolean;
    /** Run shadows sequentially (for testing; default parallel) */
    sequential?: boolean;
    /** Skip Phase-0 hit-ratio measurement (faster; for CI) */
    skipMeasurement?: boolean;
    /** Override canonical file count target for completeness % */
    canonicalFileCountTarget?: number;
}
export declare function runMakeYourselfComfortable(options?: MakeComfortableOptions): Promise<{
    receipt: import("./completeness_receipt.js").MakeComfortableReceipt;
    shadowResults: import("./pheromone_bulk_loader.js").BulkLoadResult[];
    userScope: UserChoiceScope;
}>;
