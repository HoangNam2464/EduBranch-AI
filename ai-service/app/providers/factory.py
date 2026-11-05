"""
EduBranch AI — LLM Provider Factory.

Returns the configured provider based on the AI_PROVIDER environment variable.
Use this factory in route handlers and services — never instantiate providers directly.
"""

from functools import lru_cache

from app.core.config import settings
from app.core.logging import logger
from app.providers.base import BaseLLMProvider


def has_real_provider_key() -> bool:
    """True when the configured remote provider has a usable API key."""
    if settings.ai_provider == "openai":
        key = settings.openai_api_key
    elif settings.ai_provider == "gemini":
        key = settings.gemini_api_key
    else:
        return False
    return bool(key) and not key.startswith("ci-")


@lru_cache(maxsize=1)
def get_provider() -> BaseLLMProvider:
    """
    Returns the active LLM provider singleton.

    Configure via: AI_PROVIDER=openai|gemini|local in .env.
    If the remote provider has no API key, the offline LocalDemoProvider is used instead.
    """
    if settings.ai_provider == "local" or not has_real_provider_key():
        from app.providers.local_provider import LocalDemoProvider
        logger.warning("ai_provider_local_demo", configured=settings.ai_provider)
        return LocalDemoProvider()
    if settings.ai_provider == "openai":
        from app.providers.openai_provider import OpenAIProvider
        return OpenAIProvider()
    if settings.ai_provider == "gemini":
        from app.providers.gemini_provider import GeminiProvider
        return GeminiProvider()
    raise ValueError(f"Unknown AI provider: {settings.ai_provider}")
