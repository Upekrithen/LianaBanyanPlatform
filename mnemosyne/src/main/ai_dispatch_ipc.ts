/**
 * ai_dispatch_ipc.ts
 * Gate J+M — Substrate-first + MoneyPenny-preflight query routing
 * BLACK MAMBA gamma - BP060 W2 - 2026-05-28T01:25Z
 * MoneyPenny wiring: BP060 W3 K2 - 2026-05-28T18:31Z
 *
 * Gate J behavior:
 * - Before routing to AI provider: call areopagus_audit MCP with query as search term
 * - If substrate hit returned: prepend to context (free, no AI cost)
 * - If substrate miss: route to chosen AI provider per Court selection
 * - Response object includes substrate_hit: bool so UI can show badge
 *
 * Gate M (MoneyPenny preflight) — added BP060 W3:
 * - After substrate miss: call brief_me (MoneyPenny smart-router) for domain context
 * - If MoneyPenny context returned: prepend to AI query (reduces tokens = cost savings)
 * - Provider dispatch precedence: Substrate → MoneyPenny → AI provider
 *
 * Gate I: "substrate" stays as internal term in code; UI badges say "From Knowledge Index"
 */

import { ipcMain, ipcRenderer } from 'electron';
import { classifyAndRoute } from './moneypenny_classifier';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QueryRequest {
  query: string;
  provider: 'claude' | 'gpt' | 'perplexity' | 'gemini';
  context?: string;
  session_id?: string;
}

export interface QueryResponse {
  answer: string;
  provider_used: string;
  substrate_hit: boolean;
  substrate_context?: string;
  moneypenny_hit: boolean;
  moneypenny_context?: string;
  domain_hints?: string[];
  tokens_used?: number;
}

// ─── IPC channel names ────────────────────────────────────────────────────────

export const AI_DISPATCH_CHANNEL = 'ai:dispatch';
export const AI_RESPONSE_CHANNEL = 'ai:response';

// ─── Substrate-first lookup (main process side) ───────────────────────────────

/**
 * substrateFirstQuery — Gate J implementation.
 * Call areopagus_audit MCP tool with query as search term.
 * Returns substrate context string if hit, null if miss.
 *
 * Integration: call this BEFORE routing to any AI provider.
 */
async function substrateFirstQuery(query: string): Promise<string | null> {
  try {
    // Attempt MCP tool call via librarian
    const { callMcpTool } = await import('./mcp_bridge');
    const result = await callMcpTool('librarian', 'areopagus_audit', {
      search_term: query,
      limit: 5,
    });

    if (result && result.hits && result.hits.length > 0) {
      const contextLines = result.hits.map((hit: any) =>
        `[Knowledge Index: ${hit.canonical_ref ?? hit.name ?? 'item'}]\n${hit.excerpt ?? hit.description ?? ''}`
      ).join('\n\n');
      return contextLines;
    }
    return null;
  } catch (err) {
    // MCP unavailable — silent miss, fall through to AI provider
    console.warn('[ai_dispatch_ipc] substrate lookup failed (non-fatal):', err);
    return null;
  }
}

// ─── MoneyPenny preflight (main process side) ─────────────────────────────────

export interface MoneyPennyResult {
  hit: boolean;
  context?: string;
  domain_hints?: string[];
}

/**
 * moneyPennyConsult — Gate M implementation (BP060 W3).
 * Call brief_me (MoneyPenny smart-router) for domain context enrichment.
 * Runs AFTER substrate miss, BEFORE AI provider routing.
 *
 * Returns domain context if the query matches known LB domains/concepts.
 * Non-fatal: returns {hit: false} on any error or MCP unavailability.
 */
