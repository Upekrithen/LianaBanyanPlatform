import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('PINATA_API_KEY');
  const secretKey = Deno.env.get('PINATA_SECRET_KEY');

  if (!apiKey || !secretKey) {
    return new Response(
      JSON.stringify({ error: 'IPFS service not configured' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { metadata, name } = body;

    const pinResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: name || 'lb-ledger-entry' },
      }),
    });

    if (!pinResponse.ok) {
      const err = await pinResponse.text();
      return new Response(
        JSON.stringify({ error: 'Pinata error', details: err }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await pinResponse.json();
    return new Response(
      JSON.stringify({
        cid: result.IpfsHash,
        timestamp: result.Timestamp,
        size: result.PinSize,
        gateway_url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
