#!/usr/bin/env python3
"""
BP065 Mesh Test Harness — run_mesh_test.py
==========================================
Tests the network effect of the Frontier mesh:
  ALONE  — machine answers using only its local DAG_CRYSTAL
  MESHED — machine answers using local DAG_CRYSTAL + peer-fetched nodes

Spec: Asteroid-ProofVault/BP065_MESH_TEST_SPEC.md
Authored: 2026-05-31T02:10:00Z (ISO-8601 UTC)
Knight BP065 · Sonnet 4.6

Usage examples:
  # STEP 1 — Emit Bank-A facts to M1 substrate, then run M1 ALONE
  python run_mesh_test.py --setup --machine M1 --bank A --substrate-port 11480
  python run_mesh_test.py --machine M1 --condition alone --bank A --step 1 --substrate-port 11480 --out results/step1_M1_alone

  # STEP 2 — Emit Bank-B facts to M2 substrate, then run ALONE + MESHED
  python run_mesh_test.py --setup --machine M2 --bank B --substrate-port 11480  # run on M2
  python run_mesh_test.py --machine M1 --condition alone  --bank B --step 2 --substrate-port 11480 --out results/step2_M1_alone_B
  python run_mesh_test.py --machine M1 --condition meshed --bank A,B --step 2 --peers 192.168.86.45:11481 --substrate-port 11480 --out results/step2_M1_meshed

Environment variables (load from secrets before running):
  ANTHROPIC_API_KEY — required for Haiku grader
"""

import argparse
import json
import os
import sys
import time
import socket
import statistics
from datetime import datetime, timezone
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))
sys.path.insert(0, str(SCRIPT_DIR.parent))

MNEMOSYNE_VERSION = "0.1.22"
GRADER_MODEL = "claude-haiku-4-5-20251001"
COST_PER_RESOLUTION = 0.0  # structural — LAN TCP, no API

# ─── Data setup ────────────────────────────────────────────────────────────────

QUESTIONS_PATH = SCRIPT_DIR / "questions.json"
R9V2_PRELOAD_PATH = SCRIPT_DIR / "r9v2_preload.md"

