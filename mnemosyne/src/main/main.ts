/**
 * main.ts — Mnemosyne Electron main process entry point
 *
 * Registers all IPC handlers and creates the BrowserWindow.
 *
 * Canon: W5c Path A · BP057
 */

import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { registerIpcHandlers } from "./ipc-handlers.js";

// Register all Mnemosyne IPC handlers (pearl, whisper, phoebe)
registerIpcHandlers();

// Expose a helper for the renderer to write temp audio files
ipcMain.handle("fs:writeTempAudio", async (_event, arrayBuffer: ArrayBuffer, ext: string) => {
  const dir = join(tmpdir(), "mnemosyne-audio");
  mkdirSync(dir, { recursive: true });
  const tmpPath = join(dir, `recording-${Date.now()}.${ext}`);
  writeFileSync(tmpPath, Buffer.from(arrayBuffer));
  return tmpPath;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "MnemosyneC",
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
