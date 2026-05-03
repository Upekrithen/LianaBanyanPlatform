/**
 * Response budget enforcement for MoneyPenny routing layer.
 * Controls output size to minimize AI context window consumption.
 */
export declare const BUDGETS: {
    readonly briefMe: 800;
    readonly checklist: 400;
    readonly debrief: 250;
    readonly listDefault: 20;
    readonly searchDefault: 15;
    readonly architectureBrief: 150;
};
export declare function countWords(text: string): number;
export declare function truncateToWords(text: string, maxWords: number): string;
export declare function truncateList<T>(items: T[], max: number, formatter: (item: T) => string): string;
export declare function budgetEnforce(text: string, maxWords: number): string;
export declare function compactTable(name: string, columnCount: number): string;
export declare function compactFunction(name: string, purpose: string): string;
export declare function compactPage(name: string, route: string): string;
export declare function compactConcept(title: string, summary: string): string;
