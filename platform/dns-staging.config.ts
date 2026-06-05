/**
 * DNS + Domains Staging Config -- BP073 Wave 28 (Phase epsilon -- Launch)
 * ========================================================================
 * FOUNDER-GATED: Registrar access required to apply these records.
 * Stage the config here; Founder runs the registrar actions.
 *
 * Domains:
 *   1. lianabanyan.com (primary -- already live on Firebase)
 *   2. lianabanyan.org (museum / cephas redirect -- registrar needed)
 *   3. mnemosynec.ai (Mnemosyne landing -- registrar needed)
 *   4. cephas.lianabanyan.com (Hugo static site -- already live)
 *   5. museum.lianabanyan.com (frozen snapshot -- Wave 28 addition)
 *   6. relay.lianabanyan.com (federation relay -- staged)
 *
 * All redirects use permanent 301 (SEO-clean).
 * Canonical is always https://lianabanyan.com unless otherwise noted.
 *
 * FOUNDER ACTION ITEMS (cannot execute without registrar access):
 *   1. Register lianabanyan.org and mnemosynec.ai if not yet owned
 *   2. Apply the DNS records below via the registrar console
 *   3. Add both domains to Firebase Hosting as custom domains
 *   4. Verify via Firebase Console (DNS verification token required)
 *   5. For museum.lianabanyan.com: get CNAME/TXT from Firebase Console
 *      when adding custom domain to lianabanyan-museum-frozen site
 *
 * Wave 28 additions:
 *   - museum.lianabanyan.com CNAME + TXT verification
 *   - SPF TXT record for lianabanyan.org
 *   - DMARC TXT record for lianabanyan.org
 *   - MX records for lianabanyan.org
 *   - SPF + DMARC for mnemosynec.ai
 *
 * Reference: MUSEUM_DNS_PREP_BP071.md, FIREBASE_5_DOMAINS_VERIFY_RECEIPT_BP045_W1.md
 */

export interface DnsRecord {
  type: "A" | "CNAME" | "TXT" | "MX" | "AAAA";
  host: string;       // @, www, subdomain, or FQDN
  value: string;
  ttl?: number;       // seconds; default 3600
  note?: string;
}

export interface DomainConfig {
  domain: string;
  purpose: string;
  status: "live" | "staged" | "pending-registrar";
  primaryRedirectTo?: string;  // if this domain 301-redirects to another
  records: DnsRecord[];
  firebaseHosting?: boolean;
  founderAction?: string;
}

// ── lianabanyan.com -- primary (already live) ─────────────────────────────────

const primaryDomain: DomainConfig = {
  domain: "lianabanyan.com",
  purpose: "Primary cooperative platform",
  status: "live",
  firebaseHosting: true,
  records: [
    // Firebase Hosting -- already configured
    { type: "A", host: "@", value: "151.101.1.195", note: "Firebase Hosting (verify current IP in Firebase Console)" },
    { type: "A", host: "@", value: "151.101.65.195", note: "Firebase Hosting secondary" },
    { type: "CNAME", host: "www", value: "lianabanyan.com.", note: "www -> apex" },
    // Supabase auth callback (required for OAuth providers)
    { type: "CNAME", host: "auth", value: "lianabanyan.supabase.co", note: "Supabase auth subdomain" },
  ],
};

// ── lianabanyan.org -- museum / cephas redirect ───────────────────────────────

