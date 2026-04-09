/**
 * REP-LOOKUP EDGE FUNCTION
 * ========================
 * Finds congressional representatives by address.
 * Strategy:
 *   1. Parse state (and zip) from freeform address
 *   2. Check rep_cache for members of that state
 *   3. If cache miss or stale, fetch from Congress.gov members API and cache
 *   4. Return matching reps
 *
 * Accepts: { address: string }
 * Returns: { reps: Rep[], source: 'cache' | 'congress_api' }
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STATE_ABBREVS: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI',
  wyoming: 'WY', 'district of columbia': 'DC',
};

const VALID_STATES = new Set(Object.values(STATE_ABBREVS));

function parseStateFromAddress(address: string): string | null {
  const upper = address.toUpperCase().trim();

  // Try 2-letter state code (common in "City, ST ZIP")
  const codeMatch = upper.match(/\b([A-Z]{2})\b\s*\d{5}/);
  if (codeMatch && VALID_STATES.has(codeMatch[1])) return codeMatch[1];

  // Try comma-delimited "City, ST"
  const commaMatch = upper.match(/,\s*([A-Z]{2})\b/);
  if (commaMatch && VALID_STATES.has(commaMatch[1])) return commaMatch[1];

  // Try full state name
  const lower = address.toLowerCase();
  for (const [name, abbrev] of Object.entries(STATE_ABBREVS)) {
    if (lower.includes(name)) return abbrev;
  }

  // Try standalone 2-letter code anywhere
  const anyCode = upper.match(/\b([A-Z]{2})\b/g);
  if (anyCode) {
    for (const code of anyCode) {
      if (VALID_STATES.has(code)) return code;
    }
  }

  return null;
}

const CONGRESS = 119;

interface CongressMember {
  bioguideId: string;
  name: string;
  partyName: string;
  state: string;
  district?: number;
  terms: { item: { chamber: string }[] };
  depiction?: { imageUrl?: string };
  url?: string;
}

async function fetchMembersFromCongress(state: string, apiKey: string): Promise<any[]> {
  const url = `https://api.congress.gov/v3/member?stateCode=${state}&currentMember=true&limit=50&api_key=${apiKey}`;
  const resp = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!resp.ok) {
    console.error(`Congress API error: ${resp.status} ${await resp.text()}`);
    return [];
  }
  const json = await resp.json();
  return json.members || [];
}

function mapCongressMember(m: CongressMember) {
  const latestTerm = m.terms?.item?.[0];
  const chamber = latestTerm?.chamber === 'Senate' ? 'senate' : 'house';
  return {
    bioguide_id: m.bioguideId,
    name: m.name,
    title: chamber === 'senate' ? 'U.S. Senator' : 'U.S. Representative',
    party: m.partyName,
    state: m.state,
    district: m.district != null ? String(m.district) : null,
    chamber,
    phone: null,
    website: m.url || null,
    office_address: null,
    photo_url: m.depiction?.imageUrl || null,
    social_twitter: null,
    social_facebook: null,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const apiKey = Deno.env.get('CONGRESS_API_KEY') ?? '';

    const body = await req.json();
    const address = body.address?.trim();

    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const state = parseStateFromAddress(address);
    if (!state) {
      return new Response(
        JSON.stringify({ reps: [], message: 'Could not determine state from address. Please include your state (e.g. "123 Main St, Boise, ID 83702").' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first — reps expire after 7 days
    const { data: cached } = await supabase
      .from('rep_cache')
      .select('*')
      .eq('state', state)
      .gt('expires_at', new Date().toISOString());

    if (cached && cached.length > 0) {
      return new Response(
        JSON.stringify({ reps: cached, source: 'cache', state }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from Congress.gov
    if (!apiKey) {
      return new Response(
        JSON.stringify({ reps: [], message: 'Congress API key not configured.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const members = await fetchMembersFromCongress(state, apiKey);
    if (members.length === 0) {
      return new Response(
        JSON.stringify({ reps: [], message: `No current members found for ${state}.` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mapped = members.map(mapCongressMember);

    // Upsert into rep_cache
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    for (const rep of mapped) {
      await supabase
        .from('rep_cache')
        .upsert(
          { ...rep, cached_at: new Date().toISOString(), expires_at: expiresAt },
          { onConflict: 'bioguide_id' }
        );
    }

    // Re-fetch from cache to get UUIDs
    const { data: fresh } = await supabase
      .from('rep_cache')
      .select('*')
      .eq('state', state);

    return new Response(
      JSON.stringify({ reps: fresh || mapped, source: 'congress_api', state }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('rep-lookup error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
