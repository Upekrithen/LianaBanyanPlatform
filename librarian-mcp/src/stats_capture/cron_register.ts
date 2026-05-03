/**
 * Cron Registration Helper — KN-S2 / BP018
 * ==========================================
 * Registers Windows Task Scheduler tasks for:
 *   - Daily 03:00: stats-capture prune
 *   - Weekly Sunday 04:00: stats-capture archive
 *
 * On non-Windows, outputs equivalent cron expressions.
 * Idempotent: re-registration overwrites existing task of same name.
 */

import { execSync } from "child_process";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname_cron = dirname(__filename);

const STATS_CAPTURE_BIN = resolve(__dirname_cron, "../../bin/stats-capture.mjs");
const NODE_PATH = process.execPath;

export type CronRegistrationResult = {
  platform: NodeJS.Platform;
  tasks_registered: string[];
  cron_expressions?: string[];
  error?: string;
};

/**
 * Register daily prune + weekly archive tasks.
 * Windows: uses schtasks.exe
 * Other: returns cron expressions for manual crontab registration.
 */
export function registerCronTasks(): CronRegistrationResult {
  if (process.platform === "win32") {
    return _registerWindows();
  }
  return _returnCronExpressions();
}

function _registerWindows(): CronRegistrationResult {
  const tasks: string[] = [];
  const dailyCmd = `"${NODE_PATH}" "${STATS_CAPTURE_BIN}" prune`;
  const weeklyCmd = `"${NODE_PATH}" "${STATS_CAPTURE_BIN}" archive`;

  try {
    // Daily 03:00
    execSync(
      `schtasks /create /tn "LB-StatsCaptureDaily" /tr "${dailyCmd}" /sc DAILY /st 03:00 /f`,
      { stdio: "pipe" }
    );
    tasks.push("LB-StatsCaptureDaily (daily 03:00 prune)");

    // Weekly Sunday 04:00
    execSync(
      `schtasks /create /tn "LB-StatsCaptureWeekly" /tr "${weeklyCmd}" /sc WEEKLY /d SUN /st 04:00 /f`,
      { stdio: "pipe" }
    );
    tasks.push("LB-StatsCaptureWeekly (Sunday 04:00 archive)");

    return { platform: "win32", tasks_registered: tasks };
  } catch (err) {
    return { platform: "win32", tasks_registered: tasks, error: String(err) };
  }
}

function _returnCronExpressions(): CronRegistrationResult {
  return {
    platform: process.platform,
    tasks_registered: [],
    cron_expressions: [
      `0 3 * * * ${NODE_PATH} ${STATS_CAPTURE_BIN} prune  # daily 03:00 prune`,
      `0 4 * * 0 ${NODE_PATH} ${STATS_CAPTURE_BIN} archive # weekly Sunday 04:00 archive`,
    ],
  };
}
