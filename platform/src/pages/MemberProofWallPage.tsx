// MemberProofWallPage.tsx
// BP094 - cryptographic provenance proof wall
// No em-dashes anywhere

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MemberProofSubmission {
  id: string;
  member_id: string;
  harness_version: string;
  questions_attempted: number;
  questions_correct: number;
  accuracy: number;
  wall_clock_seconds: number;
  result_json_storage_path: string;
  signature_verified: boolean;
  posse_spot_check_status: string;
  posse_spot_check_match: boolean | null;
  ip_ledger_stamp_id: string | null;
  submitted_at: string;
  is_pinned: boolean;
  display_name?: string;
}

export default function MemberProofWallPage() {
  const { user } = useAuth();
  const [pinnedRows, setPinnedRows] = useState<MemberProofSubmission[]>([]);
  const [rows, setRows] = useState<MemberProofSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: queryErr } = await supabase
        .from("member_proof_submissions")
        .select("*")
        .order("accuracy", { ascending: false })
        .order("submitted_at", { ascending: false });
      if (queryErr) { setError(queryErr.message); setLoading(false); return; }
      const pinned = (data ?? []).filter((r: MemberProofSubmission) => r.is_pinned);
      const rest = (data ?? []).filter((r: MemberProofSubmission) => !r.is_pinned);
      setPinnedRows(pinned);
      setRows(rest);
      setLoading(false);
    }
    load();
  }, [user]);

  const formatSeconds = (s: number) => {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return `${m}m ${s % 60}s`;
  };

  const statusLabel = (row: MemberProofSubmission) => {
    if (!row.signature_verified) return "Verifying signature...";
    if (row.posse_spot_check_status === "posse_queued") return "Posse spot-check queued";
    if (row.posse_spot_check_status === "pending") return "Pending";
    if (row.posse_spot_check_status === "passed") return "Verified";
    if (row.posse_spot_check_status === "flagged") return "Flagged - divergence detected";
    if (row.posse_spot_check_status === "signature_failed") return "Signature failed";
    return row.posse_spot_check_status;
  };

  const ProofCard = ({ row }: { row: MemberProofSubmission }) => (
    <div style={{ border: "1px solid var(--color-border, #e2e8f0)", borderRadius: 8, padding: 16, marginBottom: 12, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{(row.accuracy).toFixed(1)}% accuracy</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            {row.questions_correct}/{row.questions_attempted} questions - {formatSeconds(row.wall_clock_seconds)} wall-clock
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            Harness: {row.harness_version} - Submitted: {new Date(row.submitted_at).toLocaleDateString()}
          </div>
          {row.display_name && <div style={{ fontSize: 13, marginTop: 4 }}>By: {row.display_name}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600,
            backgroundColor: row.posse_spot_check_status === "passed" ? "#dcfce7" : "#f1f5f9",
            color: row.posse_spot_check_status === "passed" ? "#166534" : "#64748b",
          }}>
            {statusLabel(row)}
          </div>
          {row.ip_ledger_stamp_id && (
            <div style={{ fontSize: 11, marginTop: 6 }}>
              <a href={`/ip-ledger/stamp/${row.ip_ledger_stamp_id}`} target="_blank" rel="noreferrer">IP Ledger stamp</a>
            </div>
          )}
          {row.result_json_storage_path && row.posse_spot_check_status === "passed" && (
            <div style={{ fontSize: 11, marginTop: 4 }}>
              <button
                style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 11 }}
                onClick={async () => {
                  const { data } = await supabase.storage.from("member-proof-submissions").createSignedUrl(row.result_json_storage_path, 300);
                  if (data?.signedUrl) window.open(data.signedUrl, "_blank");
                }}
              >View signed receipt</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Member Proof Wall</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Cryptographically verified MMLU-Pro results from cooperative members.
        No Reddit gate. No Discord gate. The substrate IS the vetting.
        Ed25519 signature + Posse spot-check + IP Ledger stamp.
      </p>
      {user && (
        <div style={{ marginBottom: 24 }}>
          <a
            href="/proofs/submit"
            style={{
              display: "inline-block", padding: "10px 20px",
              backgroundColor: "#2563eb", color: "#fff",
              borderRadius: 6, fontWeight: 600, textDecoration: "none"
            }}
          >
            Submit Your MMLU-Pro Result
          </a>
          <span style={{ marginLeft: 12, fontSize: 13, color: "#64748b" }}>
            Download the harness at{" "}
            <a href="/harness/" style={{ color: "#2563eb" }}>lianabanyan.com/harness/</a>
          </span>
        </div>
      )}
      {!user && (
        <div style={{ marginBottom: 24, padding: "12px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: 13, color: "#64748b" }}>
            <a href="/auth" style={{ color: "#2563eb", fontWeight: 600 }}>Log in</a>{" "}
            to submit your own MMLU-Pro result.
          </span>
        </div>
      )}
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "#dc2626" }}>Error: {error}</div>}
      {!loading && !error && (
        <>
          {pinnedRows.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Pinned Member Proofs</h2>
              {pinnedRows.map(row => <ProofCard key={row.id} row={row} />)}
            </section>
          )}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>All Verified Submissions</h2>
            {rows.length === 0 && (
              <div style={{ color: "#64748b", padding: "24px 0" }}>
                No verified submissions yet. Be the first - download the harness and submit your result.
              </div>
            )}
            {rows.map(row => <ProofCard key={row.id} row={row} />)}
          </section>
        </>
      )}
    </div>
  );
}
