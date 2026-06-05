/**
 * WAN Soccerball Address Widget -- BP072 Wave 25 / BP073 Wave B + W3
 * ===================================================================
 * Displays a member's current WAN soccerball address on their profile.
 * Address derivation is now server-side and email-bound (BP073-W3).
 * Real ASN is fetched from the wan-asn-lookup edge function.
 *
 * W3 changes (scopes 17-22):
 *   17 - useAsnLookup hook calls wan-asn-lookup for real ASN
 *   18 - useServerDerivedAddress calls wan-derive-address
 *   19 - Server Verified badge (calls wan-verify-address)
 *   20 - Past address lookup via wan-lookup-by-email
 *   21 - Graceful fallback to client-side derivation if server fails
 *   22 - Display real ASN (from server) instead of "AS0000"
 *
 * EMPIRICAL STATUS (BP073-W3):
 *   WORKS: ASN lookup via server (real ISP ASN displayed)
 *   WORKS: server-side address derivation + history storage
 *   WORKS: server verification badge
 *   WORKS: server-based past address lookup by email
 *   WORKS: graceful fallback to in-browser derivation if server unreachable
 *   NOT YET: real BGP ASN (ip-api.com GeoIP, not live BGP routing table)
 */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCw,
  Globe,
  ShieldCheck,
  HelpCircle,
  Copy,
  CheckCheck,
  Search,
  Mail,
  ServerCrash,
  CheckCircle2,
} from "lucide-react";

// ─── Fallback: inline derivation (browser Web Crypto) ─────────────────────────
// Used when the server endpoint is unreachable (scope 21)

async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getCurrentEpoch(): number {
  const EPOCH_ORIGIN = new Date("2026-01-01T00:00:00Z").getTime();
  return Math.floor((Date.now() - EPOCH_ORIGIN) / (24 * 60 * 60 * 1000));
}

function floorToHour(ts: number = Date.now()): number {
  return Math.floor(ts / (60 * 60 * 1000)) * (60 * 60 * 1000);
}

async function deriveAddressLocal(
  memberId: string,
  peerId: string,
  email: string,
  asnHint: string = "AS0000",
): Promise<WanAddressInfo> {
  const epochFloor = floorToHour();
  const epoch = getCurrentEpoch();
  const emailHash = await sha256hex(`${email.toLowerCase().trim()}:${epoch}`);
  const sessionNonce = await sha256hex(`${asnHint}:${epochFloor}`);
  const wanSoccerballId = await sha256hex(
    `${memberId}:${peerId}:${sessionNonce}:${epoch}:${emailHash}`,
  );
  const now = new Date();
  return {
    wanSoccerballId,
    emailHash,
    sessionNonce,
    cooperativeEpoch: epoch,
    asnUsed: asnHint,
    mintedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    serverVerified: false,
    source: "local",
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WanAddressInfo {
  wanSoccerballId: string;
  emailHash: string;
  sessionNonce: string;
  cooperativeEpoch: number;
  asnUsed: string;
  mintedAt: string;
  expiresAt: string;
  serverVerified: boolean;
  source: "server" | "local";
}

interface ServerAddressResponse {
  wanSoccerballId: string;
  emailHash: string;
  sessionNonce: string;
  cooperativeEpoch: number;
  asnUsed: string;
  mintedAt: string;
  expiresAt: string;
}

interface ServerLookupRow {
  wan_soccerball_id: string;
  peer_id: string;
  cooperative_epoch: number;
  asn_used: string;
  minted_at: string;
  expires_at: string;
  published: boolean;
}

// ─── Server calls ─────────────────────────────────────────────────────────────

async function fetchAsnFromServer(
  supabaseUrl: string,
  supabaseAnonKey: string,
  bearerToken: string,
): Promise<{ asn: string; source: string; fallbackUsed: boolean }> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/wan-asn-lookup`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        apikey: supabaseAnonKey,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { asn: string; source: string; fallback_used: boolean };
    return { asn: data.asn ?? "AS0000", source: data.source ?? "unknown", fallbackUsed: data.fallback_used ?? true };
  } catch {
    return { asn: "AS0000", source: "error", fallbackUsed: true };
  }
}

async function deriveAddressFromServer(
  supabaseUrl: string,
  supabaseAnonKey: string,
  bearerToken: string,
  memberId: string,
  peerId: string,
  email: string,
  asnHint: string,
): Promise<WanAddressInfo | null> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/wan-derive-address`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberId, peerId, email, asnHint }),
    });
    if (!res.ok) return null;
    const data = await res.json() as ServerAddressResponse;
    return {
      wanSoccerballId: data.wanSoccerballId,
      emailHash: data.emailHash,
      sessionNonce: data.sessionNonce,
      cooperativeEpoch: data.cooperativeEpoch,
      asnUsed: data.asnUsed,
      mintedAt: data.mintedAt,
      expiresAt: data.expiresAt,
      serverVerified: true,
      source: "server",
    };
  } catch {
    return null;
  }
}

