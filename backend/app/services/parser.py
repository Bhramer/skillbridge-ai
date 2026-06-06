import io
import re

import pdfplumber
from docx import Document


SECTION_HEADERS = [
    "education", "experience", "work experience", "professional experience",
    "employment", "skills", "technical skills", "core competencies",
    "projects", "certifications", "certificates", "awards", "honors",
    "summary", "objective", "profile", "about", "interests", "hobbies",
    "publications", "languages", "references", "volunteer",
]

_HEADER_PATTERN = re.compile(
    r"^[\s]*(" + "|".join(SECTION_HEADERS) + r")[\s:]*$",
    re.IGNORECASE | re.MULTILINE,
)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    if ext in ("docx", "doc"):
        return extract_text_from_docx(file_bytes)
    raise ValueError(f"Unsupported file type: .{ext}")


def detect_sections(text: str) -> dict[str, str]:
    """Split resume text into named sections based on common header patterns."""
    positions: list[tuple[int, str]] = []
    for m in _HEADER_PATTERN.finditer(text):
        positions.append((m.start(), m.group(1).strip().lower()))

    if not positions:
        return {"full_text": text}

    sections: dict[str, str] = {}

    if positions[0][0] > 0:
        sections["header"] = text[: positions[0][0]].strip()

    for i, (start, name) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(text)
        header_end = text.index("\n", start) + 1 if "\n" in text[start:end] else start + len(name)
        sections[name] = text[header_end:end].strip()

    return sections


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s.,;:!?@#$%&*()+=\-/\\'\"]", "", text)
    return text.strip()
