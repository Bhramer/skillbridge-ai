from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.services.auth import get_current_user
from app.services import gemini
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/roadmap", tags=["roadmap"])


class GenerateRequest(BaseModel):
    target_role: str = "Software Engineer"
    skills_gap: list[dict] = []


class StepUpdate(BaseModel):
    status: str


@router.post("/generate")
async def generate_roadmap(
    body: GenerateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.GEMINI_API_KEY:
        return {"status": "success", "roadmap": _mock_roadmap()}

    try:
        roadmap = await gemini.generate_learning_roadmap(body.skills_gap, body.target_role)
    except Exception as e:
        raise HTTPException(500, f"Failed to generate roadmap: {e}")

    analysis = Analysis(
        user_id=user.id,
        analysis_type="roadmap",
        result_data=roadmap,
    )
    db.add(analysis)
    await db.flush()

    roadmap["id"] = str(analysis.id)
    return {"status": "success", "roadmap": roadmap}


@router.get("/{roadmap_id}")
async def get_roadmap(
    roadmap_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Analysis).where(
            Analysis.id == roadmap_id,
            Analysis.user_id == user.id,
            Analysis.analysis_type == "roadmap",
        )
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Roadmap not found")

    data = analysis.result_data
    steps = data.get("steps", [])
    done = sum(1 for s in steps if s.get("status") == "done")
    progress = round(done / max(len(steps), 1) * 100, 1)
    data["progress_pct"] = progress
    data["id"] = str(analysis.id)

    return {"status": "success", "roadmap": data}


@router.patch("/{roadmap_id}/steps/{step_id}")
async def update_step(
    roadmap_id: str,
    step_id: int,
    body: StepUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Analysis).where(
            Analysis.id == roadmap_id,
            Analysis.user_id == user.id,
            Analysis.analysis_type == "roadmap",
        )
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(404, "Roadmap not found")

    steps = analysis.result_data.get("steps", [])
    for step in steps:
        if step.get("id") == step_id:
            step["status"] = body.status
            break
    else:
        raise HTTPException(404, "Step not found")

    from sqlalchemy.orm.attributes import flag_modified
    analysis.result_data["steps"] = steps
    flag_modified(analysis, "result_data")

    return {"status": "success", "message": "Step updated"}


def _mock_roadmap() -> dict:
    return {
        "weeks": 12,
        "steps": [
            {"id": 1, "week": 1, "title": "System Design Fundamentals", "skill": "System Design", "description": "Learn basic system design concepts", "resources": ["Grokking System Design"], "duration": "2 weeks", "status": "pending"},
            {"id": 2, "week": 3, "title": "Docker & Containerization", "skill": "Docker", "description": "Master containerization", "resources": ["Docker docs", "Docker in Practice"], "duration": "2 weeks", "status": "pending"},
            {"id": 3, "week": 5, "title": "Kubernetes Essentials", "skill": "Kubernetes", "description": "Container orchestration", "resources": ["K8s docs", "CKA course"], "duration": "3 weeks", "status": "pending"},
            {"id": 4, "week": 8, "title": "Cloud (AWS)", "skill": "AWS", "description": "AWS fundamentals and services", "resources": ["AWS Free Tier", "AWS Certified Cloud Practitioner"], "duration": "3 weeks", "status": "pending"},
            {"id": 5, "week": 11, "title": "Advanced Topics", "skill": "GraphQL", "description": "Modern API design", "resources": ["GraphQL docs", "Apollo tutorials"], "duration": "2 weeks", "status": "pending"},
        ],
        "project_ideas": [
            "Build a microservices app with Docker + K8s",
            "Deploy a full-stack app on AWS",
            "Create a real-time GraphQL API",
        ],
    }
