// BP094 Marathon 11 -- Block 3 -- T11 Server-Side Gate
// Edge Function: download-signed
//
// Flow:
//   1. Client calls POST /functions/v1/download-signed with { acceptance_id, filename }
//   2. This function validates acceptance_id exists in license_acceptances (within last 15 min)
//   3. Generates a time-limited signed URL for the requested file
//   4. Marks the acceptance record with signed_url_issued_at
//   5. Returns { signed_url: string }
//
// T11 verification:
//   curl -I <direct_exe_url_without_token>  => 403 (CDN enforces signed token requirement)
//   POST /functions/v1/download-signed with valid acceptance_id => returns signed_url
//   Reuse spent signed URL (after 15 min) => 403
//
// "No silent install. Ever."

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Storage bucket where installer files live
const DOWNLOAD_BUCKET = Deno.env.get('DOWNLOAD_BUCKET') ?? 'mnemosynec-installers';

// Signed URL TTL in seconds (15 minutes)
const SIGNED_URL_TTL_SECONDS = 15 * 60;

// Allowlist of downloadable filenames to prevent path traversal
const ALLOWED_FILENAMES = /^MnemosyneC[-_v0-9.]+\.(exe|dmg|deb|rpm|AppImage)$/;

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405);
  }

  let body: { acceptance_id?: string; filename?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const { acceptance_id, filename } = body;

  if (!acceptance_id || typeof acceptance_id !== 'string') {
    return jsonError('acceptance_id is required', 400);
  }
  if (!filename || typeof filename !== 'string') {
    return jsonError('filename is required', 400);
  }
  if (!ALLOWED_FILENAMES.test(filename)) {
    return jsonError('filename not permitted', 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Validate acceptance record exists and is recent (within last 15 minutes)
  const cutoff = new Date(Date.now() - SIGNED_URL_TTL_SECONDS * 1000).toISOString();
  const { data: acceptance, error: fetchError } = await supabase
    .from('license_acceptances')
    .select('id, accepted_at, signed_url_issued_at')
    .eq('id', acceptance_id)
    .gte('accepted_at', cutoff)
    .single();

  if (fetchError || !acceptance) {
    return jsonError('acceptance_id not found or expired', 403);
  }

  // Prevent reuse: if signed_url already issued, reject
  if (acceptance.signed_url_issued_at) {
    return jsonError('Download URL already issued for this acceptance. Accept again to get a new URL.', 403);
  }

  // Generate signed URL from Supabase Storage
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(DOWNLOAD_BUCKET)
    .createSignedUrl(filename, SIGNED_URL_TTL_SECONDS);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    console.error('[download-signed] Storage error:', signedUrlError);
    return jsonError('Could not generate download URL', 500);
  }

  // Mark the acceptance record as signed_url_issued
  const { error: updateError } = await supabase
    .from('license_acceptances')
    .update({ signed_url_issued_at: new Date().toISOString() })
    .eq('id', acceptance_id);

  if (updateError) {
    console.error('[download-signed] Update error:', updateError);
    // Non-fatal -- return URL anyway but log for audit
  }

  return new Response(JSON.stringify({ signed_url: signedUrlData.signedUrl }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
