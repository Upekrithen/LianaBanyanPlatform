/**
 * moneypenny_classifier.ts
 * Task-class routing classifier — MoneyPenny policy enforcement
 * BP060_W3_WAKIZASHI · 2026-05-28
 *
 * Classifies a task description into one of 6 task classes and returns
 * the canonical routing destination per moneypenny_routing_policy.json.
 *
 * Task-class burn asymmetry (Rev 4): mechanical tasks cost zero;
 * architecture tasks cost cloud-premium. Route accordingly.
 */

import * as fs from 'fs';
import * as path from 'path';

export type TaskClass = 'M' | 'C-refinement' | 'H' | 'C-synthesis' | 'C-novel' | 'C-architecture';
export type RoutingDestination = 'PYTHON_LOCAL' | 'OLLAMA_7B_LOCAL' | 'OLLAMA_70B_LOCAL' | 'CLOUD_SONNET' | 'CLOUD_OPUS';

interface PolicyRoute {
  task_class: TaskClass;
  routing: RoutingDestination;
  fallback?: RoutingDestination;
  cost_class: string;
  examples: string[];
}

interface RoutingPolicy {
  version: string;
  bp_tag: string;
  routes: PolicyRoute[];
}

let _policy: RoutingPolicy | null = null;

function loadPolicy(): RoutingPolicy {
  if (_policy) return _policy;
  const policyPath = path.join(__dirname, 'moneypenny_routing_policy.json');
  _policy = JSON.parse(fs.readFileSync(policyPath, 'utf-8')) as RoutingPolicy;
  return _policy;
}

export function classifyTask(taskDescription: string): TaskClass {
  const desc = taskDescription.toLowerCase();

  if (desc.match(/architect|design system|canonical|statute|blueprint|policy|define protocol/)) {
    return 'C-architecture';
  }
  if (desc.match(/first draft|write new|create article|patent|original|new paper/)) {
    return 'C-novel';
  }
  if (desc.match(/combine|synthesize|merge sources|technical synthesis|from outline/)) {
    return 'C-synthesis';
  }
  if (desc.match(/summarize|extract|convert|structured output|from existing/)) {
    return 'H';
  }
  if (desc.match(/polish|fix|refine|edit|typo|audit|compliance|clean up/)) {
    return 'C-refinement';
  }
  return 'M';
}

export function routeTask(taskClass: TaskClass): { primary: RoutingDestination; fallback?: RoutingDestination } {
  const p = loadPolicy();
  const route = p.routes.find(r => r.task_class === taskClass);
  if (!route) return { primary: 'CLOUD_SONNET' };
  return { primary: route.routing as RoutingDestination, fallback: route.fallback as RoutingDestination | undefined };
}

export function classifyAndRoute(taskDescription: string): {
  task_class: TaskClass;
  primary: RoutingDestination;
  fallback?: RoutingDestination;
  cost_class: string;
} {
  const taskClass = classifyTask(taskDescription);
  const routing = routeTask(taskClass);
  const p = loadPolicy();
  const route = p.routes.find(r => r.task_class === taskClass);
  return {
    task_class: taskClass,
    primary: routing.primary,
    fallback: routing.fallback,
    cost_class: route?.cost_class ?? 'unknown',
  };
}
