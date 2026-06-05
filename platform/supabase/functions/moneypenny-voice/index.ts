/**
 * moneypenny-voice — Twilio Voice webhook + call routing switchboard
 * =================================================================
 * BP073 Wave C · C1/C2 Real Call Routing
 *
 * FOUNDER: configure these in Supabase Vault / Twilio Console:
 *   TWILIO_ACCOUNT_SID        — from twilio.com/console
 *   TWILIO_AUTH_TOKEN         — from twilio.com/console
 *   TWILIO_PHONE_NUMBER       — your Twilio number (e.g. +18005551234)
 *   FOUNDER_PHONE_NUMBER      — personal cell for P0/P1 forward attempts
 *   FOUNDER_VOICE_FORWARD_NUMBER — (optional) separate forward-through number
 *
 * Twilio webhook URL (set in Twilio Console > Phone Numbers > Voice):
 *   https://<project>.supabase.co/functions/v1/moneypenny-voice
 *   Method: HTTP POST
 *
 * Flow:
 *   1. Twilio POSTs call metadata here on inbound ring
 *   2. We classify caller (crown/press/investor/member/general)
 *   3. We log to moneypenny_inbound_calls
 *   4. We return TwiML:
 *      - P0/P1 + Founder available: forward to Founder's number
 *      - All others or unavailable: hold + callback promise
 *   5. SMS Founder for P0/P1/P2 regardless of availability
 *
 * verify_jwt = false (Twilio cannot send JWT)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Known Press/Investor Caller Signatures ───────────────────────────────────
// Add known callers here or seed the gatekeeper_lists table
const KNOWN_PRESS_AREA_CODES = ["212", "310", "415", "646", "917"];
const KNOWN_INVESTOR_PATTERNS: string[] = [];  // e.g. ["12125551234"]

interface CallerProfile {
  callerClass: "crown" | "press" | "investor" | "member" | "general";
  priorityLevel: number;
  callbackEtaHours: number;
  holdMessage: string;
}

function classifyCaller(
  callerPhone: string,
  callerName: string,
  knownWhitelist: string[],
): CallerProfile {
  const digits = callerPhone.replace(/\D/g, "");
  const areaCode = digits.length >= 10 ? digits.slice(-10, -7) : "";
  const nameLower = callerName.toLowerCase();

  // Whitelist match -> crown
  if (knownWhitelist.some(w => digits.includes(w.replace(/\D/g, "")) || nameLower.includes(w.toLowerCase()))) {
    return {
      callerClass: "crown",
      priorityLevel: 0,
      callbackEtaHours: 1,
      holdMessage:
        "Thank you for calling Liana Banyan. This is MoneyPenny. " +
        "Jonathan is expecting your call. Please hold while we connect you, " +
        "or leave a message and he will return your call within one hour.",
    };
  }

  // Known investor patterns
  if (KNOWN_INVESTOR_PATTERNS.some(p => digits.endsWith(p))) {
    return {
      callerClass: "investor",
      priorityLevel: 2,
      callbackEtaHours: 4,
      holdMessage:
        "Thank you for calling Liana Banyan. This is MoneyPenny, Jonathan's executive assistant. " +
        "Please note that Liana Banyan is a member-owned cooperative and does not accept outside sponsorship at this time. " +
        "We have received your call and will be in touch within four hours.",
    };
  }

  // NYC/LA/SF area codes -> likely press
  if (KNOWN_PRESS_AREA_CODES.includes(areaCode)) {
    return {
      callerClass: "press",
      priorityLevel: 1,
      callbackEtaHours: 12,
      holdMessage:
        "Thank you for calling Liana Banyan. This is MoneyPenny. " +
        "Jonathan is available for press inquiries and interviews. " +
        "We have received your call and will respond within twelve hours. " +
        "The full press kit is available at lianabanyan.com/press.",
    };
  }

  return {
    callerClass: "general",
    priorityLevel: 5,
    callbackEtaHours: 48,
    holdMessage:
      "Thank you for calling Liana Banyan. This is MoneyPenny, the automated assistant. " +
      "We have received your call and will be in touch within 48 hours. " +
      "To learn more, visit lianabanyan.com. " +
      "You can also reach us by email at support at lianabanyan dot com.",
  };
}

function buildHoldTwiML(profile: CallerProfile, founderAvailable: boolean, founderForwardNumber: string): string {
  // P0 and available: attempt forward
  if (profile.priorityLevel === 0 && founderAvailable && founderForwardNumber) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Please hold while we connect your call.</Say>
  <Dial action="/moneypenny-voice/dial-status" timeout="20">
    <Number>${founderForwardNumber}</Number>
  </Dial>
  <Say voice="Polly.Joanna">We were unable to connect you directly. ${profile.holdMessage}</Say>
  <Record maxLength="120" transcribe="true" action="/moneypenny-voice/voicemail" />
</Response>`;
  }

  // All others: hold message + optional voicemail
  const recordBlock = profile.priorityLevel <= 2
    ? `\n  <Say voice="Polly.Joanna">Please leave a brief message after the tone and we will call you back.</Say>
  <Record maxLength="120" transcribe="true" action="/moneypenny-voice/voicemail" />`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">${profile.holdMessage}</Say>${recordBlock}
  <Hangup />
</Response>`;
}

serve(async (req) => {
  const url = new URL(req.url);

  // Sub-path: voicemail recording callback
  if (url.pathname.endsWith("/voicemail")) {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const formData = await req.formData();
    const callSid = formData.get("CallSid")?.toString() || "";
    const recordingUrl = formData.get("RecordingUrl")?.toString() || "";
    const transcriptionText = formData.get("TranscriptionText")?.toString() || "";

    if (callSid) {
      await supabase
        .from("moneypenny_inbound_calls")
        .update({
          notes: `Voicemail recorded. Transcription: ${transcriptionText || "(pending)"}. Recording: ${recordingUrl}`,
          status: "callback_queued",
          updated_at: new Date().toISOString(),
        })
        .eq("call_sid", callSid);
    }

    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { headers: { "Content-Type": "text/xml" } },
    );
  }

  // Main inbound webhook
  if (req.method !== "POST") {
    return new Response("MoneyPenny Voice — ready.", { status: 200 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const founderPhone = Deno.env.get("FOUNDER_PHONE_NUMBER") || "";
  const founderForwardNumber = Deno.env.get("FOUNDER_VOICE_FORWARD_NUMBER") || founderPhone;

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("x-www-form-urlencoded")) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Invalid request.</Say></Response>',
        { headers: { "Content-Type": "text/xml" }, status: 400 },
      );
    }

    const formData = await req.formData();
    const callSid = formData.get("CallSid")?.toString() || "";
    const callerPhone = formData.get("From")?.toString() || "unknown";
    const callerName = formData.get("CallerName")?.toString() || "";
    const direction = formData.get("Direction")?.toString() || "inbound";

    // Pull whitelist from gatekeeper_lists
    const { data: lists } = await supabase
      .from("gatekeeper_lists")
      .select("value")
      .eq("list_type", "whitelist");
    const whitelist = (lists || []).map((l: { value: string }) => l.value);

    const profile = classifyCaller(callerPhone, callerName, whitelist);

    // Read Founder availability (most recent row)
    const { data: avail } = await supabase
      .from("moneypenny_availability")
      .select("is_available, mode")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const founderAvailable = avail
      ? avail.mode === "available" || (avail.mode === "auto" && avail.is_available)
      : false;

    // Log the call
    const { data: callLog } = await supabase
      .from("moneypenny_inbound_calls")
      .insert({
        call_sid: callSid || null,
        caller_phone: callerPhone,
        caller_name: callerName || null,
        direction,
        caller_class: profile.callerClass,
        priority_level: profile.priorityLevel,
        status: "received",
        hold_message: profile.holdMessage,
        callback_eta_hours: profile.callbackEtaHours,
      })
      .select("id")
      .single();

    // SMS Founder for priority callers (P0, P1, P2)
    if (profile.priorityLevel <= 2 && founderPhone) {
      const classLabel = profile.callerClass.toUpperCase();
      const smsBody =
        `[MP] ${classLabel} CALL: ${callerName || callerPhone} (${callerPhone}). ` +
        `ETA callback: ${profile.callbackEtaHours}h. ` +
        (founderAvailable ? "Attempting forward." : "Founder unavailable — hold+voicemail active.");

      await supabase.from("moneypenny_sms_queue").insert({
        recipient_phone: founderPhone,
        message_body: smsBody,
        priority: profile.priorityLevel,
        source: "moneypenny-voice",
        source_id: callLog?.id || null,
      });
    }

    const twiml = buildHoldTwiML(profile, founderAvailable, founderForwardNumber);
    return new Response(twiml, { headers: { "Content-Type": "text/xml" } });
  } catch (err) {
    console.error("moneypenny-voice error:", err);

    // Safe fallback TwiML — never drop a call silently
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Thank you for calling Liana Banyan. We have received your call and will be in touch shortly.</Say>
  <Hangup />
</Response>`,
      { headers: { "Content-Type": "text/xml" } },
    );
  }
});
