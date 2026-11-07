"""
EduBranch AI — Document Embedder Service [BE-010].

Generates vector embeddings for document chunks using the LLM Provider Abstraction:
  - Supports Google Gemini text-embedding-004 (768-dim) and OpenAI text-embedding-3-small (1536-dim) (AC-1)
  - Interacts exclusively through BaseLLMProvider / get_provider() (AC-2)
  - Handles batching to optimize generation latency and prevent rate limits (AC-3)

Traceability:
  - Master Task ID: EBA-213
  - Jira Key: EBA-23
  - Sprint: Sprint 2 (Material & RAG)
"""

from typing import Any, Sequence

from app.core.exceptions import EmbeddingException, ProviderException
from app.core.logging import logger
from app.ingestion.chunker import DocumentChunk
from app.providers.base import BaseLLMProvider
from app.providers.factory import get_provider


class DocumentEmbedder:
    """
    High-level embedding service for document chunks and retrieval queries.

    Delegates actual embedding generation to the configured BaseLLMProvider,
    while managing batching, dimensionality checks, and error transformations.
    """

    DEFAULT_BATCH_SIZE = 50

    def __init__(
        self,
        provider: BaseLLMProvider | None = None,
        batch_size: int = DEFAULT_BATCH_SIZE,
        expected_dim: int | None = None,
    ) -> None:
        """
        Initialize the embedder.

        Args:
            provider: Optional custom BaseLLMProvider instance (defaults to get_provider()).
            batch_size: Maximum number of chunks sent to the provider per request.
            expected_dim: Expected vector dimension. If None, queried from provider.
        """
        self.provider = provider or get_provider()
        self.batch_size = max(1, batch_size)
        dim = expected_dim or getattr(self.provider, "embedding_dimension", 768)
        self._expected_dim = dim if isinstance(dim, int) else 768

    @property
    def embedding_dimension(self) -> int:
        """Return the expected vector dimension."""
        return self._expected_dim

    async def embed_chunks(
        self,
        chunks: Sequence[str | DocumentChunk | Any],
        batch_size: int | None = None,
    ) -> list[list[float]]:
        """
        AC-1, AC-2, AC-3: Generate vector embeddings for a list of document chunks.

        Args:
            chunks: List of chunk text strings, DocumentChunk objects, or objects with .text.
            batch_size: Optional override for batch chunk size.

        Returns:
            List of float vectors, 1:1 mapped to the input chunks.

        Raises:
            EmbeddingException: If generation fails, count mismatches, or dimensions are invalid.
        """
        if not chunks:
            return []

        # Extract text representations
        texts: list[str] = []
        for i, item in enumerate(chunks):
            if isinstance(item, str):
                texts.append(item)
            elif isinstance(item, DocumentChunk):
                texts.append(item.text)
            elif hasattr(item, "text") and isinstance(getattr(item, "text"), str):
                texts.append(getattr(item, "text"))
            elif isinstance(item, dict) and "text" in item:
                texts.append(str(item["text"]))
            else:
                texts.append(str(item))

        eff_batch_size = max(1, batch_size or self.batch_size)
        total_chunks = len(texts)
        all_embeddings: list[list[float]] = []

        logger.info(
            "embed_chunks_start",
            total_chunks=total_chunks,
            batch_size=eff_batch_size,
            expected_dim=self._expected_dim,
        )

        try:
            for start_idx in range(0, total_chunks, eff_batch_size):
                end_idx = min(start_idx + eff_batch_size, total_chunks)
                batch_texts = texts[start_idx:end_idx]

                # AC-2: Call through Provider Abstraction
                batch_embeddings = await self.provider.generate_embeddings_batch(batch_texts)

                if len(batch_embeddings) != len(batch_texts):
                    raise EmbeddingException(
                        f"Batch embedding count mismatch: expected {len(batch_texts)}, got {len(batch_embeddings)}"
                    )

                # AC-1: Dimension validation
                for idx, emb in enumerate(batch_embeddings):
                    if len(emb) != self._expected_dim:
                        raise EmbeddingException(
                            f"Embedding dimension mismatch at chunk {start_idx + idx}: "
                            f"expected {self._expected_dim}, got {len(emb)}"
                        )

                all_embeddings.extend(batch_embeddings)

        except ProviderException as e:
            error_msg = f"Provider failed during embedding generation: {e}"
            logger.error("embed_chunks_provider_error", error=error_msg)
            raise EmbeddingException(error_msg) from e
        except EmbeddingException:
            raise
        except Exception as e:
            error_msg = f"Unexpected error during embedding generation: {e}"
            logger.error("embed_chunks_unexpected_error", error=error_msg)
            raise EmbeddingException(error_msg) from e

        if len(all_embeddings) != total_chunks:
            raise EmbeddingException(
                f"Total embedding count mismatch: expected {total_chunks}, got {len(all_embeddings)}"
            )

        logger.info(
            "embed_chunks_complete",
            total_chunks=total_chunks,
            vector_dim=self._expected_dim,
        )
        return all_embeddings

    async def embed_text(self, text: str) -> list[float]:
        """
        Generate embedding for a single text string (e.g. for search query retrieval).

        Args:
            text: Single query or text segment.

        Returns:
            Vector embedding as list of floats.

        Raises:
            EmbeddingException: If generation fails or dimension is incorrect.
        """
        if not text:
            raise EmbeddingException("Cannot generate embedding for empty text")

        try:
            emb = await self.provider.generate_embedding(text)
            if len(emb) != self._expected_dim:
                raise EmbeddingException(
                    f"Embedding dimension mismatch: expected {self._expected_dim}, got {len(emb)}"
                )
            return emb
        except ProviderException as e:
            error_msg = f"Provider failed during single text embedding: {e}"
            logger.error("embed_text_provider_error", error=error_msg)
            raise EmbeddingException(error_msg) from e
        except EmbeddingException:
            raise
        except Exception as e:
            error_msg = f"Unexpected error during single text embedding: {e}"
            logger.error("embed_text_unexpected_error", error=error_msg)
            raise EmbeddingException(error_msg) from e
