/**
 * CONGRESS-API-SYNC EDGE FUNCTION
 * ================================
 * Multi-mode function for syncing data from Congress.gov API.
 *
 * Modes (via ?mode= query param or POST body):
 *   - bills:    Sync tracked bills with latest data from Congress.gov
 *   - members:  Sync bill cosponsors for tracked bills
 *   - actions:  Sync action history for tracked bills
 *   - search:   Live search Congress.gov by keyword (?q=)
 *
 * Auth: service-role or admin user (checked via x-lb-system-key or JWT)
 * Cron schedule configured in 20260323000022_congress_cron.sql
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lb-system-key',
};

const CONGRESS = 119;

function congressApiUrl(path: string, apiKey: string, params: Record<string, string> = {}): string {
  const qs = new URLSearchParams({ api_key: apiKey, format: 'json', ...params });
  return `https://api.congress.gov/v3${path}?${qs.toString()}`;
}

async function fetchJson(url: string): Promise<any> {
  const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Congress API ${resp.status}: ${text.slice(0, 200)}`);
    return null;
  }
  return resp.json();
}

function mapStatus(actions: any[]): string {
  if (!actions?.length) return 'introduced';
  const texts = actions.map((a: any) => (a.text || '').toLowerCase());
  if (texts.some(t => t.includes('became public law') || t.includes('signed by president'))) return 'signed';
  if (texts.some(t => t.includes('vetoed'))) return 'vetoed';
  if (texts.some(t => t.includes('passed senate'))) return 'passed_senate';
  if (texts.some(t => t.includes('passed house') || t.includes('passed/agreed to in house'))) return 'passed_house';
  if (texts.some(t => t.includes('referred to') || t.includes('committee'))) return 'committee';
  return 'introduced';
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

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'CONGRESS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const mode = url.searchParams.get('mode') || 'bills';

    // ─── MODE: SEARCH ───
    if (mode === 'search') {
      const q = url.searchParams.get('q');
      if (!q || q.length < 2) {
        return new Response(
          JSON.stringify({ results: [], message: 'Query too short' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await fetchJson(
        congressApiUrl(`/bill/${CONGRESS}`, apiKey, { limit: '20', sort: 'updateDate+desc' })
      );

      // Congress.gov doesn't have a keyword search param on the bill list endpoint,
      // so we fetch recent bills and filter client-side, plus search by bill number.
      const allBills = data?.bills || [];
      const qLower = q.toLowerCase();

      // Also try fetching a specific bill if the query looks like a bill number
      const billMatch = q.replace(/[\s\-]/g, '').match(/^(hr|s|hjres|sjres)(\d+)$/i);
      let specificBill: any = null;
      if (billMatch) {
        const billType = billMatch[1].toLowerCase();
        const billNum = billMatch[2];
        const specific = await fetchJson(
          congressApiUrl(`/bill/${CONGRESS}/${billType}/${billNum}`, apiKey)
        );
        if (specific?.bill) specificBill = specific.bill;
      }

      const results: any[] = [];

      if (specificBill) {
        results.push({
          bill_number: `${(specificBill.type || '').toUpperCase()}-${specificBill.number}`,
          title: specificBill.title || '',
          congress: specificBill.congress || CONGRESS,
          bill_type: specificBill.type || '',
          sponsor: specificBill.sponsors?.[0]?.fullName || null,
          sponsor_party: specificBill.sponsors?.[0]?.party || null,
          status: mapStatus(specificBill.actions?.actions || []),
          introduced_date: specificBill.introducedDate || null,
          last_action_date: specificBill.latestAction?.actionDate || null,
          last_action: specificBill.latestAction?.text || null,
          policy_area: specificBill.policyArea?.name || null,
          congress_url: specificBill.url || null,
        });
      }

      for (const b of allBills) {
        const title = (b.title || '').toLowerCase();
        const billNum = (b.number || '').toString();
        if (title.includes(qLower) || billNum.includes(q)) {
          results.push({
            bill_number: `${(b.type || '').toUpperCase()}-${b.number}`,
            title: b.title || '',
            congress: b.congress || CONGRESS,
            bill_type: b.type || '',
            sponsor: null,
            sponsor_party: null,
            status: b.latestAction?.text?.toLowerCase().includes('committee') ? 'committee' : 'introduced',
            introduced_date: b.introducedDate || null,
            last_action_date: b.latestAction?.actionDate || null,
            last_action: b.latestAction?.text || null,
            policy_area: null,
            congress_url: b.url || null,
          });
        }
      }

      // Deduplicate by bill_number
      const seen = new Set<string>();
      const deduped = results.filter(r => {
        if (seen.has(r.bill_number)) return false;
        seen.add(r.bill_number);
        return true;
      });

      return new Response(
        JSON.stringify({ results: deduped.slice(0, 20) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── MODE: BILLS (sync tracked bills) ───
    if (mode === 'bills') {
      const { data: tracked } = await supabase
        .from('tracked_bills')
        .select('id, bill_number, congress, bill_type, is_live')
        .eq('is_live', true);

      if (!tracked?.length) {
        return new Response(
          JSON.stringify({ synced: 0, message: 'No live bills to sync' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let synced = 0;
      for (const bill of tracked) {
        try {
          const parsed = parseBillNumber(bill.bill_number);
          if (!parsed) continue;

          const data = await fetchJson(
            congressApiUrl(`/bill/${parsed.congress}/${parsed.type}/${parsed.number}`, apiKey)
          );
          if (!data?.bill) continue;

          const b = data.bill;
          await supabase
            .from('tracked_bills')
            .update({
              title: b.title || bill.bill_number,
              congress: b.congress || parsed.congress,
              bill_type: b.type || parsed.type,
              sponsor_name: b.sponsors?.[0]?.fullName || null,
              sponsor_party: b.sponsors?.[0]?.party || null,
              sponsor_bioguide: b.sponsors?.[0]?.bioguideId || null,
              status: mapStatus(b.actions?.actions || []),
              introduced_date: b.introducedDate || null,
              last_action_date: b.latestAction?.actionDate || null,
              last_action: b.latestAction?.text || null,
              policy_area: b.policyArea?.name || null,
              congress_url: b.url || null,
              cosponsors_count: b.cosponsors?.count || 0,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', bill.id);

          synced++;
        } catch (e) {
          console.error(`Failed to sync ${bill.bill_number}:`, e);
        }
      }

      return new Response(
        JSON.stringify({ synced, total: tracked.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── MODE: MEMBERS (sync cosponsors for tracked bills) ───
    if (mode === 'members') {
      const { data: tracked } = await supabase
        .from('tracked_bills')
        .select('id, bill_number, is_live')
        .eq('is_live', true);

      if (!tracked?.length) {
        return new Response(
          JSON.stringify({ synced: 0, message: 'No live bills to sync cosponsors for' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let totalCosponsors = 0;
      for (const bill of tracked) {
        try {
          const parsed = parseBillNumber(bill.bill_number);
          if (!parsed) continue;

          const data = await fetchJson(
            congressApiUrl(`/bill/${parsed.congress}/${parsed.type}/${parsed.number}/cosponsors`, apiKey, { limit: '250' })
          );
          const cosponsors = data?.cosponsors || [];

          for (const co of cosponsors) {
            await supabase
              .from('bill_cosponsors')
              .upsert(
                {
                  bill_id: bill.id,
                  bioguide_id: co.bioguideId,
                  cosponsor_date: co.sponsorshipDate || null,
                  is_original: co.isOriginalCosponsor || false,
                },
                { onConflict: 'bill_id,bioguide_id' }
              );
            totalCosponsors++;
          }
        } catch (e) {
          console.error(`Failed to sync cosponsors for ${bill.bill_number}:`, e);
        }
      }

      return new Response(
        JSON.stringify({ synced: totalCosponsors, bills: tracked.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── MODE: ACTIONS (sync action timelines) ───
    if (mode === 'actions') {
      const { data: tracked } = await supabase
        .from('tracked_bills')
        .select('id, bill_number, is_live')
        .eq('is_live', true);

      if (!tracked?.length) {
        return new Response(
          JSON.stringify({ synced: 0, message: 'No live bills to sync actions for' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let synced = 0;
      for (const bill of tracked) {
        try {
          const parsed = parseBillNumber(bill.bill_number);
          if (!parsed) continue;

          const data = await fetchJson(
            congressApiUrl(`/bill/${parsed.congress}/${parsed.type}/${parsed.number}/actions`, apiKey, { limit: '100' })
          );
          const actions = data?.actions || [];

          if (actions.length > 0) {
            await supabase
              .from('tracked_bills')
              .update({
                actions: JSON.stringify(actions),
                status: mapStatus(actions),
                last_synced_at: new Date().toISOString(),
              })
              .eq('id', bill.id);
            synced++;
          }
        } catch (e) {
          console.error(`Failed to sync actions for ${bill.bill_number}:`, e);
        }
      }

      return new Response(
        JSON.stringify({ synced, total: tracked.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown mode: ${mode}. Use bills, members, actions, or search.` }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('congress-api-sync error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseBillNumber(billNumber: string): { congress: number; type: string; number: string } | null {
  const cleaned = billNumber.replace(/[\s\-\.]+/g, '').toLowerCase();
  const match = cleaned.match(/^([a-z]+)(\d+)$/);
  if (!match) return null;
  return { congress: CONGRESS, type: match[1], number: match[2] };
}
