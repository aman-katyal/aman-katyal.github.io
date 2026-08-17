#!/usr/bin/env python3
"""
cli.py - gh_tool command-line interface for aman-katyal.github.io.

Usage:
    python -m gh_tool <command> [options]

Commands:
    issue suggest-labels  --title "..."  [--body "..."] [--json]
    issue create          --title "..." [--body "..."] [--priority P] [--status S] [--force]
    issue port            [--dry-run]
    issue lint            [--number N] [--state open|all]
    pr create             --issue N --summary "..." [--changes "..."] [--base BRANCH] [--dry-run]
    pr lint               [--number N]
    label sync            [--dry-run]
"""

from __future__ import annotations

import json
import sys
import argparse
import textwrap
from typing import Any

from .classifier import classify_all, classify_type
from .validator import validate_issue, validate_title, validate_body
from .config import LABEL_META, ALL_CANONICAL_LABELS, REQUIRED_SECTIONS
from . import gh


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _print_json(data: Any) -> None:
    print(json.dumps(data, indent=2))


def _label_names(labels_raw: list) -> list[str]:
    return [l["name"] if isinstance(l, dict) else l for l in labels_raw]


def _print_violations_table(violations: list) -> None:
    if not violations:
        return
    print(f"\n  {'#':>5}  {'FIELD':<10}  {'RULE':<28}  DETAIL")
    print(f"  {'─'*5}  {'─'*10}  {'─'*28}  {'─'*52}")
    for v in violations:
        num = str(v.issue_number) if v.issue_number else "-"
        detail = (v.detail[:52] + "...") if len(v.detail) > 55 else v.detail
        print(f"  {num:>5}  {v.field:<10}  {v.rule:<28}  {detail}")


def _risk_color(risk: str) -> str:
    return {"block": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}.get(risk, "⚪")


# ---------------------------------------------------------------------------
# Phase 1 commands
# ---------------------------------------------------------------------------

def cmd_suggest_labels(args: argparse.Namespace) -> int:
    result = classify_all(
        title=args.title,
        body=args.body or "",
        existing_labels=[],
        body_valid=False,
    )
    if args.json:
        _print_json(result)
    else:
        print(f"\n  Suggested labels for: {args.title!r}\n")
        for dim in ("type", "priority", "status", "area"):
            info = result[dim]
            bar = "█" * int(info["confidence"] * 10)
            print(f"  {dim:<10}  {info['label']:<32}  conf={info['confidence']:.2f}  {bar}")
        print(f"\n  --add-label: \"{','.join(result['labels'])}\"\n")
    return 0


def cmd_issue_port(args: argparse.Namespace) -> int:
    print("\n  Fetching open issues...")
    issues = gh.list_issues(state="open", limit=300)
    print(f"  Found {len(issues)} open issues.\n")
    changed = 0
    for issue in issues:
        number   = issue["number"]
        title    = issue["title"]
        body     = issue.get("body") or ""
        existing = _label_names(issue.get("labels", []))
        result   = classify_all(title=title, body=body, existing_labels=existing, body_valid=False)
        new_labels = [l for l in result["labels"] if l not in existing]
        if not new_labels:
            continue
        changed += 1
        print(f"  #{number:<4}  +[{','.join(new_labels)}]")
        gh.add_labels(number, new_labels, dry_run=args.dry_run)
    prefix = "[DRY RUN] " if args.dry_run else ""
    print(f"\n  {prefix}Done — {changed} issues updated.\n")
    return 0


def cmd_issue_lint(args: argparse.Namespace) -> int:
    if args.number:
        issues = [gh.get_issue(args.number)]
    else:
        issues = gh.list_issues(state=args.state, limit=300)

    all_violations = []
    clean = 0
    for issue in issues:
        number   = issue["number"]
        title    = issue["title"]
        body     = issue.get("body") or ""
        existing = _label_names(issue.get("labels", []))
        type_label, _ = classify_type(title)
        result = validate_issue(title, body, existing, type_label, number)
        if result.valid:
            clean += 1
        else:
            all_violations.extend(result.violations)

    total = len(issues)
    print(f"\n  Linted {total} issue(s): {clean} clean, {total - clean} with violations.\n")
    if all_violations:
        _print_violations_table(all_violations)
        print()
        return 1
    print("  All issues pass format checks.\n")
    return 0


