"""
duplicate.py - TF-IDF cosine similarity duplicate scorer.
No LLM. Uses sklearn to score new issue titles against all open issue titles.
Threshold: warn >= 0.65, block >= 0.85.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class DuplicateMatch:
    issue_number: int
    title: str
    score: float
    risk: str  # "low" | "medium" | "high" | "block"


RISK_THRESHOLDS = {
    "block":  0.85,
    "high":   0.75,
    "medium": 0.65,
    "low":    0.0,
}


def _risk_level(score: float) -> str:
    if score >= RISK_THRESHOLDS["block"]:
        return "block"
    if score >= RISK_THRESHOLDS["high"]:
        return "high"
    if score >= RISK_THRESHOLDS["medium"]:
        return "medium"
    return "low"


def score_duplicates(
    new_title: str,
    existing: list[dict],  # [{"number": int, "title": str}, ...]
    top_n: int = 5,
) -> list[DuplicateMatch]:
    """
    Score new_title against existing issue titles using TF-IDF cosine similarity.
    Returns up to top_n matches sorted by score descending.
    Only returns matches with score > 0.

    Falls back to simple Jaccard similarity if sklearn is not installed.
    """
    if not existing:
        return []

    titles = [e["title"] for e in existing]
    numbers = [e["number"] for e in existing]

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np

        corpus = [new_title] + titles
        vectorizer = TfidfVectorizer(
            analyzer="word",
            ngram_range=(1, 2),
            min_df=1,
            strip_accents="unicode",
            lowercase=True,
        )
        tfidf = vectorizer.fit_transform(corpus)
        sims = cosine_similarity(tfidf[0:1], tfidf[1:]).flatten()

    except ImportError:
        # Jaccard fallback (no external deps)
        sims = _jaccard_scores(new_title, titles)

    matches = [
        DuplicateMatch(
            issue_number=numbers[i],
            title=titles[i],
            score=round(float(sims[i]), 4),
            risk=_risk_level(float(sims[i])),
        )
        for i in range(len(titles))
        if sims[i] > 0.0
    ]

    matches.sort(key=lambda m: m.score, reverse=True)
    return matches[:top_n]


def _jaccard_scores(query: str, titles: list[str]) -> list[float]:
    """Pure-Python Jaccard similarity over word sets. Fallback when sklearn absent."""
    q_tokens = set(query.lower().split())
    scores = []
    for title in titles:
        t_tokens = set(title.lower().split())
        union = q_tokens | t_tokens
        if not union:
            scores.append(0.0)
        else:
            scores.append(len(q_tokens & t_tokens) / len(union))
    return scores


def check_duplicate(
    new_title: str,
    existing: list[dict],
    block_threshold: float = RISK_THRESHOLDS["block"],
) -> tuple[bool, list[DuplicateMatch]]:
    """
    High-level check: returns (should_block, top_matches).
    should_block=True means the title is too similar to an existing issue
    and creation should be prevented unless --force is passed.
    """
    matches = score_duplicates(new_title, existing)
    should_block = any(m.score >= block_threshold for m in matches)
    return should_block, matches
