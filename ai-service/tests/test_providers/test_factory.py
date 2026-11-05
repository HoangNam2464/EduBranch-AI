"""Provider selection: the offline demo provider is never a silent fallback in production (WP-8 F2)."""

import pytest

from app.core.config import settings
from app.providers import factory
from app.providers.local_provider import LocalDemoProvider


@pytest.fixture(autouse=True)
def _reset(monkeypatch):
    factory.get_provider.cache_clear()
    yield
    factory.get_provider.cache_clear()


def _set(monkeypatch, provider: str, key: str, env: str):
    monkeypatch.setattr(settings, "ai_provider", provider)
    monkeypatch.setattr(settings, "gemini_api_key", key)
    monkeypatch.setattr(settings, "openai_api_key", key)
    monkeypatch.setattr(settings, "app_env", env)


def test_missing_key_in_development_uses_labelled_demo(monkeypatch):
    _set(monkeypatch, "gemini", "", "development")
    assert factory.active_provider_name() == "local-demo"
    assert isinstance(factory.get_provider(), LocalDemoProvider)


def test_missing_key_in_production_raises(monkeypatch):
    _set(monkeypatch, "gemini", "", "production")
    assert factory.active_provider_name() == "unconfigured"
    with pytest.raises(factory.ProviderNotConfiguredError):
        factory.get_provider()


def test_explicit_local_is_allowed_everywhere(monkeypatch):
    _set(monkeypatch, "local", "", "production")
    assert factory.active_provider_name() == "local-demo"
    assert isinstance(factory.get_provider(), LocalDemoProvider)


def test_real_key_reports_configured_provider(monkeypatch):
    _set(monkeypatch, "gemini", "test-not-a-real-key-value", "production")
    assert factory.active_provider_name() == "gemini"
    assert not factory.local_demo_active()
