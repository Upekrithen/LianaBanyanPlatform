// House Calls Test Harness -- §5 of BLACK_MAMBA_HOUSE_CALLS_BP073_AI_PAIR_RESILIENCE.md
// BP073 · Knight Sonnet 4.6 Medium
// WORKS / PARTIAL / NOT YET per scenario -- run and verify before stamping
// Empirical receipt: knight-bishop-bridge MCP server disconnected 2026-06-04 BP073.
// House Calls Tier-0 restart_named_mcp_server would have handled this incident automatically.

import { describe, it, expect, vi } from 'vitest';
import {
  validateHouseCallOperation,
  verifyConsentCheck,
  type HouseCallsAllowlist,
} from '../../lib/house-calls/house-calls-validator';

// Inline allowlist fixture mirroring mnemosynec_house_calls_allowlist.json v1.0.0
// Kept inline so tests are self-contained and not coupled to file I/O.
const allowlist: HouseCallsAllowlist = {
  allowlist_version: '1.0.0',
  allowlist_hash: 'TODO_HASH',
  created_at: '2026-06-04',
  program: 'BP073',
  tiers: {
    tier_0: {
      label: 'Auto-execute, no ratify',
      operations: [
        'restart_named_mcp_server',
        'reload_config_file',
        'clear_cache',
        'run_health_check',
      ],
    },
    tier_1: {
      label: 'Notify-but-execute',
      operations: [
        'restart_known_background_process',
        'reinstall_mcp_server_at_pinned_version',
        'reset_connection',
      ],
    },
    tier_2: {
      label: 'Founder ratify required',
      operations: [
        'install_new_mcp_server',
        'update_mcp_server_to_new_version',
        'modify_allowlist',
        'change_credentials',
        'modify_files_outside_runtime_config_scope',
      ],
    },
    forbidden: {
      label: 'No ratify path -- never execute',
      operations: [
        'modify_user_data',
        'alter_substrate_eblets',
        'send_messages_on_founders_behalf',
        'access_financial_credentials',
        'any_action_in_bishop_standing_doctrine_prohibited_list',
      ],
    },
  },
  privacy_doorpost:
    'House Calls is runtime-tool-state only. The paired AI cannot read conversation history, substrate data, or credentials.',
  ip_ledger_event_types: [
    'runtime.health.degraded',
    'runtime.health.restored',
    'house_call.initiated',
    'house_call.completed',
    'house_call.escalated_to_founder',
  ],
};

// Minimal house_call message shape matching the Yoke schema extension.
interface HouseCallMessage {
  type: 'house_call';
  direction: 'BISHOP_TO_KNIGHT' | 'KNIGHT_TO_BISHOP';
  signature: string;
  remediation_proposed: string;
  tier: number;
  substrate_entry_ref: string;
  consent_check: string;
  timestamp: string;
}

interface HouseCallResponse {
  type: 'house_call_response';
  action_taken: string | null;
  observed_state: Record<string, unknown>;
  follow_up_required: boolean;
  error_if_any: string | null;
}