async function moneyPennyConsult(query: string): Promise<MoneyPennyResult> {
  try {
    // Task-class routing: classify query before MCP consult (BP060_W3_WAKIZASHI)
    const routing = classifyAndRoute(query);
    console.log(`[ai_dispatch_ipc] MoneyPenny routing: class=${routing.task_class} primary=${routing.primary} cost=${routing.cost_class}`);

    const { callMcpTool } = await import('./mcp_bridge');
    const result = await callMcpTool('librarian', 'brief_me', {
      task: query,
    });

    if (result && result.matchedDomains && result.matchedDomains.length > 0) {
      const domainHints: string[] = result.matchedDomains.map((d: any) => d.name as string);
      const conceptLines = (result.relevantConcepts ?? [])
        .map((c: any) => `- ${c.title}: ${c.summary}`)
        .join('\n');
      const canonicalLine = result.canonicalReminders
        ? `Creator keeps ${result.canonicalReminders.creatorKeeps} | Membership: ${result.canonicalReminders.membershipCost}`
        : '';
      const ctx = [
        `[Platform Knowledge: domain=${domainHints[0]}]`,
        conceptLines || '',
        canonicalLine || '',
      ].filter(Boolean).join('\n');
      return { hit: true, context: ctx, domain_hints: domainHints };
    }
    return { hit: false };
  } catch (err) {
    // MCP unavailable — silent miss, fall through to AI provider
    console.warn('[ai_dispatch_ipc] MoneyPenny consult failed (non-fatal):', err);
    return { hit: false };
  }
}

// ─── Main process IPC handler ─────────────────────────────────────────────────

/**
 * registerAiDispatchHandler — call once in main process setup.
 * Handles Gate J: substrate-first, then AI provider routing.
 */
export function registerAiDispatchHandler(): void {
  ipcMain.handle(AI_DISPATCH_CHANNEL, async (_event, req: QueryRequest): Promise<QueryResponse> => {
    const { query, provider, context = '', session_id } = req;

    // Gate J — substrate-first lookup
    const substrateContext = await substrateFirstQuery(query);
    const substrate_hit = substrateContext !== null;

    let fullContext = context;
    if (substrate_hit && substrateContext) {
      // Gate I: prepend substrate context with member-facing label
      fullContext = `--- From Knowledge Index ---\n${substrateContext}\n--- End Knowledge Index ---\n\n${context}`;
    }

    // Gate M — MoneyPenny preflight (only if substrate miss; substrate already answered for free)
    let moneypenny_hit = false;
    let moneypenny_context: string | undefined;
    let domain_hints: string[] | undefined;

    if (!substrate_hit) {
      const mpResult = await moneyPennyConsult(query);
      if (mpResult.hit && mpResult.context) {
        moneypenny_hit = true;
        moneypenny_context = mpResult.context;
        domain_hints = mpResult.domain_hints;
        fullContext = `--- Platform Knowledge ---\n${mpResult.context}\n--- End Platform Knowledge ---\n\n${fullContext}`;
      }
    }

    // Route to AI provider
    let answer = '';
    let provider_used = provider;

    try {
      const { routeToProvider } = await import('./ai_providers');
      const providerResponse = await routeToProvider({
        query,
        context: fullContext,
        provider,
        session_id,
      });
      answer = providerResponse.answer;
      provider_used = providerResponse.provider_used as QueryRequest['provider'];
    } catch (err) {
      answer = `Error routing to ${provider}: ${err}`;
    }

    return {
      answer,
      provider_used,
      substrate_hit,
      substrate_context: substrate_hit ? substrateContext! : undefined,
      moneypenny_hit,
      moneypenny_context,
      domain_hints,
    };
  });
}

// ─── Renderer process API (invoke from renderer) ──────────────────────────────

/**
 * dispatchQuery — call from renderer process.
 * Returns QueryResponse with substrate_hit flag.
 * UI can show "answered from Knowledge Index" badge when substrate_hit is true.
 */
export async function dispatchQuery(req: QueryRequest): Promise<QueryResponse> {
  return ipcRenderer.invoke(AI_DISPATCH_CHANNEL, req);
}
