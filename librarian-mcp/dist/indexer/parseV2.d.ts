import type { V2MigrationIndex, DomainIndex } from "../types.js";
export declare function parseV2(workspaceRoot: string, v1Domains?: DomainIndex): Promise<V2MigrationIndex>;
