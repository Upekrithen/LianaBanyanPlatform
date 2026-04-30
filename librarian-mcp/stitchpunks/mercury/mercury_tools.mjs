/**
 * Mercury Bank MCP Wrapper — KN002 / BP002
 * A&A: Financial substrate channel for Liana Banyan Corporation.
 *
 * Read autonomy: account list, balance, transactions, statements are allowed
 * without human approval.
 *
 * Write Fire-Control gate: transfer, ACH, wire, card-issuance return
 * `needsApproval: true` and do NOT execute side effects.  Humans alone authorize
 * live-fire per Fire Control directive.
 *
 * Augur consult layer:
 *   - Reads emit `observation` scribe entries (provenance of what was seen).
 *   - Write attempts emit `action_requested` scribe entries (before gate; no side effect).
 *
 * Stone Tablet Imperative: mercury_ledger.jsonl is append-only.
 *
 * MVP stub: Mercury Bank API credentials not yet provisioned.
 *           All read tools return realistic stub data.
 *           All write tools return Fire Control interruption.
 *           When credentials are provisioned, replace stub client with real HTTP calls.
 *
 * Toolsmith log: TS-MERCURY-BANK-AUGUR-KN002-BP002
 */

import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { readFile, appendFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Paths ──────────────────────────────────────────────────────────────────────

/** Path to the append-only ledger (Stone Tablet Imperative). */
export const LEDGER_PATH = resolve(__dirname, "mercury_ledger.jsonl");

// ── Helpers ────────────────────────────────────────────────────────────────────

function isoNow() {
  return new Date().toISOString();
}

function shortId() {
  return randomBytes(4).toString("hex");
}

/** Append a JSON record to the ledger (Stone Tablet — never overwrites). */
export async function appendLedger(record) {
  try {
    await appendFile(LEDGER_PATH, JSON.stringify(record) + "\n", "utf-8");
  } catch {
    // Ledger write failure must never break the tool response.
  }
}

// ── Stub Mercury client ────────────────────────────────────────────────────────
// When Mercury Bank API credentials are provisioned, replace these stubs with
// real HTTP calls to the Mercury API (v1 REST).

const STUB_ACCOUNTS = [
  {
    id: "acct_stub_operating",
    name: "Liana Banyan Corp — Operating",
    accountNumber: "****1234",
    routingNumber: "021000021",
    type: "checking",
    currency: "USD",
  },
  {
    id: "acct_stub_reserve",
    name: "Liana Banyan Corp — Reserve",
    accountNumber: "****5678",
    routingNumber: "021000021",
    type: "savings",
    currency: "USD",
  },
];

const STUB_BALANCES = {
  acct_stub_operating: { available: 0, current: 0, currency: "USD" },
  acct_stub_reserve:   { available: 0, current: 0, currency: "USD" },
};

export class MercuryClient {
  /**
   * @param {{ apiKey?: string, stubMode?: boolean }} opts
   */
  constructor(opts = {}) {
    this.apiKey = opts.apiKey || process.env.MERCURY_API_KEY || "";
    // Stub mode is active when no credentials are provisioned.
    this.stubMode = opts.stubMode !== undefined ? opts.stubMode : !this.apiKey;
  }

  async listAccounts() {
    if (this.stubMode) return { accounts: STUB_ACCOUNTS, stub: true };
    // TODO: GET https://api.mercury.com/api/v1/accounts
    throw new Error("Mercury API not yet provisioned. Set MERCURY_API_KEY env var.");
  }

  async getBalance(accountId) {
    if (this.stubMode) {
      const bal = STUB_BALANCES[accountId] || { available: 0, current: 0, currency: "USD" };
      return { accountId, ...bal, stub: true };
    }
    throw new Error("Mercury API not yet provisioned.");
  }

  async getTransactions(accountId, { limit = 50, offset = 0 } = {}) {
    if (this.stubMode) {
      return { accountId, transactions: [], total: 0, limit, offset, stub: true };
    }
    throw new Error("Mercury API not yet provisioned.");
  }

  async getStatements(accountId, { year, month } = {}) {
    if (this.stubMode) {
      return { accountId, statements: [], year, month, stub: true };
    }
    throw new Error("Mercury API not yet provisioned.");
  }
}

// ── Fire Control gate ──────────────────────────────────────────────────────────

/**
 * All write actions return this shape.  Side effects are NOT executed.
 * Human approval is required before any write executes.
 *
 * @param {string} actionType
 * @param {object} params
 * @returns {{ needsApproval: true, action_id: string, actionType: string, params: object, ts: string }}
 */
export function fireControlInterruption(actionType, params) {
  return {
    needsApproval: true,
    action_id: `fc-${shortId()}`,
    actionType,
    params,
    ts: isoNow(),
    note: "Fire Control gate: human approval required before any write executes. No side effect occurred.",
  };
}

// ── Approval token store (in-memory for MVP; intended for Founder-signed approval flow) ────

const _pendingApprovals = new Map(); // action_id → { actionType, params, expiresAt }
const APPROVAL_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function registerPendingApproval(interruption) {
  const expiresAt = Date.now() + APPROVAL_TTL_MS;
  _pendingApprovals.set(interruption.action_id, {
    actionType: interruption.actionType,
    params: interruption.params,
    expiresAt,
  });
}

export function consumeApproval(actionId) {
  const entry = _pendingApprovals.get(actionId);
  if (!entry) return { ok: false, reason: "action_id not found" };
  if (Date.now() > entry.expiresAt) {
    _pendingApprovals.delete(actionId);
    return { ok: false, reason: "approval expired" };
  }
  _pendingApprovals.delete(actionId);
  return { ok: true, ...entry };
}

export function revokeApproval(actionId) {
  const existed = _pendingApprovals.has(actionId);
  _pendingApprovals.delete(actionId);
  return { revoked: existed, action_id: actionId };
}

// ── MCP tool handlers ──────────────────────────────────────────────────────────

/**
 * All handlers return { content: [{ type: "text", text: string }] } per MCP spec.
 * Read handlers also scribe an observation; write handlers scribe an action_requested.
 */

export async function handleListAccounts(args, client) {
  const result = await client.listAccounts();
  await appendLedger({
    ts: isoNow(),
    event: "observation",
    tool: "mercury_list_accounts",
    provenance: "mercury_client.listAccounts()",
    result: { account_count: result.accounts.length, stub: result.stub },
  });
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

export async function handleGetBalance(args, client) {
  const { account_id } = args;
  if (!account_id) throw new Error("account_id is required");
  const result = await client.getBalance(account_id);
  await appendLedger({
    ts: isoNow(),
    event: "observation",
    tool: "mercury_get_balance",
    account_id,
    provenance: "mercury_client.getBalance()",
    result: { available: result.available, currency: result.currency, stub: result.stub },
  });
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

export async function handleGetTransactions(args, client) {
  const { account_id, limit = 50, offset = 0 } = args;
  if (!account_id) throw new Error("account_id is required");
  const result = await client.getTransactions(account_id, { limit, offset });
  await appendLedger({
    ts: isoNow(),
    event: "observation",
    tool: "mercury_get_transactions",
    account_id,
    provenance: "mercury_client.getTransactions()",
    result: { transaction_count: result.transactions.length, stub: result.stub },
  });
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

export async function handleGetStatements(args, client) {
  const { account_id, year, month } = args;
  if (!account_id) throw new Error("account_id is required");
  const result = await client.getStatements(account_id, { year, month });
  await appendLedger({
    ts: isoNow(),
    event: "observation",
    tool: "mercury_get_statements",
    account_id,
    provenance: "mercury_client.getStatements()",
    result: { statement_count: result.statements.length, stub: result.stub },
  });
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

export async function handleRequestTransfer(args) {
  const { from_account_id, to_account_id, amount_cents, memo = "" } = args;
  if (!from_account_id || !to_account_id || amount_cents == null) {
    throw new Error("from_account_id, to_account_id, amount_cents are required");
  }
  const interruption = fireControlInterruption("transfer", { from_account_id, to_account_id, amount_cents, memo });
  registerPendingApproval(interruption);
  await appendLedger({
    ts: isoNow(),
    event: "action_requested",
    tool: "mercury_request_transfer",
    action_id: interruption.action_id,
    params: interruption.params,
    fire_control: "pending_human_approval",
  });
  return {
    content: [{ type: "text", text: JSON.stringify(interruption, null, 2) }],
  };
}

export async function handleRequestACH(args) {
  const { account_id, amount_cents, routing_number, account_number, memo = "" } = args;
  if (!account_id || amount_cents == null || !routing_number || !account_number) {
    throw new Error("account_id, amount_cents, routing_number, account_number are required");
  }
  const interruption = fireControlInterruption("ach", { account_id, amount_cents, routing_number, account_number: "****", memo });
  registerPendingApproval(interruption);
  await appendLedger({
    ts: isoNow(),
    event: "action_requested",
    tool: "mercury_request_ach",
    action_id: interruption.action_id,
    params: interruption.params,
    fire_control: "pending_human_approval",
  });
  return {
    content: [{ type: "text", text: JSON.stringify(interruption, null, 2) }],
  };
}

export async function handleRequestWire(args) {
  const { account_id, amount_cents, recipient_name, routing_number, account_number, memo = "" } = args;
  if (!account_id || amount_cents == null || !recipient_name || !routing_number || !account_number) {
    throw new Error("account_id, amount_cents, recipient_name, routing_number, account_number are required");
  }
  const interruption = fireControlInterruption("wire", { account_id, amount_cents, recipient_name, routing_number, account_number: "****", memo });
  registerPendingApproval(interruption);
  await appendLedger({
    ts: isoNow(),
    event: "action_requested",
    tool: "mercury_request_wire",
    action_id: interruption.action_id,
    params: interruption.params,
    fire_control: "pending_human_approval",
  });
  return {
    content: [{ type: "text", text: JSON.stringify(interruption, null, 2) }],
  };
}

export async function handleApproveAction(args) {
  const { action_id } = args;
  if (!action_id) throw new Error("action_id is required");
  const result = consumeApproval(action_id);
  await appendLedger({
    ts: isoNow(),
    event: "approval_consumed",
    action_id,
    ok: result.ok,
    reason: result.reason,
  });
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

export async function handleRevokeApproval(args) {
  const { action_id } = args;
  if (!action_id) throw new Error("action_id is required");
  const result = revokeApproval(action_id);
  await appendLedger({
    ts: isoNow(),
    event: "approval_revoked",
    action_id,
    revoked: result.revoked,
  });
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}

export async function handleQueryLedger(args) {
  const { limit = 50 } = args;
  try {
    const text = await readFile(LEDGER_PATH, "utf-8");
    const lines = text.trim().split("\n").filter(Boolean);
    const records = lines.slice(-limit).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    return {
      content: [{ type: "text", text: JSON.stringify({ total: lines.length, returned: records.length, records }, null, 2) }],
    };
  } catch {
    return { content: [{ type: "text", text: JSON.stringify({ total: 0, returned: 0, records: [] }, null, 2) }] };
  }
}

// ── Tool registry (MCP tool descriptors) ──────────────────────────────────────

export const MERCURY_TOOLS = [
  {
    name: "mercury_list_accounts",
    description: "List all Mercury Bank accounts for Liana Banyan Corp. Read-only autonomy.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "mercury_get_balance",
    description: "Get current balance for a Mercury Bank account. Read-only autonomy.",
    inputSchema: {
      type: "object",
      properties: { account_id: { type: "string", description: "Account ID from mercury_list_accounts" } },
      required: ["account_id"],
    },
  },
  {
    name: "mercury_get_transactions",
    description: "Get transaction history for a Mercury Bank account. Read-only autonomy.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string" },
        limit: { type: "number", default: 50 },
        offset: { type: "number", default: 0 },
      },
      required: ["account_id"],
    },
  },
  {
    name: "mercury_get_statements",
    description: "Get account statements for a Mercury Bank account. Read-only autonomy.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string" },
        year: { type: "number" },
        month: { type: "number" },
      },
      required: ["account_id"],
    },
  },
  {
    name: "mercury_request_transfer",
    description: "Request an internal account transfer. Returns needsApproval:true — Fire Control gate. Does NOT execute.",
    inputSchema: {
      type: "object",
      properties: {
        from_account_id: { type: "string" },
        to_account_id: { type: "string" },
        amount_cents: { type: "number" },
        memo: { type: "string" },
      },
      required: ["from_account_id", "to_account_id", "amount_cents"],
    },
  },
  {
    name: "mercury_request_ach",
    description: "Request an ACH payment. Returns needsApproval:true — Fire Control gate. Does NOT execute.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string" },
        amount_cents: { type: "number" },
        routing_number: { type: "string" },
        account_number: { type: "string" },
        memo: { type: "string" },
      },
      required: ["account_id", "amount_cents", "routing_number", "account_number"],
    },
  },
  {
    name: "mercury_request_wire",
    description: "Request a wire transfer. Returns needsApproval:true — Fire Control gate. Does NOT execute.",
    inputSchema: {
      type: "object",
      properties: {
        account_id: { type: "string" },
        amount_cents: { type: "number" },
        recipient_name: { type: "string" },
        routing_number: { type: "string" },
        account_number: { type: "string" },
        memo: { type: "string" },
      },
      required: ["account_id", "amount_cents", "recipient_name", "routing_number", "account_number"],
    },
  },
  {
    name: "mercury_approve_action",
    description: "Consume a pending approval token to authorize a previously gated write action.",
    inputSchema: {
      type: "object",
      properties: { action_id: { type: "string" } },
      required: ["action_id"],
    },
  },
  {
    name: "mercury_revoke_approval",
    description: "Revoke a pending approval token (cancels a previously requested write action).",
    inputSchema: {
      type: "object",
      properties: { action_id: { type: "string" } },
      required: ["action_id"],
    },
  },
  {
    name: "mercury_query_ledger",
    description: "Query the append-only Mercury ledger (observations + action requests). Read-only.",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "number", default: 50 } },
      required: [],
    },
  },
];
