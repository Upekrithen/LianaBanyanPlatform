import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * moneypenny-sms — SMS gateway for Moneypenny.
 *
 * Two modes:
 *   1. INBOUND (Twilio webhook) — Founder texts Moneypenny, gets Claude-powered reply
 *   2. OUTBOUND (internal call) — Process queued outbound messages
 *
 * Twilio webhook URL: https://<project>.supabase.co/functions/v1/moneypenny-sms
 * Set this in Twilio Console > Phone Numbers > Active Numbers > Messaging webhook
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID") || "";
  const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN") || "";
  const twilioNumber = Deno.env.get("TWILIO_PHONE_NUMBER") || "";
  const twilioMsgSvcSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID") || "";
  const founderPhone = Deno.env.get("FOUNDER_PHONE_NUMBER") || "";
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY") || "";

  try {
    const contentType = req.headers.get("content-type") || "";

    // ═══════════════════════════════════════════════════════════════
    // INBOUND: Twilio webhook (application/x-www-form-urlencoded)
    // ═══════════════════════════════════════════════════════════════
    if (contentType.includes("x-www-form-urlencoded")) {
      const formData = await req.formData();
      const from = formData.get("From")?.toString() || "";
      const body = formData.get("Body")?.toString() || "";
      const messageSid = formData.get("MessageSid")?.toString() || "";

      // Security: Only accept from Founder's number
      const normalizedFrom = from.replace(/\D/g, "").slice(-10);
      const normalizedFounder = founderPhone.replace(/\D/g, "").slice(-10);

      if (normalizedFrom !== normalizedFounder) {
        console.log(`Unauthorized SMS from ${from} — silently dropped`);
        // Return 200 so Twilio doesn't retry
        return new Response(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          {
            headers: { "Content-Type": "text/xml" },
          },
        );
      }

      // Log inbound message
      await supabase.from("moneypenny_sms_log").insert({
        direction: "inbound",
        phone_number: from,
        message_body: body,
        twilio_sid: messageSid,
      });

      // Get recent conversation history (last 20 messages)
      const { data: history } = await supabase
        .from("moneypenny_sms_log")
        .select("direction, message_body, created_at")
        .eq("phone_number", from)
        .order("created_at", { ascending: false })
        .limit(20);

      // Get platform status for context
      const platformContext = await getPlatformStatus(supabase);

      // Build Claude messages from SMS history
      const claudeMessages = (history || [])
        .reverse()
        .map((msg: { direction: string; message_body: string }) => ({
          role: msg.direction === "inbound" ? "user" : "assistant",
          content: msg.message_body,
        }));

      // Call Claude API
      const startTime = Date.now();
      const claudeResponse = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 300,
            system: buildSystemPrompt(platformContext),
            messages: claudeMessages,
          }),
        },
      );

      const claudeData = await claudeResponse.json();
      const responseTime = Date.now() - startTime;
      const replyText =
        claudeData.content?.[0]?.text ||
        "Something went wrong. Try again in a moment. — MP";
      const tokensUsed =
        (claudeData.usage?.input_tokens || 0) +
        (claudeData.usage?.output_tokens || 0);

      // Send reply via Twilio (prefer Messaging Service for A2P compliance)
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const twilioParams: Record<string, string> = { To: from, Body: replyText };
      if (twilioMsgSvcSid) {
        twilioParams.MessagingServiceSid = twilioMsgSvcSid;
      } else {
        twilioParams.From = twilioNumber;
      }
      const twilioBody = new URLSearchParams(twilioParams);

      const twilioResponse = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + btoa(`${twilioSid}:${twilioAuth}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: twilioBody.toString(),
      });

      const twilioResult = await twilioResponse.json();

      // Log outbound reply
      await supabase.from("moneypenny_sms_log").insert({
        direction: "outbound",
        phone_number: from,
        message_body: replyText,
        twilio_sid: twilioResult.sid || null,
        claude_request_id: claudeData.id || null,
        tokens_used: tokensUsed,
        response_time_ms: responseTime,
      });

      // Return TwiML empty response (we already sent via API)
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        {
          headers: { "Content-Type": "text/xml" },
        },
      );
    }

    // ═══════════════════════════════════════════════════════════════
    // OUTBOUND: Process SMS queue (JSON POST from cron or other functions)
    // ═══════════════════════════════════════════════════════════════
    if (contentType.includes("application/json")) {
      const payload = await req.json();
      const action = payload.action || "process_queue";

      if (action === "process_queue") {
        // Grab pending messages, priority-ordered
        const { data: pending } = await supabase
          .from("moneypenny_sms_queue")
          .select("*")
          .eq("status", "pending")
          .order("priority", { ascending: true })
          .order("created_at", { ascending: true })
          .limit(10);

        const results: Array<{ id: string; status: string; error?: string }> = [];

        for (const msg of pending || []) {
          try {
            const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
            const qParams: Record<string, string> = { To: msg.recipient_phone, Body: msg.message_body };
            if (twilioMsgSvcSid) {
              qParams.MessagingServiceSid = twilioMsgSvcSid;
            } else {
              qParams.From = twilioNumber;
            }
            const twilioBody = new URLSearchParams(qParams);

            const res = await fetch(twilioUrl, {
              method: "POST",
              headers: {
                Authorization:
                  "Basic " + btoa(`${twilioSid}:${twilioAuth}`),
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: twilioBody.toString(),
            });

            const result = await res.json();

            if (result.sid) {
              await supabase
                .from("moneypenny_sms_queue")
                .update({
                  status: "sent",
                  twilio_sid: result.sid,
                  sent_at: new Date().toISOString(),
                })
                .eq("id", msg.id);

              // Also log in conversation log
              await supabase.from("moneypenny_sms_log").insert({
                direction: "outbound",
                phone_number: msg.recipient_phone,
                message_body: msg.message_body,
                twilio_sid: result.sid,
              });

              results.push({ id: msg.id, status: "sent" });
            } else {
              throw new Error(result.message || "Twilio send failed");
            }
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            await supabase
              .from("moneypenny_sms_queue")
              .update({ status: "failed", error_message: errorMsg })
              .eq("id", msg.id);
            results.push({ id: msg.id, status: "failed", error: errorMsg });
          }
        }

        return new Response(
          JSON.stringify({
            processed: results.length,
            results,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Direct send (for other Edge Functions to call)
      if (action === "send_direct") {
        const { to, message } = payload;
        const phone = to || founderPhone;

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
        const dParams: Record<string, string> = { To: phone, Body: message };
        if (twilioMsgSvcSid) {
          dParams.MessagingServiceSid = twilioMsgSvcSid;
        } else {
          dParams.From = twilioNumber;
        }
        const twilioBody = new URLSearchParams(dParams);

        const res = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization:
              "Basic " + btoa(`${twilioSid}:${twilioAuth}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: twilioBody.toString(),
        });

        const result = await res.json();

        // Log it
        await supabase.from("moneypenny_sms_log").insert({
          direction: "outbound",
          phone_number: phone,
          message_body: message,
          twilio_sid: result.sid || null,
        });

        return new Response(
          JSON.stringify({ sent: !!result.sid, sid: result.sid }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ error: "Unknown action" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response("Moneypenny SMS — ready.", {
      headers: corsHeaders,
    });
  } catch (err) {
    console.error("moneypenny-sms error:", err);

    // Log to admin_notifications for visibility
    try {
      await supabase.from("admin_notifications").insert({
        event_type: "edge_function_error",
        severity: "critical",
        title: "Moneypenny SMS error",
        details: {
          error: err instanceof Error ? err.message : String(err),
        },
      });
    } catch (_) {
      /* best effort */
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

async function getPlatformStatus(
  supabase: ReturnType<typeof createClient>,
): Promise<string> {
  const parts: string[] = [];

  try {
    // Pending actions
    const { count: actionCount } = await supabase
      .from("moneypenny_actions")
      .select("*", { count: "exact", head: true })
      .neq("status", "done");
    parts.push(`${actionCount || 0} pending actions`);

    // Unread inbox
    const { count: inboxCount } = await supabase
      .from("moneypenny_inbox")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread");
    parts.push(`${inboxCount || 0} unread inbox`);

    // Pending social drafts
    const { count: draftCount } = await supabase
      .from("moneypenny_social_drafts")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft");
    parts.push(`${draftCount || 0} social drafts awaiting approval`);

    // Today's ideas
    const today = new Date().toISOString().split("T")[0];
    const { count: ideaCount } = await supabase
      .from("moneypenny_ideas")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today);
    parts.push(`${ideaCount || 0} ideas captured today`);
  } catch (e) {
    parts.push("(status unavailable)");
  }

  return parts.join(". ");
}

function buildSystemPrompt(platformContext: string): string {
  return `You are Moneypenny, the AI executive assistant for Liana Banyan Corporation.
You are texting with the Founder (Jonathan). Keep responses SHORT — under 160 characters when possible, max 320 characters. You have personality but get to the point.

Current platform status: ${platformContext}

Today's date: ${new Date().toISOString().split("T")[0]}

Quick commands the Founder might text:
- "status" → reply with platform summary
- "inbox" → pending inbox items count and top priority
- "deploy?" → last deploy info
- "next" → what's queued for next session
- "approve [id]" → acknowledge (actual approval happens in dashboard)
- Normal questions or instructions → answer concisely

Rules:
- Sign off as "— MP" on the FIRST message of a new conversation only
- Never use emojis unless the Founder does first
- If you don't know something, say so in under 20 words
- SEC-safe language always: "sponsorship" not "investment", "backing" not "returns"
- NEVER mention: Godfather by name, wife by name, birth date, lawyer by name, prior startups by name, or business entities by name`;
}
