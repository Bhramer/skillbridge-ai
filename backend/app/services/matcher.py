from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.nlp import nlp_service, AnalysisResult


@dataclass
class ScoreBreakdown:
    semantic_score: float = 0.0
    keyword_score: float = 0.0
    skill_score: float = 0.0
    experience_score: float = 0.0
    composite_score: float = 0.0


@dataclass
class MatchResult:
    scores: ScoreBreakdown = field(default_factory=ScoreBreakdown)
    matched_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)
    resume_only_skills: list[str] = field(default_factory=list)
    skill_categories: dict[str, list[str]] = field(default_factory=dict)
    missing_categories: dict[str, list[str]] = field(default_factory=dict)
    experience_detail: dict = field(default_factory=dict)
    verdict: str = ""
    verdict_detail: str = ""
    suggestions: list[str] = field(default_factory=list)


def _semantic_similarity(text_a: str, text_b: str) -> float:
    embeddings = nlp_service.embed([text_a, text_b])
    sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return float(np.clip(sim, 0, 1))


def _keyword_similarity(text_a: str, text_b: str) -> float:
    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    try:
        tfidf = vectorizer.fit_transform([text_a, text_b])
        sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return float(np.clip(sim, 0, 1))
    except ValueError:
        return 0.0


def _skill_overlap_score(
    resume_analysis: AnalysisResult,
    jd_analysis: AnalysisResult,
) -> tuple[float, list[str], list[str], list[str]]:
    resume_skills = {s.canonical for s in resume_analysis.skills}
    jd_skills = {s.canonical for s in jd_analysis.skills}

    if not jd_skills:
        return 1.0, [], [], list(resume_skills)

    matched = resume_skills & jd_skills
    missing = jd_skills - resume_skills
    resume_only = resume_skills - jd_skills

    score = len(matched) / len(jd_skills)
    return float(score), sorted(matched), sorted(missing), sorted(resume_only)


def _experience_score(
    resume_analysis: AnalysisResult,
    jd_analysis: AnalysisResult,
) -> tuple[float, dict]:
    resume_years = resume_analysis.experience_years
    jd_years = jd_analysis.experience_years

    detail = {
        "resume_years": resume_years,
        "jd_required_years": jd_years,
    }

    if jd_years is None:
        detail["note"] = "JD does not specify experience requirements"
        return 1.0, detail

    if resume_years is None:
        detail["note"] = "Could not determine experience from resume"
        return 0.5, detail

    if resume_years >= jd_years:
        detail["note"] = "Meets or exceeds requirement"
        return 1.0, detail

    ratio = resume_years / jd_years
    detail["note"] = f"Below requirement ({resume_years}/{jd_years} years)"
    return float(np.clip(ratio, 0, 1)), detail


def _categorize_skills(skills, analysis: AnalysisResult) -> dict[str, list[str]]:
    skill_cats: dict[str, list[str]] = {}
    cat_lookup = {s.canonical: s.category for s in analysis.skills}
    for s in skills:
        cat = cat_lookup.get(s, "other")
        skill_cats.setdefault(cat, []).append(s)
    return skill_cats


def _generate_suggestions(result: MatchResult) -> list[str]:
    suggestions = []
    s = result.scores

    if s.semantic_score < 0.5:
        suggestions.append(
            "Your resume's overall language doesn't align well with the JD. "
            "Consider rewording your summary and experience sections to mirror "
            "the terminology used in the job description."
        )

    if s.keyword_score < 0.4:
        suggestions.append(
            "Many keywords from the job description are missing in your resume. "
            "Add industry-specific terms and action verbs that appear in the JD."
        )

    if s.skill_score < 0.6:
        top_missing = result.missing_skills[:5]
        if top_missing:
            suggestions.append(
                f"Key skills missing: {', '.join(top_missing)}. "
                "Consider acquiring these skills or highlighting any related experience."
            )

    if s.experience_score < 0.7:
        suggestions.append(
            "Your experience level appears below the JD requirement. "
            "Highlight projects, freelance work, or open-source contributions "
            "that demonstrate equivalent expertise."
        )

    if result.resume_only_skills:
        extra = result.resume_only_skills[:5]
        suggestions.append(
            f"You have additional skills not in the JD: {', '.join(extra)}. "
            "These could differentiate you if mentioned strategically."
        )

    if s.composite_score >= 80:
        suggestions.append(
            "Strong match overall! Focus on tailoring your summary "
            "to highlight the most relevant experiences."
        )

    return suggestions


def _verdict(score: float) -> tuple[str, str]:
    if score >= 80:
        return "Strong Match", "Your profile aligns very well with this role. Apply with confidence."
    if score >= 60:
        return "Good Match", "Solid alignment with room for improvement in a few areas."
    if score >= 40:
        return "Needs Improvement", "Notable gaps exist. Focus on acquiring missing skills before applying."
    return "Weak Match", "Significant gaps between your profile and this role. Consider upskilling first."


WEIGHTS = {
    "semantic": 0.35,
    "keyword": 0.25,
    "skill": 0.25,
    "experience": 0.15,
}


def compute_match(
    resume_analysis: AnalysisResult,
    jd_analysis: AnalysisResult,
) -> MatchResult:
    semantic = _semantic_similarity(resume_analysis.raw_text, jd_analysis.raw_text)
    keyword = _keyword_similarity(resume_analysis.raw_text, jd_analysis.raw_text)
    skill_score, matched, missing, resume_only = _skill_overlap_score(resume_analysis, jd_analysis)
    exp_score, exp_detail = _experience_score(resume_analysis, jd_analysis)

    composite = (
        WEIGHTS["semantic"] * semantic
        + WEIGHTS["keyword"] * keyword
        + WEIGHTS["skill"] * skill_score
        + WEIGHTS["experience"] * exp_score
    ) * 100

    composite = round(min(composite, 100), 1)

    scores = ScoreBreakdown(
        semantic_score=round(semantic * 100, 1),
        keyword_score=round(keyword * 100, 1),
        skill_score=round(skill_score * 100, 1),
        experience_score=round(exp_score * 100, 1),
        composite_score=composite,
    )

    verdict_text, verdict_detail = _verdict(composite)

    result = MatchResult(
        scores=scores,
        matched_skills=matched,
        missing_skills=missing,
        resume_only_skills=resume_only,
        skill_categories=_categorize_skills(matched, jd_analysis),
        missing_categories=_categorize_skills(missing, jd_analysis),
        experience_detail=exp_detail,
        verdict=verdict_text,
        verdict_detail=verdict_detail,
    )
    result.suggestions = _generate_suggestions(result)
    return result
