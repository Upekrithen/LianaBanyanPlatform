#!/usr/bin/env node
/**
 * K437 consult_scribes CLI shim
 * =============================
 * Thin wrapper over the in-repo `consultScribes()` (K436 production code path).
 * Reads NDJSON requests on stdin, writes NDJSON results on stdout.
 *
 * Request:  {"topic": "...", "max_entries": 10}
 * Response: {ok: true, result: <ConsultResult>}  // see src/scribes/consult.ts
 *
 * Exits non-zero only on fatal startup errors. Per-request errors are returned
 * as {ok:false, error:"..."} so the Python runner can log + continue.
 */
import readline from "node:readline";
import { consultScribes } from "../dist/scribes/consult.js";

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let req;
  try {
    req = JSON.parse(trimmed);
  } catch (e) {
    process.stdout.write(JSON.stringify({ ok: false, error: `bad json: ${e.message}` }) + "\n");
    return;
  }
  try {
    const result = consultScribes({
      topic: String(req.topic || ""),
      max_entries: req.max_entries ?? 10,
      include_adjacents: req.include_adjacents ?? true,
    });
    process.stdout.write(JSON.stringify({ ok: true, result }) + "\n");
  } catch (e) {
    process.stdout.write(JSON.stringify({ ok: false, error: e.message }) + "\n");
  }
});

rl.on("close", () => process.exit(0));