const orgDomain: DomainConfig = {
  domain: "lianabanyan.org",
  purpose: "Museum and Cephas -- redirects to lianabanyan.com/museum",
  status: "pending-registrar",
  primaryRedirectTo: "https://lianabanyan.com/museum",
  founderAction:
    "FOUNDER: Register lianabanyan.org if not yet owned. " +
    "Add to Firebase Hosting as a custom domain with redirect rule. " +
    "Apply these DNS records at the registrar.",
  records: [
    {
      type: "A",
      host: "@",
      value: "151.101.1.195",
      note: "Firebase Hosting -- serves the redirect rule (lianabanyan.org -> /museum)",
    },
    { type: "A", host: "@", value: "151.101.65.195" },
    { type: "CNAME", host: "www", value: "lianabanyan.org.", note: "www -> apex" },
    // Firebase TXT verification (value obtained from Firebase Console when adding domain)
    {
      type: "TXT",
      host: "@",
      value: "FOUNDER: paste Firebase verification token here",
      note: "Firebase domain ownership verification",
    },
    // SPF -- Wave 28 addition
    {
      type: "TXT",
      host: "@",
      value: "v=spf1 include:_spf.google.com include:amazonses.com ~all",
      note: "SPF record -- prevents email spoofing from lianabanyan.org",
      ttl: 3600,
    },
    // DMARC -- Wave 28 addition
    {
      type: "TXT",
      host: "_dmarc",
      value: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@lianabanyan.com; ruf=mailto:dmarc-reports@lianabanyan.com; fo=1",
      note: "DMARC policy -- quarantine failing messages; aggregate reports to lianabanyan.com inbox",
      ttl: 3600,
    },
    // MX -- Wave 28 addition (Google Workspace / placeholder -- Founder sets real MX)
    {
      type: "MX",
      host: "@",
      value: "ASPMX.L.GOOGLE.COM",
      ttl: 3600,
      note: "MX priority 1 -- FOUNDER: replace with actual mail provider MX records",
    },
    {
      type: "MX",
      host: "@",
      value: "ALT1.ASPMX.L.GOOGLE.COM",
      ttl: 3600,
      note: "MX priority 5 -- placeholder; Founder confirms mail provider",
    },
  ],
  firebaseHosting: true,
};

// ── mnemosynec.ai -- Mnemosyne landing ───────────────────────────────────────

const mnemosyneDomain: DomainConfig = {
  domain: "mnemosynec.ai",
  purpose: "Mnemosyne desktop app landing page -- redirects to lianabanyan.com/mnemosyne",
  status: "pending-registrar",
  primaryRedirectTo: "https://lianabanyan.com/mnemosyne",
  founderAction:
    "FOUNDER: Register mnemosynec.ai if not yet owned. " +
    "The .ai TLD may require registrar-specific steps. " +
    "Add to Firebase Hosting and apply DNS records below.",
  records: [
    {
      type: "A",
      host: "@",
      value: "151.101.1.195",
      note: "Firebase Hosting -- serves the redirect rule (mnemosynec.ai -> /mnemosyne)",
    },
    { type: "A", host: "@", value: "151.101.65.195" },
    { type: "CNAME", host: "www", value: "mnemosynec.ai." },
    {
      type: "TXT",
      host: "@",
      value: "FOUNDER: paste Firebase verification token here",
      note: "Firebase domain ownership verification",
    },
    // SPF -- Wave 28 addition
    {
      type: "TXT",
      host: "@",
      value: "v=spf1 include:_spf.google.com include:amazonses.com ~all",
      note: "SPF record -- prevents email spoofing from mnemosynec.ai",
      ttl: 3600,
    },
    // DMARC -- Wave 28 addition
    {
      type: "TXT",
      host: "_dmarc",
      value: "v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@lianabanyan.com; fo=1",
      note: "DMARC policy -- quarantine failing messages",
      ttl: 3600,
    },
  ],
  firebaseHosting: true,
};

// ── museum.lianabanyan.com -- frozen snapshot (Wave 28) ───────────────────────

const museumSubdomain: DomainConfig = {
  domain: "museum.lianabanyan.com",
  purpose: "Frozen historical snapshot of the cooperative (read-only, no live platform features)",
  status: "pending-registrar",
  founderAction:
    "FOUNDER: In Firebase Console -> Hosting -> lianabanyan-museum-frozen -> Add custom domain -> " +
    "enter museum.lianabanyan.com. Firebase will generate a TXT verification token and a CNAME. " +
    "Copy both values. Then add them in Squarespace DNS (or your registrar) as shown below. " +
    "After DNS propagates, click Verify in Firebase Console to activate SSL.",
  records: [
    {
      type: "CNAME",
      host: "museum",
      value: "lianabanyan-museum-frozen.web.app.",
      note: "Firebase Hosting frozen site -- FOUNDER: confirm this CNAME in Firebase Console dialog",
      ttl: 3600,
    },
    {
      type: "TXT",
      host: "museum",
      value: "FOUNDER: paste Firebase verification token here (from Firebase Console custom domain dialog)",
      note: "Firebase domain ownership verification for museum subdomain",
      ttl: 3600,
    },
  ],
  firebaseHosting: true,
};

// ── cephas.lianabanyan.com -- Hugo static site (already live) ────────────────

