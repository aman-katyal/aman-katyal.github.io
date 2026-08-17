"""
classifier.py - Deterministic label inference engine.
No LLM calls. Pure regex + weighted keyword scoring.
Same input always produces the same output.
"""

from __future__ import annotations

import re
from collections import defaultdict

from .config import (
    AREA_KEYWORDS,
    PRIORITY_SIGNALS,
    STATUS_SIGNALS,
    TITLE_PREFIX_MAP,
    TYPE_KEYWORDS,
)


# ---------------------------------------------------------------------------
# Type classification
# ---------------------------------------------------------------------------

def classify_type(title: str) -> tuple[str, float]:
    """
    Return (type_label, confidence) for an issue title.
    Confidence is 1.0 for prefix match, 0.0-1.0 for keyword scoring.
    """
    # 1. Prefix match (deterministic, confidence = 1.0)
    for pattern, label in TITLE_PREFIX_MAP:
        if re.match(pattern, title.strip(), re.IGNORECASE):
            return label, 1.0

    # 2. Keyword fallback scoring
    text = title.lower()
    scores: dict[str, int] = defaultdict(int)
    for label, keywords in TYPE_KEYWORDS.items():
        for kw in keywords:
            if kw in text:
                scores[label] += 1

    if scores:
        best = max(scores, key=lambda k: scores[k])
        total = sum(scores.values())
        confidence = round(scores[best] / max(total, 1), 2)
        return best, confidence

    # 3. Default
    return "type:task", 0.3


# ---------------------------------------------------------------------------
# Area classification
# ---------------------------------------------------------------------------

def classify_area(title: str, body: str = "") -> tuple[str, float]:
    """
    Return (area_label, confidence) by scoring keyword matches across
    title and body text. Title matches are weighted 2x.
    """
    text_title = title.lower()
    text_body = body.lower()

    scores: dict[str, float] = defaultdict(float)

    for area, keyword_weights in AREA_KEYWORDS.items():
        for phrase, weight in keyword_weights:
            ph = phrase.lower()
            if ph in text_title:
                scores[area] += weight * 2.0   # title match worth double
            if ph in text_body:
                scores[area] += weight

    if not scores or max(scores.values()) == 0:
        return "area:home", 0.1   # safe default

    best = max(scores, key=lambda k: scores[k])
    total = sum(scores.values())
    confidence = round(scores[best] / max(total, 1), 2)
    return best, confidence


# ---------------------------------------------------------------------------
# Priority classification
# ---------------------------------------------------------------------------

def classify_priority(title: str, body: str = "", existing_labels: list[str] | None = None) -> tuple[str, float]:
    """
    Return (priority_label, confidence).
    Checks existing labels first, then signal keywords.
    """
    existing_labels = existing_labels or []

    # Respect existing priority labels
    for lbl in existing_labels:
        if lbl.startswith("priority:"):
            return lbl, 1.0

    text = (title + " " + body).lower()

    for priority, signals in PRIORITY_SIGNALS.items():
        for signal in signals:
            if signal in text:
                return priority, 0.85

    return "priority:medium", 0.5   # sensible default


# ---------------------------------------------------------------------------
# Status classification
# ---------------------------------------------------------------------------

def classify_status(
    title: str,
    body: str = "",
    existing_labels: list[str] | None = None,
    body_valid: bool = False,
) -> tuple[str, float]:
    """
    Return (status_label, confidence).
    """
    existing_labels = existing_labels or []

    # 1. Respect existing status label
    for lbl in existing_labels:
        if lbl.startswith("status:"):
            return lbl, 1.0

    text = (title + " " + body).lower()

    # 2. Blocked signals
    for signal in STATUS_SIGNALS["status:blocked"]:
        if signal in text:
            return "status:blocked", 0.9

    # 3. Legacy awaiting-verification label present
    if "awaiting-verification" in existing_labels:
        return "status:awaiting-review", 1.0

    # 4. Spec complete
    if body_valid:
        return "status:ready", 0.8

    # 5. Default
    return "status:triage", 0.5


# ---------------------------------------------------------------------------
# Full classification (all four dimensions)
# ---------------------------------------------------------------------------

def classify_all(
    title: str,
    body: str = "",
    existing_labels: list[str] | None = None,
    body_valid: bool = False,
) -> dict:
    """
    Run all four classifiers and return a structured result dict.
    """
    type_label, type_conf   = classify_type(title)
    area_label, area_conf   = classify_area(title, body)
    pri_label,  pri_conf    = classify_priority(title, body, existing_labels)
    stat_label, stat_conf   = classify_status(title, body, existing_labels, body_valid)

    return {
        "type":     {"label": type_label,  "confidence": type_conf},
        "priority": {"label": pri_label,   "confidence": pri_conf},
        "status":   {"label": stat_label,  "confidence": stat_conf},
        "area":     {"label": area_label,  "confidence": area_conf},
        "labels":   [type_label, pri_label, stat_label, area_label],
    }
