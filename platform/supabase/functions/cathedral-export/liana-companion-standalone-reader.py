#!/usr/bin/env python3
"""
liana-companion-standalone-reader.py
=====================================
Offline reader for a Liana Banyan Cathedral export bundle (#2268 Claim 1(d)).

A member can run this script against any ZIP produced by the LB Cathedral
export (or by a future Liana Companion CLI ship). NO LB platform
dependency — it operates purely on the bundle.

Usage:
    python liana-companion-standalone-reader.py consult "my query" [--top 5]
    python liana-companion-standalone-reader.py list-scribes
    python liana-companion-standalone-reader.py stats

The script auto-locates the bundle:
  1. --bundle PATH/TO/cathedral-export.zip   (explicit)
  2. ./cathedral-export.zip                  (current directory)
  3. The directory the script lives in       (sibling files, unzipped form)

By design, this script:
  * Has zero non-stdlib dependencies (Python 3.8+).
  * Implements the same primary*1.0 + adjacent*0.5 scoring as
    librarian-mcp/src/scribes/registry.ts (#2270 Claim 1(c)).
  * Reads append-only JSONL tablets — never writes.
  * Exits cleanly with a non-zero status on any error so it composes with
    shell pipelines.

Bundle layout:
  registry.yaml                  — Scribe registry (one entry per Scribe)
  scribe_<NAME>.jsonl            — append-only entries per Scribe
                                   first line is a {"type":"header",...}
  fates_log.jsonl                — Three Fates routing audit
  tidbits.jsonl                  — SP-21 verify-action ledger
  README.md                      — schema documentation
  LICENSE                        — AGPL-3.0 + Pledged Commons grant (#2260)

Every method here is intentionally simple — this script is part of the
anti-lock-in commitment. A former member must be able to read it, audit
it, and run it on any computer for as long as Python 3 exists. Optimize
for clarity over cleverness.
"""
from __future__ import annotations

import argparse
import io
import json
import os
import sys
import zipfile
from pathlib import Path
from typing import Any, Iterable


# ─── Bundle loader ────────────────────────────────────────────────────────


class CathedralBundle:
    """Loads Scribes + entries from either a ZIP file or an unzipped directory."""

    def __init__(self, source: Path):
        self.source = source
        self.scribes: list[dict[str, Any]] = []
        self.entries_by_scribe: dict[str, list[dict[str, Any]]] = {}
        self.fates_log: list[dict[str, Any]] = []
        self.tidbits: list[dict[str, Any]] = []
        self._load()

    def _load(self) -> None:
        if self.source.is_file() and self.source.suffix.lower() == ".zip":
            self._load_zip()
        elif self.source.is_dir():
            self._load_dir()
        else:
            raise FileNotFoundError(
                f"Bundle source not found: {self.source} "
                "(expected a .zip file or a directory with registry.yaml)."
            )

    def _load_zip(self) -> None:
        with zipfile.ZipFile(self.source, "r") as zf:
            names = zf.namelist()
            if "registry.yaml" in names:
                self._parse_registry_yaml(zf.read("registry.yaml").decode("utf-8"))
            for n in names:
                if n.startswith("scribe_") and n.endswith(".jsonl"):
                    scribe_name = n[len("scribe_") : -len(".jsonl")]
                    self._parse_tablet(scribe_name, zf.read(n).decode("utf-8"))
                elif n == "fates_log.jsonl":
                    self.fates_log = list(_jsonl_iter(zf.read(n).decode("utf-8")))
                elif n == "tidbits.jsonl":
                    self.tidbits = list(_jsonl_iter(zf.read(n).decode("utf-8")))

    def _load_dir(self) -> None:
        registry_path = self.source / "registry.yaml"
        if registry_path.exists():
            self._parse_registry_yaml(registry_path.read_text(encoding="utf-8"))
        for p in self.source.glob("scribe_*.jsonl"):
            scribe_name = p.stem[len("scribe_") :]
            self._parse_tablet(scribe_name, p.read_text(encoding="utf-8"))
        fl = self.source / "fates_log.jsonl"
        if fl.exists():
            self.fates_log = list(_jsonl_iter(fl.read_text(encoding="utf-8")))
        tb = self.source / "tidbits.jsonl"
        if tb.exists():
            self.tidbits = list(_jsonl_iter(tb.read_text(encoding="utf-8")))

    def _parse_registry_yaml(self, raw: str) -> None:
        # Minimal YAML parser — registry.yaml is a flat list of Scribes with
        # known shape. We avoid pulling PyYAML so the reader stays stdlib-only.
        # Falls back to a JSON sibling if present.
        sibling_json = self.source if self.source.is_dir() else self.source.parent
        json_path = sibling_json / "registry.json"
        if isinstance(self.source, Path) and self.source.is_dir() and json_path.exists():
            self.scribes = json.loads(json_path.read_text(encoding="utf-8")).get(
                "scribes", []
            )
            return
        self.scribes = _parse_registry_yaml_minimal(raw)

    def _parse_tablet(self, scribe_name: str, raw: str) -> None:
        rows = list(_jsonl_iter(raw))
        # First row may be a header (type=header). Filter to entries.
        entries = [r for r in rows if r.get("type") != "header"]
        self.entries_by_scribe[scribe_name] = entries

    def list_scribes(self) -> list[dict[str, Any]]:
        return self.scribes

    def total_entries(self) -> int:
        return sum(len(v) for v in self.entries_by_scribe.values())


