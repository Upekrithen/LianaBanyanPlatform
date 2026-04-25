/**
 * Helm Module Registry — K484/B123
 *
 * Module registration API. Each module declares its identity + entrypoint.
 * The shell maintains an enabled-modules registry (user-editable via settings).
 *
 * See MODULE_API.md for the full spec.
 */

import React from 'react'

export interface HelmModule {
  /** Unique stable identifier for this module. Never changes after registration. */
  id: string
  /** Display name shown in the Helm UI. */
  name: string
  /** Short description shown in the modules list. */
  description: string
  /** If false, module is opt-in (not shown by default). Most modules should be false. */
  enabledByDefault: boolean
  /** Category tag for grouping in the modules list. */
  category: 'cathedral' | 'tools' | 'community' | 'labs'
  /** React component to render when the module is enabled. */
  component: React.ComponentType
  /** Semantic version of this module. */
  version: string
}

// ─── Built-in module: member-cathedral-preview ────────────────────────────────

import { MemberCathedralPreview } from './MemberCathedralPreview'

const BUILTIN_MODULES: HelmModule[] = [
  {
    id: 'member-cathedral-preview',
    name: 'Member Cathedral',
    description: 'Personal Cathedral — your bedrock tablets, Scribes, and Sculptor-filtered feeds. Coming soon.',
    enabledByDefault: false,
    category: 'cathedral',
    component: MemberCathedralPreview,
    version: '0.1.0',
  },
]

// ─── Registry ─────────────────────────────────────────────────────────────────

const _registry: Map<string, HelmModule> = new Map()

BUILTIN_MODULES.forEach((m) => _registry.set(m.id, m))

/**
 * Register a module at runtime. External modules call this to add themselves.
 * Modules registered here are available to be enabled/disabled via settings.
 */
export function registerModule(mod: HelmModule): void {
  if (_registry.has(mod.id)) {
    console.warn(`[Helm] Module '${mod.id}' is already registered; skipping duplicate.`)
    return
  }
  _registry.set(mod.id, mod)
}

/** Return all registered modules in insertion order. */
export function getAllModules(): HelmModule[] {
  return Array.from(_registry.values())
}

/** Return a module by id, or undefined. */
export function getModule(id: string): HelmModule | undefined {
  return _registry.get(id)
}