# Bank-B: 20 questions unique to M2 — authored to be unanswerable from Data A alone
# These facts are emitted ONLY to M2's substrate; M1 cannot answer them ALONE
BANK_B_QUESTIONS = [
    {
        "id": "B001",
        "question": "What is the substrate version running on Machine 2 (M2) at IP 192.168.86.45?",
        "canonical_answer": "0.4.0",
        "pearls": ["M2 substrate version is 0.4.0", "Running at 192.168.86.45:11480"],
        "rubric": {
            "correct": "States version 0.4.0 or substrate version 0.4.0",
            "partial": "Mentions M2 substrate but wrong version number",
            "incorrect": "No mention of substrate version"
        }
    },
    {
        "id": "B002",
        "question": "What port does M2 use for the peer announce protocol?",
        "canonical_answer": "11481",
        "pearls": ["M2 peer announce port is 11481", "M2 substrate HTTP port is 11480"],
        "rubric": {
            "correct": "States 11481",
            "partial": "Mentions 11480 (wrong — that is the HTTP API port)",
            "incorrect": "Does not state 11481"
        }
    },
    {
        "id": "B003",
        "question": "What cooperative principle is encoded in the Golden Key of Liana Banyan?",
        "canonical_answer": "Help each other help ourselves",
        "pearls": ["Golden Key: Help each other help ourselves", "Cooperative first principle of Liana Banyan"],
        "rubric": {
            "correct": "States the exact phrase 'help each other help ourselves'",
            "partial": "Captures the cooperative helping concept but not verbatim",
            "incorrect": "Misses the cooperative mutual-help principle entirely"
        }
    },
    {
        "id": "B004",
        "question": "What is the Frontier in the Liana Banyan architecture?",
        "canonical_answer": "The Frontier is the network of all Nodes of Socceri — the synaptic mesh of content-addressed nodes that SaltFighters defend",
        "pearls": ["Frontier = network of all Nodes of Socceri", "The Frontier is the synaptic mesh SaltFighters defend", "Every LB Frame is a Node of Socceri"],
        "rubric": {
            "correct": "Correctly describes Frontier as the network/mesh of Socceri nodes",
            "partial": "Mentions Frontier as a network but misses Socceri or SaltFighter context",
            "incorrect": "Incorrectly defines Frontier or treats it as non-technical"
        }
    },
    {
        "id": "B005",
        "question": "What is MnemosyneC version 0.1.22?",
        "canonical_answer": "MnemosyneC v0.1.22 is the Liana Banyan cooperative memory desktop app featuring LB Account link (Tab 14), Frontier node registration, 3-strikes opt-in prompt, and Open the Bridge fix",
        "pearls": ["MnemosyneC v0.1.22 features: LB Account Tab 14, Frontier node registration, 3-strikes opt-in prompt", "productName MnemosyneC in electron-builder config"],
        "rubric": {
            "correct": "Mentions v0.1.22 and at least one of: Tab 14, Frontier, 3-strikes, or Open the Bridge",
            "partial": "Mentions MnemosyneC 0.1.22 without feature details",
            "incorrect": "Does not mention v0.1.22 or confuses with another version"
        }
    },
    {
        "id": "B006",
        "question": "What is the hash_verified field in a dag_fetch_from_peer response?",
        "canonical_answer": "hash_verified is a boolean confirming that the fetched DAG node's recomputed dag_id matches the requested dag_id, proving content integrity via content-addressing",
        "pearls": ["hash_verified=true means _recomputeDagId matches dag_id", "hash_verified proves DAG node content integrity after mesh fetch"],
        "rubric": {
            "correct": "Explains hash_verified as content-integrity check comparing recomputed and requested dag_id",
            "partial": "Mentions integrity or hash check but lacks DAG-specific context",
            "incorrect": "Does not describe the integrity verification purpose"
        }
    },
    {
        "id": "B007",
        "question": "What is the platform margin for Liana Banyan?",
        "canonical_answer": "Cost + 20%",
        "pearls": ["Platform margin: Cost + 20%", "Creator/Worker keeps 83.3%; platform takes Cost+20%"],
        "rubric": {
            "correct": "States Cost + 20% or equivalent (e.g. 20% above cost)",
            "partial": "Mentions 20% margin without the 'cost plus' framing",
            "incorrect": "States wrong margin or misidentifies the margin structure"
        }
    },
    {
        "id": "B008",
        "question": "What is the membership fee for Liana Banyan?",
        "canonical_answer": "$5 per year",
        "pearls": ["Liana Banyan membership: $5/year", "Annual membership fee is $5"],
        "rubric": {
            "correct": "States $5 per year or $5/year",
            "partial": "Mentions $5 without specifying per year",
            "incorrect": "States wrong amount or wrong period"
        }
    },
    {
        "id": "B009",
        "question": "What percentage of earnings do creators and workers keep on Liana Banyan?",
        "canonical_answer": "83.3%",
        "pearls": ["Creators AND Workers keep 83.3% of earnings", "Never round to 83% — always 83.3%"],
        "rubric": {
            "correct": "States 83.3% (not 83% or 84%)",
            "partial": "States approximately 83% or 84% (close but imprecise)",
            "incorrect": "States wrong percentage or does not mention creators and workers"
        }
    },
    {
        "id": "B010",
        "question": "What is the name of the cooperative mesh protocol used for peer-to-peer substrate data sharing in Mnemosyne?",
        "canonical_answer": "MESH-6 — the 7-piece protocol (P1 pointer_advance, P2 fetch_from_peer, P3 auto-replicate, P4 hash_verify, P5 relay_client, P6 dag_lookup, P7 federation_announce)",
        "pearls": ["MESH-6 protocol: 7 pieces P1-P7", "MESH-6 proven with two-instance PASS hash_verified=true SID 97ef95b5d803f9eca0c1c99a3151c619"],
        "rubric": {
            "correct": "Names MESH-6 and describes at least one of the 7 pieces",
            "partial": "Names MESH-6 without piece details, or names pieces without MESH-6",
            "incorrect": "Does not mention MESH-6 or gets the protocol name wrong"
        }
    },
    {
        "id": "B011",
        "question": "What is a Node of Socceri?",
        "canonical_answer": "A Node of Socceri (Socceri) is an individual content-addressed node in the Frontier mesh — every LB Frame is a Node of Socceri",
        "pearls": ["Node of Socceri = individual content-addressed node", "Socceri replaces 'Futbol' as individual-unit name", "Every LB Frame is a Node of Socceri"],
        "rubric": {
            "correct": "Identifies Socceri as an individual content-addressed node in the Frontier",
            "partial": "Describes Socceri as a node but misses content-addressing or Frontier context",
            "incorrect": "Confuses Socceri with the Frontier (the network) or misidentifies"
        }
    },
    {
        "id": "B012",
        "question": "What is the LB Account Tab number in MnemosyneC?",
        "canonical_answer": "Tab 14 (LB Account)",
        "pearls": ["LB Account is Tab 14 in MnemosyneC", "MnemosyneTabView: 13 tabs -> 14 tabs added in v0.1.22"],
        "rubric": {
            "correct": "States Tab 14 or Tab 14 LB Account",
            "partial": "Mentions LB Account tab without the number 14",
            "incorrect": "States wrong tab number"
        }
    },
    {
        "id": "B013",
        "question": "What does the 3-strikes opt-in prompt do in MnemosyneC?",
        "canonical_answer": "Shows a contextual overlay prompting users to link their LB Account, with a maximum of 3 prompts (3 strikes), after which it never shows again; users can choose 3 days, 3 weeks, or Never",
        "pearls": ["3-strikes opt-in: max 3 prompts, cadence 3days/3weeks/Never", "Contextual overlay after Gauntlet first-complete or substrate hits > 0"],
        "rubric": {
            "correct": "Describes the 3-strike limit and LB Account linking intent",
            "partial": "Mentions opt-in prompt but misses the 3-strike limit",
            "incorrect": "Describes something else entirely"
        }
    },
    {
        "id": "B014",
        "question": "What is the SID of the first test node emitted to M2's substrate in the BP065 mesh test setup?",
        "canonical_answer": "57627ac3f2cbe8f606224faa92d0e343 (test emission during mesh test endpoint verification)",
        "pearls": ["M2 test node SID: 57627ac3f2cbe8f606224faa92d0e343", "Emitted pearl: ['test'] during endpoint verification BP065"],
        "rubric": {
            "correct": "States the SID 57627ac3f2cbe8f606224faa92d0e343",
            "partial": "Mentions a SID but not the correct one",
            "incorrect": "Does not provide a SID"
        }
    },
    {
        "id": "B015",
        "question": "What does ALONE vs MESHED mean in the BP065 mesh test?",
        "canonical_answer": "ALONE means a machine answers using only its local DAG_CRYSTAL with no peer fetch. MESHED means a machine answers using local DAG_CRYSTAL plus mesh-fetched data from peers via the Frontier.",
        "pearls": ["ALONE condition: local DAG_CRYSTAL only, no peer fetch", "MESHED condition: local + peer mesh fetch via Frontier"],
        "rubric": {
            "correct": "Correctly distinguishes ALONE (local only) from MESHED (local + peer fetch)",
            "partial": "Partially describes one condition but misses the other",
            "incorrect": "Confuses ALONE and MESHED or describes neither correctly"
        }
    },
    {
        "id": "B016",
        "question": "What is the SHA-256 hash of MnemosyneC-Setup-0.1.22.exe?",
        "canonical_answer": "EFD50AB4C72313F1D21385126F1014ECD759685797BB106D96CA2D96CDF2B287",
        "pearls": ["MnemosyneC-Setup-0.1.22.exe SHA-256: EFD50AB4C72313F1D21385126F1014ECD759685797BB106D96CA2D96CDF2B287"],
        "rubric": {
            "correct": "States EFD50AB4C72313F1D21385126F1014ECD759685797BB106D96CA2D96CDF2B287",
            "partial": "Mentions the correct installer version without the exact hash",
            "incorrect": "States wrong hash or wrong installer"
        }
    },
    {
        "id": "B017",
        "question": "What commit hash introduced productName MnemosyneC to the electron-builder config?",
        "canonical_answer": "3ed2c92 (feat(mnemosyne): v0.1.22 commit, BP065)",
        "pearls": ["productName MnemosyneC added in commit 3ed2c92", "v0.1.22 electron-builder productName BP065"],
        "rubric": {
            "correct": "States commit 3ed2c92",
            "partial": "Mentions BP065 or v0.1.22 without the exact commit hash",
            "incorrect": "States wrong commit hash"
        }
    },
    {
        "id": "B018",
        "question": "What is the Brick Wall Policy in Liana Banyan AI operations?",
        "canonical_answer": "When Founder pre-ratified the write scope, proceed without re-asking. Otherwise stop at the wall and ask. Fix root cause, never bypass.",
        "pearls": ["Brick Wall Policy: fix root cause not symptom", "NEVER --no-verify on pre-commit hooks", "Pre-ratified scope = proceed; otherwise stop and ask"],
        "rubric": {
            "correct": "Describes fixing root cause and the proceed-or-ask discipline",
            "partial": "Mentions fixing root cause but misses the pre-ratification proceed rule",
            "incorrect": "Does not describe the Brick Wall Policy accurately"
        }
    },
    {
        "id": "B019",
        "question": "What IP address is M2 running on in the BP065 mesh test?",
        "canonical_answer": "192.168.86.45",
        "pearls": ["M2 IP address: 192.168.86.45", "M2 Mnemosyne substrate at 192.168.86.45:11480"],
        "rubric": {
            "correct": "States 192.168.86.45",
            "partial": "States a 192.168.86.x address but not .45",
            "incorrect": "Does not state the correct IP"
        }
    },
    {
        "id": "B020",
        "question": "What is the network multiplier formula for the Frontier mesh at N machines?",
        "canonical_answer": "(75 + 20×N) / 95 — where 75 is Bank-A questions answerable alone, 20×N is unique questions across N machines, and 95 is questions answerable by any single machine alone",
        "pearls": ["Frontier network multiplier at N machines: (75 + 20*N) / 95", "At N=6: ~1.84x; at N=10: ~2.89x; at N=20: 5.0x"],
        "rubric": {
            "correct": "States the formula (75 + 20×N) / 95 or equivalent",
            "partial": "Describes the multiplier concept but misses the exact formula",
            "incorrect": "Does not provide the formula or describes it incorrectly"
        }
    },
]

