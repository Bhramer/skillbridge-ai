from __future__ import annotations

import json
import re
from pathlib import Path
from dataclasses import dataclass, field

import spacy
from sentence_transformers import SentenceTransformer

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"

_EXPERIENCE_PATTERN = re.compile(
    r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?",
    re.IGNORECASE,
)

_DATE_RANGE_PATTERN = re.compile(
    r"((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*[\s,]*\d{4})"
    r"\s*[-–—to]+\s*"
    r"((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*[\s,]*\d{4}|present|current|now)",
    re.IGNORECASE,
)

_EDUCATION_LEVELS = {
    "phd": 5, "ph.d": 5, "doctorate": 5,
    "master": 4, "m.s.": 4, "m.sc": 4, "mba": 4, "m.tech": 4,
    "bachelor": 3, "b.s.": 3, "b.sc": 3, "b.tech": 3, "b.e.": 3,
    "associate": 2, "a.s.": 2, "diploma": 1,
}


@dataclass
class SkillMatch:
    canonical: str
    category: str
    matched_term: str


@dataclass
class AnalysisResult:
    skills: list[SkillMatch] = field(default_factory=list)
    experience_years: int | None = None
    education_level: str | None = None
    entities: dict[str, list[str]] = field(default_factory=dict)
    raw_text: str = ""


class NLPService:
    def __init__(self):
        self._nlp = None
        self._embedder = None
        self._skills_taxonomy: dict[str, dict[str, list[str]]] = {}
        self._skill_lookup: dict[str, tuple[str, str]] = {}
        self._models_loaded = False

    @property
    def nlp(self):
        """Lazy load spacy model on first access"""
        if self._nlp is None:
            print("Loading spacy model 'en_core_web_sm'...")
            self._nlp = spacy.load("en_core_web_sm")
        return self._nlp
    
    @property
    def embedder(self):
        """Lazy load sentence transformer on first access"""
        if self._embedder is None:
            print("Loading SentenceTransformer 'all-MiniLM-L6-v2'...")
            self._embedder = SentenceTransformer("all-MiniLM-L6-v2")
        return self._embedder

    def load_models(self):
        """Explicitly load models (for preloading if needed)"""
        if not self._models_loaded:
            _ = self.nlp  # Trigger lazy loading
            _ = self.embedder  # Trigger lazy loading
            self._load_skills_taxonomy()
            self._models_loaded = True

    def _load_skills_taxonomy(self):
        with open(_DATA_DIR / "skills.json") as f:
            self._skills_taxonomy = json.load(f)
        self._skill_lookup = {}
        for category, skills in self._skills_taxonomy.items():
            for canonical, aliases in skills.items():
                self._skill_lookup[canonical.lower()] = (canonical, category)
                for alias in aliases:
                    self._skill_lookup[alias.lower()] = (canonical, category)

    def extract_skills(self, text: str) -> list[SkillMatch]:
        # Ensure taxonomy is loaded
        if not self._skill_lookup:
            self._load_skills_taxonomy()
        
        text_lower = text.lower()
        found: dict[str, SkillMatch] = {}

        sorted_terms = sorted(self._skill_lookup.keys(), key=len, reverse=True)
        for term in sorted_terms:
            canonical, category = self._skill_lookup[term]
            if canonical in found:
                continue
            pattern = re.compile(r"(?<![a-zA-Z])" + re.escape(term) + r"(?![a-zA-Z])", re.IGNORECASE)
            if pattern.search(text_lower):
                found[canonical] = SkillMatch(
                    canonical=canonical,
                    category=category,
                    matched_term=term,
                )
        return list(found.values())

    def extract_experience_years(self, text: str) -> int | None:
        matches = _EXPERIENCE_PATTERN.findall(text)
        if matches:
            return max(int(y) for y in matches)

        date_ranges = _DATE_RANGE_PATTERN.findall(text)
        if date_ranges:
            total = 0
            for start_str, end_str in date_ranges:
                try:
                    start_year = int(re.search(r"\d{4}", start_str).group())
                    if end_str.lower() in ("present", "current", "now"):
                        end_year = 2026
                    else:
                        end_year = int(re.search(r"\d{4}", end_str).group())
                    total += max(0, end_year - start_year)
                except (AttributeError, ValueError):
                    continue
            return total if total > 0 else None
        return None

    def detect_education_level(self, text: str) -> str | None:
        text_lower = text.lower()
        best_level = 0
        best_name = None
        for keyword, level in _EDUCATION_LEVELS.items():
            if keyword in text_lower and level > best_level:
                best_level = level
                best_name = keyword
        level_names = {5: "PhD", 4: "Master's", 3: "Bachelor's", 2: "Associate's", 1: "Diploma"}
        return level_names.get(best_level)

    def extract_entities(self, text: str) -> dict[str, list[str]]:
        doc = self.nlp(text[:100000])
        entities: dict[str, set[str]] = {}
        for ent in doc.ents:
            label = ent.label_
            if label in ("ORG", "GPE", "DATE", "PERSON"):
                entities.setdefault(label, set()).add(ent.text.strip())
        return {k: list(v) for k, v in entities.items()}

    def embed(self, texts: list[str]):
        return self.embedder.encode(texts, normalize_embeddings=True)

    def analyze(self, text: str) -> AnalysisResult:
        return AnalysisResult(
            skills=self.extract_skills(text),
            experience_years=self.extract_experience_years(text),
            education_level=self.detect_education_level(text),
            entities=self.extract_entities(text),
            raw_text=text,
        )


nlp_service = NLPService()
