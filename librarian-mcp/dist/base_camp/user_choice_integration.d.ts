export declare const BASE_CAMP_DIR: string;
export declare const USER_CHOICE_PATH: string;
export interface UserChoiceScope {
    /** Canonical path categories the member has enabled (from default integration set) */
    enabled_categories: string[];
    /** Canonical path categories the member has opted OUT of */
    disabled_categories: string[];
    /** Custom folder paths the member added */
    custom_paths: string[];
    /** Whether member has opted into Federation Library content */
    federation_library_enabled: boolean;
    /** Timestamp of last scope update */
    last_updated: string;
    /** Scope version (incremented on each update) */
    version: number;
}
export type IntegrationCategory = "project_memory" | "canonical_eblets" | "bishop_state" | "scribe_registry_metadata" | "canonical_values" | "cephas_content" | "bishop_dropzone" | "knight_dropzone";
export declare const ALL_CATEGORIES: IntegrationCategory[];
/** Default scope: all canonical categories enabled; Federation Library opt-out */
export declare const DEFAULT_SCOPE: UserChoiceScope;
export declare function loadUserChoiceScope(): UserChoiceScope;
export declare function saveUserChoiceScope(scope: UserChoiceScope): void;
/** Enable a canonical category (opt-in) */
export declare function enableCategory(scope: UserChoiceScope, category: IntegrationCategory): UserChoiceScope;
/** Disable a canonical category (opt-out per sovereignty discipline) */
export declare function disableCategory(scope: UserChoiceScope, category: IntegrationCategory): UserChoiceScope;
/** Add a custom folder path to the scope */
export declare function addCustomPath(scope: UserChoiceScope, path: string): UserChoiceScope;
/** Remove a custom folder path from the scope */
export declare function removeCustomPath(scope: UserChoiceScope, path: string): UserChoiceScope;
/** Enable Federation Library content in scope */
export declare function enableFederationLibrary(scope: UserChoiceScope): UserChoiceScope;
export declare function describeScopeForDisplay(scope: UserChoiceScope): string;
