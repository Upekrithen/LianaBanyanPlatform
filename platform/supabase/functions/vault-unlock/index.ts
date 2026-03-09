/**
 * VAULT UNLOCK — Family Table Vault Access with Notifications
 * ============================================================
 * Called when a family member successfully enters their Loteria card name
 * at the Durin's Door gate.
 * 
 * Actions:
 *   1. Validates the card name matches the person
 *   2. Sends personalized email via Resend
 *   3. Sends personalized SMS via Twilio
 *   4. Returns success with vault content URL
 * 
 * Request body:
 *   - person: string (diana, ben, noah, ama, isa, ylona)
 *   - cardName: string (la luna, la calavera, etc.)
 * 
 * Environment variables needed:
 *   - RESEND_API_KEY (already configured)
 *   - TWILIO_ACCOUNT_SID
 *   - TWILIO_AUTH_TOKEN
 *   - TWILIO_PHONE_NUMBER
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════════════════════════════════════════
// TEST MODE: When true, ALL notifications go to Support@LianaBanyan.com
// Set to false to enable real family notifications
// ═══════════════════════════════════════════════════════════════════════════
const TEST_MODE = true;  // TEST MODE - All SMS goes to Jonathan
const TEST_EMAIL = 'Support@LianaBanyan.com';
const TEST_PHONE = '+12108234310'; // Jonathan's phone for SMS testing

// Family member data - card assignments and contact info
interface FamilyMember {
  name: string;
  cardName: string;
  cardNameAlt: string[];  // Alternative spellings
  symbol: string;
  phone: string;
  email: string;
  song?: string;
  personalMessage: string;
}

// CONFIGURE: Family contact information
// Phone numbers and emails will be filled in by Jonathan
const FAMILY_MEMBERS: Record<string, FamilyMember> = {
  jonathan: {
    name: "Jonathan",
    cardName: "el sol",
    cardNameAlt: ["elsol", "sol", "the sun", "sun"],
    symbol: "☀️",
    phone: "", // Dad's phone
    email: "",
    personalMessage: "The sun that lights the way.",
  },
  diana: {
    name: "Diana",
    cardName: "la luna",
    cardNameAlt: ["laluna", "luna", "the moon", "moon"],
    symbol: "🌙",
    phone: "+12108234961",
    email: "",
    song: "never-tear-us-apart-edited.m4a",
    personalMessage: "For the sun loves the moon so much that he dies every night to let her breathe, and in return, she reflects his love.",
  },
  ben: {
    name: "Ben",
    cardName: "la calavera",
    cardNameAlt: ["lacalavera", "calavera", "the skull", "skull"],
    symbol: "💀",
    phone: "+12102044896",
    email: "",
    song: "sons-song.m4a",
    personalMessage: "The skull reminds us that time is precious. Use it wisely.",
  },
  noah: {
    name: "Noah",
    cardName: "la mano",
    cardNameAlt: ["lamano", "mano", "the hand", "hand"],
    symbol: "✋",
    phone: "+12105487476",
    email: "",
    song: "sons-song.m4a",
    personalMessage: "The hand that builds, creates, and helps others.",
  },
  ama: {
    name: "Ama",
    cardName: "la rosa",
    cardNameAlt: ["larosa", "rosa", "the rose", "rose", "la chalupa", "chalupa"],
    symbol: "🌹",
    phone: "+12102043710",
    email: "",
    song: "daughters-song.m4a",
    personalMessage: "You are BOTH roses and boats. Beautiful, strong, full of talents.",
  },
  isa: {
    name: "Isa",
    cardName: "la chalupa",
    cardNameAlt: ["lachalupa", "chalupa", "the boat", "boat", "la rosa", "rosa"],
    symbol: "⛵",
    phone: "+12107939145",
    email: "",
    song: "daughters-song.m4a",
    personalMessage: "You are BOTH boats and roses. Navigating waters, carrying others to safety.",
  },
  ylona: {
    name: "Ylona",
    cardName: "el arbol",
    cardNameAlt: ["elarbol", "arbol", "the tree", "tree", "el árbol", "árbol", "el àrbol", "àrbol", "elárbol", "elarból", "el arból", "la arbol", "la árbol"],
    symbol: "🌳",
    phone: "+17268951343",
    email: "",
    song: "daughters-song.m4a",
    personalMessage: "The tree with roots that run deep and branches that reach high.",
  },
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { person, cardName } = body;

    if (!person || !cardName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing person or cardName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize inputs
    const personKey = person.toLowerCase().trim();
    const enteredCard = cardName.toLowerCase().trim().replace(/\s+/g, ' ');

    // Find the family member
    const member = FAMILY_MEMBERS[personKey];
    if (!member) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unknown family member' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if card name matches
    const validNames = [member.cardName, ...member.cardNameAlt];
    const isValid = validNames.some(name => 
      name.toLowerCase().replace(/\s+/g, ' ') === enteredCard ||
      enteredCard.includes(name.toLowerCase())
    );

    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Incorrect card name',
          hint: `Hint: Your card has a ${member.symbol} on it...`
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🚪 ${member.name} unlocked their vault with "${cardName}"`);

    // ─── RECORD VAULT UNLOCK ───
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert the unlock record (insert or update if exists)
    const { error: unlockError } = await supabase
      .from('vault_unlocks')
      .upsert(
        { person: personKey, unlocked_at: new Date().toISOString() },
        { onConflict: 'person' }
      );

    if (unlockError) {
      console.error('Error recording vault unlock:', unlockError);
    } else {
      console.log(`📝 Recorded vault unlock for ${member.name}`);
    }

    // ─── SEND EMAIL ───
    const resendKey = Deno.env.get('RESEND_API_KEY');
    let emailSent = false;

    // In TEST_MODE, send to test email instead of family member
    const targetEmail = TEST_MODE ? TEST_EMAIL : member.email;
    const emailSubjectPrefix = TEST_MODE ? `[TEST - ${member.name}] ` : '';

    if (resendKey && targetEmail) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Liana Banyan Family <noreply@lianabanyan.com>',
            to: [targetEmail],
            subject: `${emailSubjectPrefix}${member.symbol} ${member.name}, your vault is unlocked!`,
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="font-size: 64px;">${member.symbol}</div>
                  <h1 style="font-size: 28px; font-weight: bold; margin: 16px 0 8px;">Welcome to Your Vault</h1>
                  <p style="color: #666; font-size: 16px;">${member.cardName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                  <p style="font-size: 18px; line-height: 1.6; color: #78350f; margin: 0; font-style: italic;">
                    "${member.personalMessage}"
                  </p>
                </div>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
                  This space belongs to you and Dad together.<br>
                  A place to store memories, share moments, and stay connected.
                </p>
                
                ${member.song ? `
                <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; margin-top: 24px; text-align: center;">
                  <p style="color: #374151; font-size: 14px; margin: 0;">
                    🎵 A song is waiting for you in your vault...
                  </p>
                </div>
                ` : ''}
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
                  Happy Valentine's Day 2026<br>
                  With all my love — Dad
                </p>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          emailSent = true;
          console.log(`📧 Email sent to ${member.name}`);
        } else {
          console.error('Resend error:', await emailResponse.text());
        }
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
      }
    }

    // ─── SMS DISABLED ───
    // A2P 10DLC registration required for US numbers - sending manually instead
    const smsSent = false;

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        person: member.name,
        symbol: member.symbol,
        emailSent,
        smsSent,
        message: `Welcome, ${member.name}! Your vault awaits.`,
        song: member.song || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Vault unlock error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
