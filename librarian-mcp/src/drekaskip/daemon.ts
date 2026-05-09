/**
 * Drekaskip Wave Generator — Daemon Entry Point (Bushel 61A)
 * Run: node dist/drekaskip/daemon.js
 *
 * G10 T4 production-class: long-running, crash-recoverable, health-checked.
 * Port: DREKASKIP_PORT env var (default 7461).
 */

import { startDaemon } from "./server.js";

startDaemon();
