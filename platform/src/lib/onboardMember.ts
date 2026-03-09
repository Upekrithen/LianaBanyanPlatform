/**
 * ONBOARD NEW MEMBER
 * ===================
 * Runs once on first login. Handles:
 * 1. Stamp "terms_accept" to IP Ledger
 * 2. Convert ghost feathers → MARKS
 * 3. Initialize personal QR medallion
 * 4. Create invitation cue card (Babylon Candle)
 * 5. Initialize currency rows (credits, marks, joules)
 *
 * Idempotent — checks if already onboarded before running.
 */

import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const ONBOARDED_KEY = "lb_onboarded";

export async function onboardNewMember(user: User): Promise<void> {
  // Skip if already onboarded this browser session
  if (localStorage.getItem(`${ONBOARDED_KEY}_${user.id}`)) return;

  try {
    // Check if already onboarded in DB (has a stamp)
    const { data: existingStamp } = await supabase
      .from("acknowledgment_stamps")
      .select("id")
      .eq("user_id", user.id)
      .eq("action_type", "terms_accept")
      .limit(1)
      .maybeSingle();

    if (existingStamp) {
      localStorage.setItem(`${ONBOARDED_KEY}_${user.id}`, "true");
      return;
    }

    // ─── 1. STAMP: Terms Acceptance ───
    const stampData = `${user.id}:terms_accept:${new Date().toISOString()}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(stampData));
    const stampHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await supabase.from("acknowledgment_stamps").insert({
      user_id: user.id,
      action_type: "terms_accept",
      action_id: "membership_signup",
      stamp_hash: stampHash,
      flagstone_text_shown: "By joining Liana Banyan, you agree to the membership terms. Let your yea be yea and your nay be nay. This acknowledgment is recorded to the IP Ledger.",
      metadata: {
        email: user.email,
        signed_up_at: user.created_at,
        source: window.location.href,
      },
    });

    // ─── 2. CONVERT GHOST FEATHERS → MARKS ───
    const ghostGameState = localStorage.getItem("lb_treasure_map_game");
    let feathersConverted = 0;
    if (ghostGameState) {
      try {
        const state = JSON.parse(ghostGameState);
        feathersConverted = state.totalFeathers || 0;
        if (feathersConverted > 0) {
          // Upsert user_marks
          await supabase.from("user_marks").upsert({
            user_id: user.id,
            total_marks: feathersConverted,
            mark_level: feathersConverted >= 100 ? "sprout" : "seedling",
            voting_multiplier: 1,
            crown_eligible: false,
          }, { onConflict: "user_id" });

          // Record the conversion stamp
          const convStamp = `${user.id}:ghost_convert:${new Date().toISOString()}`;
          const convHash = await crypto.subtle.digest("SHA-256", encoder.encode(convStamp));
          const convStampHash = Array.from(new Uint8Array(convHash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          await supabase.from("acknowledgment_stamps").insert({
            user_id: user.id,
            action_type: "read_confirm",
            action_id: "ghost_feather_conversion",
            stamp_hash: convStampHash,
            flagstone_text_shown: `Converted ${feathersConverted} ghost feathers to MARKS.`,
            metadata: { feathers: feathersConverted, cards_found: state.foundCards?.length || 0 },
          });

          // Clear ghost game state
          localStorage.removeItem("lb_treasure_map_game");
        }
      } catch {
        // Ghost data corrupted, skip
      }
    }

    // ─── 2B. CONVERT GHOST DISCOVERIES ───
    const ghostDiscoveries = localStorage.getItem("lb_ghost_discoveries");
    if (ghostDiscoveries) {
      try {
        const slugs = JSON.parse(ghostDiscoveries) as string[];
        if (slugs.length > 0) {
          // Fetch the cards to get their category_slugs
          const { data: cardData } = await supabase
            .from("discoverable_cards")
            .select("slug, category_slug")
            .in("slug", slugs);

          if (cardData) {
            for (const card of cardData) {
              // Discover the card
              await supabase.from("user_discovery_state").upsert({
                user_id: user.id,
                category_slug: card.category_slug,
                card_slug: card.slug,
              }, { onConflict: "user_id,category_slug,card_slug" });

              // Discover the category
              await supabase.from("user_discovery_state").upsert({
                user_id: user.id,
                category_slug: card.category_slug,
                card_slug: null,
              }, { onConflict: "user_id,category_slug,card_slug" });
            }
          }

          localStorage.removeItem("lb_ghost_discoveries");
        }
      } catch {
        // Ghost discoveries corrupted, skip
      }
    }

    // Convert ghost gate responses
    const ghostGates = localStorage.getItem("lb_gate_responses");
    if (ghostGates) {
      try {
        const gateSlugs = JSON.parse(ghostGates) as string[];
        for (const gateSlug of gateSlugs) {
          await supabase.from("user_gate_responses").upsert({
            user_id: user.id,
            gate_slug: gateSlug,
            response: "accepted",
          }, { onConflict: "user_id,gate_slug" });
        }
        localStorage.removeItem("lb_gate_responses");
      } catch {}
    }

    // ─── 3. PERSONAL QR — Stamp to IP Ledger ───
    // Your QR URL is deterministic from your user ID.
    // Record its creation as an immutable stamp so it's permanently tied to you.
    const qrUrl = `https://lianabanyan.com/RedCarpet?herald=${user.id}`;
    const qrStampData = `${user.id}:personal_qr_create:${qrUrl}:${new Date().toISOString()}`;
    const qrHashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(qrStampData));
    const qrStampHash = Array.from(new Uint8Array(qrHashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    await supabase.from("acknowledgment_stamps").insert({
      user_id: user.id,
      action_type: "cue_card_stamp",
      action_id: "personal_qr_create",
      stamp_hash: qrStampHash,
      flagstone_text_shown: "Your personal QR code has been created and recorded to the IP Ledger. This QR identifies you across the platform — attach it to projects, products, art, contracts, and anything you create or sign.",
      metadata: { qr_url: qrUrl, display_name: user.user_metadata?.full_name || user.email?.split("@")[0] },
    });

    // ─── 4. INITIALIZE CURRENCY ROWS ───
    await supabase.from("user_credits").upsert({
      user_id: user.id,
      eoi_credits: 0,
      eoi_used_credits: 0,
    }, { onConflict: "user_id" }).then(() => {}).catch(() => {});

    if (feathersConverted === 0) {
      await supabase.from("user_marks").upsert({
        user_id: user.id,
        total_marks: 0,
        mark_level: "seedling",
        voting_multiplier: 1,
        crown_eligible: false,
      }, { onConflict: "user_id" }).then(() => {}).catch(() => {});
    }

    await supabase.from("user_joules").upsert({
      user_id: user.id,
      total_joules: 0,
      total_locked_value: 0,
    }, { onConflict: "user_id" }).then(() => {}).catch(() => {});

    // ─── 5. MARK ONBOARDED ───
    localStorage.setItem(`${ONBOARDED_KEY}_${user.id}`, "true");

    console.log(`[Onboard] Member ${user.email} onboarded. Feathers converted: ${feathersConverted}`);
  } catch (err) {
    console.error("[Onboard] Error during onboarding:", err);
    // Non-fatal — user can still use the platform
  }
}
