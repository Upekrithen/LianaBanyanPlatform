// Family Invite - Send email invitation to another family member
// Triggered when someone knocks and wants to invite another person

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// LIVE MODE - Emails go to actual family members
// Changed to LIVE for Valentine's Day 2026!
const TEST_MODE = false;
const TEST_EMAIL = 'Upekrithen@gmail.com';

// Family member data
const FAMILY_MEMBERS: Record<string, { name: string; card: string; symbol: string; email: string }> = {
  diana: { name: 'Diana', card: 'La Luna', symbol: '🌙', email: 'VigilFenix@gmail.com' },
  ben: { name: 'Ben', card: 'La Calavera', symbol: '💀', email: 'Aphobos393@gmail.com' },
  noah: { name: 'Noah', card: 'La Mano', symbol: '✋', email: 'SilverCreetin@gmail.com' },
  ama: { name: 'Ama', card: 'La Rosa', symbol: '🌹', email: 'Amarissa.Vigil.111@gmail.com' },
  isa: { name: 'Isa', card: 'La Chalupa', symbol: '⛵', email: 'BellaVigilJones@gmail.com' },
  ylona: { name: 'Ylona', card: 'El Árbol', symbol: '🌳', email: 'YlonaBearBearJones@gmail.com' },
  jonathan: { name: 'Jonathan', card: 'El Sol', symbol: '☀️', email: 'Upekrithen@gmail.com' },
};

// Map card input to person key
function getPersonFromCard(card: string): string | null {
  const c = card.toLowerCase().trim();
  if (['la luna', 'luna', 'diana'].includes(c)) return 'diana';
  if (['la calavera', 'calavera', 'ben'].includes(c)) return 'ben';
  if (['la mano', 'mano', 'noah'].includes(c)) return 'noah';
  if (['la rosa', 'rosa', 'ama'].includes(c)) return 'ama';
  if (['la chalupa', 'chalupa', 'isa'].includes(c)) return 'isa';
  if (['el árbol', 'el arbol', 'árbol', 'arbol', 'ylona', 'elarbol', 'the tree', 'tree', 'la arbol', 'la árbol'].includes(c)) return 'ylona';
  if (['el sol', 'sol', 'jonathan', 'jon', 'dad', 'papa'].includes(c)) return 'jonathan';
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { fromCard, toCard } = await req.json();

    const fromPerson = getPersonFromCard(fromCard || '');
    const toPerson = getPersonFromCard(toCard || '');

    if (!fromPerson || !toPerson) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid card' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (fromPerson === toPerson) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot invite yourself' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const from = FAMILY_MEMBERS[fromPerson];
    const to = FAMILY_MEMBERS[toPerson];

    // In test mode, all emails go to test email
    const targetEmail = TEST_MODE ? TEST_EMAIL : to.email;

    // Send email via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');

    if (!resendKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Email not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Family Vaults <noreply@lianabanyan.com>',
        to: [targetEmail],
        subject: `${from.symbol} ${from.card} is calling you to the Family Vaults!`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: linear-gradient(135deg, #1a1a2e, #16213e); color: #e8d5b7; border-radius: 16px;">
            <h1 style="color: #ffd700; text-align: center;">${from.symbol} A Call to Gather ${to.symbol}</h1>

            <p style="font-size: 1.2rem; text-align: center; margin: 1.5rem 0;">
              <strong>${from.card}</strong> has knocked at the Family Vaults<br>
              and is waiting for <strong>${to.card}</strong> to join!
            </p>

            <p style="text-align: center; font-style: italic; color: #8a8aaa;">
              "Alone we can do so little; together we can do so much."<br>
              – Helen Keller
            </p>

            <div style="text-align: center; margin: 2rem 0;">
              <a href="https://upekrithen.web.app/fenix"
                 style="display: inline-block; padding: 1rem 2rem; background: #ffd700; color: #1a1a2e; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem;">
                🏰 Enter the Vaults
              </a>
            </div>

            <p style="text-align: center; color: #ff6b6b; font-size: 0.9rem;">
              ⏱ Hurry! Knocks expire after 5 minutes...
            </p>

            <p style="text-align: center; margin-top: 2rem; font-size: 0.8rem; color: #6a6a8a;">
              — The Family Table —
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invitation sent to ${to.card}!`,
        from: from.card,
        to: to.card,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
