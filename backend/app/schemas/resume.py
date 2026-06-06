from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel


class ResumeUploadConfig(BaseModel):
    target_role: str = "Software Engineer"
    companies: list[str] = []
    mode: str = "full"  # full | ats | skill_gap


class ResumeAnalysisResponse(BaseModel):
    id: uuid.UUID
    ats_score: float
    sub_metrics: dict
    skills_found: list[str]
    suggestions: list[dict]
    created_at: datetime


class SkillGapResponse(BaseModel):
    skills_found: int
    skills_required: int
    gap_count: int
    gap_score: float
    categories: dict[str, list[dict]]
    priority_list: list[dict]


class DashboardResponse(BaseModel):
    ats_score: float | None
    skill_match_pct: float | None
    job_matches_count: int
    confidence_score: float | None
    skill_gap_chart: list[dict]
    jd_match_score: float | None
    skill_trends: list[dict]
    top_jobs: list[dict]
    ai_recommendations: list[dict]


class JDMatchRequest(BaseModel):
    jd_text: str


class RoadmapResponse(BaseModel):
    id: uuid.UUID
    weeks: int
    steps: list[dict]
    progress_pct: float
    project_ideas: list[str]


class RoadmapStepUpdate(BaseModel):
    status: str  # pending | in_progress | done


class InterviewQuestionsRequest(BaseModel):
    role: str
    skills: list[str] = []
    categories: list[str] = ["technical", "hr", "system_design", "behavioral"]


class InterviewEvalRequest(BaseModel):
    question: str
    transcript: str


class InterviewEvalResponse(BaseModel):
    confidence: float
    clarity: float
    relevance: float
    pacing: float
    feedback: str


class GitHubAnalysisResponse(BaseModel):
    username: str
    repos_count: int
    total_stars: int
    languages: dict[str, float]
    repos: list[dict]
    skills_detected: list[str]
    skills_missing_from_resume: list[str]


class JobSearchRequest(BaseModel):
    role: str
    location: str = "India"


class JobSearchResponse(BaseModel):
    jobs: list[dict]
    total: int


class CompanyMatchResponse(BaseModel):
    companies: list[dict]


class ResumeBuildRequest(BaseModel):
    target_role: str
    target_company: str | None = None
    user_data: dict


class ResumeBuildResponse(BaseModel):
    id: uuid.UUID
    content: dict
    ats_score: float | None


class VersionHistoryResponse(BaseModel):
    versions: list[dict]