const cephasSubdomain: DomainConfig = {
  domain: "cephas.lianabanyan.com",
  purpose: "Hugo static site -- Cephas public museum",
  status: "live",
  firebaseHosting: true,
  records: [
    { type: "CNAME", host: "cephas", value: "lianabanyan.com.", note: "Cephas -> primary (Firebase handles routing)" },
  ],
};

// ── Relay server (Firebase RTDB) ──────────────────────────────────────────────

const relaySubdomain: DomainConfig = {
  domain: "relay.lianabanyan.com",
  purpose: "Federation relay server (Firebase RTDB + Functions)",
  status: "staged",
  founderAction:
    "FOUNDER: Apply CNAME record below after Firebase Functions relay is deployed " +
    "(see relay-server/DEPLOY_FOUNDER.md).",
  records: [
    {
      type: "CNAME",
      host: "relay",
      value: "us-central1-liana-banyan.cloudfunctions.net.",
      note: "Firebase Functions relay endpoint",
    },
  ],
};

// ── All domain configs ────────────────────────────────────────────────────────

export const ALL_DOMAIN_CONFIGS: DomainConfig[] = [
  primaryDomain,
  orgDomain,
  mnemosyneDomain,
  museumSubdomain,
  cephasSubdomain,
  relaySubdomain,
];

// ── Firebase Hosting redirect rules (for firebase.json) ──────────────────────
// Add these to platform/firebase.json under "hosting.redirects" for each domain.

export const FIREBASE_REDIRECT_RULES = {
  "lianabanyan.org": {
    source: "/**",
    destination: "https://lianabanyan.com/museum",
    type: 301,
    note: "Wave 28: lianabanyan.org -> /museum (historical record)",
  },
  "mnemosynec.ai": {
    source: "/**",
    destination: "https://lianabanyan.com/mnemosyne",
    type: 301,
  },
};

/**
 * HTTPS/SSL Certificate Plan (Founder-gated)
 * ===========================================
 * Firebase Hosting automatically provisions and renews SSL certificates for
 * all custom domains via Let's Encrypt. No manual cert management required.
 *
 * Steps (all require Founder registrar + Firebase Console access):
 *   1. Add custom domain in Firebase Console (Hosting -> site -> Add custom domain)
 *   2. Firebase generates TXT verification record -- add it at registrar
 *   3. Firebase provisions SSL cert automatically after domain verification
 *   4. SSL renews automatically (Let's Encrypt, ~90-day cycle, Firebase-managed)
 *
 * Domains requiring SSL certs (all Founder-gated):
 *   - museum.lianabanyan.com  (pending Firebase Console action)
 *   - lianabanyan.org         (pending registrar + Firebase Console action)
 *   - mnemosynec.ai           (pending registrar + Firebase Console action)
 *   - relay.lianabanyan.com   (pending Firebase Functions deploy)
 *
 * lianabanyan.com and cephas.lianabanyan.com already have active SSL certs.
 */
export const HTTPS_SSL_PLAN = {
  status: "FOUNDER-GATED",
  provider: "Let's Encrypt via Firebase Hosting",
  managedBy: "Firebase (automatic renewal)",
  pendingDomains: [
    "museum.lianabanyan.com",
    "lianabanyan.org",
    "mnemosynec.ai",
    "relay.lianabanyan.com",
  ],
  activeDomains: ["lianabanyan.com", "cephas.lianabanyan.com"],
} as const;

/**
 * Print a human-readable DNS setup guide for the Founder.
 * FOUNDER: run `npx tsx platform/dns-staging.config.ts` to view.
 */
if (import.meta.url && typeof process !== "undefined") {
  // Running as a script
  for (const domain of ALL_DOMAIN_CONFIGS) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Domain: ${domain.domain}`);
    console.log(`Purpose: ${domain.purpose}`);
    console.log(`Status: ${domain.status.toUpperCase()}`);
    if (domain.founderAction) {
      console.log(`\nFOUNDER ACTION REQUIRED:\n  ${domain.founderAction}`);
    }
    if (domain.primaryRedirectTo) {
      console.log(`Redirects to: ${domain.primaryRedirectTo}`);
    }
    console.log(`\nDNS Records:`);
    for (const r of domain.records) {
      console.log(`  ${r.type.padEnd(5)} ${r.host.padEnd(10)} -> ${r.value}`);
      if (r.note) console.log(`         NOTE: ${r.note}`);
    }
  }
}
