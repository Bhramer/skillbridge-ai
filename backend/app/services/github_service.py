from __future__ import annotations

import httpx

from app.config import get_settings
from app.services.nlp import nlp_service

settings = get_settings()
_BASE = "https://api.github.com"


def _headers() -> dict:
    h = {"Accept": "application/vnd.github.v3+json"}
    if settings.GITHUB_TOKEN:
        h["Authorization"] = f"token {settings.GITHUB_TOKEN}"
    return h


async def fetch_github_profile(username: str) -> dict:
    async with httpx.AsyncClient(timeout=15) as client:
        user_resp = await client.get(f"{_BASE}/users/{username}", headers=_headers())
        if user_resp.status_code == 404:
            raise ValueError(f"GitHub user '{username}' not found")
        user_resp.raise_for_status()
        user_data = user_resp.json()

        repos_resp = await client.get(
            f"{_BASE}/users/{username}/repos",
            headers=_headers(),
            params={"sort": "updated", "per_page": 30, "type": "owner"},
        )
        repos_resp.raise_for_status()
        repos_data = repos_resp.json()

    total_stars = sum(r.get("stargazers_count", 0) for r in repos_data)

    language_bytes: dict[str, int] = {}
    for repo in repos_data:
        lang = repo.get("language")
        if lang:
            language_bytes[lang] = language_bytes.get(lang, 0) + repo.get("size", 0)

    total_bytes = sum(language_bytes.values()) or 1
    languages = {
        lang: round(bytes_count / total_bytes * 100, 1)
        for lang, bytes_count in sorted(language_bytes.items(), key=lambda x: -x[1])
    }

    all_skills: set[str] = set()
    repo_details = []
    for repo in repos_data[:20]:
        desc = (repo.get("description") or "") + " " + (repo.get("language") or "")
        topics = repo.get("topics", [])
        search_text = desc + " " + " ".join(topics)
        detected = nlp_service.extract_skills(search_text)
        skill_names = [s.canonical for s in detected]
        all_skills.update(skill_names)

        repo_details.append({
            "name": repo["name"],
            "stars": repo.get("stargazers_count", 0),
            "language": repo.get("language"),
            "updated": repo.get("updated_at", ""),
            "description": repo.get("description", ""),
            "url": repo.get("html_url", ""),
            "skills": skill_names,
        })

    return {
        "username": username,
        "avatar_url": user_data.get("avatar_url", ""),
        "bio": user_data.get("bio", ""),
        "repos_count": user_data.get("public_repos", len(repos_data)),
        "total_stars": total_stars,
        "followers": user_data.get("followers", 0),
        "languages": languages,
        "repos": repo_details,
        "skills_detected": sorted(all_skills),
    }
