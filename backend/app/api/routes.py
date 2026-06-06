from __future__ import annotations

from dataclasses import asdict

from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from pydantic import BaseModel

from app.services.parser import extract_text, clean_text
from app.services.nlp import nlp_service
from app.services.matcher import compute_match
from app.services.resources import resource_service

router = APIRouter()


class JDRequest(BaseModel):
    jd_text: str


@router.post("/analyze/match")
async def analyze_match(
    resume: UploadFile = File(...),
    jd_text: str = Form(...),
):
    if not resume.filename:
        raise HTTPException(400, "Resume file is required")

    ext = resume.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("pdf", "docx", "doc"):
        raise HTTPException(400, f"Unsupported file type: .{ext}. Use PDF or DOCX.")

    file_bytes = await resume.read()
    if len(file_bytes) == 0:
        raise HTTPException(400, "Uploaded file is empty")

    try:
        resume_text = extract_text(file_bytes, resume.filename)
    except Exception as e:
        raise HTTPException(400, f"Failed to parse resume: {e}")

    resume_text = clean_text(resume_text)
    jd_clean = clean_text(jd_text)

    if len(jd_clean) < 20:
        raise HTTPException(400, "Job description is too short")

    resume_analysis = nlp_service.analyze(resume_text)
    jd_analysis = nlp_service.analyze(jd_clean)
    match_result = compute_match(resume_analysis, jd_analysis)

    return {
        "status": "success",
        "match": asdict(match_result),
        "resume_skills_count": len(resume_analysis.skills),
        "jd_skills_count": len(jd_analysis.skills),
    }


@router.post("/analyze/jd")
async def analyze_jd(body: JDRequest):
    jd_clean = clean_text(body.jd_text)

    if len(jd_clean) < 20:
        raise HTTPException(400, "Job description is too short")

    jd_analysis = nlp_service.analyze(jd_clean)
    jd_result = resource_service.analyze_jd(jd_analysis, jd_clean)

    return {
        "status": "success",
        "analysis": asdict(jd_result),
    }


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "models_loaded": nlp_service.nlp is not None and nlp_service.embedder is not None,
    }
