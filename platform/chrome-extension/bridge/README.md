# Mnemosyne Bridge Server

Scope 29: Local HTTP bridge between the Chrome extension and Mnemosyne memory.

## Quick Start

```bash
cd platform/chrome-extension/bridge
node server.js
```

Server starts at `http://localhost:11480`. No dependencies - pure Node.js built-ins only.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Bridge status, version, eblet count |
| POST | /substrate/query | Query local memory (body: `{ query: string }`) |
| POST | /yoke/note | Save a note (body: `{ note: string, tags?: string[] }`) |

All endpoints return JSON. CORS is open (`*`) for localhost extension use.

## Auth (Optional)

By default, the bridge uses **localhost trust mode** - no token required. This is safe
because the server binds to `127.0.0.1` only (not reachable from the network).

To require a token (recommended if you share the machine):

```bash
# Windows
set MNEMO_TOKEN=mnemo_tok_yoursecrethere
node server.js

# macOS/Linux
MNEMO_TOKEN=mnemo_tok_yoursecrethere node server.js
```

Then set the same token in the Chrome extension Options page (click the gear icon in the popup).

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `MNEMO_PORT` | 11480 | Port to listen on |
| `MNEMO_TOKEN` | (empty) | Required Bearer token; empty = trust mode |
| `MNEMO_DATA_DIR` | ./data | Directory for notes.json and eblets.json |

## Data Storage

Notes saved via the extension are stored in `data/notes.json`. Eblets (your
longer-form memories) are read from `data/eblets.json`. Both files are plain JSON
arrays and can be edited directly.

## WORKS / PARTIAL / NOT YET (Scope 18-22)

| Scope | Feature | Status |
|-------|---------|--------|
| 18 | `/health` endpoint (status, version, index_size) | WORKS |
| 19 | `/substrate/query` - search eblets + notes | WORKS |
| 20 | `/yoke/note` - save notes to disk | WORKS |
| 21 | Bearer token auth (optional) | WORKS |
| 22 | Bridge server launch script | WORKS |
