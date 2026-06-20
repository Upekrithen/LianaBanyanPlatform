// keys-engines-sign-update/index.ts
// BP087 Wave 4 · Keys and Engines · Cephas deploy-time signer
// Called by deploy pipeline after latest.yml is staged.
// Returns: SignedKey JSON → caller writes to Cephas-hugo/static/download/latest.yml.sig

import { buildSignedKey } from '../../src/main/keys_engines/key_signer.ts';

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { payloadBase64, version } = body as { payloadBase64: string; version: string };

  const privateKeyHex = Deno.env.get('THORAX_PRIVATE_KEY_HEX') ?? '';
  const publicKeyHex = Deno.env.get('THORAX_PUBLIC_KEY_HEX') ?? '';

  if (!privateKeyHex || !publicKeyHex) {
    return new Response(
      JSON.stringify({ error: 'THORAX key env vars not set' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const payloadBytes = Buffer.from(payloadBase64, 'base64');
  const signedKey = buildSignedKey(payloadBytes, privateKeyHex, publicKeyHex, version);

  return new Response(JSON.stringify(signedKey), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