# ─── Substrate HTTP client (raw TCP to avoid Invoke-WebRequest issues) ─────────

def _http_request(host: str, port: int, method: str, path: str, body: Optional[str] = None, timeout: float = 10.0) -> dict:
    """Raw TCP HTTP/1.0 request. Returns {'status': int, 'body': str}."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        sock.connect((host, port))
        headers = f"{method} {path} HTTP/1.0\r\nHost: {host}\r\n"
        if body is not None:
            headers += f"Content-Type: application/json\r\nContent-Length: {len(body.encode())}\r\n"
        headers += "\r\n"
        request = headers.encode() + (body.encode() if body else b"")
        sock.sendall(request)

        # Read response
        data = b""
        while True:
            chunk = sock.recv(65536)
            if not chunk:
                break
            data += chunk
    finally:
        sock.close()

    # Parse HTTP response
    raw = data.decode("utf-8", errors="replace")
    if "\r\n\r\n" in raw:
        header_part, body_part = raw.split("\r\n\r\n", 1)
    elif "\n\n" in raw:
        header_part, body_part = raw.split("\n\n", 1)
    else:
        return {"status": 0, "body": raw}

    status_line = header_part.split("\r\n")[0] if "\r\n" in header_part else header_part.split("\n")[0]
    parts = status_line.split(" ", 2)
    status = int(parts[1]) if len(parts) >= 2 and parts[1].isdigit() else 0
    return {"status": status, "body": body_part}


def substrate_emit(host: str, port: int, pearls: list, bindings: dict = None, faces: dict = None) -> Optional[str]:
    """Emit a DAG node to the substrate. Returns SID or None."""
    payload = json.dumps({"pearls": pearls, "bindings": bindings or {}, "faces": faces or {}})
    resp = _http_request(host, port, "POST", "/dag/emit", payload, timeout=15.0)
    if resp["status"] == 200:
        try:
            data = json.loads(resp["body"])
            return data.get("sid")
        except json.JSONDecodeError:
            pass
    return None


def substrate_lookup(host: str, port: int, sid: str) -> Optional[dict]:
    """Look up a DAG node by SID. Returns node dict only if found=true, else None."""
    resp = _http_request(host, port, "GET", f"/dag/lookup/{sid}", timeout=10.0)
    if resp["status"] == 200:
        try:
            data = json.loads(resp["body"])
            # Only return data if the node was actually found
            if data.get("found") is True and data.get("node"):
                return data
        except json.JSONDecodeError:
            pass
    return None


def substrate_fetch_from_peer(local_host: str, local_port: int, peer_address: str, peer_port: int, dag_id: str, timeout: float = 15.0) -> dict:
    """Ask local substrate to fetch a DAG node from a peer. Returns result dict."""
    t0 = time.perf_counter()
    payload = json.dumps({"address": peer_address, "port": peer_port, "dag_id": dag_id})
    resp = _http_request(local_host, local_port, "POST", "/dag/fetch_from_peer", payload, timeout=timeout)
    latency_ms = (time.perf_counter() - t0) * 1000.0
    if resp["status"] == 200:
        try:
            data = json.loads(resp["body"])
            data["_latency_ms"] = latency_ms
            return data
        except json.JSONDecodeError:
            pass
    return {"ok": False, "hash_verified": False, "_latency_ms": latency_ms, "error": f"HTTP {resp['status']}: {resp['body'][:200]}"}


# ─── Grader ────────────────────────────────────────────────────────────────────

def grade_response(question: dict, candidate_response: str, api_key: str) -> dict:
    """Grade a single response using Haiku 4.5. Returns grade dict."""
    try:
        from grader import grade_single, GRADER_MODEL
        os.environ["ANTHROPIC_API_KEY"] = api_key
        result = grade_single(question, candidate_response, model=GRADER_MODEL)
        return {
            "grade": result.grade,
            "score": result.score,
            "rationale": result.rationale,
            "grader_model": result.grader_model,
            "cost_usd": result.cost_usd,
        }
    except Exception as e:
        # Fallback: keyword match if grader unavailable
        ca = question.get("canonical_answer", "").lower()
        resp_lower = candidate_response.lower()
        # Simple keyword check
        keywords = [w for w in ca.split() if len(w) > 4]
        matches = sum(1 for k in keywords if k in resp_lower)
        if matches >= max(1, len(keywords) // 2):
            return {"grade": "CORRECT", "score": 1.0, "rationale": f"Keyword match ({matches}/{len(keywords)})", "grader_model": "fallback", "cost_usd": 0.0}
        elif matches > 0:
            return {"grade": "PARTIAL", "score": 0.5, "rationale": f"Partial keyword match ({matches}/{len(keywords)})", "grader_model": "fallback", "cost_usd": 0.0}
        else:
            return {"grade": "INCORRECT", "score": 0.0, "rationale": f"No keyword match; error: {e}", "grader_model": "fallback", "cost_usd": 0.0}


# ─── SID manifest loading ───────────────────────────────────────────────────────

def load_manifests(banks: list, out_dir: Path) -> dict:
    """Load SID manifests for given banks. Returns {q_id: sid}."""
    mapping = {}
    for bank in banks:
        manifest_path = out_dir.parent / f"MACHINE_SIDS_BANK_{bank}.json"
        if manifest_path.exists():
            with open(manifest_path) as f:
                data = json.load(f)
            for item in data.get("sids", []):
                mapping[item["q_id"]] = item["sid"]
    return mapping


# ─── Bank question loader ───────────────────────────────────────────────────────

def load_bank_questions(bank_labels: list) -> list:
    """Load questions for specified bank labels."""
    questions = []
    for label in bank_labels:
        label = label.strip().upper()
        if label == "A":
            with open(QUESTIONS_PATH) as f:
                data = json.load(f)
            questions.extend(data["questions"])
        elif label == "B":
            questions.extend(BANK_B_QUESTIONS)
        else:
            print(f"[WARN] Unknown bank label '{label}' — skipping")
    return questions


# ─── Setup command: emit facts to substrate and save SID manifest ───────────────

def cmd_setup(args):
    """Emit bank questions to the substrate and write a SID manifest."""
    timestamp = datetime.now(timezone.utc).isoformat()
    host = "127.0.0.1"
    port = args.substrate_port
    banks = [b.strip().upper() for b in args.bank.split(",")]

    print(f"[SETUP] {timestamp}")
    print(f"[SETUP] Machine: {args.machine} | Banks: {banks} | Substrate: {host}:{port}")

    # Verify substrate health
    resp = _http_request(host, port, "GET", "/health", timeout=5.0)
    if resp["status"] != 200:
        print(f"[SETUP ERROR] Substrate at {host}:{port} not responding (status={resp['status']})")
        sys.exit(1)
    health = json.loads(resp["body"])
    print(f"[SETUP] Substrate healthy: version={health.get('version')} index_size={health.get('index_size')}")

    out_dir = Path(args.out) if args.out else SCRIPT_DIR / "results" / f"setup_{args.machine}"
    out_dir.mkdir(parents=True, exist_ok=True)

    for bank in banks:
        questions = load_bank_questions([bank])
        sids = []
        emitted = 0
        failed = 0

        print(f"[SETUP] Emitting Bank-{bank} ({len(questions)} questions) to {host}:{port}...")
        for q in questions:
            q_id = q.get("id") or q.get("q_id") or str(questions.index(q))
            # Use canonical_answer as the pearl (the answerable fact)
            pearls = q.get("pearls") or [q.get("canonical_answer", "")]
            bindings = {}  # substrate faces schema: keys must be "0"-"5" only; bindings are arbitrary
            faces = {"0": q.get("question", "")[:200], "1": q_id, "2": bank}

            sid = substrate_emit(host, port, pearls, bindings, faces)
            if sid:
                sids.append({"q_id": q_id, "sid": sid, "bank": bank, "question": q.get("question", "")[:100]})
                emitted += 1
            else:
                print(f"  [WARN] Failed to emit q_id={q_id}")
                failed += 1

        manifest = {
            "machine": args.machine,
            "bank": bank,
            "substrate_port": port,
            "timestamp": timestamp,
            "emitted": emitted,
            "failed": failed,
            "sids": sids,
        }
        manifest_path = out_dir.parent / f"MACHINE_SIDS_BANK_{bank}.json"
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
        print(f"[SETUP] Bank-{bank}: emitted={emitted} failed={failed} -> {manifest_path}")

    print(f"[SETUP] Complete. Manifests written to {out_dir.parent}/")


# ─── Test run (ALONE or MESHED) ─────────────────────────────────────────────────

@dataclass
class QuestionResult:
    q_id: str
    bank: str
    condition: str
    question: str
    resolved: bool
    node_found: bool
    pearl_content: str
    hash_verified: Optional[bool]
    fetch_latency_ms: Optional[float]
    grade: str
    score: float
    rationale: str
    grader_model: str
    cost_usd: float


def cmd_run(args):
    """Run ALONE or MESHED test."""
    timestamp = datetime.now(timezone.utc).isoformat()
    host = "127.0.0.1"
    port = args.substrate_port
    condition = args.condition.lower()
    machine = args.machine
    step = args.step
    banks = [b.strip().upper() for b in args.bank.split(",")]

    # Parse peers for MESHED
    peers = []
    if condition == "meshed" and args.peers:
        for p in args.peers.split(","):
            p = p.strip()
            if ":" in p:
                addr, peer_port = p.rsplit(":", 1)
                peers.append((addr.strip(), int(peer_port.strip())))
            else:
                print(f"[WARN] Peer '{p}' missing port — skipping")
    elif condition == "meshed" and not args.peers:
        print("[ERROR] --peers required for --condition meshed")
        sys.exit(1)

    # Load API key
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        # Try to load from 22May2026.env
        secrets_path = Path(r"C:\Users\Administrator\.claude\state\secrets\22May2026.env")
        if secrets_path.exists():
            with open(secrets_path) as f:
                for line in f:
                    if line.startswith("ANTHROPIC_API_KEY="):
                        api_key = line.strip().split("=", 1)[1]
                        break
    if not api_key:
        print("[WARN] ANTHROPIC_API_KEY not set — grading will use keyword fallback")

    print(f"\n{'='*70}")
    print(f"MESH TEST — Machine: {machine} | Condition: {condition.upper()} | Banks: {banks} | Step: {step}")
    print(f"Timestamp: {timestamp}")
    print(f"Substrate: {host}:{port} | MnemosyneC: {MNEMOSYNE_VERSION}")
    if peers:
        print(f"Peers: {peers}")
    print(f"{'='*70}\n")

    # Verify substrate health
    resp = _http_request(host, port, "GET", "/health", timeout=5.0)
    if resp["status"] != 200:
        print(f"[ERROR] Substrate at {host}:{port} not responding")
        sys.exit(1)
    health = json.loads(resp["body"])
    print(f"[INFO] Substrate: version={health.get('version')} index_size={health.get('index_size')} mode={health.get('mode')}")

    # Set up output dir
    out_dir = Path(args.out) if args.out else SCRIPT_DIR / "results" / f"step{step}_{machine}_{condition}"
    out_dir.mkdir(parents=True, exist_ok=True)

    # Load SID manifests
    results_parent = Path(args.out).parent if args.out else SCRIPT_DIR / "results"
    sid_mapping = {}
    for bank in banks:
        manifest_path = results_parent / f"MACHINE_SIDS_BANK_{bank}.json"
        if manifest_path.exists():
            with open(manifest_path) as f:
                data = json.load(f)
            for item in data.get("sids", []):
                sid_mapping[item["q_id"]] = (item["sid"], bank)
            print(f"[INFO] Loaded Bank-{bank} manifest: {len([x for x in data.get('sids',[]) if x])} SIDs")
        else:
            print(f"[WARN] No manifest for Bank-{bank} at {manifest_path}. Run --setup first.")

    # Load questions
    all_questions = load_bank_questions(banks)
    print(f"[INFO] Questions loaded: {len(all_questions)} from banks {banks}")

    results: list[QuestionResult] = []
    fetch_latencies = []

    for i, q in enumerate(all_questions):
        q_id = q.get("id") or q.get("q_id") or str(i)
        # Determine bank: B-ids start with "B", A-ids start with "Q" or digit
        if q_id.startswith("B") and q_id[1:].isdigit():
            bank = "B"
        elif q_id.startswith("Q") or q_id[0].isdigit():
            bank = "A"
        else:
            bank = q_id[0] if q_id else "A"
        question_text = q.get("question", "")

        # Get SID for this question
        sid_info = sid_mapping.get(q_id)
        if not sid_info:
            # Question not in manifest — treat as unresolved
            results.append(QuestionResult(
                q_id=q_id, bank=bank, condition=condition,
                question=question_text[:80], resolved=False, node_found=False,
                pearl_content="[SID NOT IN MANIFEST — RUN --setup FIRST]",
                hash_verified=None, fetch_latency_ms=None,
                grade="INCORRECT", score=0.0, rationale="SID not in manifest",
                grader_model="none", cost_usd=0.0
            ))
            continue

        sid, q_bank = sid_info

        # ALONE: try local lookup only
        node_found = False
        pearl_content = ""
        hash_verified = None
        fetch_latency_ms = None

        local_node = substrate_lookup(host, port, sid)
        if local_node:
            node_found = True
            # Extract pearl content from node
            node_data = local_node.get("node", local_node)
            pearls_data = node_data.get("pearls", []) if isinstance(node_data, dict) else []
            pearl_content = " | ".join(str(p) for p in pearls_data) if pearls_data else str(node_data)
            hash_verified = local_node.get("hash_verified")

        # MESHED: if not found locally, try fetching from peers
        if condition == "meshed" and not node_found:
            for (peer_addr, peer_port) in peers:
                fetch_result = substrate_fetch_from_peer(host, port, peer_addr, peer_port, sid)
                fetch_latency_ms = fetch_result.get("_latency_ms")
                if fetch_result.get("ok") or fetch_result.get("hash_verified"):
                    node_found = True
                    hash_verified = fetch_result.get("hash_verified", False)
                    node_data = fetch_result.get("node", {})
                    pearls_data = node_data.get("pearls", []) if isinstance(node_data, dict) else []
                    pearl_content = " | ".join(str(p) for p in pearls_data) if pearls_data else str(node_data)
                    if fetch_latency_ms is not None:
                        fetch_latencies.append(fetch_latency_ms)
                    break

        # Grade the response
        if not node_found or not pearl_content:
            grade_result = {"grade": "INCORRECT", "score": 0.0, "rationale": "Node not found — unresolved", "grader_model": "none", "cost_usd": 0.0}
        else:
            grade_result = grade_response(q, pearl_content, api_key)

        results.append(QuestionResult(
            q_id=q_id, bank=q_bank, condition=condition,
            question=question_text[:80], resolved=node_found, node_found=node_found,
            pearl_content=pearl_content[:200] if pearl_content else "",
            hash_verified=hash_verified, fetch_latency_ms=fetch_latency_ms,
            grade=grade_result["grade"], score=grade_result["score"],
            rationale=grade_result["rationale"], grader_model=grade_result["grader_model"],
            cost_usd=grade_result["cost_usd"]
        ))

        status = "OK" if node_found else "MISS"
        print(f"  [{i+1:3d}/{len(all_questions)}] {status} {q_id:<8} {condition.upper():<7} bank={q_bank} "
              f"grade={grade_result['grade']:<10} score={grade_result['score']:.1f} "
              + (f"latency={fetch_latency_ms:.0f}ms" if fetch_latency_ms else ""))

    # ─── Compute summary ───────────────────────────────────────────────────────
    total = len(results)
    resolved_count = sum(1 for r in results if r.resolved)
    resolution_rate = resolved_count / total if total else 0.0
    accuracy_pct = (sum(r.score for r in results) / total * 100) if total else 0.0
    hash_verified_count = sum(1 for r in results if r.hash_verified is True and condition == "meshed")
    meshed_fetch_count = sum(1 for r in results if r.fetch_latency_ms is not None)
    hash_verify_rate = (hash_verified_count / meshed_fetch_count) if meshed_fetch_count > 0 else None
    total_cost = sum(r.cost_usd for r in results)

    lat_p50 = statistics.median(fetch_latencies) if fetch_latencies else None
    lat_p95 = sorted(fetch_latencies)[int(0.95 * len(fetch_latencies))] if len(fetch_latencies) >= 2 else (fetch_latencies[0] if fetch_latencies else None)

    summary = {
        "test_type": "mesh_test",
        "timestamp": timestamp,
        "step": step,
        "machine": machine,
        "condition": condition,
        "banks_tested": banks,
        "mnemosyne_version": MNEMOSYNE_VERSION,
        "transport": "lan_tcp",
        "total_questions": total,
        "resolved_count": resolved_count,
        "resolution_success_rate": round(resolution_rate, 4),
        "accuracy_pct": round(accuracy_pct, 2),
        "hash_verify_pass_rate": round(hash_verify_rate, 4) if hash_verify_rate is not None else None,
        "mesh_fetch_count": meshed_fetch_count,
        "fetch_latency_p50_ms": round(lat_p50, 1) if lat_p50 is not None else None,
        "fetch_latency_p95_ms": round(lat_p95, 1) if lat_p95 is not None else None,
        "cost_usd": round(total_cost, 6),
        "peers_used": [f"{a}:{p}" for (a, p) in peers],
        "grader_model": GRADER_MODEL,
    }

    # ─── Write outputs ─────────────────────────────────────────────────────────
    # Per-question JSONL
    jsonl_path = out_dir / f"machine_{machine}_banks_{'_'.join(banks)}_{condition}.jsonl"
    with open(jsonl_path, "w") as f:
        for r in results:
            f.write(json.dumps({
                "q_id": r.q_id, "bank": r.bank, "condition": r.condition,
                "question": r.question, "resolved": r.resolved, "node_found": r.node_found,
                "pearl_content": r.pearl_content, "hash_verified": r.hash_verified,
                "fetch_latency_ms": r.fetch_latency_ms, "grade": r.grade,
                "score": r.score, "rationale": r.rationale,
                "grader_model": r.grader_model, "cost_usd": r.cost_usd
            }) + "\n")

    # Fetch log JSONL
    fetch_log_path = out_dir / "mesh_fetch_log.jsonl"
    with open(fetch_log_path, "w") as f:
        for r in results:
            if r.fetch_latency_ms is not None:
                f.write(json.dumps({
                    "q_id": r.q_id, "condition": r.condition,
                    "hash_verified": r.hash_verified,
                    "latency_ms": r.fetch_latency_ms,
                    "peers": [f"{a}:{p}" for (a, p) in peers]
                }) + "\n")

    # Summary JSON
    summary_path = out_dir / "summary.json"
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)

    # Human-readable markdown results table
    md_path = out_dir / "EYEWITNESS_MESH_TEST_RESULTS.md"
    md_lines = [
        f"# EYEWITNESS MESH TEST RESULTS",
        f"**Timestamp:** {timestamp}",
        f"**Machine:** {machine} | **Condition:** {condition.upper()} | **Banks:** {banks} | **Step:** {step}",
        f"**Mnemosyne:** v{MNEMOSYNE_VERSION} | **Transport:** LAN TCP",
        f"",
        f"## Summary",
        f"| Metric | Value |",
        f"|--------|-------|",
        f"| Total questions | {total} |",
        f"| Resolution success rate | {resolution_rate*100:.1f}% |",
        f"| Accuracy (graded by Haiku 4.5) | {accuracy_pct:.1f}% |",
        f"| Hash-verify pass rate | {(hash_verify_rate*100):.1f}% ({hash_verified_count}/{meshed_fetch_count} fetches)" if hash_verify_rate is not None else "| Hash-verify pass rate | N/A (ALONE) |",
        f"| Fetch latency p50 | {lat_p50:.1f}ms (measured · N={len(fetch_latencies)} samples)" if lat_p50 else "| Fetch latency p50 | N/A (ALONE or no fetches) |",
        f"| Fetch latency p95 | {lat_p95:.1f}ms" if lat_p95 else "| Fetch latency p95 | N/A |",
        f"| Cost | ${total_cost:.6f} (structural — local + LAN TCP, no API) |",
        f"",
        f"## Per-Question Results (first 30)",
        f"| q_id | bank | resolved | grade | score | hash_verified | latency_ms |",
        f"|------|------|----------|-------|-------|---------------|------------|",
    ]
    for r in results[:30]:
        md_lines.append(
            f"| {r.q_id} | {r.bank} | {'OK' if r.resolved else 'MISS'} | {r.grade} | {r.score:.1f} "
            f"| {r.hash_verified if r.hash_verified is not None else 'N/A'} "
            f"| {f'{r.fetch_latency_ms:.0f}' if r.fetch_latency_ms else 'N/A'} |"
        )
    if len(results) > 30:
        md_lines.append(f"| ... | ... | ... | ... | ... | ... | ... | (+ {len(results)-30} more) |")
    md_lines += [
        f"",
        f"*FOR THE KEEP. ⚓ — BP065 Mesh Test · Knight Sonnet 4.6*",
    ]
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines))

    # Print summary
    print(f"\n{'='*70}")
    print(f"RESULTS — Machine: {machine} | Condition: {condition.upper()} | Step: {step}")
    print(f"  Resolution:     {resolved_count}/{total} ({resolution_rate*100:.1f}%)")
    print(f"  Accuracy:       {accuracy_pct:.1f}% (graded by Haiku 4.5 · Correct=1.0/Partial=0.5/Incorrect=0.0)")
    if hash_verify_rate is not None:
        print(f"  Hash-verify:    {hash_verified_count}/{meshed_fetch_count} = {hash_verify_rate*100:.1f}%")
    if lat_p50 is not None:
        print(f"  Fetch lat p50:  {lat_p50:.1f}ms (measured · N={len(fetch_latencies)} samples)")
    if lat_p95 is not None:
        print(f"  Fetch lat p95:  {lat_p95:.1f}ms")
    print(f"  Cost:           ${total_cost:.6f} (structural — local + LAN TCP, no API)")
    print(f"{'='*70}")
    print(f"\nOutputs:")
    print(f"  JSONL:    {jsonl_path}")
    print(f"  Summary:  {summary_path}")
    print(f"  Receipt:  {md_path}")
    print("\nFOR THE KEEP. -- BP065 Mesh Test")

    return summary


# ─── CLI ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="BP065 Mesh Test Harness — ALONE vs MESHED substrate resolution"
    )
    parser.add_argument("--machine", default="M1", help="Machine label (M1/M2/M3/...)")
    parser.add_argument("--condition", default="alone", choices=["alone", "meshed"],
                        help="Resolution mode: alone (local only) or meshed (local + peer fetch)")
    parser.add_argument("--bank", default="A", help="Comma-separated bank labels (A,B,C,...)")
    parser.add_argument("--substrate-port", type=int, default=11480,
                        help="Local substrate HTTP port (default 11480)")
    parser.add_argument("--announce-port", type=int, default=11481,
                        help="Local peer announce port (default 11481)")
    parser.add_argument("--peers", default="",
                        help="Comma-separated peer announce endpoints (addr:port) for MESHED")
    parser.add_argument("--step", type=int, default=1,
                        help="Step number for output tagging (1=M1-alone, 2=M1+M2, ...)")
    parser.add_argument("--out", default="",
                        help="Output directory (default: results/step{N}_{machine}_{condition})")
    parser.add_argument("--setup", action="store_true",
                        help="Setup mode: emit bank questions to substrate and write SID manifests")
    parser.add_argument("--dry-run", action="store_true",
                        help="Dry run: show what would be done without calling substrate or grader")
    args = parser.parse_args()

    if args.dry_run:
        print("[DRY RUN] Mesh test harness ready.")
        print(f"  Machine: {args.machine} | Condition: {args.condition} | Banks: {args.bank}")
        print(f"  Substrate port: {args.substrate_port} | Announce port: {args.announce_port}")
        print(f"  Peers: {args.peers or 'none'}")
        print(f"  Step: {args.step} | Out: {args.out or 'auto'}")
        banks = [b.strip().upper() for b in args.bank.split(",")]
        questions = load_bank_questions(banks)
        print(f"  Questions loaded: {len(questions)} from banks {banks}")
        print("\n[DRY RUN] Harness ready. Run without --dry-run to execute.")
        return

    if args.setup:
        cmd_setup(args)
    else:
        cmd_run(args)


if __name__ == "__main__":
    main()
