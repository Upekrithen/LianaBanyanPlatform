#!/usr/bin/env node
/**
 * BP028 — AutoBaton CLI (same entry point as MCP tool).
 * Example:
 *   node scripts/autobaton_cli.mjs --task synthesis --prompt "Summarize BP028 in one sentence."
 *   node scripts/autobaton_cli.mjs --task coordination --prompt "List three sync checkpoints." --ab-test
 *   node scripts/autobaton_cli.mjs ... --blind-grade-output
 *   node scripts/autobaton_cli.mjs --dry-run --task synthesis --prompt "test"
 */
import { autobatonDispatch } from "../dist/autobaton_dispatch.js";

function getArg(name, argv) {
  const i = argv.indexOf(name);
  if (i === -1 || i + 1 >= argv.length) return undefined;
  return argv[i + 1];
}

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const abTest = argv.includes("--ab-test");
const blind = argv.includes("--blind-grade-output");
const task = getArg("--task", argv);
const prompt = getArg("--prompt", argv);
const sessionId = getArg("--session", argv) ?? "autobaton-cli";
const modelOverride = getArg("--model-override", argv);
const maxTokRaw = getArg("--max-tokens", argv);
const maxTokens = maxTokRaw ? parseInt(maxTokRaw, 10) : undefined;

if (!prompt) {
  console.error(
    "Usage: node scripts/autobaton_cli.mjs --prompt \"...\" [--task synthesis|coordination|...] [--ab-test] [--blind-grade-output] [--dry-run] [--session ID] [--model-override ID] [--max-tokens N]",
  );
  process.exit(1);
}

const result = await autobatonDispatch({
  prompt,
  task_class: task,
  session_id: sessionId,
  model_override: modelOverride,
  max_tokens: Number.isFinite(maxTokens) ? maxTokens : undefined,
  ab_test: abTest,
  blind_grade_output: blind,
  execute: !dryRun,
});

console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
