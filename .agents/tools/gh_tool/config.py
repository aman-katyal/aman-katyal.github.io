"""
config.py - Single source of truth for the gh_tool taxonomy for aman-katyal.github.io.
All label names, keyword maps, heuristic signals, and body templates live here.
"""

from __future__ import annotations

# -- Label taxonomy -----------------------------------------------------------

TYPE_LABELS: list[str] = [
    "type:bug", "type:feature", "type:task", "type:ui-ux",
    "type:a11y", "type:docs", "type:chore",
]

PRIORITY_LABELS: list[str] = [
    "priority:critical", "priority:high", "priority:medium", "priority:low",
]

STATUS_LABELS: list[str] = [
    "status:triage", "status:ready", "status:in-progress",
    "status:blocked", "status:awaiting-review", "status:wontfix",
]

AREA_LABELS: list[str] = [
    "area:home", "area:projects", "area:print", "area:nav",
    "area:styles", "area:assets", "area:seo", "area:infra",
]

ALL_CANONICAL_LABELS: list[str] = TYPE_LABELS + PRIORITY_LABELS + STATUS_LABELS + AREA_LABELS

LEGACY_LABELS: set[str] = {
    "bug", "enhancement", "blocked", "awaiting-verification",
    "documentation", "duplicate", "good first issue", "help wanted",
    "invalid", "question", "wontfix",
}

# -- Label colors for bootstrap -----------------------------------------------

LABEL_META: dict[str, dict] = {
    "type:bug":              {"color": "d73a4a", "description": "Unexpected behavior or broken functionality"},
    "type:feature":          {"color": "0075ca", "description": "Net-new capability or portfolio section"},
    "type:task":             {"color": "6f42c1", "description": "Cleanup, removal, refactor, config change"},
    "type:ui-ux":            {"color": "e8b4b8", "description": "Visual polish, layout, spacing, typography"},
    "type:a11y":             {"color": "f9a825", "description": "Accessibility: contrast, ARIA, keyboard, WCAG"},
    "type:docs":             {"color": "bfd4f2", "description": "README, comments, documentation"},
    "type:chore":            {"color": "d4c5f9", "description": "Dependency bumps, CI, tooling"},
    "priority:critical":     {"color": "b60205", "description": "Site-breaking or launch blocker"},
    "priority:high":         {"color": "e05d00", "description": "Must fix before next release"},
    "priority:medium":       {"color": "fde078", "description": "Should fix this sprint"},
    "priority:low":          {"color": "c2e0c6", "description": "Nice to have, no deadline"},
    "status:triage":         {"color": "ededed", "description": "New - needs scoping and label assignment"},
    "status:ready":          {"color": "0e8a16", "description": "Spec complete, ready to implement"},
    "status:in-progress":    {"color": "9BCC65", "description": "Actively being worked on"},
    "status:blocked":        {"color": "d93f0b", "description": "Waiting on decision, asset, or dependency"},
    "status:awaiting-review":{"color": "e99695", "description": "Merged - needs human UI/UX verification"},
    "status:wontfix":        {"color": "ffffff", "description": "Explicitly out of scope"},
    "area:home":             {"color": "7985CB", "description": "Home page, hero profile, bio card, project cards"},
    "area:projects":         {"color": "A0855B", "description": "Project case studies (ASIC, RISC-V, ROV, ESP32, ML)"},
    "area:print":            {"color": "1f883d", "description": "Print portfolio layout and @media print CSS"},
    "area:nav":              {"color": "8b5cf6", "description": "Navbar, breadcrumbs, footer, social links"},
    "area:styles":           {"color": "ec4899", "description": "CSS variables, dark/light theme, typography, Rouge tokens"},
    "area:assets":           {"color": "f59e0b", "description": "Images, schematics, compression, preview cards"},
    "area:seo":              {"color": "cfd3d7", "description": "Meta tags, OpenGraph, Twitter cards, alt texts"},
    "area:infra":            {"color": "0d1117", "description": "Jekyll config, GitHub Pages, CI workflows"},
}

# -- Type classifier ----------------------------------------------------------

TITLE_PREFIX_MAP: list[tuple[str, str]] = [
    (r"^\[BUG\]",     "type:bug"),
    (r"^\[FEATURE\]", "type:feature"),
    (r"^\[TASK\]",    "type:task"),
    (r"^\[UI/UX\]",   "type:ui-ux"),
    (r"^\[A11Y\]",    "type:a11y"),
    (r"^\[DOCS\]",    "type:docs"),
    (r"^\[CHORE\]",   "type:chore"),
]

TYPE_KEYWORDS: dict[str, list[str]] = {
    "type:bug":     ["broken", "fix", "error", "crash", "missing", "fails", "regression", "glitch", "bullet"],
    "type:feature": ["add", "new", "implement", "create", "introduce", "enable", "pagination", "resume"],
    "type:task":    ["remove", "clean", "refactor", "delete", "update", "rename", "migrate", "compress", "placeholder"],
    "type:ui-ux":   ["style", "layout", "spacing", "color", "visual", "typography", "polish", "theme"],
    "type:a11y":    ["accessibility", "contrast", "aria", "wcag", "screen reader", "keyboard", "alt text"],
    "type:docs":    ["document", "readme", "comment", "guide", "explain"],
    "type:chore":   ["dependency", "upgrade", "ci", "pipeline", "tooling", "build", "workflow"],
}

# -- Area classifier ----------------------------------------------------------