def _jsonl_iter(raw: str) -> Iterable[dict[str, Any]]:
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            continue


def _parse_registry_yaml_minimal(raw: str) -> list[dict[str, Any]]:
    """Minimal parser for the registry.yaml shape the export writes.

    Handles:
      scribes:
        - id: ...
          name: ...
          primary_field: ...
          keywords:
            - "..."
          adjacents:
            - level: N
              field: "..."

    Returns list of Scribe dicts.
    """
    scribes: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    current_list_key: str | None = None
    current_adj: dict[str, Any] | None = None
    in_scribes = False

    for raw_line in raw.splitlines():
        line = raw_line.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.strip() == "scribes:":
            in_scribes = True
            continue
        if not in_scribes:
            continue
        stripped = line.lstrip()
        indent = len(line) - len(stripped)
        if indent == 2 and stripped.startswith("- "):
            if current:
                scribes.append(current)
            current = {}
            current_list_key = None
            current_adj = None
            kv = stripped[2:]
            if ":" in kv:
                k, v = kv.split(":", 1)
                current[k.strip()] = _yaml_scalar(v.strip())
            continue
        if indent == 4 and ":" in stripped and current is not None:
            k, v = stripped.split(":", 1)
            v = v.strip()
            if v == "":
                current_list_key = k.strip()
                current[current_list_key] = []
                current_adj = None
            else:
                current[k.strip()] = _yaml_scalar(v)
                current_list_key = None
        elif indent == 6 and stripped.startswith("- ") and current_list_key:
            item = stripped[2:].strip()
            if ":" in item:
                k, v = item.split(":", 1)
                current_adj = {k.strip(): _yaml_scalar(v.strip())}
                current[current_list_key].append(current_adj)
            else:
                current[current_list_key].append(_yaml_scalar(item))
                current_adj = None
        elif indent == 8 and ":" in stripped and current_adj is not None:
            k, v = stripped.split(":", 1)
            current_adj[k.strip()] = _yaml_scalar(v.strip())

    if current:
        scribes.append(current)
    return scribes


def _yaml_scalar(v: str) -> Any:
    v = v.strip()
    if v.startswith('"') and v.endswith('"'):
        return v[1:-1]
    if v.startswith("'") and v.endswith("'"):
        return v[1:-1]
    if v.lower() in ("true", "false"):
        return v.lower() == "true"
    try:
        return int(v)
    except ValueError:
        pass
    try:
        return float(v)
    except ValueError:
        pass
    return v


# ─── Consult algorithm (mirrors registry.scoreScribe) ─────────────────────


