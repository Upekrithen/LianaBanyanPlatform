#!/usr/bin/env node
/**
 * fetch-canonical.js — Pull platform_canonical from Supabase into Hugo data/
 *
 * Run before `hugo --minify`:
 *   node scripts/fetch-canonical.js && hugo --minify
 *
 * Writes: data/canonical.json
 * Hugo templates: {{ .Site.Data.canonical.innovation_count }}
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dXh6aWxnbXV3ZGRjb2ZxZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MjU3MTUsImV4cCI6MjA3OTAwMTcxNX0.b5cLd8_PphlA-MM0zAhe0-Qj5b4GbqReO6cT8tA0ngk';

const HARDCODED_DEFAULTS = {
  innovation_count: 1662,
  crown_jewels: 123,
  patent_applications: 7,
  patent_claims: 1336,
  domains: 14,
  initiatives: 16,
  membership_cost: 5,
  creator_keeps_pct: 83.3,
  platform_margin_pct: 20,
  spec_expanded: 653,
  portfolio_value_low: 9000000,
  portfolio_value_high: 80000000,
  personal_investment: 525000,
  investment_years: 9
};

function fetchFromSupabase() {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/platform_canonical?select=key,value,value_text`;
    const options = {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    };

    https.get(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Supabase returned ${res.statusCode}: ${body}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const outputFile = path.join(dataDir, 'canonical.json');

  let canonical = { ...HARDCODED_DEFAULTS };
  let source = 'hardcoded defaults';

  try {
    const rows = await fetchFromSupabase();
    if (Array.isArray(rows) && rows.length > 0) {
      for (const row of rows) {
        if (row.value != null) {
          canonical[row.key] = Number(row.value);
        } else if (row.value_text != null) {
          canonical[row.key] = row.value_text;
        }
      }
      source = `Supabase (${rows.length} rows)`;
    }
  } catch (err) {
    console.warn(`⚠ Could not reach Supabase, using defaults: ${err.message}`);
  }

  canonical.fetched_at = new Date().toISOString();
  canonical.source = source;

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(canonical, null, 2));
  console.log(`✓ canonical.json written (source: ${source})`);
}

main().catch((err) => {
  console.error('fetch-canonical failed:', err);
  process.exit(1);
});
