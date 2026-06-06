from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import create_tables
from app.services.nlp import nlp_service
from app.api.routes import router as analysis_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.resume_analyzer import router as resume_router
from app.api.github import router as github_router
from app.api.jobs import router as jobs_router
from app.api.interview import router as interview_router
from app.api.roadmap import router as roadmap_router
from app.api.builder import router as builder_router

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    # Models load on-demand on first use (lazy loading)
    # This keeps startup fast while ensuring models are ready when needed
    yield


app = FastAPI(
    title="SkillBridge AI",
    version="2.0.0",
    lifespan=lifespan,
)

# Configure CORS based on environment
cors_origins = settings.ALLOWED_ORIGINS if settings.IS_PRODUCTION else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

app.include_router(analysis_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(github_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(interview_router, prefix="/api")
app.include_router(roadmap_router, prefix="/api")
app.include_router(builder_router, prefix="/api")