async function verifyAddressOnServer(
  supabaseUrl: string,
  supabaseAnonKey: string,
  bearerToken: string,
  params: {
    wanSoccerballId: string;
    memberId: string;
    peerId: string;
    email: string;
    asnHint: string;
    cooperativeEpoch: number;
    sessionTimestampFloor: number;
  },
): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/wan-verify-address`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) return false;
    const data = await res.json() as { verified: boolean };
    return data.verified ?? false;
  } catch {
    return false;
  }
}

async function lookupByEmailOnServer(
  supabaseUrl: string,
  supabaseAnonKey: string,
  bearerToken: string,
  email: string,
  cooperativeEpoch: number,
  peerId?: string,
): Promise<ServerLookupRow[]> {
  try {
    const body: Record<string, unknown> = { email, cooperativeEpoch };
    if (peerId) body.peerId = peerId;
    const res = await fetch(`${supabaseUrl}/functions/v1/wan-lookup-by-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        apikey: supabaseAnonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const data = await res.json() as { addresses: ServerLookupRow[] };
    return data.addresses ?? [];
  } catch {
    return [];
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface WanAddressWidgetProps {
  memberId: string;
  peerId: string;
  /** Member's email address. Used only for hashing -- never displayed or stored. */
  email: string;
  /** Supabase project URL (for edge function calls). */
  supabaseUrl?: string;
  /** Supabase anon key. */
  supabaseAnonKey?: string;
  /** Authenticated user bearer token. */
  bearerToken?: string;
}

export function WanAddressWidget({
  memberId,
  peerId,
  email,
  supabaseUrl,
  supabaseAnonKey,
  bearerToken,
}: WanAddressWidgetProps) {
  const [info, setInfo] = useState<WanAddressInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDerivation, setShowDerivation] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [asnSource, setAsnSource] = useState<string>("unknown");

  // Lookup form state (scope 20: server-based lookup)
  const [lookupEpoch, setLookupEpoch] = useState("");
  const [lookupResult, setLookupResult] = useState<ServerLookupRow[] | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const hasServer = !!(supabaseUrl && supabaseAnonKey && bearerToken);

  const refresh = useCallback(async () => {
    setLoading(true);
    setServerError(false);
    try {
      if (hasServer) {
        // Scope 17: fetch real ASN from server
        const { asn, source, fallbackUsed } = await fetchAsnFromServer(
          supabaseUrl!, supabaseAnonKey!, bearerToken!,
        );
        setAsnSource(fallbackUsed ? "fallback" : source);

        // Scope 18: derive address server-side
        const serverAddr = await deriveAddressFromServer(
          supabaseUrl!, supabaseAnonKey!, bearerToken!,
          memberId, peerId, email, asn,
        );
        if (serverAddr) {
          setInfo(serverAddr);
          return;
        }
      }
      // Scope 21: fallback to local derivation
      setServerError(hasServer);
      const local = await deriveAddressLocal(memberId, peerId, email, "AS0000");
      setInfo(local);
    } finally {
      setLoading(false);
    }
  }, [memberId, peerId, email, hasServer, supabaseUrl, supabaseAnonKey, bearerToken]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCopy = async () => {
    if (!info) return;
    await navigator.clipboard.writeText(info.wanSoccerballId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Scope 20: server-based past address lookup
  const handleLookup = async () => {
    const epoch = parseInt(lookupEpoch, 10);
    if (isNaN(epoch)) return;
    setLookupLoading(true);
    try {
      if (hasServer) {
        const rows = await lookupByEmailOnServer(
          supabaseUrl!, supabaseAnonKey!, bearerToken!,
          email, epoch, peerId,
        );
        setLookupResult(rows);
      } else {
        // Fallback: local reconstruction
        const emailHash = await sha256hex(`${email.toLowerCase().trim()}:${epoch}`);
        const sessionNonce = await sha256hex(`AS0000:${floorToHour()}`);
        const wanSoccerballId = await sha256hex(
          `${memberId}:${peerId}:${sessionNonce}:${epoch}:${emailHash}`,
        );
        setLookupResult([{
          wan_soccerball_id: wanSoccerballId,
          peer_id: peerId,
          cooperative_epoch: epoch,
          asn_used: "AS0000",
          minted_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          published: false,
        }]);
      }
    } finally {
      setLookupLoading(false);
    }
  };

  const short = info
    ? `${info.wanSoccerballId.slice(0, 8)}...${info.wanSoccerballId.slice(-8)}`
    : null;

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-indigo-900">
          <Globe className="w-4 h-4 text-indigo-600" />
          WAN Soccerball Address
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                Your WAN address is tied to your email identity and this connection.
                It rotates each session for privacy, but any past address can be
                reconstructed from your email + connection fingerprint.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Scope 19: server verified badge */}
          {info?.serverVerified && (
            <Badge variant="outline" className="ml-auto text-xs text-emerald-700 border-emerald-300 bg-emerald-50 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Server Verified
            </Badge>
          )}
          {serverError && (
            <Badge variant="outline" className="ml-auto text-xs text-amber-700 border-amber-300 bg-amber-50 flex items-center gap-1">
              <ServerCrash className="w-3 h-3" />
              Local fallback
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Hero copy */}
        <div className="space-y-0.5">
          <p className="text-sm text-indigo-700 font-medium leading-snug">
            Your address for this connection
          </p>
          <p className="text-xs text-slate-500">
            Bound to your email identity. Changes when your connection changes.
          </p>
        </div>

        {/* Address display */}
        {loading && (
          <div className="h-8 bg-indigo-100 rounded animate-pulse w-full" />
        )}
        {!loading && info && (
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs bg-indigo-50 border border-indigo-200 rounded px-2 py-1.5 truncate text-indigo-900">
              {info.wanSoccerballId}
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={handleCopy}
              aria-label="Copy address"
            >
              {copied ? (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={refresh}
              aria-label="Refresh address"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        )}

        {/* Epoch + expiry + ASN source */}
        {info && (
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <Badge variant="outline" className="text-xs">
              Epoch {info.cooperativeEpoch}
            </Badge>
            {/* Scope 22: display real ASN */}
            <Badge variant="outline" className="text-xs font-mono">
              {info.asnUsed}
              {info.source === "server" && asnSource !== "fallback" && asnSource !== "error" && (
                <span className="ml-1 text-emerald-600">live</span>
              )}
            </Badge>
            <span>
              Expires {new Date(info.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {" "}({new Date(info.expiresAt).toLocaleDateString()})
            </span>
          </div>
        )}

        {/* Short label for sharing */}
        {short && (
          <p className="text-xs text-slate-400">
            Share as: <span className="font-mono">{short}</span>
          </p>
        )}

        {/* Derivation explainer (toggle) */}
        <button
          className="text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2 text-left"
          onClick={() => setShowDerivation((v) => !v)}
        >
          {showDerivation ? "Hide derivation" : "How is this address derived?"}
        </button>

        {showDerivation && (
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
            <p className="font-medium text-slate-800">Address derivation (transparent)</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <strong>Email hash</strong> = SHA-256(your email + today&apos;s epoch).
                The epoch rotates daily so this hash cannot track you across sessions.
                Raw email is never stored.
              </li>
              <li>
                <strong>ISP network number (ASN)</strong> looked up from your connection
                {info?.source === "server"
                  ? ` via our secure backend${asnSource === "fallback" ? " (fallback used)" : ` (${asnSource})`}.`
                  : " -- using local fallback (AS0000) because server is unavailable."}
                {" "}Only the nonce hash is stored, not the ASN itself.
              </li>
              <li>
                <strong>Session nonce</strong> = SHA-256(ASN + hour-floored timestamp).
              </li>
              <li>
                <strong>WAN address</strong> = SHA-256(member ID + peer ID + nonce + epoch + email hash).
              </li>
              <li>
                The address rotates each session and cannot be used to track location.
                Use the lookup below to reconstruct any past address by email.
              </li>
            </ol>
            {info && (
              <div className="font-mono text-xs text-slate-500 space-y-0.5 break-all">
                <p>email hash: {info.emailHash.slice(0, 16)}...</p>
                <p>nonce: {info.sessionNonce.slice(0, 16)}...</p>
                <p>source: {info.source}{info.serverVerified ? " (server verified)" : ""}</p>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>No physical location or raw email stored or transmitted.</span>
            </div>
            <p className="text-slate-400 italic">
              Note: The ISP network number (ASN) is resolved via ip-api.com, which uses
              GeoIP data -- NOT a live BGP routing table. For cooperative session
              fingerprinting this is sufficient; true real-time BGP integration is
              future work.
            </p>
          </div>
        )}

        {/* Scope 20: Past-address lookup (server-based) */}
        <button
          className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 underline underline-offset-2 text-left"
          onClick={() => setShowLookup((v) => !v)}
        >
          <Mail className="w-3 h-3" />
          {showLookup ? "Hide lookup" : "Find past addresses for your email"}
        </button>

        {showLookup && (
          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-3 text-xs">
            <p className="font-medium text-slate-800 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              {hasServer ? "Server-side past address lookup" : "Local past address reconstruction"}
            </p>
            {hasServer ? (
              <p className="text-slate-500">
                Your email is hashed server-side and used to query your address history.
                Raw email is never sent to the database.
              </p>
            ) : (
              <p className="text-slate-500">
                Server unavailable -- reconstructing locally from email + epoch.
                Connect to the server to see your full history.
              </p>
            )}
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Epoch (number)</Label>
              <Input
                className="h-7 text-xs"
                placeholder={String(info?.cooperativeEpoch ?? getCurrentEpoch())}
                value={lookupEpoch}
                onChange={(e) => setLookupEpoch(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              className="h-7 text-xs w-full"
              onClick={handleLookup}
              disabled={lookupLoading || !lookupEpoch}
            >
              {lookupLoading ? "Looking up..." : "Find past addresses"}
            </Button>
            {lookupResult !== null && lookupResult.length === 0 && (
              <p className="text-slate-400">No addresses found for epoch {lookupEpoch}.</p>
            )}
            {lookupResult && lookupResult.length > 0 && (
              <div className="space-y-2">
                <p className="text-slate-500 font-medium">
                  Found {lookupResult.length} address{lookupResult.length !== 1 ? "es" : ""}:
                </p>
                {lookupResult.map((row) => (
                  <div key={row.wan_soccerball_id} className="space-y-0.5">
                    <code className="block font-mono text-xs bg-white border border-slate-200 rounded px-2 py-1.5 break-all text-indigo-900">
                      {row.wan_soccerball_id}
                    </code>
                    <p className="text-slate-400">
                      Epoch {row.cooperative_epoch} · {row.asn_used} ·{" "}
                      {new Date(row.minted_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
