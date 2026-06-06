from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.services.auth import get_current_user
from app.services.github_service import fetch_github_profile
from app.services.cache import cache_get, cache_set, github_key
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/github", tags=["github"])


@router.get("/{username}")
async def analyze_github(
    username: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cached = await cache_get(github_key(username))
    if cached:
        return {"status": "success", "data": cached, "cached": True}

    try:
        profile = await fetch_github_profile(username)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        raise HTTPException(502, f"Failed to fetch GitHub data: {e}")

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

    github_skills = set(profile.get("skills_detected", []))
    missing_from_resume = sorted(github_skills - resume_skills) if resume_skills else []

    profile["skills_missing_from_resume"] = missing_from_resume
    await cache_set(github_key(username), profile, settings.CACHE_GITHUB_TTL)

    return {"status": "success", "data": profile}
