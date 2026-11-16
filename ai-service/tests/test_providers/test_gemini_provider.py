"""GeminiProvider embedding calls (BE-010/BE-011 fix, 2026-11-16).

Google retired text-embedding-004 (embedContent returns 404) and the SDK needs a
"models/<id>" resource name. Embeddings must stay 768-dim for document_chunks.
No network: google.generativeai.embed_content_async is mocked.
"""
from unittest.mock import AsyncMock, patch

import pytest

from app.core.config import settings
from app.providers import gemini_provider
from app.providers.gemini_provider import GeminiProvider, _model_path


def test_model_path_adds_models_prefix_once():
    assert _model_path("gemini-embedding-001") == "models/gemini-embedding-001"
    assert _model_path("models/gemini-embedding-001") == "models/gemini-embedding-001"
    assert _model_path(" tunedModels/x ") == "tunedModels/x"


def test_default_embedding_model_is_not_the_retired_one():
    assert "text-embedding-004" not in settings.gemini_embedding_model


@pytest.fixture
def provider(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test-key-not-called")
    monkeypatch.setattr(settings, "gemini_embedding_model", "gemini-embedding-001")
    with patch.object(gemini_provider.genai, "configure"):
        yield GeminiProvider()


@pytest.mark.asyncio
async def test_single_embedding_requests_768_dims_with_resource_name(provider):
    mock = AsyncMock(return_value={"embedding": [0.1] * 768})
    with patch.object(gemini_provider.genai, "embed_content_async", mock):
        vec = await provider.generate_embedding("xin chào")
    assert len(vec) == 768
    kwargs = mock.await_args.kwargs
    assert kwargs["model"] == "models/gemini-embedding-001"
    assert kwargs["output_dimensionality"] == 768
    assert kwargs["content"] == "xin chào"


@pytest.mark.asyncio
async def test_batch_embedding_requests_768_dims_with_resource_name(provider):
    mock = AsyncMock(return_value={"embedding": [[0.1] * 768, [0.2] * 768]})
    with patch.object(gemini_provider.genai, "embed_content_async", mock):
        vecs = await provider.generate_embeddings_batch(["a", "b"])
    assert [len(v) for v in vecs] == [768, 768]
    kwargs = mock.await_args.kwargs
    assert kwargs["model"] == "models/gemini-embedding-001"
    assert kwargs["output_dimensionality"] == 768
    assert kwargs["content"] == ["a", "b"]


@pytest.mark.asyncio
async def test_batch_fallback_to_single_items_keeps_768_dims(provider):
    calls = []

    async def fake(**kwargs):
        calls.append(kwargs)
        if isinstance(kwargs["content"], list):
            raise RuntimeError("batch payload rejected")
        return {"embedding": [0.3] * 768}

    with patch.object(gemini_provider.genai, "embed_content_async", side_effect=fake):
        vecs = await provider.generate_embeddings_batch(["a", "b"])
    assert len(vecs) == 2
    assert all(c["output_dimensionality"] == 768 and c["model"] == "models/gemini-embedding-001" for c in calls)