def consult(bundle: CathedralBundle, query: str, top_k: int = 5) -> list[dict[str, Any]]:
    q = query.lower().strip()
    if not q:
        return []
    ranked: list[tuple[float, dict[str, Any]]] = []
    for scribe in bundle.scribes:
        score, primary, adjacent = _score_scribe(scribe, q)
        if score <= 0:
            continue
        ranked.append((score, scribe))
    ranked.sort(key=lambda x: x[0], reverse=True)

    out: list[dict[str, Any]] = []
    for score, scribe in ranked:
        if len(out) >= top_k:
            break
        scribe_name = scribe.get("name") or scribe.get("id") or "<unnamed>"
        entries = bundle.entries_by_scribe.get(scribe_name, [])
        # Newest first; entries are append-only chronological.
        for entry in reversed(entries):
            if len(out) >= top_k:
                break
            obs = (entry.get("observation") or "").strip()
            out.append(
                {
                    "scribe": scribe_name,
                    "score": round(score, 2),
                    "ts": entry.get("ts"),
                    "observation": obs,
                    "source": entry.get("source"),
                    "canonical_ref": entry.get("canonical_ref"),
                }
            )
    return out


def _score_scribe(scribe: dict[str, Any], query: str) -> tuple[float, list[str], list[str]]:
    primary_kws = [str(k).lower() for k in (scribe.get("keywords") or [])]
    primary_field = str(scribe.get("primary_field") or "").lower()
    adjacents = [str(a.get("field") or "").lower() for a in (scribe.get("adjacents") or [])]

    primary_hits: list[str] = []
    adjacent_hits: list[str] = []

    hits_primary = (
        any(kw and (query in kw or kw in query) for kw in primary_kws)
        or (primary_field and query in primary_field)
    )
    if hits_primary:
        primary_hits.append(query)
    else:
        if any(field and (query in field or field in query) for field in adjacents):
            adjacent_hits.append(query)

    score = len(primary_hits) * 1.0 + len(adjacent_hits) * 0.5
    return score, primary_hits, adjacent_hits


# ─── CLI ──────────────────────────────────────────────────────────────────


def _resolve_bundle_path(arg: str | None) -> Path:
    if arg:
        return Path(arg).expanduser().resolve()
    here = Path(__file__).resolve().parent
    candidate = Path.cwd() / "cathedral-export.zip"
    if candidate.exists():
        return candidate
    if (here / "registry.yaml").exists():
        return here
    raise FileNotFoundError(
        "No bundle found. Pass --bundle PATH or run from a directory "
        "containing cathedral-export.zip or registry.yaml."
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Liana Companion standalone Cathedral reader.")
    parser.add_argument("--bundle", help="Path to cathedral-export.zip or unzipped dir.")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_consult = sub.add_parser("consult", help="Find top-N relevant entries for a query.")
    p_consult.add_argument("query", help="Search phrase.")
    p_consult.add_argument("--top", type=int, default=5, help="Max entries (default 5).")

    sub.add_parser("list-scribes", help="List Scribes in the bundle.")
    sub.add_parser("stats", help="Print Scribe + entry counts.")

    args = parser.parse_args(argv)

    try:
        bundle_path = _resolve_bundle_path(args.bundle)
        bundle = CathedralBundle(bundle_path)
    except FileNotFoundError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    if args.cmd == "consult":
        results = consult(bundle, args.query, top_k=max(1, args.top))
        if not results:
            print(f"(no matches for '{args.query}' across {len(bundle.scribes)} Scribes)")
            return 0
        for i, r in enumerate(results, 1):
            print(f"[{i}] {r['scribe']}  (score {r['score']})  {r.get('ts','')}")
            print(f"    {r['observation']}")
            if r.get("canonical_ref"):
                print(f"    ref: {r['canonical_ref']}")
            print()
        return 0

    if args.cmd == "list-scribes":
        if not bundle.scribes:
            print("(no Scribes in bundle)")
            return 0
        for s in bundle.scribes:
            name = s.get("name") or s.get("id") or "<unnamed>"
            entries = bundle.entries_by_scribe.get(name, [])
            print(f"{name:24s}  {len(entries):5d} entries  primary: {s.get('primary_field','')}")
        return 0

    if args.cmd == "stats":
        print(f"Bundle source : {bundle.source}")
        print(f"Scribes       : {len(bundle.scribes)}")
        print(f"Total entries : {bundle.total_entries()}")
        print(f"Fates log     : {len(bundle.fates_log)} routing records")
        print(f"Tidbits       : {len(bundle.tidbits)} ledger entries")
        return 0

    return 1


if __name__ == "__main__":
    sys.exit(main())
