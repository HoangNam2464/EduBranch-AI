"""
EduBranch AI — AI Service health endpoint smoke test.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health():
    """Verify GET /health returns 200 and expected structure."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert "service" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_health_reports_provider_and_model_without_secrets():
    """Spec 007 AC-A8: the Gateway shows provider and model on 10.7; no key is exposed."""
    from app.core.config import settings

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")

    data = response.json()
    expected = settings.gemini_model if settings.ai_provider == "gemini" else settings.openai_model
    assert data["provider"] == settings.ai_provider
    assert data["model"] == expected
    body = response.text.lower()
    assert "api_key" not in body and "apikey" not in body
