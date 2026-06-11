import http from "http";
import express, { Request, Response, NextFunction } from "express";
import { WebSocketServer } from "ws";
import publishRouter from "./routes/publish";
import resolveRouter from "./routes/resolve";
import { handleCircuitUpgrade, startEpochWatcher } from "./routes/circuit";

const PORT = parseInt(process.env.PORT || "8080", 10);
const RELAY_ORIGIN = process.env.RELAY_ORIGIN || "https://relay.lianabanyan.com";
const ALLOW_INSECURE = process.env.ALLOW_INSECURE === "true";

function requireTls(req: Request, res: Response, next: NextFunction): void {
  if (ALLOW_INSECURE) {
    next();
    return;
  }

  const proto = req.headers["x-forwarded-proto"];
  if (proto && proto !== "https") {
    res.status(403).json({ ok: false, error: "TLS required" });
    return;
  }
  next();
}

const app = express();
app.use(requireTls);
app.use(express.json({ limit: "16kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/publish", publishRouter);
app.use("/resolve", resolveRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "not found" });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const url = req.url ?? "";
  if (url.startsWith("/circuit/")) {
    handleCircuitUpgrade(wss, req, socket, head);
    return;
  }
  socket.destroy();
});

server.listen(PORT, () => {
  console.log(`[wan-relay] listening port=${PORT} origin=${RELAY_ORIGIN} ts=${new Date().toISOString()}`);
});

startEpochWatcher();

process.on("SIGTERM", () => {
  console.log("[wan-relay] SIGTERM — shutting down");
  server.close(() => process.exit(0));
});
