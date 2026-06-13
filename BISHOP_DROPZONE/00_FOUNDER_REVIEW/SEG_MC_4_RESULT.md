# SEG-MC-4 Result — Bridge Replacement
Date: 2026-06-10
Session: BP079 Wave D
Model: Sonnet 4.6

## Status: COMPLETE

---

## Files created/modified

| File | Action | Size |
|---|---|---|
| `librarian-mcp/scripts/mnemosynec-message-store.mjs` | Created (Part A) | 3,500 bytes |
| `src/main/mnemosynec_message_store.ts` | Created (Part B, TypeScript mirror) | 3,683 bytes |
| `src/main/bridge_ipc.ts` | Modified (Part B, store migration) | 5,593 bytes |
| `librarian-mcp/tests/message-store-test.mjs` | Created (Part C) | 4,540 bytes |
| `BISHOP_DROPZONE/00_FOUNDER_REVIEW/MNEMOSYNE_COME_KNIGHT_MCP_PATCH_READY.md` | Created (Part D, staged diff) | 4,159 bytes |

---

## Unit test: 14/14 PASS

```
Test 1: sendMessage returns valid pearl_id
  ✓ returns ok:true
  ✓ returns pearl_id string
  ✓ pearl_id is valid UUIDv4

Test 2: checkMessages("bishop") returns 1 unread message
  ✓ array length === 1
  ✓ pearl_id matches
  ✓ from === "knight"
  ✓ subject === "test"
  ✓ body === "hello"
  ✓ ts is ISO string

Test 3: ackMessage returns {ok: true}
  ✓ ackMessage returns ok:true

Test 4: checkMessages("bishop") after ack returns 0 messages
  ✓ array length === 0

Test 5: Unicode safety (Japanese + emoji body)
  ✓ sendMessage with unicode succeeds
  ✓ checkMessages returns 1 message
  ✓ body is byte-exact match

── Results: 14 passed, 0 failed ──
```

## Unicode safety: PASS

Body: `日本語テスト 🌳🤝 こんにちは世界 — cooperative-class = 協同組合クラス`
Returned byte-exact from `checkMessages`. No surrogate corruption.

---

## Message store path: ~/.mnemosynec/messages.jsonl

Created on first `sendMessage` call. Directory `~/.mnemosynec/` created via `fs.mkdirSync(dir, { recursive: true })`.

---

## Knight mcp.json diff: STAGED

Path: `BISHOP_DROPZONE/00_FOUNDER_REVIEW/MNEMOSYNE_COME_KNIGHT_MCP_PATCH_READY.md`

Entries to REMOVE: `knight-bishop-bridge` (dead path), `librarian-python-legacy` (no module, no env)
Entries to KEEP: `librarian` (supervise.mjs fallback), `perplexity-pawn` (search proxy)
Entry to ADD: `mnemosynec` — BLOCKED pending SEG-MC-1 shim delivery

**Do not apply until SEG-MC-1 `mnemosynec-mcp-stdio.mjs` is verified working.**

---

## Architecture deviation surfaced (truth-always)

**Part B conflict:** `bridge_ipc.ts` had different message shape (`id/type/content`) and different
`bridge:check-messages` signature (`count: number`, not `clientId: string`). Resolution:

1. **TypeScript mirror created:** `src/main/mnemosynec_message_store.ts` — identical logic to the
   `.mjs` module, both reading/writing the same `~/.mnemosynec/messages.jsonl` file. The Electron
   main process imports the `.ts` version (avoids ESM/CJS interop complexity in the tsc build
   pipeline). The MCP shim and tests import the `.mjs` version directly.

2. **Legacy arg shapes preserved via normalization:** `bridge:send-message` accepts both old
   `{ to, type, content }` and new `{ to, subject, body }` shapes; maps internally to pearl store.
   `bridge:check-messages` accepts `string` (clientId), `number` (legacy count), or
   `{ clientId, count }` object — backward compatible with any existing renderer code.

3. **Ollama AI replies stay in-memory** (`_aiReplies[]`, capped at 200): these are ephemeral
   renderer-feedback messages, not durable inter-agent Yoke pearls. The Yoke spec does not require
   Ollama replies to be persisted. All peer-to-peer messages go to JSONL.

4. **`bridge:ack-message` added** as new IPC channel — no conflict with existing handlers.

---

## SEG-MC-4 complete. Awaiting SEG-MC-1 for mcp.json patch application.

*Knight / Cursor / BP079 / 2026-06-10*
