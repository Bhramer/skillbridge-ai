from __future__ import annotations

import json
import hashlib
from typing import Any

import redis.asyncio as redis

from app.config import get_settings

settings = get_settings()

from typing import Optional
_redis: Optional[redis.Redis] = None
_redis_available: bool = False


async def get_redis() -> Optional[redis.Redis]:
    global _redis, _redis_available
    
    # Skip if Redis is not configured
    if not settings.REDIS_URL:
        _redis_available = False
        return None
    
    if _redis is None:
        try:
            _redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
            # Test connection
            await _redis.ping()
            _redis_available = True
        except Exception as e:
            print(f"Warning: Redis connection failed: {e}. Caching disabled.")
            _redis_available = False
            _redis = None
    
    return _redis if _redis_available else None


def _make_key(*parts: str) -> str:
    return "skillbridge:" + ":".join(parts)


def _hash_text(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


async def cache_get(key: str) -> Optional[Any]:
    try:
        r = await get_redis()
        if r is None:
            return None
        raw = await r.get(key)
        return json.loads(raw) if raw else None
    except Exception as e:
        print(f"Cache get error: {e}")
        return None


async def cache_set(key: str, value: Any, ttl: int = 3600) -> None:
    try:
        r = await get_redis()
        if r is None:
            return
        await r.setex(key, ttl, json.dumps(value, default=str))
    except Exception as e:
        print(f"Cache set error: {e}")
        pass


async def cache_delete(key: str) -> None:
    try:
        r = await get_redis()
        await r.delete(key)
    except Exception:
        pass


async def cache_delete_pattern(pattern: str) -> None:
    try:
        r = await get_redis()
        async for key in r.scan_iter(match=pattern):
            await r.delete(key)
    except Exception:
        pass


def analysis_key(user_id: str, resume_hash: str) -> str:
    return _make_key("analysis", user_id, resume_hash)


def dashboard_key(user_id: str) -> str:
    return _make_key("dashboard", user_id)


def github_key(username: str) -> str:
    return _make_key("github", username)


def jobs_key(role: str, location: str) -> str:
    return _make_key("jobs", _hash_text(f"{role}:{location}"))