def cmd_label_sync(args: argparse.Namespace) -> int:
    existing = {l["name"] for l in gh.list_labels()}
    missing  = [l for l in ALL_CANONICAL_LABELS if l not in existing]
    present  = [l for l in ALL_CANONICAL_LABELS if l in existing]
    print(f"\n  Label sync: {len(present)} present, {len(missing)} to create.\n")
    for name in missing:
        meta = LABEL_META[name]
        print(f"  + {name}")
        gh.create_or_update_label(name, meta["color"], meta["description"], dry_run=args.dry_run)
    prefix = "[DRY RUN] " if args.dry_run else ""
    print(f"\n  {prefix}Done.\n")
    return 0


# ---------------------------------------------------------------------------
# Phase 2: issue create
# ---------------------------------------------------------------------------

def cmd_issue_create(args: argparse.Namespace) -> int:
    from .duplicate import check_duplicate, RISK_THRESHOLDS

    title = args.title.strip()
    body  = args.body or ""

    # 1. Classify labels
    result = classify_all(title=title, body=body, existing_labels=[], body_valid=False)
    labels = result["labels"]

    # Override priority/status if explicitly passed
    if args.priority:
        labels = [l for l in labels if not l.startswith("priority:")] + [f"priority:{args.priority}"]
    if args.status:
        labels = [l for l in labels if not l.startswith("status:")] + [f"status:{args.status}"]

    # 2. Validate body format
    type_label = result["type"]["label"]
    body_result = validate_body(body, type_label)
    title_result = validate_title(title)

    all_violations = body_result.violations + title_result.violations

    if all_violations and not args.force:
        print(f"\n  ❌ Validation failed — {len(all_violations)} violation(s):\n")
        _print_violations_table(all_violations)
        required = REQUIRED_SECTIONS.get(type_label, [])
        if required:
            print(f"\n  Required sections for {type_label}:")
            for s in required:
                print(f"    {s}")
        print("\n  Fix violations or pass --force to skip. Aborting.\n")
        return 1

    # 3. Duplicate check
    print("\n  Checking for duplicates...")
    existing_issues = gh.list_issues(state="open", limit=300)
    existing_slim = [{"number": i["number"], "title": i["title"]} for i in existing_issues]
    should_block, matches = check_duplicate(title, existing_slim)

    if matches:
        print(f"\n  Duplicate check results ({len(matches)} similar issues):\n")
        for m in matches:
            icon = _risk_color(m.risk)
            print(f"  {icon}  #{m.issue_number:<4}  score={m.score:.2f}  {m.title[:70]}")

    if should_block and not args.force:
        print(f"\n  🔴 Blocked: too similar to existing issue(s) above (score >= {RISK_THRESHOLDS['block']}).")
        print("  Pass --force to create anyway.\n")
        return 1

    # 4. Create
    if args.dry_run:
        print(f"\n  [DRY RUN] Would create:")
        print(f"    title:  {title!r}")
        print(f"    labels: {labels}")
        print(f"    body length: {len(body)} chars")
        print()
        return 0

    print(f"\n  Creating issue with labels: {labels}")
    created = gh.create_issue(title, body, labels)
    print(f"\n  ✅ Created: #{created['number']}  {created['url']}\n")

    if args.json:
        _print_json({**created, "labels": labels, "type": type_label})
    return 0


# ---------------------------------------------------------------------------
# Phase 4: pr create / pr lint
# ---------------------------------------------------------------------------

def cmd_pr_create(args: argparse.Namespace) -> int:
    from .pr import resolve_pr_spec, create_pr

    print(f"\n  Resolving PR spec from issue #{args.issue}...")
    spec = resolve_pr_spec(
        issue_number=args.issue,
        summary=args.summary,
        changes=args.changes,
        base=args.base,
    )

    print(f"  title:  {spec.title!r}")
    print(f"  labels: {spec.labels}")
    print(f"  base:   {spec.base}")
    print(f"  closes: #{spec.issue_number}")

    if spec.violations:
        print(f"\n  ⚠️  PR body violations ({len(spec.violations)}):")
        _print_violations_table(spec.violations)
        if not args.force:
            print("\n  Pass --force to create anyway.\n")
            return 1

    if args.dry_run:
        print("\n  [DRY RUN] PR not created.\n")
        return 0

    result = create_pr(spec, dry_run=False)
    print(f"\n  ✅ Created PR: #{result['number']}  {result['url']}")

    # Update issue status to in-progress
    gh.add_labels(args.issue, ["status:in-progress"], dry_run=False)
    gh.remove_labels(args.issue, ["status:ready", "status:triage"], dry_run=False)
    print(f"  Updated issue #{args.issue} → status:in-progress\n")
    return 0


