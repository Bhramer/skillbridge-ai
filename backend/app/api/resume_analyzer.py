from __future__ import annotations

import hashlib
from dataclasses import asdict

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.analysis import Analysis
from app.services.auth import get_current_user
from app.services.parser import extract_text, clean_text
from app.services.nlp import nlp_service
from app.services.ats_scorer import compute_ats_score
from app.services import gemini
from app.services.cache import cache_get, cache_set, analysis_key
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/upload")
async def upload_resume(
    resume: UploadFile = File(...),
    target_role: str = Form("Software Engineer"),
    companies: str = Form(""),
    mode: str = Form("full"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not resume.filename:
        raise HTTPException(400, "Resume file is required")

    ext = resume.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("pdf", "docx", "doc"):
        raise HTTPException(400, f"Unsupported file type: .{ext}")

    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(400, "Uploaded file is empty")

    resume_hash = hashlib.sha256(file_bytes).hexdigest()[:16]
    cache_key = analysis_key(str(user.id), resume_hash)
    cached = await cache_get(cache_key)
    if cached:
        return {"status": "success", "analysis": cached, "cached": True}

    try:
        resume_text = extract_text(file_bytes, resume.filename)
    except Exception as e:
        raise HTTPException(400, f"Failed to parse resume: {e}")

    clean = clean_text(resume_text)
    if len(clean) < 50:
        raise HTTPException(400, "Resume text is too short to analyze")

    nlp_result = nlp_service.analyze(clean)
    skill_names = [s.canonical for s in nlp_result.skills]

    ats_result = compute_ats_score(resume_text, skill_names)

    suggestions = []
    if settings.GEMINI_API_KEY and mode in ("full", "ats"):
        try:
            suggestions = await gemini.generate_resume_suggestions(clean, target_role)
        except Exception:
            suggestions = [{"severity": "warning", "text": "AI suggestions unavailable", "category": "system"}]

    resume_record = Resume(
        user_id=user.id,
        filename=resume.filename,
        raw_text=clean,
        parsed_data={
            "skills": [asdict(s) for s in nlp_result.skills],
            "experience_years": nlp_result.experience_years,
            "education_level": nlp_result.education_level,
            "entities": nlp_result.entities,
        },
    )
    db.add(resume_record)
    await db.flush()

    result_data = {
        "ats_score": ats_result.composite_score,
        "sub_metrics": {
            "keyword_match": ats_result.keyword_score,
            "format_score": ats_result.format_score,
            "readability": ats_result.readability_score,
            "section_structure": ats_result.section_score,
        },
        "details": ats_result.sub_metrics,
        "skills_found": skill_names,
        "suggestions": suggestions if isinstance(suggestions, list) else [],
        "experience_years": nlp_result.experience_years,
        "education_level": nlp_result.education_level,
    }

    analysis_record = Analysis(
        user_id=user.id,
        resume_id=resume_record.id,
        analysis_type="resume_analysis",
        result_data=result_data,
        ats_score=ats_result.composite_score,
    )
    db.add(analysis_record)
    await db.flush()

    result_data["id"] = str(analysis_record.id)
    result_data["resume_id"] = str(resume_record.id)
    await cache_set(cache_key, result_data, settings.CACHE_ANALYSIS_TTL)

    return {"status": "success", "analysis": result_data}


@router.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select

    result = await db.execute(
        select(Analysis).where(
            Analysis.id == analysis_id,
            Analysis.user_id == user.id,
        )
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Analysis not found")

    return {
        "status": "success",
        "analysis": {
            "id": str(analysis.id),
            "ats_score": analysis.ats_score,
            **analysis.result_data,
            "created_at": analysis.created_at.isoformat(),
        },
    }