AREA_KEYWORDS: dict[str, list[tuple[str, float]]] = {
    "area:home": [
        ("home page", 2.0), ("index.md", 2.0), ("profile", 1.8), ("bio", 1.8),
        ("hero", 1.5), ("featured projects", 1.8), ("gpa", 1.5), ("profile-links", 1.8),
    ],
    "area:projects": [
        ("asic", 2.0), ("risc-v", 2.0), ("uvm", 2.0), ("dpi-c", 2.0),
        ("rov", 2.0), ("hil", 2.0), ("buoyancy", 2.0), ("esp32", 2.0),
        ("ml-dueling", 2.0), ("case study", 1.8), ("sidebar", 1.5),
        ("technologies", 1.2), ("project-card", 1.5),
    ],
    "area:print": [
        ("print-portfolio", 2.2), ("pdf", 2.0), ("print layout", 2.0),
        ("@media print", 2.2), ("page break", 1.8), ("printable", 1.8),
    ],
    "area:nav": [
        ("navbar", 2.2), ("navigation", 2.0), ("breadcrumbs", 1.8), ("footer", 1.8),
        ("social links", 1.5), ("theme toggle", 1.5), ("scroll to top", 1.5),
    ],
    "area:styles": [
        ("dark mode", 2.2), ("light mode", 2.2), ("style.scss", 2.2),
        ("css variable", 1.8), ("typography", 1.5), ("rouge", 1.8),
        ("font", 1.2), ("theme", 1.5), ("syntax highlighting", 1.8),
    ],
    "area:assets": [
        ("image", 2.0), ("compression", 2.0), ("png", 1.5), ("jpg", 1.5),
        ("diagram", 1.8), ("schematic", 1.8), ("ahb_rtl", 2.0), ("attachment", 1.8),
    ],
    "area:seo": [
        ("seo", 2.2), ("opengraph", 2.2), ("og:", 2.2), ("twitter card", 2.0),
        ("meta description", 2.0), ("alt text", 1.8), ("viewport", 1.5),
    ],
    "area:infra": [
        ("jekyll", 2.0), ("_config.yml", 2.2), ("github pages", 2.0),
        ("ci pipeline", 2.0), ("github actions", 2.0), ("workflow", 1.8),
    ],
}

# -- Priority heuristics ------------------------------------------------------

PRIORITY_SIGNALS: dict[str, list[str]] = {
    "priority:critical": [
        "site-breaking", "crash", "blank screen", "syntax error", "fatal",
    ],
    "priority:high": [
        "placeholder", "broken link", "missing asset", "wcag", "contrast",
        "accessibility", "regression",
    ],
    "priority:medium": [
        "compress", "seo", "opengraph", "pagination", "resume link",
        "refactor", "optimize",
    ],
    "priority:low": [
        "cosmetic", "spacing", "minor", "nice to have", "polish",
    ],
}

# -- Status heuristics --------------------------------------------------------

STATUS_SIGNALS: dict[str, list[str]] = {
    "status:blocked": [
        "waiting on", "blocked by", "needs asset", "need permission",
    ],
    "status:ready": [
        "ready to implement", "spec complete", "acceptance criteria defined",
    ],
    "status:triage": [
        "needs investigation", "unclear", "reproduce",
    ],
}

# -- Required body sections per type -----------------------------------------

REQUIRED_SECTIONS: dict[str, list[str]] = {
    "type:bug": [
        "## Bug Description",
        "## Steps to Reproduce",
        "## Expected vs Actual Behavior",
        "## Acceptance Criteria",
    ],
    "type:feature": [
        "## Motivation / Problem Statement",
        "## Proposed Solution",
        "## Acceptance Criteria",
    ],
    "type:task": [
        "## Description",
        "## Requested Changes",
        "## Acceptance Criteria",
    ],
    "type:ui-ux": [
        "## Current State",
        "## Requested Changes",
        "## Acceptance Criteria",
    ],
    "type:a11y": [
        "## Issue Description",
        "## Requested Changes",
        "## Acceptance Criteria",
    ],
    "type:docs": [
        "## Description",
        "## Proposed Documentation",
        "## Acceptance Criteria",
    ],
    "type:chore": [
        "## Description",
        "## Acceptance Criteria",
    ],
}

REQUIRED_SECTION_KEYWORDS: dict[str, list[str]] = {
    "type:bug":     ["description", "reproduce", "expected", "acceptance"],
    "type:feature": ["problem", "solution", "acceptance"],
    "type:task":    ["description", "changes", "acceptance"],
    "type:ui-ux":   ["state", "changes", "acceptance"],
    "type:a11y":    ["description", "changes", "acceptance"],
    "type:docs":    ["description", "acceptance"],
    "type:chore":   ["description", "acceptance"],
}

# -- Body templates for programmatic creation ---------------------------------

BODY_TEMPLATES: dict[str, str] = {
    "type:task": """## Description
{description}

## Requested Changes
{changes}

## Acceptance Criteria
{criteria}
""",
    "type:bug": """## Bug Description
{description}

## Steps to Reproduce
{reproduction}

## Expected vs Actual Behavior
{expected_vs_actual}

## Acceptance Criteria
{criteria}
""",
    "type:feature": """## Motivation / Problem Statement
{problem}

## Proposed Solution
{solution}

## Acceptance Criteria
{criteria}
""",
    "type:ui-ux": """## Current State
{current_state}

## Requested Changes
{changes}

## Acceptance Criteria
{criteria}
""",
    "type:a11y": """## Issue Description
{description}

## Requested Changes
{changes}

## Acceptance Criteria
{criteria}
""",
}

PR_TEMPLATE = """## Summary
{summary}

## Related Issue
Closes #{issue_number}

## Changes Made
{changes}

## Checklist
- [x] Tested locally across light and dark themes
- [x] Verified responsive display
- [x] No regressions introduced
"""