def cmd_pr_lint(args: argparse.Namespace) -> int:
    from .pr import lint_pr

    if args.number:
        prs = [{"number": args.number}]
    else:
        prs = gh.list_prs(state="open")

    all_violations = []
    clean = 0
    for pr in prs:
        result = lint_pr(pr["number"])
        if result.valid:
            clean += 1
        else:
            all_violations.extend(result.violations)

    total = len(prs)
    print(f"\n  Linted {total} PR(s): {clean} clean, {total - clean} with violations.\n")
    if all_violations:
        _print_violations_table(all_violations)
        print()
        return 1
    print("  All PRs pass lint checks.\n")
    return 0


# ---------------------------------------------------------------------------
# Argument parser
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="gh_tool",
        description="Deterministic GitHub issue & PR management for aman-katyal.github.io.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""\
        Examples:
          python -m gh_tool issue suggest-labels --title "[TASK]: Remove placeholder strings"
          python -m gh_tool issue create --title "[BUG]: Missing image" --body "..." --force
          python -m gh_tool issue port --dry-run
          python -m gh_tool issue lint
          python -m gh_tool pr create --issue 1 --summary "Fixed placeholders" --dry-run
          python -m gh_tool pr lint
          python -m gh_tool label sync
        """),
    )
    sub = parser.add_subparsers(dest="group", required=True)

    # ── issue ──────────────────────────────────────────────────────────────
    issue_p   = sub.add_parser("issue", help="Issue commands")
    issue_sub = issue_p.add_subparsers(dest="command", required=True)

    # suggest-labels
    sl = issue_sub.add_parser("suggest-labels")
    sl.add_argument("--title", required=True)
    sl.add_argument("--body",  default="")
    sl.add_argument("--json",  action="store_true")

    # create
    cr = issue_sub.add_parser("create")
    cr.add_argument("--title",    required=True)
    cr.add_argument("--body",     default="")
    cr.add_argument("--priority", default=None, choices=["critical","high","medium","low"])
    cr.add_argument("--status",   default=None, choices=["triage","ready","in-progress","blocked","awaiting-review"])
    cr.add_argument("--force",    action="store_true", help="Skip duplicate block and validation errors")
    cr.add_argument("--dry-run",  action="store_true")
    cr.add_argument("--json",     action="store_true")

    # port
    port = issue_sub.add_parser("port")
    port.add_argument("--dry-run", action="store_true")

    # lint
    lint = issue_sub.add_parser("lint")
    lint.add_argument("--number", type=int, default=None)
    lint.add_argument("--state",  default="open", choices=["open","closed","all"])

    # ── pr ─────────────────────────────────────────────────────────────────
    pr_p   = sub.add_parser("pr", help="PR commands")
    pr_sub = pr_p.add_subparsers(dest="command", required=True)

    # pr create
    prc = pr_sub.add_parser("create")
    prc.add_argument("--issue",   type=int, required=True, help="Source issue number")
    prc.add_argument("--summary", required=True, help="One-sentence PR summary")
    prc.add_argument("--changes", default=None, help="Bullet list of changes (optional)")
    prc.add_argument("--base",    default="main")
    prc.add_argument("--force",   action="store_true")
    prc.add_argument("--dry-run", action="store_true")

    # pr lint
    prl = pr_sub.add_parser("lint")
    prl.add_argument("--number", type=int, default=None)

    # ── label ──────────────────────────────────────────────────────────────
    label_p   = sub.add_parser("label", help="Label management commands")
    label_sub = label_p.add_subparsers(dest="command", required=True)
    sync = label_sub.add_parser("sync")
    sync.add_argument("--dry-run", action="store_true")

    return parser


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    dispatch = {
        ("issue", "suggest-labels"): cmd_suggest_labels,
        ("issue", "create"):         cmd_issue_create,
        ("issue", "port"):           cmd_issue_port,
        ("issue", "lint"):           cmd_issue_lint,
        ("pr",    "create"):         cmd_pr_create,
        ("pr",    "lint"):           cmd_pr_lint,
        ("label", "sync"):           cmd_label_sync,
    }

    fn = dispatch.get((args.group, args.command))
    if fn is None:
        parser.print_help()
        sys.exit(1)

    sys.exit(fn(args))


if __name__ == "__main__":
    main()
