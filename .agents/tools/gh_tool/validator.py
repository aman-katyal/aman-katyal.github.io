"""
validator.py - Issue and PR body format enforcer.
Hard rules per issue type. Returns structured violations list.
Exit-worthy on any violation in strict mode.

Body format awareness:
  - GitHub Issue Forms (YAML) generate ### h3 headers with the field label text
  - Hand-written bodies use ## h2 headers (old style)
  Both are accepted. The required_sections config lists keyword phrases;
  we check if ANY heading containing that phrase exists in the body.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field as datafield

from .config import REQUIRED_SECTION_KEYWORDS


@dataclass
class Violation:
    issue_number: int | None
    field: str          # "body", "title", "labels", "merge"
    rule: str           # machine-readable rule name
    detail: str         # human-readable explanation


@dataclass
class ValidationResult:
    valid: bool
    violations: list[Violation] = datafield(default_factory=list)

    def add(self, issue_number: int | None, field: str, rule: str, detail: str) -> None:
        self.violations.append(Violation(issue_number, field, rule, detail))
        self.valid = False


# ---------------------------------------------------------------------------
# Heading extractor — works for both ## and ### styles
# ---------------------------------------------------------------------------

_HEADING_RE = re.compile(r"^#{1,6}\s+(.+)$", re.MULTILINE)


def _extract_headings(body: str) -> list[str]:
    """Return lowercase heading text for all ## / ### headings in the body."""
    return [m.group(1).lower() for m in _HEADING_RE.finditer(body)]


def _has_section(body: str, keyword: str) -> bool:
    """
    Return True if the body contains a heading whose text includes `keyword`.
    Case-insensitive. Strips emoji from heading text before comparing.
    """
    kw = keyword.lower().strip()
    emoji_re = re.compile(
        r"^[\U0001F300-\U0001FAFF\u2600-\u26FF\u2700-\u27BF\s#*_]+",
        re.UNICODE,
    )
    for heading in _extract_headings(body):
        cleaned = emoji_re.sub("", heading).strip()
        if kw in cleaned:
            return True
    if f"**{keyword.lower()}" in body.lower():
        return True
    return False


# ---------------------------------------------------------------------------
# Title validation
# ---------------------------------------------------------------------------

VALID_PREFIXES = {"[BUG]", "[FEATURE]", "[TASK]", "[UI/UX]", "[A11Y]", "[DOCS]", "[CHORE]"}


def validate_title(title: str, issue_number: int | None = None) -> ValidationResult:
    result = ValidationResult(valid=True)
    stripped = title.strip()

    has_prefix = any(stripped.upper().startswith(p) for p in VALID_PREFIXES)
    if not has_prefix:
        result.add(
            issue_number, "title", "missing-prefix",
            f"Title must start with one of {sorted(VALID_PREFIXES)}. Got: {stripped[:60]!r}"
        )
    if len(stripped) > 120:
        result.add(
            issue_number, "title", "too-long",
            f"Title is {len(stripped)} chars; max is 120."
        )
    return result


# ---------------------------------------------------------------------------
# Body section validation
# ---------------------------------------------------------------------------

def validate_body(
    body: str,
    type_label: str,
    issue_number: int | None = None,
) -> ValidationResult:
    """
    Check that all required section keywords for this type_label are present.
    """
    result = ValidationResult(valid=True)
    required_keywords = REQUIRED_SECTION_KEYWORDS.get(type_label, [])

    for keyword in required_keywords:
        if not _has_section(body, keyword):
            result.add(
                issue_number, "body", "missing-section",
                f"Required section not found: '{keyword}' (needed for {type_label})"
            )
    return result


# ---------------------------------------------------------------------------
# Label completeness validation
# ---------------------------------------------------------------------------

def validate_labels(
    labels: list[str],
    issue_number: int | None = None,
) -> ValidationResult:
    """Ensure at least one label per dimension is present."""
    result = ValidationResult(valid=True)
    dimensions = {
        "type":     [l for l in labels if l.startswith("type:")],
        "priority": [l for l in labels if l.startswith("priority:")],
        "status":   [l for l in labels if l.startswith("status:")],
        "area":     [l for l in labels if l.startswith("area:")],
    }
    for dim, present in dimensions.items():
        if not present:
            result.add(
                issue_number, "labels", f"missing-{dim}-label",
                f"No {dim}: label found. Apply one of the canonical {dim}: labels."
            )
    return result


# ---------------------------------------------------------------------------
# PR body validation
# ---------------------------------------------------------------------------

PR_REQUIRED_KEYWORDS = ["summary", "related issue", "checklist"]
CLOSES_PATTERN = re.compile(r"[Cc]loses\s+#\d+")


def validate_pr_body(body: str, pr_number: int | None = None) -> ValidationResult:
    result = ValidationResult(valid=True)

    for keyword in PR_REQUIRED_KEYWORDS:
        if not _has_section(body, keyword):
            result.add(pr_number, "body", "missing-section",
                       f"PR body missing section containing: '{keyword}'")

    if not CLOSES_PATTERN.search(body):
        result.add(
            pr_number, "body", "no-closes-link",
            "PR body must contain 'Closes #<N>' to auto-close the related issue."
        )
    return result


# ---------------------------------------------------------------------------
# Full issue validation
# ---------------------------------------------------------------------------

def validate_issue(
    title: str,
    body: str,
    labels: list[str],
    type_label: str,
    issue_number: int | None = None,
) -> ValidationResult:
    """Run all validators and merge results."""
    merged = ValidationResult(valid=True)

    for sub in [
        validate_title(title, issue_number),
        validate_body(body, type_label, issue_number),
        validate_labels(labels, issue_number),
    ]:
        merged.violations.extend(sub.violations)
        if not sub.valid:
            merged.valid = False

    return merged
