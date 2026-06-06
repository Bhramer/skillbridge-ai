from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.models.user import User
from app.services.auth import get_current_user
from app.services import gemini
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/interview", tags=["interview"])


class QuestionsRequest(BaseModel):
    role: str = "Software Engineer"
    skills: list[str] = []
    categories: list[str] = ["technical", "hr", "system_design", "behavioral"]


class EvalRequest(BaseModel):
    question: str
    transcript: str


@router.post("/questions")
async def generate_questions(
    body: QuestionsRequest,
    user: User = Depends(get_current_user),
):
    if not settings.GEMINI_API_KEY:
        return {"status": "success", "questions": _mock_questions()}

    try:
        questions = await gemini.generate_interview_questions(
            body.role, body.skills, body.categories
        )
        return {"status": "success", "questions": questions}
    except Exception as e:
        raise HTTPException(500, f"Failed to generate questions: {e}")


@router.post("/evaluate")
async def evaluate_answer(
    body: EvalRequest,
    user: User = Depends(get_current_user),
):
    if not settings.GEMINI_API_KEY:
        return {
            "status": "success",
            "evaluation": {
                "confidence": 70,
                "clarity": 75,
                "relevance": 65,
                "pacing": 72,
                "feedback": "AI evaluation unavailable. Please configure your Gemini API key.",
            },
        }

    try:
        result = await gemini.evaluate_interview_answer(body.question, body.transcript)
        return {"status": "success", "evaluation": result}
    except Exception as e:
        raise HTTPException(500, f"Evaluation failed: {e}")


def _mock_questions() -> dict:
    return {
        "technical": [
            {"id": 1, "question": "Explain the virtual DOM and reconciliation in React.", "answer": "The Virtual DOM is a lightweight JavaScript representation of the actual DOM...", "difficulty": "Medium"},
            {"id": 2, "question": "What is the difference between SQL and NoSQL databases?", "answer": "SQL databases are relational with structured schemas...", "difficulty": "Easy"},
            {"id": 3, "question": "How would you optimize a slow API endpoint?", "answer": "Start by profiling to identify bottlenecks...", "difficulty": "Hard"},
        ],
        "hr": [
            {"id": 4, "question": "Tell me about yourself.", "answer": "Structure: present role, past experience, future goals...", "difficulty": "Easy"},
            {"id": 5, "question": "Why do you want to work here?", "answer": "Research the company and align your goals...", "difficulty": "Easy"},
        ],
        "system_design": [
            {"id": 6, "question": "Design a URL shortener.", "answer": "Key components: API gateway, hashing service, KV store...", "difficulty": "Hard"},
            {"id": 7, "question": "Design a real-time chat application.", "answer": "Architecture: WebSocket, message queue, Redis pub/sub...", "difficulty": "Hard"},
        ],
        "behavioral": [
            {"id": 8, "question": "Tell me about a time you led a challenging project.", "answer": "Use the STAR method...", "difficulty": "Medium"},
            {"id": 9, "question": "How do you handle tight deadlines?", "answer": "Prioritization framework: must-haves vs nice-to-haves...", "difficulty": "Easy"},
        ],
    }
