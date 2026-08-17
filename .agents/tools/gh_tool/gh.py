"""
gh.py - Thin subprocess wrapper around the `gh` CLI.
All GitHub mutations go through here so there is exactly one place
to add --dry-run interception or logging.
"""

from __future__ import annotations

import json
import subprocess
import sys
from typing import Any


class GHError(Exception):
    pass


def _run(args: list[str], capture: bool = True) -> str:
    """Run a gh command and return stdout. Raises GHError on non-zero exit."""
    result = subprocess.run(
        ["gh", *args],
        capture_output=capture,
        text=True,
    )
    if result.returncode != 0:
        raise GHError(result.stderr.strip() or f"gh exited {result.returncode}")
    return result.stdout.strip() if capture else ""


# ---------------------------------------------------------------------------
# Issue queries
# ---------------------------------------------------------------------------

def list_issues(state: str = "open", limit: int = 200) -> list[dict]:
    """Return list of issues with number, title, labels, body."""
    raw = _run([
        "issue", "list",
        "--state", state,
        "--limit", str(limit),
        "--json", "number,title,labels,body",
    ])
    return json.loads(raw) if raw else []


def get_issue(number: int) -> dict:
    raw = _run(["issue", "view", str(number), "--json", "number,title,labels,body,state"])
    return json.loads(raw)


# ---------------------------------------------------------------------------
# Issue mutations
# ---------------------------------------------------------------------------

def add_labels(number: int, labels: list[str], dry_run: bool = False) -> None:
    label_str = ",".join(labels)
    if dry_run:
        print(f"  [dry-run] gh issue edit {number} --add-label {label_str!r}")
        return
    _run(["issue", "edit", str(number), "--add-label", label_str])


def remove_labels(number: int, labels: list[str], dry_run: bool = False) -> None:
    label_str = ",".join(labels)
    if dry_run:
        print(f"  [dry-run] gh issue edit {number} --remove-label {label_str!r}")
        return
    _run(["issue", "edit", str(number), "--remove-label", label_str])


def create_issue(title: str, body: str, labels: list[str], dry_run: bool = False) -> dict[str, Any]:
    label_str = ",".join(labels)
    if dry_run:
        print(f"  [dry-run] gh issue create --title {title!r} --label {label_str!r}")
        return {"number": 0, "url": "dry-run"}
    
    args = ["issue", "create", "--title", title, "--body", body]
    if label_str:
        args.extend(["--label", label_str])
        
    raw = _run(args)
    url = raw.strip()
    number_str = url.split("/")[-1]
    number = int(number_str) if number_str.isdigit() else 0
    return {"number": number, "url": url}


def close_issue(number: int, comment: str, dry_run: bool = False) -> None:
    if dry_run:
        print(f"  [dry-run] gh issue close {number} --comment {comment!r}")
        return
    _run(["issue", "close", str(number), "--comment", comment])


# ---------------------------------------------------------------------------
# PR queries
# ---------------------------------------------------------------------------

def list_prs(state: str = "open") -> list[dict]:
    raw = _run(["pr", "list", "--state", state, "--json", "number,title,labels,body,headRefName,statusCheckRollup"])
    return json.loads(raw) if raw else []


def get_pr(number: int) -> dict:
    raw = _run(["pr", "view", str(number), "--json", "number,title,labels,body,mergeable,statusCheckRollup"])
    return json.loads(raw)


# ---------------------------------------------------------------------------
# PR mutations
# ---------------------------------------------------------------------------

def create_pr(title: str, body: str, labels: list[str], base: str = "main", dry_run: bool = False) -> dict:
    label_str = ",".join(labels)
    if dry_run:
        print(f"  [dry-run] gh pr create --title {title!r} --base {base} --label {label_str!r}")
        return {"number": 0, "url": "dry-run"}
    raw = _run([
        "pr", "create",
        "--title", title,
        "--body", body,
        "--base", base,
        "--label", label_str,
        "--json", "number,url",
    ])
    return json.loads(raw)


# ---------------------------------------------------------------------------
# Label management
# ---------------------------------------------------------------------------

def list_labels() -> list[dict]:
    raw = _run(["label", "list", "--json", "name,color,description"])
    return json.loads(raw) if raw else []


def create_or_update_label(name: str, color: str, description: str, dry_run: bool = False) -> None:
    if dry_run:
        print(f"  [dry-run] gh label create {name!r} --color {color!r} --force")
        return
    _run(["label", "create", name, "--color", color, "--description", description, "--force"])
