from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import Analysis
from app.services.auth import get_current_user
from app.services.cache import cache_get, cache_set, dashboard_key
from app.services import gemini
from app.services.job_service import search_jobs
from app.config import get_settings

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
async def get_dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()

    cached = await cache_get(dashboard_key(str(user.id)))
    if cached:
        return {"status": "success", "data": cached, "cached": True}

    latest_analysis = await db.execute(
        select(Analysis)
        .where(Analysis.user_id == user.id, Analysis.analysis_type == "resume_analysis")
        .order_by(Analysis.created_at.desc())
        .limit(1)
    )
    latest = latest_analysis.scalar_one_or_none()

    ats_score = latest.ats_score if latest else None
    sub_metrics = latest.result_data.get("sub_metrics", {}) if latest else {}
    skills_found = latest.result_data.get("skills_found", []) if latest else []

    jd_match = await db.execute(
        select(Analysis)
        .where(Analysis.user_id == user.id, Analysis.analysis_type == "jd_match")
        .order_by(Analysis.created_at.desc())
        .limit(1)
    )
    jd_latest = jd_match.scalar_one_or_none()
    jd_match_score = None
    if jd_latest:
        scores = jd_latest.result_data.get("scores", {})
        jd_match_score = scores.get("composite_score")

    all_analyses = await db.execute(
        select(Analysis.ats_score, Analysis.created_at)
        .where(
            Analysis.user_id == user.id,
            Analysis.analysis_type == "resume_analysis",
            Analysis.ats_score.isnot(None),
        )
        .order_by(Analysis.created_at.asc())
        .limit(12)
    )
    trend_rows = all_analyses.all()
    skill_trends = [
        {"date": row.created_at.strftime("%b %d"), "score": row.ats_score}
        for row in trend_rows
    ]

    confidence = None
    if ats_score and jd_match_score:
        confidence = round((ats_score * 0.6 + jd_match_score * 0.4), 1)
    elif ats_score:
        confidence = ats_score

    skill_gap_chart = []
    if skills_found:
        categories: dict[str, int] = {}
        for skill in skills_found:
            cat = "Technical"
            categories.setdefault(cat, 0)
            categories[cat] += 1
        skill_gap_chart = [{"category": k, "count": v} for k, v in categories.items()]

    target_role = user.target_role or "Software Engineer"

    top_jobs: list[dict] = []
    try:
        all_jobs = await search_jobs(target_role, "India")
        resume_skills = set(skills_found)
        for job in all_jobs:
            job_skills = set(job.get("skills", []))
            matched = job_skills & resume_skills
            match_pct = round(len(matched) / max(len(job_skills), 1) * 100, 1)
            job["match_pct"] = match_pct
            job["matched_skills"] = sorted(matched)
            job["missing_skills"] = sorted(job_skills - resume_skills)
        all_jobs.sort(key=lambda j: j.get("match_pct", 0), reverse=True)
        top_jobs = all_jobs[:5]
    except Exception:
        top_jobs = []

    recommendations: list[dict] = []
    if settings.GEMINI_API_KEY and skills_found:
        try:
            recommendations = await gemini.generate_dashboard_recommendations(
                ats_score, skills_found, target_role
            )
        except Exception:
            recommendations = []

    data = {
        "ats_score": ats_score,
        "skill_match_pct": jd_match_score,
        "job_matches_count": len(top_jobs),
        "confidence_score": confidence,
        "skill_gap_chart": skill_gap_chart,
        "jd_match_score": jd_match_score,
        "skill_trends": skill_trends,
        "top_jobs": top_jobs,
        "ai_recommendations": recommendations if isinstance(recommendations, list) else [],
        "sub_metrics": sub_metrics,
        "skills_found": skills_found,
    }

    await cache_set(dashboard_key(str(user.id)), data, settings.CACHE_DASHBOARD_TTL)
    return {"status": "success", "data": data}


@router.get("/skills/gap")
async def skill_gap(
    target_role: str = Query("Software Engineer"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    settings = get_settings()

    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == user.id)
        .order_by(Resume.created_at.desc())
        .limit(1)
    )
    latest_resume = result.scalar_one_or_none()

    resume_skills: list[str] = []
    if latest_resume and latest_resume.parsed_data:
        resume_skills = [s.get("canonical", "") for s in latest_resume.parsed_data.get("skills", [])]

    if settings.GEMINI_API_KEY:
        try:
            gaps = await gemini.analyze_skill_gap(resume_skills, target_role)
        except Exception:
            gaps = _default_gaps(resume_skills)
    else:
        gaps = _default_gaps(resume_skills)

    if not isinstance(gaps, list):
        gaps = _default_gaps(resume_skills)

    categories_map: dict[str, list[dict]] = {}
    for g in gaps:
        cat = g.get("category", "Other")
        categories_map.setdefault(cat, []).append(g)

    priority_list = [g for g in gaps if g.get("priority") in ("HIGH", "MEDIUM")]
    priority_list.sort(key=lambda x: 0 if x.get("priority") == "HIGH" else 1)

    return {
        "status": "success",
        "data": {
            "skills_found": len(resume_skills),
            "skills_required": len(resume_skills) + len(gaps),
            "gap_count": len(gaps),
            "gap_score": round(len(gaps) / max(len(resume_skills) + len(gaps), 1) * 100, 1),
            "categories": categories_map,
            "priority_list": priority_list[:10],
        },
    }


def _default_gaps(resume_skills: list[str]) -> list[dict]:
    common_skills = [
        ("System Design", "System Design", "HIGH", 90),
        ("Docker", "DevOps", "HIGH", 85),
        ("Kubernetes", "DevOps", "HIGH", 80),
        ("AWS", "Cloud", "HIGH", 88),
        ("GraphQL", "Web", "MEDIUM", 65),
        ("CI/CD", "DevOps", "MEDIUM", 78),
        ("Redis", "Database", "MEDIUM", 70),
        ("Machine Learning", "AI/ML", "LOW", 55),
    ]
    resume_set = {s.lower() for s in resume_skills}
    return [
        {
            "skill": skill,
            "category": cat,
            "priority": priority,
            "demand_pct": demand,
            "time_to_learn": "2-4 weeks",
            "current_level": 0,
            "required_level": 80,
        }
        for skill, cat, priority, demand in common_skills
        if skill.lower() not in resume_set
    ]
