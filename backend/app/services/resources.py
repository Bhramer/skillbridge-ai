from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from app.services.nlp import AnalysisResult, SkillMatch

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"

_MUST_HAVE_SIGNALS = [
    "required", "must have", "must-have", "essential", "mandatory",
    "minimum", "strong", "proven", "deep knowledge", "expertise",
    "proficient", "proficiency",
]
_NICE_TO_HAVE_SIGNALS = [
    "nice to have", "nice-to-have", "preferred", "bonus", "plus",
    "desirable", "familiarity", "exposure", "a plus", "advantageous",
]

_SENIORITY_MAP = {
    "intern": "Intern",
    "internship": "Intern",
    "junior": "Junior",
    "entry level": "Junior",
    "entry-level": "Junior",
    "associate": "Junior",
    "mid": "Mid-Level",
    "mid-level": "Mid-Level",
    "intermediate": "Mid-Level",
    "senior": "Senior",
    "sr.": "Senior",
    "lead": "Lead",
    "tech lead": "Lead",
    "team lead": "Lead",
    "principal": "Principal",
    "staff": "Staff",
    "architect": "Architect",
    "manager": "Manager",
    "engineering manager": "Manager",
    "director": "Director",
    "vp": "VP",
    "head of": "Head",
    "cto": "CTO",
}


@dataclass
class Resource:
    title: str
    url: str
    type: str
    platform: str
    difficulty: str


@dataclass
class SkillResources:
    skill: str
    category: str
    importance: str
    resources: list[Resource] = field(default_factory=list)


@dataclass
class JDAnalysisResult:
    skills_must_have: list[str] = field(default_factory=list)
    skills_nice_to_have: list[str] = field(default_factory=list)
    all_skills: list[SkillMatch] = field(default_factory=list)
    seniority: str = "Not specified"
    experience_years: int | None = None
    education_level: str | None = None
    skill_resources: list[SkillResources] = field(default_factory=list)


class ResourceService:
    def __init__(self):
        self._resources: dict[str, list[dict]] = {}
        self._loaded = False

    def _ensure_loaded(self):
        if self._loaded:
            return
        with open(_DATA_DIR / "resources.json") as f:
            self._resources = json.load(f)
        self._loaded = True

    def get_resources(self, skill_name: str) -> list[Resource]:
        self._ensure_loaded()
        entries = self._resources.get(skill_name, [])
        return [
            Resource(
                title=e["title"],
                url=e["url"],
                type=e["type"],
                platform=e["platform"],
                difficulty=e["difficulty"],
            )
            for e in entries
        ]

    def classify_importance(self, skill_name: str, jd_text: str) -> str:
        import re as _re
        jd_lower = jd_text.lower()
        skill_lower = skill_name.lower()

        if skill_lower not in jd_lower:
            return "must-have"

        sentences = _re.split(r"[.!?\n;]", jd_lower)

        for sentence in sentences:
            if skill_lower not in sentence:
                continue
            for signal in _NICE_TO_HAVE_SIGNALS:
                if signal in sentence:
                    return "nice-to-have"

        return "must-have"

    def detect_seniority(self, jd_text: str) -> str:
        jd_lower = jd_text.lower()
        for keyword, level in sorted(_SENIORITY_MAP.items(), key=lambda x: len(x[0]), reverse=True):
            if keyword in jd_lower:
                return level
        return "Not specified"

    def analyze_jd(self, analysis: AnalysisResult, jd_text: str) -> JDAnalysisResult:
        self._ensure_loaded()

        must_have = []
        nice_to_have = []

        for skill in analysis.skills:
            importance = self.classify_importance(skill.canonical, jd_text)
            if importance == "nice-to-have":
                nice_to_have.append(skill.canonical)
            else:
                must_have.append(skill.canonical)

        skill_resources = []
        for skill in analysis.skills:
            importance = "must-have" if skill.canonical in must_have else "nice-to-have"
            resources = self.get_resources(skill.canonical)
            skill_resources.append(
                SkillResources(
                    skill=skill.canonical,
                    category=skill.category,
                    importance=importance,
                    resources=resources,
                )
            )

        skill_resources.sort(key=lambda sr: (0 if sr.importance == "must-have" else 1, sr.skill))

        return JDAnalysisResult(
            skills_must_have=must_have,
            skills_nice_to_have=nice_to_have,
            all_skills=analysis.skills,
            seniority=self.detect_seniority(jd_text),
            experience_years=analysis.experience_years,
            education_level=analysis.education_level,
            skill_resources=skill_resources,
        )


resource_service = ResourceService()
