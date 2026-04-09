export function getCryptoSecretBytes() {
  const secret = Deno.env.get("FOUNDER_CALENDAR_TOKEN_SECRET") || "";
  if (!secret) {
    throw new Error("Missing FOUNDER_CALENDAR_TOKEN_SECRET");
  }
  return new TextEncoder().encode(secret);
}

async function deriveAesKey(secretBytes: Uint8Array) {
  const hash = await crypto.subtle.digest("SHA-256", secretBytes);
  return crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptToken(plainText: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(getCryptoSecretBytes());
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plainText),
  );

  return {
    cipherText: toBase64(new Uint8Array(encrypted)),
    ivBase64: toBase64(iv),
  };
}

export async function decryptToken(cipherText: string, ivBase64: string) {
  const iv = fromBase64(ivBase64);
  const data = fromBase64(cipherText);
  const key = await deriveAesKey(getCryptoSecretBytes());
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  return new TextDecoder().decode(decrypted);
}

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
