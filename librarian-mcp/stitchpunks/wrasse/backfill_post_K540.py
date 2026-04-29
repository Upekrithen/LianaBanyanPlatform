"""
Wrasse Registry Backfill — K550/B133

One-shot backfill for triggers that landed AFTER K540 build time (8ca55cd).
Scans git log since K540 commit, extracts trigger patterns from commit messages
and git tag annotations, and calls append_if_new for each novel trigger.

Stone Tablet: emits full backfill report to
  librarian-mcp/stitchpunks/wrasse/backfill_K540_to_<HEAD>.jsonl

Usage:
  python backfill_post_K540.py [--dry-run] [--since-commit 8ca55cd]
"""

from __future__ import annotations

import argparse
import json
import logging
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add parent dirs to sys.path so wrasse_registry_writer imports cleanly
_HERE = Path(__file__).parent
_REPO_ROOT = _HERE.parent.parent.parent  # LianaBanyanPlatform/
sys.path.insert(0, str(_HERE))

from wrasse_registry_writer import (  # noqa: E402
    append_if_new,
    extract_triggers_from_claim,
    REGISTRY_PATH,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

K540_COMMIT = "8ca55cd"  # v-wrasse-scribe-mvp-K540 anchor

BACKFILL_REPORT_PATH = _HERE / f"backfill_K540_to_HEAD.jsonl"


def _git(args: list[str], cwd: Path | None = None) -> str:
    result = subprocess.run(
        ["git"] + args,
        capture_output=True,
        text=True,
        cwd=str(cwd or _REPO_ROOT),
    )
    if result.returncode != 0:
        logger.warning("git %s failed: %s", " ".join(args), result.stderr.strip())
        return ""
    return result.stdout.strip()


def _get_commits_since(since_commit: str) -> list[dict[str, str]]:
    """Return list of {hash, subject, body} dicts for commits since since_commit."""
    log = _git(["log", "--oneline", f"{since_commit}..HEAD"])
    commits = []
    for line in log.splitlines():
        parts = line.strip().split(" ", 1)
        if len(parts) < 2:
            continue
        sha, subject = parts[0], parts[1]
        body = _git(["log", "-1", "--format=%b", sha])
        commits.append({"hash": sha, "subject": subject, "body": body})
    return commits


def _get_tags_since(since_commit: str) -> list[dict[str, str]]:
    """Return list of {tag, annotation, commit} for tags reachable after since_commit."""
    tag_list = _git(["tag", "--sort=-creatordate"])
    tags = []
    for tag in tag_list.splitlines():
        tag = tag.strip()
        if not tag:
            continue
        # Check if tag is reachable after since_commit
        ancestor_check = _git(["merge-base", "--is-ancestor", since_commit, tag + "^{commit}"])
        if ancestor_check is None:
            continue
        annotation = _git(["tag", "-l", "--format=%(contents)", tag])
        commit = _git(["rev-list", "-n", "1", tag])
        tags.append({"tag": tag, "annotation": annotation, "commit": commit})
    return tags


def run_backfill(
    since_commit: str = K540_COMMIT,
    dry_run: bool = False,
    source_session: str = "backfill_post_K540/K550",
) -> dict[str, int]:
    """
    Main backfill function. Returns counts dict.
    """
    logger.info("Backfill: scanning commits since %s", since_commit)

    commits = _get_commits_since(since_commit)
    logger.info("Found %d commits", len(commits))

    tags = _get_tags_since(since_commit)
    logger.info("Found %d tags", len(tags))

    records = []
    stats = {"commits_scanned": len(commits), "tags_scanned": len(tags),
             "appended": 0, "bumped": 0, "unchanged": 0, "errors": 0}

    # Process commits
    for commit in commits:
        text = f"{commit['subject']} {commit['body']}"
        triggers = extract_triggers_from_claim(text)
        for pattern, cls in triggers:
            # Build canonical_resolution from commit context
            resolution = (
                f"From git commit {commit['hash']}: {commit['subject'][:200]}"
            )
            if not dry_run:
                result = append_if_new(pattern, cls, resolution, source_session)
            else:
                result = {"action": "dry_run", "trigger_id": ""}
            record = {
                "source": "commit",
                "hash": commit["hash"],
                "trigger_pattern": pattern,
                "trigger_class": cls,
                "action": result["action"],
                "trigger_id": result.get("trigger_id", ""),
                "ts": datetime.now(timezone.utc).isoformat(),
            }
            records.append(record)
            stats[result["action"]] = stats.get(result["action"], 0) + 1

    # Process tags
    for tag_info in tags:
        triggers = extract_triggers_from_claim(tag_info["tag"])
        for pattern, cls in triggers:
            annotation_preview = (tag_info["annotation"] or "")[:200]
            resolution = f"Git tag: {tag_info['tag']}. {annotation_preview}"
            if not dry_run:
                result = append_if_new(pattern, cls, resolution, source_session)
            else:
                result = {"action": "dry_run", "trigger_id": ""}
            record = {
                "source": "tag",
                "tag": tag_info["tag"],
                "trigger_pattern": pattern,
                "trigger_class": cls,
                "action": result["action"],
                "trigger_id": result.get("trigger_id", ""),
                "ts": datetime.now(timezone.utc).isoformat(),
            }
            records.append(record)
            stats[result["action"]] = stats.get(result["action"], 0) + 1

    # Stone Tablet: write full backfill report
    if not dry_run:
        with BACKFILL_REPORT_PATH.open("w", encoding="utf-8") as fh:
            summary = {
                "type": "backfill_report",
                "since_commit": since_commit,
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "source_session": source_session,
                "stats": stats,
            }
            fh.write(json.dumps(summary) + "\n")
            for rec in records:
                fh.write(json.dumps(rec) + "\n")
        logger.info("Backfill report: %s", BACKFILL_REPORT_PATH)

    logger.info("Backfill complete: %s", stats)
    return stats


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Wrasse Registry Backfill (post-K540)")
    parser.add_argument("--dry-run", action="store_true", help="Report without writing")
    parser.add_argument("--since-commit", default=K540_COMMIT, help="Commit SHA to backfill from")
    args = parser.parse_args()

    stats = run_backfill(since_commit=args.since_commit, dry_run=args.dry_run)
    print(json.dumps(stats, indent=2))
