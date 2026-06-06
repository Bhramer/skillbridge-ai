from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.services.auth import get_current_user
from app.services.job_service import search_jobs
from app.services.cache import cache_get, cache_set, jobs_key
from app.config import get_settings

settings = get_settings()
router = APIRouter(tags=["jobs"])


@router.get("/jobs/search")
async def search(
    role: str = Query(...),
    location: str = Query("India"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cached = await cache_get(jobs_key(role, location))
    if cached:
        return {"status": "success", "jobs": cached, "total": len(cached), "cached": True}

    jobs = await search_jobs(role, location)

    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == user.id)
        .order_by(Resume.created_at.desc())
        .limit(1)
    )
    latest_resume = result.scalar_one_or_none()

    resume_skills: set[str] = set()
    if latest_resume and latest_resume.parsed_data:
        for s in latest_resume.parsed_data.get("skills", []):
            resume_skills.add(s.get("canonical", ""))

    for job in jobs:
        job_skills = set(job.get("skills", []))
        matched = job_skills & resume_skills
        missing = job_skills - resume_skills
        match_pct = round(len(matched) / max(len(job_skills), 1) * 100, 1)
        job["match_pct"] = match_pct
        job["matched_skills"] = sorted(matched)
        job["missing_skills"] = sorted(missing)

    jobs.sort(key=lambda j: j.get("match_pct", 0), reverse=True)
    await cache_set(jobs_key(role, location), jobs, 1800)

    return {"status": "success", "jobs": jobs, "total": len(jobs)}


@router.get("/companies/match")
async def company_match(
    role: str = Query("Software Engineer"),
    location: str = Query("India"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    jobs = await search_jobs(role, location)

    result = await db.execute(
        select(Resume)
        .where(Resume.user_id == user.id)
        .order_by(Resume.created_at.desc())
        .limit(1)
    )
    latest_resume = result.scalar_one_or_none()

    resume_skills: set[str] = set()
    if latest_resume and latest_resume.parsed_data:
        for s in latest_resume.parsed_data.get("skills", []):
            resume_skills.add(s.get("canonical", ""))

    company_data: dict[str, dict] = {}
    for job in jobs:
        company = job.get("company", "Unknown")
        job_skills = set(job.get("skills", []))
        matched = job_skills & resume_skills
        missing = job_skills - resume_skills
        partial = {s for s in resume_skills if any(s.lower() in js.lower() for js in job_skills)}

        if company not in company_data:
            company_data[company] = {
                "name": company,
                "matched_skills": set(),
                "missing_skills": set(),
                "partial_skills": set(),
                "job_count": 0,
            }

        company_data[company]["matched_skills"] |= matched
        company_data[company]["missing_skills"] |= missing
        company_data[company]["partial_skills"] |= partial
        company_data[company]["job_count"] += 1

    companies = []
    for c in company_data.values():
        total = len(c["matched_skills"]) + len(c["missing_skills"])
        match_pct = round(len(c["matched_skills"]) / max(total, 1) * 100, 1)
        companies.append({
            "name": c["name"],
            "match_pct": match_pct,
            "matched_skills": sorted(c["matched_skills"]),
            "missing_skills": sorted(c["missing_skills"]),
            "partial_skills": sorted(c["partial_skills"]),
            "job_count": c["job_count"],
        })

    companies.sort(key=lambda x: x["match_pct"], reverse=True)
    return {"status": "success", "companies": companies}
