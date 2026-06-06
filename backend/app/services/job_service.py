from __future__ import annotations

import httpx

from app.config import get_settings
from app.services.nlp import nlp_service

JOOBLE_URL = "https://jooble.org/api/"
REMOTIVE_URL = "https://remotive.com/api/remote-jobs"


async def search_jobs(role: str, location: str = "India") -> list[dict]:
    settings = get_settings()

    if settings.JOOBLE_API_KEY:
        jobs = await _search_jooble(role, location, settings.JOOBLE_API_KEY)
        if jobs:
            return jobs

    jobs = await _search_remotive(role)
    if jobs:
        return jobs

    return _generate_role_based_jobs(role, location)


async def _search_jooble(role: str, location: str, api_key: str) -> list[dict]:
    url = f"{JOOBLE_URL}{api_key}"
    payload = {"keywords": role, "location": location, "page": 1}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []

    return _process_job_results(data.get("jobs", [])[:20], location)


async def _search_remotive(role: str) -> list[dict]:
    """Free API, no key needed. Returns remote tech jobs."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(REMOTIVE_URL, params={"search": role, "limit": 15})
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []

    jobs = []
    for item in data.get("jobs", [])[:15]:
        tags = item.get("tags", [])
        desc = item.get("description", "")[:500] + " " + " ".join(tags)
        detected = nlp_service.extract_skills(desc)
        skill_names = [s.canonical for s in detected]

        salary = item.get("salary", "")
        if not salary:
            salary = "Not disclosed"

        jobs.append({
            "title": item.get("title", ""),
            "company": item.get("company_name", "Unknown"),
            "location": item.get("candidate_required_location", "Remote"),
            "salary": salary,
            "url": item.get("url", ""),
            "snippet": item.get("description", "")[:200].replace("<br>", " ").replace("<p>", " ").replace("</p>", " ").strip(),
            "skills": skill_names,
            "source": "Remotive",
        })

    return jobs


def _process_job_results(raw_jobs: list[dict], location: str) -> list[dict]:
    jobs = []
    for item in raw_jobs:
        snippet = item.get("snippet", "") + " " + item.get("title", "")
        detected = nlp_service.extract_skills(snippet)
        skill_names = [s.canonical for s in detected]

        jobs.append({
            "title": item.get("title", ""),
            "company": item.get("company", "Unknown"),
            "location": item.get("location", location),
            "salary": item.get("salary", "Not disclosed"),
            "url": item.get("link", ""),
            "snippet": item.get("snippet", ""),
            "updated": item.get("updated", ""),
            "skills": skill_names,
            "source": "Jooble",
        })

    return jobs


def _generate_role_based_jobs(role: str, location: str) -> list[dict]:
    """Dynamic fallback that generates realistic job data based on role."""
    role_lower = role.lower()

    skill_maps = {
        "frontend": ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Next.js", "Tailwind CSS", "Redux"],
        "backend": ["Python", "Java", "Node.js", "PostgreSQL", "Redis", "Docker", "REST", "GraphQL"],
        "fullstack": ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS", "Git", "REST"],
        "data": ["Python", "SQL", "Pandas", "Machine Learning", "TensorFlow", "Apache Spark", "Airflow"],
        "devops": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Linux", "Jenkins", "Prometheus"],
        "mobile": ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Firebase"],
        "ml": ["Python", "TensorFlow", "PyTorch", "NLP", "Machine Learning", "Deep Learning", "scikit-learn"],
    }

    matched_key = "fullstack"
    for key in skill_maps:
        if key in role_lower:
            matched_key = key
            break

    skills = skill_maps[matched_key]

    companies = [
        {"name": "Google", "salary": "25-45 LPA"},
        {"name": "Microsoft", "salary": "22-40 LPA"},
        {"name": "Amazon", "salary": "20-38 LPA"},
        {"name": "Flipkart", "salary": "18-32 LPA"},
        {"name": "Razorpay", "salary": "15-28 LPA"},
        {"name": "PhonePe", "salary": "14-26 LPA"},
        {"name": "Swiggy", "salary": "12-24 LPA"},
        {"name": "Zerodha", "salary": "16-30 LPA"},
        {"name": "CRED", "salary": "18-35 LPA"},
        {"name": "Atlassian", "salary": "22-42 LPA"},
    ]

    jobs = []
    prefixes = ["Senior", "", "Lead", "Staff", "Principal"]
    for i, company in enumerate(companies):
        prefix = prefixes[i % len(prefixes)]
        title = f"{prefix} {role}".strip()
        job_skills = skills[: 4 + (i % 3)] + (["System Design"] if i % 3 == 0 else [])

        jobs.append({
            "title": title,
            "company": company["name"],
            "location": location,
            "salary": company["salary"],
            "url": f"https://www.google.com/search?q={company['name']}+{role}+jobs",
            "snippet": f"{company['name']} is hiring a {title}. Join our engineering team and build products used by millions.",
            "skills": job_skills,
            "source": "Generated",
        })

    return jobs
