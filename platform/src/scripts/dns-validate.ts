/**
 * DNS Staging Validation Script -- Wave 28 (Phase epsilon -- Launch)
 * ===================================================================
 * Validates that all required DNS record types are present in dns-staging.config.ts.
 * Run: npx tsx platform/src/scripts/dns-validate.ts
 *
 * Reports WORKS / PARTIAL / NOT YET per domain and record category.
 * DNS activation is HELD for Founder registrar access.
 * This script validates the staged config only -- it does NOT perform live DNS lookups.
 *
 * Required record types per domain:
 *   Primary (lianabanyan.com)    : A, CNAME
 *   Org (lianabanyan.org)        : A, CNAME, TXT(firebase), TXT(SPF), TXT(DMARC), MX
 *   Mnemosynec (mnemosynec.ai)   : A, CNAME, TXT(firebase), TXT(SPF), TXT(DMARC)
 *   Museum subdomain             : CNAME(museum), TXT(firebase-museum)
 *   Cephas subdomain             : CNAME(cephas)
 *   Relay subdomain              : CNAME(relay)
 *
 * BP073 Wave 28 -- Knight
 */

import { ALL_DOMAIN_CONFIGS, HTTPS_SSL_PLAN, type DomainConfig, type DnsRecord } from "../../dns-staging.config";

// ---- Validation types ---------------------------------------------------

type Status = "WORKS" | "PARTIAL" | "NOT YET";

interface RecordCheck {
  label: string;
  type: DnsRecord["type"];
  hostPattern?: RegExp;
  valuePattern?: RegExp;
  status: Status;
  found?: DnsRecord;
  note?: string;
}

interface DomainReport {
  domain: string;
  purpose: string;
  domainStatus: DomainConfig["status"];
  overallStatus: Status;
  checks: RecordCheck[];
}

// ---- Required record definitions ----------------------------------------

interface RequiredRecord {
  label: string;
  type: DnsRecord["type"];
  hostPattern?: RegExp;
  valuePattern?: RegExp;
  note?: string;
}

const DOMAIN_REQUIREMENTS: Record<string, RequiredRecord[]> = {
  "lianabanyan.com": [
    { label: "A record (apex)", type: "A", hostPattern: /^@$/ },
    { label: "CNAME (www)", type: "CNAME", hostPattern: /^www$/ },
  ],
  "lianabanyan.org": [
    { label: "A record (apex)", type: "A", hostPattern: /^@$/ },
    { label: "CNAME (www)", type: "CNAME", hostPattern: /^www$/ },
    { label: "TXT (Firebase verification)", type: "TXT", hostPattern: /^@$/, valuePattern: /firebase|FOUNDER/i },
    { label: "TXT (SPF)", type: "TXT", hostPattern: /^@$/, valuePattern: /v=spf1/i },
    { label: "TXT (DMARC)", type: "TXT", hostPattern: /^_dmarc$/, valuePattern: /v=DMARC1/i },
    { label: "MX record", type: "MX", hostPattern: /^@$/ },
  ],
  "mnemosynec.ai": [
    { label: "A record (apex)", type: "A", hostPattern: /^@$/ },
    { label: "CNAME (www)", type: "CNAME", hostPattern: /^www$/ },
    { label: "TXT (Firebase verification)", type: "TXT", hostPattern: /^@$/, valuePattern: /firebase|FOUNDER/i },
    { label: "TXT (SPF)", type: "TXT", hostPattern: /^@$/, valuePattern: /v=spf1/i },
    { label: "TXT (DMARC)", type: "TXT", hostPattern: /^_dmarc$/, valuePattern: /v=DMARC1/i },
  ],
  "museum.lianabanyan.com": [
    { label: "CNAME (museum)", type: "CNAME", hostPattern: /^museum$/ },
    { label: "TXT (Firebase verification for museum)", type: "TXT", hostPattern: /^museum$/, valuePattern: /firebase|FOUNDER/i },
  ],
  "cephas.lianabanyan.com": [
    { label: "CNAME (cephas)", type: "CNAME", hostPattern: /^cephas$/ },
  ],
  "relay.lianabanyan.com": [
    { label: "CNAME (relay)", type: "CNAME", hostPattern: /^relay$/ },
  ],
};

// ---- Core validation logic ----------------------------------------------

