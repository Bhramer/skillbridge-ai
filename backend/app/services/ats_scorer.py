from __future__ import annotations

import re
from dataclasses import dataclass, field

from app.services.parser import detect_sections

ACTION_VERBS = {
    "achieved", "built", "created", "delivered", "designed", "developed",
    "drove", "engineered", "established", "executed", "generated", "grew",
    "implemented", "improved", "increased", "launched", "led", "managed",
    "optimized", "orchestrated", "pioneered", "reduced", "resolved",
    "scaled", "shipped", "streamlined", "transformed", "architected",
    "automated", "collaborated", "configured", "consolidated", "coordinated",
    "customized", "debugged", "defined", "deployed", "documented",
    "enhanced", "evaluated", "facilitated", "formulated", "identified",
    "initiated", "integrated", "introduced", "maintained", "mentored",
    "migrated", "modernized", "monitored", "negotiated", "organized",
    "overhauled", "performed", "planned", "presented", "produced",
    "programmed", "proposed", "provided", "published", "refactored",
    "researched", "restructured", "revamped", "reviewed", "simplified",
    "spearheaded", "standardized", "supervised", "tested", "trained",
}

REQUIRED_SECTIONS = {"experience", "education", "skills"}
PREFERRED_SECTIONS = {"summary", "projects", "certifications"}
SECTION_ORDER_IDEAL = ["summary", "experience", "skills", "education", "projects", "certifications"]


@dataclass
class ATSScoreResult:
    keyword_score: float = 0.0
    format_score: float = 0.0
    readability_score: float = 0.0
    section_score: float = 0.0
    composite_score: float = 0.0
    sub_metrics: dict = field(default_factory=dict)


def _score_keywords(text: str, skills: list[str]) -> tuple[float, dict]:
    text_lower = text.lower()
    words = set(re.findall(r"\b\w+\b", text_lower))

    action_verb_count = len(words & ACTION_VERBS)
    action_verb_score = min(action_verb_count / 8, 1.0) * 100

    metrics_count = len(re.findall(r"\d+%|\d+x|\$[\d,]+|\d+\+", text))
    metrics_score = min(metrics_count / 5, 1.0) * 100

    skill_count = sum(1 for s in skills if s.lower() in text_lower)
    skill_density = (skill_count / max(len(skills), 1)) * 100 if skills else 50

    score = (action_verb_score * 0.3 + metrics_score * 0.3 + skill_density * 0.4)
    return min(score, 100), {
        "action_verbs_found": action_verb_count,
        "metrics_found": metrics_count,
        "skills_mentioned": skill_count,
    }


def _score_format(text: str) -> tuple[float, dict]:
    lines = text.strip().split("\n")
    total_lines = len(lines)

    has_bullets = sum(1 for line in lines if line.strip().startswith(("•", "-", "*", "·")))
    bullet_ratio = has_bullets / max(total_lines, 1)
    bullet_score = min(bullet_ratio / 0.3, 1.0) * 100

    has_email = bool(re.search(r"[\w.-]+@[\w.-]+\.\w+", text))
    has_phone = bool(re.search(r"[\d\s()+-]{10,}", text))
    has_links = bool(re.search(r"https?://|linkedin\.com|github\.com", text, re.IGNORECASE))
    contact_score = (int(has_email) + int(has_phone) + int(has_links)) / 3 * 100

    word_count = len(text.split())
    length_score = 100 if 300 <= word_count <= 800 else max(0, 100 - abs(word_count - 550) * 0.15)

    score = bullet_score * 0.4 + contact_score * 0.3 + length_score * 0.3
    return min(score, 100), {
        "bullet_points": has_bullets,
        "has_email": has_email,
        "has_phone": has_phone,
        "has_links": has_links,
        "word_count": word_count,
    }


def _score_readability(text: str) -> tuple[float, dict]:
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
    total_sentences = max(len(sentences), 1)

    avg_sentence_length = sum(len(s.split()) for s in sentences) / total_sentences
    sentence_score = 100 if 10 <= avg_sentence_length <= 25 else max(0, 100 - abs(avg_sentence_length - 17) * 5)

    words = text.lower().split()
    filler_words = {"very", "really", "basically", "actually", "just", "simply", "quite"}
    filler_count = sum(1 for w in words if w in filler_words)
    filler_ratio = filler_count / max(len(words), 1)
    filler_score = max(0, 100 - filler_ratio * 1000)

    passive_patterns = len(re.findall(r"\b(?:was|were|been|being|is|are)\s+\w+ed\b", text, re.IGNORECASE))
    passive_ratio = passive_patterns / total_sentences
    passive_score = max(0, 100 - passive_ratio * 200)

    score = sentence_score * 0.4 + filler_score * 0.3 + passive_score * 0.3
    return min(score, 100), {
        "avg_sentence_length": round(avg_sentence_length, 1),
        "filler_words": filler_count,
        "passive_voice_instances": passive_patterns,
    }


def _score_sections(text: str) -> tuple[float, dict]:
    sections = detect_sections(text)
    found_sections = set(sections.keys()) - {"header", "full_text"}

    required_found = REQUIRED_SECTIONS & found_sections
    required_score = len(required_found) / len(REQUIRED_SECTIONS) * 100

    preferred_found = PREFERRED_SECTIONS & found_sections
    preferred_score = len(preferred_found) / len(PREFERRED_SECTIONS) * 50

    found_ordered = [s for s in SECTION_ORDER_IDEAL if s in found_sections]
    order_score = 100
    if len(found_ordered) >= 2:
        inversions = sum(
            1 for i in range(len(found_ordered))
            for j in range(i + 1, len(found_ordered))
            if SECTION_ORDER_IDEAL.index(found_ordered[i]) > SECTION_ORDER_IDEAL.index(found_ordered[j])
        )
        max_inversions = len(found_ordered) * (len(found_ordered) - 1) / 2
        order_score = max(0, (1 - inversions / max(max_inversions, 1)) * 100)

    score = required_score * 0.5 + preferred_score * 0.3 + order_score * 0.2
    return min(score, 100), {
        "required_sections": list(required_found),
        "missing_required": list(REQUIRED_SECTIONS - required_found),
        "preferred_sections": list(preferred_found),
        "sections_found": list(found_sections),
    }


WEIGHTS = {
    "keyword": 0.30,
    "format": 0.25,
    "readability": 0.20,
    "section": 0.25,
}


def compute_ats_score(text: str, skills: list[str] | None = None) -> ATSScoreResult:
    skills = skills or []

    kw_score, kw_detail = _score_keywords(text, skills)
    fmt_score, fmt_detail = _score_format(text)
    read_score, read_detail = _score_readability(text)
    sec_score, sec_detail = _score_sections(text)

    composite = (
        WEIGHTS["keyword"] * kw_score
        + WEIGHTS["format"] * fmt_score
        + WEIGHTS["readability"] * read_score
        + WEIGHTS["section"] * sec_score
    )

    return ATSScoreResult(
        keyword_score=round(kw_score, 1),
        format_score=round(fmt_score, 1),
        readability_score=round(read_score, 1),
        section_score=round(sec_score, 1),
        composite_score=round(min(composite, 100), 1),
        sub_metrics={
            "keywords": kw_detail,
            "format": fmt_detail,
            "readability": read_detail,
            "sections": sec_detail,
        },
    )
