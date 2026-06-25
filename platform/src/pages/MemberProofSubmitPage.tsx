// MemberProofSubmitPage.tsx
// BP094 - member MMLU-Pro result submission portal
// No em-dashes anywhere

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ParsedResult {
  harness_version?: string;
  questions_attempted: number;
  questions_correct: number;
  accuracy: number;
  wall_clock_seconds: number;
  member_signature_ed25519?: string;
  per_question?: unknown[];
}

function parseResultJson(raw: string): ParsedResult | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.questions_attempted !== "number" ||
      typeof parsed.questions_correct !== "number"
    ) {
      return null;
    }
    return {
      harness_version: parsed.harness_version || "mmlu-pro-bp094",
      questions_attempted: parsed.questions_attempted,
      questions_correct: parsed.questions_correct,
      accuracy: parsed.accuracy ?? (parsed.questions_correct / parsed.questions_attempted) * 100,
      wall_clock_seconds: parsed.wall_clock_seconds ?? 0,
      member_signature_ed25519: parsed.member_signature_ed25519,
      per_question: parsed.per_question,
    };
  } catch {
    return null;
  }
}

type SubmitState = "idle" | "uploading" | "inserting" | "verifying" | "done" | "error";

export default function MemberProofSubmitPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [signatureNote, setSignatureNote] = useState<string | null>(null);

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/proofs/submit");
    }
  }, [authLoading, user, navigate]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setParseError(null);
    setParsed(null);
    setSignatureNote(null);
    setFileContent(null);
    setFileName(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setFileContent(text);
      const result = parseResultJson(text);
      if (!result) {
        setParseError("Could not parse result.json. Expected fields: questions_attempted, questions_correct, accuracy, wall_clock_seconds.");
        return;
      }
      setParsed(result);
      if (result.member_signature_ed25519) {
        setSignatureNote("Ed25519 signature detected in file.");
      } else {
        setSignatureNote("No Ed25519 signature field found. You must run ./run-and-sign.sh to sign your result before submitting.");
      }
    };
    reader.readAsText(file);
  }

  async function handleSubmit() {
    if (!user || !fileContent || !parsed) return;
    if (!parsed.member_signature_ed25519) {
      setErrorMessage("Cannot submit: result is not signed. Run ./run-and-sign.sh first.");
      return;
    }

    setSubmitState("uploading");
    setErrorMessage(null);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const storagePath = `${user.id}/${timestamp}_result.json`;

    const blob = new Blob([fileContent], { type: "application/json" });
    const { error: uploadErr } = await supabase.storage
      .from("member-proof-submissions")
      .upload(storagePath, blob, { contentType: "application/json", upsert: false });

    if (uploadErr) {
      setSubmitState("error");
      setErrorMessage(`Upload failed: ${uploadErr.message}`);
      return;
    }

    setSubmitState("inserting");

    const { data: insertData, error: insertErr } = await supabase
      .from("member_proof_submissions")
      .insert({
        member_id: user.id,
        harness_version: parsed.harness_version || "mmlu-pro-bp094",
        questions_attempted: parsed.questions_attempted,
        questions_correct: parsed.questions_correct,
        accuracy: parsed.accuracy,
        wall_clock_seconds: parsed.wall_clock_seconds,
        result_json_storage_path: storagePath,
        member_signature_ed25519: parsed.member_signature_ed25519,
      })
      .select("id")
      .single();

    if (insertErr || !insertData) {
      setSubmitState("error");
      setErrorMessage(`Database insert failed: ${insertErr?.message ?? "Unknown error"}`);
      return;
    }

    const newSubmissionId = insertData.id;
    setSubmissionId(newSubmissionId);
    setSubmitState("verifying");

    const { data: verifyData, error: verifyErr } = await supabase.functions.invoke(
      "verify-member-proof",
      { body: { submission_id: newSubmissionId } }
    );

    if (verifyErr) {
      setSubmitState("error");
      setErrorMessage(`Verification request failed: ${verifyErr.message}. Your submission was saved (id: ${newSubmissionId}). Verification will retry automatically.`);
      return;
    }

    if (verifyData?.verified === false) {
      setSubmitState("error");
      setErrorMessage(`Signature verification failed: ${verifyData.reason}. Check that you signed with your current Ring Bearer key.`);
      return;
    }

    setSubmitState("done");
  }

  if (authLoading) {
    return <div style={{ maxWidth: 700, margin: "40px auto", padding: 24 }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Submit Your MMLU-Pro Result</h1>
      <p style={{ color: "#64748b", marginBottom: 8 }}>
        Upload your signed result.json from the LianaB MMLU-Pro harness.
        Your result will be verified cryptographically. No Reddit gate. No Discord gate.
        The substrate IS the vetting.
      </p>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
        Need the harness?{" "}
        <a href="/harness/" style={{ color: "#2563eb" }}>Download from lianabanyan.com/harness/</a>
      </p>

      {submitState === "done" ? (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 10, padding: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#166534", marginBottom: 8 }}>
            Submission received
          </div>
          <p style={{ color: "#15803d", marginBottom: 12 }}>
            Your Ed25519 signature was verified. The Posse is now running a 10% spot-check
            of your questions through the LB mesh. This typically takes 5-15 minutes.
          </p>
          <p style={{ color: "#15803d", fontSize: 13, marginBottom: 16 }}>
            Submission ID: <code style={{ fontFamily: "monospace" }}>{submissionId}</code>
          </p>
          <p style={{ fontSize: 13, color: "#166534" }}>
            Once the Posse confirms your result (within 5% tolerance), your submission will appear
            on the{" "}
            <a href="/proofs/wall" style={{ color: "#166534", fontWeight: 600 }}>Wall of Member Proofs</a>
            {" "}with an IP Ledger stamp.
          </p>
        </div>
      ) : (
        <>
          {/* File upload */}
          <div style={{ border: "2px dashed #cbd5e1", borderRadius: 10, padding: 24, marginBottom: 20, textAlign: "center" }}>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.tar.gz,.zip"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="result-file-input"
            />
            <label
              htmlFor="result-file-input"
              style={{
                cursor: "pointer", display: "inline-block",
                padding: "10px 20px", background: "#f1f5f9",
                borderRadius: 6, fontWeight: 600, color: "#334155", marginBottom: 8
              }}
            >
              Choose result.json
            </label>
            {fileName && (
              <div style={{ fontSize: 13, color: "#475569", marginTop: 8 }}>
                Selected: <strong>{fileName}</strong>
              </div>
            )}
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
              Accepts .json, .tar.gz, .zip (extract result.json automatically)
            </div>
          </div>

          {parseError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: 14, marginBottom: 16, color: "#dc2626", fontSize: 14 }}>
              {parseError}
            </div>
          )}

          {parsed && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Result Preview</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>Questions attempted</div>
                  <div style={{ fontWeight: 600 }}>{parsed.questions_attempted}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>Questions correct</div>
                  <div style={{ fontWeight: 600 }}>{parsed.questions_correct}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>Accuracy</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#2563eb" }}>{parsed.accuracy.toFixed(1)}%</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 12 }}>Wall-clock time</div>
                  <div style={{ fontWeight: 600 }}>
                    {parsed.wall_clock_seconds < 60
                      ? `${parsed.wall_clock_seconds}s`
                      : `${Math.floor(parsed.wall_clock_seconds / 60)}m ${parsed.wall_clock_seconds % 60}s`}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 14, padding: 10, background: signatureNote?.includes("detected") ? "#dcfce7" : "#fef9c3", borderRadius: 6, fontSize: 13, color: signatureNote?.includes("detected") ? "#166534" : "#854d0e" }}>
                {signatureNote}
              </div>
            </div>
          )}

          {errorMessage && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: 14, marginBottom: 16, color: "#dc2626", fontSize: 14 }}>
              {errorMessage}
            </div>
          )}

          {(submitState === "uploading" || submitState === "inserting" || submitState === "verifying") && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 14, marginBottom: 16, color: "#1d4ed8", fontSize: 14 }}>
              {submitState === "uploading" && "Uploading result to secure storage..."}
              {submitState === "inserting" && "Recording submission..."}
              {submitState === "verifying" && "Verifying Ed25519 signature and queuing Posse spot-check..."}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!parsed || !parsed.member_signature_ed25519 || submitState !== "idle"}
            style={{
              padding: "12px 28px",
              background: (!parsed || !parsed.member_signature_ed25519 || submitState !== "idle") ? "#94a3b8" : "#2563eb",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: (!parsed || !parsed.member_signature_ed25519 || submitState !== "idle") ? "not-allowed" : "pointer",
            }}
          >
            Submit to the Wall
          </button>
          {parsed && !parsed.member_signature_ed25519 && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
              Sign your result first with ./run-and-sign.sh before submitting.
            </div>
          )}

          <div style={{ marginTop: 32, padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, color: "#64748b" }}>
            <strong style={{ color: "#334155" }}>What happens after you submit:</strong>
            <ol style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Your Ed25519 signature is verified against your Ring Bearer key on file</li>
              <li>The Posse re-runs 10% of your questions through the LB mesh (5-15 min)</li>
              <li>If Posse result matches yours within 5%, your submission is marked Verified</li>
              <li>The IP Ledger stamps your verified result permanently</li>
              <li>Your result appears on the Wall of Member Proofs</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
