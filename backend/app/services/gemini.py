from __future__ import annotations

import json
import re
from typing import Any

from google import genai

from app.config import get_settings

settings = get_settings()

from typing import Optional
_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


def _parse_json_response(text: str) -> Any:
    cleaned = re.sub(r"```json\s*", "", text)
    cleaned = re.sub(r"```\s*$", "", cleaned)
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"raw": text}


async def generate_resume_suggestions(resume_text: str, target_role: str) -> list[dict]:
    client = _get_client()
    prompt = f"""Analyze this resume for a "{target_role}" position and provide ATS improvement suggestions.

Resume:
{resume_text[:4000]}

Return a JSON array of suggestions, each with:
- "severity": "error" | "warning" | "success"
- "text": the suggestion text
- "category": "keywords" | "format" | "content" | "structure"

Focus on:
1. Missing keywords for the target role
2. Formatting issues that hurt ATS parsing
3. Content improvements (quantified achievements, action verbs)
4. Structural issues (section order, missing sections)

Return ONLY the JSON array, no other text."""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
    )
    return _parse_json_response(response.text)


async def generate_learning_roadmap(skills_gap: list[dict], target_role: str) -> dict:
    client = _get_client()
    gap_summary = json.dumps(skills_gap[:15], indent=2)

    prompt = f"""Create a 12-week learning roadmap for someone targeting a "{target_role}" role.

Their skill gaps:
{gap_summary}

Return a JSON object with:
{{
  "weeks": 12,
  "steps": [
    {{
      "id": 1,
      "week": 1,
      "title": "Step title",
      "skill": "Skill name",
      "description": "What to learn",
      "resources": ["Resource 1", "Resource 2"],
      "duration": "1 week",
      "status": "pending"
    }}
  ],
  "project_ideas": ["Project 1", "Project 2", "Project 3"]
}}

Prioritize high-demand skills first. Include practical project ideas.
Return ONLY the JSON, no other text."""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
    )
    return _parse_json_response(response.text)


async def generate_interview_questions(role: str, skills: list[str], categories: list[str]) -> dict:
    client = _get_client()
    prompt = f"""Generate interview questions for a "{role}" position.
Skills: {', '.join(skills[:10])}
Categories needed: {', '.join(categories)}

Return a JSON object with keys for each category, each containing an array of questions:
{{
  "technical": [
    {{"id": 1, "question": "...", "answer": "...", "difficulty": "Easy|Medium|Hard"}}
  ],
  "hr": [...],
  "system_design": [...],
  "behavioral": [...]
}}

Generate 3-4 questions per category with detailed model answers.
Return ONLY the JSON, no other text."""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
    )
    return _parse_json_response(response.text)


async def evaluate_interview_answer(question: str, transcript: str) -> dict:
    client = _get_client()
    prompt = f"""Evaluate this interview answer.

Question: {question}

Candidate's Answer: {transcript}

Return a JSON object:
{{
  "confidence": <0-100>,
  "clarity": <0-100>,
  "relevance": <0-100>,
  "pacing": <0-100>,
  "feedback": "Detailed feedback paragraph"
}}

Score each dimension honestly. Provide constructive feedback.
Return ONLY the JSON, no other text."""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
    )
    return _parse_json_response(response.text)


async def build_resume(user_data: dict, target_role: str, target_company: Optional[str] = None) -> dict:
    client = _get_client()
    company_line = f' at "{target_company}"' if target_company else ""
    prompt = f"""Restructure and optimize this resume data for a "{target_role}" position{company_line}.

User data:
{json.dumps(user_data, indent=2)[:3000]}

Return a JSON object with the optimized resume:
{{
  "name": "...",
  "title": "Optimized title for target role",
  "summary": "ATS-optimized professional summary",
  "experience": [
    {{
      "company": "...",
      "role": "...",
      "period": "...",
      "bullets": ["Achievement-focused bullet with metrics"]
    }}
  ],
  "education": {{"school": "...", "degree": "...", "year": "..."}},
  "skills": ["Skill 1", "Skill 2"],
  "certifications": []
}}

Optimize for ATS: use keywords relevant to the target role, quantify achievements, use action verbs.
Return ONLY the JSON, no other text."""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
    )
    return _parse_json_response(response.text)


async def analyze_skill_gap(resume_skills: list[str], target_role: str) -> list[dict]:
    client = _get_client()
    prompt = f"""Analyze skill gaps for someone with these skills targeting a "{target_role}" role.

Current skills: {', '.join(resume_skills[:30])}

Return a JSON array of skill gaps:
[
  {{
    "skill": "Skill name",
    "category": "AI/ML" | "Web" | "DevOps" | "Database" | "System Design" | "Cloud" | "Other",
    "priority": "HIGH" | "MEDIUM" | "LOW",
    "demand_pct": 85,
    "time_to_learn": "2-4 weeks",
    "current_level": 0,
    "required_level": 80
  }}
]

Include both missing skills and skills that need improvement.
Return ONLY the JSON array, no other text."""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
    )
    return _parse_json_response(response.text)


async def generate_dashboard_recommendations(
    ats_score: float | None, skills: list[str], target_role: str
) -> list[dict]:
    client = _get_client()
    prompt = f"""Give 3-5 actionable career recommendations for someone targeting "{target_role}".

Their ATS score: {ats_score or 'not yet analyzed'}
Their skills: {', '.join(skills[:20])}

Return a JSON array:
[
  {{"text": "recommendation text", "priority": "high|medium|low", "category": "skills|resume|interview|jobs"}}
]

Return ONLY the JSON array, no other text."""

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
    )
    return _parse_json_response(response.text)
