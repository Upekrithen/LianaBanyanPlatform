#!/usr/bin/env node
// MIC broadcast CLI — issues fleet-wide commands via mic-broadcast Edge Function
//
// Usage:
//   node issue.mjs --type=noop_test [--payload='{}'] [--version=0.5.7] [--watch] [--poll-until=N]
//
// Flags:
//   --type         broadcast_type (required): noop_test | health_snapshot | fleet_warmup |
//                  auto_update | config_set | benchmark_run
//   --payload      JSON string for payload_json (default: '{}')
//   --version      target_version string
//   --tier         target_tier: all|base|member|premium (default: 'all')
//   --watch        poll for acks every 5s for 60s after issuing
//   --poll-until=N keep polling until N peers have acked 'completed' (or --timeout-s elapses)
//   --timeout-s    max seconds to wait when using --poll-until (default: 300)
//   --issued-by    identifier (default: 'knight-cli')

import { readFileSync } from 'fs';
import { homedir } from 'os';
import { resolve } from 'path';

const SUPABASE_URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const EDGE_FN = `${SUPABASE_URL}/functions/v1/mic-broadcast`;

function loadServiceKey() {
  // Try secrets file first
  const secretsPath = resolve(homedir(), '.claude', 'state', 'secrets', '22May2026.env');
  try {
    const lines = readFileSync(secretsPath, 'utf8').split('\n').map(l => l.trim());
    for (const line of lines) {
      const m = line.match(/^Supabase_Secret_Key=([^\s]+)$/);
      if (m) return m[1].trim();
    }
    for (const line of lines) {
      const m = line.match(/^SUPABASE_SERVICE_ROLE_KEY=([^\s]+)$/);
      if (m) return m[1].trim();
    }
  } catch {}
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.Supabase_Secret_Key || '';
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    type: null,
    payload: '{}',
    version: null,
    tier: 'all',
    watch: false,
    pollUntil: null,
    timeoutS: 300,
    issuedBy: 'knight-cli',
  };
  for (const arg of args) {
    const eqIdx = arg.indexOf('=');
    const k = eqIdx === -1 ? arg.replace(/^--/, '') : arg.slice(2, eqIdx);
    const v = eqIdx === -1 ? null : arg.slice(eqIdx + 1);
    if (k === 'type') parsed.type = v;
    else if (k === 'payload') parsed.payload = v;
    else if (k === 'version') parsed.version = v;
    else if (k === 'tier') parsed.tier = v;
    else if (k === 'watch') parsed.watch = true;
    else if (k === 'poll-until') parsed.pollUntil = parseInt(v, 10);
    else if (k === 'timeout-s') parsed.timeoutS = parseInt(v, 10);
    else if (k === 'issued-by') parsed.issuedBy = v;
  }
  return parsed;
}

async function fetchAcks(broadcastId, serviceKey) {
  const res = await fetch(`${EDGE_FN}?broadcast_id=${broadcastId}`, {
    headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
  });
  const data = await res.json();
  return data.acks || [];
}

async function main() {
  const args = parseArgs();
  if (!args.type) {
    console.error('ERROR: --type is required');
    console.error('Valid types: noop_test | health_snapshot | fleet_warmup | auto_update | config_set | benchmark_run');
    process.exit(2);
  }

  const serviceKey = loadServiceKey();
  if (!serviceKey) {
    console.error('ERROR: Supabase service role key not found');
    console.error('  Expected at ~/.claude/state/secrets/22May2026.env as Supabase_Secret_Key=...');
    process.exit(2);
  }

  let payloadJson;
  try {
    payloadJson = JSON.parse(args.payload);
  } catch {
    console.error(`ERROR: --payload is not valid JSON: ${args.payload}`);
    process.exit(2);
  }

  const body = {
    broadcast_type: args.type,
    payload_json: payloadJson,
    issued_by: args.issuedBy,
    target_version: args.version,
    target_tier: args.tier,
  };

  console.log(`\nIssuing broadcast:`);
  console.log(`  type      : ${args.type}`);
  console.log(`  tier      : ${args.tier}`);
  if (args.version) console.log(`  version   : ${args.version}`);
  console.log(`  issued-by : ${args.issuedBy}`);
  console.log(`  payload   : ${JSON.stringify(payloadJson)}\n`);

  const res = await fetch(EDGE_FN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    console.error('ERROR from Edge Function:', data.error);
    process.exit(1);
  }

  console.log(`Broadcast issued: ${data.broadcast_id}`);
  console.log(`Created at      : ${data.created_at}\n`);

  const broadcastId = data.broadcast_id;

  // --poll-until=N: keep polling until N peers ack 'completed' or timeout
  if (args.pollUntil !== null) {
    const target = args.pollUntil;
    const deadline = Date.now() + args.timeoutS * 1000;
    console.log(`Polling until ${target} peer(s) complete (timeout ${args.timeoutS}s)...`);

    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 5000));
      const acks = await fetchAcks(broadcastId, serviceKey);
      const completed = acks.filter(a => a.ack_type === 'completed' || a.ack_type === 'error' || a.ack_type === 'failed');
      const completedCount = acks.filter(a => a.ack_type === 'completed').length;
      const ts = new Date().toISOString().slice(11, 19);

      console.log(`[${ts}] Total acks: ${acks.length} | completed: ${completedCount} | target: ${target}`);
      for (const a of acks) {
        const peerId = typeof a.peer_id === 'string' ? a.peer_id.slice(0, 8) : '?';
        const result = a.result_json ? JSON.stringify(a.result_json).slice(0, 80) : '';
        console.log(`  peer=${peerId} type=${a.ack_type} ${result}`);
      }

      if (completed.length >= target) {
        console.log(`\nTarget reached: ${completed.length}/${target} peers responded.`);
        break;
      }
    }

    const finalAcks = await fetchAcks(broadcastId, serviceKey);
    console.log(`\nFinal ack summary (${finalAcks.length} total):`);
    for (const a of finalAcks) {
      const peerId = typeof a.peer_id === 'string' ? a.peer_id.slice(0, 8) : '?';
      console.log(`  peer=${peerId} ack_type=${a.ack_type} at=${a.created_at?.slice(11, 19)}`);
    }
    return;
  }

  // --watch: poll for 60s every 5s
  if (args.watch) {
    console.log('Watching for acks (60s)...');
    for (let i = 0; i < 12; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const acks = await fetchAcks(broadcastId, serviceKey);
      const ts = new Date().toISOString().slice(11, 19);
      console.log(`[${ts}] Acks received: ${acks.length}`);
      for (const a of acks) {
        const peerId = typeof a.peer_id === 'string' ? a.peer_id.slice(0, 8) : '?';
        const result = a.result_json ? JSON.stringify(a.result_json).slice(0, 80) : '';
        console.log(`  peer=${peerId} type=${a.ack_type} ${result}`);
      }
    }
    const finalAcks = await fetchAcks(broadcastId, serviceKey);
    console.log(`\nFinal: ${finalAcks.length} ack(s) received for broadcast ${broadcastId.slice(0, 8)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
