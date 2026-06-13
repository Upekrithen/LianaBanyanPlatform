/**
 * message-store-test.mjs
 * SEG-MC-4 · Wave D · BP079 · 2026-06-10
 *
 * Unit tests for mnemosynec-message-store.mjs
 * Uses a temp file so real ~/.mnemosynec/messages.jsonl is not polluted.
 *
 * Run: node librarian-mcp/tests/message-store-test.mjs
 */

import path from 'path';
import os from 'os';
import fs from 'fs';

// ── Test infrastructure ──────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function ok(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function isUUIDv4(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// ── Set temp store path BEFORE loading module (env var read at module init) ──

const TEST_STORE = path.join(os.tmpdir(), `mnemosynec-test-${Date.now()}.jsonl`);
process.env.MNEMOSYNEC_STORE_PATH = TEST_STORE;

// Cleanup from any previous run
if (fs.existsSync(TEST_STORE)) fs.unlinkSync(TEST_STORE);

// Dynamic import so env var is set before module-level STORE_PATH is evaluated
const { sendMessage, checkMessages, ackMessage, STORE_PATH } = await import(
  '../scripts/mnemosynec-message-store.mjs'
);

// ── Tests ────────────────────────────────────────────────────────────────────

console.log('\n── SEG-MC-4 message-store-test.mjs ──\n');
console.log(`Store path: ${STORE_PATH}`);
console.log('');

// Test 1: sendMessage returns valid pearl_id
console.log('Test 1: sendMessage returns valid pearl_id');
const result1 = sendMessage({ from: 'knight', to: 'bishop', subject: 'test', body: 'hello' });
ok('returns ok:true', result1.ok === true);
ok('returns pearl_id string', typeof result1.pearl_id === 'string');
ok('pearl_id is valid UUIDv4', isUUIDv4(result1.pearl_id), result1.pearl_id);
const pearlId = result1.pearl_id;

// Test 2: checkMessages returns the unread message
console.log('\nTest 2: checkMessages("bishop") returns 1 unread message');
const msgs2 = checkMessages('bishop');
ok('array length === 1', msgs2.length === 1, `got ${msgs2.length}`);
ok('pearl_id matches', msgs2[0]?.pearl_id === pearlId);
ok('from === "knight"', msgs2[0]?.from === 'knight');
ok('subject === "test"', msgs2[0]?.subject === 'test');
ok('body === "hello"', msgs2[0]?.body === 'hello');
ok('ts is ISO string', typeof msgs2[0]?.ts === 'string' && msgs2[0].ts.includes('T'));

// Test 3: ackMessage marks the pearl read
console.log('\nTest 3: ackMessage returns {ok: true}');
const ackResult = ackMessage(pearlId);
ok('ackMessage returns ok:true', ackResult.ok === true);

// Test 4: checkMessages after ack returns 0 messages
console.log('\nTest 4: checkMessages("bishop") after ack returns 0 messages');
const msgs4 = checkMessages('bishop');
ok('array length === 0', msgs4.length === 0, `got ${msgs4.length}`);

// Test 5: Unicode safety — multi-byte characters
console.log('\nTest 5: Unicode safety (Japanese + emoji body)');
const unicodeBody = '日本語テスト 🌳🤝 こんにちは世界 — cooperative-class = 協同組合クラス';
const result5 = sendMessage({
  from: 'bishop',
  to: 'knight',
  subject: 'unicode-check',
  body: unicodeBody,
});
ok('sendMessage with unicode succeeds', result5.ok === true);
const msgs5 = checkMessages('knight');
ok('checkMessages returns 1 message', msgs5.length === 1, `got ${msgs5.length}`);
ok('body is byte-exact match', msgs5[0]?.body === unicodeBody, `got: ${msgs5[0]?.body?.slice(0, 30)}`);

// ── Cleanup ──────────────────────────────────────────────────────────────────

try {
  fs.unlinkSync(TEST_STORE);
} catch {
  // ignore cleanup errors
}

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n── Results: ${passed} passed, ${failed} failed ──\n`);
if (failed > 0) process.exit(1);
