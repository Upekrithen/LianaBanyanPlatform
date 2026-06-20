// substrate-match/index.ts
// POST: { member_user_id, query_text, lat_lon, radius_km }
// Returns: { matches: Array<{ entity_id, name, node_type, distance_km, preference_score, combined_score, pitch_md }> }
// No paid placement. No sponsored ranking. Substrate is the moat.
// Deno-compatible (Supabase Edge Functions run on Deno).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LatLon {
  lat: number;
  lon: number;
}

interface EntityRow {
  id: string;
  entity_name: string;
  node_type: string;
  service_area_geojson: Record<string, unknown> | null;
}

interface ProfileRow {
  entity_id: string;
  pitch_md: string | null;
}

interface PreferenceRow {
  topic_tag: string;
  weight_decimal: number;
}

interface MatchResult {
  entity_id: string;
  name: string;
  node_type: string;
  distance_km: number | null;
  preference_score: number;
  combined_score: number;
  pitch_md: string | null;
}

function extractCentroid(geojson: Record<string, unknown> | null): LatLon | null {
  if (!geojson) return null;
  try {
    const type = geojson['type'] as string;
    if (type === 'Point') {
      const coords = geojson['coordinates'] as [number, number];
      return { lon: coords[0], lat: coords[1] };
    }
    if (type === 'Polygon') {
      const ring = (geojson['coordinates'] as [number, number][][])[0];
      if (!ring || ring.length === 0) return null;
      const sumLon = ring.reduce((s, c) => s + c[0], 0);
      const sumLat = ring.reduce((s, c) => s + c[1], 0);
      return { lon: sumLon / ring.length, lat: sumLat / ring.length };
    }
    if (type === 'Feature') {
      const geom = geojson['geometry'] as Record<string, unknown>;
      return extractCentroid(geom);
    }
  } catch {
    // fall through
  }
  return null;
}

function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function computePreferenceScore(
  tokens: string[],
  prefs: PreferenceRow[]
): number {
  if (prefs.length === 0 || tokens.length === 0) return 0;
  const prefMap = new Map<string, number>();
  for (const p of prefs) {
    prefMap.set(p.topic_tag.toLowerCase(), Number(p.weight_decimal));
  }
  let score = 0;
  let hits = 0;
  for (const token of tokens) {
    const w = prefMap.get(token);
    if (w !== undefined) {
      score += w;
      hits++;
    }
  }
  return hits === 0 ? 0 : Math.min(1, score / hits);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  let body: { member_user_id?: string; query_text?: string; lat_lon?: LatLon; radius_km?: number };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const { member_user_id, query_text, lat_lon, radius_km } = body;

  if (!member_user_id || !query_text) {
    return new Response(
      JSON.stringify({ error: 'member_user_id and query_text are required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const radiusKm = typeof radius_km === 'number' && radius_km > 0 ? radius_km : 50;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // Fetch live entities with node_type
    const { data: entities, error: entErr } = await supabase
      .from('entity_memberships')
      .select('id, entity_name, node_type, service_area_geojson')
      .eq('status', 'live')
      .not('node_type', 'is', null);

    if (entErr) throw entErr;
    if (!entities || entities.length === 0) {
      return new Response(
        JSON.stringify({ matches: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Fetch member profiles for those entities
    const entityIds = (entities as EntityRow[]).map((e) => e.id);
    const { data: profiles } = await supabase
      .from('member_business_profile')
      .select('entity_id, pitch_md')
      .in('entity_id', entityIds);

    const profileMap = new Map<string, ProfileRow>();
    for (const p of (profiles ?? []) as ProfileRow[]) {
      profileMap.set(p.entity_id, p);
    }

    // Fetch member preferences
    const { data: prefs } = await supabase
      .from('member_preference_inferred')
      .select('topic_tag, weight_decimal')
      .eq('member_user_id', member_user_id);

    const prefRows: PreferenceRow[] = (prefs ?? []) as PreferenceRow[];

    const queryTokens = tokenize(query_text);

    const results: MatchResult[] = [];

    for (const entity of entities as EntityRow[]) {
      const centroid = extractCentroid(entity.service_area_geojson);
      let distanceKm: number | null = null;
      let distanceScore = 0.5; // neutral when location data unavailable

      if (centroid && lat_lon) {
        distanceKm = haversineKm(lat_lon, centroid);
        if (distanceKm > radiusKm) continue; // outside radius -- skip
        distanceScore = Math.max(0, Math.min(1, 1 - distanceKm / radiusKm));
      }

      const entityTokens = tokenize(entity.entity_name + ' ' + (entity.node_type ?? ''));
      const allTokens = [...queryTokens, ...entityTokens];
      const preferenceScore = computePreferenceScore(allTokens, prefRows);

      // combined_score: preference 70%, distance 30%
      const combinedScore = preferenceScore * 0.7 + distanceScore * 0.3;

      const profile = profileMap.get(entity.id);
      results.push({
        entity_id: entity.id,
        name: entity.entity_name,
        node_type: entity.node_type,
        distance_km: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
        preference_score: Math.round(preferenceScore * 1000) / 1000,
        combined_score: Math.round(combinedScore * 1000) / 1000,
        pitch_md: profile?.pitch_md ?? null,
      });
    }

    // ORDER BY combined_score DESC
    results.sort((a, b) => b.combined_score - a.combined_score);

    return new Response(
      JSON.stringify({ matches: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[substrate-match] error:', err);
    return new Response(
      JSON.stringify({ error: 'internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
