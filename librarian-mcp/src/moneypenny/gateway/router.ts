/**
 * MoneyPenny Routing Gateway — Main Entry Point (§4, Bushel 82, BP034)
 * Orchestrates: classify → arbitrate → hold-or-route → receipt
 *
 * G1 gate: route() accepts inbound; returns RoutingDecision in <500ms;
 * receipts written to ~/.claude/state/moneypenny/calls/
 */

import type {
  InboundSignal, RoutingDecision, HoldHandle, CallerClass,
  CallerProfile, ThreadHandle,
} from "../types.js";
import { classifyCaller, buildCallerProfile } from "./priority_taxonomy.js";
import { arbitrate, type ArbiterInput } from "./no_collision_arbiter.js";
import { initiateEngagement } from "./hold_and_engage.js";
import { readAvailability } from "../calendar/availability_state.js";
import { getOrCreateThread } from "../mcci/thread_store.js";

export interface RouteResult {
  decision: RoutingDecision;
  caller_profile: CallerProfile;
  hold_handle?: HoldHandle;
  thread_id: ThreadHandle;
}

/**
 * Route an inbound interaction.
 * Returns RoutingDecision with substrate Eblet receipt path.
 */
export async function route(
  signal: InboundSignal,
  overrideClass?: CallerClass,
  isFamilyEmergency = false,
): Promise<RouteResult> {
  const callerClass = classifyCaller(signal.caller, overrideClass);
  const callerProfile = buildCallerProfile(signal.caller, [], overrideClass);
  const thread = await getOrCreateThread(signal.caller.id, "relationship");
  const thread_id = thread.id;
  const availability = readAvailability();

  const arbInput: ArbiterInput = {
    signal,
    thread_id,
    caller_class: callerClass,
    availability,
    isFamilyEmergency,
  };
  const { decision, hold_handle } = arbitrate(arbInput);

  if (decision.outcome === "HOLD_SUBSTANTIVE" && hold_handle) {
    initiateEngagement(hold_handle, signal.signal);
  }

  return { decision, caller_profile: callerProfile, hold_handle, thread_id };
}

/**
 * Override a caller's class in the known-callers registry.
 * Founder-direct mechanism per G2 gate.
 */
export async function overrideCallerClass(
  callerId: string,
  newClass: CallerClass,
): Promise<void> {
  const { readFileSync, writeFileSync, existsSync, mkdirSync } =
    await import("node:fs");
  const { resolve } = await import("node:path");
  const { homedir } = await import("node:os");

  const registryPath = resolve(
    homedir(), ".claude", "state", "moneypenny", "known_callers.json",
  );
  mkdirSync(resolve(registryPath, ".."), { recursive: true });

  let registry: Record<string, CallerClass> = {};
  if (existsSync(registryPath)) {
    try {
      registry = JSON.parse(readFileSync(registryPath, "utf-8")) as Record<string, CallerClass>;
    } catch { /* */ }
  }
  registry[callerId.toLowerCase()] = newClass;
  writeFileSync(registryPath, JSON.stringify(registry, null, 2));
}
