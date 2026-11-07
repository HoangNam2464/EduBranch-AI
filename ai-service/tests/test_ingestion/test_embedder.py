"""
EduBranch AI — Unit Tests for Document Embedder Service [BE-010].

Tests vector embedding generation, provider abstraction compliance, and batching:
  - Gemini text-embedding-004 (768-dim) and OpenAI (1536-dim) support (AC-1)
  - Provider Abstraction Interface interaction (AC-2)
  - Batching optimization for latency and rate limits (AC-3)

Traceability:
  - Master Task ID: EBA-213
  - Jira Key: EBA-23
  - Sprint: Sprint 2 (Material & RAG)
"""

from typing import Any
from unittest.mock import AsyncMock
import pytest

from app.core.exceptions import EmbeddingException, ProviderException
from app.ingestion.chunker import DocumentChunk
from app.ingestion.embedder import DocumentEmbedder
from app.providers.base import BaseLLMProvider


class MockProvider(BaseLLMProvider):
    """Test double implementing BaseLLMProvider."""

    def __init__(self, dimension: int = 768) -> None:
        self._dim = dimension
        self.mock_batch = AsyncMock(side_effect=lambda texts: [[0.1] * self._dim for _ in texts])
        self.mock_single = AsyncMock(side_effect=lambda text: [0.1] * self._dim)

    @property
    def embedding_dimension(self) -> int:
        return self._dim

    async def generate_text(self, prompt: str, system_prompt: str | None = None, **kwargs) -> str:
        return "mock text"

    async def generate_structured(self, prompt: str, schema: dict[str, Any], system_prompt: str | None = None, **kwargs) -> dict[str, Any]:
        return {}

    async def generate_embedding(self, text: str) -> list[float]:
        return await self.mock_single(text)

    async def generate_embeddings_batch(self, texts: list[str]) -> list[list[float]]:
        return await self.mock_batch(texts)


@pytest.mark.asyncio
class TestDocumentEmbedder:
    """Test suite for DocumentEmbedder component."""

    async def test_gemini_embedding_generation_ac1(self):
        """AC-1: Generate 768-dim embeddings for Gemini provider."""
        provider = MockProvider(dimension=768)
        embedder = DocumentEmbedder(provider=provider, expected_dim=768)

        chunks = ["Chunk 1", "Chunk 2"]
        results = await embedder.embed_chunks(chunks)

        assert len(results) == 2
        assert len(results[0]) == 768
        assert len(results[1]) == 768
        assert embedder.embedding_dimension == 768

    async def test_openai_embedding_generation_ac1(self):
        """AC-1: Generate 1536-dim embeddings for OpenAI provider."""
        provider = MockProvider(dimension=1536)
        embedder = DocumentEmbedder(provider=provider, expected_dim=1536)

        chunks = ["OpenAI chunk A", "OpenAI chunk B", "OpenAI chunk C"]
        results = await embedder.embed_chunks(chunks)

        assert len(results) == 3
        assert all(len(vec) == 1536 for vec in results)
        assert embedder.embedding_dimension == 1536

    async def test_provider_abstraction_interface_ac2(self):
        """AC-2: Embedder delegates to BaseLLMProvider abstraction without direct vendor calls."""
        provider = MockProvider(dimension=768)
        embedder = DocumentEmbedder(provider=provider)

        chunks = ["Grounded university case study"]
        await embedder.embed_chunks(chunks)

        provider.mock_batch.assert_awaited_once_with(["Grounded university case study"])

    async def test_batching_mechanism_ac3(self):
        """AC-3: Large chunk lists are sliced into batches to prevent rate limits."""
        provider = MockProvider(dimension=768)
        embedder = DocumentEmbedder(provider=provider, batch_size=50)

        # 120 total chunks -> should be 3 batches (50, 50, 20)
        chunks = [f"Text segment {i}" for i in range(120)]
        results = await embedder.embed_chunks(chunks)

        assert len(results) == 120
        assert provider.mock_batch.await_count == 3

        # Verify batch call arguments
        call_args_list = provider.mock_batch.await_args_list
        assert len(call_args_list[0][0][0]) == 50
        assert len(call_args_list[1][0][0]) == 50
        assert len(call_args_list[2][0][0]) == 20

    async def test_empty_chunks_returns_empty_list(self):
        """Passing empty list of chunks returns empty list without calling provider."""
        provider = MockProvider(dimension=768)
        embedder = DocumentEmbedder(provider=provider)

        results = await embedder.embed_chunks([])

        assert results == []
        provider.mock_batch.assert_not_called()

    async def test_document_chunk_objects_supported(self):
        """DocumentChunk objects are automatically extracted to their text contents."""
        provider = MockProvider(dimension=768)
        embedder = DocumentEmbedder(provider=provider)

        chunks = [
            DocumentChunk(chunk_index=0, text="Chunk one", document_id="doc-123"),
            DocumentChunk(chunk_index=1, text="Chunk two", document_id="doc-123"),
        ]
        results = await embedder.embed_chunks(chunks)

        assert len(results) == 2
        provider.mock_batch.assert_awaited_once_with(["Chunk one", "Chunk two"])

    async def test_single_text_embedding(self):
        """embed_text generates single embedding for retrieval queries."""
        provider = MockProvider(dimension=768)
        embedder = DocumentEmbedder(provider=provider)

        vec = await embedder.embed_text("Query string")

        assert len(vec) == 768
        provider.mock_single.assert_awaited_once_with("Query string")

    async def test_single_text_empty_raises(self):
        """embed_text with empty string raises EmbeddingException."""
        provider = MockProvider(dimension=768)
        embedder = DocumentEmbedder(provider=provider)

        with pytest.raises(EmbeddingException, match="Cannot generate embedding for empty text"):
            await embedder.embed_text("")

    async def test_dimension_mismatch_raises(self):
        """Mismatched vector dimension raises EmbeddingException."""
        provider = MockProvider(dimension=768)
        # Return invalid dimension (e.g. 512 instead of 768)
        provider.mock_batch = AsyncMock(return_value=[[0.1] * 512])

        embedder = DocumentEmbedder(provider=provider, expected_dim=768)

        with pytest.raises(EmbeddingException, match="Embedding dimension mismatch"):
            await embedder.embed_chunks(["Invalid chunk"])

    async def test_provider_exception_wrapped_in_embedding_exception(self):
        """ProviderException from LLM provider is cleanly converted to EmbeddingException."""
        provider = MockProvider(dimension=768)
        provider.mock_batch = AsyncMock(side_effect=ProviderException("Gemini quota exceeded"))

        embedder = DocumentEmbedder(provider=provider)

        with pytest.raises(EmbeddingException, match="Provider failed during embedding generation"):
            await embedder.embed_chunks(["Chunk"])

    async def test_unexpected_exception_wrapped(self):
        """Unexpected runtime errors are caught and wrapped in EmbeddingException."""
        provider = MockProvider(dimension=768)
        provider.mock_batch = AsyncMock(side_effect=RuntimeError("Connection reset"))

        embedder = DocumentEmbedder(provider=provider)

        with pytest.raises(EmbeddingException, match="Unexpected error during embedding generation"):
            await embedder.embed_chunks(["Chunk"])