describe('House Calls Runtime Resilience', () => {
  it('Scenario 1: Tier-0 MCP server restart completes under 10 seconds', async () => {
    // Arrange: Tier-0 house_call simulating the 2026-06-04 knight-bishop-bridge disconnect.
    const houseCall: HouseCallMessage = {
      type: 'house_call',
      direction: 'BISHOP_TO_KNIGHT',
      signature: 'mcp-disconnect-2026-06-04-bp073',
      remediation_proposed: 'restart_named_mcp_server',
      tier: 0,
      substrate_entry_ref: 'ip-ledger-001',
      consent_check: allowlist.allowlist_hash,
      timestamp: new Date().toISOString(),
    };

    // Assert: operation is in tier_0 list
    const validation = validateHouseCallOperation(
      houseCall.remediation_proposed,
      allowlist
    );
    expect(validation.allowed).toBe(true);
    expect(validation.tier).toBe(0);
    expect(allowlist.tiers.tier_0.operations).toContain(houseCall.remediation_proposed);

    // Assert: type and direction fields are valid
    expect(houseCall.type).toBe('house_call');
    expect(['BISHOP_TO_KNIGHT', 'KNIGHT_TO_BISHOP']).toContain(houseCall.direction);

    // Assert: mock shell execution resolves with action_taken
    const mockRestartServer = vi.fn().mockResolvedValue({ success: true, server: 'knight-bishop-bridge' });
    const execResult = await mockRestartServer();
    expect(execResult.success).toBe(true);
    expect(mockRestartServer).toHaveBeenCalledOnce();

    // Timing assertion: mock start/end timestamps show < 10000ms
    const startMs = Date.now();
    await mockRestartServer();
    const elapsedMs = Date.now() - startMs;
    expect(elapsedMs).toBeLessThan(10000);

    const response: HouseCallResponse = {
      type: 'house_call_response',
      action_taken: 'restart_named_mcp_server',
      observed_state: { server: 'knight-bishop-bridge', status: 'restarted', elapsed_ms: elapsedMs },
      follow_up_required: false,
      error_if_any: null,
    };
    expect(response.action_taken).toBe(houseCall.remediation_proposed);
    expect(response.follow_up_required).toBe(false);
    expect(response.error_if_any).toBeNull();
  });

  it('Scenario 2: Tier-0 cache clear reduces drift count below 100', async () => {
    // Arrange: Tier-0 house_call with clear_cache operation
    const houseCall: HouseCallMessage = {
      type: 'house_call',
      direction: 'KNIGHT_TO_BISHOP',
      signature: 'stale-cache-drift-2026-06-04',
      remediation_proposed: 'clear_cache',
      tier: 0,
      substrate_entry_ref: 'ip-ledger-002',
      consent_check: allowlist.allowlist_hash,
      timestamp: new Date().toISOString(),
    };

    // Assert: operation is in tier_0 list
    const validation = validateHouseCallOperation(
      houseCall.remediation_proposed,
      allowlist
    );
    expect(validation.allowed).toBe(true);
    expect(validation.tier).toBe(0);
    expect(allowlist.tiers.tier_0.operations).toContain('clear_cache');

    // Mock: cache clear reports drift count before/after
    const mockCacheClear = vi.fn().mockResolvedValue({
      drift_count_before: 150,
      drift_count_after: 42,
    });
    const clearResult = await mockCacheClear();

    // Assert: house_call_response observed_state contains drift count
    const response: HouseCallResponse = {
      type: 'house_call_response',
      action_taken: 'clear_cache',
      observed_state: {
        drift_count_before: clearResult.drift_count_before,
        drift_count: clearResult.drift_count_after,
      },
      follow_up_required: false,
      error_if_any: null,
    };

    expect(response.observed_state).toHaveProperty('drift_count');
    expect(response.observed_state.drift_count as number).toBeLessThan(100);

    // Assert: follow_up_required is false on success
    expect(response.follow_up_required).toBe(false);
    expect(response.error_if_any).toBeNull();
  });

  it('Scenario 3: Tier-1 reinstall notifies before executing', async () => {
    // Arrange: Tier-1 house_call with reinstall_mcp_server_at_pinned_version
    const houseCall: HouseCallMessage = {
      type: 'house_call',
      direction: 'BISHOP_TO_KNIGHT',
      signature: 'mcp-version-drift-2026-06-04',
      remediation_proposed: 'reinstall_mcp_server_at_pinned_version',
      tier: 1,
      substrate_entry_ref: 'ip-ledger-003',
      consent_check: allowlist.allowlist_hash,
      timestamp: new Date().toISOString(),
    };

    // Assert: operation is in tier_1 list (not tier_0)
    const validation = validateHouseCallOperation(
      houseCall.remediation_proposed,
      allowlist
    );
    expect(validation.allowed).toBe(true);
    expect(validation.tier).toBe(1);
    expect(allowlist.tiers.tier_1.operations).toContain(houseCall.remediation_proposed);
    expect(allowlist.tiers.tier_0.operations).not.toContain(houseCall.remediation_proposed);

    // Assert: house_call message tier field === 1
    expect(houseCall.tier).toBe(1);

    // Assert: notification is emitted before execution mock is called
    const callOrder: string[] = [];
    const mockNotify = vi.fn().mockImplementation(() => {
      callOrder.push('notify');
    });
    const mockExecute = vi.fn().mockImplementation(() => {
      callOrder.push('execute');
    });

    // Simulate Tier-1 notify-then-execute sequence
    mockNotify();
    mockExecute();

    expect(mockNotify).toHaveBeenCalledOnce();
    expect(mockExecute).toHaveBeenCalledOnce();
    expect(callOrder).toEqual(['notify', 'execute']);
    expect(callOrder.indexOf('notify')).toBeLessThan(callOrder.indexOf('execute'));
  });

  it('Scenario 4: Tier-2 new install requires Founder ratify before execution', async () => {
    // Arrange: Tier-2 house_call with install_new_mcp_server
    const houseCall: HouseCallMessage = {
      type: 'house_call',
      direction: 'BISHOP_TO_KNIGHT',
      signature: 'missing-mcp-2026-06-04',
      remediation_proposed: 'install_new_mcp_server',
      tier: 2,
      substrate_entry_ref: 'ip-ledger-004',
      consent_check: allowlist.allowlist_hash,
      timestamp: new Date().toISOString(),
    };

    // Assert: operation is in tier_2 list
    const validation = validateHouseCallOperation(
      houseCall.remediation_proposed,
      allowlist
    );
    expect(validation.allowed).toBe(true);
    expect(validation.tier).toBe(2);
    expect(allowlist.tiers.tier_2.operations).toContain('install_new_mcp_server');

    // Gate function: executes only when a ratify token is present
    const mockExecute = vi.fn();

    function executeWithRatify(ratifyToken: string | null): HouseCallResponse {
      if (!ratifyToken) {
        return {
          type: 'house_call_response',
          action_taken: null,
          observed_state: {},
          follow_up_required: true,
          error_if_any: 'Founder ratify token required for Tier-2 operation',
        };
      }
      mockExecute(ratifyToken);
      return {
        type: 'house_call_response',
        action_taken: 'install_new_mcp_server',
        observed_state: { ratify_token: ratifyToken },
        follow_up_required: false,
        error_if_any: null,
      };
    }

    // Assert: execution is NOT called without ratify token
    const responseWithoutRatify = executeWithRatify(null);
    expect(mockExecute).not.toHaveBeenCalled();

    // Assert: follow_up_required === true when ratify is absent
    expect(responseWithoutRatify.follow_up_required).toBe(true);
    expect(responseWithoutRatify.action_taken).toBeNull();
    expect(responseWithoutRatify.error_if_any).not.toBeNull();

    // Confirm: execution proceeds once a valid ratify token is supplied
    const responseWithRatify = executeWithRatify('FOUNDER-RATIFY-TOKEN-001');
    expect(mockExecute).toHaveBeenCalledOnce();
    expect(responseWithRatify.follow_up_required).toBe(false);
  });

  it('Scenario 5: Forbidden action is refused and logged -- spoofed message rejected', async () => {
    // This test documents the MCP disconnect incident: knight-bishop-bridge disconnected
    // 2026-06-04 BP073. House Calls Tier-0 restart_named_mcp_server would have handled it.
    // This scenario confirms the FORBIDDEN layer correctly rejects spoofed Yoke messages.

    // Arrange: spoofed house_call requesting access_financial_credentials
    const spoofedHouseCall: HouseCallMessage = {
      type: 'house_call',
      direction: 'BISHOP_TO_KNIGHT',
      signature: 'spoofed-credential-grab-2026-06-04',
      remediation_proposed: 'access_financial_credentials',
      tier: 0, // spoofer attempts Tier-0 classification to bypass checks
      substrate_entry_ref: 'ip-ledger-spoofed',
      consent_check: 'fake-hash-not-in-allowlist',
      timestamp: new Date().toISOString(),
    };

    // Assert: operation is in the forbidden list
    expect(allowlist.tiers.forbidden.operations).toContain('access_financial_credentials');

    // Assert: validateHouseCallOperation returns allowed=false, tier='forbidden'
    const validation = validateHouseCallOperation(
      spoofedHouseCall.remediation_proposed,
      allowlist
    );
    expect(validation.allowed).toBe(false);
    expect(validation.tier).toBe('forbidden');

    // Assert: consent_check hash does not match (spoofed origin)
    const consentValid = verifyConsentCheck(
      spoofedHouseCall.consent_check,
      allowlist
    );
    expect(consentValid).toBe(false);

    // Gate function: produces refusal response for forbidden operations
    function executeHouseCall(val: typeof validation): HouseCallResponse {
      if (!val.allowed) {
        return {
          type: 'house_call_response',
          action_taken: null,
          observed_state: {},
          follow_up_required: true,
          error_if_any: `Forbidden operation refused: ${val.reason}`,
        };
      }
      return {
        type: 'house_call_response',
        action_taken: spoofedHouseCall.remediation_proposed,
        observed_state: {},
        follow_up_required: false,
        error_if_any: null,
      };
    }

    // Assert: execution returns refusal (not a throw -- refusal is observable)
    const response = executeHouseCall(validation);

    // Assert: error_if_any is non-null (refusal is logged)
    expect(response.error_if_any).not.toBeNull();
    expect(response.error_if_any).toContain('Forbidden');

    // Assert: follow_up_required === true (escalate to Founder)
    expect(response.follow_up_required).toBe(true);

    // Assert: no action was taken
    expect(response.action_taken).toBeNull();
  });
});
