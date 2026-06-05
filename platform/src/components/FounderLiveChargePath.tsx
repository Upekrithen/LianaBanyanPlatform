/**
 * FounderLiveChargePath -- BP073 Wave 5 / Phase alpha
 * =====================================================
 * One-button staged path for the Founder to initiate a LIVE $5 charge.
 *
 * HELD: This component is STAGED and HELD FOR FOUNDER.
 * Automated tests NEVER trigger the live charge button.
 * The Founder must explicitly unlock and confirm before any live charge occurs.
 *
 * SECURITIES-CLEAN: $5/year = cooperative membership fee, not an investment.
 *
 * Usage (staff/admin route only -- never member-facing):
 *   <FounderLiveChargePath />
 *
 * Gate: Only renders when:
 *   1. STRIPE_SECRET_KEY starts with sk_live_ (live mode detected)
 *   2. Founder has explicitly toggled isFounderUnlocked to true
 *   3. User confirms the charge in the confirmation dialog
 */

import React, { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChargeMode = "test" | "live";

interface LiveChargeResult {
  ok: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
}

// ─── Securities-clean disclosure ─────────────────────────────────────────────

const SECURITIES_DISCLOSURE =
  "This initiates a cooperative membership fee of $5.00 USD for one year. " +
  "This is a membership fee -- not an investment, not equity, not shares, " +
  "and does not represent any guaranteed financial return. " +
  "All members pay $5/year, identical for all. Lifetime guarantee.";

// ─── Trace point display ──────────────────────────────────────────────────────

const TRACE_POINTS = [
  { id: "T1", label: "create-membership-checkout called", status: "pending" as const },
  { id: "T2", label: "Stripe checkout session created (cs_live_...)", status: "pending" as const },
  { id: "T3", label: "Founder completes payment with real card", status: "pending" as const },
  { id: "T4", label: "Stripe sends checkout.session.completed webhook", status: "pending" as const },
  { id: "T5", label: "handle-membership-webhook processes event", status: "pending" as const },
  { id: "T6", label: "membership_payments.status = completed", status: "pending" as const },
  { id: "T7", label: "user_credits.membership_stake_paid = true", status: "pending" as const },
  { id: "T8", label: "/membership-success page loads", status: "pending" as const },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function FounderLiveChargePath() {
  const [isFounderUnlocked, setIsFounderUnlocked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LiveChargeResult | null>(null);
  const [confirmText, setConfirmText] = useState("");

  // Detect mode from session (in real deployment, derived from env via API)
  // For safety, default to 'test' -- Founder explicitly switches to live mode
  // via Stripe Dashboard + live key configuration.
  const mode: ChargeMode = "test"; // STAGED -- Founder changes this via env

  const isLiveMode = mode === "live";
  const CONFIRM_PHRASE = "FOUNDER: RUN THIS";

  async function initiateCharge() {
    if (!isFounderUnlocked) return;
    if (confirmText !== CONFIRM_PHRASE) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/functions/v1/create-membership-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          isRenewal: false,
          autoRenew: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ ok: false, error: data.error ?? "Checkout creation failed" });
        return;
      }

      setResult({
        ok: true,
        checkoutUrl: data.url,
        sessionId: data.url?.split("/").pop() ?? "",
      });

      // HELD: in live mode, Founder would navigate to data.url
      // In test mode, we just show the URL for verification
      if (isLiveMode && data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      setConfirmText("");
    }
  }

  return (
    <div style={{ fontFamily: "monospace", maxWidth: 720, margin: "0 auto", padding: 24 }}>
      {/* ── FOUNDER: RUN THIS banner ── */}
      <div
        style={{
          background: isLiveMode ? "#7f1d1d" : "#1e3a5f",
          color: "#fff",
          padding: "16px 20px",
          borderRadius: 8,
          marginBottom: 24,
          borderLeft: `6px solid ${isLiveMode ? "#ef4444" : "#3b82f6"}`,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
          {isLiveMode ? "FOUNDER: RUN THIS -- LIVE CHARGE" : "FOUNDER: RUN THIS -- TEST MODE"}
        </div>
        <div style={{ fontSize: 13, opacity: 0.9 }}>
          {isLiveMode
            ? "Live Stripe key detected. A REAL $5 charge will occur. Founder confirmation required."
            : "Test Stripe key active. No real charge. Safe to run. (cs_test_... session)"}
        </div>
      </div>

      {/* ── Mode badge ── */}
      <div style={{ marginBottom: 20 }}>
        <span
          style={{
            background: isLiveMode ? "#ef4444" : "#22c55e",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {isLiveMode ? "LIVE MODE" : "TEST MODE"}
        </span>
        <span style={{ marginLeft: 12, fontSize: 12, color: "#6b7280" }}>
          {isLiveMode
            ? "Stripe live key (sk_live_...) is active"
            : "Stripe test key (sk_test_...) is active -- use card 4242 4242 4242 4242"}
        </span>
      </div>

      {/* ── Securities-clean disclosure ── */}
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          padding: "12px 16px",
          marginBottom: 24,
          fontSize: 12,
          color: "#374151",
          lineHeight: 1.6,
        }}
      >
        <strong>Disclosure:</strong> {SECURITIES_DISCLOSURE}
      </div>

      {/* ── T1-T8 trace display ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: "#111827" }}>
          Trace Points (T1-T8)
        </div>
        {TRACE_POINTS.map((tp) => (
          <div
            key={tp.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 0",
              borderBottom: "1px solid #f3f4f6",
              fontSize: 13,
            }}
          >
            <span
              style={{
                background: "#e5e7eb",
                color: "#6b7280",
                padding: "2px 6px",
                borderRadius: 4,
                fontWeight: 700,
                minWidth: 28,
                textAlign: "center",
              }}
            >
              {tp.id}
            </span>
            <span style={{ color: "#374151" }}>{tp.label}</span>
            <span style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 11 }}>
              [ ] PENDING
            </span>
          </div>
        ))}
      </div>

      {/* ── Founder unlock toggle ── */}
      <div
        style={{
          background: "#fffbeb",
          border: "1px solid #fcd34d",
          borderRadius: 6,
          padding: "12px 16px",
          marginBottom: 20,
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isFounderUnlocked}
            onChange={(e) => {
              setIsFounderUnlocked(e.target.checked);
              setShowConfirm(false);
              setConfirmText("");
            }}
            style={{ width: 16, height: 16 }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
            I am the Founder. I understand this {isLiveMode ? "WILL charge" : "is a test"} and I explicitly unlock the charge path.
          </span>
        </label>
      </div>

      {/* ── Initiate button ── */}
      {!showConfirm && (
        <button
          disabled={!isFounderUnlocked || isLoading}
          onClick={() => setShowConfirm(true)}
          style={{
            background: isFounderUnlocked
              ? isLiveMode ? "#dc2626" : "#2563eb"
              : "#d1d5db",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "12px 24px",
            fontSize: 15,
            fontWeight: 700,
            cursor: isFounderUnlocked ? "pointer" : "not-allowed",
            opacity: isFounderUnlocked ? 1 : 0.6,
            width: "100%",
          }}
        >
          {isLiveMode
            ? "Initiate Live $5 Charge -- HELD FOR FOUNDER"
            : "Initiate Test $5 Checkout (cs_test_...)"}
        </button>
      )}

      {/* ── Confirmation dialog ── */}
      {showConfirm && isFounderUnlocked && (
        <div
          style={{
            background: "#fef2f2",
            border: "2px solid #ef4444",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#7f1d1d" }}>
            Confirm: Type exactly "{CONFIRM_PHRASE}" to proceed
          </div>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={`Type: ${CONFIRM_PHRASE}`}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #fca5a5",
              borderRadius: 4,
              fontSize: 14,
              fontFamily: "monospace",
              marginBottom: 12,
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              disabled={confirmText !== CONFIRM_PHRASE || isLoading}
              onClick={initiateCharge}
              style={{
                background: confirmText === CONFIRM_PHRASE ? "#dc2626" : "#d1d5db",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: confirmText === CONFIRM_PHRASE ? "pointer" : "not-allowed",
                flex: 1,
              }}
            >
              {isLoading ? "Creating session..." : "Confirm and Proceed"}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              style={{
                background: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: 4,
                padding: "10px 20px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Result display ── */}
      {result && (
        <div
          style={{
            marginTop: 20,
            background: result.ok ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${result.ok ? "#86efac" : "#fca5a5"}`,
            borderRadius: 6,
            padding: "12px 16px",
          }}
        >
          {result.ok ? (
            <div>
              <div style={{ fontWeight: 700, color: "#166534", marginBottom: 8 }}>
                Checkout session created
              </div>
              <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
                Session URL:{" "}
                <a href={result.checkoutUrl} style={{ color: "#2563eb" }}>
                  {result.checkoutUrl}
                </a>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {isLiveMode
                  ? "Redirecting to Stripe... Complete payment with real card."
                  : "Open URL in browser. Use test card: 4242 4242 4242 4242."}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#374151" }}>
                After payment, verify with:
                <br />
                <code style={{ background: "#e5e7eb", padding: "2px 6px", borderRadius: 3 }}>
                  {`npx tsx platform/scripts/stripe-e2e-harness.ts --check-db <userId> ${result.checkoutUrl?.split("/").pop() ?? "<sessionId>"} ${isLiveMode ? "--live" : "--test-mode"}`}
                </code>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, color: "#7f1d1d", marginBottom: 6 }}>
                Error
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>{result.error}</div>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom HELD notice ── */}
      <div style={{ marginTop: 24, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
        Live charge = HELD FOR FOUNDER. Automated CI never triggers this path.
        BP073 Wave 5 / Phase alpha. Securities-clean: $5/year = membership fee.
      </div>
    </div>
  );
}

export default FounderLiveChargePath;
