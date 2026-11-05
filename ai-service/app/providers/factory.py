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


class ProviderNotConfiguredError(RuntimeError):
    """The configured remote provider has no API key and the demo fallback is not allowed."""


def local_demo_active() -> bool:
    """True when the offline LocalDemoProvider serves requests.

    Explicit with AI_PROVIDER=local. As a fallback for a missing key only outside production.
    """
    if settings.ai_provider == "local":
        return True
    return not has_real_provider_key() and settings.app_env != "production"


def active_provider_name() -> str:
    """Provider actually in use, for /health: local-demo, unconfigured, or the configured name."""
    if local_demo_active():
        return "local-demo"
    if not has_real_provider_key():
        return "unconfigured"
    return settings.ai_provider


@lru_cache(maxsize=1)
def get_provider() -> BaseLLMProvider:
    """
    Returns the active LLM provider singleton.

    Configure via: AI_PROVIDER=openai|gemini|local in .env.
    Without an API key the offline LocalDemoProvider is used, except when APP_ENV=production,
    where ProviderNotConfiguredError is raised instead.
    """
    if not local_demo_active() and not has_real_provider_key():
        raise ProviderNotConfiguredError(
            f"AI_PROVIDER={settings.ai_provider} has no API key and APP_ENV=production forbids the demo fallback"
        )
    if local_demo_active():
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