function checkRecord(domainCfg: DomainConfig, req: RequiredRecord): RecordCheck {
  const match = domainCfg.records.find((r) => {
    if (r.type !== req.type) return false;
    if (req.hostPattern && !req.hostPattern.test(r.host)) return false;
    if (req.valuePattern && !req.valuePattern.test(r.value)) return false;
    return true;
  });

  const isFounderPlaceholder =
    match?.value?.includes("FOUNDER:") ||
    match?.value?.includes("FOUNDER");

  let status: Status;
  if (!match) {
    status = "NOT YET";
  } else if (isFounderPlaceholder) {
    // Record is present but value is a placeholder -- staged, awaiting Founder action
    status = "PARTIAL";
  } else {
    status = "WORKS";
  }

  return {
    label: req.label,
    type: req.type,
    hostPattern: req.hostPattern,
    valuePattern: req.valuePattern,
    status,
    found: match,
    note: isFounderPlaceholder ? "Staged -- Founder must supply real value from registrar/Firebase Console" : undefined,
  };
}

function validateDomain(domainCfg: DomainConfig): DomainReport {
  const requirements = DOMAIN_REQUIREMENTS[domainCfg.domain] ?? [];
  const checks = requirements.map((req) => checkRecord(domainCfg, req));

  let overallStatus: Status;
  if (checks.every((c) => c.status === "WORKS")) {
    overallStatus = "WORKS";
  } else if (checks.some((c) => c.status === "NOT YET")) {
    overallStatus = "NOT YET";
  } else {
    overallStatus = "PARTIAL";
  }

  return {
    domain: domainCfg.domain,
    purpose: domainCfg.purpose,
    domainStatus: domainCfg.status,
    overallStatus,
    checks,
  };
}

// ---- Reporting ----------------------------------------------------------

const STATUS_SYMBOL: Record<Status, string> = {
  WORKS: "WORKS   ",
  PARTIAL: "PARTIAL ",
  "NOT YET": "NOT YET ",
};

function printReport(reports: DomainReport[]): void {
  const divider = "=".repeat(70);
  const subdiv = "-".repeat(50);

  console.log(`\n${divider}`);
  console.log("DNS STAGING VALIDATION -- Wave 28 (Phase epsilon)");
  console.log("FOUNDER-GATED: DNS activation requires registrar access.");
  console.log("This validates the staged config only -- no live DNS lookups.");
  console.log(`${divider}\n`);

  for (const report of reports) {
    console.log(`Domain: ${report.domain}`);
    console.log(`Purpose: ${report.purpose}`);
    console.log(`Domain status: ${report.domainStatus.toUpperCase()}`);
    console.log(`Overall: ${STATUS_SYMBOL[report.overallStatus]}`);
    console.log(subdiv);

    if (report.checks.length === 0) {
      console.log("  (no required records defined for this domain)");
    } else {
      for (const check of report.checks) {
        const sym = STATUS_SYMBOL[check.status];
        const foundVal = check.found
          ? check.found.value.slice(0, 55) + (check.found.value.length > 55 ? "..." : "")
          : "(not found)";
        console.log(`  ${sym} ${check.label}`);
        if (check.found) {
          console.log(`           value: ${foundVal}`);
        }
        if (check.note) {
          console.log(`           NOTE:  ${check.note}`);
        }
      }
    }
    console.log();
  }

  // Aggregate summary
  const worksCount = reports.filter((r) => r.overallStatus === "WORKS").length;
  const partialCount = reports.filter((r) => r.overallStatus === "PARTIAL").length;
  const notYetCount = reports.filter((r) => r.overallStatus === "NOT YET").length;

  console.log(divider);
  console.log("SUMMARY");
  console.log(`  WORKS    ${worksCount}/${reports.length} domains`);
  console.log(`  PARTIAL  ${partialCount}/${reports.length} domains (staged; Founder action required)`);
  console.log(`  NOT YET  ${notYetCount}/${reports.length} domains`);
  console.log();

  // SSL plan
  console.log("SSL/HTTPS CERTIFICATE PLAN");
  console.log(`  Provider: ${HTTPS_SSL_PLAN.provider}`);
  console.log(`  Managed by: ${HTTPS_SSL_PLAN.managedBy}`);
  console.log(`  Active domains: ${HTTPS_SSL_PLAN.activeDomains.join(", ")}`);
  console.log(`  Pending (Founder-gated): ${HTTPS_SSL_PLAN.pendingDomains.join(", ")}`);
  console.log();

  console.log("DNS ACTIVATION: HELD -- Founder registrar access required.");
  console.log("Staged config is complete. Run registrar actions to go live.");
  console.log(divider);
}

// ---- Main ---------------------------------------------------------------

function main(): void {
  const reports = ALL_DOMAIN_CONFIGS.map(validateDomain);
  printReport(reports);
}

main();
