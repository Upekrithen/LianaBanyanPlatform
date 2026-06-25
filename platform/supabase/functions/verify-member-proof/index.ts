// verify-member-proof edge function
// BP094 - cryptographic provenance vetting for member proof submissions
// No em-dashes in comments

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let body: { submission_id: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { submission_id } = body;
  if (!submission_id) {
    return new Response(JSON.stringify({ error: "submission_id required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: submission, error: fetchErr } = await supabase
    .from("member_proof_submissions")
    .select("*")
    .eq("id", submission_id)
    .single();

  if (fetchErr || !submission) {
    return new Response(JSON.stringify({ error: "Submission not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: profile } = await supabase
    .from("member_profiles")
    .select("ring_bearer_public_key_ed25519")
    .eq("user_id", submission.member_id)
    .single();

  const publicKeyHex = profile?.ring_bearer_public_key_ed25519;
  if (!publicKeyHex) {
    return new Response(JSON.stringify({ error: "No Ring Bearer key on file for this member" }), {
      status: 422,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: fileData, error: downloadErr } = await supabase
    .storage
    .from("member-proof-submissions")
    .download(submission.result_json_storage_path);

  if (downloadErr || !fileData) {
    return new Response(JSON.stringify({ error: "Could not download result JSON from Storage" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const resultJsonBytes = new Uint8Array(await fileData.arrayBuffer());

  let signatureValid = false;
  try {
    const publicKeyBytes = hexToBytes(publicKeyHex);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      publicKeyBytes,
      { name: "Ed25519" },
      false,
      ["verify"]
    );
    const signatureBytes = hexToBytes(submission.member_signature_ed25519);
    signatureValid = await crypto.subtle.verify(
      "Ed25519",
      cryptoKey,
      signatureBytes,
      resultJsonBytes
    );
  } catch (cryptoErr) {
    console.error("Crypto verify error:", cryptoErr);
    signatureValid = false;
  }

  if (!signatureValid) {
    await supabase
      .from("member_proof_submissions")
      .update({ posse_spot_check_status: "signature_failed" })
      .eq("id", submission_id);

    return new Response(JSON.stringify({
      verified: false,
      reason: "Ed25519 signature verification failed",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await supabase
    .from("member_proof_submissions")
    .update({ signature_verified: true, posse_spot_check_status: "posse_queued" })
    .eq("id", submission_id);

  const questionsToSpotCheck = Math.max(1, Math.ceil(submission.questions_attempted * 0.1));
  const resultJson = JSON.parse(new TextDecoder().decode(resultJsonBytes));
  const spotCheckQuestions = (resultJson.per_question ?? []).slice(0, questionsToSpotCheck);

  const { error: jobErr } = await supabase
    .from("posse_spot_check_jobs")
    .insert({
      submission_id: submission_id,
      member_id: submission.member_id,
      questions: spotCheckQuestions,
      tolerance_pct: 5,
      created_at: new Date().toISOString(),
    });

  if (jobErr) {
    console.error("Posse spot-check queue error:", jobErr.message);
  }

  return new Response(JSON.stringify({
    verified: true,
    signature_valid: true,
    posse_spot_check_status: "queued",
    questions_to_spot_check: questionsToSpotCheck,
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
