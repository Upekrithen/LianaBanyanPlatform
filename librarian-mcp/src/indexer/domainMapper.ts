import type {
  SchemaIndex, FunctionIndex, PageIndex, CephasIndex, DomainIndex, DomainEntry,
} from "../types.js";

const DOMAIN_PATTERNS: Record<string, {
  tablePatterns: RegExp[];
  functionPatterns: RegExp[];
  pagePatterns: RegExp[];
  cephasPatterns: RegExp[];
}> = {
  lb_card: {
    tablePatterns: [/^lb_card/, /^transaction_ledger/],
    functionPatterns: [/lb[-_]card|fund[-_]lb|create[-_]lb|get[-_]lb|update[-_]lb/],
    pagePatterns: [/LBCard|WarChest/i],
    cephasPatterns: [/card|financial/i],
  },
  connect_payouts: {
    tablePatterns: [/^member_connect/, /^member_payouts/],
    functionPatterns: [/connect|payout|request[-_]payout/],
    pagePatterns: [/Payout/i],
    cephasPatterns: [/payout/i],
  },
  membership: {
    tablePatterns: [/^member/, /membership/],
    functionPatterns: [/membership|confirm[-_]member|deactivate[-_]expired|red[-_]carpet/],
    pagePatterns: [/Member|MembershipGate|RedCarpet|FirstSteps|Join/i],
    cephasPatterns: [/member/i],
  },
  housing: {
    tablePatterns: [/^housing/],
    functionPatterns: [/housing/],
    pagePatterns: [/Housing|VacationNetwork|WaterWheel/i],
    cephasPatterns: [/housing/i],
  },
  ghost_world: {
    tablePatterns: [/^ghost_world|^gw_/],
    functionPatterns: [/ghost/],
    pagePatterns: [/GhostWorld|GhostWorldMall/i],
    cephasPatterns: [/ghost/i],
  },
  hex_isle: {
    tablePatterns: [/^hex_isle|^hexisle|^hex_island/],
    functionPatterns: [/hex[-_]isle|hexisle/],
    pagePatterns: [/HexIsle/i],
    cephasPatterns: [/hexisle|hex.isle/i],
  },
  treasure_map: {
    tablePatterns: [/^treasure_map/],
    functionPatterns: [/treasure/],
    pagePatterns: [/TreasureMap/i],
    cephasPatterns: [/treasure/i],
  },
  crew: {
    tablePatterns: [/^crew/],
    functionPatterns: [/crew/],
    pagePatterns: [/Crew/i],
    cephasPatterns: [/crew/i],
  },
  guild: {
    tablePatterns: [/^guild/],
    functionPatterns: [/guild/],
    pagePatterns: [/Guild/i],
    cephasPatterns: [/guild/i],
  },
  family: {
    tablePatterns: [/^family/],
    functionPatterns: [/family/],
    pagePatterns: [/Family/i],
    cephasPatterns: [/family/i],
  },
  calendar: {
    tablePatterns: [/^calendar/],
    functionPatterns: [/calendar/],
    pagePatterns: [/Calendar/i],
    cephasPatterns: [/calendar/i],
  },
  storefront: {
    tablePatterns: [/^storefront|^store_/],
    functionPatterns: [/store|printful|aggregate[-_]orders/],
    pagePatterns: [/Storefront|Emporium|StorefrontBuilder/i],
    cephasPatterns: [/store|emporium/i],
  },
  social_media: {
    tablePatterns: [/^social_/],
    functionPatterns: [/social|medium[-_]publish|moneypenny[-_]auto/],
    pagePatterns: [/Social|MoneyPenny/i],
    cephasPatterns: [/social/i],
  },
  political: {
    tablePatterns: [/^congress|^political|^bill_/],
    functionPatterns: [/congress|political/],
    pagePatterns: [/Political|PowerToThePeople|Coalitions/i],
    cephasPatterns: [/politic|congress|of.the.people/i],
  },
  innovation: {
    tablePatterns: [/^innovation/],
    functionPatterns: [/innovation|patent|medallion/],
    pagePatterns: [/Innovation|IP|Medallion|Patent/i],
    cephasPatterns: [/innovation|patent|crown.jewel/i],
  },
  onboarding: {
    tablePatterns: [/^onboarding|^red_carpet/],
    functionPatterns: [/onboarding|red[-_]carpet|welcome/],
    pagePatterns: [/Onboarding|RedCarpet|Welcome|GuidedDiscovery/i],
    cephasPatterns: [/onboarding|welcome/i],
  },
  financial: {
    tablePatterns: [/^transaction|^financial|^mercury|^revenue/],
    functionPatterns: [/transparency|mercury|revenue|checkout|credit|withdrawal/],
    pagePatterns: [/Financial|Transparency|Ledger|Dashboard/i],
    cephasPatterns: [/financial|economic/i],
  },
  beacon: {
    tablePatterns: [/^beacon|^member_beacon/],
    functionPatterns: [/beacon/],
    pagePatterns: [/Beacon|Wildfire/i],
    cephasPatterns: [/beacon/i],
  },
  adapt: {
    tablePatterns: [/^adapt|^bounties|^coverage_minutes/],
    functionPatterns: [/adapt|bounty|coverage/],
    pagePatterns: [/Adapt|Bounty/i],
    cephasPatterns: [/adapt/i],
  },
  vehicle: {
    tablePatterns: [/^vehicle|^rideshare/],
    functionPatterns: [/vehicle|rideshare/],
    pagePatterns: [/Vehicle|Rideshare|LocalWheels|LemonLot/i],
    cephasPatterns: [/vehicle|rideshare/i],
  },
  design_battle: {
    tablePatterns: [/^design_battle|^design_pipeline/],
    functionPatterns: [/design/],
    pagePatterns: [/DesignBattle|Pipeline/i],
    cephasPatterns: [/design/i],
  },
  notifications: {
    tablePatterns: [/^notification/],
    functionPatterns: [/notify|notification|admin[-_]notify/],
    pagePatterns: [/Notification/i],
    cephasPatterns: [/notification/i],
  },
};

export function buildDomainIndex(
  schemas: SchemaIndex,
  functions: FunctionIndex,
  pages: PageIndex,
  cephas: CephasIndex,
): DomainIndex {
  const domains: Record<string, DomainEntry> = {};

  for (const [domainName, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    const entry: DomainEntry = {
      name: domainName,
      tables: [],
      edgeFunctions: [],
      pages: [],
      featureFlags: [],
      cephasSections: [],
      migrations: [],
    };

    for (const tableName of Object.keys(schemas.tables)) {
      if (patterns.tablePatterns.some(p => p.test(tableName))) {
        entry.tables.push(tableName);
        const table = schemas.tables[tableName];
        if (!entry.migrations.includes(table.originMigration)) {
          entry.migrations.push(table.originMigration);
        }
      }
    }

    for (const funcName of Object.keys(functions.functions)) {
      if (patterns.functionPatterns.some(p => p.test(funcName))) {
        entry.edgeFunctions.push(funcName);
      }
    }

    for (const pageName of Object.keys(pages.pages)) {
      if (patterns.pagePatterns.some(p => p.test(pageName))) {
        entry.pages.push(pageName);
      }
    }

    for (const cephasPath of Object.keys(cephas.entries)) {
      if (patterns.cephasPatterns.some(p => p.test(cephasPath))) {
        entry.cephasSections.push(cephasPath);
      }
    }

    for (const [flagName] of Object.entries(schemas.featureFlags)) {
      const flagLower = flagName.toLowerCase();
      if (patterns.tablePatterns.some(p => p.test(flagLower)) ||
          patterns.functionPatterns.some(p => p.test(flagLower))) {
        entry.featureFlags.push(flagName);
      }
    }

    if (entry.tables.length || entry.edgeFunctions.length || entry.pages.length) {
      domains[domainName] = entry;
    }
  }

  return {
    domains,
    count: Object.keys(domains).length,
  };
}
